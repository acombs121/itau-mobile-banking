import React from 'react';

interface AudioWaveformVisualizerProps {
  audioLevels: number[];
  isVoiceCallActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = React.memo(({
  audioLevels,
  isVoiceCallActive,
  isSpeaking,
  isListening,
}) => {
  if (!isVoiceCallActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex items-center gap-1 h-6 px-3 bg-black/40 rounded-full border border-white/10 animate-fadeIn shadow-sm pointer-events-auto">
        {audioLevels.slice(0, 9).map((level, i) => (
          <div
            key={i}
            style={{
              height: `${Math.max(22, level)}%`,
              transition: 'height 0.1s ease-in-out',
            }}
            className={`w-1 rounded-full ${
              isSpeaking || isListening
                ? 'bg-brand-orange shadow-[0_0_8px_#FF6423]'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

AudioWaveformVisualizer.displayName = 'AudioWaveformVisualizer';
