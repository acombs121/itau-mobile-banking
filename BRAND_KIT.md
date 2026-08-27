# Banco Itaú — Brand Kit & Design System
**Version:** 2.0 (Swiss Executive Banking Edition)  
**Segment:** Itaú Personnalité & Itaú Empresas (AI Autonomous Concierge)

---

## 1. Brand Identity & Positioning

Banco Itaú is Latin America’s premier private financial institution. The **Itaú Personnalité** brand represents high-net-worth wealth management, while **Itaú Empresas** represents corporate and commercial banking.

### Core Visual Principles
1. **Swiss Financial Precision**: Minimalist, high-density tabular data, rigorous grid alignment, zero text wrapping, and mathematical centering.
2. **Restraint Over Decoration**: No arbitrary decorative gradients, no gratuitous glow effects, and strictly restrained color usage.
3. **Semantic Color Exclusivity**:
   - **Itaú Orange (`#FF6423`)**: Brand signature, active controls, primary focus states, and primary CTAs.
   - **Semantic Green (`#059669` / `#10B981`)**: Strictly reserved for savings, positive yields, confirmed states, and security affirmations.
   - **Zero Secondary Blues or Purples**: Competitor figures, neutral nodes, and structural borders must use monochrome slate neutrals (`#64748B`, `#334155`, `#1E293B`).

---

## 2. Color Palette & Token System

### Core Palette

| Token | Hex | RGB | Tailwind Class | Role & Usage Rule |
|:---|:---|:---|:---|:---|
| **Itaú Core Orange** | `#FF6423` | `rgb(255, 100, 35)` | `bg-brand-orange` / `text-brand-orange` | Primary brand accent, mic active pulse, active sub-agent badge |
| **Itaú Orange Dark** | `#D2531C` | `rgb(210, 83, 28)` | `bg-brand-orange-dark` | Hover & active pressed state for primary buttons |
| **Obsidian Black** | `#070707` | `rgb(7, 7, 7)` | `bg-[#070707]` | Deepest canvas background (Dark Mode) |
| **Charcoal Surface** | `#0D0D11` | `rgb(13, 13, 17)` | `bg-[#0D0D11]` | Phone shell and secondary panels |
| **Card Surface Dark** | `#151518` | `rgb(21, 21, 24)` | `bg-[#151518]` | Translucent structural cards, cockpit containers |
| **Card Surface Elevated** | `#1C1C22` | `rgb(28, 28, 34)` | `bg-[#1C1C22]` | Floating bottom bar, modal overlays |
| **Semantic Green** | `#059669` | `rgb(5, 150, 105)` | `text-emerald-500` / `bg-emerald-500/10` | **Semantic only**: Net interest saved, yields, confirmed status |
| **Semantic Green Light** | `#10B981` | `rgb(16, 185, 129)` | `text-emerald-400` | Bright highlight on dark cards (e.g. `R$ 14.280,00`) |
| **Neutral Slate High** | `#F8FAFC` | `rgb(248, 250, 252)` | `text-white` / `text-slate-100` | Primary text and headings |
| **Neutral Slate Medium** | `#94A3B8` | `rgb(148, 163, 184)` | `text-slate-400` | Secondary labels, descriptions, subheaders |
| **Neutral Slate Muted** | `#64748B` | `rgb(100, 116, 139)` | `text-slate-500` | Competitor debt balances, input nodes, timestamps |
| **Hairline Border** | `rgba(255,255,255,0.08)` | — | `border-white/[0.08]` | Thin hairline card borders and structural dividers |

---

## 3. Typography & Hierarchy

### Font Families
- **Primary Interface**: `'Inter', 'Arimo', -apple-system, BlinkMacSystemFont, sans-serif`
- **Financial Monospace**: `'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, monospace`

### Typographic Scale

| Role | Size | Weight | Tracking | Usage |
|:---|:---|:---|:---|:---|
| **Metric Hero** | `24px` / `1.5rem` | Bold (700) | `-0.02em` | Main account balance (`R$ 48.950,20`) |
| **Card Header** | `14px` / `0.875rem` | SemiBold (600) | `-0.01em` | Screen titles, card identification |
| **Monospace Tag** | `10.5px` / `0.65rem` | Bold (700) | `+0.05em` | `UPPERCASE` tags (`CHECKING ACCOUNT`, `OPEN FINANCE`) |
| **Body Copy** | `12px` / `0.75rem` | Regular (400) | `normal` | Explanatory sentences, telemetry notes |
| **Financial Figures**| `11px` / `0.6875rem`| SemiBold (600) | `font-mono` | Currency amounts, rates, credit limits |
| **Micro Caption** | `9.5px` / `0.6rem` | Medium (500) | `uppercase` | Section categories, timestamps, metadata |

---

## 4. Logo Construction & App Icons

### Square Icon (Vector SVG)
The Itaú symbol consists of a square with subtle rounded corners (`rx="20"` on a `100x100` viewBox) filled with `#FF6423`, featuring the iconic lowercase bold white wordmark `itau` centered at `50% / 62%`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
  <rect width="100" height="100" rx="20" fill="#FF6423"/>
  <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-weight="900" font-family="'Inter', sans-serif" font-size="42">itau</text>
</svg>
```

### Data URI Favicon
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23FF6423'/><text x='50%' y='62%' dominant-baseline='middle' text-anchor='middle' fill='%23FFFFFF' font-weight='900' font-family='sans-serif' font-size='42'>itau</text></svg>" />
```

---

## 5. UI Component Rules & Standards

### 1. In-Phone Dynamic Cards
- **Border Radius**: `rounded-[16px]` for top-level cards, `rounded-[10px]` for hero amount blocks, `rounded-[8px]` for tabular sub-items.
- **Card Surfaces**: Dark `#151518` with subtle `border-white/10` and `shadow-2xl`. Light mode uses pure `bg-white` with `border-slate-200`.
- **Close Button**: Standard top-right `X` button with 20x20 circular tap target.

### 2. Live Centered Audio Waveform (`AudioWaveformVisualizer`)
- **Mathematical Centering**: Wrapped in `absolute inset-0 flex items-center justify-center pointer-events-none z-10`.
- **Waveform Capsule**: Centered pill `h-6 px-3 bg-black/40 rounded-full border border-white/10`.
- **Bars**: 9 vertical bars with `transition: height 0.1s ease-in-out`. When speaking or listening, bars illuminate with `bg-brand-orange shadow-[0_0_8px_#FF6423]`. When idle, subdued to `bg-white/20`.

### 3. Open Finance 2-Column Tabular Comparison
- Competitor debt and rates must appear on the left in clean monochrome neutral tones (`#64748B` / `#94A3B8`).
- Itaú Sob Medida offer and Net Savings appear on the right with semantic emerald green highlights (`#059669` / `#10B981`).
- Zero wrapping: All labels and values must fit cleanly on a single line.

---

## 6. Voice & Persona Guidelines

| Dimension | Rule | Example / Pronunciation |
|:---|:---|:---|
| **Customer Honorific** | Always address cardholder by honorific + surname | `"Mr. Silva"` (EN) / `"Sr. Silva"` (PT). Never use "Roberto". |
| **Currency** | Never convert or say "dollars" | Say **"Reais"** (`ray-ICE` / `he-ICE`) or **"Real"** (`ray-AL`). |
| **Brand Pronunciation** | Exact phonetic clarity | `"ee-tah-OO"` and `"pehr-soh-nah-lee-TAY"`. |
| **Tone** | Executive, calm, discreet, proactive | No slang, no filler words, maximum 2–3 sentences per voice turn. |
| **Directness** | Answer balance questions immediately | Do not stall with questionnaires. State checking balance and coverage directly on turn 1. |

---

## 7. Do's and Don'ts

### DO:
- Maintain strict contrast: white text on dark surfaces, charcoal text on light surfaces.
- Use `font-mono` for all account numbers, currency figures, and rate percentages.
- Restrict semantic green exclusively to affirmative status, interest savings, and positive investment spreads.
- Keep UI cards completely dismissible via standard close targets.

### DON'T:
- **NO BLUE**: Do not use blue (`#003399`, `#3B82F6`, `#2563EB`) in any buttons, links, backgrounds, or graphs.
- **NO PURPLE**: Do not use purple or violet in scenario badges or telemetry.
- **NO POPUPS**: Do not trigger sliding push toasts or banner popups over the smartphone interface.
- **NO CLARIFICATION MENUS**: Do not display multiple-choice questionnaires when the client asks for their balance.
