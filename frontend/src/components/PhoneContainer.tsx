import React, { useState, useEffect } from 'react';
import { QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff, X, Check, ShieldCheck, Plane, TrendingUp, ShieldPlus, Car, MapPin, Calendar, Building2, ChevronRight } from 'lucide-react';
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
          // Default: card with multiple accounts & consolidated balances
          setActiveCardId('account_info_agent');
        }
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
              <div className={`w-1.5 h-1.5 rounded-full ${isVoiceCallActive ? 'bg-brand-orange' : 'bg-transparent'}`}></div>
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
            ) : activeCardId === 'account_info_agent' ? (
              /* Consolidated Position Dynamic Card with Open Finance Awareness */
              <div className={`w-full rounded-[16px] p-3.5 border animate-fadeIn shadow-2xl relative ${
                isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 opacity-70" />
                    <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {currentLang === 'en' ? 'MY ACCOUNTS & CONSOLIDATED POSITION' : 'MINHAS CONTAS & POSIÇÃO CONSOLIDADA'}
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
                  {/* Total Liquid Patrimony Hero Box */}
                  <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Consolidated Liquid Assets' : 'Patrimônio Líquido Consolidado'}</span>
                      <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-semibold ${isDark ? 'bg-white/10 text-white/80' : 'bg-slate-200 text-slate-700'}`}>{currentLang === 'en' ? '3 Connected Banks' : '3 Bancos Conectados'}</span>
                    </div>
                    <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 463.950,20</span>
                  </div>

                  {/* Itaú Balances Breakdown */}
                  <div className="space-y-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider opacity-50 px-1 pt-0.5">
                      {currentLang === 'en' ? 'Banco Itaú Personnalité (R$ 133,950.20)' : 'Banco Itaú Personnalité (R$ 133.950,20)'}
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>{currentLang === 'en' ? 'Checking Account' : 'Conta Corrente'}</span>
                      <span className="font-sans font-bold">R$ 48.950,20</span>
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>CDB DI (100% CDI)</span>
                      <span className="font-sans font-bold">R$ 85.000,00</span>
                    </div>
                  </div>

                  {/* Open Finance External Connected Institutions */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider opacity-60 px-1">
                      {currentLang === 'en' ? 'Open Finance External Assets (R$ 330,000.00)' : 'Open Finance — Ativos Externos (R$ 330.000,00)'}
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>BTG Pactual (Liquidez)</span>
                      <span className="font-sans font-bold">R$ 120.000,00</span>
                    </div>
                    <div className={`p-1.5 px-2 rounded-[6px] flex justify-between items-center text-[11px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>XP Investimentos (Tesouro / Selic)</span>
                      <span className="font-sans font-bold">R$ 210.000,00</span>
                    </div>
                  </div>

                  {/* Open Finance External Debt Refinance Opportunity */}
                  <div className={`p-2 rounded-[8px] flex items-center justify-between text-[11px] mt-1.5 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                    <div>
                      <span className="text-[9.5px] font-bold block">{currentLang === 'en' ? 'Competitor Debt Detected' : 'Dívida no Concorrente'}</span>
                      <span className="font-sans font-bold">R$ 18.000,00 (11,2% a.m.)</span>
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

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-[10px] border ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <span className="text-[10px] font-bold uppercase block">{currentLang === 'en' ? 'D+4 Projected Shortfall' : 'Déficit Projetado D+4'}</span>
                    <span className="text-base font-bold font-mono">-R$ 13.050,00</span>
                    <p className="text-[10px] opacity-80 mt-0.5">{currentLang === 'en' ? 'After Lisbon flight purchase & Thursday bill debits.' : 'Após compra de passagens e débitos de fatura na quinta.'}</p>
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
            {/* Left Column: Branding */}
            <div className="flex items-center gap-2 z-10 select-none">
              <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0"></div>
              <span className={`text-xs font-semibold tracking-tight ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                Itaú Concierge
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

        </div>

      </div>

    </div>
  );
};

export default PhoneContainer;
