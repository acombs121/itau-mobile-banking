import React from 'react';
import { PhoneCall, PhoneOff, RotateCcw, Save, Sun, Moon } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface CockpitHeaderProps {
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isCallActive: boolean;
  onToggleCall: () => void;
  onReset: () => void;
  onSaveSession: () => void;
  isSaving?: boolean;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  currentLang,
  onToggleLang,
  theme,
  onToggleTheme,
  isCallActive,
  onToggleCall,
  onReset,
  onSaveSession,
  isSaving = false
}) => {
  const t = translations[currentLang].header;
  const isDark = theme === 'dark';

  return (
    <header
      className={`w-full h-16 sm:h-18 px-6 sm:px-8 flex items-center justify-between z-40 sticky top-0 transition-colors duration-200 flex-shrink-0 ${
        isDark
          ? 'bg-[#151518] border-b border-white/[0.08] text-white'
          : 'bg-white border-b border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Brand & Context - Prominent & Legible Typography */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="bg-brand-orange text-white font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-[4px] tracking-tight select-none flex-shrink-0 shadow-sm">
          itau
        </div>
        <div className={`h-5 w-[1px] hidden sm:block flex-shrink-0 ${isDark ? 'bg-white/15' : 'bg-slate-300'}`} />
        <span className={`text-sm sm:text-base md:text-lg font-bold tracking-tight truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
          {t.brandTitle}
        </span>
      </div>

      {/* Right Controls - Enhanced Scale & Proportions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
        
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
          className={`h-9 px-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 ${
            isDark
              ? 'text-white/50 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title={t.resetSession}
        >
          <RotateCcw className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">{t.resetSession}</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveSession}
          disabled={isSaving}
          className={`h-9 px-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 flex-shrink-0 ${
            isDark
              ? 'text-white/50 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title={t.saveSession}
        >
          <Save className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">{isSaving ? '...' : t.saveSession}</span>
        </button>

        {/* Primary Call AI Trigger */}
        <button
          onClick={onToggleCall}
          className={`w-40 sm:w-48 md:w-52 h-9 sm:h-10 px-3.5 rounded-[5px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all flex-shrink-0 select-none shadow-sm ${
            isCallActive
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-brand-orange hover:bg-brand-orange-hover text-white'
          }`}
        >
          {isCallActive ? (
            <>
              <PhoneOff className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t.hangUp}</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t.callAi}</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
};
