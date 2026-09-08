import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BrandingProfile, DEFAULT_BRAND_PROFILES } from '../types/brand';

interface BrandContextType {
  activeBrand: BrandingProfile;
  brandProfiles: BrandingProfile[];
  selectBrand: (id: string) => void;
  saveBrand: (profile: Omit<BrandingProfile, 'id'> & { id?: string }) => BrandingProfile;
  deleteBrand: (id: string) => void;
  resetToDefault: () => void;
  exportBrandJson: () => string;
  importBrandJson: (jsonString: string) => boolean;
  templatize: (text: string) => string;
  updateActiveBrandLogo: (logoUrl: string | undefined, scale?: number, x?: number, y?: number) => BrandingProfile;
  resetActiveBrandLogo: () => BrandingProfile;
  updateActiveBrandLightHeader: (lightHeader: boolean) => BrandingProfile;
  syncAllToCloud: () => Promise<{ success: boolean; count: number; message: string }>;
  cloudSyncStatus: { isSyncing: boolean; lastSyncedAt: string | null; error: string | null };
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const STORAGE_ACTIVE_KEY = 'itau_active_brand_id';
const STORAGE_CUSTOM_BRANDS_KEY = 'itau_custom_brands';

export const getBrandAccountPrefix = (brandId: string): string => {
  const map: Record<string, string> = {
    'itau': 'ITAU',
    'btg': 'BTG',
    'btg-pactual': 'BTG',
    'santander': 'SAN',
    'bradesco': 'BBD',
    'nubank': 'NU',
    'banco-do-brasil': 'BB',
    'bb': 'BB',
    'cymbal-bank': 'CYMBAL',
    'inter': 'INTER',
    'c6': 'C6',
    'safra': 'SAFRA',
    'xp': 'XP'
  };
  return map[brandId.toLowerCase()] || brandId.replace(/-bank$/i, '').toUpperCase();
};

export const getBrandSegment = (brand: BrandingProfile): string => {
  const bId = brand.id.toLowerCase();
  if (bId === 'itau') return 'Itaú Personnalité';
  if (bId.includes('btg')) return 'BTG Pactual Private';
  if (bId.includes('nubank')) return 'Nubank Ultravioleta';
  if (bId.includes('santander')) return 'Santander Select';
  if (bId.includes('bradesco')) return 'Bradesco Prime';
  if (bId.includes('brasil') || bId === 'bb') return 'BB Estilo';
  if (bId.includes('cymbal')) return 'Cymbal Private Wealth';
  return `${brand.name.replace(/^Banco\s+/i, '')} Private`;
};

/**
 * Dynamic brand string replacer.
 * If active brand is Itaú, returns text untouched.
 * Otherwise, cleanly substitutes all occurrences of Itaú variants
 * with the active brand's name, short name, segment, or upper-cased identity.
 */
export function templatizeBrandText(text: string, brand: BrandingProfile): string {
  if (!text || typeof text !== 'string') return text;

  const brandName = brand.name;
  const brandShort = brand.name.replace(/^Banco\s+/i, '');
  const brandUpper = brand.name.toUpperCase();
  const brandIdUpper = getBrandAccountPrefix(brand.id);
  const brandSegment = getBrandSegment(brand);
  const brandSegmentShort = brandSegment.replace(new RegExp(`^${brandShort}\\s+`, 'i'), '');

  let res = text
    .replace(/\{\{BRAND_NAME\}\}/g, brandName)
    .replace(/\{\{BRAND_SHORT\}\}/g, brandShort)
    .replace(/\{\{BRAND_UPPER\}\}/g, brandUpper)
    .replace(/\{\{BRAND_ID\}\}/g, brandIdUpper)
    .replace(/\{\{BRAND_SEGMENT\}\}/g, brandSegment)
    .replace(/\{\{BRAND_SEGMENT_SHORT\}\}/g, brandSegmentShort);

  if (brand.id === 'itau') return res;

  // Invert external competitor mentions so the active brand is never listed as a competitor
  if (brand.id.includes('btg')) {
    res = res
      .replace(/BTG Pactual \(R\$ 120k\) \+ XP Investimentos \(R\$ 210k\)/g, 'Banco Itaú (R$ 120k) + XP Investimentos (R$ 210k)')
      .replace(/BTG \(R\$ 120k\) \+ XP \(R\$ 210k\)/g, 'Itaú (R$ 120k) + XP (R$ 210k)')
      .replace(/BTG R\$ 120k \+ XP R\$ 210k/g, 'Itaú R$ 120k + XP R$ 210k')
      .replace(/\(BTG R\$ 120k \+ XP R\$ 210k\)/g, '(Itaú R$ 120k + XP R$ 210k)')
      .replace(/BTG Pactual e XP Investimentos/g, 'Itaú Unibanco e XP Investimentos')
      .replace(/BTG Pactual e XP/g, 'Itaú e XP')
      .replace(/BTG e XP/g, 'Itaú e XP')
      .replace(/BTG Pactual and XP Investimentos/g, 'Itaú Unibanco and XP Investimentos')
      .replace(/BTG Pactual and XP/g, 'Itaú and XP')
      .replace(/BTG and XP/g, 'Itaú and XP');
  } else {
    res = res
      .replace(/BTG Pactual \(R\$ 120k\) \+ XP Investimentos \(R\$ 210k\)/g, 'Banco Itaú (R$ 120k) + BTG Pactual (R$ 210k)')
      .replace(/BTG \(R\$ 120k\) \+ XP \(R\$ 210k\)/g, 'Itaú (R$ 120k) + BTG (R$ 210k)')
      .replace(/BTG R\$ 120k \+ XP R\$ 210k/g, 'Itaú R$ 120k + BTG R$ 210k')
      .replace(/\(BTG R\$ 120k \+ XP R\$ 210k\)/g, '(Itaú R$ 120k + BTG R$ 210k)')
      .replace(/BTG Pactual e XP Investimentos/g, 'Itaú Unibanco e BTG Pactual')
      .replace(/BTG Pactual e XP/g, 'Itaú e BTG Pactual')
      .replace(/BTG e XP/g, 'Itaú e BTG Pactual')
      .replace(/BTG Pactual and XP Investimentos/g, 'Itaú Unibanco and BTG Pactual')
      .replace(/BTG Pactual and XP/g, 'Itaú and BTG Pactual')
      .replace(/BTG and XP/g, 'Itaú and BTG Pactual');
  }

  return res
    .replace(/Banco Itaú Unibanco S\.A\./g, `${brandName} S.A.`)
    .replace(/Banco Itaú Unibanco \(341\)/g, brandName)
    .replace(/Banco Itaú Unibanco/g, brandName)
    .replace(/BANCO ITAÚ UNIBANCO \(341\)/g, brandUpper)
    .replace(/BANCO ITAÚ UNIBANCO/g, brandUpper)
    .replace(/BANCO ITAÚ/g, brandUpper)
    .replace(/Banco Itaú/g, brandName)
    .replace(/Itaú Unibanco/g, brandName)
    .replace(/ITAÚ UNIBANCO/g, brandUpper)
    .replace(/AVALIAÇÃO AVM ITAÚ/g, `AVALIAÇÃO AVM ${brandUpper}`)
    .replace(/ITAU-7749-00912/g, `${brandIdUpper}-7749-00912`)
    .replace(/#ITAU-2026-/g, `#${brandIdUpper}-2026-`)
    .replace(/CCB-ITAU-2026-/g, `CCB-${brandIdUpper}-2026-`)
    .replace(/CCB-2026-ITAU-/g, `CCB-2026-${brandIdUpper}-`)
    .replace(/2026-ITAU-/g, `2026-${brandIdUpper}-`)
    .replace(/Itaú Personnalité Mastercard Black/g, `${brandShort} Mastercard Black`)
    .replace(/Itaú Personnalité/g, brandSegment)
    .replace(/ITAÚ PERSONNALITÉ/g, brandSegment.toUpperCase())
    .replace(/\(Personnalité\)/g, `(${brandSegmentShort})`)
    .replace(/Rating Personnalité/g, `Rating ${brandSegmentShort}`)
    .replace(/Personnalité Rating/g, `${brandSegmentShort} Rating`)
    .replace(/Itaú Empresas/g, `${brandShort} Empresas`)
    .replace(/Itaú Uniclass/g, `${brandShort} Prime`)
    .replace(/Itaú Seguros/g, `${brandShort} Seguros`)
    .replace(/SuperApp Itaú/g, `SuperApp ${brandShort}`)
    .replace(/Comitê de Crédito Itaú/g, `Comitê de Crédito ${brandName}`)
    .replace(/Política de Crédito Itaú/g, `Política de Crédito ${brandName}`)
    .replace(/conta corrente Itaú/g, `conta corrente ${brandName}`)
    .replace(/Itaú checking account/g, `${brandName} checking account`)
    .replace(/Itaú Secured Lending/g, `${brandName} Secured Lending`)
    .replace(/Itaú Crédito Imobiliário/g, `${brandName} Crédito Imobiliário`)
    .replace(/Segurança Banco Itaú/g, `Segurança ${brandName}`)
    .replace(/Banco Itaú 256-bit Security/g, `${brandName} 256-bit Security`)
    .replace(/Why Choose Itaú Home Equity\?/g, `Why Choose ${brandName} Home Equity?`)
    .replace(/Por que escolher o Crédito com Garantia Itaú\?/g, `Por que escolher o Crédito com Garantia ${brandName}?`)
    .replace(/para o Itaú/g, `para ${brandName}`)
    .replace(/com o Itaú/g, `com ${brandName}`)
    .replace(/no Itaú/g, `no ${brandName}`)
    .replace(/with Itaú/g, `with ${brandName}`)
    .replace(/Itaú Concierge Live/g, `${brandShort} Concierge Live`)
    .replace(/Itaú Concierge/g, `${brandShort} Concierge`)
    .replace(/ITAÚ CONCIERGE/g, `${brandUpper} CONCIERGE`)
    .replace(/Itaú Sob Medida/g, `${brandShort} Sob Medida`)
    .replace(/Itaú CDB DI/g, `${brandShort} CDB DI`)
    .replace(/CDB DI Itaú/g, `CDB DI ${brandShort}`)
    .replace(/Crédito Itaú/g, `Crédito ${brandShort}`)
    .replace(/Itaú Credit/g, `${brandShort} Credit`)
    .replace(/Total Liquid Balance with Itaú/gi, `Total Liquid Balance with ${brandShort}`)
    .replace(/Saldo Total no Banco Itaú/gi, `Saldo Total no ${brandName}`)
    .replace(/New Itaú Liquid Total/gi, `New ${brandShort} Liquid Total`)
    .replace(/Novo Patrimônio Total Itaú/gi, `Novo Patrimônio Total ${brandShort}`)
    .replace(/Total Itaú/g, `Total ${brandShort}`)
    .replace(/Tipografia Itaú/g, `Tipografia ${brandShort}`)
    .replace(/Tipografia oficial Itaú/g, `Tipografia oficial ${brandShort}`)
    .replace(/(?<![-_])\bITAÚ\b(?![-_])/g, brandUpper)
    .replace(/(?<![-_])\bItaú\b(?![-_])/g, brandName)
    .replace(/(?<![-_])\bItau\b(?![-_])/g, brandName);
}

/**
 * Deeply templatize nested translation or data objects, including JSON keys and values.
 */
export function templatizeBrandObject<T>(obj: T, brand: BrandingProfile): T {
  if (!obj) return obj;
  if (brand.id === 'itau') {
    if (typeof obj === 'string') {
      return (obj.includes('{{BRAND_') ? templatizeBrandText(obj, brand) : obj) as unknown as T;
    }
    const str = typeof obj === 'object' ? JSON.stringify(obj) : '';
    if (!str.includes('{{BRAND_')) return obj;
  }
  if (typeof obj === 'string') {
    return templatizeBrandText(obj, brand) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => templatizeBrandObject(item, brand)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: any = {};
    const brandKeyPrefix = getBrandAccountPrefix(brand.id).toLowerCase();
    for (const [key, value] of Object.entries(obj)) {
      let cleanKey = key;
      if (brand.id !== 'itau') {
        cleanKey = cleanKey
          .replace(/^itau_/i, `${brandKeyPrefix}_`)
          .replace(/_itau_/i, `_${brandKeyPrefix}_`)
          .replace(/_itau$/i, `_${brandKeyPrefix}`);
      }
      cleanKey = templatizeBrandText(cleanKey, brand);
      result[cleanKey] = templatizeBrandObject(value, brand);
    }
    return result;
  }
  return obj;
}

// Convert hex color to RGB string format (e.g. "255 100 35") for CSS variable alpha channel support
export function hexToRgb(hex: string): string {
  try {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r} ${g} ${b}`;
  } catch {
    return '255 100 35';
  }
}

// Helper to compute a darker hover shade for buttons
function computeHoverColor(hex: string): string {
  try {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    let r = (num >> 16) - 30;
    let g = ((num >> 8) & 0x00ff) - 25;
    let b = (num & 0x0000ff) - 20;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

/**
 * Cloud persistence helpers.
 * Optimistically called in background to sync with Google Cloud Datastore / Firestore.
 */
async function syncBrandToCloud(profile: BrandingProfile): Promise<void> {
  try {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) {
      console.warn(`[BrandSync] Cloud save returned HTTP ${res.status} for ${profile.id}`);
    }
  } catch (err) {
    console.warn(`[BrandSync] Network error saving brand ${profile.id}:`, err);
  }
}

async function deleteBrandFromCloud(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      console.warn(`[BrandSync] Cloud delete returned HTTP ${res.status} for ${id}`);
    }
  } catch (err) {
    console.warn(`[BrandSync] Network error deleting brand ${id}:`, err);
  }
}

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load custom brands from localStorage
  const [customBrands, setCustomBrands] = useState<BrandingProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_BRANDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load custom brands from localStorage', e);
    }
    return [];
  });

  const customBrandsRef = useRef<BrandingProfile[]>(customBrands);
  useEffect(() => {
    customBrandsRef.current = customBrands;
  }, [customBrands]);

  // Synchronize customBrands to localStorage whenever it changes (after initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_CUSTOM_BRANDS_KEY, JSON.stringify(customBrands));
    } catch (e) {
      console.warn('Failed to persist custom brands to localStorage', e);
    }
  }, [customBrands]);

  // Background two-way synchronization with Google Cloud Datastore / Firestore
  useEffect(() => {
    let isMounted = true;

    async function syncWithCloud() {
      try {
        const res = await fetch('/api/brands');
        if (!res.ok) {
          console.warn('[BrandSync] Could not fetch brands from cloud:', res.status);
          return;
        }

        const data = await res.json();
        const serverProfiles: BrandingProfile[] = Array.isArray(data.profiles) ? data.profiles : [];

        if (!isMounted) return;

        const prevLocal = customBrandsRef.current;
        const mergedMap = new Map<string, BrandingProfile>();

        // 1. Index current local custom brands
        for (const localBrand of prevLocal) {
          mergedMap.set(localBrand.id, localBrand);
        }

        // 2. Merge server profiles
        for (const serverBrand of serverProfiles) {
          // Default unedited Itaú is part of standard presets; skip putting as custom
          const isDefaultItau = serverBrand.id === 'itau' &&
            !serverBrand.isCustom &&
            !serverBrand.logoUrl &&
            (!serverBrand.primaryColor || serverBrand.primaryColor === '#FF6423');

          if (isDefaultItau) continue;

          const existingLocal = mergedMap.get(serverBrand.id);
          if (!existingLocal) {
            // Discovered brand from cloud (e.g. from another session or device)
            mergedMap.set(serverBrand.id, serverBrand);
          } else {
            // Both exist: compare update timestamps
            const serverTime = serverBrand.updatedAt ? new Date(serverBrand.updatedAt).getTime() : 0;
            const localTime = existingLocal.updatedAt ? new Date(existingLocal.updatedAt).getTime() : 0;
            if (serverTime >= localTime) {
              mergedMap.set(serverBrand.id, serverBrand);
            }
          }
        }

        const mergedList = Array.from(mergedMap.values());

        // 3. Upload any local custom profiles that don't exist on server yet (or are newer)
        const toUpload = prevLocal.filter(localBrand => {
          const serverMatch = serverProfiles.find(s => s.id === localBrand.id);
          if (!serverMatch) return true;
          const serverTime = serverMatch.updatedAt ? new Date(serverMatch.updatedAt).getTime() : 0;
          const localTime = localBrand.updatedAt ? new Date(localBrand.updatedAt).getTime() : 0;
          return localTime > serverTime;
        });

        if (toUpload.length > 0) {
          fetch('/api/brands/sync-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profiles: toUpload })
          }).catch(err => console.warn('[BrandSync] Batch sync to cloud error:', err));
        }

        setCustomBrands(mergedList);
      } catch (e) {
        console.warn('[BrandSync] Background cloud sync error:', e);
      }
    }

    syncWithCloud();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize all profiles: custom brands override matching default presets
  const allProfiles: BrandingProfile[] = useMemo(() => {
    const mergedDefaults = DEFAULT_BRAND_PROFILES.map(def => {
      const customOverride = customBrands.find(c => c.id === def.id);
      return customOverride ? { ...def, ...customOverride } : def;
    });

    const brandNewCustoms = customBrands.filter(
      c => !DEFAULT_BRAND_PROFILES.some(def => def.id === c.id)
    );

    return [...mergedDefaults, ...brandNewCustoms];
  }, [customBrands]);

  // Load active brand ID from localStorage
  const [activeBrandId, setActiveBrandId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (stored) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to load active brand from localStorage', e);
    }
    return 'itau';
  });

  const activeBrand = useMemo(() => {
    return allProfiles.find(p => p.id === activeBrandId) || allProfiles[0] || DEFAULT_BRAND_PROFILES[0];
  }, [allProfiles, activeBrandId]);

  // Synchronize CSS variables and dynamic document metadata
  useEffect(() => {
    const root = document.documentElement;
    const primary = activeBrand.primaryColor || '#FF6423';
    const primaryHover = activeBrand.primaryColorHover || computeHoverColor(primary);
    const secondary = activeBrand.accentColor || '#002D62';

    root.style.setProperty('--brand-orange', primary);
    root.style.setProperty('--brand-orange-rgb', hexToRgb(primary));
    root.style.setProperty('--brand-orange-hover', primaryHover);
    root.style.setProperty('--brand-orange-hover-rgb', hexToRgb(primaryHover));
    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-primary-hover', primaryHover);
    root.style.setProperty('--brand-secondary', secondary);
    root.style.setProperty('--brand-header-bg', activeBrand.lightHeader ? '#FFFFFF' : primary);
    root.style.setProperty('--brand-header-text', activeBrand.lightHeader ? '#070707' : (activeBrand.secondaryTextColor || '#FFFFFF'));
    root.style.setProperty('--brand-glow-sm', `0 0 8px ${primary}`);
    root.style.setProperty('--brand-glow-md', `0 0 16px ${primary}`);
    root.style.setProperty('--brand-glow-lg', `0 0 24px ${primary}`);

    // Dynamic document title
    if (activeBrand.id === 'itau') {
      document.title = 'Banco Itaú — Mobile Banking & Proactive Alerts';
    } else {
      document.title = `${activeBrand.name} — ${activeBrand.brandSubtitle || 'Mobile Banking & Proactive Alerts'}`;
    }

    // Dynamic favicon update if custom logo provided
    if (activeBrand.logoUrl) {
      const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (existingFavicon) {
        existingFavicon.href = activeBrand.logoUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = activeBrand.logoUrl;
        document.head.appendChild(newFavicon);
      }
    }
  }, [activeBrand]);

  const selectBrand = useCallback((id: string) => {
    setActiveBrandId(id);
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, id);
    } catch (e) {
      console.warn('Failed to persist active brand id', e);
    }
  }, []);

  const saveBrand = useCallback((profileData: Omit<BrandingProfile, 'id'> & { id?: string }): BrandingProfile => {
    const id = profileData.id || `custom-${Date.now()}`;
    const newProfile: BrandingProfile = {
      ...profileData,
      id,
      isCustom: true,
      primaryColorHover: profileData.primaryColorHover || computeHoverColor(profileData.primaryColor),
      updatedAt: new Date().toISOString(),
      createdAt: profileData.createdAt || new Date().toISOString()
    };

    setCustomBrands(prev => {
      const existsIndex = prev.findIndex(p => p.id === id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newProfile;
        return updated;
      }
      return [...prev, newProfile];
    });

    selectBrand(id);

    // Persist to Google Cloud Datastore / Firestore in background
    syncBrandToCloud(newProfile);

    return newProfile;
  }, [selectBrand]);

  const deleteBrand = useCallback((id: string) => {
    setCustomBrands(prev => prev.filter(p => p.id !== id));

    if (activeBrandId === id) {
      selectBrand('itau');
    }

    // Delete from Google Cloud Datastore / Firestore in background
    deleteBrandFromCloud(id);
  }, [activeBrandId, selectBrand]);

  const resetToDefault = useCallback(() => {
    // Clear custom override for itau so pristine preset is restored
    setCustomBrands(prev => prev.filter(p => p.id !== 'itau'));
    selectBrand('itau');

    // Reset default in Google Cloud Datastore / Firestore
    deleteBrandFromCloud('itau');
  }, [selectBrand]);

  const updateActiveBrandLogo = useCallback((logoUrl: string | undefined, scale?: number, x?: number, y?: number): BrandingProfile => {
    const updatedProfile: BrandingProfile = {
      ...activeBrand,
      logoUrl,
      logoScale: scale !== undefined ? scale : (activeBrand.logoScale ?? 100),
      logoX: x !== undefined ? x : (activeBrand.logoX ?? 0),
      logoY: y !== undefined ? y : (activeBrand.logoY ?? 0),
      updatedAt: new Date().toISOString()
    };
    return saveBrand(updatedProfile);
  }, [activeBrand, saveBrand]);

  const resetActiveBrandLogo = useCallback((): BrandingProfile => {
    const defaultProfile = DEFAULT_BRAND_PROFILES.find(d => d.id === activeBrand.id);
    const originalLogoUrl = defaultProfile ? defaultProfile.logoUrl : undefined;
    const originalScale = defaultProfile ? (defaultProfile.logoScale ?? 100) : 100;
    const originalX = defaultProfile ? (defaultProfile.logoX ?? 0) : 0;
    const originalY = defaultProfile ? (defaultProfile.logoY ?? 0) : 0;

    const updatedProfile: BrandingProfile = {
      ...activeBrand,
      logoUrl: originalLogoUrl,
      logoScale: originalScale,
      logoX: originalX,
      logoY: originalY,
      updatedAt: new Date().toISOString()
    };

    const isNowPristine = !!defaultProfile &&
      activeBrand.name === defaultProfile.name &&
      activeBrand.primaryColor === defaultProfile.primaryColor &&
      activeBrand.accentColor === defaultProfile.accentColor &&
      activeBrand.lightHeader === defaultProfile.lightHeader;

    if (isNowPristine) {
      setCustomBrands(prev => prev.filter(p => p.id !== activeBrand.id));
      deleteBrandFromCloud(activeBrand.id);
      return defaultProfile;
    }

    return saveBrand(updatedProfile);
  }, [activeBrand, saveBrand]);

  const updateActiveBrandLightHeader = useCallback((lightHeader: boolean): BrandingProfile => {
    const updatedProfile: BrandingProfile = {
      ...activeBrand,
      lightHeader,
      updatedAt: new Date().toISOString()
    };
    return saveBrand(updatedProfile);
  }, [activeBrand, saveBrand]);

  const exportBrandJson = useCallback(() => {
    return JSON.stringify({
      activeBrand,
      customBrands
    }, null, 2);
  }, [activeBrand, customBrands]);

  const importBrandJson = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.customBrands)) {
          setCustomBrands(parsed.customBrands);
          localStorage.setItem(STORAGE_CUSTOM_BRANDS_KEY, JSON.stringify(parsed.customBrands));
          for (const brand of parsed.customBrands) {
            syncBrandToCloud(brand);
          }
        } else if (parsed.id && parsed.name && parsed.primaryColor) {
          saveBrand(parsed);
        }
        if (parsed.activeBrand?.id) {
          selectBrand(parsed.activeBrand.id);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to import brand JSON', e);
    }
    return false;
  }, [saveBrand, selectBrand]);

  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    isSyncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  }>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null
  });

  const syncAllToCloud = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    setCloudSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      let storedCustoms: BrandingProfile[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_CUSTOM_BRANDS_KEY);
        if (raw) storedCustoms = JSON.parse(raw);
      } catch (e) {
        console.warn('Error reading localStorage for sync', e);
      }

      const map = new Map<string, BrandingProfile>();
      for (const b of customBrandsRef.current) map.set(b.id, b);
      for (const b of storedCustoms) map.set(b.id, b);
      if (activeBrand.isCustom || activeBrand.logoUrl || activeBrand.lightHeader) {
        map.set(activeBrand.id, activeBrand);
      }

      const profilesToSync = Array.from(map.values());
      if (profilesToSync.length === 0) {
        profilesToSync.push(activeBrand);
      }

      const res = await fetch('/api/brands/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profiles: profilesToSync,
          activeBrandId: activeBrandId
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const nowStr = new Date().toLocaleTimeString();
      setCloudSyncStatus({
        isSyncing: false,
        lastSyncedAt: nowStr,
        error: null
      });

      return {
        success: true,
        count: data.synced_count || profilesToSync.length,
        message: `Synced ${data.synced_count || profilesToSync.length} brands to Google Cloud Firestore (cait-db) & Datastore`
      };
    } catch (err: any) {
      const msg = err?.message || 'Sync failed';
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, error: msg }));
      return { success: false, count: 0, message: msg };
    }
  }, [activeBrand, activeBrandId]);

  const templatize = useCallback((text: string): string => {
    return templatizeBrandText(text, activeBrand);
  }, [activeBrand]);

  return (
    <BrandContext.Provider value={{
      activeBrand,
      brandProfiles: allProfiles,
      selectBrand,
      saveBrand,
      deleteBrand,
      resetToDefault,
      exportBrandJson,
      importBrandJson,
      templatize,
      updateActiveBrandLogo,
      resetActiveBrandLogo,
      updateActiveBrandLightHeader,
      syncAllToCloud,
      cloudSyncStatus
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
