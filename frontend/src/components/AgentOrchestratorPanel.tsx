import React, { useState, useEffect } from 'react';
import { SubAgent, SecurityActionItem, TelemetryLog, ScenarioId } from '../types/itau_concierge';
import { Language, translations } from '../i18n/translations';

interface AgentOrchestratorPanelProps {
  subAgents?: SubAgent[];
  actionItems?: SecurityActionItem[];
  telemetryLogs?: TelemetryLog[];
  currentLang: Language;
  theme: 'dark' | 'light';
  activeScenario: ScenarioId;
  onTriggerAgent?: (agentId: string) => void;
  isProcessingAgent?: string | null;
  activeRunningAgentId?: string | null;
  agentStates?: Record<string, { status: 'idle' | 'running' | 'completed'; lastRun?: string; liveResult?: Record<string, any> }>;
}

export const AgentOrchestratorPanel: React.FC<AgentOrchestratorPanelProps> = ({
  currentLang,
  theme,
  activeScenario,
  onTriggerAgent: _onTriggerAgent,
  isProcessingAgent = null,
  activeRunningAgentId = null,
  agentStates = {}
}) => {
  const t = translations[currentLang];
  const isDark = theme === 'dark';

  const activeScenarioDef = t.scenarios.find(s => s.id === activeScenario) || t.scenarios[0];
  const [selectedAgentId, setSelectedAgentId] = useState<string>(activeScenarioDef.agentId);

  // Auto-focus on whichever agent is actively running or triggered
  useEffect(() => {
    if (activeRunningAgentId) {
      setSelectedAgentId(activeRunningAgentId);
    }
  }, [activeRunningAgentId]);

  // Sync selected agent when active scenario changes
  useEffect(() => {
    setSelectedAgentId(activeScenarioDef.agentId);
  }, [activeScenario]);

  // Merge localized subagents with live runtime state
  const localizedSubAgents = t.subagents.list.map(localizedAgent => {
    const liveState = agentStates[localizedAgent.id];
    const isRunning = (activeRunningAgentId === localizedAgent.id) || (isProcessingAgent === localizedAgent.id) || (liveState?.status === 'running');
    const isCompleted = liveState?.status === 'completed';
    const isScenarioDefaultAgent = localizedAgent.id === activeScenarioDef.agentId;

    const status = isRunning ? 'processing' : isCompleted ? 'completed' : (isScenarioDefaultAgent ? 'completed' : 'idle');
    const resultData = liveState?.liveResult || (isScenarioDefaultAgent ? activeScenarioDef.telemetryPayload : localizedAgent.defaultResult);

    return {
      ...localizedAgent,
      status,
      lastRun: liveState?.lastRun || (isScenarioDefaultAgent ? '14:52:10 BRT' : undefined),
      resultData
    };
  });

  const selectedAgentDetail = localizedSubAgents.find(a => a.id === selectedAgentId) || localizedSubAgents[0];

  return (
    <div
      className={`w-full h-[730px] max-h-[86vh] rounded-[16px] shadow-2xl flex flex-col min-h-0 border transition-colors duration-200 ${
        isDark
          ? 'bg-[#0E0E11] border-white/[0.08] text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      
      {/* Sleek Minimalist Header */}
      <div className={`border-b px-6 py-3.5 flex items-center justify-between flex-shrink-0 transition-colors ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-orange"></div>
          <span className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t.tabs.agents}
          </span>
        </div>

        <div className={`flex items-center gap-2 text-xs font-mono ${
          isDark ? 'text-white/40' : 'text-slate-500'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ORCHESTRATOR ACTIVE</span>
        </div>
      </div>

      {/* Main Sub-Agents Workspace (Single-Column Cards Left, JSON Telemetry Right) */}
      <div className="flex-1 p-4 sm:p-5 overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 h-full items-stretch min-h-0">
          
          {/* Left Column: 5 Stacked Agent Cards (Expanded with more whitespace, larger typography, filling exact height) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-2.5 sm:gap-3 h-full min-h-0 overflow-y-auto pr-0.5">
            {localizedSubAgents.map((agent) => {
              const isRunning = agent.status === 'processing';
              const isSelected = selectedAgentDetail?.id === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`flex-1 flex flex-col justify-center rounded-[12px] px-6 sm:px-7 py-3 sm:py-3.5 border transition-all cursor-pointer relative ${
                    isRunning
                      ? 'bg-brand-orange/[0.12] border-brand-orange ring-2 ring-brand-orange shadow-[0_0_20px_rgba(255,100,35,0.35)]'
                      : isSelected
                      ? isDark
                        ? 'bg-white/[0.06] border-brand-orange ring-1 ring-brand-orange/40'
                        : 'bg-orange-50/50 border-brand-orange ring-1 ring-brand-orange/30 shadow-sm'
                      : isDark
                      ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.18]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          isRunning
                            ? 'bg-brand-orange animate-ping'
                            : isDark ? 'bg-white/20' : 'bg-slate-300'
                        }`}
                      />
                      <h3 className={`text-xs sm:text-[13.5px] lg:text-[14px] font-semibold leading-snug truncate ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                        {agent.name}
                      </h3>
                    </div>

                    {isRunning && (
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-orange text-white animate-pulse flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          {currentLang === 'en' ? 'Active' : 'Ativo'}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className={`text-xs sm:text-[12.5px] lg:text-[13px] leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                    {agent.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full-Height JSON Telemetry Inspector */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-0">
            <div
              className={`flex-1 rounded-[12px] p-4.5 font-mono text-xs overflow-y-auto border flex flex-col transition-colors ${
                isDark
                  ? 'bg-black/50 border-white/[0.06] text-white/90'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {selectedAgentDetail ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/[0.08] flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedAgentDetail.status === 'processing' ? 'bg-brand-orange animate-ping' : 'bg-emerald-400'}`}></span>
                      <span className="font-bold text-brand-orange text-xs sm:text-[12.5px] uppercase tracking-wide">
                        {selectedAgentDetail.id}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      {selectedAgentDetail.lastRun || '14:52:10 BRT'}
                    </span>
                  </div>

                  <pre className="flex-1 overflow-auto text-xs sm:text-[12px] lg:text-[12.5px] leading-relaxed select-text font-mono">
                    {JSON.stringify(selectedAgentDetail.resultData, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/30 text-xs">
                  {t.subagents.selectPrompt}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
