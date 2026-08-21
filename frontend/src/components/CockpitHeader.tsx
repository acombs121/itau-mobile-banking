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
      className={`w-full h-14 px-6 flex items-center justify-between z-40 sticky top-0 transition-colors duration-200 ${
        isDark
          ? 'bg-[#070707] border-b border-white/[0.08] text-white'
          : 'bg-white border-b border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Brand & Context */}
      <div className="flex items-center gap-3.5">
        <div className="bg-brand-orange text-white font-bold text-xs px-2 py-1 rounded-[3px] tracking-tight select-none">
          itau
        </div>
        <div className={`h-4 w-[1px] hidden sm:block ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <span className={`text-xs font-medium tracking-tight ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
          {t.brandTitle}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        
        {/* Language Switcher */}
        <div
          className={`flex items-center rounded-[3px] p-0.5 border transition-colors ${
            isDark
              ? 'bg-black/40 border-white/10'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] transition-colors ${
              currentLang === 'pt'
                ? isDark
                  ? 'bg-white/15 text-white'
                  : 'bg-white text-slate-900 shadow-sm font-semibold'
                : isDark
                ? 'text-white/40 hover:text-white/80'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] transition-colors ${
              currentLang === 'en'
                ? isDark
                  ? 'bg-white/15 text-white'
                  : 'bg-white text-slate-900 shadow-sm font-semibold'
                : isDark
                ? 'text-white/40 hover:text-white/80'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle (Monochrome Moon / Sun) */}
        <button
          onClick={onToggleTheme}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center border transition-colors ${
            isDark
              ? 'border-white/10 text-white hover:bg-white/10'
              : 'border-slate-300 text-black hover:bg-slate-100'
          }`}
          title={isDark ? "Switch to Light Mode" : "Mudar para Modo Escuro"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-white stroke-[1.75]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-black stroke-[1.75]" />
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className={`text-xs flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'text-white/40 hover:text-white'
              : 'text-slate-400 hover:text-slate-800'
          }`}
          title={t.resetSession}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">{t.resetSession}</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveSession}
          disabled={isSaving}
          className={`text-xs flex items-center gap-1.5 transition-colors disabled:opacity-30 ${
            isDark
              ? 'text-white/40 hover:text-white'
              : 'text-slate-400 hover:text-slate-800'
          }`}
          title={t.saveSession}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">{isSaving ? '...' : t.saveSession}</span>
        </button>

        {/* Primary Call AI Trigger */}
        <button
          onClick={onToggleCall}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
            isCallActive
              ? 'bg-rose-600 text-white'
              : 'bg-brand-orange hover:bg-brand-orange-hover text-white'
          }`}
        >
          {isCallActive ? (
            <>
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{t.hangUp}</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t.callAi}</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
};
