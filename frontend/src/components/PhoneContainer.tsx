import React, { useState } from 'react';
import { Eye, EyeOff, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, AlertCircle, Plane, Sparkles, TrendingUp } from 'lucide-react';
import { BankingProfile } from '../types/banking';
import { IOSNotification, ScenarioId } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';

interface PhoneContainerProps {
  profile: BankingProfile;
  notifications: IOSNotification[];
  currentLang: Language;
  theme: 'dark' | 'light';
  activeScenario: ScenarioId;
  onOpenVoiceAssistant: () => void;
  onActionClick: (action: string, targetId?: string) => void;
  isTravelModeActive?: boolean;
  isCdbSweepScheduled?: boolean;
  isOpenFinanceRefiDone?: boolean;
  isPixBlocked?: boolean;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  notifications,
  currentLang,
  theme,
  activeScenario,
  onOpenVoiceAssistant,
  onActionClick,
  isTravelModeActive = false,
  isCdbSweepScheduled = false,
  isOpenFinanceRefiDone = false,
  isPixBlocked = false
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');
  const t = translations[currentLang];
  const isDark = theme === 'dark';

  const activeScenarioDef = t.scenarios.find(s => s.id === activeScenario) || t.scenarios[0];
  const localizedTransactions = t.phone.transactions || profile.recent_transactions;

  // Determine if the current scenario alert has already been resolved
  const isAlertResolved = 
    (activeScenario === 'cash_flow' && isCdbSweepScheduled) ||
    (activeScenario === 'travel_shield' && isTravelModeActive) ||
    (activeScenario === 'open_finance' && isOpenFinanceRefiDone) ||
    (activeScenario === 'pix_fraud' && isPixBlocked);

  return (
    <div className="w-full max-w-[365px] flex flex-col items-center select-none h-full max-h-[calc(100vh-5.5rem)]">
      
      {/* Precision Hardware Frame */}
      <div
        className={`w-full h-full rounded-[42px] p-3 shadow-2xl border flex flex-col transition-colors duration-200 ${
          isDark
            ? 'bg-[#0D0D0D] border-white/[0.14]'
            : 'bg-[#E5E7EB] border-slate-300 shadow-xl'
        }`}
      >
        
        {/* Screen Canvas */}
        <div
          className={`w-full h-full rounded-[34px] overflow-hidden flex flex-col min-h-0 relative border transition-colors duration-200 ${
            isDark
              ? 'bg-[#000000] text-white border-white/[0.04]'
              : 'bg-[#FFFFFF] text-slate-900 border-slate-200'
          }`}
        >
          
          {/* iOS Notification Toast Floating Overlay */}
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

          {/* Status Bar */}
          <div className={`w-full h-8 px-6 pt-1.5 flex justify-between items-center text-xs font-medium select-none flex-shrink-0 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            <span>{t.phone.statusTime}</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10"></div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span>5G</span>
            </div>
          </div>

          {/* Minimalist In-App Bar */}
          <div className={`px-5 pt-3 pb-3 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-orange text-white font-bold text-xs px-2 py-0.5 rounded-[3px]">
                itau
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-white/95' : 'text-slate-900'}`}>{profile.customer_name}</span>
            </div>
            <button
              onClick={onOpenVoiceAssistant}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-brand-orange text-white'
                  : 'bg-slate-200 hover:bg-brand-orange hover:text-white text-slate-700'
              }`}
              title="Itaú Concierge"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Balance Hero */}
          <div className={`px-5 py-3.5 border-b flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              <span>{t.phone.balanceTitle}</span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className={`text-2xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {showBalance ? `R$ ${profile.checking_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••••'}
            </div>
          </div>

          {/* Scrollable Feed Container */}
          <div className={`flex-1 p-4 overflow-y-auto min-h-0 space-y-3.5 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
            
            {/* Contextual Scenario Proactive Alert Banner */}
            {!isAlertResolved && (
              <div className={`rounded-[10px] p-3.5 border transition-all ${
                activeScenario === 'cash_flow'
                  ? (isDark ? 'bg-[#0E1714] border-emerald-800/60' : 'bg-emerald-50 border-emerald-300')
                  : activeScenario === 'travel_shield'
                  ? (isDark ? 'bg-[#18140B] border-amber-800/60' : 'bg-amber-50 border-amber-300')
                  : activeScenario === 'open_finance'
                  ? (isDark ? 'bg-[#0A111E] border-blue-800/60' : 'bg-blue-50 border-blue-300')
                  : (isDark ? 'bg-[#140808] border-rose-900/60' : 'bg-rose-50 border-rose-200')
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
                  {activeScenario === 'cash_flow' && <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {activeScenario === 'travel_shield' && <Plane className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  {activeScenario === 'open_finance' && <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  {activeScenario === 'pix_fraud' && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                  
                  <span className={
                    activeScenario === 'cash_flow' ? 'text-emerald-400' :
                    activeScenario === 'travel_shield' ? 'text-amber-400' :
                    activeScenario === 'open_finance' ? 'text-blue-400' : 'text-rose-500'
                  }>
                    {activeScenarioDef.alert.title}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {activeScenarioDef.alert.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onActionClick(activeScenarioDef.alert.primaryActionType)}
                    className={`flex-1 text-white text-xs font-semibold py-2 rounded-[4px] text-center transition-colors shadow-sm ${
                      activeScenario === 'cash_flow'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : activeScenario === 'travel_shield'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : activeScenario === 'open_finance'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {activeScenarioDef.alert.primaryActionLabel}
                  </button>
                  
                  <button
                    onClick={() => onActionClick(activeScenarioDef.alert.secondaryActionType)}
                    className={`flex-1 text-xs font-medium py-2 rounded-[4px] text-center border transition-colors ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white/90 border-white/10'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {activeScenarioDef.alert.secondaryActionLabel}
                  </button>
                </div>
              </div>
            )}

            {/* If Alert Resolved Message */}
            {isAlertResolved && (
              <div className={`rounded-[8px] p-3 border text-xs flex items-center gap-2 ${
                isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  {activeScenario === 'cash_flow' && (currentLang === 'en' ? "CDB Sweep scheduled for Thursday (Zero Overdraft)." : "Resgate de CDB agendado para quinta-feira (Zero LIS).")}
                  {activeScenario === 'travel_shield' && (currentLang === 'en' ? "Travel Shield active for Portugal & Spain." : "Aviso de Viagem ativo para Portugal e Espanha.")}
                  {activeScenario === 'open_finance' && (currentLang === 'en' ? "Debt Portability CCB executed — R$ 14,280 saved." : "Portabilidade CCB executada — R$ 14.280 economizados.")}
                  {activeScenario === 'pix_fraud' && (currentLang === 'en' ? "Pix blocked & refunded via BACEN MED." : "Pix bloqueado e estornado via BACEN MED.")}
                </span>
              </div>
            )}

            {/* Quick Actions 4-Grid */}
            <div className={`grid grid-cols-4 gap-2 text-center text-xs font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <div className={`flex flex-col items-center gap-1.5 py-2 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <QrCode className="w-4 h-4 text-brand-orange" />
                </div>
                <span>{t.phone.quickPix}</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 py-2 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>{t.phone.quickPay}</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 py-2 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span>{t.phone.quickReceive}</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 py-2 rounded-[8px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>{t.phone.quickCards}</span>
              </div>
            </div>

            {/* Card Snapshot */}
            <div className={`border rounded-[10px] p-3.5 transition-colors ${
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
              
              <div className="flex items-center justify-between mb-2">
                <div className={`text-xs font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  •••• {profile.cards[0]?.last4}
                </div>
                {isTravelModeActive && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ✈️ {currentLang === 'en' ? 'EUROPE TRAVEL MODE' : 'MODO VIAGEM ATIVO'}
                  </span>
                )}
              </div>

              <div className={`flex items-center justify-between text-xs pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
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
            <div className="space-y-2 pt-1">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {t.phone.recentStatements}
              </div>
              {localizedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`py-2 px-1 flex items-center justify-between text-xs border-b last:border-0 ${
                    isDark ? 'border-white/[0.04]' : 'border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className={`font-medium text-xs leading-snug ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{tx.description}</div>
                    <div className={`text-[10px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{tx.date}</div>
                  </div>
                  <div className={`font-mono text-xs font-semibold ${tx.amount_brl < 0 ? (isDark ? 'text-white/90' : 'text-slate-900') : 'text-emerald-500'}`}>
                    {tx.amount_brl < 0 ? `- R$ ${Math.abs(tx.amount_brl).toFixed(2)}` : `+ R$ ${tx.amount_brl.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Minimalist Bottom Bar */}
          <div className={`h-12 border-t px-6 flex items-center justify-around text-xs flex-shrink-0 ${
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

        </div>

      </div>

    </div>
  );
};
