export interface BrandingProfile {
  id: string;
  name: string;
  brandSubtitle: string;
  tagline?: string;
  primaryColor: string;
  primaryColorHover?: string;
  secondaryTextColor: string;
  accentColor?: string;
  headerBgColor?: string;
  logoUrl?: string;
  logoOnly?: boolean;
  lightHeader?: boolean;
  logoScale?: number;
  logoX?: number;
  logoY?: number;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface AdminConfig {
  execution_mode: 'hybrid' | 'live' | 'simulated';
  is_live_connection: boolean;
  gemini_model: string;
  gcp_project: string;
  gcp_region: string;
  simulated_step_delay_ms: number;
}

// Pre-packaged high-fidelity SVG logos for presets
const LOGO_NUBANK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="28" fill="%23FFFFFF" letter-spacing="-1.5">nu</text></svg>`;

const LOGO_SANTANDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 40"><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="800" font-size="22" fill="%23FFFFFF" letter-spacing="-0.5">Santander</text></svg>`;

const LOGO_BRADESCO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="800" font-size="22" fill="%23FFFFFF" letter-spacing="-0.5">bradesco</text></svg>`;

const LOGO_BB = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40"><rect width="140" height="40" rx="6" fill="%23FCDE00"/><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="24" fill="%23003DA5" letter-spacing="-1">BB</text></svg>`;

const LOGO_BTG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 40"><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="20" fill="%23FFFFFF" letter-spacing="1">BTG PACTUAL</text></svg>`;

const LOGO_CYMBAL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 40"><circle cx="20" cy="20" r="14" fill="%23009E25"/><circle cx="20" cy="20" r="7" fill="%23FFFFFF"/><text x="105" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="800" font-size="20" fill="%23FFFFFF">CYMBAL</text></svg>`;

export const DEFAULT_BRAND_PROFILES: BrandingProfile[] = [
  {
    id: 'itau',
    name: 'Itaú Unibanco',
    brandSubtitle: 'Multi-Agent Concierge & Alerts',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Itaú Unibanco',
    primaryColor: '#FF6423',
    primaryColorHover: '#D2531C',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#002D62',
    logoUrl: undefined,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'nubank',
    name: 'Nubank',
    brandSubtitle: 'Concierge Inteligente & Alertas',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Nubank Ultravioleta',
    primaryColor: '#820AD1',
    primaryColorHover: '#6D08B0',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#B056EE',
    logoUrl: LOGO_NUBANK,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'santander',
    name: 'Banco Santander',
    brandSubtitle: 'Santander Select & Alertas',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Banco Santander Brasil',
    primaryColor: '#EC0000',
    primaryColorHover: '#C40000',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#CC0000',
    logoUrl: LOGO_SANTANDER,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'bradesco',
    name: 'Banco Bradesco',
    brandSubtitle: 'Bradesco Prime Concierge',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Banco Bradesco',
    primaryColor: '#CC092F',
    primaryColorHover: '#A80726',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#8A061F',
    logoUrl: LOGO_BRADESCO,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'banco-do-brasil',
    name: 'Banco do Brasil',
    brandSubtitle: 'BB Estilo Concierge & Alertas',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Banco do Brasil S.A.',
    primaryColor: '#003DA5',
    primaryColorHover: '#002E7A',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#FCDE00',
    logoUrl: LOGO_BB,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'btg-pactual',
    name: 'BTG Pactual',
    brandSubtitle: 'BTG Private & Wealth Concierge',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • BTG Pactual',
    primaryColor: '#001E62',
    primaryColorHover: '#001444',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#1B3B8A',
    logoUrl: LOGO_BTG,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  },
  {
    id: 'cymbal-bank',
    name: 'Cymbal Bank',
    brandSubtitle: 'Autonomous Concierge & Alerts',
    tagline: 'Multi-Agent Banking & Concierge Intelligence • Powered by Google Cloud',
    primaryColor: '#009E25',
    primaryColorHover: '#007D1E',
    secondaryTextColor: '#FFFFFF',
    accentColor: '#1A73E8',
    logoUrl: LOGO_CYMBAL,
    logoOnly: false,
    lightHeader: false,
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    creator: 'system'
  }
];

export const COLOR_PALETTE_PRESETS = [
  { name: 'Itaú Digital Orange', hex: '#FF6423' },
  { name: 'Nubank Purple', hex: '#820AD1' },
  { name: 'Santander Crimson', hex: '#EC0000' },
  { name: 'Bradesco Scarlet', hex: '#CC092F' },
  { name: 'Banco do Brasil Navy', hex: '#003DA5' },
  { name: 'BTG Deep Navy', hex: '#001E62' },
  { name: 'Cymbal Forest Green', hex: '#009E25' },
  { name: 'Google Cloud Blue', hex: '#1A73E8' },
  { name: 'Emerald Fintech', hex: '#059669' },
  { name: 'Dark Slate Charcoal', hex: '#1F2937' }
];
