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
        logger.error("Missing X-Goog-IAP-JWT-Assertion header in request.")
        raise HTTPException(status_code=401, detail="Unauthorized: Missing IAP assertion header.")

    expected_audience = os.getenv("IAP_AUDIENCE")
    if not expected_audience:
        project_number = os.getenv("PROJECT_NUMBER")
        backend_service_id = os.getenv("BACKEND_SERVICE_ID")
        gcp_project = os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        if project_number and backend_service_id:
            expected_audience = f"/projects/{project_number}/global/backendServices/{backend_service_id}"
        elif project_number and gcp_project:
            expected_audience = f"/projects/{project_number}/apps/{gcp_project}"

    try:
        claims = id_token.verify_token(
            iap_jwt,
            requests.Request(),
            audience=expected_audience,
            certs_url="https://www.gstatic.com/iap/verify/public_key"
        )

        # Verify issuer
        if claims.get("iss") != IAP_ISSUER:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid IAP issuer.")

        # Enforce IAP Allowed Domains at application/JWT level (defaults to google.com)
        allowed_domains_env = os.getenv("IAP_ALLOWED_DOMAINS", "google.com")
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
