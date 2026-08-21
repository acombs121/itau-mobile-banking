import React from 'react';
import { PhoneCall, PhoneOff, RotateCcw, Save, Globe } from 'lucide-react';
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
    <header className="w-full h-16 bg-[#070707] border-b border-white/15 px-6 flex items-center justify-between text-white z-40 sticky top-0">
      
      {/* Brand & Context */}
      <div className="flex items-center gap-4">
        <div className="bg-brand-orange text-white font-black text-lg px-2.5 py-0.5 rounded-[4px] tracking-tighter select-none">
          itau
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm text-white tracking-tight leading-none">{t.brandTitle}</h1>
            <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded border border-brand-orange/30">
              Personnalité
            </span>
          </div>
          <span className="text-[11px] text-text-muted mt-0.5">{t.brandSub}</span>
        </div>
      </div>

      {/* Center / Right Action Controls */}
      <div className="flex items-center gap-3">
        
        {/* Language Switcher */}
        <div className="flex items-center bg-white/5 border border-white/20 rounded-[4px] p-0.5">
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-1 text-xs font-bold rounded-[3px] transition-all flex items-center gap-1 ${
              currentLang === 'pt'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Mudar para Português"
          >
            <Globe className="w-3 h-3" />
            PT
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-1 text-xs font-bold rounded-[3px] transition-all flex items-center gap-1 ${
              currentLang === 'en'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Switch to English"
          >
            <Globe className="w-3 h-3" />
            EN
          </button>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onReset}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-[4px] border border-white/15 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
          <span>{t.resetSession}</span>
        </button>

        {/* Save Session */}
        <button
          onClick={onSaveSession}
          disabled={isSaving}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-[4px] border border-white/15 transition-all"
        >
          <Save className="w-3.5 h-3.5 text-text-muted" />
          <span>{isSaving ? 'Salvando...' : t.saveSession}</span>
        </button>

        {/* Call AI Assistant Button (Amex Style) */}
        <button
          onClick={onToggleCall}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs font-bold transition-all shadow-md active:scale-95 ${
            isCallActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-brand-orange/30'
          }`}
        >
          {isCallActive ? (
            <>
              <PhoneOff className="w-4 h-4" />
              <span>{t.hangUp}</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4" />
              <span>{t.callAi}</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
};
