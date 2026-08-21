## Overview
This design system recreates a high-contrast corporate financial portal characterized by vibrant brand orange accents, pitch-black dark hero sections, abstract particle wave visual motifs, and clean neutral body grids. It balances executive authority with modern digital aesthetics.

## Design Principles
1. **Concentrate Brand Color** — Restrict vibrant orange (#FF6423) to primary headers, key CTAs, and graphic accents to maintain visual power without causing eye fatigue.
2. **High-Contrast Dark Hero** — Frame hero metric announcements against deep black (#070707) surfaces to convey executive importance and technical polish.
3. **Translucent Structural Cards** — Group auxiliary navigation links into translucent thin-bordered cards to maintain visual order without competing with display copy.
4. **Structured Financial Grid** — Maintain strict grid alignment across header ribbons, metric tickers, and content blocks.

## Color
| Token | Hex | Role | Usage Rule |
| --- | --- | --- | --- |
| `--color-brand-orange` | `#FF6423` | Primary Accent | Navigation header background, primary CTAs, vector dots |
| `--color-hero-bg` | `#070707` | Background | Pitch-black background for hero section |
| `--color-body-bg` | `#F3F3F3` | Background | Off-white background for body section |
| `--color-text-main` | `#070707` | Text | Primary headings and text on light surfaces |
| `--color-text-inverse` | `#FFFFFF` | Text | Primary headings and text on dark surfaces |
| `--color-text-muted` | `#798B97` | Text | Secondary captions and ticker disclosures |
| `--color-card-border` | `rgba(255,255,255,0.2)` | Border | Hairline borders on dark hero cards |

## Typography
- **Font Family**: Inter, "Helvetica Neue", Arial, sans-serif

| Step | Size (px) | Size (rem) | Weight | Line Height | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | 48px | 3.0rem | Bold (700) | 1.1 | Main hero quarterly result headings |
| H1 | 32px | 2.0rem | Bold (700) | 1.2 | Section headings on body areas |
| H2 | 20px | 1.25rem | Bold (700) | 1.3 | Card title text |
| Body | 14px | 0.875rem | Regular (400) | 1.5 | Standard copy and descriptions |
| Caption | 12px | 0.75rem | Medium (500) | 1.4 | Ticker statistics and disclosures |

## Spacing & Layout
- **Base Unit**: 8px
- **Scale**: 8px, 16px, 24px, 32px, 48px, 64px
- **Grid**: 12-column responsive layout with 24px gutters.
- **Hero Split**: 7 columns (headline + CTA), 5 columns (stacked feature cards).

## Shape & Surface
- **Radius Scale**: Buttons = 4px, Cards = 8px.
- **Borders**: 1px subtle hairline borders (`#AEAEAE` or `rgba(255,255,255,0.2)`).
- **Shadows**: Flat elevation strategy; depth achieved through pitch-black contrast and background particle overlays.

## Components

### Main Navigation Header
- **Styling**: Solid background `#FF6423`, white text `#FFFFFF`, height 64px.
- **States**: Link hover opacity 85%.

### Primary CTA Button
- **Styling**: Background `#FF6423`, text `#FFFFFF`, padding 12px 24px, border-radius 4px, weight bold.
- **States**: Hover background `#D2531C`, active scale 0.98.

### Translucent Quick-Link Card
- **Styling**: Background `rgba(0,0,0,0.4)`, border 1px solid `rgba(255,255,255,0.2)`, radius 8px, padding 20px.
- **States**: Hover border `rgba(255,255,255,0.5)`, background `rgba(255,255,255,0.05)`.

## Motion
- Fast crisp transitions (150ms ease-out) for card hovers and button interactions.
- Optional continuous horizontal auto-scroll for live stock ticker ribbon.

## Accessibility
- Minimum contrast ratio 4.5:1 on all text elements.
- Keyboard focus ring: 2px solid `#FF6423` with 2px offset.
- Interactive cards must have accessible ARIA role="link" and focus indicator.

## Inferred Details
- Dark Mode: Unobserved (Hero is inherently dark, body is light).
- Form Controls: Inferred as 1px grey bordered inputs with 4px border radius on light backgrounds.
- Mobile Breakpoints: At <768px, hero 12-column split stacks vertically with cards below display headline.

## Do / Don't
- **DO** use exact Itaú brand orange (`#FF6423`) for main navigation and key triggers.
- **DO** keep background cards in hero semi-translucent with subtle thin white borders.
- **DON'T** introduce secondary bright accent colors like electric blue or magenta.
- **DON'T** use fully rounded pill buttons — strictly enforce 4px subtle rounded corners.

```css
:root {
  --color-brand-orange: #FF6423;
  --color-hero-bg: #070707;
  --color-body-bg: #F3F3F3;
  --color-text-main: #070707;
  --color-text-inverse: #FFFFFF;
  --color-text-muted: #798B97;
  --color-card-border: rgba(255, 255, 255, 0.2);
  --font-sans: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --radius-button: 4px;
  --radius-card: 8px;
  --spacing-base: 8px;
}
```