import React from 'react';
import { PhoneCall, PhoneOff, RotateCcw, Save } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface CockpitHeaderProps {
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  isCallActive: boolean;
  onToggleCall: () => void;
  onReset: () => void;
  onSaveSession: () => void;
  isSaving?: boolean;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  currentLang,
  onToggleLang,
  isCallActive,
  onToggleCall,
  onReset,
  onSaveSession,
  isSaving = false
}) => {
  const t = translations[currentLang].header;

  return (
    <header className="w-full h-14 bg-[#070707] border-b border-white/[0.08] px-6 flex items-center justify-between text-white z-40 sticky top-0">
      
      {/* Brand & Context */}
      <div className="flex items-center gap-3.5">
        <div className="bg-brand-orange text-white font-bold text-xs px-2 py-1 rounded-[3px] tracking-tight select-none">
          itau
        </div>
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
        <span className="text-xs font-medium text-white/90 tracking-tight">
          {t.brandTitle}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Language Switcher */}
        <div className="flex items-center border border-white/10 rounded-[3px] p-0.5 bg-black/40">
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] transition-colors ${
              currentLang === 'pt'
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] transition-colors ${
              currentLang === 'en'
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            EN
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="text-white/40 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          title={t.resetSession}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">{t.resetSession}</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveSession}
          disabled={isSaving}
          className="text-white/40 hover:text-white text-xs flex items-center gap-1.5 transition-colors disabled:opacity-30"
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
