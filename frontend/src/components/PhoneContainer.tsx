import React, { useState } from 'react';
import { Eye, EyeOff, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle2, Mic, AlertTriangle } from 'lucide-react';
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
    <div className="w-full max-w-[400px] flex flex-col items-center select-none">
      
      {/* Outer Smartphone Frame */}
      <div className="w-full bg-[#111] rounded-[42px] p-3 shadow-2xl border-4 border-[#262626] relative">
        
        {/* Screen Bezel */}
        <div className="w-full bg-[#0A1128] rounded-[34px] overflow-hidden flex flex-col text-white min-h-[720px] relative shadow-inner">
          
          {/* iOS Notification Toast Floating Overlay */}
          <div className="absolute top-12 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                className="bg-black/90 backdrop-blur-md border border-white/25 rounded-[12px] p-3 shadow-2xl flex items-start gap-2.5 animate-fadeIn pointer-events-auto"
              >
                <div className="w-7 h-7 rounded-[4px] bg-brand-orange text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  itau
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-white/60 mb-0.5">
                    <span className="font-semibold text-white/90">{notif.app}</span>
                    <span>{notif.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight truncate">{notif.title}</h4>
                  <p className="text-[11px] text-white/80 leading-tight mt-0.5">{notif.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="w-full h-8 px-6 pt-1.5 flex justify-between items-center text-[11px] font-semibold text-white/70 select-none">
            <span>{t.statusTime}</span>
            <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* In-App Header */}
          <div className="px-5 pt-3 pb-4 bg-gradient-to-b from-[#002776] to-[#0A1128] border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-brand-orange text-white font-black text-sm px-2 py-0.5 rounded-[4px]">
                  itau
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight">{profile.customer_name}</span>
                  <span className="text-[10px] text-brand-orange font-medium">{profile.segment}</span>
                </div>
              </div>
              <button
                onClick={onOpenVoiceAssistant}
                className="w-8 h-8 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                title="Voz Itaú Guard"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Account Balance Card */}
            <div className="bg-white/5 border border-white/15 rounded-[8px] p-3.5 mt-2">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span>{t.balanceTitle}</span>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="hover:text-white"
                >
                  {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-xl font-bold font-mono text-white tracking-tight">
                {showBalance ? `R$ ${profile.checking_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••••'}
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/60 mt-2 pt-2 border-t border-white/10">
                <span>{t.investments}</span>
                <span className="font-mono text-white/90">
                  {showBalance ? `R$ ${profile.investments_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
                </span>
              </div>
            </div>
          </div>

          {/* App Scrollable Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            
            {/* Active Incident Banner */}
            {criticalAlert ? (
              <div className="bg-rose-950/80 border border-rose-500/60 rounded-[8px] p-3 animate-pulse shadow-lg">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>{t.alertCardTitle}</span>
                </div>
                <p className="text-[11px] text-white/90 leading-tight mb-2.5">
                  {t.alertCardDesc}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onActionClick('block_pix', criticalAlert.id)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1.5 rounded-[4px] text-center transition-colors"
                  >
                    {t.btnBlockRefund}
                  </button>
                  <button
                    onClick={() => onActionClick('approve_pix', criticalAlert.id)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-1.5 rounded-[4px] text-center border border-white/20 transition-colors"
                  >
                    {t.btnApprove}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-[8px] p-2.5 flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px]">{t.allSafe}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-white/80">
              <div className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 p-2 rounded-[8px] border border-white/10 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <span>{t.quickPix}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 p-2 rounded-[8px] border border-white/10 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>{t.quickPay}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 p-2 rounded-[8px] border border-white/10 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span>{t.quickReceive}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 p-2 rounded-[8px] border border-white/10 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>{t.quickCards}</span>
              </div>
            </div>

            {/* Credit Card Snapshot */}
            <div className="bg-gradient-to-r from-[#111] to-[#1E1E1E] border border-white/15 rounded-[8px] p-3.5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-white">{profile.cards[0]?.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${profile.cards[0]?.status === 'frozen' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {profile.cards[0]?.status === 'frozen' ? t.frozenBadge : t.activeBadge}
                </span>
              </div>
              <div className="text-xs text-text-muted font-mono mb-2">
                •••• •••• •••• {profile.cards[0]?.last4}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                <span className="text-white/60">{t.cardLimit}</span>
                <button
                  onClick={() => onActionClick(profile.cards[0]?.status === 'frozen' ? 'unfreeze_card' : 'freeze_card', profile.cards[0]?.id)}
                  className="text-[10px] font-bold text-brand-orange hover:underline"
                >
                  {profile.cards[0]?.status === 'frozen' ? t.unfreeze : t.freeze}
                </button>
              </div>
            </div>

            {/* Recent Statements */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
                {t.recentStatements}
              </div>
              {profile.recent_transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 border border-white/10 rounded-[6px] p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-white leading-tight">{tx.description}</div>
                    <div className="text-[10px] text-text-muted">{tx.date}</div>
                  </div>
                  <div className={`font-mono font-bold ${tx.amount_brl < 0 ? 'text-white' : 'text-emerald-400'}`}>
                    {tx.amount_brl < 0 ? `- R$ ${Math.abs(tx.amount_brl).toFixed(2)}` : `+ R$ ${tx.amount_brl.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="h-14 bg-[#070707] border-t border-white/10 px-6 flex items-center justify-around text-[10px] text-white/60">
            <button 
              onClick={() => setActiveNavTab('home')}
              className={`flex flex-col items-center gap-0.5 ${activeNavTab === 'home' ? 'text-brand-orange font-bold' : ''}`}
            >
              <span>{t.navHome}</span>
            </button>
            <button 
              onClick={() => setActiveNavTab('extrato')}
              className={`flex flex-col items-center gap-0.5 ${activeNavTab === 'extrato' ? 'text-brand-orange font-bold' : ''}`}
            >
              <span>{t.navStatements}</span>
            </button>
            <button 
              onClick={() => setActiveNavTab('pix')}
              className={`flex flex-col items-center gap-0.5 ${activeNavTab === 'pix' ? 'text-brand-orange font-bold' : ''}`}
            >
              <span>{t.navPix}</span>
            </button>
            <button 
              onClick={() => setActiveNavTab('cartoes')}
              className={`flex flex-col items-center gap-0.5 ${activeNavTab === 'cartoes' ? 'text-brand-orange font-bold' : ''}`}
            >
              <span>{t.navCards}</span>
            </button>
          </div>

          {/* Home Indicator */}
          <div className="w-28 h-1 bg-white/30 rounded-full mx-auto my-1.5"></div>

        </div>

      </div>

    </div>
  );
};
