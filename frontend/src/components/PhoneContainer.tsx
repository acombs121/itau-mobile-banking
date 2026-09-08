import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff, Lock, Flashlight, Camera } from 'lucide-react';
import {
  CheckingBalanceCard,
  ScheduledPaymentsCard,
  CdbInvestmentsCard,
  CreditCardDetailCard,
  InstitutionBalancesCard,
  OpenFinanceSelectCard,
  OpenFinanceCdiCard,
  OpenFinanceTransferConfirmedCard,
  OpenFinanceOptimizerCard,
  CashFlowForecastCard,
  TravelShieldCard,
  CardBenefitsCard,
} from './phone/cards';
import { BankingProfile } from '../types/banking';
import { ScenarioId } from '../types/itau_concierge';
import { Language } from '../i18n/translations';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { useBrand, getBrandSegment, getBrandAccountPrefix } from '../context/BrandContext';
import { useLanguage } from '../context/LanguageContext';

interface PhoneContainerProps {
  profile: BankingProfile;
  currentLang: Language;
  theme: 'dark' | 'light';
  activeScenario: ScenarioId;
  isVoiceCallActive: boolean;
  onToggleVoiceCall: () => void;
  onActionClick: (action: string, targetId?: string, customPayload?: Record<string, any>) => void;
  isTravelModeActive?: boolean;
  isCdbSweepScheduled?: boolean;
  isCdiTransferDone?: boolean;
  isOpenFinanceRefiDone?: boolean;
  isPixBlocked?: boolean;
  activeRunningAgentId?: string | null;
  activeDynamicCardId?: string | null;
  agentStates?: Record<string, { status: 'idle' | 'running' | 'completed'; lastRun?: string; liveResult?: Record<string, any> }>;
  onUserQuery?: (query: string) => void;
  onTurnComplete?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
  onLock?: () => void;
  onPredictiveAlertClick?: () => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  currentLang: _currentLang,
  theme,
  activeScenario: _activeScenario,
  isVoiceCallActive,
  onToggleVoiceCall,
  onActionClick,
  isTravelModeActive = false,
  isCdbSweepScheduled = false,
  isCdiTransferDone: _isCdiTransferDone = false,
  isOpenFinanceRefiDone = false,
  activeRunningAgentId = null,
  activeDynamicCardId = null,
  agentStates: _agentStates = {},
  onUserQuery,
  onTurnComplete,
  isLocked = false,
  onUnlock,
  onLock,
  onPredictiveAlertClick
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const { activeBrand } = useBrand();
  const { t, lang: currentLang } = useLanguage();
  const isDark = theme === 'dark';

  const competitorsSummary = useMemo(() => {
    const bId = activeBrand.id.toLowerCase();
    if (bId.includes('btg')) {
      return {
        short_pt: 'Itaú e XP',
        short_en: 'Itaú and XP',
        detailed: 'Banco Itaú (R$ 120k) + XP Investimentos (R$ 210k)'
      };
    }
    if (bId === 'itau') {
      return {
        short_pt: 'BTG Pactual e XP',
        short_en: 'BTG Pactual and XP',
        detailed: 'BTG Pactual (R$ 120k) + XP Investimentos (R$ 210k)'
      };
    }
    return {
      short_pt: 'Itaú e BTG Pactual',
      short_en: 'Itaú and BTG Pactual',
      detailed: 'Banco Itaú (R$ 120k) + BTG Pactual (R$ 210k)'
    };
  }, [activeBrand.id]);

  // Automatically pop up relevant dynamic card when an agent runs or completes
  useEffect(() => {
    if (activeDynamicCardId) {
      setActiveCardId(activeDynamicCardId);
    } else if (activeRunningAgentId) {
      setActiveCardId(activeRunningAgentId);
    }
  }, [activeDynamicCardId, activeRunningAgentId]);

  // Connect directly to Gemini Multimodal Live WebSocket
  const {
    isListening,
    isSpeaking,
    subscribeAudioLevels,
    connect,
    disconnect,
    startMicrophone,
    stopMicrophone,
    interrupt,
  } = useGeminiLive({
    lang: currentLang,
    brandId: activeBrand.id,
    brandName: activeBrand.name,
    onToolCall: (toolName, toolArgs, toolPayload) => {
      console.log("Executing sub-agent tool call:", toolName, toolArgs, toolPayload);
      onActionClick(toolName, undefined, { ...toolPayload, query_type: toolArgs?.query_type });
      if (toolName === 'get_account_info') {
        const qt = toolArgs?.query_type;
        if (qt === 'checking' || qt === 'checking_account') {
          setActiveCardId('balance_checking');
        } else if (qt === 'cdb_investments' || qt === 'savings') {
          setActiveCardId('balance_cdb');
        } else if (qt === 'card_limits' || qt === 'card') {
          setActiveCardId('balance_card');
        } else if (qt === 'scheduled_debits') {
          setActiveCardId('scheduled_payments');
        } else {
          // Strictly Itaú balances only!
          setActiveCardId('itau_balances');
        }
      }
      else if (toolName === 'pull_open_finance') {
        setActiveCardId('open_finance_select');
      }
      else if (toolName === 'quote_open_finance_cdi') {
        setActiveCardId('open_finance_cdi');
      }
      else if (toolName === 'confirm_cdi_transfer') {
        setActiveCardId('open_finance_transfer_confirmed');
      }
      else if (toolName === 'explain_predictive_alert' || toolName === 'sweep_cdb' || toolName === 'confirm_cdb_sweep') {
        setActiveCardId('cash_flow_forecast_agent');
      }
      else if (toolName === 'activate_travel_mode') {
        setActiveCardId('travel_shield_agent');
      }
      else if (toolName === 'get_card_benefits') {
        setActiveCardId('card_benefits_agent');
      }
      else if (toolName === 'refinance_open_finance') {
        setActiveCardId('open_finance_optimizer');
      }
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
              <div className={`w-1.5 h-1.5 rounded-full ${isVoiceCallActive ? 'bg-brand-orange' : 'bg-transparent'}`}></div>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
              <span>5G</span>
              <div className="w-4 h-2 rounded-[2px] border border-current flex items-center p-0.5">
                <div className="w-full h-full bg-current rounded-[1px]"></div>
              </div>
            </div>
          </div>

          {isLocked ? (
            /* Executive Smartphone Lock Screen with Predictive Balance Alert */
            <div className="flex-1 w-full flex flex-col justify-between p-5 select-none relative overflow-hidden animate-fadeIn">
              <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#18181E] via-[#0E0E12] to-[#070708]' : 'bg-gradient-to-b from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0]'}`} />

              {/* Lock Header: Padlock, Big Clock, Date */}
              <div className="relative z-10 flex flex-col items-center pt-2">
                <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  <Lock className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{currentLang === 'en' ? 'Locked' : 'Bloqueado'}</span>
                </div>
                <div className={`text-5xl sm:text-6xl font-light tracking-tight mb-1 font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  14:32
                </div>
                <div className={`text-xs font-medium tracking-wide ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  {currentLang === 'en' ? 'Thursday, August 28' : 'Quinta-feira, 28 de agosto'}
                </div>
              </div>

              {/* Center Lock Screen Notification Banner: Predictive Balance Alert */}
              <div className="relative z-10 my-auto py-2">
                <div 
                  onClick={() => {
                    if (onPredictiveAlertClick) {
                      onPredictiveAlertClick();
                    } else if (onUnlock) {
                      onUnlock();
                    }
                  }}
                  className={`w-full rounded-[18px] p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group backdrop-blur-xl border ${
                    isDark
                      ? 'bg-[#1A1A22]/95 border-brand-orange/40 hover:border-brand-orange'
                      : 'bg-white/95 border-brand-orange/50 hover:border-brand-orange'
                  }`}
                  style={{
                    boxShadow: isDark
                      ? '0 12px 40px rgba(0,0,0,0.85), 0 0 24px rgb(var(--brand-orange-rgb) / 0.18)'
                      : '0 12px 32px rgba(0,0,0,0.08), 0 0 20px rgb(var(--brand-orange-rgb) / 0.12)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-[5px] bg-brand-orange text-white font-black text-[9px] flex items-center justify-center shadow-sm overflow-hidden">
                        {activeBrand.logoUrl ? (
                          <img src={activeBrand.logoUrl} alt={activeBrand.name} className="max-h-3.5 object-contain" />
                        ) : (
                          getBrandAccountPrefix(activeBrand.id)
                        )}
                      </div>
                      <span className={`text-[10px] font-bold tracking-wider uppercase font-sans ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                        {getBrandSegment(activeBrand).toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      {currentLang === 'en' ? 'now' : 'agora'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse flex-shrink-0" />
                    <h4 className={`text-xs font-bold tracking-tight group-hover:text-brand-orange transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentLang === 'en' ? 'Predictive Balance Alert' : 'Alerta Preventivo de Saldo'}
                    </h4>
                  </div>

                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
                    {currentLang === 'en'
                      ? 'Scheduled debits of R$ 38,000.00 on Thursday will exceed your checking balance. Tap to review with Cash Flow Agent.'
                      : 'Débitos agendados de R$ 38.000,00 na quinta-feira excederão o saldo em conta corrente. Toque para revisar com o Agente de Fluxo de Caixa.'}
                  </p>
                </div>
              </div>

              {/* Bottom Actions & Unlock Handle */}
              <div className="relative z-10 flex flex-col items-center gap-3 pb-1">
                <div className="w-full flex items-center justify-between px-2">
                  <div 
                    className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                      isDark ? 'bg-white/10 text-white/80' : 'bg-black/5 text-slate-700 border border-slate-200'
                    }`}
                    title="Flashlight"
                  >
                    <Flashlight className="w-4 h-4" />
                  </div>
                  <div 
                    className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                      isDark ? 'bg-white/10 text-white/80' : 'bg-black/5 text-slate-700 border border-slate-200'
                    }`}
                    title="Camera"
                  >
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => onUnlock?.()}
                  className="flex flex-col items-center gap-1.5 cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                >
                  <span className={`text-[9.5px] font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    {currentLang === 'en' ? 'Tap alert above or click bar to unlock' : 'Toque no alerta ou na barra para desbloquear'}
                  </span>
                  <div className={`w-28 h-1 rounded-full transition-colors ${isDark ? 'bg-white/50 hover:bg-white' : 'bg-slate-400 hover:bg-slate-600'}`} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Minimalist In-App Top Bar */}
              <div className={`px-5 pt-3 pb-2.5 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100 bg-slate-50/50'}`}>
                <span className={`text-xs sm:text-sm font-semibold truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                  {profile.customer_name}
                </span>
                <button
                  onClick={() => onLock?.()}
                  title={currentLang === 'en' ? 'Lock Phone Simulator' : 'Bloquear Simulador'}
                  className={`p-1 rounded-[6px] transition-colors ${
                    isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>

          {/* Quick Actions 4-Grid Top Bar */}
          <div className={`px-4 pt-3.5 pb-3 border-b flex-shrink-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
            <div className={`grid grid-cols-4 gap-1.5 text-center text-[11px] font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <div 
                onClick={() => {
                  onActionClick('get_account_info');
                  setActiveCardId('balance_checking');
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

          {/* Dynamic Center Canvas: Optically Positioned In-Canvas Agent Cards or Watermark */}
          <div className={`flex-1 w-full px-4 pt-3 pb-2 flex flex-col justify-start items-center min-h-0 overflow-y-auto custom-scrollbar font-sans ${isDark ? 'bg-transparent' : 'bg-slate-50/40'}`}>
            
            {/* 1. Specific Checking Balance Card */}
            {activeCardId === 'balance_checking' ? (
              <CheckingBalanceCard
                isDark={isDark}
                currentLang={currentLang}
                onClose={() => setActiveCardId(null)}
                onOpenScheduledPayments={() => setActiveCardId('scheduled_payments')}
              />
            ) : (activeCardId === 'scheduled_payments' || activeCardId === 'balance_scheduled_payments') ? (
              <ScheduledPaymentsCard
                isDark={isDark}
                currentLang={currentLang}
                onClose={() => setActiveCardId(null)}
              />
            ) : activeCardId === 'balance_cdb' ? (
              <CdbInvestmentsCard
                isDark={isDark}
                currentLang={currentLang}
                onClose={() => setActiveCardId(null)}
              />
            ) : activeCardId === 'balance_card' ? (
              <CreditCardDetailCard
                isDark={isDark}
                currentLang={currentLang}
                onClose={() => setActiveCardId(null)}
              />
            ) : (activeCardId === 'itau_balances' || activeCardId === 'account_info_agent') ? (
              <InstitutionBalancesCard
                isDark={isDark}
                currentLang={currentLang}
                activeBrand={activeBrand}
                onClose={() => setActiveCardId(null)}
                onPullOpenFinance={() => onActionClick('pull_open_finance')}
              />
            ) : activeCardId === 'open_finance_select' ? (
              <OpenFinanceSelectCard
                isDark={isDark}
                currentLang={currentLang}
                activeBrand={activeBrand}
                competitorsSummary={competitorsSummary}
                onClose={() => setActiveCardId(null)}
                onActionClick={onActionClick}
              />
            ) : activeCardId === 'open_finance_cdi' ? (
              <OpenFinanceCdiCard
                isDark={isDark}
                currentLang={currentLang}
                activeBrand={activeBrand}
                competitorsSummary={competitorsSummary}
                onClose={() => setActiveCardId(null)}
                onActionClick={onActionClick}
              />
            ) : activeCardId === 'open_finance_transfer_confirmed' ? (
              <OpenFinanceTransferConfirmedCard
                isDark={isDark}
                currentLang={currentLang}
                activeBrand={activeBrand}
                onClose={() => setActiveCardId(null)}
              />
            ) : activeCardId === 'cash_flow_forecast_agent' ? (
              <CashFlowForecastCard
                isDark={isDark}
                currentLang={currentLang}
                isCdbSweepScheduled={isCdbSweepScheduled}
                onClose={() => setActiveCardId(null)}
                onActionClick={onActionClick}
              />
            ) : activeCardId === 'travel_shield_agent' ? (
              <TravelShieldCard
                isDark={isDark}
                currentLang={currentLang}
                isTravelModeActive={isTravelModeActive}
                onClose={() => setActiveCardId(null)}
                onActionClick={onActionClick}
              />
            ) : activeCardId === 'card_benefits_agent' ? (
              <CardBenefitsCard
                isDark={isDark}
                currentLang={currentLang}
                onClose={() => setActiveCardId(null)}
              />
            ) : activeCardId === 'open_finance_optimizer' ? (
              <OpenFinanceOptimizerCard
                isDark={isDark}
                currentLang={currentLang}
                activeBrand={activeBrand}
                isOpenFinanceRefiDone={isOpenFinanceRefiDone}
                onClose={() => setActiveCardId(null)}
                onActionClick={onActionClick}
              />
            ) : (
              /* Centered 70% Transparent Brand Logo Watermark */
              <div className="my-auto flex items-center justify-center select-none pointer-events-none">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-brand-orange text-white flex items-center justify-center font-bold text-4xl sm:text-5xl opacity-30 shadow-2xl tracking-tighter p-4 overflow-hidden">
                  {activeBrand.logoUrl ? (
                    <img src={activeBrand.logoUrl} alt={activeBrand.name} className="max-h-full max-w-full object-contain filter brightness-0 invert" />
                  ) : (
                    activeBrand.id === 'itau' ? 'itau' : getBrandAccountPrefix(activeBrand.id)
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Voice Concierge Bar (Placed above Footer Nav) */}
          <div className={`px-3.5 py-2 border-t flex items-center justify-between gap-2.5 flex-shrink-0 transition-colors ${
            isDark ? 'border-white/[0.08] bg-[#121217]' : 'border-slate-200 bg-slate-100/90'
          }`}>
            {/* Left Column: Branding & Status (Click to interrupt when speaking) */}
            <div 
              onClick={isSpeaking ? interrupt : undefined}
              className={`flex items-center gap-2 select-none min-w-0 flex-1 ${isSpeaking ? 'cursor-pointer' : ''}`}
              title={isSpeaking ? (currentLang === 'en' ? "Tap to interrupt" : "Toque para interromper") : undefined}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSpeaking ? 'bg-emerald-400 animate-ping' : isListening ? 'bg-brand-orange animate-pulse' : 'bg-brand-orange'}`}></div>
              <span className={`text-xs font-semibold tracking-tight truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {isSpeaking
                  ? (currentLang === 'en' ? 'Speaking...' : 'Falando...')
                  : isListening
                  ? (currentLang === 'en' ? 'Listening...' : 'Ouvindo...')
                  : `${activeBrand.name.replace(/^Banco\s+/i, '')} Concierge`}
              </span>
            </div>

            {/* Center Column: Live Audio Waveform (Inline, non-overlapping) */}
            {isVoiceCallActive && (
              <div 
                onClick={isSpeaking ? interrupt : undefined}
                className={`flex items-center justify-center shrink-0 ${isSpeaking ? 'cursor-pointer' : ''}`}
                title={isSpeaking ? (currentLang === 'en' ? "Tap to interrupt" : "Toque para interromper") : undefined}
              >
                <AudioWaveformVisualizer
                  subscribeAudioLevels={subscribeAudioLevels}
                  isVoiceCallActive={isVoiceCallActive}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                />
              </div>
            )}

            {/* Right Column: Mic Trigger Button */}
            <div className="flex items-center justify-end shrink-0">
              <button
                onClick={() => {
                  if (isVoiceCallActive && isSpeaking) {
                    interrupt();
                  } else {
                    onToggleVoiceCall();
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isVoiceCallActive
                    ? isSpeaking
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40 cursor-pointer'
                      : isListening
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40'
                      : 'bg-brand-orange text-white shadow-md'
                    : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm'
                }`}
                style={{
                  boxShadow: isVoiceCallActive && (isSpeaking || isListening)
                    ? `0 0 18px ${activeBrand.primaryColor || 'var(--brand-primary)'}, 0 0 6px ${activeBrand.primaryColor || 'var(--brand-primary)'}`
                    : undefined
                }}
                title={
                  isVoiceCallActive
                    ? isSpeaking
                      ? (currentLang === 'en' ? "Tap to Interrupt Assistant" : "Toque para Interromper")
                      : (currentLang === 'en' ? "End Call" : "Encerrar Chamada")
                    : (currentLang === 'en' ? `Start ${activeBrand.name.replace(/^Banco\s+/i, '')} Voice` : `Iniciar ${activeBrand.name.replace(/^Banco\s+/i, '')} Voz`)
                }
              >
                {isVoiceCallActive && isSpeaking ? (
                  <MicOff className="w-4 h-4 animate-pulse" />
                ) : isVoiceCallActive && !isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
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
          <div className={`w-28 h-1 rounded-full mx-auto my-1 flex-shrink-0 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />

        </>
        )}

      </div>

      </div>

    </div>
  );
};

export default PhoneContainer;
