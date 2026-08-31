import React, { useState, useEffect } from 'react';
import { QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff, X, Check, ShieldCheck, Plane, TrendingUp, ShieldPlus, Car, MapPin, Calendar, Building2, ChevronRight, Lock, Flashlight, Camera } from 'lucide-react';
import { BankingProfile } from '../types/banking';
import { ScenarioId } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

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
  currentLang,
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

  const t = translations[currentLang];
  const isDark = theme === 'dark';

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
    audioLevels,
    connect,
    disconnect,
    startMicrophone,
    stopMicrophone,
  } = useGeminiLive({
    lang: currentLang,
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
              <div className="absolute inset-0 bg-gradient-to-b from-[#18181E] via-[#0E0E12] to-[#070708] -z-10" />

              {/* Lock Header: Padlock, Big Clock, Date */}
              <div className="flex flex-col items-center pt-2">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium mb-1">
                  <Lock className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{currentLang === 'en' ? 'Locked' : 'Bloqueado'}</span>
                </div>
                <div className="text-5xl sm:text-6xl font-light tracking-tight text-white mb-1 font-sans">
                  14:32
                </div>
                <div className="text-xs font-medium text-white/70 tracking-wide">
                  {currentLang === 'en' ? 'Thursday, August 28' : 'Quinta-feira, 28 de agosto'}
                </div>
              </div>

              {/* Center Lock Screen Notification Banner: Predictive Balance Alert */}
              <div className="my-auto py-2">
                <div 
                  onClick={() => {
                    const alertQuery = currentLang === 'en'
                      ? "I saw the Predictive Balance Alert. What is this alert about?"
                      : "Vi o Alerta Preventivo de Saldo. Do que se trata este alerta?";
                    if (onPredictiveAlertClick) {
                      onPredictiveAlertClick();
                    } else if (onUnlock) {
                      onUnlock();
                    }
                    connect(alertQuery);
                  }}
                  className="w-full bg-[#1A1A22]/95 backdrop-blur-xl border border-brand-orange/40 hover:border-brand-orange rounded-[18px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(255,100,35,0.18)] cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-[5px] bg-brand-orange text-white font-black text-[9px] flex items-center justify-center shadow-sm">
                        itau
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-white/90 uppercase font-sans">
                        ITAÚ PERSONNALITÉ
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {currentLang === 'en' ? 'now' : 'agora'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse flex-shrink-0" />
                    <h4 className="text-xs font-bold text-white tracking-tight group-hover:text-brand-orange transition-colors">
                      {currentLang === 'en' ? 'Predictive Balance Alert' : 'Alerta Preventivo de Saldo'}
                    </h4>
                  </div>

                  <p className="text-[11px] text-white/80 leading-relaxed">
                    {currentLang === 'en'
                      ? 'Scheduled debits of R$ 38,000.00 on Thursday will exceed your checking balance. Tap to review with Cash Flow Agent.'
                      : 'Débitos agendados de R$ 38.000,00 na quinta-feira excederão o saldo em conta corrente. Toque para revisar com o Agente de Fluxo de Caixa.'}
                  </p>
                </div>
              </div>

              {/* Bottom Actions & Unlock Handle */}
              <div className="flex flex-col items-center gap-3 pb-1">
                <div className="w-full flex items-center justify-between px-2">
                  <div 
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80"
                    title="Flashlight"
                  >
                    <Flashlight className="w-4 h-4" />
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80"
                    title="Camera"
                  >
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => onUnlock?.()}
                  className="flex flex-col items-center gap-1.5 cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                >
                  <span className="text-[9.5px] text-white/50 font-medium">
                    {currentLang === 'en' ? 'Tap alert above or click bar to unlock' : 'Toque no alerta ou na barra para desbloquear'}
                  </span>
                  <div className="w-28 h-1 bg-white/50 rounded-full hover:bg-white transition-colors" />
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
              /* Specific Checking Balance Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'CHECKING ACCOUNT' : 'CONTA CORRENTE'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className={`p-3 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Available Balance' : 'Saldo Disponível'}</span>
                    <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 48.950,20</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Overdraft (LIS)' : 'Limite LIS'}</span>
                      <span className={`font-sans font-bold text-xs ${isDark ? 'text-white/80' : 'text-slate-700'}`}>R$ 10.000,00</span>
                    </div>
                    <button 
                       onClick={() => setActiveCardId('scheduled_payments')}
                      className={`p-2 rounded-[8px] text-left transition-all hover:ring-1 hover:ring-brand-orange/40 cursor-pointer ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Debits Next Thu' : 'Débitos Quinta'}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-brand-orange/70" />
                      </div>
                      <span className="font-sans font-bold text-xs text-brand-orange">R$ 38.000,00</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (activeCardId === 'scheduled_payments' || activeCardId === 'balance_scheduled_payments') ? (
              /* Scheduled Payments & Debits Itemized List Card - Simplified Executive Palette */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'SCHEDULED PAYMENTS' : 'PAGAMENTOS AGENDADOS'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  {/* Total Header Summary */}
                  <div className={`p-2.5 rounded-[10px] flex items-center justify-between ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div>
                      <span className={`text-[9.5px] block uppercase font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Scheduled for Thursday' : 'Total Agendado para Quinta'}</span>
                      <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 38.000,00</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold ${isDark ? 'bg-white/[0.06] text-white/70 border border-white/[0.08]' : 'bg-slate-200 text-slate-700'}`}>
                      2 {currentLang === 'en' ? 'Debits' : 'Débitos'}
                    </span>
                  </div>

                  {/* Itemized Payment List */}
                  <div className="space-y-1.5 mt-1">
                    {/* Item 1: Mastercard Black Card Bill */}
                    <div className={`p-2.5 rounded-[8px] flex items-center justify-between ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
                        </div>
                        <div className="min-w-0">
                          <span className={`font-semibold block truncate ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Mastercard Black Bill' : 'Fatura Mastercard Black'}</span>
                          <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Auto-debit • Aug 25' : 'Débito Automático • 25/08'}</span>
                        </div>
                      </div>
                      <span className={`font-sans font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 34.150,00</span>
                    </div>

                    {/* Item 2: Condomínio Edifício Jardins */}
                    <div className={`p-2.5 rounded-[8px] flex items-center justify-between ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-brand-orange" />
                        </div>
                        <div className="min-w-0">
                          <span className={`font-semibold block truncate ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Condomínio Ed. Jardins' : 'Condomínio Ed. Jardins'}</span>
                          <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Scheduled Boleto • Aug 25' : 'Boleto Agendado • 25/08'}</span>
                        </div>
                      </div>
                      <span className={`font-sans font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 3.850,00</span>
                    </div>
                  </div>

                  {/* Coverage Verification Status */}
                  <div className={`p-2 rounded-[8px] flex items-center justify-between text-[11px] mt-1 ${isDark ? 'bg-white/[0.02] border border-white/[0.05] text-white/70' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 opacity-60" />
                      <span>{currentLang === 'en' ? 'Checking Balance Covers 100%' : 'Saldo em Conta Cobre 100%'}</span>
                    </div>
                    <span className="font-sans font-bold">R$ 48.950,20</span>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'balance_cdb' ? (
              /* Specific CDB Investments Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'CDB DI INVESTMENTS' : 'INVESTIMENTOS CDB DI'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 font-sans">
                  <div className={`p-3 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Daily Liquidity Balance' : 'Saldo com Liquidez Diária'}</span>
                    <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 85.000,00</span>
                  </div>

                  <div className={`p-2.5 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                      <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                      <span>{currentLang === 'en' ? 'Yield Rate: 100% of CDI' : 'Rentabilidade: 100% do CDI'}</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ml-5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Immediate withdrawal 24/7 without penalties.' : 'Resgate imediato 24/7 com liquidez diária.'}</div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'balance_card' ? (
              /* Specific Mastercard Black Balance Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      Mastercard Black (•••• 8841)
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 font-sans">
                  <div className={`p-3 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Available Limit' : 'Limite Disponível'}</span>
                    <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 72.569,50</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Card Limit' : 'Limite Total'}</span>
                      <span className={`font-sans font-bold text-xs ${isDark ? 'text-white/80' : 'text-slate-700'}`}>R$ 85.000,00</span>
                    </div>
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Current Bill Due Thu' : 'Fatura Venc. Quinta'}</span>
                      <span className="font-sans font-bold text-xs text-brand-orange">R$ 34.150,00</span>
                    </div>
                  </div>

                  {/* Outstanding Balance & End of Next Month Due Date */}
                  <div className={`p-2.5 rounded-[8px] flex items-center justify-between text-xs ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div>
                      <span className={`text-[9.5px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Outstanding Balance (Next Bill)' : 'Fatura em Aberto (Próx. Mês)'}</span>
                      <span className={`font-sans font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 12.430,50</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9.5px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Due Date' : 'Vencimento'}</span>
                      <span className="font-sans font-bold text-[11.5px] text-brand-orange">{currentLang === 'en' ? 'Sep 28, 2026' : '28/09/2026'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (activeCardId === 'itau_balances' || activeCardId === 'account_info_agent') ? (
              /* Strictly Itaú Balances Card (No Open Finance Data Shown) */
              <div className={`w-full rounded-[16px] p-3.5 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 opacity-70 text-brand-orange" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'BANCO ITAÚ PERSONNALITÉ' : 'BANCO ITAÚ PERSONNALITÉ'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  {/* Total Itaú Liquid Balance Hero Box */}
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                        {currentLang === 'en' ? 'Total Liquid Balance with Itaú' : 'Saldo Total no Banco Itaú'}
                      </span>
                      <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-semibold ${isDark ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-orange/10 text-brand-orange'}`}>
                        Ag. 7749 • CC 00912-8
                      </span>
                    </div>
                    <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      R$ 133.950,20
                    </span>
                  </div>

                  {/* Itaú Balances Breakdown */}
                  <div className="space-y-1.5">
                    <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
                      <div>
                        <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                          {currentLang === 'en' ? 'Checking Account' : 'Conta Corrente'}
                        </span>
                        <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                          {currentLang === 'en' ? 'Available for immediate use' : 'Disponível para movimentação'}
                        </span>
                      </div>
                      <span className="font-sans font-bold text-xs">R$ 48.950,20</span>
                    </div>

                    <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
                      <div>
                        <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                          CDB DI (100% do CDI)
                        </span>
                        <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                          {currentLang === 'en' ? 'Daily liquidity • 24/7' : 'Liquidez diária 24/7'}
                        </span>
                      </div>
                      <span className="font-sans font-bold text-xs text-brand-orange">R$ 85.000,00</span>
                    </div>

                    <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
                      <div>
                        <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                          Mastercard Black (•••• 8841)
                        </span>
                        <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                          {currentLang === 'en' ? 'Available Limit / Total R$ 85k' : 'Limite Disponível / Total R$ 85k'}
                        </span>
                      </div>
                      <span className="font-sans font-bold text-xs">R$ 72.569,50</span>
                    </div>
                  </div>

                  {/* Open Finance Proactive Suggestion Banner */}
                  <div className={`p-2.5 rounded-[10px] border flex flex-col gap-2 mt-1 ${
                    isDark ? 'bg-brand-orange/10 border-brand-orange/25 text-white' : 'bg-orange-50/80 border-brand-orange/30 text-slate-900'
                  }`}>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold block text-brand-orange uppercase tracking-wider">
                          Open Finance
                        </span>
                        <p className={`text-[10.5px] leading-snug mt-0.5 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                          {currentLang === 'en'
                            ? 'I can pull your Open Finance data to check if you are getting the best rates across other institutions.'
                            : 'Posso consultar seus dados no Open Finance para verificar se você está recebendo as melhores taxas do mercado.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onActionClick('pull_open_finance')}
                      className="w-full py-1.5 px-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-[10.5px] font-bold rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{currentLang === 'en' ? 'Check Rates via Open Finance →' : 'Consultar Taxas via Open Finance →'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'open_finance_select' ? (
              /* Open Finance Category Selection Card (Debt vs CDI) */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'OPEN FINANCE — RATE ANALYSIS' : 'OPEN FINANCE — ANÁLISE DE TAXAS'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentLang === 'en' ? 'CONNECTED VIA BACEN OPEN FINANCE' : 'CONECTADO VIA OPEN FINANCE BACEN'}</span>
                </div>

                <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {currentLang === 'en'
                    ? 'Which rate category would you like me to analyze across your connected accounts?'
                    : 'Qual categoria de taxas você gostaria que eu analise nas suas contas conectadas?'}
                </p>

                <div className="space-y-2 text-xs">
                  {/* Category 1: CDI Balances */}
                  <div
                    onClick={() => onActionClick('quote_open_finance_cdi')}
                    className={`p-3 rounded-[10px] border cursor-pointer transition-all hover:scale-[1.01] ${
                      isDark ? 'bg-white/[0.03] border-brand-orange/40 hover:border-brand-orange' : 'bg-orange-50/50 border-brand-orange/40 hover:border-brand-orange'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-brand-orange text-xs">
                        {currentLang === 'en' ? '1. CDI Balances & Yield' : '1. Saldos e Rendimentos CDI'}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${isDark ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-orange/15 text-brand-orange'}`}>
                        {currentLang === 'en' ? 'Say "CDI"' : 'Diga "CDI"'}
                      </span>
                    </div>
                    <p className={`text-[10.5px] leading-snug ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      {currentLang === 'en'
                        ? 'Check whether your liquid funds at BTG Pactual and XP are earning 100% of CDI.'
                        : 'Verificar se seus investimentos no BTG Pactual e XP estão rendendo 100% do CDI.'}
                    </p>
                  </div>

                  {/* Category 2: Debt Balances */}
                  <div
                    onClick={() => onActionClick('refinance_open_finance')}
                    className={`p-3 rounded-[10px] border cursor-pointer transition-all hover:scale-[1.01] ${
                      isDark ? 'bg-white/[0.02] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                        {currentLang === 'en' ? '2. Outstanding Debt Balances' : '2. Saldos Devedores e Crédito'}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${isDark ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-700'}`}>
                        {currentLang === 'en' ? 'Say "Debt"' : 'Diga "Dívidas"'}
                      </span>
                    </div>
                    <p className={`text-[10.5px] leading-snug ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      {currentLang === 'en'
                        ? 'Analyze competitor revolving debt for potential rate reduction via Itaú Sob Medida.'
                        : 'Analisar dívidas rotativas externas para redução de juros via Itaú Sob Medida.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="font-mono text-[10px] text-brand-orange animate-pulse">
                    {currentLang === 'en' ? 'Listening... Say "CDI" to quote yield improvements' : 'Ouvindo... Diga "CDI" para ver as melhorias de rentabilidade'}
                  </span>
                </div>
              </div>
            ) : activeCardId === 'open_finance_cdi' ? (
              /* CDI Yield Improvements Quoted Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'CDI YIELD OPTIMIZATION' : 'OTIMIZAÇÃO DE RENDIMENTO CDI'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* External Balance Notice */}
                  <div className={`p-2.5 rounded-[8px] ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
                    <span className={`text-[10px] block font-mono uppercase ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      {currentLang === 'en' ? 'External Connected Liquidity' : 'Liquidez Externa Conectada'}
                    </span>
                    <span className={`text-base font-black font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      R$ 330.000,00
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      BTG Pactual (R$ 120k) + XP Investimentos (R$ 210k)
                    </span>
                  </div>

                  {/* Yield Comparison Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-[8px] border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        {currentLang === 'en' ? 'Competitors' : 'Concorrentes'}
                      </span>
                      <span className={`font-mono text-xs font-semibold ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        {currentLang === 'en' ? '85% of CDI' : '85% do CDI'}
                      </span>
                      <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        {currentLang === 'en' ? 'Lower yield' : 'Rentabilidade menor'}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-[8px] border ${isDark ? 'bg-brand-orange/10 border-brand-orange/30' : 'bg-orange-50 border-brand-orange/30'}`}>
                      <span className="text-[9px] block uppercase font-mono tracking-wider text-brand-orange font-bold">
                        Itaú CDB DI
                      </span>
                      <span className="font-mono text-xs font-black text-brand-orange">
                        {currentLang === 'en' ? '100% of CDI' : '100% do CDI'}
                      </span>
                      <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-brand-orange/80' : 'text-brand-orange'}`}>
                        {currentLang === 'en' ? 'Daily Liquidity 24/7' : 'Liquidez Diária 24/7'}
                      </span>
                    </div>
                  </div>

                  {/* Net Improvement Hero Banner - Clean 2-Liner */}
                  <div className={`py-2 px-2.5 rounded-[8px] flex items-center justify-between border ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="min-w-0 flex-1 pr-1">
                      <span className="text-[9px] uppercase font-mono font-bold block opacity-80 tracking-wider">
                        {currentLang === 'en' ? 'Yield Spread Advantage' : 'Ganho Adicional Líquido'}
                      </span>
                      <div className="font-mono font-extrabold text-xs sm:text-[13px] whitespace-nowrap tracking-tight leading-normal mt-0.5">
                        {currentLang === 'en'
                          ? '+15% of CDI (+R$ 5,940/yr)'
                          : '+15% do CDI (+R$ 5.940/ano)'}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>

                  {/* Approval CTA Button */}
                  <button
                    onClick={() => onActionClick('confirm_cdi_transfer')}
                    className="w-full py-2.5 px-2 rounded-[8px] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1 whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {currentLang === 'en'
                        ? 'Approve Transfer (R$ 330k → 100% CDI)'
                        : 'Aprovar Mudança (R$ 330k → 100% CDI)'}
                    </span>
                  </button>

                  <div className="text-center pt-0.5">
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      {currentLang === 'en' ? 'Say: "ok, let\'s make that change" or "I approve"' : 'Diga: "ok, pode fazer a mudança" ou "aprovo"'}
                    </span>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'open_finance_transfer_confirmed' ? (
              /* CDI Transfer Confirmed Success Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'TRANSFER CONFIRMED' : 'TRANSFERÊNCIA CONFIRMADA'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-center py-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>

                  <div>
                    <span className={`text-base font-black font-sans block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      R$ 330.000,00 {currentLang === 'en' ? 'Transferred' : 'Transferidos'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                      {currentLang === 'en' ? 'Now Earning 100% of CDI (Liquidez Diária)' : 'Agora Rendendo 100% do CDI (Liquidez Diária)'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-[8px] text-left space-y-1 ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex justify-between text-[10.5px]">
                      <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Annual Yield Gain:' : 'Ganho Anual Adicional:'}</span>
                      <span className="font-mono font-bold text-emerald-400">+R$ 5.940,00 / ano</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'New Itaú Liquid Total:' : 'Novo Patrimônio Total Itaú:'}</span>
                      <span className="font-mono font-bold">R$ 463.950,20</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Settlement Rail:' : 'Canal de Liquidação:'}</span>
                      <span className="font-mono text-[9.5px]">Open Finance / CIP</span>
                    </div>
                  </div>

                  <div className={`p-2 rounded-[6px] text-[10px] ${isDark ? 'bg-white/[0.02] text-white/50' : 'bg-slate-100 text-slate-600'}`}>
                    {currentLang === 'en' ? 'Funds secured with daily liquidity 24/7' : 'Recursos protegidos com liquidez diária 24/7'}
                  </div>
                </div>
              </div>
            ) : activeCardId === 'cash_flow_forecast_agent' ? (
              /* Cash Flow & Yield Optimization Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'CASH FLOW & YIELD OPTIMIZER' : 'PREVISÃO DE SALDO & YIELD'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-[9px] font-mono font-bold mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  <span>{currentLang === 'en' ? 'TRIGGERED BY PREDICTIVE BALANCE ALERT' : 'DISPARADO POR ALERTA PREVENTIVO'}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] border shadow-sm ${
                    isDark 
                      ? 'bg-white/10 border-white/15 text-red-400 backdrop-blur-sm' 
                      : 'bg-white/90 border-red-200 text-red-600'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {currentLang === 'en' ? 'D+4 Projected Shortfall' : 'Déficit Projetado D+4'}
                    </span>
                    <span className={`text-base font-bold font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      -R$ 13.050,00
                    </span>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-red-300/80' : 'text-red-600/80'}`}>
                      {currentLang === 'en' ? 'After Lisbon flight purchase & Thursday bill debits.' : 'Após compra de passagens e débitos de fatura na quinta.'}
                    </p>
                  </div>

                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Yield Strategy' : 'Estratégia de Rendimento'}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>R$ 85k {currentLang === 'en' ? 'earning 100% CDI until 06:00 BRT' : 'rendendo 100% CDI até 06:00'}</span>
                  </div>

                  {isCdbSweepScheduled ? (
                    <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between mt-1 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                          {currentLang === 'en' ? 'CDB Sweep Scheduled' : 'Resgate CDB Agendado'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                        {currentLang === 'en' ? 'R$ 15k on Thu' : 'R$ 15k na Quinta'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onActionClick('sweep_cdb')}
                      className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{currentLang === 'en' ? 'Schedule CDB Sweep (R$ 15k)' : 'Agendar Resgate CDB (R$ 15k)'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : activeCardId === 'travel_shield_agent' ? (
              /* Travel Shield Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'TRAVEL SHIELD & FRAUD DEFENSE' : 'AVISO VIAGEM & ANTIFRAUDE'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Destinations' : 'Destinos'}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Portugal (LIS) • Espanha (MAD)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'POS Spend Limit' : 'Limite POS'}</span>
                      <span className="font-mono font-bold text-brand-orange">R$ 50.000,00</span>
                    </div>
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Declines' : 'Recusas'}</span>
                      <span className="font-semibold font-mono text-[11px] text-emerald-400">{currentLang === 'en' ? 'Pre-Suppressed' : 'Suprimidas'}</span>
                    </div>
                  </div>

                  {isTravelModeActive ? (
                    <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between mt-1 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                          {currentLang === 'en' ? 'Travel Shield Active' : 'Aviso de Viagem Ativo'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                        {currentLang === 'en' ? 'Limit: R$ 50k' : 'Limite: R$ 50k'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onActionClick('activate_travel_mode')}
                      className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
                    >
                      <Plane className="w-3.5 h-3.5" />
                      <span>{currentLang === 'en' ? 'Confirm Travel Notice' : 'Confirmar Aviso de Viagem'}</span>
                    </button>
                  )}

                  {/* Proactive Card Benefits Action Button */}
                  {isTravelModeActive && (
                    <button
                      onClick={() => onActionClick('get_card_benefits')}
                      className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1.5 ${
                        isDark 
                          ? 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md' 
                          : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md'
                      }`}
                    >
                      <ShieldPlus className="w-3.5 h-3.5" />
                      <span>{currentLang === 'en' ? 'Explore Mastercard Black Benefits →' : 'Ver Benefícios do Mastercard Black →'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : activeCardId === 'card_benefits_agent' ? (
              /* Mastercard Black Benefits Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'MASTERCARD BLACK BENEFITS' : 'BENEFÍCIOS MASTERCARD BLACK'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <ShieldPlus className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Schengen Medical Insurance' : 'Seguro Médico Schengen'}</div>
                      <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>€30.000 / USD $150.000 {currentLang === 'en' ? 'coverage included' : 'cobertura inclusa'}</div>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <Plane className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'VIP Airport Lounges' : 'Salas VIP Aeroportos'}</div>
                      <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{currentLang === 'en' ? 'GRU T3 Unlimited + 4 LoungeKey passes' : 'GRU T3 Ilimitado + 4 passes LoungeKey'}</div>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <Car className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Masterseguro Auto (CDW/LDW)' : 'Masterseguro de Automóveis'}</div>
                      <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Rental car damage protection + 24/7 Concierge' : 'Cobertura de locação + Concierge 24h'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'open_finance_optimizer' ? (
              /* Open Finance Rate Comparison & Yield Arbitrage Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'OPEN FINANCE ARBITRAGE' : 'ARBITRAGEM OPEN FINANCE'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveCardId(null)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* 1. Debt Interest Rate Comparison */}
                  <div className={`p-3 rounded-[10px] space-y-2 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentLang === 'en' ? 'Debt Refinancing' : 'Refinanciamento de Dívida'}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                        {currentLang === 'en' ? 'Save R$ 14,280' : 'Economia R$ 14.280'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          {currentLang === 'en' ? 'Competitor' : 'Concorrente'}
                        </span>
                        <span className={`font-mono text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                          11,20% a.m.
                        </span>
                      </div>
                      <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          Itaú Sob Medida
                        </span>
                        <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          1,69% a.m.
                        </span>
                      </div>
                    </div>

                    <div className={`text-[10.5px] flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                      <span className={isDark ? 'text-white/50' : 'text-slate-500'}>
                        {currentLang === 'en' ? 'Monthly Savings' : 'Economia Mensal'}
                      </span>
                      <span className="font-mono font-medium text-emerald-400 whitespace-nowrap">
                        -9,51% a.m. (R$ 680,40/mês)
                      </span>
                    </div>
                  </div>

                  {/* 2. Savings & Fixed Income Yield Comparison */}
                  <div className={`p-3 rounded-[10px] space-y-2 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentLang === 'en' ? 'CDB Yield Difference' : 'Rendimento CDB DI'}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                        {currentLang === 'en' ? '+R$ 5,940 / yr' : '+R$ 5.940 / ano'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          {currentLang === 'en' ? 'Competitor' : 'Concorrente'}
                        </span>
                        <span className={`font-mono text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                          85% do CDI
                        </span>
                      </div>
                      <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          Itaú CDB DI
                        </span>
                        <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          100% do CDI
                        </span>
                      </div>
                    </div>

                    <div className={`text-[10.5px] flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                      <span className={isDark ? 'text-white/50' : 'text-slate-500'}>
                        {currentLang === 'en' ? 'Yield Advantage' : 'Ganho Adicional'}
                      </span>
                      <span className="font-mono font-medium text-emerald-400 whitespace-nowrap">
                        +15% CDI (Liquidez Diária)
                      </span>
                    </div>
                  </div>

                  {/* Refinance Action Button or Confirmed State */}
                  {isOpenFinanceRefiDone ? (
                    <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                          {currentLang === 'en' ? 'Digital CCB Registered' : 'CCB Digital Registrada'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                        {currentLang === 'en' ? 'R$ 14,280 Saved' : 'R$ 14.280 Salvos'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onActionClick('refinance_open_finance')}
                      className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{currentLang === 'en' ? 'Issue Digital CCB (Law 10,931)' : 'Emitir CCB Digital (Lei 10.931)'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Centered 70% Transparent Itaú Logo Watermark */
              <div className="my-auto flex items-center justify-center select-none pointer-events-none">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-brand-orange text-white flex items-center justify-center font-bold text-4xl sm:text-5xl opacity-30 shadow-2xl tracking-tighter">
                  itau
                </div>
              </div>
            )}

          </div>

          {/* Bottom Voice Concierge Bar (Placed above Footer Nav) */}
          <div className={`relative px-4 py-2 border-t flex items-center justify-between flex-shrink-0 transition-colors ${
            isDark ? 'border-white/[0.08] bg-[#121217]' : 'border-slate-200 bg-slate-100/90'
          }`}>
            {/* Left Column: Branding & Status */}
            <div className="flex items-center gap-2 z-10 select-none min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSpeaking ? 'bg-emerald-400 animate-ping' : isListening ? 'bg-brand-orange animate-pulse' : 'bg-brand-orange'}`}></div>
              <span className={`text-xs font-semibold tracking-tight truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {isSpeaking
                  ? (currentLang === 'en' ? 'Speaking...' : 'Falando...')
                  : isListening
                  ? (currentLang === 'en' ? 'Listening...' : 'Ouvindo...')
                  : 'Itaú Concierge'}
              </span>
            </div>

            {/* Center Column: Live Audio Waveform (Memoized & isolated from PhoneContainer re-renders) */}
            <AudioWaveformVisualizer
              audioLevels={audioLevels}
              isVoiceCallActive={isVoiceCallActive}
              isSpeaking={isSpeaking}
              isListening={isListening}
            />

            {/* Right Column: Mic Trigger Button */}
            <div className="flex items-center justify-end z-10">
              <button
                onClick={onToggleVoiceCall}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isVoiceCallActive
                    ? isSpeaking
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40 shadow-[0_0_15px_#FF6423]'
                      : isListening
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40 shadow-[0_0_15px_#FF6423]'
                      : 'bg-brand-orange text-white shadow-md'
                    : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm'
                }`}
                title={isVoiceCallActive ? "Itaú Concierge Voice Active (Click to End)" : "Start Itaú Concierge Voice"}
              >
                {isVoiceCallActive && !isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
          <div className="w-28 h-1 bg-white/20 rounded-full mx-auto my-1 flex-shrink-0" />

        </>
        )}

      </div>

      </div>

    </div>
  );
};

export default PhoneContainer;
