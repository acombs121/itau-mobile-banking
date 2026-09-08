import React from 'react';
import { RotateCcw, Save, Sun, Moon, Settings } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { ScenarioId } from '../types/itau_concierge';
import { useBrand } from '../context/BrandContext';

interface CockpitHeaderProps {
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onReset: () => void;
  onSaveSession: () => void;
  isSaving?: boolean;
  activeScenario?: ScenarioId;
  onSelectScenario?: (scenarioId: ScenarioId) => void;
  onOpenAdmin: () => void;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = React.memo(({
  currentLang,
  onToggleLang,
  theme,
  onToggleTheme,
  onReset,
  onSaveSession,
  isSaving = false,
  activeScenario: _activeScenario,
  onSelectScenario: _onSelectScenario,
  onOpenAdmin
}) => {
  const t = translations[currentLang];
  const isDark = theme === 'dark';
  const { activeBrand } = useBrand();

  const logoScaleFactor = (activeBrand.logoScale && activeBrand.logoScale > 2)
    ? activeBrand.logoScale / 100
    : (activeBrand.logoScale ?? 1);
  const logoOffsetX = activeBrand.logoX ?? 0;
  const logoOffsetY = activeBrand.logoY ?? 0;
  const logoExtraWidth = Math.max(0, Math.round((logoScaleFactor - 1) * 48) + Math.max(0, logoOffsetX));

  return (
    <header
      className={`w-full h-16 sm:h-18 px-4 sm:px-6 md:px-8 flex items-center justify-between z-40 sticky top-0 transition-colors duration-200 flex-shrink-0 ${
        isDark
          ? 'bg-[#151518] border-b border-white/[0.08] text-white'
          : 'bg-white border-b border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Left: Brand & Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        {activeBrand.logoUrl ? (
          <div 
            className="h-10 sm:h-12 min-w-[72px] sm:min-w-[88px] max-w-[280px] sm:max-w-[360px] flex items-center justify-start select-none shrink-0"
            style={{
              paddingRight: `${logoExtraWidth}px`
            }}
          >
            <img 
              src={activeBrand.logoUrl} 
              alt={activeBrand.name} 
              className="h-8 sm:h-9 w-auto max-w-[260px] sm:max-w-[340px] object-contain transition-transform" 
              style={{
                transformOrigin: 'left center',
                transform: `translate(${logoOffsetX}px, ${logoOffsetY}px) scale(${logoScaleFactor})`
              }}
            />
          </div>
        ) : (
          <div 
            className="font-extrabold text-sm sm:text-base px-4 py-2 rounded-[4px] tracking-tight select-none flex-shrink-0 shadow-sm transition-colors min-w-[64px] text-center"
            style={{
              backgroundColor: activeBrand.lightHeader ? '#FFFFFF' : (activeBrand.primaryColor || 'var(--brand-orange)'),
              color: activeBrand.lightHeader ? '#070707' : (activeBrand.secondaryTextColor || '#FFFFFF'),
            }}
          >
            {activeBrand.id === 'itau' ? 'itaú' : activeBrand.name}
          </div>
        )}

        {!activeBrand.logoOnly && (
          <>
            <div className={`h-5 w-[1px] hidden sm:block flex-shrink-0 ${isDark ? 'bg-white/15' : 'bg-slate-300'}`} />
            <div className="flex flex-col min-w-0">
              <span className={`text-sm sm:text-base font-bold tracking-tight truncate leading-tight ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                {activeBrand.name}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-mono tracking-wider truncate leading-none mt-0.5 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                {activeBrand.brandSubtitle || t.header.brandSub}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Language Switcher */}
        <div
          className={`h-9 flex items-center rounded-[5px] p-0.5 border box-border transition-colors ${
            isDark
              ? 'bg-black/50 border-white/15'
              : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => onToggleLang('pt')}
            className={`w-8 h-full text-xs font-semibold rounded-[4px] flex items-center justify-center transition-colors ${
              currentLang === 'pt'
                ? isDark
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDark
                ? 'text-white/40 hover:text-white/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`w-8 h-full text-xs font-semibold rounded-[4px] flex items-center justify-center transition-colors ${
              currentLang === 'en'
                ? isDark
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDark
                ? 'text-white/40 hover:text-white/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>

        {/* Monochrome Moon / Sun Button */}
        <button
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-[5px] flex items-center justify-center border box-border flex-shrink-0 transition-colors ${
            isDark
              ? 'border-white/15 text-white hover:bg-white/10'
              : 'border-slate-300 bg-white text-black hover:bg-slate-50'
          }`}
          title={isDark ? "Switch to Light Mode" : "Mudar para Modo Escuro"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-white stroke-[2]" />
          ) : (
            <Moon className="w-4 h-4 text-black stroke-[2]" />
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className={`h-9 px-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 ${
            isDark
              ? 'text-white/50 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title={t.header.resetSession}
        >
          <RotateCcw className="w-4 h-4 flex-shrink-0" />
          <span className="hidden xl:inline">{t.header.resetSession}</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveSession}
          disabled={isSaving}
          className={`h-9 px-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 flex-shrink-0 ${
            isDark
              ? 'text-white/50 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title={t.header.saveSession}
        >
          <Save className="w-4 h-4 flex-shrink-0" />
          <span className="hidden xl:inline">{isSaving ? '...' : t.header.saveSession}</span>
        </button>

        <div className={`h-5 w-[1px] ${isDark ? 'bg-white/15' : 'bg-slate-300'}`} />

        {/* Admin Panel Gear Trigger */}
        <button
          onClick={onOpenAdmin}
          className={`w-9 h-9 rounded-[5px] flex items-center justify-center border box-border flex-shrink-0 transition-all cursor-pointer ${
            isDark
              ? 'border-white/15 text-white/70 hover:text-white hover:bg-white/10'
              : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={t.header.adminPanelTitle}
          aria-label="Open Admin Panel"
        >
          <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
        </button>

      </div>

    </header>
  );
});

CockpitHeader.displayName = 'CockpitHeader';
