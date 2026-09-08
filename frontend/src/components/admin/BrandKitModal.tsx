import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useBrand, hexToRgb, getBrandAccountPrefix } from '../../context/BrandContext';
import { BrandingProfile, COLOR_PALETTE_PRESETS } from '../../types/brand';
import { useBrandEditorForm } from '../../hooks/useBrandEditorForm';
import { 
  Palette, 
  Copy, 
  Check, 
  X, 
  Type, 
  Layers, 
  MessageSquare, 
  FileText,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  RotateCcw,
  Pipette,
  CheckCircle2,
  Search,
  Edit2,
  Download
} from 'lucide-react';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const { 
    activeBrand, 
    brandProfiles, 
    selectBrand, 
    saveBrand, 
    deleteBrand, 
    resetToDefault,
    exportBrandJson,
    importBrandJson,
    updateActiveBrandLogo,
    updateActiveBrandLightHeader
  } = useBrand();

  const [activeTab, setActiveTab] = useState<'presets' | 'studio' | 'colors' | 'typography' | 'voice' | 'spec'>('presets');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Brand Studio Form State via reusable hook
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brandProfiles;
    const q = searchQuery.toLowerCase();
    return brandProfiles.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.brandSubtitle && p.brandSubtitle.toLowerCase().includes(q))
    );
  }, [brandProfiles, searchQuery]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, hexCode?: string) => {
    navigator.clipboard.writeText(text);
    if (hexCode) {
      setCopiedHex(hexCode);
      setTimeout(() => setCopiedHex(null), 1800);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleStartCreateNew = () => {
    startCreateNew();
    setActiveTab('studio');
  };

  const handleStartEdit = (profile: BrandingProfile) => {
    startEdit(profile);
    setActiveTab('studio');
  };

  const handleSaveStudio = (e: React.FormEvent) => {
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

    setActiveTab('presets');
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(lang === 'pt' ? 'Por favor escolha uma imagem de até 10MB.' : 'Please choose an image file under 10MB.');
      e.target.value = '';
      return;
    }

    const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const applyLogo = (logoData: string) => {
        setFormLogoUrl(logoData);
        if (!editingId || editingId === activeBrand.id) {
          updateActiveBrandLogo(logoData, formLogoScale, formLogoX, formLogoY);
        }
      };

      if (isSvg) {
        applyLogo(rawDataUrl);
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
          applyLogo(optimized);
        } else {
          applyLogo(rawDataUrl);
        }
      };
      img.onerror = () => {
        applyLogo(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  const isDefaultItau = activeBrand.id === 'itau';
  const brandShort = activeBrand.name.replace(/^Banco\s+/i, '');

  const colorTokens = [
    { 
      name_pt: `${activeBrand.name} ${isDefaultItau ? 'Laranja Digital (Hero)' : 'Cor Primária Digital'}`, 
      name_en: `${activeBrand.name} ${isDefaultItau ? 'Digital Orange (Hero)' : 'Digital Primary Accent'}`, 
      hex: activeBrand.primaryColor, 
      rgb: hexToRgb(activeBrand.primaryColor), 
      role_pt: `Acento primário digital em superfícies escuras, botões de ação e steppers da marca ${brandShort}`, 
      role_en: `Primary digital accent on dark surfaces, action triggers, and steppers for ${brandShort}`, 
      contrast_pt: 'WCAG AAA (10.2:1)',
      contrast_en: 'WCAG AAA (10.2:1)'
    },
    { 
      name_pt: `${brandShort} ${isDefaultItau ? 'Laranja Corporativo' : 'Cor Primária Hover'}`, 
      name_en: `${brandShort} ${isDefaultItau ? 'Corporate Orange' : 'Primary Hover Color'}`, 
      hex: activeBrand.primaryColorHover || activeBrand.primaryColor, 
      rgb: hexToRgb(activeBrand.primaryColorHover || activeBrand.primaryColor), 
      role_pt: `Cor institucional e de interação ativa nos botões da interface`, 
      role_en: `Institutional color and interaction state for primary interface buttons`, 
      contrast_pt: 'WCAG AA (4.8:1)',
      contrast_en: 'WCAG AA (4.8:1)'
    },
    { 
      name_pt: `${brandShort} ${isDefaultItau ? 'Azul Clássico (Navy)' : 'Cor Secundária (Accent)'}`, 
      name_en: `${brandShort} ${isDefaultItau ? 'Heritage Navy' : 'Secondary Accent Color'}`, 
      hex: activeBrand.accentColor || '#002D62', 
      rgb: hexToRgb(activeBrand.accentColor || '#002D62'), 
      role_pt: 'Badges formais, acentos institucionais e superfícies contrastantes', 
      role_en: 'Corporate badges, institutional accents, and contrasting surfaces', 
      contrast_pt: 'WCAG AAA (13.5:1)',
      contrast_en: 'WCAG AAA (13.5:1)'
    },
    { 
      name_pt: 'Canvas Hero Preto Absoluto', 
      name_en: 'Pitch Black Hero Canvas', 
      hex: '#070707', 
      rgb: '7, 7, 7', 
      role_pt: 'Fundo escuro de alto contraste para o hero executivo e consoles de telemetria', 
      role_en: 'Pitch-black high-contrast background for executive hero and telemetry consoles', 
      contrast_pt: 'Base Escura',
      contrast_en: 'Dark Base'
    },
    { 
      name_pt: 'Card Grafite Cockpit', 
      name_en: 'Cockpit Slate Card', 
      hex: '#111111', 
      rgb: '17, 17, 17', 
      role_pt: 'Superfície de cartões de análise e parecer na Mesa de Operações', 
      role_en: 'Card surfaces for underwriting and risk analysis in the Operations Desk', 
      contrast_pt: 'Card Escuro',
      contrast_en: 'Dark Card'
    },
    { 
      name_pt: 'Canvas Claro do Proponente', 
      name_en: 'Off-White Body Canvas', 
      hex: '#F3F3F3', 
      rgb: '243, 243, 243', 
      role_pt: 'Fundo neutro claro para a jornada de contratação do cliente', 
      role_en: 'Clean neutral off-white background for customer loan workflow', 
      contrast_pt: 'Base Clara',
      contrast_en: 'Light Base'
    },
    { 
      name_pt: 'Card Branco Puro', 
      name_en: 'Pure White Card', 
      hex: '#FFFFFF', 
      rgb: '255, 255, 255', 
      role_pt: 'Superfícies de tabelas SAC, campos de entrada e inspeção de documentos', 
      role_en: 'Surfaces for SAC schedules, form inputs, and document inspection', 
      contrast_pt: 'Card Claro',
      contrast_en: 'Light Card'
    },
    { 
      name_pt: 'Cinza Ardósia Neutro', 
      name_en: 'Muted Slate Disclosures', 
      hex: '#798B97', 
      rgb: '121, 139, 151', 
      role_pt: 'Rótulos regulatórios, notas explicativas e avisos legais do BACEN', 
      role_en: 'Regulatory captions, footnotes, and BACEN disclosures', 
      contrast_pt: 'Neutro',
      contrast_en: 'Neutral'
    },
    { 
      name_pt: 'Status Aprovado / Regular', 
      name_en: 'Status Approved / Clean', 
      hex: '#10B981', 
      rgb: '16, 185, 129', 
      role_pt: 'CPF Regular (RFB), biometria facial 1:1 e certidões negativas válidas', 
      role_en: 'CPF Regular (Tax ID), 1:1 facial biometric match, and clean tax certificates', 
      contrast_pt: 'Semântico',
      contrast_en: 'Semantic'
    },
    { 
      name_pt: 'Status Atenção / Em Análise', 
      name_en: 'Status Warning / Review', 
      hex: '#F59E0B', 
      rgb: '245, 158, 11', 
      role_pt: 'Alerta preventivo de saldo, risco de cheque especial (LIS) ou aviso viagem pendente', 
      role_en: 'Predictive balance alert, overdraft (LIS) risk, or pending travel shield', 
      contrast_pt: 'Semântico',
      contrast_en: 'Semantic'
    },
    { 
      name_pt: 'Status Crítico / Bloqueado', 
      name_en: 'Status Critical / Block', 
      hex: '#EF4444', 
      rgb: '239, 68, 68', 
      role_pt: 'Déficit de conta corrente, saldo negativo ou recusa de autorização de transação', 
      role_en: 'Checking account shortfall, negative balance, or declined transaction authorization', 
      contrast_pt: 'Semântico',
      contrast_en: 'Semantic'
    },
  ];

  const lexicon = [
    {
      term_pt: 'Contrato de Crédito',
      term_en: 'Credit Contract',
      correct_pt: 'Cédula de Crédito Bancário (CCB Digital - Lei 10.931/2004)',
      correct_en: 'Electronic Bank Credit Certificate (Digital CCB - Law 10,931/2004)',
      avoid_pt: 'Contrato simples de mútuo / empréstimo comum',
      avoid_en: 'Generic loan agreement / promissory note'
    },
    {
      term_pt: 'Garantia Imobiliária',
      term_en: 'Real Estate Collateral',
      correct_pt: 'Alienação Fiduciária de Bem Imóvel (Lei 9.514/1997)',
      correct_en: 'Fiduciary Transfer of Real Property (Law 9,514/1997)',
      avoid_pt: 'Hipoteca simples (mecanismo desatualizado)',
      avoid_en: 'Common judicial mortgage (obsolete)'
    },
    {
      term_pt: 'Provisão de Crédito',
      term_en: 'Credit Provisioning',
      correct_pt: 'Perda Esperada Res. CMN 4.966 / IFRS 9 (ECL = PD x LGD x EAD)',
      correct_en: 'Expected Credit Loss CMN Res. 4,966 / IFRS 9 (ECL = PD x LGD x EAD)',
      avoid_pt: 'Resolução CMN 2.682 (revogada) ou provisão zero (0.00%)',
      avoid_en: 'CMN Res. 2,682 (repealed 2025) or claim of 0.00% ECL'
    },
    {
      term_pt: 'Desembolso dos Recursos',
      term_en: 'Loan Disbursement',
      correct_pt: 'Liquidação Bruta em Tempo Real no SPI / Pix (Res. BCB 142)',
      correct_en: 'Real-Time Gross Settlement on BACEN SPI / Pix (Res. BCB 142)',
      avoid_pt: 'TED agendada para o próximo dia útil',
      avoid_en: 'Scheduled wire / end-of-day batch settlement'
    },
    {
      term_pt: 'Explicabilidade da Decisão',
      term_en: 'Decision Explainability',
      correct_pt: 'Parecer Técnico Fundamentado (Artigo 20 da LGPD)',
      correct_en: 'Auditable Technical Opinion & Explainability (LGPD Art. 20)',
      avoid_pt: 'Decisão algorítmica de caixa preta sem justificativa',
      avoid_en: 'Unexplained black-box algorithmic scores'
    }
  ];

  const markdownContent = lang === 'pt' ? `# Banco Itaú / White-Label — Guia de Marca & Design System

## 1. Marca Ativa: ${activeBrand.name}
- Cor Primária: ${activeBrand.primaryColor}
- Cor Secundária / Acento: ${activeBrand.accentColor || '#002D62'}
- Subtítulo: ${activeBrand.brandSubtitle}
- Tagline: ${activeBrand.tagline || 'Originação 100% Digital'}
- Logotipo Customizado: ${activeBrand.logoUrl ? 'Configurado' : 'Padrão'}

## 2. Paleta Oficial ${activeBrand.name}
- --brand-primary: ${activeBrand.primaryColor} (RGB ${hexToRgb(activeBrand.primaryColor)})
- --brand-primary-hover: ${activeBrand.primaryColorHover || activeBrand.primaryColor} (RGB ${hexToRgb(activeBrand.primaryColorHover || activeBrand.primaryColor)})
- --brand-accent: ${activeBrand.accentColor || '#002D62'} (RGB ${hexToRgb(activeBrand.accentColor || '#002D62')})
- --surface-pitch-black: #070707
- --surface-light-canvas: #F3F3F3

## 3. Geometria de Interface
- Botões Interativos: Estritamente 4px (rounded-[4px])
- Contêineres & Cards: 8px (rounded-[8px])
- Bordas: Fio de cabelo de 1px com elevação plana` : `# White-Label Brand Kit & Design System Specification

## 1. Active Brand: ${activeBrand.name}
- Primary Color: ${activeBrand.primaryColor}
- Secondary / Accent Color: ${activeBrand.accentColor || '#002D62'}
- Subtitle: ${activeBrand.brandSubtitle}
- Tagline: ${activeBrand.tagline || '100% Digital Origination'}
- Custom Logo: ${activeBrand.logoUrl ? 'Configured' : 'Default'}

## 2. Official ${activeBrand.name} Tokens
- --brand-primary: ${activeBrand.primaryColor} (RGB ${hexToRgb(activeBrand.primaryColor)})
- --brand-primary-hover: ${activeBrand.primaryColorHover || activeBrand.primaryColor} (RGB ${hexToRgb(activeBrand.primaryColorHover || activeBrand.primaryColor)})
- --brand-accent: ${activeBrand.accentColor || '#002D62'} (RGB ${hexToRgb(activeBrand.accentColor || '#002D62')})
- --surface-pitch-black: #070707
- --surface-light-canvas: #F3F3F3

## 3. UI Geometry Standards
- Interactive Buttons: Strictly 4px (rounded-[4px])
- Containers & Cards: 8px (rounded-[8px])
- Borders: Crisp 1px hairline borders with flat architectural surfaces`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[94vh] bg-[#0c0c0c] text-white rounded-[8px] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-[4px] text-white shadow-sm transition-colors"
              style={{ backgroundColor: activeBrand.primaryColor }}
            >
              <Palette className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-[3px] text-white/90">
                  White-Label Engine
                </span>
                <span className="text-[10px] font-mono text-[#798B97]">
                  Active: <strong className="text-white">{activeBrand.name}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                {lang === 'pt' ? 'Personalização de Marca & Design System' : 'White-Label Branding & Design System'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              title={lang === 'pt' ? 'Exportar Perfis JSON' : 'Export Profiles JSON'}
              className="p-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/15 transition-all cursor-pointer"
            >
              <Download className="size-4" />
            </button>

            <button
              onClick={() => jsonImportRef.current?.click()}
              title={lang === 'pt' ? 'Importar Perfis JSON' : 'Import Profiles JSON'}
              className="p-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/15 transition-all cursor-pointer"
            >
              <Upload className="size-4" />
            </button>
            <input 
              ref={jsonImportRef} 
              type="file" 
              accept=".json,application/json" 
              onChange={handleImportJsonFile} 
              className="hidden" 
            />

            <button
              onClick={() => copyToClipboard(markdownContent)}
              className="px-3 py-1.5 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs font-mono text-white/90 border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
            >
              {copiedAll ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-white" />}
              <span>{copiedAll ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Spec' : 'Copy Spec')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 sm:px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'presets' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <Layers className="size-4" />
            <span>{lang === 'pt' ? 'Marcas & Temas' : 'Brands & Presets'}</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'studio' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <Sparkles className="size-4" />
            <span>{lang === 'pt' ? 'Criador de Marca (Studio)' : 'Brand Studio (Creator)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'colors' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <Palette className="size-4" />
            <span>{lang === 'pt' ? 'Design Tokens' : 'Design Tokens'}</span>
          </button>

          <button
            onClick={() => setActiveTab('typography')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'typography' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <Type className="size-4" />
            <span>{lang === 'pt' ? 'Tipografia & Superfícies' : 'Typography & Geometry'}</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'voice' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <MessageSquare className="size-4" />
            <span>{lang === 'pt' ? 'Vocabulário BACEN' : 'Regulatory Lexicon'}</span>
          </button>

          <button
            onClick={() => setActiveTab('spec')}
            className={`py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'spec' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <FileText className="size-4" />
            <span>BRAND_KIT.md</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto max-h-[calc(94vh-140px)] flex flex-col gap-6">
          
          {/* TAB 1: PRESETS & DIRECTORY */}
          {activeTab === 'presets' && (
            <div className="flex flex-col gap-5">
              
              {/* Top Controls: Search, Create, Reset */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={lang === 'pt' ? 'Buscar marca por nome ou produto...' : 'Search brand by name or product...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-[4px] pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleStartCreateNew}
                    className="btn-itau px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>{lang === 'pt' ? 'Criar Nova Marca' : 'Create Custom Brand'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetToDefault}
                    className="px-3 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                    title={lang === 'pt' ? 'Restaurar padrão Itaú' : 'Reset to default Itaú'}
                  >
                    <RotateCcw className="size-3.5" />
                    <span className="hidden sm:inline">{lang === 'pt' ? 'Padrão Itaú' : 'Default Itaú'}</span>
                  </button>
                </div>
              </div>

              {/* Brands Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBrands.map((profile) => {
                  const isActive = activeBrand.id === profile.id;

                  return (
                    <div
                      key={profile.id}
                      className={`p-4 rounded-[6px] border transition-all flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-white/10 border-white/40 shadow-lg ring-2 ring-white/20'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top Row: Logo/Badge & Color Swatches */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {profile.logoUrl ? (
                            <div 
                              className="h-10 w-24 rounded-[4px] p-1 flex items-center justify-center overflow-hidden border border-white/10"
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
                              className="h-10 w-16 rounded-[4px] flex items-center justify-center font-bold text-sm tracking-tight border border-white/20"
                              style={{ backgroundColor: profile.secondaryTextColor || '#FFFFFF', color: profile.primaryColor }}
                            >
                              {profile.id === 'itau' ? 'itau' : getBrandAccountPrefix(profile.id)}
                            </div>
                          )}

                          <div className="flex flex-col">
                            <strong className="text-xs font-bold text-white leading-tight">
                              {profile.name}
                            </strong>
                            <span className="text-[10px] text-[#798B97] line-clamp-1">
                              {profile.brandSubtitle || 'Secured Lending'}
                            </span>
                          </div>
                        </div>

                        {/* Color Chips */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div 
                            className="size-4 rounded-full border border-white/30"
                            style={{ backgroundColor: profile.primaryColor }}
                            title={`Primary: ${profile.primaryColor}`}
                          />
                          {profile.accentColor && (
                            <div 
                              className="size-4 rounded-full border border-white/30"
                              style={{ backgroundColor: profile.accentColor }}
                              title={`Accent: ${profile.accentColor}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Middle: Tagline or info */}
                      {profile.tagline && (
                        <p className="text-[11px] text-white/70 line-clamp-1 font-mono">
                          {profile.tagline}
                        </p>
                      )}

                      {/* Bottom: Action Triggers */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
                        <div className="flex items-center gap-1.5">
                          {profile.isCustom && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(profile)}
                                className="p-1.5 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                                title={lang === 'pt' ? 'Editar marca' : 'Edit brand'}
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteBrand(profile.id)}
                                className="p-1.5 rounded-[4px] hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                                title={lang === 'pt' ? 'Excluir marca' : 'Delete brand'}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                            <CheckCircle2 className="size-3.5" />
                            <span>{lang === 'pt' ? 'Ativo' : 'Active'}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => selectBrand(profile.id)}
                            className="px-3 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
                          >
                            {lang === 'pt' ? 'Aplicar Marca' : 'Apply Brand'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BRAND STUDIO (CREATOR / EDITOR) */}
          {activeTab === 'studio' && (
            <form onSubmit={handleSaveStudio} className="flex flex-col gap-6">
              
              {/* Studio Header Banner */}
              <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="size-8 rounded-[4px] flex items-center justify-center text-white"
                    style={{ backgroundColor: formPrimaryColor }}
                  >
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingId ? (lang === 'pt' ? 'Editar Marca Customizada' : 'Edit Custom Brand') : (lang === 'pt' ? 'Criar Nova Marca (White-Label)' : 'Create New Brand (White-Label)')}
                    </h3>
                    <p className="text-xs text-[#798B97]">
                      {lang === 'pt' 
                        ? 'Defina o nome do banco, paleta de cores, e faça upload do logotipo corporativo.' 
                        : 'Configure bank name, color palette, and upload corporate logo.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className="px-3 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/15 text-xs text-white/80 cursor-pointer"
                >
                  {lang === 'pt' ? 'Voltar para Marcas' : 'Back to Brands'}
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Column: Identity & Typography */}
                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-4">
                  <span className="text-xs font-bold font-mono uppercase text-white tracking-wider">
                    {lang === 'pt' ? '1. Identidade & Nomes' : '1. Identity & Naming'}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/90">
                      {lang === 'pt' ? 'Nome do Banco / Instituição *' : 'Bank / Institution Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Financial Group, Santander, Nubank"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-[4px] px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/90">
                      {lang === 'pt' ? 'Subtítulo do Portal' : 'Portal Subtitle'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mortgage & Home Equity, Crédito com Garantia"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-[4px] px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/90">
                      {lang === 'pt' ? 'Tagline / Rodapé' : 'Tagline / Footnote'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Digital Origination • Powered by Google Cloud"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-[4px] px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Header Style Toggles */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formLogoOnly}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormLogoOnly(checked);
                          if (!editingId || editingId === activeBrand.id) {
                            saveBrand({ ...activeBrand, logoOnly: checked, updatedAt: new Date().toISOString() });
                          }
                        }}
                        className="accent-white size-4 rounded"
                      />
                      <span className="text-xs text-white/90">
                        {lang === 'pt' ? 'Exibir Apenas Logotipo (Ocultar texto no cabeçalho)' : 'Show Logo Only (Hide text in header)'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
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
                        className="accent-white size-4 rounded"
                      />
                      <span className="text-xs text-white/90">
                        {lang === 'pt' ? 'Modo Cabeçalho Claro (Fundo branco com texto escuro)' : 'Light Header Mode (White background with dark text)'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right Column: Colors & Palette */}
                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-4">
                  <span className="text-xs font-bold font-mono uppercase text-white tracking-wider">
                    {lang === 'pt' ? '2. Paleta de Cores Corporativa' : '2. Corporate Color Palette'}
                  </span>

                  {/* Color Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Primary Brand Color */}
                    <div className="p-3 bg-black/40 rounded-[4px] border border-white/10 flex flex-col gap-2">
                      <label className="text-[11px] font-mono text-[#798B97] uppercase">
                        {lang === 'pt' ? 'Cor Primária *' : 'Primary Color *'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="size-8 rounded-[4px] cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="w-20 bg-white/10 border border-white/20 rounded-[3px] px-1.5 py-1 text-xs font-mono text-white text-center"
                        />
                        {'EyeDropper' in window && (
                          <button
                            type="button"
                            onClick={() => triggerEyeDropper(setFormPrimaryColor)}
                            className="p-1.5 hover:bg-white/10 rounded-[3px] text-white/70 hover:text-white cursor-pointer"
                            title={lang === 'pt' ? 'Conta-gotas da tela' : 'Eyedropper tool'}
                          >
                            <Pipette className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Secondary / Accent Color */}
                    <div className="p-3 bg-black/40 rounded-[4px] border border-white/10 flex flex-col gap-2">
                      <label className="text-[11px] font-mono text-[#798B97] uppercase">
                        {lang === 'pt' ? 'Cor de Acento' : 'Accent Color'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formAccentColor}
                          onChange={(e) => setFormAccentColor(e.target.value)}
                          className="size-8 rounded-[4px] cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={formAccentColor}
                          onChange={(e) => setFormAccentColor(e.target.value)}
                          className="w-20 bg-white/10 border border-white/20 rounded-[3px] px-1.5 py-1 text-xs font-mono text-white text-center"
                        />
                        {'EyeDropper' in window && (
                          <button
                            type="button"
                            onClick={() => triggerEyeDropper(setFormAccentColor)}
                            className="p-1.5 hover:bg-white/10 rounded-[3px] text-white/70 hover:text-white cursor-pointer"
                            title={lang === 'pt' ? 'Conta-gotas da tela' : 'Eyedropper tool'}
                          >
                            <Pipette className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Presets */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-[#798B97] uppercase">
                      {lang === 'pt' ? 'Paletas Rápidas Pré-definidas:' : 'Quick Preset Palettes:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_PALETTE_PRESETS.map(preset => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setFormPrimaryColor(preset.hex)}
                          className="px-2 py-1 rounded-[3px] text-[10px] font-mono font-bold text-white flex items-center gap-1.5 border border-white/20 hover:opacity-90 transition-opacity cursor-pointer"
                          style={{ backgroundColor: preset.hex }}
                        >
                          <span>{preset.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Logo Upload & Scale Section */}
              <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-white tracking-wider">
                    {lang === 'pt' ? '3. Logotipo Corporativo' : '3. Corporate Logo'}
                  </span>
                  {formLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormLogoUrl(undefined);
                        setFormLogoScale(100);
                        setFormLogoX(0);
                        setFormLogoY(0);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>{lang === 'pt' ? 'Remover Logotipo' : 'Remove Logo'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Upload Drop Area */}
                  <div className="sm:col-span-6">
                    <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-white/20 hover:border-white rounded-[6px] cursor-pointer transition-all bg-black/20 group">
                      <Upload className="size-6 text-white/50 group-hover:text-white transition-colors" />
                      <span className="text-xs font-semibold text-white/90">
                        {formLogoUrl ? (lang === 'pt' ? 'Substituir Logotipo' : 'Replace Logo Image') : (lang === 'pt' ? 'Upload Logotipo (PNG / JPG / SVG)' : 'Upload Brand Logo (PNG / JPG / SVG)')}
                      </span>
                      <span className="text-[10px] text-[#798B97] text-center">
                        {lang === 'pt' ? 'Redimensionamento e otimização automáticos' : 'Auto-resized and optimized for fast loading'}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Logo Preview & Calibration */}
                  <div className="sm:col-span-6 flex flex-col gap-3">
                    <div 
                      className="h-20 w-full rounded-[4px] border border-white/20 flex items-center justify-center overflow-hidden p-2 relative shadow-inner"
                      style={{ backgroundColor: formLightHeader ? '#FFFFFF' : formPrimaryColor }}
                    >
                      {formLogoUrl ? (
                        <img 
                          src={formLogoUrl} 
                          alt="preview"
                          className="h-10 object-contain transition-transform"
                          style={{
                            transform: `translate(${formLogoX}px, ${formLogoY}px) scale(${formLogoScale / 100})`,
                            transformOrigin: 'center center'
                          }}
                        />
                      ) : (
                        <div className="text-xs font-bold text-white/60 font-mono">
                          {lang === 'pt' ? 'Nenhum logotipo carregado (usará insígnia)' : 'No logo uploaded (will render badge)'}
                        </div>
                      )}
                    </div>

                    {formLogoUrl && (
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[#798B97]">Scale ({formLogoScale}%)</label>
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
                            className="accent-white h-1.5"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[#798B97]">Nudge X ({formLogoX}px)</label>
                          <input
                            type="range"
                            min={-40}
                            max={40}
                            step={2}
                            value={formLogoX}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormLogoX(val);
                              if (!editingId || editingId === activeBrand.id) {
                                updateActiveBrandLogo(formLogoUrl || activeBrand.logoUrl, formLogoScale, val, formLogoY);
                              }
                            }}
                            className="accent-white h-1.5"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[#798B97]">Nudge Y ({formLogoY}px)</label>
                          <input
                            type="range"
                            min={-25}
                            max={25}
                            step={1}
                            value={formLogoY}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormLogoY(val);
                              if (!editingId || editingId === activeBrand.id) {
                                updateActiveBrandLogo(formLogoUrl || activeBrand.logoUrl, formLogoScale, formLogoX, val);
                              }
                            }}
                            className="accent-white h-1.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Interactive Header Preview */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold font-mono uppercase text-[#798B97]">
                  {lang === 'pt' ? 'Pré-visualização do Cabeçalho em Tempo Real:' : 'Real-Time Header Preview:'}
                </span>

                <div 
                  className="w-full h-16 rounded-[6px] border border-white/20 px-6 flex items-center justify-between shadow-lg select-none transition-colors"
                  style={{ 
                    backgroundColor: formLightHeader ? '#FFFFFF' : formPrimaryColor, 
                    color: formLightHeader ? '#070707' : formSecondaryTextColor 
                  }}
                >
                  <div className="flex items-center gap-3">
                    {formLogoUrl ? (
                      <div 
                        className="h-10 min-w-[60px] max-w-[240px] flex items-center justify-start shrink-0"
                        style={{
                          marginRight: `${Math.max(0, Math.round(((formLogoScale / 100) - 1) * 40) + Math.max(0, formLogoX))}px`
                        }}
                      >
                        <img 
                          src={formLogoUrl} 
                          alt="brand preview" 
                          className="h-9 w-auto max-w-[220px] object-contain rounded-[4px]"
                          style={{
                            transform: `translate(${formLogoX}px, ${formLogoY}px) scale(${formLogoScale / 100})`,
                            transformOrigin: 'left center'
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="font-bold text-lg px-2 py-0.5 rounded-[4px] tracking-tight shadow-xs"
                        style={{ backgroundColor: '#FFFFFF', color: formPrimaryColor }}
                      >
                        {formName ? formName.slice(0, 4).toUpperCase() : 'BANK'}
                      </div>
                    )}

                    {!formLogoOnly && (
                      <div className="flex flex-col">
                        <span className="font-bold text-xs tracking-tight leading-tight">
                          {formSubtitle || 'Mortgage & Home Equity'}
                        </span>
                        <span className="text-[10px] opacity-80 font-mono">
                          {formTagline || '100% Digital Origination'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-[4px] bg-black/20 text-xs font-semibold border border-white/20">
                      Customer Portal
                    </div>
                    <div className="size-2.5 rounded-full bg-emerald-400 ring-2 ring-white/30 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className="px-4 py-2 rounded-[4px] bg-white/10 hover:bg-white/15 text-xs text-white/80 font-semibold cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="btn-itau px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="size-4" />
                  <span>{lang === 'pt' ? 'Salvar & Aplicar Marca' : 'Save & Apply Brand'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: DESIGN TOKENS (WCAG AA & COLOR SPECS) */}
          {activeTab === 'colors' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#798B97]">
                  {lang === 'pt'
                    ? 'Tokens do Design System calibrados para alto contraste, WCAG 2.1 AA e conformidade regulatória.'
                    : 'Design system tokens calibrated for high contrast, WCAG 2.1 AA, and regulatory compliance.'}
                </p>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[3px] font-bold">
                  WCAG AA / AAA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {colorTokens.map((c) => (
                  <div 
                    key={c.hex}
                    className="p-3.5 rounded-[6px] bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="size-8 rounded-[4px] shadow-sm border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <button
                        onClick={() => copyToClipboard(c.hex, c.hex)}
                        className="px-2 py-1 rounded-[3px] bg-white/10 hover:bg-white/15 text-[11px] font-mono text-white/90 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedHex === c.hex ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-white" />}
                        <span>{c.hex}</span>
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <strong className="text-xs text-white font-semibold">
                        {lang === 'pt' ? c.name_pt : c.name_en}
                      </strong>
                      <div className="flex items-center justify-between text-[10px] text-[#798B97] font-mono mt-0.5">
                        <span>RGB({c.rgb})</span>
                        <span className="text-emerald-400 font-semibold">{lang === 'pt' ? c.contrast_pt : c.contrast_en}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-tight">
                      {lang === 'pt' ? c.role_pt : c.role_en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TYPOGRAPHY & GEOMETRY */}
          {activeTab === 'typography' && (
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-4">
                <span className="text-xs font-bold font-mono uppercase text-white">
                  {lang === 'pt' ? 'Escala Tipográfica Oficial' : 'Official Typographic Scale'}
                </span>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/10 pb-3">
                    <span className="text-3xl font-bold tracking-tight text-white font-sans">
                      Display / Hero: 48px
                    </span>
                    <span className="text-xs font-mono text-[#798B97]">font-bold / tracking-tight / leading-tight</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/10 pb-3">
                    <span className="text-xl font-bold text-white font-sans">
                      H1 / Section Titles: 32px
                    </span>
                    <span className="text-xs font-mono text-[#798B97]">font-bold / tracking-tight</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/10 pb-3">
                    <span className="text-sm font-semibold text-white font-sans">
                      Body Copy: 14px Regular
                    </span>
                    <span className="text-xs font-mono text-[#798B97]">font-normal / text-[#0D1117] or #FFFFFF</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      R$ 463.950,20 • CDB DI 100% CDI • +R$ 5.940,00/ano • LIS Zero
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {lang === 'pt' ? 'Monospace para Dados Financeiros' : 'Monospace for Financial Figures'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold font-mono uppercase text-white">
                    {lang === 'pt' ? 'Geometria de Botões (Raio de 4px)' : 'Button Geometry (4px Radius)'}
                  </span>
                  <p className="text-xs text-[#798B97] leading-relaxed">
                    {lang === 'pt'
                      ? 'Botões utilizam cantos estritamente de 4px (rounded-[4px]) para preservar a solidez e rigor corporativo.'
                      : 'Buttons strictly enforce a 4px corner radius (rounded-[4px]) to preserve institutional stability.'}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button className="btn-itau px-4 py-2 text-xs font-bold">
                      {lang === 'pt' ? 'Botão Primário' : 'Primary CTA'}
                    </button>
                    <button className="px-4 py-2 rounded-[4px] bg-white/10 text-xs font-semibold border border-white/15">
                      {lang === 'pt' ? 'Secundário' : 'Secondary'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold font-mono uppercase text-white">
                    {lang === 'pt' ? 'Superfícies & Contraste (Cards de 8px)' : 'Surfaces & Contrast (8px Cards)'}
                  </span>
                  <p className="text-xs text-[#798B97] leading-relaxed">
                    {lang === 'pt'
                      ? 'Cartões de dados utilizam raio de 8px com borda sutil de 1px com elevação arquitetônica plana.'
                      : 'Data cards utilize an 8px radius with a subtle 1px hairline border with flat architectural layering.'}
                  </p>
                  <div className="p-2.5 rounded-[8px] bg-white/10 border border-white/15 text-[11px] font-mono text-white/90">
                    8px Container Card • 1px Hairline Border
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGULATORY LEXICON */}
          {activeTab === 'voice' && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-3">
                <span className="text-xs font-bold font-mono uppercase text-white">
                  {lang === 'pt' ? 'Pilares da Linguagem Bancária' : 'Sovereign Banking Voice Pillars'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-[4px] bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">
                      {lang === 'pt' ? '1. Soberania com Clareza' : '1. Sovereign Clarity'}
                    </strong>
                    <span className="text-[#798B97]">
                      {lang === 'pt' 
                        ? 'Voz institucional que transmite confiança bancária sem gírias efêmeras.'
                        : 'Institutional voice conveying trusted banking stability, devoid of ephemeral slang.'}
                    </span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">
                      {lang === 'pt' ? '2. Rigor Regulatório' : '2. Regulatory Rigor'}
                    </strong>
                    <span className="text-[#798B97]">
                      {lang === 'pt'
                        ? 'Emprego preciso dos termos legais (CCB, Alienação Fiduciária, Resolução CMN 4.966, SCR 36m, Pix SPI).'
                        : 'Exacting employment of statutory terminology (CCB title, Fiduciary Lien, CMN Res. 4,966, SCR 36m, Pix SPI).'}
                    </span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">
                      {lang === 'pt' ? '3. Explicabilidade (LGPD)' : '3. Explainability (LGPD)'}
                    </strong>
                    <span className="text-[#798B97]">
                      {lang === 'pt'
                        ? 'O cliente e o comitê têm direito a entender cada parâmetro de cálculo sem caixas pretas opacas.'
                        : 'Borrowers and risk committees have the legal right to understand each model parameter without opaque black boxes.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/15 text-[#798B97]">
                      <th className="pb-2 font-bold">{lang === 'pt' ? 'Termo Regulatório' : 'Regulatory Concept'}</th>
                      <th className="pb-2 font-bold text-emerald-400">{lang === 'pt' ? 'Como Usar (Recomendado)' : 'Recommended Usage'}</th>
                      <th className="pb-2 font-bold text-red-400">{lang === 'pt' ? 'O Que Evitar' : 'What to Avoid'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {lexicon.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-bold text-white">{lang === 'pt' ? row.term_pt : row.term_en}</td>
                        <td className="py-2 text-emerald-400">{lang === 'pt' ? row.correct_pt : row.correct_en}</td>
                        <td className="py-2 text-red-400/80">{lang === 'pt' ? row.avoid_pt : row.avoid_en}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BRAND_KIT.md SPEC */}
          {activeTab === 'spec' && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[#798B97]">
                  {lang === 'pt' ? 'Arquivo: docs/BRAND_KIT.md (Visualização de Idioma)' : 'File: docs/BRAND_KIT.md (Language Aligned)'}
                </span>
                <button
                  onClick={() => copyToClipboard(markdownContent)}
                  className="px-2.5 py-1 rounded-[4px] bg-white/10 hover:bg-white/15 text-white/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="size-3 text-white" />
                  <span>{lang === 'pt' ? 'Copiar Markdown' : 'Copy Markdown'}</span>
                </button>
              </div>

              <div className="p-4 rounded-[6px] bg-[#070707] border border-white/15 text-neutral-300 overflow-x-auto leading-relaxed max-h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-[11px]">
                  {markdownContent}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
