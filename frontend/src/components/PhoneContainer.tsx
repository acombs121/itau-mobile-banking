import React, { useState } from 'react';
import { Eye, EyeOff, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, Mic, AlertCircle } from 'lucide-react';
import { BankingProfile, SecurityAlert } from '../types/banking';
import { IOSNotification } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';

interface PhoneContainerProps {
  profile: BankingProfile;
  alerts: SecurityAlert[];
  notifications: IOSNotification[];
  currentLang: Language;
  theme: 'dark' | 'light';
  onOpenVoiceAssistant: () => void;
  onActionClick: (action: string, targetId: string) => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  alerts,
  notifications,
  currentLang,
  theme,
  onOpenVoiceAssistant,
  onActionClick
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');
  const t = translations[currentLang].phone;
  const isDark = theme === 'dark';

  const criticalAlert = alerts.find(a => a.severity === 'CRITICAL' && a.status !== 'blocked_and_reversed' && a.status !== 'approved_by_user');

  return (
    <div className="w-full max-w-[350px] flex flex-col items-center select-none h-full max-h-[calc(100vh-4.5rem)]">
      
      {/* Precision Hardware Frame */}
      <div
        className={`w-full h-full rounded-[40px] p-2.5 shadow-2xl border flex flex-col transition-colors duration-200 ${
          isDark
            ? 'bg-[#0D0D0D] border-white/[0.12]'
            : 'bg-[#E5E7EB] border-slate-300 shadow-xl'
        }`}
      >
        
        {/* Screen Canvas */}
        <div
          className={`w-full h-full rounded-[32px] overflow-hidden flex flex-col min-h-0 relative border transition-colors duration-200 ${
            isDark
              ? 'bg-[#000000] text-white border-white/[0.04]'
              : 'bg-[#FFFFFF] text-slate-900 border-slate-200'
          }`}
        >
          
          {/* iOS Notification Toast Floating Overlay */}
          <div className="absolute top-9 left-2.5 right-2.5 z-30 flex flex-col gap-2 pointer-events-none">
            {notifications.slice(0, 1).map((notif) => (
              <div
                key={notif.id}
                className={`backdrop-blur-xl border rounded-[12px] p-2.5 shadow-2xl flex items-start gap-2 animate-fadeIn pointer-events-auto ${
                  isDark
                    ? 'bg-[#161616]/95 border-white/[0.15] text-white'
                    : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
                }`}
              >
                <div className="w-5 h-5 rounded-[3px] bg-brand-orange text-white flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
                  itau
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex justify-between items-center text-[9px] mb-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    <span className={`font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{notif.app}</span>
                    <span>{notif.timestamp}</span>
                  </div>
                  <div className={`text-[10px] font-semibold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{notif.title}</div>
                  <div className={`text-[9px] leading-tight mt-0.5 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{notif.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className={`w-full h-7 px-5 pt-1.5 flex justify-between items-center text-[10px] font-medium select-none flex-shrink-0 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            <span>{t.statusTime}</span>
            <div className="w-18 h-3.5 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#111] border border-white/10"></div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px]">
              <span>5G</span>
            </div>
          </div>

          {/* Minimalist In-App Bar */}
          <div className={`px-4 pt-2.5 pb-2.5 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange text-white font-bold text-[11px] px-1.5 py-0.5 rounded-[3px]">
                itau
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{profile.customer_name}</span>
            </div>
            <button
              onClick={onOpenVoiceAssistant}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-brand-orange text-white'
                  : 'bg-slate-200 hover:bg-brand-orange hover:text-white text-slate-700'
              }`}
              title="Itaú Guard"
            >
              <Mic className="w-3 h-3" />
            </button>
          </div>

          {/* Balance Hero */}
          <div className={`px-4 py-3 border-b flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <div className={`flex items-center justify-between text-[10px] mb-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              <span>{t.balanceTitle}</span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
              >
                {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <div className={`text-xl font-semibold tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {showBalance ? `R$ ${profile.checking_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••••'}
            </div>
          </div>

          {/* Scrollable Container */}
          <div className={`flex-1 p-3.5 overflow-y-auto min-h-0 space-y-3 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
            
            {/* Critical Incident Banner */}
            {criticalAlert && (
              <div className={`rounded-[8px] p-3 border ${
                isDark
                  ? 'bg-[#120808] border-rose-900/60'
                  : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[11px] mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t.alertCardTitle}</span>
                </div>
                <p className={`text-[10px] leading-relaxed mb-2.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                  {t.alertCardDesc}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onActionClick('block_pix', criticalAlert.id)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold py-1 rounded-[4px] text-center transition-colors"
                  >
                    {t.btnBlockRefund}
                  </button>
                  <button
                    onClick={() => onActionClick('approve_pix', criticalAlert.id)}
                    className={`flex-1 text-[10px] font-medium py-1 rounded-[4px] text-center border transition-colors ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {t.btnApprove}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions 4-Grid */}
            <div className={`grid grid-cols-4 gap-1.5 text-center text-[10px] ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[6px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white/90' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <span>{t.quickPix}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[6px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white/90' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <span>{t.quickPay}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[6px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white/90' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <span>{t.quickReceive}</span>
              </div>
              <div className={`flex flex-col items-center gap-1 py-1.5 rounded-[6px] transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white shadow-sm'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'border-white/15 text-white/90' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span>{t.quickCards}</span>
              </div>
            </div>

            {/* Card Snapshot */}
            <div className={`border rounded-[8px] p-3 transition-colors ${
              isDark
                ? 'border-white/[0.08] bg-white/[0.02]'
                : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className={`font-medium text-[11px] ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{profile.cards[0]?.name}</span>
                <span className={`text-[9px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {profile.cards[0]?.status === 'frozen' ? t.frozenBadge : t.activeBadge}
                </span>
              </div>
              <div className={`text-[11px] font-mono mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                •••• {profile.cards[0]?.last4}
              </div>
              <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-white/40' : 'text-slate-500'}>R$ 72.569,50</span>
                <button
                  onClick={() => onActionClick(profile.cards[0]?.status === 'frozen' ? 'unfreeze_card' : 'freeze_card', profile.cards[0]?.id)}
                  className="text-[10px] font-medium text-brand-orange hover:underline"
                >
                  {profile.cards[0]?.status === 'frozen' ? t.unfreeze : t.freeze}
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-1.5 pt-1">
              <div className={`text-[9px] font-medium uppercase tracking-wider px-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                {t.recentStatements}
              </div>
              {profile.recent_transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`py-1.5 px-1 flex items-center justify-between text-xs border-b last:border-0 ${
                    isDark ? 'border-white/[0.04]' : 'border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className={`font-normal text-[10px] leading-tight ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{tx.description}</div>
                    <div className={`text-[8px] mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{tx.date}</div>
                  </div>
                  <div className={`font-mono text-[10px] ${tx.amount_brl < 0 ? (isDark ? 'text-white/90' : 'text-slate-800') : 'text-emerald-500 font-medium'}`}>
                    {tx.amount_brl < 0 ? `- R$ ${Math.abs(tx.amount_brl).toFixed(2)}` : `+ R$ ${tx.amount_brl.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Minimalist Bottom Bar */}
          <div className={`h-11 border-t px-5 flex items-center justify-around text-[10px] flex-shrink-0 ${
            isDark ? 'border-white/[0.06] text-white/40' : 'border-slate-200 bg-white text-slate-500'
          }`}>
            <button 
              onClick={() => setActiveNavTab('home')}
              className={activeNavTab === 'home' ? 'text-brand-orange font-medium' : (isDark ? 'hover:text-white/70' : 'hover:text-slate-900')}
            >
              {t.navHome}
            </button>
            <button 
              onClick={() => setActiveNavTab('extrato')}
              className={activeNavTab === 'extrato' ? 'text-brand-orange font-medium' : (isDark ? 'hover:text-white/70' : 'hover:text-slate-900')}
            >
              {t.navStatements}
            </button>
            <button 
              onClick={() => setActiveNavTab('pix')}
              className={activeNavTab === 'pix' ? 'text-brand-orange font-medium' : (isDark ? 'hover:text-white/70' : 'hover:text-slate-900')}
            >
              {t.navPix}
            </button>
            <button 
              onClick={() => setActiveNavTab('cartoes')}
              className={activeNavTab === 'cartoes' ? 'text-brand-orange font-medium' : (isDark ? 'hover:text-white/70' : 'hover:text-slate-900')}
            >
              {t.navCards}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
