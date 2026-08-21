import React, { useState } from 'react';
import { Eye, EyeOff, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle2, Mic, AlertTriangle } from 'lucide-react';
import { BankingProfile, SecurityAlert } from '../types/banking';

interface MobilePhoneShellProps {
  profile: BankingProfile;
  alerts: SecurityAlert[];
  onOpenVoiceAssistant: () => void;
  onActionClick: (action: string, targetId: string) => void;
}

export const MobilePhoneShell: React.FC<MobilePhoneShellProps> = ({
  profile,
  alerts,
  onOpenVoiceAssistant,
  onActionClick
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'extrato' | 'pix' | 'cartoes'>('home');

  const criticalAlert = alerts.find(a => a.severity === 'CRITICAL' && a.status !== 'blocked_and_reversed' && a.status !== 'approved_by_user');

  return (
    <div className="w-full max-w-[380px] mx-auto bg-black rounded-[36px] p-3 shadow-2xl border-4 border-[#222] relative">
      
      {/* Mobile Screen Container */}
      <div className="w-full bg-[#0A1128] rounded-[28px] overflow-hidden flex flex-col text-white min-h-[660px] relative">
        
        {/* Status Bar */}
        <div className="w-full h-7 px-6 pt-1 flex justify-between items-center text-[10px] font-semibold text-white/70 select-none">
          <span>14:52</span>
          <div className="w-20 h-3.5 bg-black rounded-full mx-auto -mt-1"></div>
          <div className="flex items-center gap-1.5 font-mono">
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
              className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
              title="Voz Itaú Guard"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Account Balance Card */}
          <div className="bg-white/5 border border-white/15 rounded-[8px] p-3.5 mt-2">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>Saldo em conta corrente</span>
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
              <span>Investimentos</span>
              <span className="font-mono text-white/90">
                {showBalance ? `R$ ${profile.investments_balance_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
              </span>
            </div>
          </div>
        </div>

        {/* App Scrollable Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          
          {/* Active Incident Banner if Critical Alert Exists */}
          {criticalAlert ? (
            <div className="bg-rose-950/70 border border-rose-500/50 rounded-[8px] p-3 animate-pulse">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Bloqueio Preventivo Ativo</span>
              </div>
              <p className="text-[11px] text-white/90 leading-tight mb-2.5">
                Pix de R$ 4.200,00 retido preventivamente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onActionClick('block_pix', criticalAlert.id)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1.5 rounded-[4px] text-center"
                >
                  Bloquear & Estornar
                </button>
                <button
                  onClick={() => onActionClick('approve_pix', criticalAlert.id)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-1.5 rounded-[4px] text-center border border-white/20"
                >
                  Confirmar Eu Mesmo
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-[8px] p-2.5 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]">Conta e cartões 100% protegidos com Itaú Guard.</span>
            </div>
          )}

          {/* Quick Pix & Transfer Actions */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-white/80">
            <div className="flex flex-col items-center gap-1 bg-white/5 p-2 rounded-[8px] border border-white/10">
              <div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <span>Pix</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-white/5 p-2 rounded-[8px] border border-white/10">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span>Pagar</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-white/5 p-2 rounded-[8px] border border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span>Receber</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-white/5 p-2 rounded-[8px] border border-white/10">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Cartões</span>
            </div>
          </div>

          {/* Credit Card Snapshot */}
          <div className="bg-gradient-to-r from-[#111] to-[#1E1E1E] border border-white/15 rounded-[8px] p-3.5">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-white">{profile.cards[0]?.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${profile.cards[0]?.status === 'frozen' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {profile.cards[0]?.status === 'frozen' ? 'CONGELADO' : 'ATIVO'}
              </span>
            </div>
            <div className="text-xs text-text-muted font-mono mb-2">
              •••• •••• •••• {profile.cards[0]?.last4}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
              <span className="text-white/60">Limite disponível: R$ 72.569,50</span>
              <button
                onClick={() => onActionClick(profile.cards[0]?.status === 'frozen' ? 'unfreeze_card' : 'freeze_card', profile.cards[0]?.id)}
                className="text-[10px] font-bold text-brand-orange hover:underline"
              >
                {profile.cards[0]?.status === 'frozen' ? 'Desbloquear' : 'Congelar'}
              </button>
            </div>
          </div>

          {/* Recent Statements / Extrato */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
              Últimas Movimentações
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

        {/* Mobile Navigation Bar */}
        <div className="h-14 bg-[#070707] border-t border-white/10 px-6 flex items-center justify-around text-[10px] text-white/60">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-brand-orange font-bold' : ''}`}
          >
            <span>Início</span>
          </button>
          <button 
            onClick={() => setActiveTab('extrato')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'extrato' ? 'text-brand-orange font-bold' : ''}`}
          >
            <span>Extrato</span>
          </button>
          <button 
            onClick={() => setActiveTab('pix')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'pix' ? 'text-brand-orange font-bold' : ''}`}
          >
            <span>Pix</span>
          </button>
          <button 
            onClick={() => setActiveTab('cartoes')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'cartoes' ? 'text-brand-orange font-bold' : ''}`}
          >
            <span>Cartões</span>
          </button>
        </div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/30 rounded-full mx-auto my-1.5"></div>

      </div>

    </div>
  );
};
