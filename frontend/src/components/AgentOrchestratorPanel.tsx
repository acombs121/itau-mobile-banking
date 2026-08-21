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
  theme: 'dark' | 'light';
  onTriggerAgent: (agentId: string) => void;
  isProcessingAgent?: string | null;
}

export const AgentOrchestratorPanel: React.FC<AgentOrchestratorPanelProps> = ({
  subAgents,
  actionItems,
  telemetryLogs,
  currentLang,
  theme,
  onTriggerAgent,
  isProcessingAgent = null
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'actions' | 'graph' | 'logs'>('agents');
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<SubAgent | null>(subAgents[0] || null);
  const t = translations[currentLang];
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full rounded-[12px] shadow-2xl flex flex-col overflow-hidden min-h-[690px] border transition-colors duration-200 ${
        isDark
          ? 'bg-[#0D0D0D] border-white/[0.08] text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      
      {/* Sleek Minimalist Tabs */}
      <div className={`border-b px-6 flex items-center justify-between transition-colors ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'agents'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/40 hover:text-white/80'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {t.tabs.agents}
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/40 hover:text-white/80'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {t.tabs.actionPlan}
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'graph'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/40 hover:text-white/80'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {t.tabs.decisionGraph}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/40 hover:text-white/80'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {t.tabs.transcript}
          </button>
        </div>

        <div className={`hidden sm:flex items-center gap-2 text-[10px] font-mono ${
          isDark ? 'text-white/30' : 'text-slate-400'
        }`}>
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
                      isDark
                        ? isProcessing
                          ? 'bg-brand-orange/[0.04] border-brand-orange/40'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                        : isProcessing
                        ? 'bg-brand-orange/5 border-brand-orange/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
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
                              : isDark ? 'bg-white/20' : 'bg-slate-300'
                          }`}
                        />
                        <h3 className={`text-xs font-semibold leading-tight ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                          {agent.name}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        {isProcessing ? t.subagents.statusProcessing : isCompleted ? t.subagents.statusCompleted : t.subagents.statusIdle}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      {agent.description}
                    </p>

                    <div className={`flex items-center justify-between pt-2 border-t text-[10px] ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                      <button
                        onClick={() => setSelectedAgentDetail(agent)}
                        className={`transition-colors ${isDark ? 'text-white/40 hover:text-white/90' : 'text-slate-400 hover:text-slate-800'}`}
                      >
                        Telemetria JSON
                      </button>
                      <button
                        onClick={() => onTriggerAgent(agent.id)}
                        disabled={isProcessing}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          isDark ? 'text-white/80 hover:text-brand-orange' : 'text-slate-700 hover:text-brand-orange'
                        }`}
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
              <div className={`border rounded-[8px] p-3.5 mt-3 transition-colors ${
                isDark ? 'border-white/[0.06] bg-black/40' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className={`flex items-center justify-between text-[10px] mb-2 font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  <span>TELEMETRY: {selectedAgentDetail.id}</span>
                  <span>{selectedAgentDetail.lastRun || 'READY'}</span>
                </div>
                <pre className={`text-[11px] font-mono overflow-x-auto p-2 rounded max-h-36 border ${
                  isDark ? 'text-white/70 bg-black/50 border-white/[0.04]' : 'text-slate-800 bg-white border-slate-200'
                }`}>
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
              <div className={`p-8 text-center text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                {t.actionPlan.emptyState}
              </div>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-[8px] p-3.5 flex items-start justify-between gap-3 transition-colors ${
                      isDark
                        ? 'border-white/[0.06] bg-white/[0.01]'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-brand-orange font-medium">
                          {item.time}
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{item.title}</span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{item.description}</p>
                      {item.details && (
                        <div className={`text-[10px] font-mono mt-1 ${isDark ? 'text-emerald-400/90' : 'text-emerald-600'}`}>
                          {item.details}
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600 font-medium'}`}>
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
                  className={`border rounded-[8px] p-3 transition-colors ${
                    isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className={`text-[9px] font-mono uppercase mb-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    {node.layer}
                  </div>
                  <h3 className={`text-xs font-semibold mb-1 leading-tight ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{node.name}</h3>
                  <p className={`text-[10px] leading-tight ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                    {node.details}
                  </p>
                </div>
              ))}
            </div>

            <div className={`border rounded-[8px] p-3 transition-colors ${
              isDark ? 'border-white/[0.06] bg-black/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className={`text-[9px] font-mono uppercase mb-1 ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
                GRAPH QUERY (CYPHER)
              </div>
              <pre className={`text-[10px] font-mono overflow-x-auto ${isDark ? 'text-white/60' : 'text-slate-700'}`}>
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
              <div className={`p-8 text-center text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                {t.transcript.empty}
              </div>
            ) : (
              telemetryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-[6px] p-2.5 transition-colors ${
                    isDark ? 'border-white/[0.04] bg-black/30 text-white/70' : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className={`flex justify-between text-[10px] mb-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    <span className="text-brand-orange font-medium">{log.agentName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className={`text-[11px] mb-1 font-semibold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
                    Action: {log.action}
                  </div>
                  <pre className={`text-[10px] overflow-x-auto ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
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
