import React from 'react';
import { TrendingUp, X, Check, ShieldCheck } from 'lucide-react';
import { Language } from '../../../i18n/translations';
import { BrandingProfile } from '../../../types/brand';

interface CompetitorsSummary {
  short_en: string;
  short_pt: string;
  detailed: string;
}

interface OpenFinanceSelectCardProps {
  isDark: boolean;
  currentLang: Language;
  activeBrand: BrandingProfile;
  competitorsSummary: CompetitorsSummary;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

export const OpenFinanceSelectCard: React.FC<OpenFinanceSelectCardProps> = React.memo(({
  isDark,
  currentLang,
  activeBrand,
  competitorsSummary,
  onClose,
  onActionClick
}) => {
  const brandShortName = activeBrand.name.replace(/^Banco\s+/i, '');

  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'OPEN FINANCE — RATE ANALYSIS' : 'OPEN FINANCE — ANÁLISE DE TAXAS'}
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

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold mb-2.5 ${
        isDark ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
        <span>{currentLang === 'en' ? 'CONNECTED VIA BACEN OPEN FINANCE' : 'CONECTADO VIA OPEN FINANCE BACEN'}</span>
      </div>

      <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
        {currentLang === 'en'
          ? 'Which rate category would you like me to analyze across your connected accounts?'
          : 'Qual categoria de taxas você gostaria que eu analise nas suas contas conectadas?'}
      </p>

      <div className="space-y-2 text-xs">
        {/* Category 1: CDI Balances */}
        <div
          onClick={() => onActionClick('quote_open_finance_cdi')}
          className={`p-3 rounded-[10px] border cursor-pointer transition-all hover:scale-[1.01] ${
            isDark ? 'bg-white/[0.03] border-brand-orange/40 hover:border-brand-orange' : 'bg-orange-50/50 border-brand-orange/40 hover:border-brand-orange'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-brand-orange text-xs">
              {currentLang === 'en' ? '1. CDI Balances & Yield' : '1. Saldos e Rendimentos CDI'}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${isDark ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-orange/15 text-brand-orange'}`}>
              {currentLang === 'en' ? 'Say "CDI"' : 'Diga "CDI"'}
            </span>
          </div>
          <p className={`text-[10.5px] leading-snug ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
            {currentLang === 'en'
              ? `Check whether your liquid funds at ${competitorsSummary.short_en} are earning 100% of CDI.`
              : `Verificar se seus investimentos no ${competitorsSummary.short_pt} estão rendendo 100% do CDI.`}
          </p>
        </div>

        {/* Category 2: Debt Balances */}
        <div
          onClick={() => onActionClick('refinance_open_finance')}
          className={`p-3 rounded-[10px] border cursor-pointer transition-all hover:scale-[1.01] ${
            isDark ? 'bg-white/[0.02] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold text-xs ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
              {currentLang === 'en' ? '2. Outstanding Debt Balances' : '2. Saldos Devedores e Crédito'}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${isDark ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-700'}`}>
              {currentLang === 'en' ? 'Say "Debt"' : 'Diga "Dívidas"'}
            </span>
          </div>
          <p className={`text-[10.5px] leading-snug ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
            {currentLang === 'en'
              ? `Analyze competitor revolving debt for potential rate reduction via ${brandShortName} Sob Medida.`
              : `Analisar dívidas rotativas externas para redução de juros via ${brandShortName} Sob Medida.`}
          </p>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="font-mono text-[10px] text-brand-orange animate-pulse">
          {currentLang === 'en' ? 'Listening... Say "CDI" to quote yield improvements' : 'Ouvindo... Diga "CDI" para ver as melhorias de rentabilidade'}
        </span>
      </div>
    </div>
  );
});

OpenFinanceSelectCard.displayName = 'OpenFinanceSelectCard';

interface OpenFinanceCdiCardProps {
  isDark: boolean;
  currentLang: Language;
  activeBrand: BrandingProfile;
  competitorsSummary: CompetitorsSummary;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

export const OpenFinanceCdiCard: React.FC<OpenFinanceCdiCardProps> = React.memo(({
  isDark,
  currentLang,
  activeBrand,
  competitorsSummary,
  onClose,
  onActionClick
}) => {
  const brandShortName = activeBrand.name.replace(/^Banco\s+/i, '');

  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'CDI YIELD OPTIMIZATION' : 'OTIMIZAÇÃO DE RENDIMENTO CDI'}
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

      <div className="space-y-2.5 text-xs">
        {/* External Balance Notice */}
        <div className={`p-2.5 rounded-[8px] ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
          <span className={`text-[10px] block font-mono uppercase ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {currentLang === 'en' ? 'External Connected Liquidity' : 'Liquidez Externa Conectada'}
          </span>
          <span className={`text-base font-black font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            R$ 330.000,00
          </span>
          <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {competitorsSummary.detailed}
          </span>
        </div>

        {/* Yield Comparison Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-[8px] border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
            <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              {currentLang === 'en' ? 'Competitors' : 'Concorrentes'}
            </span>
            <span className={`font-mono text-xs font-semibold ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              {currentLang === 'en' ? '85% of CDI' : '85% do CDI'}
            </span>
            <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              {currentLang === 'en' ? 'Lower yield' : 'Rentabilidade menor'}
            </span>
          </div>

          <div className={`p-2.5 rounded-[8px] border ${isDark ? 'bg-brand-orange/10 border-brand-orange/30' : 'bg-orange-50 border-brand-orange/30'}`}>
            <span className="text-[9px] block uppercase font-mono tracking-wider text-brand-orange font-bold">
              {brandShortName} CDB DI
            </span>
            <span className="font-mono text-xs font-black text-brand-orange">
              {currentLang === 'en' ? '100% of CDI' : '100% do CDI'}
            </span>
            <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-brand-orange/80' : 'text-brand-orange'}`}>
              {currentLang === 'en' ? 'Daily Liquidity 24/7' : 'Liquidez Diária 24/7'}
            </span>
          </div>
        </div>

        {/* Net Improvement Hero Banner */}
        <div className={`py-2 px-2.5 rounded-[8px] flex items-center justify-between border ${
          isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <div className="min-w-0 flex-1 pr-1">
            <span className="text-[9px] uppercase font-mono font-bold block opacity-80 tracking-wider">
              {currentLang === 'en' ? 'Yield Spread Advantage' : 'Ganho Adicional Líquido'}
            </span>
            <div className="font-mono font-extrabold text-xs sm:text-[13px] whitespace-nowrap tracking-tight leading-normal mt-0.5">
              {currentLang === 'en'
                ? '+15% of CDI (+R$ 5,940/yr)'
                : '+15% do CDI (+R$ 5.940/ano)'}
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Approval CTA Button */}
        <button
          onClick={() => onActionClick('confirm_cdi_transfer')}
          className="w-full py-2.5 px-2 rounded-[8px] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1 whitespace-nowrap"
        >
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {currentLang === 'en'
              ? 'Approve Transfer (R$ 330k → 100% CDI)'
              : 'Aprovar Mudança (R$ 330k → 100% CDI)'}
          </span>
        </button>

        <div className="text-center pt-0.5">
          <span className={`text-[10px] font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {currentLang === 'en' ? 'Say: "ok, let\'s make that change" or "I approve"' : 'Diga: "ok, pode fazer a mudança" ou "aprovo"'}
          </span>
        </div>
      </div>
    </div>
  );
});

OpenFinanceCdiCard.displayName = 'OpenFinanceCdiCard';

interface OpenFinanceTransferConfirmedCardProps {
  isDark: boolean;
  currentLang: Language;
  activeBrand: BrandingProfile;
  onClose: () => void;
}

export const OpenFinanceTransferConfirmedCard: React.FC<OpenFinanceTransferConfirmedCardProps> = React.memo(({
  isDark,
  currentLang,
  activeBrand,
  onClose
}) => {
  const brandShortName = activeBrand.name.replace(/^Banco\s+/i, '');

  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'TRANSFER CONFIRMED' : 'TRANSFERÊNCIA CONFIRMADA'}
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

      <div className="space-y-2.5 text-xs text-center py-1">
        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center border ${
          isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          <Check className="w-6 h-6" />
        </div>

        <div>
          <span className={`text-base font-black font-sans block ${isDark ? 'text-white' : 'text-slate-900'}`}>
            R$ 330.000,00 {currentLang === 'en' ? 'Transferred' : 'Transferidos'}
          </span>
          <span className={`text-[11px] font-bold block mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {currentLang === 'en' ? 'Now Earning 100% of CDI (Liquidez Diária)' : 'Agora Rendendo 100% do CDI (Liquidez Diária)'}
          </span>
        </div>

        <div className={`p-2.5 rounded-[8px] text-left space-y-1 ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex justify-between text-[10.5px]">
            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Annual Yield Gain:' : 'Ganho Anual Adicional:'}</span>
            <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+R$ 5.940,00 / ano</span>
          </div>
          <div className="flex justify-between text-[10.5px]">
            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>
              {currentLang === 'en' ? `New ${brandShortName} Liquid Total:` : `Novo Patrimônio Total ${brandShortName}:`}
            </span>
            <span className="font-mono font-bold">R$ 463.950,20</span>
          </div>
          <div className="flex justify-between text-[10.5px]">
            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{currentLang === 'en' ? 'Settlement Rail:' : 'Canal de Liquidação:'}</span>
            <span className="font-mono text-[9.5px]">Open Finance / CIP</span>
          </div>
        </div>

        <div className={`p-2 rounded-[6px] text-[10px] ${isDark ? 'bg-white/[0.02] text-white/50' : 'bg-slate-100 text-slate-600'}`}>
          {currentLang === 'en' ? 'Funds secured with daily liquidity 24/7' : 'Recursos protegidos com liquidez diária 24/7'}
        </div>
      </div>
    </div>
  );
});

OpenFinanceTransferConfirmedCard.displayName = 'OpenFinanceTransferConfirmedCard';

interface OpenFinanceOptimizerCardProps {
  isDark: boolean;
  currentLang: Language;
  activeBrand: BrandingProfile;
  isOpenFinanceRefiDone: boolean;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

export const OpenFinanceOptimizerCard: React.FC<OpenFinanceOptimizerCardProps> = React.memo(({
  isDark,
  currentLang,
  activeBrand,
  isOpenFinanceRefiDone,
  onClose,
  onActionClick
}) => {
  const brandShortName = activeBrand.name.replace(/^Banco\s+/i, '');

  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 opacity-70" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'OPEN FINANCE ARBITRAGE' : 'ARBITRAGEM OPEN FINANCE'}
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

      <div className="space-y-2.5 text-xs">
        {/* 1. Debt Interest Rate Comparison */}
        <div className={`p-3 rounded-[10px] space-y-2 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentLang === 'en' ? 'Debt Refinancing' : 'Refinanciamento de Dívida'}
            </span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
              isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {currentLang === 'en' ? 'Save R$ 14,280' : 'Economia R$ 14.280'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
              <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {currentLang === 'en' ? 'Competitor' : 'Concorrente'}
              </span>
              <span className={`font-mono text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                11,20% a.m.
              </span>
            </div>
            <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
              <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {brandShortName} Sob Medida
              </span>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                1,69% a.m.
              </span>
            </div>
          </div>

          <div className={`text-[10.5px] flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <span className={isDark ? 'text-white/50' : 'text-slate-500'}>
              {currentLang === 'en' ? 'Monthly Savings' : 'Economia Mensal'}
            </span>
            <span className={`font-mono font-medium whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              -9,51% a.m. (R$ 680,40/mês)
            </span>
          </div>
        </div>

        {/* 2. Savings & Fixed Income Yield Comparison */}
        <div className={`p-3 rounded-[10px] space-y-2 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentLang === 'en' ? 'CDB Yield Difference' : 'Rendimento CDB DI'}
            </span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
              isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {currentLang === 'en' ? '+R$ 5,940 / yr' : '+R$ 5.940 / ano'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
              <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {currentLang === 'en' ? 'Competitor' : 'Concorrente'}
              </span>
              <span className={`font-mono text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                85% do CDI
              </span>
            </div>
            <div className={`p-2 rounded-[6px] ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
              <span className={`text-[9px] block uppercase font-mono tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {brandShortName} CDB DI
              </span>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                100% do CDI
              </span>
            </div>
          </div>

          <div className={`text-[10.5px] flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <span className={isDark ? 'text-white/50' : 'text-slate-500'}>
              {currentLang === 'en' ? 'Yield Advantage' : 'Ganho Adicional'}
            </span>
            <span className={`font-mono font-medium whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              +15% CDI (Liquidez Diária)
            </span>
          </div>
        </div>

        {/* Refinance Action Button or Confirmed State */}
        {isOpenFinanceRefiDone ? (
          <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'
              }`}>
                <Check className={`w-2.5 h-2.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {currentLang === 'en' ? 'Digital CCB Registered' : 'CCB Digital Registrada'}
              </span>
            </div>
            <span className={`font-mono text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {currentLang === 'en' ? 'R$ 14,280 Saved' : 'R$ 14.280 Salvos'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onActionClick('refinance_open_finance')}
            className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{currentLang === 'en' ? 'Issue Digital CCB (Law 10,931)' : 'Emitir CCB Digital (Lei 10.931)'}</span>
          </button>
        )}
      </div>
    </div>
  );
});

OpenFinanceOptimizerCard.displayName = 'OpenFinanceOptimizerCard';
