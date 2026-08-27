# Architecture & UI Reference Notes for Itaú Banking Alerts App

This document records the core architectural patterns, WebSocket audio streaming logic, tool-calling schemas, and mobile UI layouts extracted from the reference concierge platform, tailored for building the **Itaú Unibanco Mobile Banking & Proactive Alerts App**.

---

## 1. Itaú Unibanco Brand Identity & Design System

### 1.1 Color Palette
- **Itaú Signature Orange (Primary Accent)**: `#FF6423` (Hover: `#D2531C`)
- **Monochrome Neutral Chrome**: `#070707` (Pitch-Black Hero), `#121215` (Charcoal Surface), `#F3F3F3` (Off-White Body)
- **Palette Restriction**: No blue across interface chrome or cards.
- **Status / Alert Colors (Strictly Semantic)**:
  - Fraud / High Risk / Overdraft: `#E11D48` / `#EF4444` (Crimson / Rose)
  - Success / Active / Safeguarded / Verified / Positive Yield: `#059669` / `#10B981` (Emerald Green, strictly semantic)
  - Warning / Advisory: `#D97706` / `#F59E0B` (Amber)

### 1.2 Mobile UI Layout & View Hierarchy
- **Mobile Phone Shell Container**:
  - Width: `w-full max-w-[440px]` with rounded borders (`rounded-[40px]`), inner shadow, status bar notch, and home indicator bar.
  - Header: Itaú logo, account selector (e.g. *Itaú Personnalité* / *Itaú Uniclass*), member balance toggle (`R$ 48.950,20`), and notification badge.
  - Action Carousel: Pix Transfer, Pay Boleto, Cards & Limits, Investments, FX / Global Account.
  - Active Alert / Incident Banner: High-priority card for real-time transaction anomalies (e.g. *Suspicious Pix Transfer Detected — R$ 4.200,00 to Unknown Merchant*).
  - Floating Multimodal AI Action Button: Animated microphone button in the bottom right or center navigation bar to trigger live audio banking assistant.
  - Bottom Tab Navigation: Home, Extrato (Statements), Pix, Cartões (Cards), Ajuda / IA (Help).
- **Secondary Desktop / Tablet Panels (Dual-View)**:
  - **Left / Center**: Mobile Banking Interface (interactive phone view with simulated customer account).
  - **Right**: Real-Time Fraud & Decision Graph (`ForceGraph2D` showing account risk score, geolocation anomaly detection, device fingerprinting, and automated policy actions).

---

## 2. Gemini Multimodal Live WebSocket Architecture

### 2.1 Audio Ingest (Browser -> Server -> Gemini Live)
1. **AudioContext Worklet**: Captures user microphone audio at 16,000 Hz single-channel PCM format.
2. **Chunking**: Samples are converted from `Float32Array` to `Int16Array`, packaged into Base64 binary strings, and streamed via WebSocket to `ws://localhost:PORT/ws/live`.
3. **Session Setup Payload**:
```json
{
  "setup": {
    "model": "projects/<PROJECT_ID>/locations/us-central1/publishers/google/models/gemini-3.5-flash-live-preview",
    "generation_config": {
      "response_modalities": ["AUDIO"],
      "speech_config": {
        "voice_config": {
          "prebuilt_voice_config": {
            "voice_name": "Aoede"
          }
        }
      }
    },
    "system_instruction": {
      "parts": [{ "text": "You are the Itaú Unibanco AI Banking Concierge and Fraud Protection Assistant..." }]
    },
    "tools": [
      {
        "function_declarations": [ ... ]
      }
    ]
  }
}
```

### 2.2 Audio Output (Gemini Live -> Server -> Browser)
- Server forwards Gemini Enterprise Agent Platform (fka Vertex AI Platform) raw WebSocket frames to the browser.
- Browser extracts `inlineData` (MIME `audio/pcm;rate=24000`), decodes Base64 to `Int16Array`, converts to `Float32Array`, and queues into the Web Audio playback buffer.
- **Interruption**: If `serverContent.interrupted` is received, immediately stop playback and clear the audio queue.

---

## 3. Sub-Agent Tool Schemas for Itaú Banking

### 3.1 Core Banking Sub-Agents
1. **`get_account_overview`**: Fetches checking account balance, recent Pix transactions, credit card limit, and active security flags.
2. **`freeze_card_or_block_transaction`**: Instantly freezes physical/virtual card or blocks a flagged fraudulent transaction.
3. **`execute_pix_transfer`**: Securely executes or schedules a Pix payment to a validated contact or CPF/CNPJ key with biometrics confirmation.
4. **`issue_chargeback_or_dispute`**: Files an automated fraud claim with Medida Cautelar de Devolução (MEC / Pix dispute).
5. **`adjust_credit_limit`**: Dynamically increases or decreases temporary Pix/card limit for verified travel or large purchases.
6. **`send_security_sms_or_push`**: Sends immediate multi-factor confirmation alert to cardholder's trusted mobile device.

---

## 4. Backend (`main.py`) Architecture
- **Framework**: Python 3.11+ FastAPI + WebSocket + `google-genai` (ADC).
- **Port**: Configurable via `.env` (`LOCAL_PORT=8090`).
- **Endpoints**:
  - `GET /health`
  - `GET /ws/live` (WebSocket endpoint connecting to Gemini Enterprise Agent Platform (fka Vertex AI Platform) Live API)
  - `POST /api/chat` (Analytical reasoning & text completion fallback)
  - `GET /api/banking/profile` / `POST /api/banking/action` (Banking state and transactions)
  - Static build serving from `dist/` with strict SPA cache-control headers

---

## 5. Decision Graph Engine (Graph Reasoning)
- Renders graph nodes (`react-force-graph-2d`):
  - **Layer 1: Input** (Customer Profile, Transaction Event, Geolocation Data, Device IP)
  - **Layer 2: Policy & Risk** (Anti-Fraud Machine Learning Model, Pix Daily Limit Rules, BACEN Guidelines)
  - **Layer 3: Decision** (Flag as Suspect, Request Voice Auth, Block Account, Approve Instant Transfer)
  - **Layer 4: Action & Output** (Push Alert Delivered, Pix Processed, Card Temporarily Frozen)
