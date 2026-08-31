# Banco Itaú — Brand Kit & Design System Specification
**Version:** 2.0 (Swiss Executive Banking Edition)  
**Segment:** Itaú Personnalité & Itaú Empresas (AI Autonomous Concierge)

---

## 1. Named Typefaces & Font Stacks

### Official Bespoke Corporate Typeface: **Itaú Display & Itaú Text**
- **Commissioned by**: Itaú Unibanco S.A.
- **Designers**: **Pentagram** (partner Marina Willer), **Fábio Lopez**, and **Plau** foundry (with foundational historical typefaces by **Dalton Maag**).
- **Distribution**: Proprietary corporate assets (not published on public open-source registries).
- **Codebase Integration**:
  - **Auto-Detection**: Declared in `frontend/src/index.css` via `local('Itau Display')` and `local('Itau Text')`. If installed on your macOS or Windows system, the app automatically renders genuine Itaú typography.
  - **Drop-In Webfonts**: Supported by placing `.woff2` files into `frontend/public/fonts/` (`ItauDisplay-Bold.woff2`, `ItauText-Regular.woff2`, etc.).
  - **CSS Font Stack**:
    - Display: `'Itau Display', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif`
    - Text & UI: `'Itau Text', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Universal Interface Sans Fallback: **Inter**
- **Designer**: Rasmus Andersson
- **Role**: Universal fallback interface copy, card headers, navigation, display titles, button text
- **Characteristics**: Tall x-height, geometric neo-grotesque apertures, neutral corporate authority
- **Weights Used**:
  - `400` (Regular) — Explanatory copy, disclaimer footnotes
  - `500` (Medium) — Subheaders, category metadata
  - `600` (SemiBold) — Card titles, button text, table column headers
  - `700` (Bold) — Section titles, cockpit navigation brand mark
  - `900` (Black) — Itaú vector logotype wordmark
- **CSS Stack**: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Financial Monospace Typeface: **JetBrains Mono**
- **Designer**: JetBrains Foundry
- **Role**: All financial numbers, account balances, currency arithmetic, ledger items, telemetry JSON
- **Characteristics**: Strict tabular proportionality, tall character height, clear distinction between `0` (dotted) and `O`, `1` and `l`
- **Weights Used**:
  - `400` (Regular) — Telemetry payloads, code snippets
  - `600` (SemiBold) — Table rows, rates, spread comparisons
  - `700` (Bold) — Hero metric balance (`R$ 48.950,20`), monospace category tags
- **CSS Stack**: `'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace`
- **Mandatory OpenType Feature**: `font-feature-settings: "tnum"` (tabular proportional figures)

---

## 2. Typographic Scale & Exact Details

| Token Name | Typeface | Size (px / rem) | Font Weight | Line Height | Letter Spacing | Case | Component Usage |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `--type-hero-metric` | **JetBrains Mono** | `24px` / `1.5rem` | `700` (Bold) | `1.2` (`28.8px`) | `-0.02em` | None | Primary checking balance (`R$ 48.950,20`) |
| `--type-display-title` | **Itaú Display** *(Inter fallback)* | `18px` / `1.125rem` | `700` (Bold) | `1.3` (`23.4px`) | `-0.015em` | None | Cockpit navigation header & main title |
| `--type-card-header` | **Itaú Text** *(Inter fallback)* | `14px` / `0.875rem` | `600` (SemiBold) | `1.35` (`18.9px`) | `-0.01em` | None | In-phone dynamic card titles, item headers |
| `--type-mono-tag` | **JetBrains Mono** | `10.5px` / `0.656rem` | `700` (Bold) | `1.4` (`14.7px`) | `+0.05em` | `UPPERCASE` | Category badges (`CHECKING ACCOUNT`, `OPEN FINANCE`) |
| `--type-tabular-row` | **JetBrains Mono** | `11px` / `0.6875rem` | `600` (SemiBold) | `1.45` (`16.0px`) | `0.00em` (`tnum`) | None | Rate spreads, interest savings, tabular rows |
| `--type-body-ui` | **Itaú Text** *(Inter fallback)* | `12px` / `0.75rem` | `400` (Regular) | `1.5` (`18.0px`) | `0.00em` | None | Narrative copy, advisory explanations |
| `--type-caption-micro`| **Itaú Text** *(Inter fallback)* | `9.5px` / `0.59rem` | `500` (Medium) | `1.3` (`12.3px`) | `+0.03em` | `UPPERCASE` | Timestamps, section indicators, metadata labels |
| `--type-logotype` | **Itaú Display Black** *(Inter Black fallback)* | `42px` / `2.625rem` | `900` (Black) | `1.0` (`42.0px`) | `-0.04em` | `lowercase` | Official `"itau"` vector emblem |

---

## 3. Named Component Catalog

### Application Shell & Layout
1. **`CockpitHeader`** (`frontend/src/components/CockpitHeader.tsx`):
   - Executive top navigation bar. Contains the Itaú brand glyph, brand title, Portuguese/English language toggle, monochrome theme toggle (dark/light), session reset, and save session controls.
2. **`PhoneContainer`** (`frontend/src/components/PhoneContainer.tsx`):
   - Ultra-realistic physical smartphone simulator chassis. Contains the physical volume/power buttons, Dynamic Island, 5G status bar, customer identity header, quick-actions 4-grid, dynamic canvas host, and bottom concierge dock.
3. **`AudioWaveformVisualizer`** (`frontend/src/components/AudioWaveformVisualizer.tsx`):
   - Memoized (`React.memo`) 9-bar reactive audio visualizer. Mathematically centered over the bottom dock via `absolute inset-0 flex items-center justify-center`. Isolates 60–120 FPS audio updates from the parent phone tree.
4. **`AgentOrchestratorPanel`** (`frontend/src/components/AgentOrchestratorPanel.tsx`):
   - C-Level agentic control panel. Displays scenario buttons, live sub-agent status badges (`Active`, `Completed`), interactive decision graph view, and raw JSON telemetry inspector.

### In-Phone Dynamic Canvas Cards
5. **`CheckingBalanceCard`** (`balance_checking`):
   - Renders immediately when the customer inquires about their balance. Highlights Available Balance (`R$ 48.950,20`), LIS Overdraft Limit (`R$ 10.000,00`), and an interactive link to upcoming Thursday debits.
6. **`ScheduledPaymentsCard`** (`scheduled_payments`):
   - Itemized upcoming bills: Mastercard Black invoice (`R$ 34.150,00`) and Condomínio Edifício Jardins boleto (`R$ 3.850,00`). Features automated 100% coverage verification check.
7. **`CdbInvestmentsCard`** (`balance_cdb`):
   - Highlights daily liquidity balance (`R$ 85.000,00`), 100% CDI yield, and immediate 24/7 liquidity badge.
8. **`MastercardBlackCard`** (`balance_card`):
   - Displays available limit (`R$ 72.569,50`), total credit limit (`R$ 85.000,00`), and upcoming invoice due date.
9. **`CardBenefitsCard`** (`card_benefits_agent`):
   - Highlights GRU Terminal 3 VIP lounge access, 4 European LoungeKey passes, €30.000 Schengen travel medical insurance, and Masterseguro car rental CDW/LDW.
10. **`OpenFinanceOptimizerCard`** (`open_finance_optimizer`):
    - Swiss 2-column tabular comparison. Left column displays monochrome competitor revolving debt (`11.20%/mo`); right column displays Itaú Sob Medida (`1.69%/mo`) and semantic green contract savings of `R$ 14.280,00`.
11. **`TravelShieldCard`** (`travel_shield_agent`):
    - Fraud defense confirmation card. Registers active travel notice for Portugal & Spain, elevates daily international POS limit to `R$ 50.000,00`, and pre-suppresses false-positive declines.

---

## 4. Color Palette & Token System

| Token Name | Hex Code | Role & Usage Rule |
|:---|:---|:---|
| **Itaú Core Orange** | `#FF6423` | Primary brand accent, mic active pulse, active sub-agent badge, primary CTAs |
| **Itaú Dark Orange** | `#D2531C` | Hover & active pressed state for primary buttons |
| **Obsidian Black** | `#070707` | Deepest canvas background (Dark Mode) |
| **Charcoal Surface** | `#0D0D11` | Phone simulator hardware chassis & secondary containers |
| **Card Surface** | `#151518` | Dynamic Canvas cards and telemetry panels (`border-white/[0.08]`) |
| **Card Elevated** | `#1C1C22` | Floating bottom toolbar and modal overlays |
| **Semantic Green** | `#059669` / `#10B981` | **Semantic only**: Net interest saved (`R$ 14.280,00`), confirmed status, yields |
| **Neutral Slate** | `#64748B` / `#94A3B8` | Competitor balances, comparison rows, graph nodes, and timestamps |

---

## 5. Voice & Persona Guidelines

| Dimension | Rule | Example / Pronunciation |
|:---|:---|:---|
| **Customer Honorific** | Always address cardholder by honorific + surname | `"Mr. Silva"` (EN) / `"Sr. Silva"` (PT). Never use "Roberto". |
| **Currency** | Never convert or say "dollars" | Say **"Reais"** (`ray-ICE` / `he-ICE`) or **"Real"** (`ray-AL`). |
| **Brand Pronunciation** | Exact phonetic clarity | `"ee-tah-OO"` and `"pehr-soh-nah-lee-TAY"`. |
| **Tone** | Executive, calm, discreet, proactive | No slang, no filler words, maximum 2–3 sentences per voice turn. |
| **Directness** | Answer balance questions immediately | Do not stall with questionnaires. State checking balance and coverage directly on turn 1. |

---

## 6. Strict Brand Guardrails

### DO:
- Maintain strict contrast: white text on dark surfaces, charcoal text on light surfaces.
- Use `JetBrains Mono` with tabular numerals (`tnum`) for all currency figures, rates, and timestamps.
- Restrict semantic green exclusively to affirmative status, interest savings, and positive investment spreads.
- Keep UI cards completely dismissible via standard close targets.

### DON'T:
- **NO BLUE**: Do not use blue (`#003399`, `#3B82F6`, `#2563EB`) in any buttons, links, backgrounds, or graphs.
- **NO PURPLE**: Do not use purple or violet in scenario badges or telemetry.
- **NO POPUPS**: Do not trigger sliding push toasts or banner popups over the smartphone interface.
- **NO CLARIFICATION MENUS**: Do not display multiple-choice questionnaires when the client asks for their balance.
