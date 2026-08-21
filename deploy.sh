#!/usr/bin/env bash
# =====================================================================
# Automated Cloud Run Deployment Script (deploy.sh)
# Deploys Itaú Banking Alerts Demo to Google Cloud Run with Native IAP
# =====================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ ! -f .env ]]; then
  echo "Error: .env file not found. Copy example.env to .env and configure it."
  exit 1
fi

# POSIX-safe .env sourcing
set -a
# shellcheck disable=SC1091
source .env
set +a

# Defaults
GCP_PROJECT="${GCP_PROJECT:-}"
GCP_REGION="${GCP_REGION:-us-central1}"
APP_NAME="${APP_NAME:-itau-banking-alerts}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.7-flash}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-${APP_NAME}-sa}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-3}"
MEMORY="${MEMORY:-2Gi}"
CPU="${CPU:-1}"
IAP_ALLOWED_DOMAINS="${IAP_ALLOWED_DOMAINS:-google.com}"

if [[ -z "${GCP_PROJECT}" ]]; then
  echo "Error: GCP_PROJECT is not set in .env"
  exit 1
fi

echo "====================================================================="
echo " Deploying ${APP_NAME} to Google Cloud Run"
echo " Project: ${GCP_PROJECT} | Region: ${GCP_REGION} | Model: ${GEMINI_MODEL}"
echo "====================================================================="

gcloud config set project "${GCP_PROJECT}" --quiet

# Enable required Google Cloud APIs
echo "Enabling necessary GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  aiplatform.googleapis.com \
  iap.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  --project="${GCP_PROJECT}"

PROJECT_NUMBER=$(gcloud projects describe "${GCP_PROJECT}" --format="value(projectNumber)")
SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com"

# Create Dedicated Runtime Service Account if not exists
if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "Creating dedicated runtime Service Account: ${SA_EMAIL}..."
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="Runtime SA for ${APP_NAME}" \
    --project="${GCP_PROJECT}"
fi

# Grant least-privilege roles to runtime SA
echo "Granting IAM roles to runtime Service Account..."
gcloud projects add-iam-policy-binding "${GCP_PROJECT}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user" \
  --condition=None --quiet >/dev/null

# Grant run.invoker to IAP Service Agent
IAP_SA="service-${PROJECT_NUMBER}@gcp-sa-iap.iam.gserviceaccount.com"
echo "Granting Cloud Run Invoker to IAP Service Agent: ${IAP_SA}..."
gcloud projects add-iam-policy-binding "${GCP_PROJECT}" \
  --member="serviceAccount:${IAP_SA}" \
  --role="roles/run.invoker" \
  --condition=None --quiet >/dev/null || true

IMAGE_URI="gcr.io/${GCP_PROJECT}/${APP_NAME}:latest"

echo "Building and deploying container via Cloud Build & Cloud Run..."
gcloud builds submit --tag "${IMAGE_URI}" --project="${GCP_PROJECT}"

# Deploy to Cloud Run with IAP enabled and IAM service check disabled
gcloud run deploy "${APP_NAME}" \
  --image="${IMAGE_URI}" \
  --region="${GCP_REGION}" \
  --platform=managed \
  --service-account="${SA_EMAIL}" \
  --min-instances="${MIN_INSTANCES}" \
  --max-instances="${MAX_INSTANCES}" \
  --memory="${MEMORY}" \
  --cpu="${CPU}" \
  --timeout=300 \
  --iap \
  --no-invoker-iam-check \
  --no-allow-unauthenticated \
  --ingress=all \
  --set-env-vars="^@^APP_ENV=production@GCP_PROJECT=${GCP_PROJECT}@GCP_REGION=${GCP_REGION}@GEMINI_MODEL=${GEMINI_MODEL}@PROJECT_NUMBER=${PROJECT_NUMBER}@IAP_ALLOWED_DOMAINS=${IAP_ALLOWED_DOMAINS}" \
  --project="${GCP_PROJECT}"

SERVICE_URL=$(gcloud run services describe "${APP_NAME}" --platform=managed --region="${GCP_REGION}" --format="value(status.url)" --project="${GCP_PROJECT}")
SERVICE_DOMAIN=$(echo "${SERVICE_URL}" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

echo "Configuring IAP Allowed Domains for ${SERVICE_DOMAIN}..."
IAP_SETTINGS_TMP=$(mktemp)
cat << EOF > "${IAP_SETTINGS_TMP}"
accessSettings:
  allowedDomainsSettings:
    enable: true
    domains:
      - "${SERVICE_DOMAIN}"
      - "${APP_NAME}-${PROJECT_NUMBER}.${GCP_REGION}.run.app"
EOF

gcloud iap settings set "${IAP_SETTINGS_TMP}" \
  --project="${GCP_PROJECT}" \
  --resource-type=cloud-run \
  --region="${GCP_REGION}" \
  --service="${APP_NAME}" --quiet || true
rm -f "${IAP_SETTINGS_TMP}"

# Grant IAP Access to allowed principal
IAP_PRINCIPAL="${IAP_ALLOWED_MEMBER:-user:$(gcloud config get-value account 2>/dev/null)}"
if [[ -n "${IAP_PRINCIPAL}" ]]; then
  echo "Granting IAP Access to ${IAP_PRINCIPAL} on Cloud Run resource..."
  gcloud iap web add-iam-policy-binding \
    --resource-type=cloud-run \
    --service="${APP_NAME}" \
    --region="${GCP_REGION}" \
    --member="${IAP_PRINCIPAL}" \
    --role="roles/iap.httpsResourceAccessor" \
    --project="${GCP_PROJECT}" || true
fi

echo "====================================================================="
echo " Deployment Complete!"
echo " Service URL: ${SERVICE_URL}"
echo " Protected by Identity-Aware Proxy (IAP)"
echo "====================================================================="
