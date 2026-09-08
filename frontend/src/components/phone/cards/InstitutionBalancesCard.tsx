import React from 'react';
import { Building2, X, TrendingUp } from 'lucide-react';
import { Language } from '../../../i18n/translations';
import { BrandingProfile } from '../../../types/brand';
import { getBrandSegment } from '../../../context/BrandContext';

interface InstitutionBalancesCardProps {
  isDark: boolean;
  currentLang: Language;
  activeBrand: BrandingProfile;
  onClose: () => void;
  onPullOpenFinance: () => void;
}

export const InstitutionBalancesCard: React.FC<InstitutionBalancesCardProps> = React.memo(({
  isDark,
  currentLang,
  activeBrand,
  onClose,
  onPullOpenFinance
}) => {
  return (
    <div className={`w-full rounded-[16px] p-3.5 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 opacity-70 text-brand-orange" />
          <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {getBrandSegment(activeBrand).toUpperCase()}
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

      <div className="space-y-2.5 text-xs font-sans">
        {/* Total Liquid Balance Hero Box */}
        <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'}`}>
          <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {currentLang === 'en' ? `Total Liquid Balance with ${activeBrand.name.replace(/^Banco\s+/i, '')}` : `Saldo Total no ${activeBrand.name}`}
          </span>
          <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            R$ 133.950,20
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5">
          <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
            <div>
              <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                {currentLang === 'en' ? 'Checking Account' : 'Conta Corrente'}
              </span>
              <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {currentLang === 'en' ? 'Available for immediate use' : 'Disponível para movimentação'}
              </span>
            </div>
            <span className="font-sans font-bold text-xs">R$ 48.950,20</span>
          </div>

          <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
            <div>
              <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                CDB DI (100% do CDI)
              </span>
              <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {currentLang === 'en' ? 'Daily liquidity • 24/7' : 'Liquidez diária 24/7'}
              </span>
            </div>
            <span className="font-sans font-bold text-xs text-brand-orange">R$ 85.000,00</span>
          </div>

          <div className={`p-2 rounded-[8px] flex justify-between items-center ${isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
            <div>
              <span className={`text-[11px] font-semibold block ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                Mastercard Black (•••• 8841)
              </span>
              <span className={`text-[9.5px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {currentLang === 'en' ? 'Available Limit / Total R$ 85k' : 'Limite Disponível / Total R$ 85k'}
              </span>
            </div>
            <span className="font-sans font-bold text-xs">R$ 72.569,50</span>
          </div>
        </div>

        {/* Open Finance Proactive Suggestion Banner */}
        <div className={`p-2.5 rounded-[10px] border flex flex-col gap-2 mt-1 ${
          isDark ? 'bg-brand-orange/10 border-brand-orange/25 text-white' : 'bg-orange-50/80 border-brand-orange/30 text-slate-900'
        }`}>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold block text-brand-orange uppercase tracking-wider">
                Open Finance
              </span>
              <p className={`text-[10.5px] leading-snug mt-0.5 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                {currentLang === 'en'
                  ? 'I can pull your Open Finance data to check if you are getting the best rates across other institutions.'
                  : 'Posso consultar seus dados no Open Finance para verificar se você está recebendo as melhores taxas do mercado.'}
              </p>
            </div>
          </div>
          <button
            onClick={onPullOpenFinance}
            className="w-full py-1.5 px-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-[10.5px] font-bold rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>{currentLang === 'en' ? 'Check Rates via Open Finance →' : 'Consultar Taxas via Open Finance →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

InstitutionBalancesCard.displayName = 'InstitutionBalancesCard';
