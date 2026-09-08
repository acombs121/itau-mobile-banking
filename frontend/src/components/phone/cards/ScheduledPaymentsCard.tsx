import React from 'react';
import { Calendar, X, CreditCard, Building2, Check } from 'lucide-react';
import { Language } from '../../../i18n/translations';

interface ScheduledPaymentsCardProps {
  isDark: boolean;
  currentLang: Language;
  onClose: () => void;
}

export const ScheduledPaymentsCard: React.FC<ScheduledPaymentsCardProps> = React.memo(({
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
          <Calendar className="w-3.5 h-3.5 opacity-70" />
          <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'SCHEDULED PAYMENTS' : 'PAGAMENTOS AGENDADOS'}
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

      <div className="space-y-2 text-xs font-sans">
        {/* Total Header Summary */}
        <div className={`p-2.5 rounded-[10px] flex items-center justify-between ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
          <div>
            <span className={`text-[9.5px] block uppercase font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Total Scheduled for Thursday' : 'Total Agendado para Quinta'}</span>
            <span className={`text-2xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 38.000,00</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold ${isDark ? 'bg-white/[0.06] text-white/70 border border-white/[0.08]' : 'bg-slate-200 text-slate-700'}`}>
            2 {currentLang === 'en' ? 'Debits' : 'Débitos'}
          </span>
        </div>

        {/* Itemized Payment List */}
        <div className="space-y-1.5 mt-1">
          {/* Item 1: Mastercard Black Card Bill */}
          <div className={`p-2.5 rounded-[8px] flex items-center justify-between ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
              </div>
              <div className="min-w-0">
                <span className={`font-semibold block truncate ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Mastercard Black Bill' : 'Fatura Mastercard Black'}</span>
                <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Auto-debit • Aug 25' : 'Débito Automático • 25/08'}</span>
              </div>
            </div>
            <span className={`font-sans font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 34.150,00</span>
          </div>

          {/* Item 2: Condomínio Edifício Jardins */}
          <div className={`p-2.5 rounded-[8px] flex items-center justify-between ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-brand-orange" />
              </div>
              <div className="min-w-0">
                <span className={`font-semibold block truncate ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Condomínio Ed. Jardins' : 'Condomínio Ed. Jardins'}</span>
                <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Scheduled Boleto • Aug 25' : 'Boleto Agendado • 25/08'}</span>
              </div>
            </div>
            <span className={`font-sans font-bold text-right ml-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ 3.850,00</span>
          </div>
        </div>

        {/* Coverage Verification Status */}
        <div className={`p-2 rounded-[8px] flex items-center justify-between text-[11px] mt-1 ${isDark ? 'bg-white/[0.02] border border-white/[0.05] text-white/70' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 opacity-60" />
            <span>{currentLang === 'en' ? 'Checking Balance Covers 100%' : 'Saldo em Conta Cobre 100%'}</span>
          </div>
          <span className="font-sans font-bold">R$ 48.950,20</span>
        </div>
      </div>
    </div>
  );
});

ScheduledPaymentsCard.displayName = 'ScheduledPaymentsCard';
