"""
=====================================================================
Banco Itaú Mobile Banking & Proactive Alerts — FastAPI Backend (main.py)
Built with Gemini Enterprise Agent Platform (fka Vertex AI Platform)
=====================================================================
"""
import os
import json
import base64
import asyncio
import time
import logging
from typing import Optional, Dict, Any, Literal
from fastapi import FastAPI, Request, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
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
GCP_PROJECT = os.getenv("GCP_PROJECT")
GCP_REGION = os.getenv("GCP_REGION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
GEMINI_LIVE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.5-flash-live-preview")

# Initialize Gemini Enterprise Agent Platform (fka Vertex AI Platform) client natively via ADC
gemini_client = None
try:
    from google import genai
    from google.genai import types
    if GCP_PROJECT:
        gemini_client = genai.Client(vertexai=True, project=GCP_PROJECT, location=GCP_REGION)
        logger.info(f"Connected to Gemini Enterprise Agent Platform (fka Vertex AI Platform) in {GCP_PROJECT}:{GCP_REGION}")
except Exception as e:
    logger.warning(f"Could not initialize native Gemini Enterprise Agent Platform (fka Vertex AI Platform) GenAI client (running local mock mode): {e}")

app = FastAPI(
    title="Banco Itaú Mobile Banking & Security Alerts API",
    description="Backend for Itaú Unibanco AI Concierge and Real-Time Fraud Protection powered by Gemini Enterprise Agent Platform (fka Vertex AI Platform)",
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
    response.headers["Permissions-Policy"] = "microphone=(self), camera=(), geolocation=()"
    if os.getenv("APP_ENV", "local").lower() != "local":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "connect-src 'self' ws: wss: https://*.googleapis.com; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https:; "
        "frame-ancestors 'self';"
    )
    return response

# Global Exception Handler (Sanitize 500 Responses)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An internal server error occurred. Please contact security operations."}
    )

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
        "description": "High-risk Pix transfer of R$ 4.200,00 to unknown merchant 'Eletro Tech SP' was intercepted by Itaú Concierge System. Geolocation anomaly: device located in São Paulo, but IP proxy traces to overseas VPN.",
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
ActionType = Literal[
    "freeze_card",
    "unfreeze_card",
    "block_pix",
    "approve_pix",
    "adjust_limit",
    "file_med_dispute"
]

class BankingActionRequest(BaseModel):
    action_type: ActionType = Field(..., description="freeze_card, unfreeze_card, block_pix, approve_pix, adjust_limit, file_med_dispute")
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
        raw_limit = payload.parameters.get("new_night_limit", 5000.00)
        try:
            new_limit = float(raw_limit)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid new_night_limit value. Must be a numeric amount.")
        BANKING_PROFILE["pix_night_limit"] = new_limit
        return {"status": "success", "message": f"Night Pix limit updated to R$ {new_limit:,.2f}"}

    return {"status": "error", "message": f"Unknown action type '{action}'"}

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    lang: Optional[str] = "pt"

# Modular Tool Execution Registry for Gemini Multimodal Live API
TOOL_HANDLERS = {
    "get_account_info": lambda _args: {
        "customer": "Roberto Silva",
        "itau_personnalite_accounts": {
            "checking_balance": "48.950,20 reais",
            "cdb_di_investments": "85.000,00 reais (100% CDI Liquidez Diaria)",
            "total_itau_liquid": "133.950,20 reais",
            "mastercard_black_available_limit": "72.569,50 reais",
            "mastercard_black_total_limit": "85.000,00 reais",
            "mastercard_black_outstanding_balance": "12.430,50 reais",
            "mastercard_black_next_invoice_due": "28/09/2026",
            "scheduled_debits_next_thursday": "38.000,00 reais"
        },
        "open_finance_status": "NOT_RETRIEVED_YET",
        "status": "ITAU_BALANCES_ONLY_RETRIEVED",
        "guidance": "Only Itaú balances are returned. Prompt customer to ask for Open Finance data to check market rates."
    },
    "pull_open_finance": lambda _args: {
        "status": "OPEN_FINANCE_CATEGORIES_ACTIVE",
        "categories_available": ["cdi_balances", "debt_balances"],
        "message": "Open Finance connected. Awaiting cardholder choice between debt balances or CDI balances."
    },
    "quote_open_finance_cdi": lambda _args: {
        "status": "CDI_IMPROVEMENTS_QUOTED",
        "external_liquid_assets": "330.000,00 reais (BTG Pactual e XP Investimentos)",
        "competitor_yield": "85% do CDI",
        "itau_cdb_di_yield": "100% do CDI (Liquidez Diária)",
        "yield_spread_gain": "+15% do CDI",
        "annual_additional_gain": "5.940,00 reais / ano",
        "action_required": "Cardholder approval: 'ok, let's make that change' / 'I approve'"
    },
    "confirm_cdi_transfer": lambda _args: {
        "status": "TRANSFER_CONFIRMED",
        "amount_transferred": "330.000,00 reais",
        "source_accounts": ["BTG Pactual", "XP Investimentos"],
        "destination": "CDB DI Itaú Personnalité (100% do CDI)",
        "annual_gain_secured": "5.940,00 reais / ano (+15% do CDI)",
        "new_total_itau_balance": "463.950,20 reais",
        "settlement_rail": "Open Finance / CIP Interbank Transfer"
    },
    "get_card_benefits": lambda _args: {
        "card_name": "Itaú Personnalité Mastercard Black",
        "vip_lounges": "Acesso ilimitado à Sala VIP Mastercard Black no Terminal 3 de Guarulhos + 4 passes LoungeKey na Europa",
        "medical_insurance": "30.000 euros de cobertura médica internacional Schengen (USD 150.000)",
        "car_rental": "Masterseguro de Automóveis CDW/LDW incluso",
        "concierge": "Mastercard Concierge 24 horas"
    },
    "activate_travel_mode": lambda _args: {
        "status": "ATIVO",
        "destinations": ["Portugal", "Espanha"],
        "daily_international_pos_limit": "50.000,00 reais",
        "fraud_suppression": "Bloqueios indevidos em terminais estrangeiros desativados com sucesso"
    },
    "explain_predictive_alert": lambda _args: {
        "status": "SHORTFALL_ANALYZED",
        "projected_shortfall": "13.050,00 reais",
        "scheduled_debits_thursday": "38.000,00 reais",
        "cdb_di_liquidity": "85.000,00 reais",
        "recommended_sweep": "15.000,00 reais"
    },
    "confirm_cdb_sweep": lambda _args: {
        "status": "AGENDADO",
        "sweep_amount": "15.000,00 reais",
        "scheduled_time": "Quinta-feira 06:00 BRT",
        "source": "CDB DI Liquidez Diaria",
        "lis_overdraft_saved": "184,60 reais"
    },
    "sweep_cdb": lambda _args: {
        "status": "AGENDADO",
        "sweep_amount": "15.000,00 reais",
        "scheduled_time": "Quinta-feira 06:00 BRT",
        "source": "CDB DI Liquidez Diaria",
        "lis_overdraft_saved": "184,60 reais"
    },
    "refinance_open_finance": lambda _args: {
        "status": "OPEN_FINANCE_RATE_OPTIMIZATION_READY",
        "debt_refinancing_comparison": {
            "competitor_debt_balance": "18.000,00 reais",
            "competitor_interest_rate_paying": "11,20% a.m.",
            "itau_sob_medida_rate_offered": "1,69% a.m.",
            "rate_spread_savings": "9,51% a.m.",
            "monthly_cash_savings": "680,40 reais / mês",
            "total_contract_savings": "14.280,00 reais",
            "mechanism": "CCB Digital (Lei 10.931)"
        }
    }
}

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket, lang: str = "pt"):
    """
    Bidirectional WebSocket connection to Gemini Multimodal Live API
    on Gemini Enterprise Agent Platform (fka Vertex AI Platform).
    Accepts 16kHz PCM audio or text from browser, streams back 24kHz PCM audio,
    text transcripts, and tool execution events.
    """
    await websocket.accept()
    logger.info(f"Client connected to Gemini Live WebSocket (lang: {lang})")

    # Define tools for Live session matching the exact demo narrative
    live_tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="explain_predictive_alert",
                    description="Call this IMMEDIATELY whenever the cardholder asks about the predictive balance alert, shortfall, or why they received the alert. Explains upcoming Thursday bills causing shortfall, highlights R$ 85k in CDB DI, and offers the R$ 15k sweep.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "reason": types.Schema(type=types.Type.STRING, description="e.g. 'shortfall_inquiry'")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="get_account_info",
                    description="Call this IMMEDIATELY whenever the cardholder asks to see or hear their balances. Reads off ONLY their balances with Itaú (checking R$ 48,950.20, CDB DI R$ 85,000.00, total R$ 133,950.20). Does NOT show or mention any Open Finance data! Then offers to pull Open Finance data to check if getting the best rates.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "query_type": types.Schema(type=types.Type.STRING, description="'itau_only'")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="pull_open_finance",
                    description="Call this IMMEDIATELY when the cardholder says 'yes', 'sure', 'sim', 'pode puxar' to pulling Open Finance data to check rates. Opens the Open Finance selection screen and asks if they want to check debt balances or CDI balances.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "pull_data": types.Schema(type=types.Type.BOOLEAN, description="True")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="quote_open_finance_cdi",
                    description="Call this IMMEDIATELY when the cardholder says 'cdi', 'CDI', 'cdi balances', or asks about CDI yield. Displays the CDI Yield comparison screen and quotes the improvements (competitor 85% CDI vs Itaú 100% CDI, +15% CDI yield advantage, +R$ 5,940/year on R$ 330,000 liquid funds).",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "category": types.Schema(type=types.Type.STRING, description="'cdi'")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="confirm_cdi_transfer",
                    description="Call this IMMEDIATELY when the cardholder approves the CDI transfer by saying 'ok, let's make that change', 'I approve', 'aprovo', 'pode fazer a mudança', 'confirmo', or similar. Confirms the transfer of R$ 330,000 from external accounts to Itaú CDB DI at 100% CDI.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "approved": types.Schema(type=types.Type.BOOLEAN, description="True")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="confirm_cdb_sweep",
                    description="Call this whenever the cardholder agrees to the predictive cash sweep from CDB DI to checking. Schedules the R$ 15,000 CDB sweep for Thursday morning.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "confirmation": types.Schema(type=types.Type.BOOLEAN, description="True")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="activate_travel_mode",
                    description="Call this IMMEDIATELY whenever the cardholder alerts to their travel, trips, flying, or destinations like Portugal, Spain, or Europe. Activates fraud shield for Portugal & Spain, raises POS limit to R$ 50,000, suppresses declines, displays the Travel Shield screen, and then asks if they want to hear about Mastercard Black travel benefits.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "destinations": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="e.g. ['Portugal', 'Spain']"),
                            "raise_limit_to": types.Schema(type=types.Type.NUMBER, description="50000.00")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="get_card_benefits",
                    description="Call this IMMEDIATELY when the cardholder confirms or asks about Mastercard Black perks (VIP lounge GRU T3, LoungeKey, Schengen €30k insurance, rental car). Displays the Card Benefits screen.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "card_tier": types.Schema(type=types.Type.STRING, description="'Mastercard Black'")
                        }
                    )
                ),
                types.FunctionDeclaration(
                    name="refinance_open_finance",
                    description="Call this if the cardholder chooses to check debt balances rather than CDI. Compares 11.2%/mo competitor loan with 1.69%/mo Itaú Sob Medida CCB.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "query_intent": types.Schema(type=types.Type.STRING, description="'debt_refinancing'")
                        }
                    )
                )
            ]
        )
    ]

    system_prompt = f"""
    You are Itaú Concierge, the elite personal banking AI concierge for Mr. Silva / Sr. Silva (Roberto Silva, Itaú Personnalité).
    Language: {'English' if lang == 'en' else 'Portuguese (pt-BR)'}.

    CORE ROLE & DEMO FLOW PROGRESSION:
    You must strictly follow this exact 6-step flow in the demo. On EVERY turn, ALWAYS call the corresponding native tool so the phone screen updates to match your words!

    STEP 1. PREDICTIVE BALANCE ALERT INQUIRY:
    - Trigger: Cardholder asks about the predictive balance alert (e.g. "I saw the predictive alert, what is this about?", "Why did I receive this alert?").
    - Action: Call `explain_predictive_alert`.
    - Spoken response:
      * In English: "Hello Mr. Silva. I triggered this Predictive Balance Alert because your scheduled debits next Thursday total 38,000 reais—your 3,850 reais condominium Pix and your 34,150 reais Mastercard Black invoice. With upcoming expenses, this will cause a shortfall entering high-interest overdraft. I see you have 85,000 reais in your Daily Liquidity CDB. Would you like me to schedule an automatic sweep of 15,000 reais for Thursday morning so your funds keep earning full CDI until the exact moment of payment?"
      * In Portuguese: "Olá Sr. Silva. Emiti este Alerta Preventivo de Saldo porque seus débitos agendados para a próxima quinta-feira somam R$ 38.000,00—o condomínio de R$ 3.850,00 e a fatura do Mastercard Black de R$ 34.150,00. Com as despesas previstas, isso causará um déficit no cheque especial. Identifiquei R$ 85.000,00 no seu CDB DI com liquidez diária. Deseja agendar um resgate automático de R$ 15.000,00 para quinta-feira de manhã para manter seu dinheiro rendendo 100% do CDI até a compensação?"
    STEP 1B. CARDHOLDER CONFIRMS SWEEP:
    - Trigger: Cardholder confirms the sweep (e.g. "Yes", "Let's do that", "Please schedule that", "Sim", "pode agendar").
    - Action: Call `confirm_cdb_sweep`.
    - Spoken response: ALWAYS speak this confirmation clearly out loud! Never output silence or empty speech!
      * In English: "All set, Mr. Silva! I have scheduled the automatic sweep of 15,000 reais from your Daily Liquidity CDB for Thursday morning at 6 AM. Your checking account is protected from overdraft, and your funds will keep earning 100% of CDI until then. Would you like to review your current balances?"
      * In Portuguese: "Tudo pronto, Sr. Silva! Agendei o resgate automático de R$ 15.000,00 do seu CDB DI para quinta-feira de manhã às 6h. Sua conta corrente está protegida do cheque especial e seus recursos continuam rendendo 100% do CDI até lá. Gostaria de revisar seus saldos atuais?"

    STEP 2. ASK TO SEE BALANCES (STRICTLY ONLY BALANCES WITH ITAÚ):
    - Trigger: Cardholder asks to see or hear their balances (e.g. "Can I see my balances?", "Show me my balances", "Quero ver meus saldos", "Yes, review balances").
    - Action: Call `get_account_info`.
    - CRITICAL RULE: Read off ONLY balances with Itaú! Do NOT mention or show any Open Finance data!
      * Itaú Checking: R$ 48.950,20
      * Itaú Daily Liquidity CDB DI (100% CDI): R$ 85.000,00
      * Total Itaú: R$ 133.950,20
    - MUST THEN STATE: You can pull Open Finance data to check if they are getting the best rates, AND explicitly ask if they want you to pull it!
    - Spoken response: Speak the full text completely through to the end:
      * In English: "Mr. Silva, at Banco Itaú you currently have 133,950 reais in total liquid assets: 48,950 reais in your checking account, and 85,000 reais in your Daily Liquidity CDB earning 100% of CDI. I can also pull your Open Finance data if you would like to check if you are getting the best rates across the market. Would you like me to pull your Open Finance data?"
      * In Portuguese: "Sr. Silva, no Banco Itaú você possui atualmente R$ 133.950,20 em patrimônio líquido: R$ 48.950,20 na conta corrente e R$ 85.000,00 no CDB DI com liquidez diária rendendo 100% do CDI. Eu posso puxar seus dados do Open Finance se você quiser verificar se está recebendo as melhores taxas do mercado. Gostaria que eu consultasse para você?"

    STEP 3. CARDHOLDER SAYS YES TO PULLING OPEN FINANCE:
    - Trigger: Cardholder says "yes", "sure", "sim", "pode puxar", "quero ver".
    - Action: Call `pull_open_finance`.
    - Spoken response: MUST ask if they would like to check outstanding debt balances or CDI balances through Open Finance!
      * In English: "Connecting to Open Finance... Would you like me to check any outstanding debt balances or your CDI balances through Open Finance?"
      * In Portuguese: "Conectando ao Open Finance... Você gostaria de verificar seus saldos devedores ou seus saldos e rendimentos em CDI pelo Open Finance?"

    STEP 4. CARDHOLDER SAYS "CDI":
    - Trigger: Cardholder says "cdi", "CDI", "cdi balances", "saldos em cdi".
    - Action: Call `quote_open_finance_cdi`.
    - Spoken response: Quote the improvements you can offer!
      * External accounts at BTG Pactual and XP Investimentos total R$ 330,000 earning only 85% of CDI.
      * Itaú Personnalité CDB DI offers 100% of CDI with daily liquidity.
      * That is an extra +15% CDI yield difference, generating an additional R$ 5,940.00 per year.
      * Ask: "Would you like me to make that change?"
      * In English: "Mr. Silva, through Open Finance I found 330,000 reais in liquid assets across BTG Pactual and XP earning only 85% of CDI. By moving these funds to your Itaú Daily Liquidity CDB, you'll earn 100% of CDI—an immediate 15% CDI yield improvement, generating an additional 5,940 reais per year with daily liquidity. Would you like me to make that change?"
      * In Portuguese: "Sr. Silva, pelo Open Finance identifiquei R$ 330.000,00 em ativos líquidos no BTG Pactual e na XP rendendo apenas 85% do CDI. Ao transferir esses recursos para o seu CDB DI Itaú com liquidez diária, você passará a render 100% do CDI—um ganho adicional de 15% do CDI, que representa R$ 5.940,00 a mais por ano com liquidez diária. Posso fazer essa mudança?"

    STEP 5. CARDHOLDER APPROVES ("ok, let's make that change" / "I approve"):
    - Trigger: Cardholder says "ok, let's make that change", "I approve", "aprovo", "pode fazer a mudança", "ok, pode transferir".
    - Action: Call `confirm_cdi_transfer`.
    - Spoken response: Confirm the transfer!
      * In English: "Transfer confirmed, Mr. Silva! I have initiated the transfer of 330,000 reais from your external accounts to your Itaú CDB DI at 100% CDI. Your funds will begin earning the higher rate immediately, keeping daily liquidity."
      * In Portuguese: "Transferência confirmada, Sr. Silva! Iniciei a transferência de R$ 330.000,00 das suas contas externas para o seu CDB DI Itaú a 100% do CDI. Seus recursos já começarão a render a taxa otimizada imediatamente, com liquidez diária mantida."

    STEP 6. CARDHOLDER ALERTS TO TRAVEL:
    - Trigger: Cardholder mentions upcoming travel (e.g. "I'm traveling to Portugal and Spain next week", "Vou viajar para Portugal e Espanha semana que vem").
    - Action: Call `activate_travel_mode`.
    - Spoken response: Activate Travel Shield, raise POS limit to 50,000 reais, suppress fraud declines, AND THEN ask if they want to hear about the Mastercard Black travel benefits!
      * In English: "All set, Mr. Silva! I have activated Travel Shield for Portugal and Spain on your Mastercard Black, raised your daily international POS limit to 50,000 reais, and suppressed false fraud declines at foreign terminals. Would you like to hear about your Mastercard Black travel benefits for the trip?"
      * In Portuguese: "Tudo pronto, Sr. Silva! Ativei o Aviso Viagem para Portugal e Espanha no seu Mastercard Black, elevei seu limite internacional diário para R$ 50.000,00 e suprimi bloqueios indevidos no exterior. Gostaria de ouvir sobre os benefícios de viagem do seu Mastercard Black para a viagem?"

    STEP 7. CARDHOLDER CONFIRMS / ASKS ABOUT BLACK CARD BENEFITS:
    - Trigger: Cardholder says "yes", "sure", "sim", "tell me about the benefits", "quais são os benefícios?".
    - Action: Call `get_card_benefits`.
    - Spoken response:
      * In English: "Mr. Silva, for your European trip, you and your companion have unlimited complimentary access to the dedicated Mastercard Black VIP Lounge at Guarulhos Terminal 3, plus 4 worldwide LoungeKey passes for VIP lounges in Lisbon and Madrid. Your card also automatically provides €30,000 in Schengen-compliant emergency medical insurance, and full Masterseguro vehicle coverage if you decide to rent a car."
      * In Portuguese: "Sr. Silva, para sua viagem, você e seu acompanhante têm acesso ilimitado e gratuito à Sala VIP Mastercard Black no Terminal 3 de Guarulhos, além de 4 acessos LoungeKey para salas VIP em Lisboa e Madri. Seu cartão também emite automaticamente a apólice de seguro médico Schengen de €30.000, e inclui cobertura integral Masterseguro caso decida alugar um carro."

    Persona Directives:
    - Customer Honorific: ALWAYS address customer as "Mr. Silva" in English, and "Sr. Silva" in Portuguese. Never "Roberto" or "Robert".
    - COMPLETE SCRIPT EXECUTION & ZERO-SILENCE DIRECTIVE:
      * ALWAYS deliver the complete designated spoken response for each step in full from beginning to end. Never truncate, cut short, or stop mid-sentence.
      * Whenever invoking an action tool (like `confirm_cdb_sweep` or `confirm_cdi_transfer`), ALWAYS speak the designated confirmation out loud. NEVER output empty speech, `<no speech>`, or remain silent after calling a tool.
      * Always finish each response with the designated follow-up question so the conversation flows naturally into the next step of the demo.
      * Do not repeat the same response back-to-back once you have finished delivering it.
    - ZERO-THOUGHT & ZERO-FILLER DIRECTIVE:
      * NEVER vocalize internal thoughts, meta-reasoning, or commentary out loud (such as "This insight doesn't require narration", "Checking the latest totals for you", "Per my protocol", etc.).
      * Call tools silently and speak ONLY the designated polished response for that step.
    - Currency & Pronunciation:
      * Currency is Brazilian Real / Reais (written BRL or R$). ALWAYS say "Real" (singular) or "reais" (plural). NEVER say dollars or pounds.
      * CRITICAL PRONUNCIATION RULE: Whenever pronouncing ANY plural Real figure (e.g. "reais", R$ 38,000, 38,000 reais, 85,000 reais, 15,000 reais, 330,000 reais, 5,940 reais, 50,000 reais, etc.), it MUST ALWAYS be pronounced phonetically as "Ray-Ice", NOT "Ray-AHL".
      * The singular 1 Real is pronounced "Ray-AHL". But ANY plural figure (2 or more) MUST ALWAYS be pronounced "Ray-Ice" (reais), NEVER "Ray-AHL" or "reals". When speaking in English, never pronounce plural figures as "Ray-AHL".
    - Brevity & Style: Natural, confident executive cadence. Direct, polished, and warm.
    - Native Tools: ALWAYS invoke the corresponding native tool so the phone UI stays 100% in sync.
    """

    live_config = types.LiveConnectConfig(
        response_modalities=['AUDIO'],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name='Aoede')
            )
        ),
        system_instruction=types.Content(parts=[types.Part.from_text(text=system_prompt)]),
        tools=live_tools,
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        realtime_input_config=types.RealtimeInputConfig(
            activity_handling=types.ActivityHandling.START_OF_ACTIVITY_INTERRUPTS
        )
    )

    try:
        if gemini_client:
            async with gemini_client.aio.live.connect(model=GEMINI_LIVE_MODEL, config=live_config) as session:
                async def client_to_gemini():
                    try:
                        while True:
                            try:
                                raw_msg = await websocket.receive_text()
                                msg = json.loads(raw_msg)
                                
                                # Client-initiated manual interruption / barge-in
                                if msg.get("interrupt"):
                                    logger.info("Cardholder manual interruption triggered")

                                # Text input from browser
                                elif "text_input" in msg:
                                    raw_text = msg["text_input"].strip()
                                    if not raw_text:
                                        continue
                                    logger.info(f"Cardholder Text Input: '{raw_text}'")
                                    await session.send_client_content(
                                        turns=types.Content(
                                            role="user",
                                            parts=[types.Part(text=raw_text)]
                                        ),
                                        turn_complete=True
                                    )
                                
                                # 16kHz PCM Realtime Audio from microphone (Full Duplex)
                                elif "realtime_audio_pcm_16k" in msg:
                                    base64_pcm = msg["realtime_audio_pcm_16k"]
                                    raw_bytes = base64.b64decode(base64_pcm)
                                    await session.send_realtime_input(
                                        audio=types.Blob(data=raw_bytes, mime_type="audio/pcm;rate=16000")
                                    )

                                # Audio stream end signal
                                elif "audio_stream_end" in msg:
                                    await session.send_realtime_input(audio_stream_end=True)

                            except WebSocketDisconnect:
                                break
                            except Exception as inner_e:
                                logger.warning(f"Warning in client_to_gemini message: {inner_e}")
                    except Exception as e:
                        logger.error(f"Error in client_to_gemini task: {e}")

                async def gemini_to_client():
                    try:
                        while True:
                            async for response in session.receive():
                                try:
                                    # 1. Interruption / Barge-in detection from Gemini Live VAD
                                    if response.server_content and response.server_content.interrupted:
                                        logger.info("Model turn INTERRUPTED by cardholder voice jump-in")
                                        await websocket.send_json({
                                            "interrupted": True
                                        })

                                    # 2. Cardholder speech transcription from Gemini Live VAD
                                    if response.server_content and response.server_content.input_transcription and response.server_content.input_transcription.text:
                                        user_text = response.server_content.input_transcription.text.strip()
                                        if user_text:
                                            logger.info(f"VAD User Heard: '{user_text}'")
                                            await websocket.send_json({
                                                "user_transcript": user_text,
                                                "is_final": getattr(response.server_content.input_transcription, "finished", True)
                                            })

                                    # 3. Tool Call execution
                                    if response.tool_call and response.tool_call.function_calls:
                                        for fc in response.tool_call.function_calls:
                                            tool_name = fc.name
                                            tool_args = fc.args or {}
                                            logger.info(f"Tool Call: {tool_name} with args: {tool_args}")
                                            
                                            handler = TOOL_HANDLERS.get(tool_name)
                                            if handler:
                                                try:
                                                    tool_result_payload = handler(tool_args)
                                                except Exception as tool_e:
                                                    logger.error(f"Error executing tool {tool_name}: {tool_e}")
                                                    tool_result_payload = {"status": "error", "error": str(tool_e)}
                                            else:
                                                tool_result_payload = {"status": "success", "result": f"Executed {tool_name} successfully"}

                                            # Send tool call event to frontend phone UI immediately
                                            try:
                                                await websocket.send_json({
                                                    "tool_call": {
                                                        "name": tool_name,
                                                        "args": tool_args,
                                                        "payload": tool_result_payload
                                                    }
                                                })
                                            except Exception as ws_err:
                                                logger.warning(f"Failed to send tool_call to client: {ws_err}")

                                            # Send tool response confirmation back to Gemini Live
                                            try:
                                                await session.send_tool_response(
                                                    function_responses=[
                                                        types.FunctionResponse(
                                                            name=tool_name,
                                                            id=fc.id,
                                                            response=tool_result_payload
                                                        )
                                                    ]
                                                )
                                            except Exception as gemini_err:
                                                logger.error(f"Failed to send tool response to Gemini Live: {gemini_err}")

                                    # 4. Server Content (Audio chunks & transcriptions)
                                    if response.server_content:
                                        sent_transcription = False
                                        if response.server_content.output_transcription and response.server_content.output_transcription.text:
                                            out_text = response.server_content.output_transcription.text
                                            if out_text:
                                                sent_transcription = True
                                                logger.info(f"Assistant Output: '{out_text}'")
                                                await websocket.send_json({
                                                    "text": out_text
                                                })

                                        model_turn = response.server_content.model_turn
                                        if model_turn:
                                            for part in model_turn.parts:
                                                # Discard internal thoughts or meta-reasoning
                                                if getattr(part, 'thought', False):
                                                    continue
                                                # Audio 24kHz PCM chunk
                                                if part.inline_data:
                                                    b64_audio = base64.b64encode(part.inline_data.data).decode("utf-8")
                                                    await websocket.send_json({
                                                        "audio_pcm_24k": b64_audio
                                                    })
                                                # Text transcript piece (fallback if output_transcription was not sent)
                                                if part.text and not sent_transcription:
                                                    await websocket.send_json({
                                                        "text": part.text
                                                    })
                                        
                                        # Turn complete signal
                                        if response.server_content.turn_complete:
                                            await websocket.send_json({
                                                "turn_complete": True
                                            })

                                except WebSocketDisconnect:
                                    return
                                except Exception as chunk_e:
                                    logger.warning(f"Warning processing response chunk: {chunk_e}")

                    except WebSocketDisconnect:
                        pass
                    except Exception as e:
                        logger.error(f"Error in gemini_to_client task: {e}")

                t1 = asyncio.create_task(client_to_gemini())
                t2 = asyncio.create_task(gemini_to_client())
                try:
                    done, pending = await asyncio.wait([t1, t2], return_when=asyncio.FIRST_COMPLETED)
                    for p in pending:
                        p.cancel()
                except Exception as wait_e:
                    logger.warning(f"Task coordination error: {wait_e}")
                    t1.cancel()
                    t2.cancel()

        else:
            while True:
                await websocket.receive_text()
                await websocket.send_json({"text": "Local mock active.", "turn_complete": True})

    except WebSocketDisconnect:
        logger.info("Gemini Live WebSocket disconnected by client.")
    except Exception as e:
        logger.error(f"WebSocket live error: {e}")

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """
    Multimodal Gemini Conversational Endpoint for Itaú Concierge.
    Supports Portuguese and English across all 4 autonomous scenarios:
    1. Cash Flow Forecasting & CDB DI Sweeping
    2. Travel Notice & Mastercard Black Limit Elevation
    3. Open Finance Debt Consolidation & CCB Issuance
    4. Pix Fraud Interception & MED Dispute
    """
    lang = payload.lang or "pt"
    user_msg = payload.message.lower()

    # System instruction tailored for Itaú Concierge persona
    system_prompt = f"""
    You are Itaú Concierge, the elite AI Banking Concierge & Multi-Agent Orchestrator for Mr. Silva / Sr. Silva (Roberto Silva, Itaú Personnalité).
    Language Mode: {'English' if lang == 'en' else 'Portuguese (pt-BR)'}.
    
    Customer Profile:
    - Customer: Roberto Silva (Honorific: "Mr. Silva" in English, "Sr. Silva" in Portuguese)
    - Checking Account Balance: R$ 48.950,20
    - Daily Liquidity CDB DI (100% CDI): R$ 85.000,00
    - Mastercard Black (last 4: 8841): Available Limit R$ 72.569,50
    - Scheduled Debits next Thursday (D+4): R$ 38.000,00 (Condo Pix R$ 3.850 + Mastercard Black Bill R$ 34.150)
    - Connected Open Finance Debt: R$ 18.000,00 at Competitor Bank charging 11.2%/month (CET > 240% APR)
    - Pre-Approved Itaú Sob Medida Line: 1.69%/month (Total savings: R$ 14.280,00 / R$ 680,40 monthly)

    Rules & Brazilian Banking Identity:
    1. You represent Banco Itaú, Brazil's leading private bank and wealth management franchise (Itaú Personnalité).
    2. Always address the customer respectfully using their honorific and last name: **"Mr. Silva"** in English, and **"Sr. Silva"** in Portuguese. NEVER use "Robert".
    3. Currency & Pronunciation: Currency is Brazilian Real / Reais (written BRL or R$). ALWAYS say "Real" (singular) or "reais" (plural), NEVER dollars or pounds.
       CRITICAL PRONUNCIATION RULE: Whenever pronouncing ANY plural Real figure (e.g. "reais", 38,000 reais, 85,000 reais, 15,000 reais, 330,000 reais, 5,940 reais, 50,000 reais, etc.), it MUST ALWAYS be pronounced phonetically as "Ray-Ice", NOT "Ray-AHL". The singular (1 Real) is "Ray-AHL", but all plural figures MUST be pronounced "Ray-Ice", never "Ray-AHL" or "reals".
    4. Pronounce "Itaú", "Personnalité", "Pix", "CDB DI", and "Guarulhos" with authentic Brazilian Portuguese executive cadence.
    5. Respond with executive precision, warm and conversational tone, zero markdown asterisks in spoken numbers where possible.
    6. DEMO FLOW PROGRESSION:
       - Step 1: Predictive Balance Alert & Cash Flow Sweep offer (38k reais debits, 85k reais CDB, 15k reais sweep offer).
       - Step 2: Current Balances Inquiry (Reads off ONLY Itaú balances: Checking 48,950 reais + CDB DI 85,000 reais = 133,950 reais; NO Open Finance data. Offers to pull Open Finance for best rates).
       - Step 3: Open Finance Choice (User says yes -> Agent asks: check debt balances or CDI balances?).
       - Step 4: CDI Yield Improvements (User says CDI -> Quotes competitor 85% CDI vs Itaú 100% CDI, +15% CDI difference, +5,940 reais/year).
       - Step 5: User Approves ("ok, let's make that change" / "I approve") -> Confirms transfer of 330k reais to Itaú CDB DI.
       - Step 6: Travel Notice (Portugal & Spain, POS limit 50,000 reais, fraud suppression -> Asks about Mastercard Black travel benefits).
       - Step 7: Mastercard Black Benefits (GRU T3 VIP Lounge, 4 LoungeKey passes, €30k Schengen insurance, Masterseguro car rental).
    """

    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=payload.message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.2,
                )
            )
            return {"reply": response.text, "model": GEMINI_MODEL}
        except Exception as e:
            logger.error(f"Gemini generation error in /api/chat: {e}")

    # High-fidelity deterministic fallbacks tailored to the user's intent
    if "alert" in user_msg or "alerta" in user_msg or "predictive" in user_msg or "preventivo" in user_msg or "shortfall" in user_msg:
        if lang == "en":
            reply = "Hello Mr. Silva. I triggered this Predictive Balance Alert because your scheduled debits next Thursday total 38,000 reais—your 3,850 reais condominium Pix and your 34,150 reais Mastercard Black invoice. With upcoming expenses, this will cause a shortfall entering high-interest overdraft. I see you have 85,000 reais in your Daily Liquidity CDB. Would you like me to schedule an automatic sweep of 15,000 reais for Thursday morning so your funds keep earning full CDI until the exact moment of payment?"
        else:
            reply = "Olá Sr. Silva. Emiti este Alerta Preventivo de Saldo porque seus débitos agendados para a próxima quinta-feira somam R$ 38.000,00—o condomínio de R$ 3.850,00 e a fatura do Mastercard Black de R$ 34.150,00. Com as despesas previstas, isso causará um déficit no cheque especial. Identifiquei R$ 85.000,00 no seu CDB DI com liquidez diária. Deseja agendar um resgate automático de R$ 15.000,00 para quinta-feira de manhã para manter seu dinheiro rendendo 100% do CDI até a compensação?"
    elif "saldo" in user_msg or "balance" in user_msg or "conta" in user_msg or "extrato" in user_msg:
        # Step 2: Strictly Itaú balances only!
        if lang == "en":
            reply = "Mr. Silva, at Banco Itaú you currently have 133,950 reais in total liquid assets: 48,950 reais in your checking account, and 85,000 reais in your Daily Liquidity CDB earning 100% of CDI. I can also pull your Open Finance data if you would like to check if you are getting the best rates across the market."
        else:
            reply = "Sr. Silva, no Banco Itaú você possui atualmente R$ 133.950,20 em patrimônio líquido: R$ 48.950,20 na conta corrente e R$ 85.000,00 no CDB DI com liquidez diária rendendo 100% do CDI. Eu posso puxar seus dados do Open Finance se você quiser verificar se está recebendo as melhores taxas do mercado."
    elif "sim" == user_msg or "yes" == user_msg or "pode puxar" in user_msg or "open finance" in user_msg or "best rate" in user_msg or "melhor taxa" in user_msg:
        # Step 3: Offer choice between debt or CDI
        if lang == "en":
            reply = "Connecting to Open Finance... Would you like me to check any outstanding debt balances or your CDI balances through Open Finance?"
        else:
            reply = "Conectando ao Open Finance... Você gostaria de verificar seus saldos devedores ou seus saldos e rendimentos em CDI pelo Open Finance?"
    elif "cdi" in user_msg:
        # Step 4: Quote CDI improvements
        if lang == "en":
            reply = "Mr. Silva, through Open Finance I found 330,000 reais in liquid assets across BTG Pactual and XP earning only 85% of CDI. By moving these funds to your Itaú Daily Liquidity CDB, you'll earn 100% of CDI—an immediate 15% CDI yield improvement, generating an additional 5,940 reais per year with daily liquidity. Would you like me to make that change?"
        else:
            reply = "Sr. Silva, pelo Open Finance identifiquei R$ 330.000,00 em ativos líquidos no BTG Pactual e na XP rendendo apenas 85% do CDI. Ao transferir esses recursos para o seu CDB DI Itaú com liquidez diária, você passará a render 100% do CDI—um ganho adicional de 15% do CDI, que representa R$ 5.940,00 a mais por ano com liquidez diária. Posso fazer essa mudança?"
    elif "change" in user_msg or "approve" in user_msg or "aprovo" in user_msg or "mudança" in user_msg or "transfere" in user_msg or "transferir" in user_msg:
        # Step 5: Confirm CDI transfer
        if lang == "en":
            reply = "Transfer confirmed, Mr. Silva! I have initiated the transfer of 330,000 reais from your external accounts to your Itaú CDB DI at 100% CDI. Your funds will begin earning the higher rate immediately, keeping daily liquidity."
        else:
            reply = "Transferência confirmada, Sr. Silva! Iniciei a transferência de R$ 330.000,00 das suas contas externas para o seu CDB DI Itaú a 100% do CDI. Seus recursos já começarão a render a taxa otimizada imediatamente, com liquidez diária mantida."
    elif "benef" in user_msg or "black" in user_msg or "lounge" in user_msg or "seguro" in user_msg or "insuran" in user_msg or "guarulhos" in user_msg or "schengen" in user_msg:
        # Step 7: Mastercard Black Benefits details
        if lang == "en":
            reply = "Mr. Silva, for your European trip, you and your companion have unlimited complimentary access to the dedicated Mastercard Black VIP Lounge at Guarulhos Terminal 3, plus 4 worldwide LoungeKey passes for VIP lounges in Lisbon and Madrid. Your card also automatically provides €30,000 in Schengen-compliant emergency medical insurance, and full Masterseguro vehicle coverage if you decide to rent a car."
        else:
            reply = "Sr. Silva, para sua viagem, você e seu acompanhante têm acesso ilimitado e gratuito à Sala VIP Mastercard Black no Terminal 3 de Guarulhos, além de 4 acessos LoungeKey para salas VIP em Lisboa e Madri. Seu cartão também emite automaticamente a apólice de seguro médico Schengen de €30.000, e inclui cobertura integral Masterseguro caso decida alugar um carro."
    elif "viagem" in user_msg or "travel" in user_msg or "portugal" in user_msg or "espanha" in user_msg or "spain" in user_msg or "lisboa" in user_msg or "madrid" in user_msg or "trip" in user_msg:
        # Step 6: Travel Shield & Black Card Benefits offer
        if lang == "en":
            reply = "All set, Mr. Silva! I have activated Travel Shield for Portugal and Spain on your Mastercard Black, raised your daily international POS limit to 50,000 reais, and suppressed false fraud declines at foreign terminals. Would you like to hear about your Mastercard Black travel benefits for the trip?"
        else:
            reply = "Tudo pronto, Sr. Silva! Ativei o Aviso Viagem para Portugal e Espanha no seu Mastercard Black, elevei seu limite internacional diário para R$ 50.000,00 e suprimi bloqueios indevidos no exterior. Gostaria de ouvir sobre os benefícios de viagem do seu Mastercard Black para a viagem?"
    else:
        reply = "Sr. Silva, o Itaú Concierge está monitorando suas contas e proteções em tempo real com conformidade total às diretrizes do Banco Central."

    return {"reply": reply, "model": "local-orchestrator"}

@app.post("/api/banking/ai-assist")
async def ai_assistant(payload: AiAssistRequest, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """
    Invokes Gemini Enterprise Agent Platform (fka Vertex AI Platform)
    with customer context and registered banking tools.
    """
    chat_req = ChatRequest(message=payload.user_query, lang="pt")
    res = await chat_endpoint(chat_req, user)
    return {"response": res["reply"], "model": res["model"]}

@app.get("/api/banking/decision-graph")
async def get_decision_graph(user: Dict[str, Any] = Depends(get_authenticated_user)):
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
            "color": "#475569",
            "val": 22,
            "details": "Automated precautionary block & 72-hour fraud claim protection"
        },
        {
            "id": "ai_guard_engine",
            "name": "Itaú Concierge AI Risk Engine",
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
        if full_path.startswith("api/") or full_path == "health" or full_path == "ws" or full_path.startswith("ws/"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        dist_dir = os.path.abspath("dist")
        local_path = os.path.abspath(os.path.join(dist_dir, full_path))

        # Path traversal guard: verify path remains inside dist
        if os.path.commonpath([dist_dir, local_path]) != dist_dir:
            raise HTTPException(status_code=403, detail="Forbidden")

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
