import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Activity, ListOrdered, CheckCircle2, Loader2, Play, Terminal, Lock } from 'lucide-react';
import { SubAgent, SecurityActionItem, TelemetryLog } from '../types/itau_concierge';
import { SecurityAlert } from '../types/banking';
import { Language, translations } from '../i18n/translations';

interface AgentOrchestratorPanelProps {
  subAgents: SubAgent[];
  actionItems: SecurityActionItem[];
  telemetryLogs: TelemetryLog[];
  activeAlerts: SecurityAlert[];
  currentLang: Language;
  onTriggerAgent: (agentId: string) => void;
  isProcessingAgent?: string | null;
}

export const AgentOrchestratorPanel: React.FC<AgentOrchestratorPanelProps> = ({
  subAgents,
  actionItems,
  telemetryLogs,
  currentLang,
  onTriggerAgent,
  isProcessingAgent = null
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'actions' | 'graph' | 'logs'>('agents');
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<SubAgent | null>(subAgents[0] || null);
  const t = translations[currentLang];

  return (
    <div className="w-full bg-[#0A1128] border border-white/15 rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-white min-h-[720px]">
      
      {/* Top Tab Bar */}
      <div className="bg-[#070707] border-b border-white/15 px-6 pt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'agents'
                ? 'border-brand-orange text-brand-orange bg-white/5 rounded-t-[4px]'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t.tabs.agents}</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {subAgents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'actions'
                ? 'border-brand-orange text-brand-orange bg-white/5 rounded-t-[4px]'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{t.tabs.actionPlan}</span>
            {actionItems.length > 0 && (
              <span className="text-[10px] font-mono bg-brand-orange text-white px-1.5 py-0.2 rounded-full">
                {actionItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'graph'
                ? 'border-brand-orange text-brand-orange bg-white/5 rounded-t-[4px]'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.tabs.decisionGraph}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-brand-orange text-brand-orange bg-white/5 rounded-t-[4px]'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.tabs.transcript}</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-400 font-mono pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Orchestrator v2.4 Active
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* =================================================================== */}
        {/* TAB 1: SUB-AGENTS ORCHESTRATION                                     */}
        {/* =================================================================== */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-orange" />
                {t.subagents.title}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{t.subagents.subtitle}</p>
            </div>

            {/* Sub-Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subAgents.map((agent) => {
                const isProcessing = isProcessingAgent === agent.id || agent.status === 'processing';
                const isCompleted = agent.status === 'completed';

                return (
                  <div
                    key={agent.id}
                    className={`rounded-[8px] p-4 border transition-all ${
                      isProcessing
                        ? 'bg-brand-orange/10 border-brand-orange ring-1 ring-brand-orange/40'
                        : isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-black/40 border-white/15 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[4px] bg-white/10 flex items-center justify-center font-bold text-xs">
                          {agent.type === 'fraud' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                          {agent.type === 'med' && <ShieldCheck className="w-4 h-4 text-brand-orange" />}
                          {agent.type === 'cards' && <Lock className="w-4 h-4 text-amber-400" />}
                          {agent.type === 'limits' && <Activity className="w-4 h-4 text-blue-400" />}
                          {agent.type === 'geolocation' && <Cpu className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white leading-tight">{agent.name}</h3>
                          <span className="text-[10px] font-mono text-text-muted">{agent.id}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1 ${
                          isProcessing
                            ? 'bg-brand-orange text-white animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {isProcessing ? t.subagents.statusProcessing : isCompleted ? t.subagents.statusCompleted : t.subagents.statusIdle}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      {agent.description}
                    </p>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {agent.capabilities.map((cap, i) => (
                        <span key={i} className="text-[9px] bg-white/5 border border-white/10 text-text-muted px-1.5 py-0.5 rounded-[2px]">
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                      <button
                        onClick={() => setSelectedAgentDetail(agent)}
                        className="text-[10px] text-text-muted hover:text-white underline"
                      >
                        Ver Telemetria
                      </button>
                      <button
                        onClick={() => onTriggerAgent(agent.id)}
                        disabled={isProcessing}
                        className="bg-white/10 hover:bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-[4px] flex items-center gap-1 transition-colors border border-white/20"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>{t.subagents.triggerManual}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Agent Output Telemetry Viewer */}
            {selectedAgentDetail && (
              <div className="bg-black/60 border border-white/20 rounded-[8px] p-4 mt-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-orange" />
                    <h3 className="text-xs font-bold text-white">
                      JSON Telemetry Output — {selectedAgentDetail.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">
                    {selectedAgentDetail.lastRun || 'Pronto'}
                  </span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-black/40 rounded border border-white/10 max-h-40">
                  {JSON.stringify(selectedAgentDetail.resultData || {
                    agent: selectedAgentDetail.name,
                    status: selectedAgentDetail.status,
                    system_compliance: "BACEN Resolution 147",
                    risk_score_evaluation: "94/100",
                    action_dispatched: "Precautionary fund retention verified"
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: SAFEGUARD ACTION PLAN (ITINERARY)                            */}
        {/* =================================================================== */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-brand-orange" />
                {t.actionPlan.title}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{t.actionPlan.subtitle}</p>
            </div>

            {actionItems.length === 0 ? (
              <div className="bg-black/30 border border-white/10 rounded-[8px] p-8 text-center text-xs text-text-muted">
                {t.actionPlan.emptyState}
              </div>
            ) : (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/40 border border-white/15 rounded-[8px] p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[4px] bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-brand-orange font-bold uppercase">
                            {item.time}
                          </span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <p className="text-xs text-slate-300">{item.description}</p>
                        {item.details && (
                          <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-2 border border-emerald-500/20">
                            {item.details}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-[4px]">
                      {t.actionPlan.statusSafeguarded}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: FRAUD DECISION GRAPH                                         */}
        {/* =================================================================== */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-orange" />
                {t.graph.title}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{t.graph.subtitle}</p>
            </div>

            {/* Visual 5-Stage Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {translations[currentLang].graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-black/40 border border-white/15 rounded-[8px] p-3.5 flex flex-col justify-between hover:border-brand-orange transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-text-muted mb-1.5">
                      <span>{node.layer}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }}></span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-tight mb-1">{node.name}</h3>
                    <span className="text-[10px] text-text-muted">{node.group}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-3 pt-2 border-t border-white/10 leading-tight">
                    {node.details}
                  </p>
                </div>
              ))}
            </div>

            {/* Cypher Query Inspector */}
            <div className="bg-black/60 border border-white/20 rounded-[8px] p-4">
              <div className="text-[10px] font-mono text-brand-orange font-bold uppercase mb-1">
                Active Graph Query (Cypher)
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-black/40 p-2.5 rounded border border-white/10">
MATCH (c:Cardholder &#123; id: "ROBERTO_SILVA_7749" &#125;)-[:INITIATED_TX]-&gt;(tx:PixTransaction)
WHERE tx.risk_score &gt; 85 AND tx.ip_anomaly = true
MATCH (p:ProtectionPolicy &#123; name: "BACEN_MED_147" &#125;)
RETURN tx.amount, tx.recipient, p.precautionary_action;
              </pre>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: TRANSCRIPT & TOOL TELEMETRY LOGS                             */}
        {/* =================================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-orange" />
                {t.transcript.title}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{t.transcript.subtitle}</p>
            </div>

            {telemetryLogs.length === 0 ? (
              <div className="bg-black/30 border border-white/10 rounded-[8px] p-8 text-center text-xs text-text-muted">
                {t.transcript.empty}
              </div>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {telemetryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-black/50 border border-white/10 rounded-[6px] p-3 text-slate-300"
                  >
                    <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 pb-1 border-b border-white/10">
                      <span className="text-brand-orange font-bold">{log.agentName}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-white font-semibold mb-1">
                      Action: {log.action}
                    </div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto bg-black/30 p-1.5 rounded">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
