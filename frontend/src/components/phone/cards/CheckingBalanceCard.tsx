import React from 'react';
import { Building2, X, ChevronRight } from 'lucide-react';
import { Language } from '../../../i18n/translations';

interface CheckingBalanceCardProps {
  isDark: boolean;
  currentLang: Language;
  onClose: () => void;
  onOpenScheduledPayments: () => void;
}

export const CheckingBalanceCard: React.FC<CheckingBalanceCardProps> = React.memo(({
  isDark,
  currentLang,
  onClose,
  onOpenScheduledPayments
}) => {
  return (
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
          onClick={onClose}
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
            onClick={onOpenScheduledPayments}
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
  );
});

CheckingBalanceCard.displayName = 'CheckingBalanceCard';
