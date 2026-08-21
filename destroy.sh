#!/usr/bin/env bash
# =====================================================================
# Automated Cloud Run Teardown Script (destroy.sh)
# Cleans up all GCP resources created for Itaú Banking Alerts
# =====================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

GCP_PROJECT="${GCP_PROJECT:-}"
GCP_REGION="${GCP_REGION:-us-central1}"
APP_NAME="${APP_NAME:-itau-banking-alerts}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-${APP_NAME}-sa}"

if [[ -z "${GCP_PROJECT}" ]]; then
  echo "Error: GCP_PROJECT is not set."
  exit 1
fi

echo "====================================================================="
echo " Tearing down ${APP_NAME} in GCP project ${GCP_PROJECT}"
echo "====================================================================="

echo "Deleting Cloud Run service ${APP_NAME}..."
gcloud run services delete "${APP_NAME}" \
  --region="${GCP_REGION}" \
  --project="${GCP_PROJECT}" \
  --quiet || true

SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com"
echo "Deleting runtime Service Account ${SA_EMAIL}..."
gcloud iam service-accounts delete "${SA_EMAIL}" \
  --project="${GCP_PROJECT}" \
  --quiet || true

echo "Teardown complete!"
