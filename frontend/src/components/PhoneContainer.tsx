import React, { useState, useEffect } from 'react';
import { QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff, X, Check, ShieldCheck, Plane, TrendingUp, HelpCircle, ShieldPlus, Car, MapPin, Calendar, Building2, ChevronRight } from 'lucide-react';
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
  onActionClick: (action: string, targetId?: string, customPayload?: Record<string, any>) => void;
  isTravelModeActive?: boolean;
  isCdbSweepScheduled?: boolean;
  isOpenFinanceRefiDone?: boolean;
  isPixBlocked?: boolean;
  activeRunningAgentId?: string | null;
  activeDynamicCardId?: string | null;
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
  activeDynamicCardId = null,
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
    onToolCall: (toolName, _toolArgs, toolPayload) => {
      console.log("Executing sub-agent tool call:", toolName, toolPayload);
      onActionClick(toolName, undefined, toolPayload);
      if (toolName === 'get_account_info') {
        // Preserve specific sub-balance or scheduled payments card if already active
        setActiveCardId(prev => (
          (prev?.startsWith('balance_') || prev === 'scheduled_payments' || prev === 'balance_scheduled_payments')
            ? prev
            : 'account_info_agent'
        ));
      }
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
              <div className={`w-1.5 h-1.5 rounded-full ${isVoiceCallActive ? 'bg-brand-orange' : 'bg-emerald-500/80'}`}></div>
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
                  setActiveCardId('balance_clarification');
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
          <div className={`flex-1 w-full px-4 pt-3 pb-2 flex flex-col justify-start items-center min-h-0 overflow-y-auto custom-scrollbar font-arimo ${isDark ? 'bg-transparent' : 'bg-slate-50/40'}`}>
            
            {/* 0. Balance Clarification Interactive Card (Shown when user asks general balance, BEFORE specifying account) */}
            {activeCardId === 'balance_clarification' ? (
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-brand-orange/30 text-white' : 'bg-white border-brand-orange/30 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-orange" />
                    <span className="text-[10.5px] font-mono font-bold tracking-wide uppercase text-brand-orange">
                      {currentLang === 'en' ? 'BALANCE INQUIRY' : 'CONSULTA DE SALDO'}
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

                <p className={`text-xs mb-3 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {currentLang === 'en' 
                    ? 'Which balance would you like to check?' 
                    : 'Qual saldo você deseja consultar?'}
                </p>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      onActionClick('get_account_info');
                      setActiveCardId('balance_checking');
                    }}
                    className={`w-full text-left p-2.5 rounded-[10px] border transition-all text-xs font-medium flex items-center justify-between ${
                      isDark 
                        ? 'bg-white/[0.04] border-white/10 hover:bg-brand-orange/10 hover:border-brand-orange/40 text-white' 
                        : 'bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-brand-orange/40 text-slate-800'
                    }`}
                  >
                    <span>1. {currentLang === 'en' ? 'Checking Account' : 'Conta Corrente'}</span>
                    <span className="text-[10px] opacity-60 font-mono">CC • 00912</span>
                  </button>

                  <button
                    onClick={() => {
                      onActionClick('get_account_info');
                      setActiveCardId('balance_cdb');
                    }}
                    className={`w-full text-left p-2.5 rounded-[10px] border transition-all text-xs font-medium flex items-center justify-between ${
                      isDark 
                        ? 'bg-white/[0.04] border-white/10 hover:bg-brand-orange/10 hover:border-brand-orange/40 text-white' 
                        : 'bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-brand-orange/40 text-slate-800'
                    }`}
                  >
                    <span>2. {currentLang === 'en' ? 'Savings & CDB DI' : 'Investimentos CDB DI'}</span>
                    <span className="text-[10px] opacity-60 font-mono">100% CDI</span>
                  </button>

                  <button
                    onClick={() => {
                      onActionClick('get_account_info');
                      setActiveCardId('balance_card');
                    }}
                    className={`w-full text-left p-2.5 rounded-[10px] border transition-all text-xs font-medium flex items-center justify-between ${
                      isDark 
                        ? 'bg-white/[0.04] border-white/10 hover:bg-brand-orange/10 hover:border-brand-orange/40 text-white' 
                        : 'bg-slate-50 border-slate-200 hover:bg-orange-50 hover:border-brand-orange/40 text-slate-800'
                    }`}
                  >
                    <span>3. {currentLang === 'en' ? 'Mastercard Black Card' : 'Cartão Mastercard Black'}</span>
                    <span className="text-[10px] opacity-60 font-mono">•••• 8841</span>
                  </button>
                </div>
              </div>
            ) : activeCardId === 'balance_checking' ? (
              /* Specific Checking Balance Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10.5px] font-mono font-bold tracking-wide uppercase text-emerald-500">
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
                    <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 48.950,20</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Overdraft (LIS)' : 'Limite LIS'}</span>
                      <span className={`font-mono font-semibold text-[11px] ${isDark ? 'text-white/80' : 'text-slate-700'}`}>R$ 10.000,00</span>
                    </div>
                    <button 
                      onClick={() => setActiveCardId('scheduled_payments')}
                      className={`p-2 rounded-[8px] text-left transition-all hover:ring-1 hover:ring-brand-orange/40 cursor-pointer ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Debits Next Thu' : 'Débitos Quinta'}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-brand-orange/70" />
                      </div>
                      <span className="font-mono font-semibold text-[11px] text-brand-orange">R$ 38.000,00</span>
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
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
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

                <div className="space-y-2 text-xs">
                  {/* Total Header Summary */}
                  <div className={`p-2.5 rounded-[10px] flex items-center justify-between ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div>
                      <span className={`text-[9.5px] block uppercase font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Scheduled for Thursday' : 'Total Agendado para Quinta'}</span>
                      <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 38.000,00</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${isDark ? 'bg-white/[0.06] text-white/70 border border-white/[0.08]' : 'bg-slate-200 text-slate-700'}`}>
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
                      <span className={`font-mono font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 34.150,00</span>
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
                      <span className={`font-mono font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 3.850,00</span>
                    </div>
                  </div>

                  {/* Coverage Verification Status */}
                  <div className={`p-2 rounded-[8px] flex items-center justify-between text-[11px] mt-1 ${isDark ? 'bg-white/[0.02] border border-white/[0.05] text-white/70' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 opacity-60" />
                      <span>{currentLang === 'en' ? 'Checking Balance Covers 100%' : 'Saldo em Conta Cobre 100%'}</span>
                    </div>
                    <span className="font-mono font-semibold">R$ 48.950,20</span>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'balance_cdb' ? (
              /* Specific CDB Investments Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-emerald-500/30 text-white' : 'bg-white border-emerald-500/30 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10.5px] font-mono font-bold tracking-wide uppercase text-emerald-500">
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

                <div className="space-y-2.5">
                  <div className={`p-3 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Daily Liquidity Balance' : 'Saldo com Liquidez Diária'}</span>
                    <span className={`text-xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>R$ 85.000,00</span>
                  </div>

                  <div className={`p-2.5 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
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
                    <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
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

                <div className="space-y-2.5">
                  <div className={`p-3 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Available Limit' : 'Limite Disponível'}</span>
                    <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 72.569,50</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Card Limit' : 'Limite Total'}</span>
                      <span className={`font-mono font-semibold text-[11px] ${isDark ? 'text-white/80' : 'text-slate-700'}`}>R$ 85.000,00</span>
                    </div>
                    <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Current Bill Due Thu' : 'Fatura Venc. Quinta'}</span>
                      <span className="font-mono font-semibold text-[11px] text-brand-orange">R$ 34.150,00</span>
                    </div>
                  </div>

                  {/* Outstanding Balance & End of Next Month Due Date */}
                  <div className={`p-2.5 rounded-[8px] flex items-center justify-between text-xs ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div>
                      <span className={`text-[9.5px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Outstanding Balance (Next Bill)' : 'Fatura em Aberto (Próx. Mês)'}</span>
                      <span className={`font-mono font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 12.430,50</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9.5px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Due Date' : 'Vencimento'}</span>
                      <span className="font-mono font-semibold text-[11.5px] text-brand-orange">{currentLang === 'en' ? 'Sep 28, 2026' : '28/09/2026'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'account_info_agent' ? (
              /* Consolidated Position Dynamic Card with Open Finance Awareness */
              <div className={`w-full rounded-[16px] p-3.5 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-emerald-500/30 text-white' : 'bg-white border-emerald-500/30 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-emerald-500">
                      {currentLang === 'en' ? 'CONSOLIDATED POSITION • OPEN FINANCE' : 'POSIÇÃO CONSOLIDADA • OPEN FINANCE'}
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
                  {/* Total Liquid Patrimony Hero Box */}
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Consolidated Liquid Assets' : 'Patrimônio Líquido Consolidado'}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">{currentLang === 'en' ? '3 Connected Banks' : '3 Bancos Conectados'}</span>
                    </div>
                    <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 463.950,20</span>
                  </div>

                  {/* Itaú Balances Breakdown */}
                  <div className="space-y-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider opacity-50 px-1 pt-0.5">
                      {currentLang === 'en' ? 'Banco Itaú Personnalité (R$ 133,950.20)' : 'Banco Itaú Personnalité (R$ 133.950,20)'}
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>{currentLang === 'en' ? 'Checking Account' : 'Conta Corrente'}</span>
                      <span className="font-mono font-semibold">R$ 48.950,20</span>
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>CDB DI (100% CDI)</span>
                      <span className={`font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>R$ 85.000,00</span>
                    </div>
                  </div>

                  {/* Open Finance External Connected Institutions */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-500 px-1">
                      {currentLang === 'en' ? 'Open Finance External Assets (R$ 330,000.00)' : 'Open Finance — Ativos Externos (R$ 330.000,00)'}
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>BTG Pactual (Liquidez)</span>
                      <span className="font-mono font-semibold">R$ 120.000,00</span>
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>XP Investimentos (Tesouro / Selic)</span>
                      <span className="font-mono font-semibold">R$ 210.000,00</span>
                    </div>
                  </div>

                  {/* Open Finance External Debt Refinance Opportunity */}
                  <div className={`p-2 rounded-[8px] flex items-center justify-between text-[11px] mt-1.5 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                    <div>
                      <span className="text-[9.5px] font-bold block">{currentLang === 'en' ? 'Competitor Debt Detected' : 'Dívida no Concorrente'}</span>
                      <span className="font-mono font-bold">R$ 18.000,00 (11,2% a.m.)</span>
                    </div>
                    <button
                      onClick={() => onActionClick('refinance_open_finance')}
                      className="px-2 py-1 bg-brand-orange hover:bg-brand-orange-hover text-white text-[10px] font-bold rounded shadow-sm transition-all flex items-center gap-1"
                    >
                      <span>{currentLang === 'en' ? 'Save R$ 14.2k' : 'Economizar R$ 14,2k'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'cash_flow_forecast_agent' ? (
              /* Cash Flow & Yield Optimization Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-brand-orange/40 text-white' : 'bg-white border-brand-orange/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-brand-orange">
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

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] border ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <span className="text-[10px] font-bold uppercase block">{currentLang === 'en' ? 'D+4 Projected Shortfall' : 'Déficit Projetado D+4'}</span>
                    <span className="text-base font-bold font-mono">-R$ 13.050,00</span>
                    <p className="text-[10px] opacity-80 mt-0.5">{currentLang === 'en' ? 'After Lisbon flight purchase & Thursday bill debits.' : 'Após compra de passagens e débitos de fatura na quinta.'}</p>
                  </div>

                  <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Yield Strategy' : 'Estratégia de Rendimento'}</span>
                    <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>R$ 85k {currentLang === 'en' ? 'earning 100% CDI until 06:00 BRT' : 'rendendo 100% CDI até 06:00'}</span>
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
                    <span>{isCdbSweepScheduled ? (currentLang === 'en' ? 'Sweep Scheduled' : 'Resgate Agendado') : (currentLang === 'en' ? 'Schedule CDB Sweep (R$ 15k)' : 'Agendar Resgate CDB (R$ 15k)')}</span>
                  </button>
                </div>
              </div>
            ) : activeCardId === 'travel_shield_agent' ? (
              /* Travel Shield Dynamic Card */
              <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-brand-orange/40 text-white' : 'bg-white border-brand-orange/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-brand-orange">
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
                      <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{currentLang === 'en' ? 'Pre-Suppressed' : 'Suprimidas'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onActionClick('activate_travel_mode')}
                    className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isTravelModeActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md'
                    }`}
                  >
                    {isTravelModeActive ? <Check className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
                    <span>{isTravelModeActive ? (currentLang === 'en' ? 'Travel Shield Active' : 'Aviso de Viagem Ativo') : (currentLang === 'en' ? 'Confirm Travel Notice' : 'Confirmar Aviso de Viagem')}</span>
                  </button>

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
                isDark ? 'bg-[#15151A] border-blue-500/40 text-white' : 'bg-white border-blue-500/40 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-blue-500">
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
                    <ShieldPlus className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{currentLang === 'en' ? 'Schengen Medical Insurance' : 'Seguro Médico Schengen'}</div>
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
                    <Car className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{currentLang === 'en' ? 'Masterseguro Auto (CDW/LDW)' : 'Masterseguro de Automóveis'}</div>
                      <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Rental car damage protection + 24/7 Concierge' : 'Cobertura de locação + Concierge 24h'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCardId === 'open_finance_optimizer' ? (
              /* Open Finance Rate Comparison & Yield Arbitrage Dynamic Card */
              <div className={`w-full rounded-[16px] p-3.5 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-emerald-500/30 text-white' : 'bg-white border-emerald-500/30 text-slate-900 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-emerald-500">
                      {currentLang === 'en' ? 'BEST RATES & YIELD ARBITRAGE' : 'MELHORES TAXAS & ARBITRAGEM OPEN FINANCE'}
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
                  {/* 1. Debt Interest Rate Comparison */}
                  <div className={`p-2.5 rounded-[10px] space-y-1.5 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-400">
                        {currentLang === 'en' ? 'Credit & Debt Rate Optimization' : 'Taxa de Dívidas & Crédito (R$ 18.000)'}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                        {currentLang === 'en' ? 'Save R$ 14,280' : 'Economia R$ 14.280'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                      <div className={`p-1.5 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'You Pay (Competitor)' : 'Você Paga (Concorrente)'}</span>
                        <span className="font-mono font-bold text-red-400">11,20% a.m.</span>
                      </div>
                      <div className={`p-1.5 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Itaú Sob Medida' : 'Itaú Sob Medida'}</span>
                        <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>1,69% a.m.</span>
                      </div>
                    </div>
                    <div className="text-[10px] flex items-center justify-between pt-0.5 border-t border-white/[0.05]">
                      <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Rate Spread / Monthly Savings' : 'Diferença de Taxa / Ganho Mensal'}</span>
                      <span className="font-mono font-semibold text-emerald-400">-9,51% a.m. (R$ 680,40/mês)</span>
                    </div>
                  </div>

                  {/* 2. Savings & Fixed Income Yield Comparison */}
                  <div className={`p-2.5 rounded-[10px] space-y-1.5 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-400">
                        {currentLang === 'en' ? 'Savings & Yield Difference' : 'Rendimento & Poupança (R$ 330.000)'}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                        {currentLang === 'en' ? '+R$ 5,940 / yr' : '+R$ 5.940 / ano'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                      <div className={`p-1.5 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Competitor Yield' : 'Rendimento Concorrente'}</span>
                        <span className="font-mono font-bold text-amber-400">85% do CDI</span>
                      </div>
                      <div className={`p-1.5 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                        <span className={`text-[9px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Itaú CDB DI' : 'Itaú CDB DI'}</span>
                        <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>100% do CDI</span>
                      </div>
                    </div>
                    <div className="text-[10px] flex items-center justify-between pt-0.5 border-t border-white/[0.05]">
                      <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Yield Spread Advantage' : 'Ganho Adicional de Rendimento'}</span>
                      <span className="font-mono font-semibold text-emerald-400">+15% CDI (Liquidez Diária)</span>
                    </div>
                  </div>

                  {/* Refinance Action Button */}
                  <button
                    onClick={() => onActionClick('refinance_open_finance')}
                    className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isOpenFinanceRefiDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md'
                    }`}
                  >
                    {isOpenFinanceRefiDone ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>{isOpenFinanceRefiDone ? (currentLang === 'en' ? 'CCB Issued (R$ 14,280 Saved)' : 'CCB Emitida (R$ 14.280 Salvos)') : (currentLang === 'en' ? 'Issue Digital CCB (Lei 10.931)' : 'Emitir CCB Digital (Lei 10.931)')}</span>
                  </button>
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
          <div className={`px-4 py-2 border-t flex items-center justify-between flex-shrink-0 transition-colors ${
            isDark ? 'border-white/[0.08] bg-[#121217]' : 'border-slate-200 bg-slate-100/90'
          }`}>
            {/* Left Column: Branding */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0"></div>
              <span className={`text-xs font-semibold tracking-tight truncate ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                Itaú Concierge
              </span>
            </div>

            {/* Center Column: Live Audio Waveform (Balanced in the exact center) */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              {isVoiceCallActive && (
                <div className="flex items-center gap-1 h-6 px-3 bg-black/40 rounded-full border border-white/10 animate-fadeIn shadow-sm">
                  {audioLevels.slice(0, 9).map((level, i) => (
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
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Mic Trigger Button */}
            <div className="flex-1 flex justify-end items-center">
              <button
                onClick={onToggleVoiceCall}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isVoiceCallActive
                    ? isSpeaking
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/40 shadow-[0_0_15px_#FF6423]'
                      : isListening
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/40 shadow-[0_0_15px_#10B981]'
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

        </div>

      </div>

    </div>
  );
};

export default PhoneContainer;
