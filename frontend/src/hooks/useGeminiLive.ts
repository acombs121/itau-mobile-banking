import { useState, useRef, useCallback, useEffect } from 'react';

export interface GeminiLiveState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: Array<{ role: 'assistant' | 'user'; text: string }>;
  audioLevels: number[];
}

export interface UseGeminiLiveOptions {
  lang: 'pt' | 'en';
  onToolCall?: (toolName: string, args: Record<string, any>, payload?: Record<string, any>) => void;
  onActionTriggered?: (action: string) => void;
  onUserQuery?: (query: string) => void;
  onTurnComplete?: () => void;
}

// Resample audio buffer to 16kHz linear PCM
const resampleTo16k = (input: Float32Array, fromRate: number): Float32Array => {
  if (fromRate === 16000) return input;
  const ratio = fromRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const origIndex = i * ratio;
    const indexLow = Math.floor(origIndex);
    const indexHigh = Math.min(indexLow + 1, input.length - 1);
    const weight = origIndex - indexLow;
    result[i] = input[indexLow] * (1 - weight) + input[indexHigh] * weight;
  }
  return result;
};

// Convert Float32Array (-1.0 to 1.0) to 16-bit signed linear PCM (little-endian)
const floatTo16BitPCM = (input: Float32Array): Uint8Array => {
  const output = new Uint8Array(input.length * 2);
  const view = new DataView(output.buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(i * 2, intVal, true);
  }
  return output;
};

// Efficient chunked Base64 encoding for PCM frames
const base64EncodeUint8 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunkSize, len)) as any
    );
  }
  return btoa(binary);
};

// Convert Base64 24kHz 16-bit PCM to Float32Array for Web Audio playback
const decodePCM24k = (base64Data: string): Float32Array => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
};

export const useGeminiLive = ({ lang, onToolCall, onActionTriggered, onUserQuery, onTurnComplete }: UseGeminiLiveOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([]);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 20, 35, 15, 30, 20, 25]);

  // Keep references to options so callbacks don't change identity
  const langRef = useRef(lang);
  const onToolCallRef = useRef(onToolCall);
  const onActionTriggeredRef = useRef(onActionTriggered);
  const onUserQueryRef = useRef(onUserQuery);
  const onTurnCompleteRef = useRef(onTurnComplete);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

  useEffect(() => {
    onActionTriggeredRef.current = onActionTriggered;
  }, [onActionTriggered]);

  useEffect(() => {
    onUserQueryRef.current = onUserQuery;
  }, [onUserQuery]);

  useEffect(() => {
    onTurnCompleteRef.current = onTurnComplete;
  }, [onTurnComplete]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextPlayTimeRef = useRef<number>(0);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playbackEndTimerRef = useRef<any>(null);
  const pendingPromptRef = useRef<string | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize or get playback AudioContext (24kHz standard for Gemini Live audio)
  const getPlaybackContext = useCallback(() => {
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (playbackContextRef.current.state === 'suspended') {
      playbackContextRef.current.resume();
    }
    return playbackContextRef.current;
  }, []);

  // Stop any active playing audio sources (barge-in / interruption)
  const stopAllAudioPlayback = useCallback(() => {
    if (playbackEndTimerRef.current) {
      clearTimeout(playbackEndTimerRef.current);
      playbackEndTimerRef.current = null;
    }
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Play continuous 24kHz PCM chunks seamlessly
  const queueAndPlayPCM = useCallback((pcmChunk: Float32Array) => {
    const ctx = getPlaybackContext();
    if (!ctx) return;

    if (playbackEndTimerRef.current) {
      clearTimeout(playbackEndTimerRef.current);
      playbackEndTimerRef.current = null;
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    const buffer = ctx.createBuffer(1, pcmChunk.length, 24000);
    buffer.copyToChannel(pcmChunk, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    activeSourcesRef.current.push(source);

    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;

    // Live audio waveform reactive energy
    let sum = 0;
    for (let i = 0; i < pcmChunk.length; i += 20) {
      sum += Math.abs(pcmChunk[i]);
    }
    const avgEnergy = Math.min(100, (sum / (pcmChunk.length / 20)) * 250);
    setAudioLevels([
      Math.max(15, avgEnergy * 0.4),
      Math.max(25, avgEnergy * 0.7),
      Math.max(40, avgEnergy * 1.0),
      Math.max(30, avgEnergy * 0.8),
      Math.max(50, avgEnergy * 1.1),
      Math.max(20, avgEnergy * 0.6),
      Math.max(45, avgEnergy * 0.9),
      Math.max(25, avgEnergy * 0.5),
      Math.max(20, avgEnergy * 0.4),
    ]);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      if (activeSourcesRef.current.length === 0) {
        if (playbackEndTimerRef.current) {
          clearTimeout(playbackEndTimerRef.current);
        }
        playbackEndTimerRef.current = setTimeout(() => {
          if (activeSourcesRef.current.length === 0 && ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            setAudioLevels([15, 25, 40, 20, 35, 15, 30, 20, 25]);
          }
        }, 100);
      }
    };
  }, [getPlaybackContext]);

  // Send text query (for button interactions or typed input)
  const sendTextQuery = useCallback((text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    stopAllAudioPlayback();

    if (onUserQueryRef.current) {
      onUserQueryRef.current(cleanText);
    }

    setTranscript(prev => [...prev, { role: 'user', text: cleanText }]);
    setIsProcessing(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        text_input: cleanText
      }));
    } else {
      pendingPromptRef.current = cleanText;
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    }
  }, [stopAllAudioPlayback]);

  // Connect WebSocket
  const connect = useCallback((initialPrompt?: string) => {
    if (initialPrompt) {
      pendingPromptRef.current = initialPrompt;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      if (initialPrompt && wsRef.current.readyState === WebSocket.OPEN) {
        pendingPromptRef.current = null;
        sendTextQuery(initialPrompt);
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const currentLang = langRef.current;
    const wsUrl = `${protocol}//${host}/ws/live?lang=${currentLang}`;

    console.log(`Connecting to Gemini Live WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Gemini Live WebSocket!");
      setIsConnected(true);
      setIsProcessing(false);

      if (pendingPromptRef.current) {
        const promptToSend = pendingPromptRef.current;
        pendingPromptRef.current = null;
        sendTextQuery(promptToSend);
      }
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data);

        // 1. Interruption / Barge-in
        if (data.interrupted) {
          console.log("[Gemini Live] Interrupted by cardholder voice");
          stopAllAudioPlayback();
          setIsSpeaking(false);
          setIsProcessing(false);
          setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
          return;
        }

        // 2. Cardholder Speech Transcript (from Gemini Live VAD)
        if (data.user_transcript) {
          const userText = data.user_transcript.trim();
          if (userText) {
            if (onUserQueryRef.current) {
              onUserQueryRef.current(userText);
            }
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'user' && !data.is_final) {
                return [...prev.slice(0, -1), { role: 'user', text: userText }];
              } else if (last && last.role === 'user' && last.text === userText) {
                return prev;
              } else {
                return [...prev, { role: 'user', text: userText }];
              }
            });
          }
        }

        // 3. Raw Audio PCM chunk from Gemini Live
        if (data.audio_pcm_24k) {
          const pcm = decodePCM24k(data.audio_pcm_24k);
          queueAndPlayPCM(pcm);
        }

        // 4. Text transcript piece (assistant)
        if (data.text) {
          setTranscript(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant', text: last.text + data.text }];
            } else {
              return [...prev, { role: 'assistant', text: data.text }];
            }
          });
        }

        // 5. Tool call from Gemini Live
        if (data.tool_call) {
          console.log("Gemini Live Tool Call:", data.tool_call);
          if (onToolCallRef.current) {
            onToolCallRef.current(data.tool_call.name, data.tool_call.args || {}, data.tool_call.payload);
          }
          if (onActionTriggeredRef.current) {
            onActionTriggeredRef.current(data.tool_call.name);
          }
        }

        // 6. Turn complete
        if (data.turn_complete) {
          setIsProcessing(false);
          if (onTurnCompleteRef.current) {
            onTurnCompleteRef.current();
          }
        }
      } catch (err) {
        console.error("Error parsing Live WS message:", err);
      }
    };

    ws.onerror = (e) => {
      console.warn("Gemini Live WebSocket error:", e);
    };

    ws.onclose = () => {
      console.log("Gemini Live WebSocket closed");
      wsRef.current = null;
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsProcessing(false);
      setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
    };

    wsRef.current = ws;
  }, [queueAndPlayPCM, sendTextQuery, stopAllAudioPlayback]);

  // Stop microphone stream
  const stopMicrophone = useCallback(() => {
    isManuallyStoppedRef.current = true;
    isListeningRef.current = false;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ audio_stream_end: true }));
      } catch {}
    }

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }

    if (muteGainRef.current) {
      muteGainRef.current.disconnect();
      muteGainRef.current = null;
    }

    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    setIsListening(false);
    setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
  }, []);

  // Start continuous microphone stream with 16kHz PCM streaming to Gemini Live
  const startMicrophone = useCallback(async () => {
    isManuallyStoppedRef.current = false;
    isListeningRef.current = true;

    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      let audioCtx: AudioContext;
      try {
        audioCtx = new AudioCtx({ sampleRate: 16000 });
      } catch {
        audioCtx = new AudioCtx();
      }
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      inputSourceRef.current = source;

      // Analyser for waveform visualization
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      // ScriptProcessor node for streaming audio chunks
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      // Silent gain node to keep processor running
      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0;
      muteGainRef.current = muteGain;

      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isManuallyStoppedRef.current || !isListeningRef.current) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        // Acoustic Echo Shield: Do not feed speaker output back into Gemini Live while assistant is speaking
        if (isSpeakingRef.current) return;

        const inputChannel = e.inputBuffer.getChannelData(0);

        const resampled = audioCtx.sampleRate === 16000
          ? inputChannel
          : resampleTo16k(inputChannel, audioCtx.sampleRate);

        const pcm16 = floatTo16BitPCM(resampled);
        const base64Pcm = base64EncodeUint8(pcm16);

        try {
          wsRef.current.send(JSON.stringify({
            realtime_audio_pcm_16k: base64Pcm
          }));
        } catch {}
      };

      // Waveform volume loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!mediaStreamRef.current || isManuallyStoppedRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = Math.min(100, (sum / bufferLength) * 1.5);

        if (!isSpeakingRef.current && avg > 5) {
          setAudioLevels([
            Math.max(10, avg * 0.5),
            Math.max(20, avg * 0.8),
            Math.max(35, avg * 1.1),
            Math.max(25, avg * 0.9),
            Math.max(45, avg * 1.2),
            Math.max(20, avg * 0.7),
            Math.max(40, avg * 1.0),
            Math.max(20, avg * 0.6),
            Math.max(15, avg * 0.5),
          ]);
        }
        animFrameIdRef.current = requestAnimationFrame(updateVolume);
      };
      animFrameIdRef.current = requestAnimationFrame(updateVolume);

      setIsListening(true);
    } catch (err) {
      console.error("Failed to start microphone stream:", err);
      setIsListening(false);
    }
  }, [connect]);

  // Barge-in interrupt: stops assistant speech and notifies server
  const interrupt = useCallback(() => {
    console.log("[Gemini Live] Interruption triggered");
    stopAllAudioPlayback();
    setIsSpeaking(false);
    setIsProcessing(false);
    setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ interrupt: true }));
      } catch {}
    }
  }, [stopAllAudioPlayback]);

  // Disconnect WebSocket & teardown audio
  const disconnect = useCallback(() => {
    stopMicrophone();
    stopAllAudioPlayback();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    isSpeakingRef.current = false;
    setIsProcessing(false);
    pendingPromptRef.current = null;
    setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
  }, [stopMicrophone, stopAllAudioPlayback]);

  // Clean teardown only when component unmounts
  useEffect(() => {
    return () => {
      stopMicrophone();
      stopAllAudioPlayback();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (playbackContextRef.current) {
        playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, [stopMicrophone, stopAllAudioPlayback]);

  return {
    isConnected,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    setTranscript,
    audioLevels,
    connect,
    disconnect,
    startMicrophone,
    stopMicrophone,
    sendTextQuery,
    interrupt,
  };
};

