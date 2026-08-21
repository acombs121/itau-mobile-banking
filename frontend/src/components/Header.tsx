import React from 'react';
import { ShieldCheck, UserCheck, Globe } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  customerName?: string;
  segment?: string;
  activeAlertsCount?: number;
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenVoiceAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customerName = "Roberto Silva",
  segment = "Itaú Personnalité",
  activeAlertsCount = 1,
  currentLang,
  onToggleLang,
  onOpenVoiceAssistant
}) => {
  const t = translations[currentLang].header;

  return (
    <header className="w-full h-16 bg-brand-orange text-white px-6 flex items-center justify-between shadow-md z-50 sticky top-0">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="bg-white text-brand-orange font-black text-xl px-2.5 py-1 rounded-[4px] tracking-tighter select-none">
          itau
        </div>
        <div className="hidden md:flex flex-col border-l border-white/20 pl-4">
          <span className="font-bold text-sm tracking-tight leading-none text-white">{t.title}</span>
          <span className="text-xs text-white/80 font-medium tracking-normal mt-0.5">{segment}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
        <a href="#overview" className="text-white hover:opacity-85 transition-opacity duration-150">
          {t.navOverview}
        </a>
        <a href="#mobile-app" className="text-white hover:opacity-85 transition-opacity duration-150">
          {t.navMobile}
        </a>
        <a href="#alerts-feed" className="text-white hover:opacity-85 transition-opacity duration-150 flex items-center gap-1.5">
          {t.navAlerts}
          {activeAlertsCount > 0 && (
            <span className="bg-hero-bg text-brand-orange text-xs font-bold px-1.5 py-0.5 rounded-[4px]">
              {activeAlertsCount}
            </span>
          )}
        </a>
        <a href="#decision-graph" className="text-white hover:opacity-85 transition-opacity duration-150">
          {t.navGraph}
        </a>
      </nav>

      {/* Action Triggers, Language Switcher & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Language Switcher (PT / EN) */}
        <div className="flex items-center bg-black/25 border border-white/20 rounded-[4px] p-0.5">
          <button
            onClick={() => onToggleLang('pt')}
            className={`px-2 py-1 text-xs font-bold rounded-[3px] transition-all flex items-center gap-1 ${
              currentLang === 'pt'
                ? 'bg-hero-bg text-white shadow-sm'
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
                ? 'bg-hero-bg text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Switch to English"
          >
            <Globe className="w-3 h-3" />
            EN
          </button>
        </div>

        {/* AI Assistant CTA */}
        <button
          onClick={onOpenVoiceAssistant}
          className="bg-hero-bg hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-[4px] flex items-center gap-2 border border-white/20 transition-all duration-150 active:scale-95"
          aria-label={t.aiButton}
        >
          <ShieldCheck className="w-4 h-4 text-brand-orange" />
          <span className="hidden sm:inline">{t.aiButton}</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/20">
          <div className="w-8 h-8 rounded-[4px] bg-white/10 flex items-center justify-center border border-white/20">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">{customerName}</span>
            <span className="text-[10px] text-white/80 font-mono">{t.agencyAccount}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
