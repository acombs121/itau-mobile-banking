"""
=====================================================================
Banco Itaú Mobile Banking & Proactive Alerts — FastAPI Backend (main.py)
Built with Gemini Enterprise Agent Platform (fka Vertex AI Platform)
=====================================================================
"""
import os
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load local environment variables POSIX-safely
load_dotenv()

from iap_jwt_middleware import get_authenticated_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("itau_backend")

APP_NAME = os.getenv("APP_NAME", "itau-banking-alerts")
APP_ENV = os.getenv("APP_ENV", "local")
GCP_PROJECT = os.getenv("GCP_PROJECT", "edgar-rag-demo")
GCP_REGION = os.getenv("GCP_REGION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")

# Initialize Gemini Enterprise Agent Platform client natively via ADC
gemini_client = None
try:
    from google import genai
    from google.genai import types
    if GCP_PROJECT:
        gemini_client = genai.Client(vertexai=True, project=GCP_PROJECT, location=GCP_REGION)
        logger.info(f"Connected to Gemini Enterprise Agent Platform in {GCP_PROJECT}:{GCP_REGION}")
except Exception as e:
    logger.warning(f"Could not initialize native Vertex AI GenAI client (running local mock mode): {e}")

app = FastAPI(
    title="Banco Itaú Mobile Banking & Security Alerts API",
    description="Backend for Itaú Unibanco AI Concierge and Real-Time Fraud Protection",
    version="1.0.0"
)

# CORS Configuration
allowed_origins = [
    "http://127.0.0.1:8090",
    "http://localhost:8090",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Defensive Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# In-Memory State for Banking Scenario
BANKING_PROFILE = {
    "account_id": "ITAU-7749-00912",
    "customer_name": "Roberto Silva",
    "segment": "Itaú Personnalité",
    "cpf_masked": "•••.491.808-••",
    "agency": "7749",
    "account_number": "00912-8",
    "checking_balance_brl": 48950.20,
    "investments_balance_brl": 320450.00,
    "credit_limit_total": 85000.00,
    "credit_limit_used": 12430.50,
    "pix_daily_limit": 20000.00,
    "pix_night_limit": 1000.00,
    "cards": [
        {
            "id": "card_01",
            "name": "Itaú Personnalité Mastercard Black",
            "last4": "8841",
            "status": "active",
            "virtual_card_active": True,
            "contactless_enabled": True
        },
        {
            "id": "card_02",
            "name": "Itaú Visa Infinite",
            "last4": "3390",
            "status": "active",
            "virtual_card_active": False,
            "contactless_enabled": True
        }
    ],
    "recent_transactions": [
        {
            "id": "tx_01",
            "date": "Today, 14:32",
            "description": "Pix Transferred — Marina Camargo",
            "category": "pix_out",
            "amount_brl": -150.00,
            "status": "completed"
        },
        {
            "id": "tx_02",
            "date": "Today, 11:15",
            "description": "Restaurante Fasano Jardins",
            "category": "dining",
            "amount_brl": -640.00,
            "status": "completed"
        },
        {
            "id": "tx_03",
            "date": "Yesterday",
            "description": "Pix Received — Dividendo FII HGLG11",
            "category": "investment",
            "amount_brl": 1820.00,
            "status": "completed"
        }
    ]
}

ACTIVE_ALERTS = [
    {
        "id": "alert_pix_fraud",
        "severity": "CRITICAL",
        "category": "fraud_anomaly",
        "title": "Suspected Out-of-Pattern Pix Transfer Blocked",
        "timestamp": "Just now",
        "description": "High-risk Pix transfer of R$ 4.200,00 to unknown merchant 'Eletro Tech SP' was intercepted by Itaú Guard System. Geolocation anomaly: device located in São Paulo, but IP proxy traces to overseas VPN.",
        "amount_brl": 4200.00,
        "recipient": "Eletro Tech SP Ltda (CNPJ 48.910.221/0001-09)",
        "risk_score": 94,
        "recommended_action": "Verify via biometrics or freeze digital token",
        "status": "held_pending_confirmation",
        "policy_matched": "BACEN Resolução 147 — Mecanismo Especial de Devolução (MED)"
    },
    {
        "id": "alert_night_limit",
        "severity": "WARNING",
        "category": "limit_management",
        "title": "Night-Time Pix Limit Active (R$ 1.000,00)",
        "timestamp": "20:00 - 06:00 BRT",
        "description": "Central Bank safety rule enforces maximum R$ 1.000,00 for night transactions. Temporary override requires voice authentication.",
        "amount_brl": None,
        "recipient": None,
        "risk_score": 15,
        "recommended_action": "Request temporary limit increase if needed",
        "status": "active_rule",
        "policy_matched": "BACEN Night-Time Safety Directives"
    }
]

# Pydantic Schemas
class BankingActionRequest(BaseModel):
    action_type: str = Field(..., description="freeze_card, unfreeze_card, block_pix, approve_pix, adjust_limit, file_med_dispute")
    target_id: Optional[str] = Field(None, description="Card ID, Alert ID, or Transaction ID")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AiAssistRequest(BaseModel):
    user_query: str
    session_id: Optional[str] = "session_001"
    context_alert_id: Optional[str] = None

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run container probes."""
    return {"status": "ok", "app": APP_NAME, "environment": APP_ENV}

@app.get("/api/user")
async def get_user_profile(user: Dict[str, Any] = Depends(get_authenticated_user)):
    """Returns the authenticated IAP user identity."""
    return user

@app.get("/api/banking/profile")
async def get_banking_profile(user: Dict[str, Any] = Depends(get_authenticated_user)):
    """Returns customer profile, balances, limits, and cards."""
    return BANKING_PROFILE

@app.get("/api/banking/alerts")
async def get_banking_alerts(user: Dict[str, Any] = Depends(get_authenticated_user)):
    """Returns active banking alerts and security incidents."""
    return ACTIVE_ALERTS

@app.post("/api/banking/action")
async def execute_banking_action(payload: BankingActionRequest, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """Executes deterministic banking safety actions."""
    action = payload.action_type
    target = payload.target_id

    if action == "freeze_card":
        for card in BANKING_PROFILE["cards"]:
            if card["id"] == target or target == "all":
                card["status"] = "frozen"
        return {"status": "success", "message": "Card successfully frozen. Virtual token deactivated."}

    elif action == "unfreeze_card":
        for card in BANKING_PROFILE["cards"]:
            if card["id"] == target:
                card["status"] = "active"
        return {"status": "success", "message": "Card reactivated with biometric validation."}

    elif action == "block_pix":
        for alert in ACTIVE_ALERTS:
            if alert["id"] == target:
                alert["status"] = "blocked_and_reversed"
        return {"status": "success", "message": "Pix transfer blocked and funds safeguarded under MED rules."}

    elif action == "approve_pix":
        for alert in ACTIVE_ALERTS:
            if alert["id"] == target:
                alert["status"] = "approved_by_user"
        return {"status": "success", "message": "Pix transfer authorized by Cardholder."}

    elif action == "adjust_limit":
        new_limit = payload.parameters.get("new_night_limit", 5000.00)
        BANKING_PROFILE["pix_night_limit"] = float(new_limit)
        return {"status": "success", "message": f"Night Pix limit updated to R$ {new_limit:,.2f}"}

    return {"status": "error", "message": f"Unknown action type '{action}'"}

@app.post("/api/banking/ai-assist")
async def ai_assistant(payload: AiAssistRequest, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """
    Invokes Gemini Enterprise Agent Platform (fka Vertex AI Platform)
    with customer context and registered banking tools.
    """
    system_prompt = f"""
    You are the Banco Itaú AI Personal Banking Concierge and Fraud Protection Agent for Roberto Silva (Itaú Personnalité).
    Customer Profile:
    - Checking Balance: R$ {BANKING_PROFILE['checking_balance_brl']:,.2f}
    - Active Security Alerts: {len(ACTIVE_ALERTS)} alerts active.
    - Alert Details: {ACTIVE_ALERTS}
    
    Guidelines:
    1. Respond with executive precision, courteous tone, and clear banking security advice.
    2. If the user asks about the blocked Pix or fraud alert, explain the risk factors (unknown vendor, overseas VPN anomaly).
    3. Clearly explain available actions: freezing the card, blocking the Pix transfer permanently, or submitting a MED dispute.
    4. Keep answers clear, professional, and compliant with Brazilian Central Bank (BACEN) standards.
    """

    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=payload.user_query,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.2,
                )
            )
            return {"response": response.text, "model": GEMINI_MODEL}
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")

    # Fallback deterministic response for local/offline testing
    return {
        "response": f"Olá Roberto. Identificamos uma tentativa de transferência Pix de R$ 4.200,00 para 'Eletro Tech SP' com divergência de geolocalização e IP suspeito. O valor foi retido preventivamente para sua segurança. Deseja que eu bloqueie definitivamente a transação e congele o cartão virtual?",
        "model": "local-fallback"
    }

@app.get("/api/banking/decision-graph")
async def get_decision_graph():
    """Returns knowledge graph node data for anti-fraud visualizer."""
    nodes = [
        {
            "id": "customer",
            "name": "Roberto Silva (Personnalité)",
            "group": "Profile",
            "layer": "Input",
            "color": "#FF6423",
            "val": 28,
            "details": "Itaú Personnalité • Score: 980 • Trusted Device: iPhone 16 Pro"
        },
        {
            "id": "anomaly_event",
            "name": "Pix R$ 4.200,00 (Eletro Tech SP)",
            "group": "Alert",
            "layer": "Input",
            "color": "#E11D48",
            "val": 26,
            "details": "Out-of-pattern merchant • Overseas VPN IP trace • High velocity"
        },
        {
            "id": "bacen_med_policy",
            "name": "BACEN Res. 147 (MED Policy)",
            "group": "Policy",
            "layer": "Policy",
            "color": "#003399",
            "val": 22,
            "details": "Automated precautionary block & 72-hour fraud claim protection"
        },
        {
            "id": "ai_guard_engine",
            "name": "Itaú Guard AI Risk Engine",
            "group": "Decision",
            "layer": "Decision",
            "color": "#070707",
            "val": 24,
            "details": "Risk Score: 94/100 • Triggered immediate Cardholder Voice Auth"
        },
        {
            "id": "action_output",
            "name": "Funds Safeguarded & Token Frozen",
            "group": "Output",
            "layer": "Output",
            "color": "#059669",
            "val": 25,
            "details": "R$ 4.200,00 retained in checking account • Virtual card rotated"
        }
    ]

    links = [
        {"source": "customer", "target": "anomaly_event", "label": "INITIATED_TX"},
        {"source": "anomaly_event", "target": "ai_guard_engine", "label": "EVALUATED_BY"},
        {"source": "bacen_med_policy", "target": "ai_guard_engine", "label": "ENFORCES"},
        {"source": "ai_guard_engine", "target": "action_output", "label": "TRIGGERED"}
    ]

    return {"nodes": nodes, "links": links}

# --- Static Asset Serving & SPA Routing Policy (Mandatory) ---
if os.path.isdir("dist"):
    if os.path.isdir("dist/assets"):
        class HashedStaticFiles(StaticFiles):
            async def get_response(self, path: str, scope):
                resp = await super().get_response(path, scope)
                resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
                return resp

        app.mount("/assets", HashedStaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "health":
            raise HTTPException(status_code=404, detail="Not Found")
        local_path = os.path.join("dist", full_path)
        if os.path.isfile(local_path):
            if full_path.startswith("assets/"):
                return FileResponse(local_path, headers={"Cache-Control": "public, max-age=31536000, immutable"})
            return FileResponse(local_path)
        return FileResponse(
            "dist/index.html",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
