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
  onOpenVoiceAssistant: () => void;
  onActionClick: (action: string, targetId: string) => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  profile,
  alerts,
  notifications,
  currentLang,
  onOpenVoiceAssistant,
  onActionClick
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');
  const t = translations[currentLang].phone;

  const criticalAlert = alerts.find(a => a.severity === 'CRITICAL' && a.status !== 'blocked_and_reversed' && a.status !== 'approved_by_user');

  return (
    <div className="w-full max-w-[370px] flex flex-col items-center select-none">
      
      {/* Precision Hardware Frame */}
      <div className="w-full bg-[#0D0D0D] rounded-[44px] p-2.5 shadow-2xl border border-white/[0.12] relative">
        
        {/* OLED Screen Canvas */}
        <div className="w-full bg-[#000000] rounded-[36px] overflow-hidden flex flex-col text-white min-h-[690px] relative border border-white/[0.04]">
          
          {/* iOS Notification Toast Floating Overlay */}
          <div className="absolute top-10 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
            {notifications.slice(0, 1).map((notif) => (
              <div
                key={notif.id}
                className="bg-[#161616]/95 backdrop-blur-xl border border-white/[0.15] rounded-[14px] p-3 shadow-2xl flex items-start gap-2.5 animate-fadeIn pointer-events-auto"
              >
                <div className="w-6 h-6 rounded-[3px] bg-brand-orange text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                  itau
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-white/40 mb-0.5">
                    <span className="font-medium text-white/80">{notif.app}</span>
                    <span>{notif.timestamp}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-white leading-tight truncate">{notif.title}</div>
                  <div className="text-[10px] text-white/60 leading-tight mt-0.5">{notif.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="w-full h-8 px-6 pt-2 flex justify-between items-center text-[11px] font-medium text-white/40 select-none">
            <span>{t.statusTime}</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10"></div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>5G</span>
            </div>
          </div>

          {/* Minimalist In-App Bar */}
          <div className="px-5 pt-3 pb-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange text-white font-bold text-xs px-1.5 py-0.5 rounded-[3px]">
                itau
              </div>
              <span className="text-xs font-semibold text-white/90">{profile.customer_name}</span>
            </div>
            <button
              onClick={onOpenVoiceAssistant}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-brand-orange text-white flex items-center justify-center transition-colors"
              title="Itaú Guard"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Balance Hero */}
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
              <span>{t.balanceTitle}</span>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-white transition-colors"
              >
                {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white font-mono">
              {showBalance ? `R$ ${profile.checking_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••••'}
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            
            {/* Critical Incident Banner (Minimalist High-Contrast) */}
            {criticalAlert && (
              <div className="bg-[#120808] border border-rose-900/60 rounded-[8px] p-3.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.alertCardTitle}</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed mb-3">
                  {t.alertCardDesc}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onActionClick('block_pix', criticalAlert.id)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold py-1.5 rounded-[4px] text-center transition-colors"
                  >
                    {t.btnBlockRefund}
                  </button>
                  <button
                    onClick={() => onActionClick('approve_pix', criticalAlert.id)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-medium py-1.5 rounded-[4px] text-center border border-white/10 transition-colors"
                  >
                    {t.btnApprove}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions (Dieter Rams 4-Grid) */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-white/70">
              <div className="flex flex-col items-center gap-1.5 py-2 hover:bg-white/[0.04] rounded-[6px] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/90">
                  <QrCode className="w-4 h-4 text-brand-orange" />
                </div>
                <span>{t.quickPix}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-2 hover:bg-white/[0.04] rounded-[6px] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/90">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>{t.quickPay}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-2 hover:bg-white/[0.04] rounded-[6px] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/90">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span>{t.quickReceive}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-2 hover:bg-white/[0.04] rounded-[6px] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/90">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>{t.quickCards}</span>
              </div>
            </div>

            {/* Card Snapshot */}
            <div className="border border-white/[0.08] rounded-[8px] p-3.5 bg-white/[0.02]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-white/90">{profile.cards[0]?.name}</span>
                <span className="text-[10px] font-mono text-white/40">
                  {profile.cards[0]?.status === 'frozen' ? t.frozenBadge : t.activeBadge}
                </span>
              </div>
              <div className="text-xs text-white/40 font-mono mb-2">
                •••• {profile.cards[0]?.last4}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.06]">
                <span className="text-white/40">R$ 72.569,50</span>
                <button
                  onClick={() => onActionClick(profile.cards[0]?.status === 'frozen' ? 'unfreeze_card' : 'freeze_card', profile.cards[0]?.id)}
                  className="text-[11px] font-medium text-brand-orange hover:underline"
                >
                  {profile.cards[0]?.status === 'frozen' ? t.unfreeze : t.freeze}
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-medium uppercase tracking-wider text-white/30 px-1">
                {t.recentStatements}
              </div>
              {profile.recent_transactions.map((tx) => (
                <div key={tx.id} className="py-2 px-1 flex items-center justify-between text-xs border-b border-white/[0.04] last:border-0">
                  <div>
                    <div className="font-normal text-white/90 text-[11px] leading-tight">{tx.description}</div>
                    <div className="text-[9px] text-white/30 mt-0.5">{tx.date}</div>
                  </div>
                  <div className={`font-mono text-[11px] ${tx.amount_brl < 0 ? 'text-white/90' : 'text-emerald-400'}`}>
                    {tx.amount_brl < 0 ? `- R$ ${Math.abs(tx.amount_brl).toFixed(2)}` : `+ R$ ${tx.amount_brl.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Minimalist Bottom Bar */}
          <div className="h-12 border-t border-white/[0.06] px-6 flex items-center justify-around text-[10px] text-white/40">
            <button 
              onClick={() => setActiveNavTab('home')}
              className={activeNavTab === 'home' ? 'text-brand-orange font-medium' : 'hover:text-white/70'}
            >
              {t.navHome}
            </button>
            <button 
              onClick={() => setActiveNavTab('extrato')}
              className={activeNavTab === 'extrato' ? 'text-brand-orange font-medium' : 'hover:text-white/70'}
            >
              {t.navStatements}
            </button>
            <button 
              onClick={() => setActiveNavTab('pix')}
              className={activeNavTab === 'pix' ? 'text-brand-orange font-medium' : 'hover:text-white/70'}
            >
              {t.navPix}
            </button>
            <button 
              onClick={() => setActiveNavTab('cartoes')}
              className={activeNavTab === 'cartoes' ? 'text-brand-orange font-medium' : 'hover:text-white/70'}
            >
              {t.navCards}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
