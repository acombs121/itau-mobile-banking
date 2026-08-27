import React from 'react';
import { RotateCcw, Save, Sun, Moon } from 'lucide-react';
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
        
        {/* Brand Kit Link */}
        <a
          href="/brandkit.html"
          target="_blank"
          rel="noopener noreferrer"
          className={`h-9 px-2.5 rounded-[5px] text-xs font-medium border flex items-center gap-1.5 transition-colors flex-shrink-0 ${
            isDark
              ? 'border-white/15 text-white/70 hover:text-white hover:bg-white/[0.05]'
              : 'border-slate-300 text-slate-700 hover:text-black hover:bg-slate-50'
          }`}
          title="Open Official Brand Kit & Design System"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
          <span className="hidden sm:inline">Brand Kit</span>
        </a>

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

      </div>

    </header>
  );
};
