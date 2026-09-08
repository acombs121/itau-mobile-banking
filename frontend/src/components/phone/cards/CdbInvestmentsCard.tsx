import React from 'react';
import { TrendingUp, X } from 'lucide-react';
import { Language } from '../../../i18n/translations';

interface CdbInvestmentsCardProps {
  isDark: boolean;
  currentLang: Language;
  onClose: () => void;
}

export const CdbInvestmentsCard: React.FC<CdbInvestmentsCardProps> = React.memo(({
  isDark,
  currentLang,
  onClose
}) => {
  return (
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
  );
});

CdbInvestmentsCard.displayName = 'CdbInvestmentsCard';
