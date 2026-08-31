import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save, Sun, Moon, Settings, Palette, FileText, ExternalLink, X, Compass, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { ScenarioId } from '../types/itau_concierge';

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
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  currentLang,
  onToggleLang,
  theme,
  onToggleTheme,
  onReset,
  onSaveSession,
  isSaving = false,
  activeScenario: _activeScenario,
  onSelectScenario: _onSelectScenario
}) => {
  const t = translations[currentLang];
  const isDark = theme === 'dark';

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const adminPanelRef = useRef<HTMLDivElement>(null);

  // Close admin panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminPanelRef.current && !adminPanelRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
    };
    if (isAdminOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAdminOpen]);

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
        <div className="bg-brand-orange text-white font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-[4px] tracking-tight select-none flex-shrink-0 shadow-sm">
          itau
        </div>
        <div className={`h-5 w-[1px] hidden sm:block flex-shrink-0 ${isDark ? 'bg-white/15' : 'bg-slate-300'}`} />
        <span className={`text-sm sm:text-base md:text-lg font-bold tracking-tight truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
          {t.header.brandTitle}
        </span>
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

        {/* Admin Panel Gear Trigger & Dropdown */}
        <div className="relative" ref={adminPanelRef}>
          <button
            onClick={() => setIsAdminOpen(prev => !prev)}
            className={`w-9 h-9 rounded-[5px] flex items-center justify-center border box-border flex-shrink-0 transition-all ${
              isAdminOpen
                ? 'bg-brand-orange border-brand-orange text-white shadow-md'
                : isDark
                ? 'border-white/15 text-white/70 hover:text-white hover:bg-white/10'
                : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={t.header.adminPanelTitle}
            aria-label="Open Admin Panel"
            aria-expanded={isAdminOpen}
          >
            <Settings className={`w-4 h-4 transition-transform duration-300 ${isAdminOpen ? 'rotate-90 text-white' : ''}`} />
          </button>

          {/* Admin Panel Dropdown */}
          {isAdminOpen && (
            <div
              className={`absolute right-0 top-11 mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl ${
                isDark
                  ? 'bg-[#18181C]/95 border-white/[0.12] text-white shadow-black/80'
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
              }`}
            >
              {/* Header inside Panel */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/10 border border-white/15 text-white flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                      {t.header.adminPanelTitle}
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      {t.header.adminPanelSubtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                  aria-label="Close panel"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Brand Kit Button */}
                <a
                  href="/brandkit.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-full text-left p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 text-white'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white/20 transition-all">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-white transition-colors`}>
                        <span>{t.header.brandKitButton}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                        {t.header.brandKitDesc}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-white/80 group-hover:text-white mt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </a>

                {/* Demo Script Button */}
                <a
                  href="/demo_script.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-full text-left p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 text-white'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white/20 transition-all">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-white transition-colors`}>
                        <span>{t.header.demoScriptButton}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                        {t.header.demoScriptDesc}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-white/80 group-hover:text-white mt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </a>

                {/* Scenarios Matrix Button */}
                <a
                  href="/scenarios.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-full text-left p-3 rounded-lg border flex items-start justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 text-white'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white/20 transition-all">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-white transition-colors`}>
                        <span>{t.header.scenariosMatrixButton}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                        {t.header.scenariosMatrixDesc}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-white/80 group-hover:text-white mt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </a>
              </div>

              {/* Footer Note */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-white/[0.06] text-white/40' : 'border-slate-200 text-slate-400'}`}>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span>Itaú Concierge Admin Mode</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">
                  {t.header.openInNewTab}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
