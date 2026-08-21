import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  customerName?: string;
  segment?: string;
  activeAlertsCount?: number;
  onOpenVoiceAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customerName = "Roberto Silva",
  segment = "Itaú Personnalité",
  activeAlertsCount = 1,
  onOpenVoiceAssistant
}) => {
  return (
    <header className="w-full h-16 bg-brand-orange text-white px-6 flex items-center justify-between shadow-md z-50 sticky top-0">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="bg-white text-brand-orange font-black text-xl px-2.5 py-1 rounded-[4px] tracking-tighter select-none">
          itau
        </div>
        <div className="hidden md:flex flex-col border-l border-white/20 pl-4">
          <span className="font-bold text-sm tracking-tight leading-none text-white">Central de Segurança & Alertas</span>
          <span className="text-xs text-white/80 font-medium tracking-normal mt-0.5">{segment}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
        <a href="#overview" className="text-white hover:opacity-85 transition-opacity duration-150">
          Visão Geral
        </a>
        <a href="#mobile-app" className="text-white hover:opacity-85 transition-opacity duration-150">
          App Mobile
        </a>
        <a href="#alerts-feed" className="text-white hover:opacity-85 transition-opacity duration-150 flex items-center gap-1.5">
          Alertas Ativos
          {activeAlertsCount > 0 && (
            <span className="bg-hero-bg text-brand-orange text-xs font-bold px-1.5 py-0.5 rounded-[4px]">
              {activeAlertsCount}
            </span>
          )}
        </a>
        <a href="#decision-graph" className="text-white hover:opacity-85 transition-opacity duration-150">
          Grafo de Risco
        </a>
      </nav>

      {/* Action Triggers & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenVoiceAssistant}
          className="bg-hero-bg hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-[4px] flex items-center gap-2 border border-white/20 transition-all duration-150 active:scale-95"
          aria-label="Abrir Assistente de Voz com Inteligência Artificial"
        >
          <ShieldCheck className="w-4 h-4 text-brand-orange" />
          <span className="hidden sm:inline">Itaú Guard AI</span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-white/20">
          <div className="w-8 h-8 rounded-[4px] bg-white/10 flex items-center justify-center border border-white/20">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">{customerName}</span>
            <span className="text-[10px] text-white/80 font-mono">Ag. 7749 • CC 00912-8</span>
          </div>
        </div>
      </div>
    </header>
  );
};
