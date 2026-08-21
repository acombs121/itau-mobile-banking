import React from 'react';
import { Language, translations } from '../i18n/translations';

interface TickerRibbonProps {
  currentLang?: Language;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({ currentLang = 'pt' }) => {
  const tickerItems = translations[currentLang].ticker.items;

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
