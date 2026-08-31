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
  const recognitionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isAssistantAudioPlayingRef = useRef<boolean>(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const isTurnActiveRef = useRef<boolean>(false);
  const latestServerTurnRef = useRef<number>(0);
  const abortedTurnIdRef = useRef<number>(-1);
  const lastAssistantSpokenTimeRef = useRef<number>(0);
  const playbackCooldownTimerRef = useRef<any>(null);
  const recentAssistantTextRef = useRef<string>('');
  const lastSentQueryRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const pendingPromptRef = useRef<string | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const speechDebounceTimerRef = useRef<any>(null);
  const latestSpokenTextRef = useRef<string>('');

  // Initialize or get playback AudioContext
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

  // Stop any active playing audio sources (barge-in / clear queue)
  const stopAllAudioPlayback = useCallback(() => {
    if (playbackCooldownTimerRef.current) {
      clearTimeout(playbackCooldownTimerRef.current);
      playbackCooldownTimerRef.current = null;
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
    isAssistantAudioPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Check if recognized text is an echo of the assistant's own output
  const isSelfEcho = useCallback((text: string): boolean => {
    const lower = text.toLowerCase().trim();
    if (!lower) return true;

    // Reject short audio artifacts (e.g. "hi", "uh", "yes", "hear", "me", "i", "can") if spoken right around assistant speech
    const now = Date.now();
    if (now - lastAssistantSpokenTimeRef.current < 2500) {
      const trivialWords = ['hi', 'uh', 'yes', 'hear', 'me', 'i', 'can', 'yeah', 'so', 'ok', 'okay', 'hum'];
      if (trivialWords.includes(lower)) {
        return true;
      }
    }

    // Common phrases spoken by Itaú Concierge or mistranscribed by Web Speech API
    const assistantEchoPatterns = [
      'how can i assist',
      'how can i help',
      'ready to assist',
      'i am ready to assist',
      'i am itau concierge',
      'sou o itau concierge',
      'posso ajudar',
      'posso te ajudar',
      'pronto para ajudar',
      'como posso ajudar',
      'assist you with your accounts',
      'would you like assistance',
      'assistance with your accounts',
      'assist with your',
      'listening mr silva',
      'mr silva yeah',
      'can i insist you',
      'insist you with your accounts',
      'mr silva',
      'sr silva',
      'scheduled debits next thursday',
      'debitos agendados na proxima quinta'
    ];

    for (const pattern of assistantEchoPatterns) {
      if (lower.includes(pattern)) {
        return true;
      }
    }

    // Compare against recent assistant spoken text
    if (recentAssistantTextRef.current) {
      const assistantWords = recentAssistantTextRef.current.toLowerCase();
      const userWords = lower.split(/\s+/).filter(w => w.length > 3);
      if (userWords.length >= 2) {
        const matches = userWords.filter(w => assistantWords.includes(w)).length;
        if (matches / userWords.length >= 0.7) {
          return true;
        }
      }
    }

    return false;
  }, []);

  // Convert Base64 PCM (16-bit LE, 24kHz) to Float32Array
  const decodePCM24k = useCallback((base64Data: string): Float32Array => {
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
  }, []);

  // Safe restart of speech recognition after playback completes
  const safeRestartRecognitionRef = useRef<() => void>(() => {});

  // Play continuous PCM chunks without gaps
  const queueAndPlayPCM = useCallback((pcmChunk: Float32Array, turnId?: number) => {
    // Drop chunks if this turn was aborted by user barge-in
    if (turnId !== undefined && turnId <= abortedTurnIdRef.current) {
      console.log(`[Audio] Ignored chunk from aborted Turn ${turnId} (aborted up to: ${abortedTurnIdRef.current})`);
      return;
    }

    const ctx = getPlaybackContext();
    if (!ctx) return;

    // Immediately stop & abort recognition so it doesn't hear the speaker output!
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    isSpeakingRef.current = true;
    isAssistantAudioPlayingRef.current = true;
    setIsSpeaking(true);

    if (playbackCooldownTimerRef.current) {
      clearTimeout(playbackCooldownTimerRef.current);
      playbackCooldownTimerRef.current = null;
    }

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

    // Waveform reactivity
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

      // Check if all queued audio has finished playing
      if (ctx.currentTime >= nextPlayTimeRef.current - 0.08 || activeSourcesRef.current.length === 0) {
        lastAssistantSpokenTimeRef.current = Date.now();
        if (playbackCooldownTimerRef.current) {
          clearTimeout(playbackCooldownTimerRef.current);
        }
        // Minimal 100ms buffer just to let final audio chunk finish
        playbackCooldownTimerRef.current = setTimeout(() => {
          if (activeSourcesRef.current.length === 0) {
            isSpeakingRef.current = false;
            isAssistantAudioPlayingRef.current = false;
            isTurnActiveRef.current = false; // Turn is officially over!
            setIsSpeaking(false);
            setAudioLevels([15, 25, 40, 20, 35, 15, 30, 20, 25]);
            // Restart recognition immediately so user can respond without lag!
            if (!isManuallyStoppedRef.current && isListeningRef.current) {
              safeRestartRecognitionRef.current();
            }
          }
        }, 100);
      }
    };
  }, [getPlaybackContext]);

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
      isProcessingRef.current = false;
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

        // Turn ID gating: record server turn and ignore old aborted turns
        if (data.turn_id !== undefined) {
          latestServerTurnRef.current = data.turn_id;
          if (data.turn_id <= abortedTurnIdRef.current) {
            return;
          }
        }

        // Raw Audio PCM chunk from Gemini Live
        if (data.audio_pcm_24k) {
          // Immediately silence speech recognition so no speaker output leaks into mic!
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch {}
          }
          isAssistantAudioPlayingRef.current = true;
          const pcm = decodePCM24k(data.audio_pcm_24k);
          queueAndPlayPCM(pcm, data.turn_id);
        }

        // Text transcript piece
        if (data.text) {
          recentAssistantTextRef.current += data.text;
          setTranscript(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant', text: last.text + data.text }];
            } else {
              return [...prev, { role: 'assistant', text: data.text }];
            }
          });
        }

        // Tool call from Gemini Live
        if (data.tool_call) {
          console.log("Gemini Live Tool Call:", data.tool_call);
          if (onToolCallRef.current) {
            onToolCallRef.current(data.tool_call.name, data.tool_call.args || {}, data.tool_call.payload);
          }
          if (onActionTriggeredRef.current) {
            onActionTriggeredRef.current(data.tool_call.name);
          }
        }

        if (data.turn_complete) {
          isProcessingRef.current = false;
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
      isAssistantAudioPlayingRef.current = false;
      isProcessingRef.current = false;
      isTurnActiveRef.current = false;
      setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
    };

    wsRef.current = ws;
  }, [queueAndPlayPCM]);

  // Send text query
  const sendTextQuery = useCallback((text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Deduplicate identical queries sent within 1.5 seconds
    const now = Date.now();
    if (lastSentQueryRef.current.text.toLowerCase() === cleanText.toLowerCase() && (now - lastSentQueryRef.current.time) < 1500) {
      console.log("Suppressed duplicate query within 1.5s window:", cleanText);
      return;
    }
    lastSentQueryRef.current = { text: cleanText, time: now };

    // Abort previous server turn audio if new user query interrupts
    if (latestServerTurnRef.current > 0) {
      abortedTurnIdRef.current = latestServerTurnRef.current;
    }
    isTurnActiveRef.current = true;

    // Barge-in: stop any playing assistant speech when new user query arrives
    stopAllAudioPlayback();

    if (onUserQueryRef.current) {
      onUserQueryRef.current(cleanText);
    }

    setTranscript(prev => [...prev, { role: 'user', text: cleanText }]);
    isProcessingRef.current = true;
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
  }, [stopAllAudioPlayback, connect]);

  // Disconnect WebSocket & teardown all mic streams
  const disconnect = useCallback(() => {
    isManuallyStoppedRef.current = true;
    isListeningRef.current = false;
    stopAllAudioPlayback();

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
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
    isAssistantAudioPlayingRef.current = false;
    isProcessingRef.current = false;
    setAudioLevels([15, 20, 15, 25, 15, 20, 15, 15, 10]);
  }, [stopAllAudioPlayback]);

  // Start continuous microphone with acoustic echo suppression
  const startMicrophone = useCallback(async () => {
    isManuallyStoppedRef.current = false;
    isListeningRef.current = true;
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }

      // Initialize speech recognition with echo suppression filter
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const initRec = () => {
          if (isManuallyStoppedRef.current || !isListeningRef.current) return;
          if (isAssistantAudioPlayingRef.current || isSpeakingRef.current) {
            console.log("[Mic] Delayed start because assistant is speaking.");
            return;
          }

          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch {}
          }

          const rec = new SpeechRecognition();
          rec.lang = langRef.current === 'en' ? 'en-US' : 'pt-BR';
          rec.continuous = false;
          rec.interimResults = false;

          rec.onresult = (e: any) => {
            // Ignore if assistant is actively speaking to prevent echo
            if (isAssistantAudioPlayingRef.current || isSpeakingRef.current) {
              return;
            }

            const spokenText = e.results?.[0]?.[0]?.transcript;
            if (!spokenText || !spokenText.trim()) return;

            const cleanText = spokenText.trim();
            if (isSelfEcho(cleanText)) {
              return;
            }

            latestSpokenTextRef.current = cleanText;
            if (speechDebounceTimerRef.current) {
              clearTimeout(speechDebounceTimerRef.current);
            }
            speechDebounceTimerRef.current = setTimeout(() => {
              const textToSend = latestSpokenTextRef.current;
              if (textToSend) {
                console.log("[Mic] Sending complete cardholder phrase:", textToSend);
                sendTextQuery(textToSend);
                latestSpokenTextRef.current = '';
              }
            }, 350);
          };

          rec.onend = () => {
            // Restart immediately if still in call and assistant is not speaking
            if (!isManuallyStoppedRef.current && isListeningRef.current && !isAssistantAudioPlayingRef.current && !isSpeakingRef.current) {
              try {
                rec.start();
              } catch {}
            }
          };

          recognitionRef.current = rec;
          try {
            rec.start();
          } catch (err) {
            console.warn("SpeechRec start note:", err);
          }
        };

        safeRestartRecognitionRef.current = initRec;
        initRec();
      }

      // Setup Web Audio input analyzer for glowing waveform animation
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
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

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
        
        // Only update mic waveform when user is speaking and model is NOT speaking
        if (!isSpeakingRef.current && !isAssistantAudioPlayingRef.current && avg > 5) {
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
      console.error("Failed to start mic stream:", err);
      setIsListening(false);
    }
  }, [connect, isSelfEcho, sendTextQuery]);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
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

  // Comprehensive lifecycle cleanup on hook unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
  };
};
