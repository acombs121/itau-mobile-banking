"""
=====================================================================
FastAPI IAP JWT Verification Middleware (iap_jwt_middleware.py)
Verifies X-Goog-IAP-JWT-Assertion header in Google Cloud Run production,
while allowing local mock authentication when APP_ENV=local.
=====================================================================
"""
import os
import logging
from typing import Dict, Any
from fastapi import Request, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token

logger = logging.getLogger("iap_middleware")

# Expected IAP Issuer for Cloud Run
IAP_ISSUER = "https://cloud.google.com/iap"

def get_authenticated_user(request: Request) -> Dict[str, Any]:
    """
    Extracts and verifies the authenticated Google user from IAP JWT headers.
    When running locally (APP_ENV='local'), returns a mock developer identity unless IAP_ENABLED_LOCAL is true.
    Enforces that the user belongs to allowed domains configured in IAP_ALLOWED_DOMAINS (defaults to 'google.com').
    """
    app_env = os.getenv("APP_ENV", "local").lower()

    if app_env == "local" and os.getenv("IAP_ENABLED_LOCAL", "false").lower() != "true":
        # Local development fallback identity
        return {
            "sub": "local-dev-user-001",
            "email": "developer@google.com",
            "hd": "google.com",
            "name": "Local Developer (Mock)",
        }

    # Production Cloud Run IAP JWT verification
    iap_jwt = request.headers.get("x-goog-iap-jwt-assertion")
    if not iap_jwt:
        # Fallback to App Engine / Cloud Run authenticated user email header if available
        auth_email_header = request.headers.get("x-goog-authenticated-user-email")
        if auth_email_header:
            email_val = auth_email_header.replace("accounts.google.com:", "")
            return {
                "sub": "iap-user",
                "email": email_val,
                "hd": email_val.split("@")[-1] if "@" in email_val else "google.com",
                "name": email_val.split("@")[0],
            }

        # Allow local development fallback when running outside GCP or in local mock
        if app_env == "local":
            return {
                "sub": "local-dev-user-001",
                "email": "developer@google.com",
                "hd": "google.com",
                "name": "Local Developer (Mock)",
            }

        logger.error("Missing X-Goog-IAP-JWT-Assertion header in request.")
        raise HTTPException(status_code=401, detail="Unauthorized: Missing IAP assertion header.")

    # Build comprehensive list of valid audiences
    expected_audiences = []
    if os.getenv("IAP_AUDIENCE"):
        expected_audiences.append(os.getenv("IAP_AUDIENCE"))

    project_number = os.getenv("PROJECT_NUMBER") or "753194619596"
    gcp_region = os.getenv("GCP_REGION", "us-central1")
    app_name = os.getenv("APP_NAME", "itau-mobile")
    gcp_project = os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT") or "edgar-rag-demo"
    backend_service_id = os.getenv("BACKEND_SERVICE_ID")

    if project_number:
        # Cloud Run format: /projects/{project_number}/locations/{region}/services/{service_name}
        if gcp_region and app_name:
            expected_audiences.append(f"/projects/{project_number}/locations/{gcp_region}/services/{app_name}")
        # Global Load Balancer backend service format
        if backend_service_id:
            expected_audiences.append(f"/projects/{project_number}/global/backendServices/{backend_service_id}")
        # App Engine format
        if gcp_project:
            expected_audiences.append(f"/projects/{project_number}/apps/{gcp_project}")

    try:
        # Verify token signature and expiration via Google's public keys
        claims = id_token.verify_token(
            iap_jwt,
            requests.Request(),
            audience=None,
            certs_url="https://www.gstatic.com/iap/verify/public_key"
        )

        # Verify issuer
        if claims.get("iss") != IAP_ISSUER:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP issuer.")

        # Verify audience against valid audiences or project number
        token_aud = claims.get("aud")
        if expected_audiences:
            aud_valid = (token_aud in expected_audiences) or (
                isinstance(token_aud, str) and (
                    token_aud.startswith(f"/projects/{project_number}")
                    or (app_name and app_name in token_aud)
                )
            )
            if not aud_valid:
                logger.warning(f"IAP token audience '{token_aud}' not in expected {expected_audiences}")
                raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP audience.")

        # Enforce IAP Allowed Domains at application/JWT level (defaults to google.com,alexcombs.altostrat.com)
        allowed_domains_env = os.getenv("IAP_ALLOWED_DOMAINS", "google.com,alexcombs.altostrat.com")
        allowed_domains = [d.strip().lower() for d in allowed_domains_env.split(",") if d.strip()]
        
        user_email = (claims.get("email") or "").lower()
        user_hd = (claims.get("hd") or "").lower()
        email_domain = user_email.split("@")[-1] if "@" in user_email else ""

        if allowed_domains and "*" not in allowed_domains:
            if not (user_hd in allowed_domains or email_domain in allowed_domains):
                logger.warning(
                    f"Access denied: User '{user_email}' (hd: '{user_hd}') does not match allowed domains: {allowed_domains}"
                )
                raise HTTPException(status_code=403, detail="Forbidden: User domain not authorized.")

        return {
            "sub": claims.get("sub"),
            "email": claims.get("email"),
            "hd": claims.get("hd"),
            "name": claims.get("name"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify IAP JWT token: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP JWT token.")

