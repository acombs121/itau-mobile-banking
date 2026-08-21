import React from 'react';
import { ShieldCheck, Zap, AlertTriangle, ArrowRight, Smartphone, Activity } from 'lucide-react';

interface HeroSectionProps {
  onTriggerVoiceModal: () => void;
  onScrollToMobileApp: () => void;
  onScrollToGraph: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onTriggerVoiceModal,
  onScrollToMobileApp,
  onScrollToGraph
}) => {
  return (
    <section id="overview" className="w-full bg-hero-bg text-text-inverse particle-wave-bg py-12 md:py-16 px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* 12-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* 7 Columns: Headline, Metrics & Primary CTA */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white/5 border border-white/20 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
              Segurança Proativa em Tempo Real
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Proteção Bancária Inteligente & Central de Alertas
            </h1>

            {/* Body Copy */}
            <p className="text-sm md:text-base text-text-muted max-w-xl mb-8 leading-relaxed">
              O Banco Itaú monitora transações Pix, cartões virtuais e tentativas de login com inteligência artificial multimodal. Identifique anomalias em milissegundos e proteja seu patrimônio com resolução assistida por voz.
            </p>

            {/* Metric Announcements Row */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8 pb-6 border-b border-white/10">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white font-mono">&lt; 200ms</div>
                <div className="text-xs text-text-muted font-medium mt-1">Detecção de Anomalia</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brand-orange font-mono">100%</div>
                <div className="text-xs text-text-muted font-medium mt-1">Conformidade MED/BACEN</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-emerald-400 font-mono">Zero</div>
                <div className="text-xs text-text-muted font-medium mt-1">Falsos Positivos Críticos</div>
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onTriggerVoiceModal}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-3 rounded-[4px] font-bold text-sm flex items-center gap-2 transition-all duration-150 active:scale-98 shadow-lg shadow-brand-orange/20"
              >
                <ShieldCheck className="w-4 h-4" />
                Iniciar Resolução Itaú Guard AI
              </button>

              <button
                onClick={onScrollToMobileApp}
                className="bg-transparent hover:bg-white/5 text-white border border-white/20 px-6 py-3 rounded-[4px] font-semibold text-sm flex items-center gap-2 transition-all duration-150"
              >
                <Smartphone className="w-4 h-4 text-brand-orange" />
                Explorar App Mobile
              </button>
            </div>
          </div>

          {/* 5 Columns: Stacked Translucent Feature Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Card 1: Suspicious Pix Interception */}
            <div className="bg-black/40 border border-white/20 rounded-[8px] p-5 hover:border-white/50 hover:bg-white/5 transition-all duration-150">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[4px] bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Bloqueio Preventivo Pix</h2>
                    <span className="text-[11px] text-text-muted">Intervenção de Alto Risco</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-[4px] border border-rose-500/20">
                  R$ 4.200,00
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Transação para 'Eletro Tech SP' interceptada preventivamente devido à divergência de geolocalização e uso de proxy anônimo.
              </p>
            </div>

            {/* Card 2: Central Bank Night-Time Protection */}
            <div className="bg-black/40 border border-white/20 rounded-[8px] p-5 hover:border-white/50 hover:bg-white/5 transition-all duration-150">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[4px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Diretriz Noturna BACEN</h2>
                    <span className="text-[11px] text-text-muted">Limite Seguro Ativo (20h - 06h)</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[4px] border border-amber-500/20">
                  R$ 1.000,00 Max
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Proteção automática para horários sensíveis com autenticação biométrica por voz para elevação emergencial de limite.
              </p>
            </div>

            {/* Card 3: Decision Graph Reasoning */}
            <div 
              onClick={onScrollToGraph}
              className="bg-black/40 border border-white/20 rounded-[8px] p-5 hover:border-brand-orange hover:bg-white/5 transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[4px] bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Motor de Decisão em Grafo</h2>
                    <span className="text-[11px] text-text-muted">Visualizar Cadeia de Risco</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-orange" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
