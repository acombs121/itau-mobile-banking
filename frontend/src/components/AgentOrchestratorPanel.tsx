import React, { useState } from 'react';
import { Play } from 'lucide-react';
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
    <div className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-[12px] shadow-2xl flex flex-col overflow-hidden text-white min-h-[690px]">
      
      {/* Sleek Minimalist Tabs */}
      <div className="border-b border-white/[0.08] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'agents'
                ? 'border-brand-orange text-white'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {t.tabs.agents}
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-brand-orange text-white'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {t.tabs.actionPlan}
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'graph'
                ? 'border-brand-orange text-white'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {t.tabs.decisionGraph}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-brand-orange text-white'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {t.tabs.transcript}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/30 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          ORCHESTRATOR ACTIVE
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* TAB 1: SUB-AGENTS */}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            
            {/* Minimal Sub-Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subAgents.map((agent) => {
                const isProcessing = isProcessingAgent === agent.id || agent.status === 'processing';
                const isCompleted = agent.status === 'completed';

                return (
                  <div
                    key={agent.id}
                    className={`rounded-[8px] p-4 border transition-all ${
                      isProcessing
                        ? 'bg-brand-orange/[0.04] border-brand-orange/40'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isProcessing
                              ? 'bg-brand-orange animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-white/20'
                          }`}
                        />
                        <h3 className="text-xs font-semibold text-white/90 leading-tight">
                          {agent.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">
                        {isProcessing ? t.subagents.statusProcessing : isCompleted ? t.subagents.statusCompleted : t.subagents.statusIdle}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                      {agent.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px]">
                      <button
                        onClick={() => setSelectedAgentDetail(agent)}
                        className="text-white/40 hover:text-white/90 transition-colors"
                      >
                        Telemetria JSON
                      </button>
                      <button
                        onClick={() => onTriggerAgent(agent.id)}
                        disabled={isProcessing}
                        className="text-white/80 hover:text-brand-orange flex items-center gap-1 font-medium transition-colors"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>{t.subagents.triggerManual}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clean JSON Telemetry Inspector */}
            {selectedAgentDetail && (
              <div className="border border-white/[0.06] rounded-[8px] p-3.5 bg-black/40 mt-3">
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-2 font-mono">
                  <span>TELEMETRY: {selectedAgentDetail.id}</span>
                  <span>{selectedAgentDetail.lastRun || 'READY'}</span>
                </div>
                <pre className="text-[11px] font-mono text-white/70 overflow-x-auto p-2 rounded bg-black/50 border border-white/[0.04] max-h-36">
                  {JSON.stringify(selectedAgentDetail.resultData || {
                    agent: selectedAgentDetail.name,
                    status: selectedAgentDetail.status,
                    system_compliance: "BACEN Resolution 147",
                    risk_score: "94/100"
                  }, null, 2)}
                </pre>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SAFEGUARD PLAN */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            {actionItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/30">
                {t.actionPlan.emptyState}
              </div>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-white/[0.06] rounded-[8px] p-3.5 bg-white/[0.01] flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-brand-orange">
                          {item.time}
                        </span>
                        <span className="text-xs font-semibold text-white/90">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-white/60">{item.description}</p>
                      {item.details && (
                        <div className="text-[10px] font-mono text-emerald-400/90 mt-1">
                          {item.details}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400">
                      {t.actionPlan.statusSafeguarded}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DECISION GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {translations[currentLang].graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="border border-white/[0.06] rounded-[8px] p-3 bg-white/[0.01]"
                >
                  <div className="text-[9px] font-mono text-white/30 uppercase mb-1">
                    {node.layer}
                  </div>
                  <h3 className="text-xs font-semibold text-white/90 mb-1 leading-tight">{node.name}</h3>
                  <p className="text-[10px] text-white/50 leading-tight">
                    {node.details}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-white/[0.06] rounded-[8px] p-3 bg-black/40">
              <div className="text-[9px] font-mono text-white/30 uppercase mb-1">
                GRAPH QUERY (CYPHER)
              </div>
              <pre className="text-[10px] font-mono text-white/60 overflow-x-auto">
MATCH (c:Cardholder &#123; id: "ROBERTO_SILVA_7749" &#125;)-[:INITIATED_TX]-&gt;(tx:PixTransaction)
WHERE tx.risk_score &gt; 85 AND tx.ip_anomaly = true
MATCH (p:ProtectionPolicy &#123; name: "BACEN_MED_147" &#125;)
RETURN tx.amount, tx.recipient, p.precautionary_action;
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSCRIPT & LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-2 font-mono text-xs">
            {telemetryLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/30">
                {t.transcript.empty}
              </div>
            ) : (
              telemetryLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-white/[0.04] rounded-[6px] p-2.5 bg-black/30 text-white/70"
                >
                  <div className="flex justify-between text-[10px] text-white/30 mb-1">
                    <span className="text-brand-orange font-medium">{log.agentName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-white/90 mb-1">
                    Action: {log.action}
                  </div>
                  <pre className="text-[10px] text-white/50 overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};
