import React from 'react';
import { Calendar, X, Check, TrendingUp, Plane, MapPin, ShieldPlus, CreditCard, Car } from 'lucide-react';
import { Language } from '../../../i18n/translations';

interface CashFlowForecastCardProps {
  isDark: boolean;
  currentLang: Language;
  isCdbSweepScheduled: boolean;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

export const CashFlowForecastCard: React.FC<CashFlowForecastCardProps> = React.memo(({
  isDark,
  currentLang,
  isCdbSweepScheduled,
  onClose,
  onActionClick
}) => {
  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 opacity-70" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'CASH FLOW & YIELD OPTIMIZER' : 'PREVISÃO DE SALDO & YIELD'}
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

      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-[9px] font-mono font-bold mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
        <span>{currentLang === 'en' ? 'TRIGGERED BY PREDICTIVE BALANCE ALERT' : 'DISPARADO POR ALERTA PREVENTIVO'}</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className={`p-2.5 rounded-[10px] border shadow-sm ${
          isDark 
            ? 'bg-white/10 border-white/15 text-red-400 backdrop-blur-sm' 
            : 'bg-white/90 border-red-200 text-red-600'
        }`}>
          <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {currentLang === 'en' ? 'D+4 Projected Shortfall' : 'Déficit Projetado D+4'}
          </span>
          <span className={`text-base font-bold font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            -R$ 13.050,00
          </span>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-red-300/80' : 'text-red-600/80'}`}>
            {currentLang === 'en' ? 'After Lisbon flight purchase & Thursday bill debits.' : 'Após compra de passagens e débitos de fatura na quinta.'}
          </p>
        </div>

        <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Yield Strategy' : 'Estratégia de Rendimento'}</span>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>R$ 85k {currentLang === 'en' ? 'earning 100% CDI until 06:00 BRT' : 'rendendo 100% CDI até 06:00'}</span>
        </div>

        {isCdbSweepScheduled ? (
          <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between mt-1 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'
              }`}>
                <Check className={`w-2.5 h-2.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {currentLang === 'en' ? 'CDB Sweep Scheduled' : 'Resgate CDB Agendado'}
              </span>
            </div>
            <span className={`font-mono text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {currentLang === 'en' ? 'R$ 15k on Thu' : 'R$ 15k na Quinta'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onActionClick('sweep_cdb')}
            className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Schedule CDB Sweep (R$ 15k)' : 'Agendar Resgate CDB (R$ 15k)'}</span>
          </button>
        )}
      </div>
    </div>
  );
});

CashFlowForecastCard.displayName = 'CashFlowForecastCard';

interface TravelShieldCardProps {
  isDark: boolean;
  currentLang: Language;
  isTravelModeActive: boolean;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

export const TravelShieldCard: React.FC<TravelShieldCardProps> = React.memo(({
  isDark,
  currentLang,
  isTravelModeActive,
  onClose,
  onActionClick
}) => {
  return (
    <div className={`w-full rounded-[16px] p-4 border animate-fadeIn shadow-2xl relative ${
      isDark ? 'bg-[#15151A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
    }`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 opacity-70" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'TRAVEL SHIELD & FRAUD DEFENSE' : 'AVISO VIAGEM & ANTIFRAUDE'}
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

      <div className="space-y-2 text-xs">
        <div className={`p-2.5 rounded-[10px] ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <span className={`text-[10px] block ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Destinations' : 'Destinos'}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Portugal (LIS) • Espanha (MAD)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
            <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'POS Spend Limit' : 'Limite POS'}</span>
            <span className="font-mono font-bold text-brand-orange">R$ 50.000,00</span>
          </div>
          <div className={`p-2 rounded-[8px] ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
            <span className={`text-[9px] block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Declines' : 'Recusas'}</span>
            <span className={`font-semibold font-mono text-[11px] ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{currentLang === 'en' ? 'Pre-Suppressed' : 'Suprimidas'}</span>
          </div>
        </div>

        {isTravelModeActive ? (
          <div className={`w-full py-2.5 px-3 rounded-[8px] border text-xs flex items-center justify-between mt-1 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'
              }`}>
                <Check className={`w-2.5 h-2.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {currentLang === 'en' ? 'Travel Shield Active' : 'Aviso de Viagem Ativo'}
              </span>
            </div>
            <span className={`font-mono text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {currentLang === 'en' ? 'Limit: R$ 50k' : 'Limite: R$ 50k'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onActionClick('activate_travel_mode')}
            className="w-full py-2.5 px-4 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all mt-1"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Confirm Travel Notice' : 'Confirmar Aviso de Viagem'}</span>
          </button>
        )}

        {/* Proactive Card Benefits Action Button */}
        {isTravelModeActive && (
          <button
            onClick={() => onActionClick('get_card_benefits')}
            className={`w-full py-2 px-3 rounded-[8px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-1.5 ${
              isDark 
                ? 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md' 
                : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md'
            }`}
          >
            <ShieldPlus className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Explore Mastercard Black Benefits →' : 'Ver Benefícios do Mastercard Black →'}</span>
          </button>
        )}
      </div>
    </div>
  );
});

TravelShieldCard.displayName = 'TravelShieldCard';

interface CardBenefitsCardProps {
  isDark: boolean;
  currentLang: Language;
  onClose: () => void;
}

export const CardBenefitsCard: React.FC<CardBenefitsCardProps> = React.memo(({
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
          <CreditCard className="w-3.5 h-3.5 opacity-70" />
          <span className={`text-[10.5px] font-mono font-bold tracking-wide uppercase ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
            {currentLang === 'en' ? 'MASTERCARD BLACK BENEFITS' : 'BENEFÍCIOS MASTERCARD BLACK'}
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

      <div className="space-y-2 text-xs">
        <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <ShieldPlus className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
          <div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Schengen Medical Insurance' : 'Seguro Médico Schengen'}</div>
            <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>€30.000 / USD $150.000 {currentLang === 'en' ? 'coverage included' : 'cobertura inclusa'}</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <Plane className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
          <div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'VIP Airport Lounges' : 'Salas VIP Aeroportos'}</div>
            <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{currentLang === 'en' ? 'GRU T3 Unlimited + 4 LoungeKey passes' : 'GRU T3 Ilimitado + 4 passes LoungeKey'}</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-[8px] flex items-start gap-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <Car className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/90' : 'text-slate-700'}`} />
          <div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentLang === 'en' ? 'Masterseguro Auto (CDW/LDW)' : 'Masterseguro de Automóveis'}</div>
            <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{currentLang === 'en' ? 'Rental car damage protection + 24/7 Concierge' : 'Cobertura de locação + Concierge 24h'}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

CardBenefitsCard.displayName = 'CardBenefitsCard';
