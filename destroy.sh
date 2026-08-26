#!/usr/bin/env bash
# =====================================================================
# Automated Cloud Run Resource Teardown Script (destroy.sh)
# Parameterized via .env - Removes demo resources cleanly
# =====================================================================
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found. Nothing to destroy." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

: "${GCP_PROJECT:?Missing GCP_PROJECT in .env}"
: "${GCP_REGION:?Missing GCP_REGION in .env}"
: "${APP_NAME:?Missing APP_NAME in .env}"
: "${SERVICE_ACCOUNT_NAME:?Missing SERVICE_ACCOUNT_NAME in .env}"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com"
REPO_NAME="${APP_NAME}-repo"

echo "=========================================================="
echo "WARNING: You are about to DESTROY the following resources:"
echo "  - Cloud Run Service:  ${APP_NAME} (${GCP_REGION})"
echo "  - Artifact Registry:  ${REPO_NAME} (${GCP_REGION})"
echo "  - Service Account:    ${SERVICE_ACCOUNT_EMAIL}"
echo "  - Secret Manager:     ${REQUIRED_SECRETS:-None}"
echo "=========================================================="

if [[ -t 0 ]]; then
  read -p "Are you sure you want to proceed? (y/N): " CONFIRM
  if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "Teardown cancelled."
    exit 0
  fi
fi

gcloud config set project "${GCP_PROJECT}" --quiet

# 1. Delete Cloud Run service
if gcloud run services describe "${APP_NAME}" --region="${GCP_REGION}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Cloud Run service: ${APP_NAME}..."
  gcloud run services delete "${APP_NAME}" --region="${GCP_REGION}" --project="${GCP_PROJECT}" --quiet
fi

# 2. Delete Artifact Registry repository
if gcloud artifacts repositories describe "${REPO_NAME}" --location="${GCP_REGION}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Artifact Registry repo: ${REPO_NAME}..."
  gcloud artifacts repositories delete "${REPO_NAME}" --location="${GCP_REGION}" --project="${GCP_PROJECT}" --quiet
fi

# 3. Delete runtime Service Account
if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "--> Deleting Service Account: ${SERVICE_ACCOUNT_NAME}..."
  gcloud iam service-accounts delete "${SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT}" --quiet
fi

# 4. Delete Secret Manager secrets created for this app
if [[ -n "${REQUIRED_SECRETS:-}" ]]; then
  IFS=',' read -ra SECRETS <<< "${REQUIRED_SECRETS}"
  for SECRET_NAME in "${SECRETS[@]}"; do
    SECRET_NAME=$(echo "${SECRET_NAME}" | xargs)
    if [[ -z "${SECRET_NAME}" ]]; then continue; fi
    if gcloud secrets describe "${SECRET_NAME}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
      echo "--> Deleting Secret: ${SECRET_NAME}..."
      gcloud secrets delete "${SECRET_NAME}" --project="${GCP_PROJECT}" --quiet
    fi
  done
fi

echo "=========================================================="
echo "TEARDOWN COMPLETE! All demo resources removed."
echo "=========================================================="
