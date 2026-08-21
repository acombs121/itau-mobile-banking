import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { DecisionGraphData } from '../types/banking';
import { Language, translations } from '../i18n/translations';

interface FraudDecisionGraphProps {
  data?: DecisionGraphData;
  currentLang: Language;
}

export const FraudDecisionGraph: React.FC<FraudDecisionGraphProps> = ({ data: _data, currentLang }) => {
  const [selectedNode, setSelectedNode] = useState<string>('ai_guard_engine');
  const t = translations[currentLang].graph;

  const defaultNodes = t.nodes;
  const activeNode = defaultNodes.find(n => n.id === selectedNode) || defaultNodes[3];

  return (
    <div id="decision-graph" className="bg-white rounded-[8px] border border-[#AEAEAE]/40 shadow-sm p-6 mt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#AEAEAE]/30 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-hero-bg text-white flex items-center justify-center">
            <Activity className="w-5 h-5 text-brand-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">{t.title}</h2>
            <p className="text-xs text-text-muted">{t.subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-[4px] border border-slate-300">
          {t.badge}
        </span>
      </div>

      {/* Graph Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {defaultNodes.map((node) => {
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`cursor-pointer rounded-[8px] p-4 border transition-all duration-150 relative ${
                isSelected
                  ? 'border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                <span>{node.layer}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }}></span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">{node.name}</h4>
              <p className="text-[11px] text-text-muted">{node.group}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Node Deep-Dive Panel */}
      <div className="bg-slate-900 text-white rounded-[8px] p-5 border border-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeNode.color }}></span>
            <h3 className="text-sm font-bold text-white">{activeNode.name}</h3>
            <span className="text-xs text-brand-orange font-mono bg-brand-orange/10 px-2 py-0.5 rounded-[4px] border border-brand-orange/30">
              {t.layer}: {activeNode.layer}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">ID: {activeNode.id}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          <strong>{t.detailsLabel}</strong> {activeNode.details}
        </p>
      </div>

    </div>
  );
};
