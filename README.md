# Banco Itaú — Central de Segurança & Alertas Bancários

An intelligent, real-time banking security and fraud protection platform for **Banco Itaú Unibanco**, built with **Gemini Enterprise Agent Platform (fka Vertex AI Platform)**, **Python FastAPI**, **React 19**, **Vite**, and **Tailwind CSS**. Deployed securely on **Google Cloud Run** with native **Identity-Aware Proxy (IAP)**.

---

## 🏛️ Executive & Architectural Overview

The **Itaú Banking Alerts Platform** intercepts high-risk transactions (such as out-of-pattern Pix payments, night-time limit overrides, and anomalous IP geolocations) in sub-200ms and coordinates proactive resolution through an interactive mobile banking app and multimodal AI assistant.

```
       [ Itaú Cardholder (Browser/Mobile) ]
                        │
                        ▼  (IAP Protected / X-Goog-IAP-JWT-Assertion)
        ┌──────────────────────────────┐
        │       Google Cloud Run       │
        │  (FastAPI Backend + Vite UI) │
        └──────────────┬───────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌──────────────────┐       ┌──────────────────────────────┐
│  Itaú Guard AI   │       │   Gemini Enterprise Agent    │
│  Decision Graph  │       │       Platform (ADC)         │
│ (BACEN MED Rules)│       │      (gemini-3.7-flash)      │
└──────────────────┘       └──────────────────────────────┘
```

---

## 🎨 Design System & Look & Feel (`DESIGN.md`)

The user interface follows the high-contrast corporate financial design system specified in [`DESIGN.md`](file:///Users/alexcombs/Projects/itau-banking-alerts/DESIGN.md):
- **Brand Colors**: Itaú Signature Orange (`#FF6423`), Pitch-Black Hero (`#070707`), Off-White Body (`#F3F3F3`), Text Muted (`#798B97`).
- **Hero Section**: 12-column responsive layout with 24px gutters, quarterly result announcements, and translucent quick-link cards (`rgba(0,0,0,0.4)` with 1px hairline borders).
- **Buttons & Cards**: 4px subtle rounded buttons (`--radius-button: 4px`), 8px cards (`--radius-card: 8px`). No pill buttons.
- **Iconography**: Exclusively stroke-based SVG icons via `lucide-react` (zero emojis in UI copy).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Python 3.11+
- Node.js 20+ / npm
- Google Cloud SDK (`gcloud auth application-default login`)

### 2. Configure Environment
```bash
cp example.env .env
```

### 3. Run Locally with Parity
```bash
chmod +x run_local.sh
./run_local.sh
```
- **Unified App (FastAPI + SPA)**: [http://127.0.0.1:8090](http://127.0.0.1:8090)
- **Frontend Vite Dev Server (HMR)**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Interactive Walkthrough Manual**: [http://127.0.0.1:8090/walkthrough.html](file:///Users/alexcombs/Projects/itau-banking-alerts/walkthrough.html)

---

## ☁️ Google Cloud Run Deployment

Deploy securely to Google Cloud Run using the standardized, automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Security & Native IAP Architecture
1. **Authentication Configuration**:
   - **IAM (Service-to-Service)**: **Disabled / Unchecked** (`--no-invoker-iam-check`) so browser end-users do not require `roles/run.invoker`.
   - **IAP (Browser End-Users)**: **Enabled / Checked** (`--iap`) with `domain:google.com` (or specified domain) programmatically bound to the Cloud Run IAP resource policy.
2. **IAP Allowed Domains Requirement**:
   - The Cloud Run service URL/domain is automatically added under **Allowed Domains** in the IAP Settings panel to authorize OAuth redirects.
3. **Project IAM Policy Compliance**:
   - `domain:google.com` is **NEVER added to GCP Project-level IAM roles** (preventing Domain Restricted Sharing / DRS Org Policy violations).
4. **Backend JWT Verification**:
   - FastAPI enforces cryptographically verified `X-Goog-IAP-JWT-Assertion` headers matching `IAP_ALLOWED_DOMAINS` in production (`iap_jwt_middleware.py`).

---

## 🧹 Automated Teardown

To clean up all Cloud Run and Service Account resources created by this demo:

```bash
chmod +x destroy.sh
./destroy.sh
```

---

## 📄 Key File Directory

| File / Path | Role & Purpose |
| :--- | :--- |
| [`main.py`](file:///Users/alexcombs/Projects/itau-banking-alerts/main.py) | FastAPI backend, Gemini client, banking endpoints, and strict cache-control SPA static asset serving. |
| [`iap_jwt_middleware.py`](file:///Users/alexcombs/Projects/itau-banking-alerts/iap_jwt_middleware.py) | Cryptographic IAP JWT verification and domain allowlist enforcement. |
| [`DESIGN.md`](file:///Users/alexcombs/Projects/itau-banking-alerts/DESIGN.md) | Authoritative Itaú brand tokens, high-contrast hero specifications, and UI rules. |
| [`frontend/src/App.tsx`](file:///Users/alexcombs/Projects/itau-banking-alerts/frontend/src/App.tsx) | Main React layout composing the Header, Hero, Mobile Simulator, Alerts Center, and Decision Graph. |
| [`frontend/src/components/MobilePhoneShell.tsx`](file:///Users/alexcombs/Projects/itau-banking-alerts/frontend/src/components/MobilePhoneShell.tsx) | Interactive mobile device container with Personnalité account, balance toggle, and Pix keys. |
| [`frontend/src/components/AlertsCenter.tsx`](file:///Users/alexcombs/Projects/itau-banking-alerts/frontend/src/components/AlertsCenter.tsx) | Real-time proactive fraud & banking alerts feed with instant block & dispute controls. |
| [`frontend/src/components/FraudDecisionGraph.tsx`](file:///Users/alexcombs/Projects/itau-banking-alerts/frontend/src/components/FraudDecisionGraph.tsx) | Visual reasoning graph showing customer profile, anomaly event, BACEN MED policy, and actions. |
| [`frontend/src/components/VoiceBankingModal.tsx`](file:///Users/alexcombs/Projects/itau-banking-alerts/frontend/src/components/VoiceBankingModal.tsx) | Multimodal voice & chat AI assistant powered by Gemini 3.7 Flash. |
| [`deploy.sh`](file:///Users/alexcombs/Projects/itau-banking-alerts/deploy.sh) | Cloud Run build and deployment script with IAP and Service Account automation. |
| [`destroy.sh`](file:///Users/alexcombs/Projects/itau-banking-alerts/destroy.sh) | Automated resource cleanup script. |
| [`run_local.sh`](file:///Users/alexcombs/Projects/itau-banking-alerts/run_local.sh) | Local development runner with 127.0.0.1 host binding. |
| [`walkthrough.html`](file:///Users/alexcombs/Projects/itau-banking-alerts/walkthrough.html) | ASD-STE100 interactive application walkthrough manual for Developers and Executives. |
