import os
import json
import logging
import datetime
import uuid
from typing import Optional, Dict, Any, List
import httpx
from fastapi import APIRouter, Request, HTTPException, status, Path, Depends
from pydantic import BaseModel, Field
import google.auth
from google.auth.transport.requests import Request as AuthRequest
from iap_jwt_middleware import get_authenticated_user

logger = logging.getLogger("itau.brands")

router = APIRouter(prefix="/api", tags=["brands"])

KIND_NAME = os.getenv("BRAND_PROFILES_KIND", "itau_brand_profiles")
LOCAL_BRANDS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "brand_profiles.json")

class BrandProfileModel(BaseModel):
    model_config = {"extra": "allow"}

    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    brandSubtitle: Optional[str] = "Mortgage & Home Equity"
    tagline: Optional[str] = None
    primaryColor: Optional[str] = "#FF6423"
    primaryColorHover: Optional[str] = None
    secondaryTextColor: Optional[str] = "#FFFFFF"
    accentColor: Optional[str] = None
    headerBgColor: Optional[str] = None
    logoUrl: Optional[str] = None
    logoOnly: Optional[bool] = False
    lightHeader: Optional[bool] = False
    logoScale: Optional[float] = 100
    logoX: Optional[float] = 0
    logoY: Optional[float] = 0
    creator: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    isCustom: Optional[bool] = True
    config: Optional[dict] = None

DEFAULT_ITAU_PROFILE = {
    "id": "itau",
    "name": "Itaú Unibanco",
    "brandSubtitle": "Mortgage & Home Equity",
    "tagline": "100% Digital Origination • Itaú Unibanco",
    "primaryColor": "#FF6423",
    "primaryColorHover": "#D2531C",
    "secondaryTextColor": "#FFFFFF",
    "accentColor": "#002D62",
    "logoUrl": None,
    "logoOnly": False,
    "lightHeader": False,
    "logoScale": 100,
    "logoX": 0,
    "logoY": 0,
    "creator": "system",
    "isCustom": False,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
}

def load_local_brands_from_disk() -> Dict[str, dict]:
    try:
        if os.path.exists(LOCAL_BRANDS_FILE):
            with open(LOCAL_BRANDS_FILE, "r") as f:
                loaded = json.load(f)
                if isinstance(loaded, dict):
                    return loaded
    except Exception as e:
        logger.warning(f"Failed to load local brands from {LOCAL_BRANDS_FILE}: {e}")
    return {"itau": DEFAULT_ITAU_PROFILE}

def save_local_brands_to_disk(brands: Dict[str, dict]):
    try:
        os.makedirs(os.path.dirname(LOCAL_BRANDS_FILE), exist_ok=True)
        with open(LOCAL_BRANDS_FILE, "w") as f:
            json.dump(brands, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save local brands to {LOCAL_BRANDS_FILE}: {e}")

_local_brands_cache: Dict[str, dict] = load_local_brands_from_disk()
if "itau" not in _local_brands_cache:
    _local_brands_cache["itau"] = DEFAULT_ITAU_PROFILE

# --- GCP Credential Resolution ---

def get_adc_token() -> Optional[str]:
    try:
        credentials, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        credentials.refresh(AuthRequest())
        return credentials.token
    except Exception as e:
        logger.debug(f"Failed to get ADC token: {e}")
        return None

def get_gcloud_token() -> Optional[str]:
    try:
        import subprocess
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True
        )
        token = result.stdout.strip()
        if token:
            return token
    except Exception:
        pass
    return None

def get_valid_gcp_token() -> str:
    token = get_adc_token()
    if token and token.strip():
        return token
    token = get_gcloud_token()
    if token and token.strip():
        return token
    return os.environ.get("PRODUCTION_ACCESS_TOKEN") or os.environ.get("GCLOUD_ACCESS_TOKEN") or ""

def get_project_id() -> str:
    return (
        os.environ.get("GCP_PROJECT")
        or os.environ.get("GOOGLE_CLOUD_PROJECT")
        or os.environ.get("VITE_PROJECT_ID")
        or "itau-banking-alerts"
    )

def get_firestore_databases() -> List[str]:
    """
    Returns the list of Firestore Native database IDs to sync to.
    Avoids '(default)' when it is in Datastore mode.
    """
    configured = os.environ.get("FIRESTORE_DATABASE")
    project_id = get_project_id()
    dbs = []
    if configured and configured != "(default)":
        dbs.append(configured)
    if project_id == "edgar-rag-demo" and "cait-db" not in dbs:
        dbs.append("cait-db")
    if not dbs:
        dbs.append("cait-db")
    return dbs

def get_firestore_url(doc_path: str = "", database: Optional[str] = None) -> str:
    project_id = get_project_id()
    if database:
        db_id = database
    else:
        dbs = get_firestore_databases()
        db_id = dbs[0] if dbs else "cait-db"
    base = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/{db_id}/documents"
    if doc_path:
        return f"{base}/{doc_path.lstrip('/')}"
    return base

def resolve_user_identity(request: Request) -> str:
    user = get_authenticated_user(request)
    if user and user.get("email"):
        return user["email"]
    return "developer@google.com"

# --- Serialization Converters ---

def python_to_firestore_value(val):
    if val is None:
        return {"nullValue": None}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [python_to_firestore_value(item) for item in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: python_to_firestore_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}

def firestore_value_to_python(val_obj):
    if not isinstance(val_obj, dict):
        return val_obj
    if "stringValue" in val_obj:
        return val_obj["stringValue"]
    elif "booleanValue" in val_obj:
        return val_obj["booleanValue"]
    elif "integerValue" in val_obj:
        return int(val_obj["integerValue"])
    elif "doubleValue" in val_obj:
        return float(val_obj["doubleValue"])
    elif "nullValue" in val_obj:
        return None
    elif "arrayValue" in val_obj:
        return [firestore_value_to_python(item) for item in val_obj["arrayValue"].get("values", [])]
    elif "mapValue" in val_obj:
        fields = val_obj["mapValue"].get("fields", {})
        return {k: firestore_value_to_python(v) for k, v in fields.items()}
    elif "timestampValue" in val_obj:
        return val_obj["timestampValue"]
    return val_obj

def python_to_datastore_value(val, property_name=""):
    unindexed_props = {"logoUrl", "config", "customAvatarData"}
    exclude = property_name in unindexed_props or (isinstance(val, str) and len(val) > 1400)

    if val is None:
        res = {"nullValue": None}
    elif isinstance(val, bool):
        res = {"booleanValue": val}
    elif isinstance(val, int):
        res = {"integerValue": str(val)}
    elif isinstance(val, float):
        res = {"doubleValue": val}
    elif isinstance(val, str):
        res = {"stringValue": val}
    elif isinstance(val, list):
        res = {"arrayValue": {"values": [python_to_datastore_value(item) for item in val]}}
    elif isinstance(val, dict):
        res = {"entityValue": {"properties": {k: python_to_datastore_value(v, k) for k, v in val.items()}}}
    else:
        res = {"stringValue": str(val)}

    if exclude:
        res["excludeFromIndexes"] = True
    return res

def datastore_value_to_python(val_obj):
    if not isinstance(val_obj, dict):
        return val_obj
    if "stringValue" in val_obj:
        return val_obj["stringValue"]
    elif "booleanValue" in val_obj:
        return val_obj["booleanValue"]
    elif "integerValue" in val_obj:
        return int(val_obj["integerValue"])
    elif "doubleValue" in val_obj:
        return float(val_obj["doubleValue"])
    elif "nullValue" in val_obj:
        return None
    elif "arrayValue" in val_obj:
        return [datastore_value_to_python(item) for item in val_obj["arrayValue"].get("values", [])]
    elif "entityValue" in val_obj:
        props = val_obj["entityValue"].get("properties", {})
        return {k: datastore_value_to_python(v) for k, v in props.items()}
    elif "timestampValue" in val_obj:
        return val_obj["timestampValue"]
    return val_obj

# --- Cloud Persistence Helpers ---

async def persist_brand_to_cloud(profile_data: dict, access_token: str, project_id: str) -> Dict[str, Any]:
    brand_id = profile_data["id"]
    results = {"datastore": False, "firestore": False, "databases": []}

    # 1. Google Cloud Datastore REST (Database: (default))
    try:
        commit_url = f"https://datastore.googleapis.com/v1/projects/{project_id}:commit"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        ds_props = {k: python_to_datastore_value(v, k) for k, v in profile_data.items() if v is not None}
        mutation = {
            "mode": "NON_TRANSACTIONAL",
            "mutations": [
                {
                    "upsert": {
                        "key": {
                            "path": [{"kind": KIND_NAME, "name": brand_id}]
                        },
                        "properties": ds_props
                    }
                }
            ]
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(commit_url, headers=headers, json=mutation)
            if resp.status_code == 200:
                results["datastore"] = True
                results["databases"].append("datastore:(default)")
            else:
                logger.debug(f"Datastore commit returned {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.debug(f"Datastore save error for {brand_id}: {e}")

    # 2. Google Cloud Firestore Native REST (Database: cait-db / FIRESTORE_DATABASE)
    fs_dbs = get_firestore_databases()
    fs_fields = {k: python_to_firestore_value(v) for k, v in profile_data.items() if v is not None}
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    for db_id in fs_dbs:
        try:
            url = get_firestore_url(f"{KIND_NAME}/{brand_id}", database=db_id)
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.patch(url, headers=headers, json={"fields": fs_fields})
                if resp.status_code in (200, 201):
                    results["firestore"] = True
                    results["databases"].append(f"firestore:{db_id}")
                else:
                    logger.debug(f"Firestore ({db_id}) patch returned {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.debug(f"Firestore save error ({db_id}) for {brand_id}: {e}")

    return results

async def delete_brand_from_cloud(brand_id: str, access_token: str, project_id: str) -> Dict[str, Any]:
    results = {"datastore": False, "firestore": False, "databases": []}

    # 1. Delete from Datastore
    try:
        commit_url = f"https://datastore.googleapis.com/v1/projects/{project_id}:commit"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        mutation = {
            "mode": "NON_TRANSACTIONAL",
            "mutations": [
                {
                    "delete": {
                        "path": [{"kind": KIND_NAME, "name": brand_id}]
                    }
                }
            ]
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(commit_url, headers=headers, json=mutation)
            if resp.status_code == 200:
                results["datastore"] = True
                results["databases"].append("datastore:(default)")
    except Exception as e:
        logger.debug(f"Datastore delete error for {brand_id}: {e}")

    # 2. Delete from Firestore Native
    fs_dbs = get_firestore_databases()
    headers = {"Authorization": f"Bearer {access_token}"}
    for db_id in fs_dbs:
        try:
            url = get_firestore_url(f"{KIND_NAME}/{brand_id}", database=db_id)
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.delete(url, headers=headers)
                if resp.status_code in (200, 204, 404):
                    results["firestore"] = True
                    results["databases"].append(f"firestore:{db_id}")
        except Exception as e:
            logger.debug(f"Firestore delete error ({db_id}) for {brand_id}: {e}")

    return results

class BatchSyncBrandsPayload(BaseModel):
    profiles: List[BrandProfileModel]
    activeBrandId: Optional[str] = None

# --- API Endpoints ---

@router.get("/me")
async def get_current_user_endpoint(request: Request, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """Returns the authenticated user's email address."""
    user_email = user.get("email") or resolve_user_identity(request)
    return {"email": user_email}

@router.get("/brands")
async def list_brands_endpoint(request: Request, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """
    List all brand profiles.
    Queries both Datastore and Firestore Native in the cloud and merges with local disk cache.
    """
    access_token = get_valid_gcp_token()
    project_id = get_project_id()
    profiles_dict = dict(_local_brands_cache)

    if access_token:
        # 1. Query Datastore REST
        try:
            ds_url = f"https://datastore.googleapis.com/v1/projects/{project_id}:runQuery"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            body = {"query": {"kind": [{"name": KIND_NAME}]}}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(ds_url, headers=headers, json=body)
                if resp.status_code == 200:
                    entities = resp.json().get("batch", {}).get("entityResults", [])
                    for res in entities:
                        ent = res.get("entity", {})
                        key_path = ent.get("key", {}).get("path", [{}])[0]
                        doc_id = key_path.get("name") or key_path.get("id") or ""
                        props = ent.get("properties", {})
                        p = {k: datastore_value_to_python(v) for k, v in props.items()}
                        if doc_id:
                            p["id"] = str(doc_id)
                            profiles_dict[str(doc_id)] = p
                            _local_brands_cache[str(doc_id)] = p
        except Exception as e:
            logger.debug(f"Datastore list error for {KIND_NAME}: {e}")

        # 2. Query Firestore Native REST
        fs_dbs = get_firestore_databases()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        for db_id in fs_dbs:
            try:
                url = get_firestore_url(KIND_NAME, database=db_id)
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        docs = resp.json().get("documents", [])
                        for doc in docs:
                            doc_id = doc.get("name", "").split("/")[-1]
                            fields = doc.get("fields", {})
                            p = {k: firestore_value_to_python(v) for k, v in fields.items()}
                            if doc_id:
                                p["id"] = str(doc_id)
                                profiles_dict[str(doc_id)] = p
                                _local_brands_cache[str(doc_id)] = p
            except Exception as e:
                logger.debug(f"Firestore list error ({db_id}) for {KIND_NAME}: {e}")

        save_local_brands_to_disk(_local_brands_cache)

    profile_list = list(profiles_dict.values())
    return {
        "profiles": profile_list, 
        "brands": profile_list,
        "cloud_sync": {
            "project": project_id,
            "datastore_mode_db": "(default)",
            "firestore_native_db": get_firestore_databases()[0] if get_firestore_databases() else "cait-db",
            "count": len(profile_list)
        }
    }

@router.get("/brands/{brand_id}")
async def get_brand_endpoint(
    brand_id: str = Path(..., pattern=r"^[a-zA-Z0-9_-]{1,64}$"), 
    request: Request = None,
    user: Dict[str, Any] = Depends(get_authenticated_user)
):
    """Retrieve a specific brand profile by ID."""
    access_token = get_valid_gcp_token()
    project_id = get_project_id()

    if access_token:
        # 1. Try Datastore lookup
        try:
            lookup_url = f"https://datastore.googleapis.com/v1/projects/{project_id}:lookup"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            body = {
                "keys": [{"path": [{"kind": KIND_NAME, "name": brand_id}]}]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(lookup_url, headers=headers, json=body)
                if resp.status_code == 200:
                    found = resp.json().get("found", [])
                    if found:
                        props = found[0].get("entity", {}).get("properties", {})
                        profile = {k: datastore_value_to_python(v) for k, v in props.items()}
                        profile["id"] = brand_id
                        _local_brands_cache[brand_id] = profile
                        save_local_brands_to_disk(_local_brands_cache)
                        return profile
        except Exception as e:
            logger.debug(f"Datastore lookup error for {brand_id}: {e}")

        # 2. Try Firestore lookup
        fs_dbs = get_firestore_databases()
        for db_id in fs_dbs:
            try:
                url = get_firestore_url(f"{KIND_NAME}/{brand_id}", database=db_id)
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        fields = data.get("fields", {})
                        profile = {k: firestore_value_to_python(v) for k, v in fields.items()}
                        profile["id"] = brand_id
                        _local_brands_cache[brand_id] = profile
                        save_local_brands_to_disk(_local_brands_cache)
                        return profile
            except Exception as e:
                logger.debug(f"Firestore get error ({db_id}) for {brand_id}: {e}")

    if brand_id in _local_brands_cache:
        return _local_brands_cache[brand_id]

    if brand_id == "itau":
        return DEFAULT_ITAU_PROFILE

    raise HTTPException(status_code=404, detail="Brand profile not found.")

@router.post("/brands")
async def save_brand_endpoint(payload: BrandProfileModel, request: Request, user: Dict[str, Any] = Depends(get_authenticated_user)):
    """
    Save or update a brand profile.
    Persists to Google Cloud Datastore ((default)), Firestore Native (cait-db), and local disk cache.
    """
    current_user = user.get("email") or resolve_user_identity(request)
    profile_data = payload.model_dump()
    brand_id = profile_data["id"].strip()
    if not brand_id:
        brand_id = f"custom-{int(datetime.datetime.now().timestamp() * 1000)}"
        profile_data["id"] = brand_id

    # Look up existing creator if available
    existing = _local_brands_cache.get(brand_id)
    if existing and existing.get("creator"):
        profile_data["creator"] = existing.get("creator")
    elif not profile_data.get("creator"):
        profile_data["creator"] = current_user

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if not profile_data.get("createdAt"):
        profile_data["createdAt"] = existing.get("createdAt") if existing else now_iso
    profile_data["updatedAt"] = now_iso

    # Update in-memory & disk cache
    _local_brands_cache[brand_id] = profile_data
    save_local_brands_to_disk(_local_brands_cache)

    # Persist concurrently to Google Cloud Datastore and Firestore Native
    access_token = get_valid_gcp_token()
    project_id = get_project_id()
    cloud_sync = {}

    if access_token:
        cloud_sync = await persist_brand_to_cloud(profile_data, access_token, project_id)

    return {"status": "ok", "profile": profile_data, "cloud_sync": cloud_sync}

@router.delete("/brands/{brand_id}")
async def delete_brand_endpoint(
    brand_id: str = Path(..., pattern=r"^[a-zA-Z0-9_-]{1,64}$"), 
    request: Request = None,
    user: Dict[str, Any] = Depends(get_authenticated_user)
):
    """
    Delete a custom brand profile from Datastore/Firestore and local cache.
    The pristine 'itau' default profile cannot be permanently removed.
    """
    if brand_id == "itau":
        _local_brands_cache["itau"] = dict(DEFAULT_ITAU_PROFILE)
    else:
        _local_brands_cache.pop(brand_id, None)
    save_local_brands_to_disk(_local_brands_cache)

    access_token = get_valid_gcp_token()
    project_id = get_project_id()
    cloud_sync = {}

    if access_token:
        cloud_sync = await delete_brand_from_cloud(brand_id, access_token, project_id)

    return {"status": "ok", "deleted": brand_id, "cloud_sync": cloud_sync}

@router.post("/brands/sync-all")
async def sync_all_brands_endpoint(
    payload: BatchSyncBrandsPayload, 
    request: Request, 
    user: Dict[str, Any] = Depends(get_authenticated_user)
):
    """
    Synchronously persist a collection of brand profiles (e.g. from browser localStorage)
    to Google Cloud Datastore ((default)), Firestore Native (cait-db), and local disk cache.
    """
    current_user = user.get("email") or resolve_user_identity(request)
    access_token = get_valid_gcp_token()
    project_id = get_project_id()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    saved_profiles = []
    cloud_results = []

    for item in payload.profiles:
        profile_data = item.model_dump()
        brand_id = profile_data["id"].strip()
        if not brand_id:
            brand_id = f"custom-{int(datetime.datetime.now().timestamp() * 1000)}"
            profile_data["id"] = brand_id

        existing = _local_brands_cache.get(brand_id)
        if existing and existing.get("creator"):
            profile_data["creator"] = existing.get("creator")
        elif not profile_data.get("creator"):
            profile_data["creator"] = current_user

        if not profile_data.get("createdAt"):
            profile_data["createdAt"] = existing.get("createdAt") if existing else now_iso
        if not profile_data.get("updatedAt"):
            profile_data["updatedAt"] = now_iso

        _local_brands_cache[brand_id] = profile_data
        saved_profiles.append(profile_data)

        if access_token:
            res = await persist_brand_to_cloud(profile_data, access_token, project_id)
            cloud_results.append({brand_id: res})

    save_local_brands_to_disk(_local_brands_cache)

    return {
        "status": "ok",
        "synced_count": len(saved_profiles),
        "saved_ids": [p["id"] for p in saved_profiles],
        "project_id": project_id,
        "firestore_databases": get_firestore_databases(),
        "cloud_results": cloud_results,
        "profiles": saved_profiles
    }

@router.post("/brands/seed")
async def seed_brands_endpoint(
    request: Request,
    user: Dict[str, Any] = Depends(get_authenticated_user)
):
    """
    Force-seed all brand profiles in data/brand_profiles.json to Datastore and Firestore Native.
    """
    access_token = get_valid_gcp_token()
    project_id = get_project_id()
    disk_brands = load_local_brands_from_disk()

    results = []
    for brand_id, profile in disk_brands.items():
        _local_brands_cache[brand_id] = profile
        if access_token:
            res = await persist_brand_to_cloud(profile, access_token, project_id)
            results.append({brand_id: res})

    return {
        "status": "ok",
        "seeded_count": len(disk_brands),
        "project_id": project_id,
        "firestore_databases": get_firestore_databases(),
        "results": results
    }

