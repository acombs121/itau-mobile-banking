import React from 'react';

export const TickerRibbon: React.FC = () => {
  const tickerItems = [
    { label: "B3 IBOVESPA", val: "132.840 pts", change: "+0.84%", positive: true },
    { label: "DÓLAR COMERCIAL (USD/BRL)", val: "R$ 5,742", change: "-0.32%", positive: false },
    { label: "EURO (EUR/BRL)", val: "R$ 6,198", change: "+0.15%", positive: true },
    { label: "TAXA SELIC", val: "13,25% a.a.", change: "Meta Copom", positive: true },
    { label: "PIX EM TEMPO REAL", val: "184.200 tx/min", change: "Operação Normal", positive: true },
    { label: "ITAÚ GUARD ANTI-FRAUDE", val: "99.98% Eficácia", change: "Proteção Ativa", positive: true },
  ];

  return (
    <div className="w-full bg-[#070707] border-y border-white/10 text-xs py-2 overflow-hidden select-none">
      <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-2 text-text-muted font-medium">
            <span className="font-mono text-white/90">{item.label}</span>
            <span className="text-white font-bold">{item.val}</span>
            <span className={`text-[11px] font-semibold flex items-center ${item.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {item.change}
            </span>
            <span className="text-white/20 mx-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
