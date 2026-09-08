import os
from typing import Literal, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from iap_jwt_middleware import get_authenticated_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AdminConfigPayload(BaseModel):
    execution_mode: Optional[Literal["hybrid", "live", "simulated"]] = None
    simulated_step_delay_ms: Optional[int] = None
    mock_latency_ms: Optional[int] = None

class AdminConfigResponse(BaseModel):
    execution_mode: str
    is_live_connection: bool
    gemini_model: str
    gcp_project: str
    gcp_region: str
    simulated_step_delay_ms: int

_admin_config = {
    "execution_mode": os.getenv("AI_EXECUTION_MODE", "hybrid"),
    "simulated_step_delay_ms": int(os.getenv("SIMULATED_STEP_DELAY_MS", "600")),
}

@router.get("/config", response_model=AdminConfigResponse)
async def get_admin_config(user: dict = Depends(get_authenticated_user)):
    gcp_proj = os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT") or "itau-banking-alerts"
    gcp_reg = os.getenv("GCP_REGION", "us-central1")
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
    
    # Check if native genai client is active
    is_live = False
    try:
        from main import gemini_client
        is_live = gemini_client is not None
    except Exception:
        pass

    return AdminConfigResponse(
        execution_mode=_admin_config["execution_mode"],
        is_live_connection=is_live,
        gemini_model=model_name,
        gcp_project=gcp_proj,
        gcp_region=gcp_reg,
        simulated_step_delay_ms=_admin_config["simulated_step_delay_ms"]
    )

@router.post("/config", response_model=AdminConfigResponse)
async def update_admin_config(payload: AdminConfigPayload, user: dict = Depends(get_authenticated_user)):
    if payload.execution_mode is not None:
        _admin_config["execution_mode"] = payload.execution_mode
    if payload.simulated_step_delay_ms is not None:
        _admin_config["simulated_step_delay_ms"] = payload.simulated_step_delay_ms
    elif payload.mock_latency_ms is not None:
        _admin_config["simulated_step_delay_ms"] = payload.mock_latency_ms

    gcp_proj = os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT") or "itau-banking-alerts"
    gcp_reg = os.getenv("GCP_REGION", "us-central1")
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
    
    is_live = False
    try:
        from main import gemini_client
        is_live = gemini_client is not None
    except Exception:
        pass

    return AdminConfigResponse(
        execution_mode=_admin_config["execution_mode"],
        is_live_connection=is_live,
        gemini_model=model_name,
        gcp_project=gcp_proj,
        gcp_region=gcp_reg,
        simulated_step_delay_ms=_admin_config["simulated_step_delay_ms"]
    )
