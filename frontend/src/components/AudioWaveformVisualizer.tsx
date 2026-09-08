import React, { useState, useEffect } from 'react';

interface AudioWaveformVisualizerProps {
  audioLevels?: number[];
  subscribeAudioLevels?: (callback: (levels: number[]) => void) => () => void;
  isVoiceCallActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
}

const DEFAULT_LEVELS = [15, 25, 40, 20, 35, 15, 30, 20, 25];

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = React.memo(({
  audioLevels: propAudioLevels,
  subscribeAudioLevels,
  isVoiceCallActive,
  isSpeaking,
  isListening,
}) => {
  const [levels, setLevels] = useState<number[]>(propAudioLevels || DEFAULT_LEVELS);

  useEffect(() => {
    if (!subscribeAudioLevels) return;
    return subscribeAudioLevels(setLevels);
  }, [subscribeAudioLevels]);

  if (!isVoiceCallActive) return null;

  const currentLevels = propAudioLevels || levels;

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 h-6 px-2.5 bg-black/50 rounded-full border border-white/15 animate-fadeIn shadow-sm">
        {currentLevels.slice(0, 9).map((level, i) => (
          <div
            key={i}
            style={{
              height: `${Math.max(22, level)}%`,
              transition: 'height 0.1s ease-in-out',
              boxShadow: (isSpeaking || isListening) ? '0 0 8px var(--brand-primary, #FF6423)' : undefined,
            }}
            className={`w-1 rounded-full ${
              isSpeaking || isListening
                ? 'bg-brand-orange'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

AudioWaveformVisualizer.displayName = 'AudioWaveformVisualizer';
