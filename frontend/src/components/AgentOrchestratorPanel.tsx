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
      className={`w-full h-full max-h-[calc(100vh-5.5rem)] rounded-[14px] shadow-2xl flex flex-col min-h-0 border transition-colors duration-200 ${
        isDark
          ? 'bg-[#0E0E11] border-white/[0.08] text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      
      {/* Sleek Minimalist Tabs */}
      <div className={`border-b px-6 flex items-center justify-between flex-shrink-0 transition-colors ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'agents'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/50 hover:text-white/90'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabs.agents}
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/50 hover:text-white/90'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabs.actionPlan}
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'graph'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/50 hover:text-white/90'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabs.decisionGraph}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-brand-orange ' + (isDark ? 'text-white' : 'text-slate-900 font-semibold')
                : isDark
                ? 'border-transparent text-white/50 hover:text-white/90'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabs.transcript}
          </button>
        </div>

        <div className={`hidden sm:flex items-center gap-2 text-xs font-mono ${
          isDark ? 'text-white/40' : 'text-slate-500'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ORCHESTRATOR ACTIVE
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto min-h-0">
        
        {/* TAB 1: SUB-AGENTS (Single-Column Cards Left, JSON Telemetry Right) */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full items-stretch min-h-0">
            
            {/* Left Column: Stacked Agent Cards (Single Column) */}
            <div className="lg:col-span-6 flex flex-col gap-2.5 overflow-y-auto pr-1 min-h-0">
              {subAgents.map((agent) => {
                const isProcessing = isProcessingAgent === agent.id || agent.status === 'processing';
                const isCompleted = agent.status === 'completed';
                const isSelected = selectedAgentDetail?.id === agent.id;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentDetail(agent)}
                    className={`rounded-[10px] p-3.5 border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-white/[0.05] border-brand-orange ring-1 ring-brand-orange/40'
                          : 'bg-orange-50/50 border-brand-orange ring-1 ring-brand-orange/30 shadow-sm'
                        : isDark
                        ? isProcessing
                          ? 'bg-brand-orange/[0.04] border-brand-orange/40'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.18]'
                        : isProcessing
                        ? 'bg-brand-orange/5 border-brand-orange/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isProcessing
                              ? 'bg-brand-orange animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500'
                              : isDark ? 'bg-white/30' : 'bg-slate-300'
                          }`}
                        />
                        <h3 className={`text-xs sm:text-sm font-semibold leading-snug truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                          {agent.name}
                        </h3>
                      </div>
                      <span className={`text-xs font-mono flex-shrink-0 ml-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        {isProcessing ? t.subagents.statusProcessing : isCompleted ? t.subagents.statusCompleted : t.subagents.statusIdle}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed mb-2.5 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                      {agent.description}
                    </p>

                    <div className={`flex items-center justify-between pt-1.5 border-t text-xs ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                      <span
                        className={`font-medium ${isSelected ? 'text-brand-orange' : isDark ? 'text-white/50' : 'text-slate-500'}`}
                      >
                        Telemetria JSON
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerAgent(agent.id);
                        }}
                        disabled={isProcessing}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          isDark ? 'text-white/90 hover:text-brand-orange' : 'text-slate-800 hover:text-brand-orange'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{t.subagents.triggerManual}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Full-Height JSON Telemetry Inspector */}
            <div className="lg:col-span-6 flex flex-col h-full min-h-[320px]">
              {selectedAgentDetail ? (
                <div className={`h-full border rounded-[10px] p-4 flex flex-col min-h-0 transition-colors ${
                  isDark ? 'border-white/[0.08] bg-black/50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`flex items-center justify-between text-xs mb-2.5 font-mono pb-2 border-b flex-shrink-0 ${
                    isDark ? 'border-white/[0.06] text-white/60' : 'border-slate-200 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                      <span className="font-bold uppercase tracking-wider">{selectedAgentDetail.id}</span>
                    </div>
                    <span>{selectedAgentDetail.lastRun || 'READY'}</span>
                  </div>
                  
                  <pre className={`flex-1 text-xs font-mono overflow-y-auto overflow-x-auto p-3 rounded min-h-0 border leading-relaxed ${
                    isDark ? 'text-white/85 bg-black/60 border-white/[0.04]' : 'text-slate-800 bg-white border-slate-200'
                  }`}>
                    {JSON.stringify(selectedAgentDetail.resultData || {
                      agent: selectedAgentDetail.name,
                      id: selectedAgentDetail.id,
                      status: selectedAgentDetail.status,
                      system_compliance: "BACEN Resolution 147",
                      risk_score: "94/100",
                      capabilities: selectedAgentDetail.capabilities
                    }, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className={`h-full border rounded-[10px] p-8 flex items-center justify-center text-xs ${
                  isDark ? 'border-white/[0.06] text-white/30' : 'border-slate-200 text-slate-400'
                }`}>
                  Selecione um sub-agente para inspecionar a telemetria.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: SAFEGUARD PLAN */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            {actionItems.length === 0 ? (
              <div className={`p-8 text-center text-xs sm:text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {t.actionPlan.emptyState}
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-[10px] p-4 flex items-start justify-between gap-4 transition-colors ${
                      isDark
                        ? 'border-white/[0.06] bg-white/[0.01]'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-xs font-mono text-brand-orange font-bold">
                          {item.time}
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-white/95' : 'text-slate-900'}`}>{item.title}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{item.description}</p>
                      {item.details && (
                        <div className={`text-xs font-mono mt-1.5 ${isDark ? 'text-emerald-400/90' : 'text-emerald-600'}`}>
                          {item.details}
                        </div>
                      )}
                    </div>

                    <span className={`text-xs font-mono font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {translations[currentLang].graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`border rounded-[10px] p-3.5 transition-colors ${
                    isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className={`text-[10px] font-mono uppercase mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    {node.layer}
                  </div>
                  <h3 className={`text-xs sm:text-sm font-semibold mb-1.5 leading-snug ${isDark ? 'text-white/95' : 'text-slate-900'}`}>{node.name}</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                    {node.details}
                  </p>
                </div>
              ))}
            </div>

            <div className={`border rounded-[10px] p-3.5 transition-colors ${
              isDark ? 'border-white/[0.06] bg-black/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className={`text-xs font-mono uppercase mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                GRAPH QUERY (CYPHER)
              </div>
              <pre className={`text-xs font-mono overflow-x-auto ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
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
          <div className="space-y-2.5 font-mono text-xs">
            {telemetryLogs.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {t.transcript.empty}
              </div>
            ) : (
              telemetryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-[8px] p-3 transition-colors ${
                    isDark ? 'border-white/[0.04] bg-black/30 text-white/80' : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className={`flex justify-between text-xs mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    <span className="text-brand-orange font-medium">{log.agentName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className={`text-xs sm:text-sm mb-1 font-semibold ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                    Action: {log.action}
                  </div>
                  <pre className={`text-xs overflow-x-auto ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
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
