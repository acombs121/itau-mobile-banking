#!/usr/bin/env bash
# =====================================================================
# Local Development Parity Runner (run_local.sh)
# Starts FastAPI Backend + React/Vite Frontend locally
# =====================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ ! -f .env ]]; then
  echo "No .env found. Copying example.env to .env..."
  cp example.env .env
fi

# POSIX-safe .env sourcing
set -a
# shellcheck disable=SC1091
source .env
set +a

export APP_ENV="local"
LOCAL_HOST="${LOCAL_HOST:-127.0.0.1}"
LOCAL_PORT="${LOCAL_PORT:-8090}"

echo "====================================================================="
echo " Starting Banco Itaú Banking Alerts Locally"
echo " Backend:  http://${LOCAL_HOST}:${LOCAL_PORT}"
echo " Frontend: http://${LOCAL_HOST}:5173"
echo "====================================================================="

# Clean up on exit
cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Set up or activate Python virtual environment if available
if [[ -d ".venv" ]]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

# Start Python FastAPI Backend (binding strictly to 127.0.0.1)
echo "Starting Python FastAPI Backend on ${LOCAL_HOST}:${LOCAL_PORT}..."
python3 -m uvicorn main:app --host "${LOCAL_HOST}" --port "${LOCAL_PORT}" --reload &
BACKEND_PID=$!

# Start Frontend Dev Server
echo "Starting Frontend Vite Dev Server..."
(cd frontend && npm run dev -- --host "${LOCAL_HOST}") &
FRONTEND_PID=$!

wait
