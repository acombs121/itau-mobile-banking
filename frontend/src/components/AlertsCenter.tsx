import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SecurityAlert } from '../types/banking';
import { Language, translations } from '../i18n/translations';

interface AlertsCenterProps {
  alerts: SecurityAlert[];
  currentLang: Language;
  onActionClick: (action: string, targetId: string) => void;
  onOpenVoiceAssistant: (alertId?: string) => void;
  isProcessing?: boolean;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  alerts,
  currentLang,
  onActionClick,
  onOpenVoiceAssistant,
  isProcessing = false
}) => {
  const t = translations[currentLang].alertsCenter;

  return (
    <div id="alerts-feed" className="bg-white rounded-[8px] border border-[#AEAEAE]/40 shadow-sm p-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#AEAEAE]/30 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
            <ShieldAlert className="w-5 h-5 text-brand-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">{t.title}</h2>
            <p className="text-xs text-text-muted">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {t.monitoringActive}
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isResolved = alert.status === 'blocked_and_reversed' || alert.status === 'approved_by_user';

          return (
            <div
              key={alert.id}
              className={`rounded-[8px] border p-5 transition-all duration-150 ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : isCritical
                  ? 'bg-rose-50/60 border-rose-300'
                  : 'bg-amber-50/60 border-amber-300'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-[4px] ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCritical
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isResolved ? t.resolvedBadge : alert.severity}
                  </span>
                  <h3 className="text-base font-bold text-text-main">{alert.title}</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">{alert.timestamp}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                {alert.description}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 border border-slate-200/80 rounded-[6px] p-3 mb-4 text-xs">
                <div>
                  <span className="text-[11px] text-text-muted block font-medium">{t.blockedAmount}</span>
                  <span className="font-bold font-mono text-slate-900">
                    {alert.amount_brl ? `R$ ${alert.amount_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted block font-medium">{t.suspectRecipient}</span>
                  <span className="font-bold text-slate-900 truncate block">{alert.recipient || 'Regra de Horário Noturno'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted block font-medium">{t.aiRiskScore}</span>
                  <span className={`font-bold font-mono ${alert.risk_score > 70 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {alert.risk_score} / 100
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="text-[11px] text-slate-600 font-medium">
                  <strong>{t.directive}</strong> {alert.policy_matched}
                </div>

                {!isResolved ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenVoiceAssistant(alert.id)}
                      className="bg-hero-bg hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                      {t.discussWithAi}
                    </button>

                    {isCritical && (
                      <button
                        onClick={() => onActionClick('block_pix', alert.id)}
                        disabled={isProcessing}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-all"
                      >
                        {t.blockPermanently}
                      </button>
                    )}

                    <button
                      onClick={() => onActionClick('approve_pix', alert.id)}
                      disabled={isProcessing}
                      className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-[4px] transition-all"
                    >
                      {t.authorizeTx}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t.actionConfirmed}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
