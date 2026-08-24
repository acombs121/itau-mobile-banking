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
import logging
from typing import Optional, Dict, Any, List
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
GCP_PROJECT = os.getenv("GCP_PROJECT", "edgar-rag-demo")
GCP_REGION = os.getenv("GCP_REGION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_LIVE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.5-flash-live-preview")

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

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    lang: Optional[str] = "pt"

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket, lang: str = "pt"):
    """
    Bidirectional WebSocket connection to Gemini Multimodal Live API
    (gemini-live-2.5-flash-native-audio on Vertex AI).
    Accepts 16kHz PCM audio or text from browser, streams back 24kHz PCM audio,
    text transcripts, and tool execution events.
    """
    await websocket.accept()
    logger.info(f"Client connected to Gemini Live WebSocket (lang: {lang})")

    # Define tools for Live session
    live_tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="sweep_cdb",
                    description="Schedules an automatic liquidity rebalance from CDB DI into checking account on a specific date to prevent overdraft (LIS) interest.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "amount_brl": types.Schema(type=types.Type.NUMBER, description="Amount in BRL to transfer from CDB DI, e.g. 15000.00"),
                            "transfer_date": types.Schema(type=types.Type.STRING, description="Date or time of scheduled transfer, e.g. 2026-08-25 06:00 BRT")
                        },
                        required=["amount_brl"]
                    )
                ),
                types.FunctionDeclaration(
                    name="activate_travel_mode",
                    description="Activates international travel notice for specific countries, raises international POS spend limit, and verifies Mastercard Black travel insurance.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "destinations": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="List of destination countries/cities"),
                            "raise_limit_to": types.Schema(type=types.Type.NUMBER, description="Elevated daily POS spend limit, e.g. 50000.00")
                        },
                        required=["destinations"]
                    )
                ),
                types.FunctionDeclaration(
                    name="refinance_open_finance",
                    description="Issues an electronic CCB under Lei 10.931 and executes interbank debt consolidation/portability to settle high-interest competitor credit.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "debt_balance": types.Schema(type=types.Type.NUMBER, description="External debt balance to pay off, e.g. 18000.00"),
                            "bank_name": types.Schema(type=types.Type.STRING, description="Competitor bank name")
                        },
                        required=["debt_balance"]
                    )
                )
            ]
        )
    ]

    system_prompt = f"""
    You are Itaú Concierge, the elite AI Banking Concierge & Multi-Agent Orchestrator for Roberto Silva (Itaú Personnalité).
    Language: {'English' if lang == 'en' else 'Portuguese (pt-BR)'}.

    Customer Financial Context:
    - Checking Balance: R$ 48.950,20
    - Daily Liquidity CDB DI (100% CDI): R$ 85.000,00
    - Mastercard Black (last 4: 8841): Available Limit R$ 72.569,50
    - Scheduled Debits next Thursday: R$ 38.000,00 (Condo Pix R$ 3.850 + Mastercard Black Bill R$ 34.150).
    - Open Finance External Debt: R$ 18.000,00 at 11.2%/mo. Pre-approved Itaú Sob Medida: 1.69%/mo (Total saved: R$ 14.280,00).

    Spoken Persona Directives:
    1. Speak concisely, clearly, with high-touch executive banking poise. Avoid formatting symbols like markdown asterisks in spoken numbers.
    2. SCENARIO 1 (Flight Tickets / Balance Forecast): If the customer asks about purchasing tickets (e.g. R$ 24.000 to Lisbon) or upcoming debits, calculate that checking will be short by R$ 13.050 next Thursday. Proactively offer to schedule an automatic sweep of R$ 15.000 from CDB DI on Thursday morning (06:00 BRT). If accepted, call the tool `sweep_cdb`.
    3. SCENARIO 2 (Travel Notice / Europe / Spain / Portugal / Cards): If the customer mentions traveling to Portugal/Spain/Europe or asking about card safety, call `activate_travel_mode` and confirm that travel notice is active, daily limit is raised to R$ 50.000, and Mastercard Black travel health insurance is verified.
    4. SCENARIO 3 (Open Finance Debt Refinance): If the customer asks about debt optimization or savings, explain the R$ 18.000 competitor balance at 11.2%/mo, offer to issue the electronic CCB at 1.69%/mo saving R$ 14.280, and call `refinance_open_finance`.
    """

    live_config = types.LiveConnectConfig(
        response_modalities=['AUDIO'],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name='Aoede')
            )
        ),
        system_instruction=types.Content(parts=[types.Part.from_text(text=system_prompt)]),
        tools=live_tools
    )

    try:
        if gemini_client:
            async with gemini_client.aio.live.connect(model=GEMINI_LIVE_MODEL, config=live_config) as session:
                
                async def client_to_gemini():
                    try:
                        while True:
                            raw_msg = await websocket.receive_text()
                            msg = json.loads(raw_msg)
                            
                            # 16kHz PCM Realtime Audio from microphone
                            if "realtime_audio_pcm_16k" in msg:
                                base64_pcm = msg["realtime_audio_pcm_16k"]
                                raw_bytes = base64.b64decode(base64_pcm)
                                await session.send_realtime_input(
                                    audio=types.Blob(data=raw_bytes, mime_type="audio/pcm;rate=16000")
                                )

                            # Audio stream end signal
                            elif "audio_stream_end" in msg:
                                await session.send_realtime_input(audio_stream_end=True)
                            
                            # Text input from browser
                            elif "text_input" in msg:
                                await session.send(input=msg["text_input"], end_of_turn=True)
                    except WebSocketDisconnect:
                        pass
                    except Exception as e:
                        logger.error(f"Error in client_to_gemini task: {e}")

                async def gemini_to_client():
                    try:
                        async for response in session.receive():
                            if response.server_content:
                                model_turn = response.server_content.model_turn
                                if model_turn:
                                    for part in model_turn.parts:
                                        # Audio 24kHz PCM chunk
                                        if part.inline_data:
                                            b64_audio = base64.b64encode(part.inline_data.data).decode("utf-8")
                                            await websocket.send_json({
                                                "audio_pcm_24k": b64_audio
                                            })
                                        # Text transcript piece
                                        if part.text:
                                            await websocket.send_json({
                                                "text": part.text
                                            })
                                
                                if response.server_content.turn_complete:
                                    await websocket.send_json({"turn_complete": True})

                            # Handle Tool Call from Gemini Live
                            if response.tool_call:
                                for fc in response.tool_call.function_calls:
                                    tool_name = fc.name
                                    tool_args = fc.args or {}
                                    logger.info(f"Gemini Live Tool Call: {tool_name} with args: {tool_args}")
                                    await websocket.send_json({
                                        "tool_call": {
                                            "name": tool_name,
                                            "args": tool_args
                                        }
                                    })
                                    # Send tool response confirmation back to Gemini Live
                                    await session.send_tool_response(
                                        function_responses=[
                                            types.FunctionResponse(
                                                name=tool_name,
                                                id=fc.id,
                                                response={"status": "success", "result": f"Executed {tool_name} successfully"}
                                            )
                                        ]
                                    )

                    except WebSocketDisconnect:
                        pass
                    except Exception as e:
                        logger.error(f"Error in gemini_to_client task: {e}")

                await asyncio.gather(client_to_gemini(), gemini_to_client())

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
    You are Itaú Concierge, the elite AI Banking Concierge & Multi-Agent Orchestrator for Roberto Silva (Itaú Personnalité).
    Language Mode: {'English' if lang == 'en' else 'Portuguese (pt-BR)'}.
    
    Customer Profile:
    - Checking Account Balance: R$ 48.950,20
    - Daily Liquidity CDB DI (100% CDI): R$ 85.000,00
    - Mastercard Black (last 4: 8841): Available Limit R$ 72.569,50
    - Scheduled Debits next Thursday (D+4): R$ 38.000,00 (Condo Pix R$ 3.850 + Mastercard Black Bill R$ 34.150)
    - Connected Open Finance Debt: R$ 18.000,00 at Competitor Bank charging 11.2%/month (CET > 240% APR)
    - Pre-Approved Itaú Sob Medida Line: 1.69%/month (Total savings: R$ 14.280,00 / R$ 680,40 monthly)

    Rules:
    1. Respond with executive precision, warm and professional tone, zero markdown asterisks in spoken numbers where possible.
    2. SCENARIO 1 (Flight Tickets / Balance Forecast): If the user asks about buying tickets (e.g. R$ 24.000 to Lisbon) or asks if next week's bills will clear, calculate that checking will have a shortfall of R$ 13.050 next Thursday. Proactively suggest scheduling an automated sweep of R$ 15.000 from the Daily Liquidity CDB on Thursday morning so funds keep earning full CDI until the exact moment of payment.
    3. SCENARIO 2 (Travel / Europe / Spain / Portugal / Mastercard): If the user mentions traveling to Portugal/Spain/Europe or asking about card safety, confirm you have activated Travel Shielding, raised the international POS limit to R$ 50.000, and verified complimentary Mastercard Black travel health insurance.
    4. SCENARIO 3 (Open Finance / Debt Refinance / Savings): If the user asks about saving money or refinancing debt, explain the R$ 18.000 competitor balance at 11.2%/mo and offer to issue the electronic CCB under Lei 10.931 at 1.69%/mo, saving R$ 14.280 overall.
    5. SCENARIO 4 (Pix Fraud / Block / Hold): If the user asks about the R$ 4.200 Pix attempt to 'Eletro Tech SP', explain the overseas VPN anomaly and confirm the precautionary hold under BACEN Resolution 147 (MED).
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
    if "passag" in user_msg or "ticket" in user_msg or "saldo" in user_msg or "balance" in user_msg or "voo" in user_msg or "flight" in user_msg:
        if lang == "en":
            reply = "Hello Roberto. You currently have R$ 48,950 available in checking. However, if you purchase the tickets today, your scheduled credit card bill and condominium Pix next Thursday will result in a shortfall of R$ 13,050, entering high-interest overdraft. I see you have R$ 85,000 in your Daily Liquidity CDB. Would you like me to schedule an automatic transfer of R$ 15,000 on Thursday morning so your funds keep earning full CDI until the exact moment they are needed?"
        else:
            reply = "Olá Roberto. Você tem R$ 48.950,20 disponíveis em conta corrente. Contudo, ao comprar as passagens hoje, os débitos agendados de condomínio e cartão na próxima quinta-feira resultarão em um déficit de R$ 13.050,00, entrando no cheque especial (LIS). Identifiquei R$ 85.000,00 no seu CDB DI Liquidez Diária. Deseja que eu agende um resgate automático de R$ 15.000,00 para quinta-feira de manhã para manter seu rendimento até o minuto exato do débito?"
    elif "viagem" in user_msg or "travel" in user_msg or "portugal" in user_msg or "espanha" in user_msg or "spain" in user_msg or "lisboa" in user_msg or "madrid" in user_msg:
        if lang == "en":
            reply = "All set, Roberto! I have activated Travel Shielding for Portugal and Spain on your Mastercard Black ending in 8841. I also increased your international daily spend limit to R$ 50,000 and verified that your complimentary Mastercard Black travel medical insurance is fully active for you and your companion. You're ready to travel with zero merchant friction."
        else:
            reply = "Tudo pronto, Roberto! Ativei o Aviso de Viagem para Portugal e Espanha no seu Mastercard Black final 8841. Também elevei seu limite diário internacional para R$ 50.000,00 e validei que o seguro médico internacional Mastercard Black está ativo para você e seu acompanhante. Sua viagem está totalmente protegida contra bloqueios indevidos."
    elif "dívida" in user_msg or "debt" in user_msg or "refinanc" in user_msg or "open finance" in user_msg or "econom" in user_msg or "sav" in user_msg:
        if lang == "en":
            reply = "Roberto, reviewing your connected Open Finance portfolio, you have an outstanding revolving credit balance of R$ 18,000 at a competitor bank charging 11.2% per month. Because of your Personnalité tier, you have a pre-approved Itaú Sob Medida consolidation rate of just 1.69% per month. Refinancing this saves you R$ 680.40 every month—a total of R$ 14,280 in avoided interest. Would you like me to issue the digital CCB and settle that external balance directly?"
        else:
            reply = "Roberto, analisando seu Open Finance, identifiquei um saldo devedor de R$ 18.000,00 no banco concorrente a uma taxa de 11,2% ao mês. Pelo seu perfil Personnalité, você possui taxa pré-aprovada de 1,69% ao mês no Itaú Sob Medida. Essa portabilidade economiza R$ 680,40 por mês, totalizando R$ 14.280,00 em juros evitados. Deseja que eu emita a CCB eletrônica e liquide a dívida externa?"
    else:
        if lang == "en":
            reply = "Itaú Concierge is monitoring all active sub-agents. Your accounts, liquidity schedules, and Mastercard Black protections are operating securely under Central Bank standards."
        else:
            reply = "O Itaú Concierge está monitorando todos os sub-agentes ativos. Suas contas, cronogramas de liquidez e proteções do Mastercard Black estão operando com segurança total sob as normas do Banco Central."

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
