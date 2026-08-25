import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, MicOff } from 'lucide-react';
import { BankingProfile } from '../types/banking';
import { IOSNotification, ScenarioId } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';
import { useGeminiLive } from '../hooks/useGeminiLive';

interface PhoneContainerProps {
  profile: BankingProfile;
  notifications: IOSNotification[];
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
  onUserQuery?: (query: string) => void;
  onTurnComplete?: () => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  notifications,
  currentLang,
  theme,
  activeScenario: _activeScenario,
  isVoiceCallActive,
  onToggleVoiceCall,
  onActionClick,
  isTravelModeActive = false,
  isCdbSweepScheduled: _isCdbSweepScheduled = false,
  isOpenFinanceRefiDone: _isOpenFinanceRefiDone = false,
  onUserQuery,
  onTurnComplete
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');

  const t = translations[currentLang];
  const isDark = theme === 'dark';
  const localizedTransactions = t.phone.transactions || profile.recent_transactions;

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
    },
    onActionTriggered: (action) => {
      onActionClick(action);
    },
    onUserQuery,
    onTurnComplete
  });

  // Handle call toggle & auto-start microphone
  useEffect(() => {
    if (isVoiceCallActive) {
      connect();
      // Auto-start microphone when call is activated
      startMicrophone();
    } else {
      stopMicrophone();
      disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          
          {/* Floating iOS Notification Toast */}
          <div className="absolute top-10 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
            {notifications.slice(0, 1).map((notif) => (
              <div
                key={notif.id}
                className={`backdrop-blur-xl border rounded-[14px] p-3 shadow-2xl flex items-start gap-2.5 animate-fadeIn pointer-events-auto ${
                  isDark
                    ? 'bg-[#161616]/95 border-white/[0.15] text-white'
                    : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
                }`}
              >
                <div className="w-6 h-6 rounded-[4px] bg-brand-orange text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                  itau
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex justify-between items-center text-[11px] mb-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    <span className={`font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{notif.app}</span>
                    <span>{notif.timestamp}</span>
                  </div>
                  <div className={`text-xs font-semibold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{notif.title}</div>
                  <div className={`text-[11px] leading-tight mt-0.5 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{notif.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

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
          <div className={`px-4 pt-2.5 pb-2.5 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-brand-orange text-white font-bold text-xs px-2 py-0.5 rounded-[3px] flex-shrink-0">
                itau
              </div>
              <span className={`text-xs sm:text-sm font-semibold truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                {profile.customer_name}
              </span>
            </div>

            {/* Live Audio Waveform (Embedded cleanly between Roberto Silva and the Mic Button) */}
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
            
            {/* Top Right Orange Mic Button */}
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

          {/* Balance Hero */}
          <div className={`px-4 py-3 border-b flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              <span>{t.phone.balanceTitle}</span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className={`text-xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {showBalance ? `R$ ${profile.checking_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••••'}
            </div>
          </div>

          {/* Scrollable Banking App Feed */}
          <div className={`flex-1 p-3.5 overflow-y-auto min-h-0 space-y-3 custom-scrollbar ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
            
            {/* Quick Actions 4-Grid */}
            <div className={`grid grid-cols-4 gap-1.5 text-center text-[11px] font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <span>{t.phone.quickPix}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickPay}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickReceive}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span>{t.phone.quickCards}</span>
              </div>
            </div>

            {/* Card Snapshot */}
            <div className={`border rounded-[10px] p-3 transition-colors ${
              isDark
                ? 'border-white/[0.08] bg-white/[0.02]'
                : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className={`font-semibold text-xs ${isDark ? 'text-white/95' : 'text-slate-900'}`}>{profile.cards[0]?.name}</span>
                <span className={`text-[10px] font-mono font-bold ${
                  profile.cards[0]?.status === 'frozen' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {profile.cards[0]?.status === 'frozen' ? t.phone.frozenBadge : t.phone.activeBadge}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-1.5">
                <div className={`text-[11px] font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  •••• {profile.cards[0]?.last4}
                </div>
                {isTravelModeActive && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ✈️ {currentLang === 'en' ? 'EUROPE TRAVEL MODE' : 'MODO VIAGEM ATIVO'}
                  </span>
                )}
              </div>

              <div className={`flex items-center justify-between text-xs pt-1.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-white/60' : 'text-slate-600'}>
                  {isTravelModeActive ? 'Limite: R$ 50.000,00' : 'R$ 72.569,50'}
                </span>
                <button
                  onClick={() => onActionClick(profile.cards[0]?.status === 'frozen' ? 'unfreeze_card' : 'freeze_card', profile.cards[0]?.id)}
                  className="text-xs font-bold text-brand-orange hover:underline"
                >
                  {profile.cards[0]?.status === 'frozen' ? t.phone.unfreeze : t.phone.freeze}
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-1.5 pt-0.5">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {t.phone.recentStatements}
              </div>
              {localizedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`py-1.5 px-1 flex items-center justify-between text-xs border-b last:border-0 ${
                    isDark ? 'border-white/[0.04]' : 'border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className={`font-medium text-[11px] leading-snug ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{tx.description}</div>
                    <div className={`text-[9px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{tx.date}</div>
                  </div>
                  <div className={`font-mono text-xs font-semibold ${tx.amount_brl < 0 ? (isDark ? 'text-white/90' : 'text-slate-900') : 'text-emerald-500'}`}>
                    {tx.amount_brl < 0 ? `- R$ ${Math.abs(tx.amount_brl).toFixed(2)}` : `+ R$ ${tx.amount_brl.toFixed(2)}`}
                  </div>
                </div>
              ))}
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
