import React from 'react';
import { CreditCard, X } from 'lucide-react';
import { Language } from '../../../i18n/translations';

interface CreditCardDetailCardProps {
  isDark: boolean;
  currentLang: Language;
  onClose: () => void;
}

export const CreditCardDetailCard: React.FC<CreditCardDetailCardProps> = React.memo(({
  isDark,
  currentLang,
  onClose
}) => {
  return (
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
          onClick={onClose}
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
  );
});

CreditCardDetailCard.displayName = 'CreditCardDetailCard';
