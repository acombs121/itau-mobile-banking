# Banco Itaú — Official Proprietary Typeface Integration

## Overview
The official Itaú brand typefaces (**Itaú Display** and **Itaú Text**) are proprietary corporate assets designed for Itaú Unibanco by **Pentagram** (Marina Willer), **Fábio Lopez**, and **Plau** (with historical foundational versions by **Dalton Maag**).

Because they are proprietary corporate intellectual property, they cannot be hosted on public open-source CDNs (such as Google Fonts).

## Automatic Loading Methods

The application has been configured with native `@font-face` declarations supporting two automatic loading methods:

### Method 1: System-Installed Fonts (Zero Setup)
If you are an Itaú employee, designer, or agency partner with the official fonts installed on your operating system (`/Library/Fonts` on macOS or `C:\Windows\Fonts` on Windows), the app will **automatically detect and render them** via:
- `local('Itau Display Bold')`, `local('ItauDisplay-Bold')`, `local('Itau Display')`
- `local('Itau Text Regular')`, `local('ItauText-Regular')`, `local('Itau Text')`

### Method 2: Drop-in Web Fonts
If you have the webfont files (`.woff2` or `.woff`) from your Itaú Brand Portal or Figma assets, drop them directly into this folder (`frontend/public/fonts/`):

- `ItauDisplay-Bold.woff2` (Display Headings & Numbers)
- `ItauDisplay-Black.woff2` (Ultra-heavy display & logo)
- `ItauText-Regular.woff2` (UI Body & Controls)
- `ItauText-Medium.woff2` (Subheadings & Labels)
- `ItauText-Bold.woff2` (Emphasized UI & Buttons)

Once dropped into this folder, Vite and the browser will automatically serve and apply them across the entire app without requiring any code changes.

## Fallback Stack
When the proprietary Itaú font files are not installed, the application falls back gracefully to:
1. `'Inter'` (Metric-matched geometric neo-grotesque)
2. `'Plus Jakarta Sans'`
3. System fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
