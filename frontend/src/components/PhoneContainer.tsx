import React, { useState, useEffect } from 'react';
import { QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff, X, Check, ShieldCheck, Plane, TrendingUp } from 'lucide-react';
import { BankingProfile } from '../types/banking';
import { IOSNotification, ScenarioId } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';
import { useGeminiLive } from '../hooks/useGeminiLive';

interface PhoneContainerProps {
  profile: BankingProfile;
  notifications?: IOSNotification[];
  currentLang: Language;
  theme: 'dark' | 'light';
  activeScenario: ScenarioId;
  isVoiceCallActive: boolean;
  onToggleVoiceCall: () => void;
  onActionClick: (action: string, targetId?: string) => void;
  isTravelModeActive?: boolean;
  isCdbSweepScheduled?: boolean;
  isOpenFinanceRefiDone?: boolean;
  isPixBlocked?: boolean;
  activeRunningAgentId?: string | null;
  agentStates?: Record<string, { status: 'idle' | 'running' | 'completed'; lastRun?: string; liveResult?: Record<string, any> }>;
  onUserQuery?: (query: string) => void;
  onTurnComplete?: () => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  currentLang,
  theme,
  activeScenario: _activeScenario,
  isVoiceCallActive,
  onToggleVoiceCall,
  onActionClick,
  isTravelModeActive = false,
  isCdbSweepScheduled = false,
  isOpenFinanceRefiDone = false,
  activeRunningAgentId = null,
  agentStates: _agentStates = {},
  onUserQuery,
  onTurnComplete
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const t = translations[currentLang];
  const isDark = theme === 'dark';

  // Automatically pop up relevant dynamic card when an agent runs or completes
  useEffect(() => {
    if (activeRunningAgentId) {
      setActiveCardId(activeRunningAgentId);
    }
  }, [activeRunningAgentId]);

  // Connect directly to Gemini Multimodal Live WebSocket
  const {
    isListening,
    isSpeaking,
    audioLevels,
    connect,
    disconnect,
    startMicrophone,
    stopMicrophone,
  } = useGeminiLive({
    lang: currentLang,
    onToolCall: (toolName) => {
      console.log("Executing sub-agent tool call:", toolName);
      onActionClick(toolName);
      if (toolName === 'get_account_info') setActiveCardId('account_info_agent');
      else if (toolName === 'sweep_cdb') setActiveCardId('cash_flow_forecast_agent');
      else if (toolName === 'activate_travel_mode') setActiveCardId('travel_shield_agent');
      else if (toolName === 'get_card_benefits') setActiveCardId('card_benefits_agent');
      else if (toolName === 'refinance_open_finance') setActiveCardId('open_finance_optimizer');
    },
    onActionTriggered: (action) => {
      onActionClick(action);
    },
    onUserQuery: (q) => {
      if (onUserQuery) onUserQuery(q);
    },
    onTurnComplete
  });

  // Handle call toggle & auto-start microphone
  useEffect(() => {
    if (isVoiceCallActive) {
      connect();
      startMicrophone();
    } else {
      stopMicrophone();
      disconnect();
    }
  }, [isVoiceCallActive]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      
      {/* Authentic Physical Side Hardware Buttons */}
      <div className="absolute -left-[4px] top-28 w-[4px] h-7 bg-[#454550] rounded-l-md shadow-sm" title="Volume Up" />
      <div className="absolute -left-[4px] top-38 w-[4px] h-10 bg-[#454550] rounded-l-md shadow-sm" title="Volume Down" />
      <div className="absolute -left-[4px] top-18 w-[4px] h-5 bg-[#454550] rounded-l-md shadow-sm" title="Action Button" />
      <div className="absolute -right-[4px] top-28 w-[4px] h-14 bg-[#454550] rounded-r-md shadow-sm" title="Power Button" />

      {/* Titanium Smartphone Outer Chassis */}
      <div
        className={`w-[375px] h-[730px] max-h-[86vh] rounded-[48px] p-[9px] flex flex-col relative transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-[#2E2E35] via-[#1E1E24] to-[#141418] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12)] border-[2.5px] border-[#3E3E48]'
            : 'bg-gradient-to-b from-[#E2E4E9] via-[#D1D5DB] to-[#9CA3AF] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] border-[2.5px] border-[#BCC1CD]'
        }`}
      >
        
        {/* OLED Screen Canvas */}
        <div
          className={`w-full h-full rounded-[39px] overflow-hidden flex flex-col min-h-0 relative border transition-colors duration-200 ${
            isDark
              ? 'bg-[#000000] text-white border-white/[0.04]'
              : 'bg-[#FFFFFF] text-slate-900 border-slate-200'
          }`}
        >

          {/* iOS Dynamic Island & Top Status Bar */}
          <div className={`w-full h-9 px-6 pt-1.5 flex justify-between items-center text-xs font-medium select-none flex-shrink-0 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            <span className="font-semibold text-[11px]">{t.phone.statusTime}</span>
            
            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto -mt-0.5 flex items-center justify-between px-2.5 shadow-inner border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/20"></div>
              <div className={`w-1.5 h-1.5 rounded-full ${isVoiceCallActive ? 'bg-brand-orange animate-pulse' : 'bg-emerald-500/80 animate-pulse'}`}></div>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
              <span>5G</span>
              <div className="w-4 h-2 rounded-[2px] border border-current flex items-center p-0.5">
                <div className="w-full h-full bg-current rounded-[1px]"></div>
              </div>
            </div>
          </div>

          {/* Minimalist In-App Top Bar */}
          <div className={`px-5 pt-3 pb-2.5 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100 bg-slate-50/50'}`}>
            <span className={`text-xs sm:text-sm font-semibold truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
              {profile.customer_name}
            </span>
          </div>

          {/* Quick Actions 4-Grid Top Bar */}
          <div className={`px-4 pt-3.5 pb-3 border-b flex-shrink-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
            <div className={`grid grid-cols-4 gap-1.5 text-center text-[11px] font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <div 
                onClick={() => {
                  onActionClick('get_account_info');
                  setActiveCardId('account_info_agent');
                }}
                className={`flex flex-col items-center gap-1 py-1 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <span>{t.phone.quickPix}</span>
              </div>
              <div 
                onClick={() => {
                  onActionClick('sweep_cdb');
                  setActiveCardId('cash_flow_forecast_agent');
                }}
                className={`flex flex-col items-center gap-1 py-1 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickPay}</span>
              </div>
              <div 
                onClick={() => {
                  onActionClick('refinance_open_finance');
                  setActiveCardId('open_finance_optimizer');
                }}
                className={`flex flex-col items-center gap-1 py-1 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickReceive}</span>
              </div>
              <div 
                onClick={() => {
                  onActionClick('get_card_benefits');
                  setActiveCardId('card_benefits_agent');
                }}
                className={`flex flex-col items-center gap-1 py-1 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickCards}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Center Canvas: Pop-Up Agent Cards or 70% Transparent Watermark */}
          <div className={`flex-1 w-full p-4 flex items-center justify-center min-h-0 overflow-y-auto ${isDark ? 'bg-transparent' : 'bg-slate-50/40'}`}>
            
            {/* 1. Account Info Dynamic Card */}
            {activeCardId === 'account_info_agent' ? (
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-emerald-400">
                      {currentLang === 'en' ? 'CONSOLIDATED POSITION' : 'POSIÇÃO CONSOLIDADA'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className="text-[10px] text-white/50 block">{currentLang === 'en' ? 'Checking Balance' : 'Conta Corrente'}</span>
                    <span className="text-lg font-bold font-mono text-white">R$ 48.950,20</span>
                  </div>

                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className="text-[10px] text-white/50 block">{currentLang === 'en' ? 'Daily Liquidity CDB DI (100% CDI)' : 'CDB DI Liquidez Diária (100% CDI)'}</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">R$ 85.000,00</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className="text-[9px] text-white/40 block">{currentLang === 'en' ? 'Black Card Limit' : 'Limite Black'}</span>
                      <span className="font-mono font-semibold text-[11px]">R$ 72.569,50</span>
                    </div>
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className="text-[9px] text-white/40 block">{currentLang === 'en' ? 'Debits Next Thu' : 'Débitos Quinta'}</span>
                      <span className="font-mono font-semibold text-[11px] text-amber-400">R$ 38.000,00</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'cash_flow_forecast_agent' ? (
              /* 2. Cash Flow & Yield Optimization Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-brand-orange/40 text-white' : 'bg-white border-brand-orange/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-brand-orange">
                      {currentLang === 'en' ? 'CASH FLOW & YIELD OPTIMIZER' : 'PREVISÃO DE SALDO & YIELD'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] border ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <span className="text-[10px] font-bold uppercase block">{currentLang === 'en' ? 'D+4 Projected Shortfall' : 'Déficit Projetado D+4'}</span>
                    <span className="text-base font-bold font-mono">-R$ 13.050,00</span>
                    <p className="text-[10px] opacity-80 mt-0.5">{currentLang === 'en' ? 'After Lisbon flight purchase & Thursday bill debits.' : 'Após compra de passagens e débitos de fatura na quinta.'}</p>
                  </div>

                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className="text-[10px] text-white/50 block">{currentLang === 'en' ? 'Yield Strategy' : 'Estratégia de Rendimento'}</span>
                    <span className="font-semibold text-emerald-400">R$ 85k {currentLang === 'en' ? 'earning 100% CDI until 06:00 BRT' : 'rendendo 100% CDI até 06:00'}</span>
                  </div>

                  <button
                    onClick={() => onActionClick('sweep_cdb')}
                    className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isCdbSweepScheduled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md'
                    }`}
                  >
                    {isCdbSweepScheduled ? <Check className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{isCdbSweepScheduled ? (currentLang === 'en' ? 'Sweep Scheduled ✓' : 'Resgate Agendado ✓') : (currentLang === 'en' ? 'Schedule CDB Sweep (R$ 15k)' : 'Agendar Resgate CDB (R$ 15k)')}</span>
                  </button>
                </div>
              </div>
            ) : activeCardId === 'travel_shield_agent' ? (
              /* 3. Travel Shield Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-amber-500/40 text-white' : 'bg-white border-amber-500/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-amber-400">
                      {currentLang === 'en' ? 'TRAVEL SHIELD & FRAUD DEFENSE' : 'AVISO VIAGEM & ANTIFRAUDE'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className="text-[10px] text-white/50 block">{currentLang === 'en' ? 'Destinations' : 'Destinos'}</span>
                    <span className="font-semibold text-white">🇵🇹 Portugal (LIS) & 🇪🇸 Espanha (MAD)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className="text-[9px] text-white/40 block">{currentLang === 'en' ? 'POS Spend Limit' : 'Limite POS'}</span>
                      <span className="font-mono font-bold text-amber-300">R$ 50.000,00</span>
                    </div>
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className="text-[9px] text-white/40 block">{currentLang === 'en' ? 'Declines' : 'Recusas'}</span>
                      <span className="font-semibold text-emerald-400">{currentLang === 'en' ? 'Pre-Suppressed' : 'Suprimidas'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onActionClick('activate_travel_mode')}
                    className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isTravelModeActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md'
                    }`}
                  >
                    {isTravelModeActive ? <Check className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
                    <span>{isTravelModeActive ? (currentLang === 'en' ? 'Travel Shield Active ✓' : 'Aviso de Viagem Ativo ✓') : (currentLang === 'en' ? 'Confirm Travel Notice' : 'Confirmar Aviso de Viagem')}</span>
                  </button>
                </div>
              </div>
            ) : activeCardId === 'card_benefits_agent' ? (
              /* 4. Mastercard Black Benefits Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-blue-500/40 text-white' : 'bg-white border-blue-500/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-blue-400">
                      {currentLang === 'en' ? 'MASTERCARD BLACK BENEFITS' : 'BENEFÍCIOS MASTERCARD BLACK'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <div className="font-semibold text-blue-300">🏥 {currentLang === 'en' ? 'Schengen Medical Insurance' : 'Seguro Médico Schengen'}</div>
                    <div className="text-[10px] text-white/60">€30.000 / USD $150.000 {currentLang === 'en' ? 'coverage included' : 'cobertura inclusa'}</div>
                  </div>

                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <div className="font-semibold text-white">✈️ {currentLang === 'en' ? 'VIP Airport Lounges' : 'Salas VIP Aeroportos'}</div>
                    <div className="text-[10px] text-white/60">{currentLang === 'en' ? 'GRU T3 Unlimited + 4 LoungeKey passes' : 'GRU T3 Ilimitado + 4 passes LoungeKey'}</div>
                  </div>

                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <div className="font-semibold text-emerald-400">🚗 {currentLang === 'en' ? 'Masterseguro Auto (CDW/LDW)' : 'Masterseguro de Automóveis'}</div>
                    <div className="text-[10px] text-white/60">{currentLang === 'en' ? 'Rental car damage protection + 24/7 Concierge' : 'Cobertura de locação + Concierge 24h'}</div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'open_finance_optimizer' ? (
              /* 5. Open Finance Optimizer Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-emerald-500/40 text-white' : 'bg-white border-emerald-500/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-emerald-400">
                      {currentLang === 'en' ? 'OPEN FINANCE ARBITRAGE' : 'OPORTUNIDADE OPEN FINANCE'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
                    <span className="text-[10px] font-bold uppercase block">{currentLang === 'en' ? 'Total Savings Projected' : 'Economia Total Projetada'}</span>
                    <span className="text-base font-bold font-mono">R$ 14.280,00</span>
                    <span className="text-[10px] block opacity-80 mt-0.5">{currentLang === 'en' ? 'Saves R$ 680.40 / month (11.2% -> 1.69% a.m.)' : 'Economia de R$ 680,40/mês (11,2% -> 1,69% a.m.)'}</span>
                  </div>

                  <button
                    onClick={() => onActionClick('refinance_open_finance')}
                    className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isOpenFinanceRefiDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-md'
                    }`}
                  >
                    {isOpenFinanceRefiDone ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>{isOpenFinanceRefiDone ? (currentLang === 'en' ? 'CCB Issued (R$ 14k Saved) ✓' : 'CCB Emitida (R$ 14k Salvos) ✓') : (currentLang === 'en' ? 'Issue Digital CCB (Lei 10.931)' : 'Emitir CCB Digital (Lei 10.931)')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Centered 70% Transparent Itaú Logo Watermark */
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-brand-orange text-white flex items-center justify-center font-bold text-4xl sm:text-5xl opacity-30 shadow-2xl tracking-tighter -translate-y-2 select-none pointer-events-none">
                itau
              </div>
            )}

          </div>

          {/* Bottom Voice Concierge Bar (Placed above Footer Nav) */}
          <div className={`px-4 py-2 border-t flex items-center justify-between flex-shrink-0 transition-colors ${
            isDark ? 'border-white/[0.08] bg-[#121217]' : 'border-slate-200 bg-slate-100/90'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0"></div>
              <span className={`text-xs font-semibold tracking-tight truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                Itaú Concierge
              </span>
              {isVoiceCallActive && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSpeaking
                    ? 'bg-brand-orange/20 text-brand-orange animate-pulse'
                    : isListening
                    ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {isSpeaking ? (currentLang === 'en' ? 'SPEAKING' : 'FALANDO') : isListening ? (currentLang === 'en' ? 'LISTENING' : 'OUVINDO') : 'ACTIVE'}
                </span>
              )}
            </div>

            {/* Live Audio Waveform (Appears beside the Mic button) */}
            {isVoiceCallActive && (
              <div className="flex items-center gap-1 h-6 px-2.5 bg-black/40 rounded-full border border-white/10 mx-2 animate-fadeIn flex-shrink-0">
                {audioLevels.slice(0, 7).map((level, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(22, level)}%`,
                      transition: 'height 0.1s ease-in-out'
                    }}
                    className={`w-1 rounded-full ${
                      isSpeaking
                        ? 'bg-brand-orange shadow-[0_0_8px_#FF6423]'
                        : isListening
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Mic Trigger Button */}
            <button
              onClick={onToggleVoiceCall}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                isVoiceCallActive
                  ? isSpeaking
                    ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40 shadow-[0_0_15px_#FF6423] animate-pulse'
                    : isListening
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/40 shadow-[0_0_15px_#10B981] animate-pulse'
                    : 'bg-brand-orange text-white shadow-md'
                  : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm'
              }`}
              title={isVoiceCallActive ? "Itaú Concierge Voice Active (Click to End)" : "Start Itaú Concierge Voice"}
            >
              {isVoiceCallActive && !isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Minimalist Bottom Bar */}
          <div className={`h-11 border-t px-6 flex items-center justify-around text-xs flex-shrink-0 ${
            isDark ? 'border-white/[0.06] text-white/50' : 'border-slate-200 bg-white text-slate-600'
          }`}>
            <button 
              onClick={() => setActiveNavTab('home')}
              className={activeNavTab === 'home' ? 'text-brand-orange font-bold' : (isDark ? 'hover:text-white' : 'hover:text-slate-900')}
            >
              {t.phone.navHome}
            </button>
            <button 
              onClick={() => setActiveNavTab('extrato')}
              className={activeNavTab === 'extrato' ? 'text-brand-orange font-bold' : (isDark ? 'hover:text-white' : 'hover:text-slate-900')}
            >
              {t.phone.navStatements}
            </button>
            <button 
              onClick={() => setActiveNavTab('pix')}
              className={activeNavTab === 'pix' ? 'text-brand-orange font-bold' : (isDark ? 'hover:text-white' : 'hover:text-slate-900')}
            >
              {t.phone.navPix}
            </button>
            <button 
              onClick={() => setActiveNavTab('cartoes')}
              className={activeNavTab === 'cartoes' ? 'text-brand-orange font-bold' : (isDark ? 'hover:text-white' : 'hover:text-slate-900')}
            >
              {t.phone.navCards}
            </button>
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="w-28 h-1 bg-white/20 rounded-full mx-auto my-1 flex-shrink-0" />

        </div>

      </div>

    </div>
  );
};

export default PhoneContainer;
