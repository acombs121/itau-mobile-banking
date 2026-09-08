import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useBrand, getBrandAccountPrefix } from '../../context/BrandContext';
import { AdminConfig, BrandingProfile, COLOR_PALETTE_PRESETS, DEFAULT_BRAND_PROFILES } from '../../types/brand';
import { updateAdminConfig } from '../../lib/api';
import { useBrandEditorForm } from '../../hooks/useBrandEditorForm';
import { 
  X, 
  Settings,
  CheckCircle2, 
  Server, 
  Cpu, 
  Clock, 
  RefreshCw, 
  Palette, 
  Terminal, 
  FileText, 
  Upload,
  RotateCcw,
  Pipette,
  Check,
  Plus,
  Trash2,
  Edit2,
  Download,
  Search,
  Eye,
  Cloud
} from 'lucide-react';
import { DemoScriptModal } from '../admin/DemoScriptModal';
import { BrandKitModal } from '../admin/BrandKitModal';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config?: AdminConfig;
  onConfigUpdated: (config: AdminConfig) => void;
  initialTab?: 'branding' | 'ai' | 'script';
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  initialTab = 'branding'
}) => {
  const { t, lang } = useLanguage();
  const { 
    activeBrand, 
    brandProfiles, 
    selectBrand, 
    saveBrand, 
    deleteBrand, 
    exportBrandJson,
    importBrandJson,
    updateActiveBrandLogo,
    resetActiveBrandLogo,
    updateActiveBrandLightHeader,
    syncAllToCloud
  } = useBrand();

  const [activeTab, setActiveTab] = useState<'branding' | 'ai' | 'script'>(initialTab);
  const [syncingCloud, setSyncingCloud] = useState(false);

  // AI Configuration State
  const [mode, setMode] = useState<'hybrid' | 'live' | 'simulated'>('hybrid');
  const [delay, setDelay] = useState<number>(600);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Brand Studio Form State (within Drawer)
  const [studioMode, setStudioMode] = useState<'catalog' | 'editor'>('catalog');
  const [searchBrand, setSearchBrand] = useState('');
  const {
    editingId,
    formName,
    setFormName,
    formSubtitle,
    setFormSubtitle,
    formTagline,
    setFormTagline,
    formPrimaryColor,
    setFormPrimaryColor,
    formSecondaryTextColor,
    setFormSecondaryTextColor,
    formAccentColor,
    setFormAccentColor,
    formLogoUrl,
    setFormLogoUrl,
    formLogoOnly,
    setFormLogoOnly,
    formLightHeader,
    setFormLightHeader,
    formLogoScale,
    setFormLogoScale,
    formLogoX,
    setFormLogoX,
    formLogoY,
    setFormLogoY,
    startCreateNew,
    startEdit
  } = useBrandEditorForm({
    initialPrimaryColor: activeBrand.primaryColor || '#FFFFFF',
    initialAccentColor: activeBrand.accentColor || '#1A73E8',
    lang,
  });
  const [brandSavedToast, setBrandSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Additional Modals
  const [brandKitModalOpen, setBrandKitModalOpen] = useState<boolean>(false);
  const [demoScriptOpen, setDemoScriptOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (config) {
      setMode(config.execution_mode);
      setDelay(config.simulated_step_delay_ms);
    }
  }, [config]);

  if (!isOpen) return null;

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminConfig({
        execution_mode: mode,
        simulated_step_delay_ms: delay
      });
      onConfigUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to update config', e);
    } finally {
      setSaving(false);
    }
  };

  const handleStartCreateNewBrand = () => {
    startCreateNew();
    setStudioMode('editor');
  };

  const handleStartEditBrand = (profile: BrandingProfile) => {
    startEdit(profile);
    setStudioMode('editor');
  };

  const handleSaveStudioBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    saveBrand({
      id: editingId || undefined,
      name: formName.trim(),
      brandSubtitle: formSubtitle.trim() || (lang === 'pt' ? 'Crédito Imobiliário' : 'Secured Lending'),
      tagline: formTagline.trim(),
      primaryColor: formPrimaryColor,
      secondaryTextColor: formSecondaryTextColor,
      accentColor: formAccentColor,
      logoUrl: formLogoUrl,
      logoOnly: formLogoOnly,
      lightHeader: formLightHeader,
      logoScale: formLogoScale,
      logoX: formLogoX,
      logoY: formLogoY
    });

    setBrandSavedToast(true);
    setTimeout(() => setBrandSavedToast(false), 2000);
    setStudioMode('catalog');
  };

  const triggerEyeDropper = async (setter: (color: string) => void) => {
    if ('EyeDropper' in window) {
      try {
        const EyeDropperConstructor = (window as any).EyeDropper;
        const eyeDropper = new EyeDropperConstructor();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setter(result.sRGBHex.toUpperCase());
        }
      } catch (e) {
        console.log('EyeDropper cancelled or unsupported', e);
      }
    }
  };

  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(lang === 'pt' ? 'Por favor escolha uma imagem de até 10MB.' : 'Please choose an image file under 10MB.');
      return;
    }

    const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (isSvg) {
        callback(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const maxH = 160;
        let width = img.width;
        let height = img.height;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/png');
          callback(optimized);
        } else {
          callback(rawDataUrl);
        }
      };
      img.onerror = () => {
        callback(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImageFile(file, (optimized) => {
      setFormLogoUrl(optimized);
      // If user is editing the active brand, auto-persist to activeBrand immediately
      if (!editingId || editingId === activeBrand.id) {
        updateActiveBrandLogo(optimized, formLogoScale, formLogoX, formLogoY);
        setBrandSavedToast(true);
        setTimeout(() => setBrandSavedToast(false), 2500);
      }
    });
    e.target.value = '';
  };

  const handleResetCurrentLogo = () => {
    resetActiveBrandLogo();
    const defaultProfile = DEFAULT_BRAND_PROFILES.find(d => d.id === activeBrand.id);
    const targetLogoUrl = defaultProfile ? defaultProfile.logoUrl : undefined;
    const targetScale = defaultProfile ? (defaultProfile.logoScale ?? 100) : 100;
    const targetX = defaultProfile ? (defaultProfile.logoX ?? 0) : 0;
    const targetY = defaultProfile ? (defaultProfile.logoY ?? 0) : 0;

    setFormLogoUrl(targetLogoUrl);
    setFormLogoScale(targetScale);
    setFormLogoX(targetX);
    setFormLogoY(targetY);

    setToastMessage(lang === 'pt' ? 'Logotipo restaurado com sucesso!' : 'Logo reset successfully!');
    setBrandSavedToast(true);
    setTimeout(() => {
      setBrandSavedToast(false);
      setToastMessage(null);
    }, 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportBrandJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whitelabel_brands_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBrandJson(content);
      if (success) {
        alert(lang === 'pt' ? 'Configurações de marca importadas com sucesso!' : 'Brand configurations imported successfully!');
      } else {
        alert(lang === 'pt' ? 'Erro ao importar arquivo JSON.' : 'Failed to parse brand JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSyncToCloud = async () => {
    setSyncingCloud(true);
    try {
      const res = await syncAllToCloud();
      if (res.success) {
        setToastMessage(lang === 'pt' 
          ? `✓ Sincronizado com Firestore (cait-db) e Datastore! (${res.count} marcas)` 
          : `✓ Synced with Firestore (cait-db) & Datastore! (${res.count} brands)`);
        setBrandSavedToast(true);
        setTimeout(() => {
          setBrandSavedToast(false);
          setToastMessage(null);
        }, 3500);
      } else {
        alert(lang === 'pt' ? `Erro ao sincronizar: ${res.message}` : `Cloud sync error: ${res.message}`);
      }
    } catch (e: any) {
      alert(e.message || 'Sync failed');
    } finally {
      setSyncingCloud(false);
    }
  };

  const filteredBrands = brandProfiles.filter(p => {
    if (!searchBrand.trim()) return true;
    const q = searchBrand.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.brandSubtitle && p.brandSubtitle.toLowerCase().includes(q));
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1.5px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-xl md:max-w-2xl bg-[#0c0c0c] text-white border-l border-white/20 p-5 sm:p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-1.5 rounded-[4px] text-white transition-colors"
                style={{ backgroundColor: activeBrand.primaryColor }}
              >
                <Settings className="size-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-white">{t.admin.title}</h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] bg-white/10 text-white/80">
                    {activeBrand.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#798B97]">
                  {lang === 'pt' ? 'Controle de White-Labeling, Motor Gemini & Roteiro' : 'White-Label Engine, Gemini Agents & Demo Walkthrough'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-[5px] border border-white/10 font-mono text-xs select-none">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-2 px-2.5 rounded-[4px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-white text-[#070707] shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="size-3.5" />
              <span>{lang === 'pt' ? 'White-Label & Marca' : 'Branding & Theme'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-2.5 rounded-[4px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-white text-[#070707] shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="size-3.5" />
              <span>{lang === 'pt' ? 'Motor de IA' : 'AI Engine'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-2 px-2.5 rounded-[4px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'script'
                  ? 'bg-white text-[#070707] shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="size-3.5" />
              <span>{lang === 'pt' ? 'Roteiro Executivo' : 'Demo Script'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: WHITE-LABELING & BRAND STUDIO (DIRECTLY IN ADMIN PANEL)            */}
          {/* ========================================================================= */}
          {activeTab === 'branding' && (
            <div className="flex flex-col gap-4">
              {/* Studio Mode Switcher */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioMode('catalog')}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
                      studioMode === 'catalog'
                        ? 'bg-white text-slate-950 font-bold shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    {lang === 'pt' ? 'Catálogo de Bancos' : 'Banking Presets'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (studioMode !== 'editor') handleStartCreateNewBrand();
                    }}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      studioMode === 'editor'
                        ? 'bg-white text-slate-950 font-bold shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    <Plus className="size-3.5" />
                    <span>{editingId ? (lang === 'pt' ? 'Editando Marca' : 'Editing Brand') : (lang === 'pt' ? 'Criar Nova Marca' : 'New Brand')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSyncToCloud}
                    disabled={syncingCloud}
                    title={lang === 'pt' ? 'Sincronizar marcas com o Google Cloud Firestore' : 'Sync brands to Google Cloud Firestore'}
                    className="px-2.5 py-1.5 rounded-[4px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Cloud className={`size-3.5 ${syncingCloud ? 'animate-pulse text-sky-400' : ''}`} />
                    <span>{syncingCloud ? (lang === 'pt' ? 'Sincronizando...' : 'Syncing...') : (lang === 'pt' ? 'Sync Nuvem' : 'Sync Cloud')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    title={lang === 'pt' ? 'Exportar Marcas (JSON)' : 'Export Brands (JSON)'}
                    className="p-1.5 rounded-[4px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all cursor-pointer"
                  >
                    <Download className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    title={lang === 'pt' ? 'Importar Marcas (JSON)' : 'Import Brands (JSON)'}
                    className="p-1.5 rounded-[4px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all cursor-pointer"
                  >
                    <Upload className="size-3.5" />
                  </button>
                  <input 
                    ref={jsonImportRef} 
                    type="file" 
                    accept=".json,application/json" 
                    onChange={handleImportJsonFile} 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={handleResetCurrentLogo}
                    title={lang === 'pt' ? 'Resetar logotipo da marca atual' : 'Reset logo of current brand'}
                    className="p-1.5 rounded-[4px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {brandSavedToast && (
                <div className="p-2.5 rounded-[4px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="size-4" />
                  <span>{toastMessage || (lang === 'pt' ? 'Marca atualizada e aplicada com sucesso!' : 'Brand updated and applied successfully!')}</span>
                </div>
              )}

              {/* CATALOG VIEW */}
              {studioMode === 'catalog' && (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="size-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={lang === 'pt' ? 'Filtrar bancos ou temas...' : 'Filter banks or themes...'}
                      value={searchBrand}
                      onChange={(e) => setSearchBrand(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredBrands.map((profile) => {
                      const isActive = activeBrand.id === profile.id;
                      return (
                        <div
                          key={profile.id}
                          className={`p-3 rounded-[5px] border transition-all flex flex-col justify-between gap-2.5 ${
                            isActive
                              ? 'bg-white/10 border-white/40 ring-1 ring-white/30 shadow-md'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {profile.logoUrl ? (
                                <div 
                                  className="h-8 w-16 rounded-[3px] p-0.5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0"
                                  style={{ backgroundColor: profile.lightHeader ? '#FFFFFF' : profile.primaryColor }}
                                >
                                  <img 
                                    src={profile.logoUrl} 
                                    alt={profile.name} 
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="h-8 w-14 rounded-[3px] flex items-center justify-center font-black text-xs tracking-tight border border-white/15 shrink-0"
                                  style={{ backgroundColor: profile.secondaryTextColor || '#FFFFFF', color: profile.primaryColor }}
                                >
                                  {profile.id === 'itau' ? 'itau' : getBrandAccountPrefix(profile.id)}
                                </div>
                              )}

                              <div className="flex flex-col min-w-0">
                                <strong className="text-xs font-bold text-white truncate">
                                  {profile.name}
                                </strong>
                                <span className="text-[10px] text-[#798B97] truncate">
                                  {profile.brandSubtitle || 'Secured Credit'}
                                </span>
                              </div>
                            </div>

                            <div 
                              className="size-3.5 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: profile.primaryColor }}
                              title={`${lang === 'pt' ? 'Cor' : 'Color'}: ${profile.primaryColor}`}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            {isActive ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="size-3" />
                                <span>{lang === 'pt' ? 'Marca Ativa' : 'Active Brand'}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => selectBrand(profile.id)}
                                className="px-2.5 py-1 rounded-[3px] bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-white transition-all cursor-pointer"
                              >
                                {lang === 'pt' ? 'Ativar' : 'Apply'}
                              </button>
                            )}

                            <div className="flex items-center gap-1">
                              {profile.isCustom && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditBrand(profile)}
                                    className="p-1 rounded-[3px] hover:bg-white/10 text-white/70 hover:text-white"
                                    title={lang === 'pt' ? 'Editar Marca' : 'Edit Brand'}
                                  >
                                    <Edit2 className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteBrand(profile.id)}
                                    className="p-1 rounded-[3px] hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                    title={lang === 'pt' ? 'Excluir Marca' : 'Delete Brand'}
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </>
                              )}
                              {!profile.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditBrand(profile)}
                                  className="p-1 rounded-[3px] hover:bg-white/10 text-white/50 hover:text-white"
                                  title={lang === 'pt' ? 'Personalizar a partir deste preset' : 'Customize from preset'}
                                >
                                  <Edit2 className="size-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BRAND STUDIO EDITOR VIEW */}
              {studioMode === 'editor' && (
                <form onSubmit={handleSaveStudioBrand} className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white/90 mb-1">
                        {lang === 'pt' ? 'Nome da Instituição / Banco' : 'Institution / Brand Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'pt' ? 'ex. Banco Safra, XP, Inter' : 'e.g. Safra, XP, Inter'}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-[4px] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/90 mb-1">
                        {lang === 'pt' ? 'Subtítulo da Esteira' : 'Portal Subtitle'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'pt' ? 'ex. Crédito com Garantia de Imóvel' : 'e.g. Home Equity & Mortgage'}
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-[4px] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/90 mb-1">
                      {lang === 'pt' ? 'Tagline Institucional' : 'Tagline / Compliance Note'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'pt' ? 'ex. 100% Digital • Inteligência Autônoma Gemini' : 'e.g. 100% Digital Origination • Powered by Google Cloud'}
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-[4px] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Color Palette Selector */}
                  <div className="p-3 rounded-[5px] bg-white/5 border border-white/10 flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                      {lang === 'pt' ? 'Paleta de Cores' : 'Color Palette'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Primary Color */}
                      <div>
                        <label className="block text-[10px] text-[#798B97] uppercase font-mono mb-1">
                          {lang === 'pt' ? 'Primária (Hero & Botões)' : 'Primary'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={formPrimaryColor}
                            onChange={(e) => setFormPrimaryColor(e.target.value)}
                            className="size-7 rounded-[3px] cursor-pointer border border-white/20 p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={formPrimaryColor}
                            onChange={(e) => setFormPrimaryColor(e.target.value)}
                            className="w-20 bg-black/40 border border-white/15 rounded-[3px] px-2 py-1 text-[11px] font-mono text-white"
                          />
                          {'EyeDropper' in window && (
                            <button
                              type="button"
                              onClick={() => triggerEyeDropper(setFormPrimaryColor)}
                              className="p-1.5 rounded-[3px] bg-white/10 hover:bg-white/15 text-white/80"
                              title={lang === 'pt' ? 'Capturar cor da tela' : 'Pick color from screen'}
                            >
                              <Pipette className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div>
                        <label className="block text-[10px] text-[#798B97] uppercase font-mono mb-1">
                          {lang === 'pt' ? 'Acento / Secundária' : 'Accent'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={formAccentColor}
                            onChange={(e) => setFormAccentColor(e.target.value)}
                            className="size-7 rounded-[3px] cursor-pointer border border-white/20 p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={formAccentColor}
                            onChange={(e) => setFormAccentColor(e.target.value)}
                            className="w-20 bg-black/40 border border-white/15 rounded-[3px] px-2 py-1 text-[11px] font-mono text-white"
                          />
                          {'EyeDropper' in window && (
                            <button
                              type="button"
                              onClick={() => triggerEyeDropper(setFormAccentColor)}
                              className="p-1.5 rounded-[3px] bg-white/10 hover:bg-white/15 text-white/80"
                              title={lang === 'pt' ? 'Capturar cor da tela' : 'Pick color from screen'}
                            >
                              <Pipette className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Header Text Color */}
                      <div>
                        <label className="block text-[10px] text-[#798B97] uppercase font-mono mb-1">
                          {lang === 'pt' ? 'Texto do Cabeçalho' : 'Header Text'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={formSecondaryTextColor}
                            onChange={(e) => setFormSecondaryTextColor(e.target.value)}
                            className="size-7 rounded-[3px] cursor-pointer border border-white/20 p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={formSecondaryTextColor}
                            onChange={(e) => setFormSecondaryTextColor(e.target.value)}
                            className="w-20 bg-black/40 border border-white/15 rounded-[3px] px-2 py-1 text-[11px] font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#798B97] font-mono">Presets:</span>
                      {COLOR_PALETTE_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setFormPrimaryColor(p.hex);
                          }}
                          className="size-4 rounded-full border border-white/30 transition-transform hover:scale-125 cursor-pointer"
                          style={{ backgroundColor: p.hex }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Logo Upload & Calibration */}
                  <div className="p-3 rounded-[5px] bg-white/5 border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        {lang === 'pt' ? 'Logotipo da Instituição' : 'Logo Upload & Sizing'}
                      </span>
                      {formLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormLogoUrl(undefined)}
                          className="text-[11px] text-red-400 hover:text-red-300 font-mono"
                        >
                          {lang === 'pt' ? 'Remover Logo' : 'Clear Logo'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/15 text-xs text-white font-semibold border border-white/15 flex items-center gap-2 transition-all cursor-pointer shrink-0"
                      >
                        <Upload className="size-3.5" />
                        <span>{formLogoUrl ? (lang === 'pt' ? 'Trocar Logotipo' : 'Replace Logo') : (lang === 'pt' ? 'Fazer Upload' : 'Upload Logo')}</span>
                      </button>

                      {formLogoUrl ? (
                        <div 
                          className="h-9 px-3 min-w-[90px] max-w-[200px] rounded-[4px] flex items-center justify-center border border-white/20"
                          style={{ backgroundColor: formLightHeader ? '#FFFFFF' : formPrimaryColor }}
                        >
                          <img 
                            src={formLogoUrl} 
                            alt="Preview" 
                            className="max-h-7 max-w-full object-contain"
                            style={{
                              transform: `scale(${formLogoScale / 100}) translate(${formLogoX}px, ${formLogoY}px)`
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#798B97]">
                          {lang === 'pt' ? 'Nenhum logo enviado (usará badge textual)' : 'No custom logo (text badge will be used)'}
                        </span>
                      )}
                    </div>

                    {formLogoUrl && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                        <div>
                          <div className="flex justify-between text-[10px] text-[#798B97] mb-0.5">
                            <span>{lang === 'pt' ? 'Escala' : 'Scale'}</span>
                            <span>{formLogoScale}%</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={250}
                            step={5}
                            value={formLogoScale}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormLogoScale(val);
                              if (!editingId || editingId === activeBrand.id) {
                                updateActiveBrandLogo(formLogoUrl || activeBrand.logoUrl, val, formLogoX, formLogoY);
                              }
                            }}
                            className="w-full accent-white"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-[#798B97] mb-0.5">
                            <span>Offset X</span>
                            <span>{formLogoX}px</span>
                          </div>
                          <input
                            type="range"
                            min={-60}
                            max={60}
                            step={2}
                            value={formLogoX}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormLogoX(val);
                              if (!editingId || editingId === activeBrand.id) {
                                updateActiveBrandLogo(formLogoUrl || activeBrand.logoUrl, formLogoScale, val, formLogoY);
                              }
                            }}
                            className="w-full accent-white"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-[#798B97] mb-0.5">
                            <span>Offset Y</span>
                            <span>{formLogoY}px</span>
                          </div>
                          <input
                            type="range"
                            min={-30}
                            max={30}
                            step={1}
                            value={formLogoY}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormLogoY(val);
                              if (!editingId || editingId === activeBrand.id) {
                                updateActiveBrandLogo(formLogoUrl || activeBrand.logoUrl, formLogoScale, formLogoX, val);
                              }
                            }}
                            className="w-full accent-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formLogoOnly}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormLogoOnly(checked);
                            if (!editingId || editingId === activeBrand.id) {
                              const updatedProfile = { ...activeBrand, logoOnly: checked, updatedAt: new Date().toISOString() };
                              saveBrand(updatedProfile);
                            }
                          }}
                          className="accent-white rounded-[2px]"
                        />
                        <span>{lang === 'pt' ? 'Apenas Logotipo (ocultar texto)' : 'Logo Only (hide text)'}</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formLightHeader}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormLightHeader(checked);
                            if (!editingId || editingId === activeBrand.id) {
                              updateActiveBrandLightHeader(checked);
                            }
                          }}
                          className="accent-white rounded-[2px]"
                        />
                        <span>{lang === 'pt' ? 'Cabeçalho Claro (Fundo Branco)' : 'Light Header (White)'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Real-time Header Preview */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-[#798B97] uppercase flex items-center gap-1">
                      <Eye className="size-3" />
                      <span>{lang === 'pt' ? 'Prévia do Cabeçalho em Tempo Real' : 'Live Header Preview'}</span>
                    </span>
                    <div 
                      className={`h-14 px-4 rounded-[4px] border flex items-center justify-between shadow-inner ${
                        formLightHeader ? 'border-neutral-300' : 'border-black/30'
                      }`}
                      style={{ 
                        backgroundColor: formLightHeader ? '#FFFFFF' : formPrimaryColor, 
                        color: formLightHeader ? '#070707' : formSecondaryTextColor 
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        {formLogoUrl ? (
                          <div 
                            className="h-8 min-w-[60px] max-w-[220px] flex items-center justify-start shrink-0"
                            style={{
                              marginRight: `${Math.max(0, Math.round(((formLogoScale / 100) - 1) * 36) + Math.max(0, formLogoX))}px`
                            }}
                          >
                            <img 
                              src={formLogoUrl} 
                              alt="Logo" 
                              className="h-7 w-auto max-w-[200px] object-contain transition-transform"
                              style={{
                                transformOrigin: 'left center',
                                transform: `translate(${formLogoX}px, ${formLogoY}px) scale(${formLogoScale / 100})`
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="font-black text-sm px-2 py-0.5 rounded-[3px] shadow-xs"
                            style={{
                              backgroundColor: formLightHeader ? formPrimaryColor : '#FFFFFF',
                              color: formLightHeader ? '#FFFFFF' : formPrimaryColor
                            }}
                          >
                            {formName ? formName.toLowerCase() : (lang === 'pt' ? 'marca' : 'brand')}
                          </div>
                        )}

                        {!formLogoOnly && (
                          <div className="flex flex-col">
                            <span className="font-bold text-xs leading-tight">
                              {formSubtitle || (lang === 'pt' ? 'Crédito Imobiliário' : 'Secured Lending')}
                            </span>
                            <span className="text-[9px] font-mono opacity-80 leading-none">
                              {formTagline || (lang === 'pt' ? '100% Digital • Sem Burocracia' : '100% Digital Origination')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-mono opacity-80">LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStudioMode('catalog')}
                      className="px-3 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs text-white/80 font-mono transition-all cursor-pointer"
                    >
                      {lang === 'pt' ? 'Voltar ao Catálogo' : 'Back to Catalog'}
                    </button>
                    <button
                      type="submit"
                      className="btn-itau px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>{lang === 'pt' ? 'Salvar & Ativar Marca' : 'Save & Activate Brand'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Auxiliary Spec Link Card */}
              <div className="p-3 rounded-[5px] bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-white" />
                  <div className="flex flex-col">
                    <strong className="text-white font-semibold">
                      {lang === 'pt' ? 'Design Tokens & Vocabulário Regulatório BACEN' : 'Design Tokens & BACEN Regulatory Lexicon'}
                    </strong>
                    <span className="text-[10px] text-[#798B97]">
                      {lang === 'pt' ? 'Hex codes, contraste WCAG AAA e termos jurídicos da CCB' : 'WCAG contrast, tokens, and CCB legal terminology'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBrandKitModalOpen(true)}
                  className="px-2.5 py-1 rounded-[3px] bg-white/10 hover:bg-white/15 text-[11px] font-mono text-white/90 border border-white/15 transition-all shrink-0 cursor-pointer"
                >
                  {lang === 'pt' ? 'Ver Specs' : 'View Specs'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AI ENGINE & CONNECTION DIAGNOSTICS                                */}
          {/* ========================================================================= */}
          {activeTab === 'ai' && (
            <div className="flex flex-col gap-4">
              {/* Connection Diagnostics */}
              <div className="p-4 rounded-[4px] bg-white/5 border border-white/10 flex flex-col gap-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#798B97] flex items-center gap-1.5">
                    <Server className="size-3.5" />
                    {t.admin.connection_status}:
                  </span>
                  <span className={`font-bold inline-flex items-center gap-1.5 ${
                    config?.is_live_connection ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    <span className={`size-2 rounded-full ${config?.is_live_connection ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {config?.is_live_connection ? t.admin.status_live_badge : t.admin.status_simulated_badge}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#798B97] flex items-center gap-1.5">
                    <Cpu className="size-3.5" />
                    {t.admin.model_label}:
                  </span>
                  <span className="font-bold text-white">
                    {config?.gemini_model || 'gemini-3.7-flash'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#798B97] flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {t.admin.gcp_region_label}:
                  </span>
                  <span className="font-bold text-white">
                    {config?.gcp_region || 'us-central1'}
                  </span>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {t.admin.mode_label}
                </label>
                
                <div className="flex flex-col gap-2">
                  <label className={`p-3 rounded-[4px] border cursor-pointer transition-all flex items-start gap-3 ${
                    mode === 'hybrid' ? 'border-white bg-white/10 ring-1 ring-white/20' : 'border-white/15 bg-white/5 hover:bg-white/10'
                  }`}>
                    <input 
                      type="radio" 
                      name="exec_mode" 
                      checked={mode === 'hybrid'} 
                      onChange={() => setMode('hybrid')}
                      className="mt-0.5 accent-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.admin.mode_hybrid}</span>
                      <span className="text-[11px] text-[#798B97] mt-0.5">{t.admin.mode_hybrid_desc}</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-[4px] border cursor-pointer transition-all flex items-start gap-3 ${
                    mode === 'live' ? 'border-white bg-white/10 ring-1 ring-white/20' : 'border-white/15 bg-white/5 hover:bg-white/10'
                  }`}>
                    <input 
                      type="radio" 
                      name="exec_mode" 
                      checked={mode === 'live'} 
                      onChange={() => setMode('live')}
                      className="mt-0.5 accent-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.admin.mode_live}</span>
                      <span className="text-[11px] text-[#798B97] mt-0.5">{t.admin.mode_live_desc}</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-[4px] border cursor-pointer transition-all flex items-start gap-3 ${
                    mode === 'simulated' ? 'border-white bg-white/10 ring-1 ring-white/20' : 'border-white/15 bg-white/5 hover:bg-white/10'
                  }`}>
                    <input 
                      type="radio" 
                      name="exec_mode" 
                      checked={mode === 'simulated'} 
                      onChange={() => setMode('simulated')}
                      className="mt-0.5 accent-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.admin.mode_simulated}</span>
                      <span className="text-[11px] text-[#798B97] mt-0.5">{t.admin.mode_simulated_desc}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delay Slider */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <label>{t.admin.delay_label}</label>
                  <span className="text-white font-bold">{delay} ms</span>
                </div>
                <input 
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="accent-white w-full"
                />
              </div>

              <div className="pt-4 border-t border-white/15">
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="btn-itau w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : savedSuccess ? (
                    <CheckCircle2 className="size-3.5 text-white" />
                  ) : null}
                  <span>{savedSuccess ? t.admin.saved_badge : t.admin.apply_config}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXECUTIVE DEMO SCRIPT & STACK ARCHITECTURE                         */}
          {/* ========================================================================= */}
          {activeTab === 'script' && (
            <div className="flex flex-col gap-3.5">
              <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="flex flex-col">
                  <strong className="text-xs text-white font-semibold flex items-center gap-2">
                    <Terminal className="size-3.5 text-white" />
                    <span>{lang === 'pt' ? 'Roteiro Executivo de Demonstração (7 Atos)' : 'Executive Demo Script & Blueprint (7 Acts)'}</span>
                  </strong>
                  <span className="text-[11px] text-[#798B97] mt-1 leading-relaxed">
                    {lang === 'pt' 
                      ? 'Guia completo consolidado: Problema do Cliente, Solução Google Cloud, ROI de Negócio, Demonstração em 7 Atos (Landing até Pix) e Arquitetura de Produção.' 
                      : 'Consolidated executive walkthrough: Customer Problem, Google Cloud Solution, Business ROI, 7-Act Demo Journey (Landing to Pix), and Production Blueprint.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoScriptOpen(true)}
                  className="btn-itau w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Terminal className="size-3.5" />
                  <span>{lang === 'pt' ? 'Abrir Roteiro Completo' : 'Open Full Script'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs font-mono text-white/80 p-3 rounded-[5px] bg-black/40 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-[#798B97]">Tech Stack Highlights:</div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span><strong>AI Platform:</strong> Gemini Enterprise Agent Platform (fka Vertex AI Platform)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span><strong>Cloud Run:</strong> Serverless Fast API backend + React 19 micro-frontend</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span><strong>BACEN Regulatory:</strong> CCB Digital (Lei 10.931), Res. CMN 4.966 IFRS 9</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span><strong>Settlement:</strong> SPI / Pix RTGS Instant Settlement (Res. BCB 142)</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Auxiliary Modals */}
      <BrandKitModal 
        isOpen={brandKitModalOpen} 
        onClose={() => setBrandKitModalOpen(false)} 
      />

      <DemoScriptModal 
        isOpen={demoScriptOpen} 
        onClose={() => setDemoScriptOpen(false)} 
      />
    </div>
  );
};
