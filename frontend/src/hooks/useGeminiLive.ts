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
  onToolCall?: (toolName: string, args: Record<string, any>) => void;
  onActionTriggered?: (action: string) => void;
}

export const useGeminiLive = ({ lang, onToolCall, onActionTriggered }: UseGeminiLiveOptions) => {
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

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

  useEffect(() => {
    onActionTriggeredRef.current = onActionTriggered;
  }, [onActionTriggered]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isProcessingRef = useRef<boolean>(false);

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

  // Play continuous PCM chunks without gaps
  const queueAndPlayPCM = useCallback((pcmChunk: Float32Array) => {
    const ctx = getPlaybackContext();
    if (!ctx) return;

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
      // Remove from active list
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);

      // Check if all queued audio is finished
      if (ctx.currentTime >= nextPlayTimeRef.current - 0.08) {
        // Cooldown buffer before re-enabling mic listening
        setTimeout(() => {
          if (activeSourcesRef.current.length === 0) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            setAudioLevels([15, 25, 40, 20, 35, 15, 30, 20, 25]);
          }
        }, 350);
      }
    };
  }, [getPlaybackContext]);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
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
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Raw Audio PCM chunk from Gemini Live
        if (data.audio_pcm_24k) {
          const pcm = decodePCM24k(data.audio_pcm_24k);
          queueAndPlayPCM(pcm);
        }

        // Text transcript piece
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

        // Tool call from Gemini Live
        if (data.tool_call) {
          console.log("Gemini Live Tool Call:", data.tool_call);
          if (onToolCallRef.current) {
            onToolCallRef.current(data.tool_call.name, data.tool_call.args || {});
          }
          if (onActionTriggeredRef.current) {
            onActionTriggeredRef.current(data.tool_call.name);
          }
        }

        if (data.turn_complete) {
          isProcessingRef.current = false;
          setIsProcessing(false);
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
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      isProcessingRef.current = false;
    };

    wsRef.current = ws;
  }, [decodePCM24k, queueAndPlayPCM]);

  // Send text query
  const sendTextQuery = useCallback((text: string) => {
    if (!text.trim()) return;

    // Barge-in: stop any playing assistant speech when new user query arrives
    stopAllAudioPlayback();

    setTranscript(prev => [...prev, { role: 'user', text: text.trim() }]);
    isProcessingRef.current = true;
    setIsProcessing(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        text_input: text.trim()
      }));
    }
  }, [stopAllAudioPlayback]);

  // Disconnect WebSocket & teardown all mic streams
  const disconnect = useCallback(() => {
    isManuallyStoppedRef.current = true;
    stopAllAudioPlayback();

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
    isProcessingRef.current = false;
  }, [stopAllAudioPlayback]);

  // Start continuous microphone with acoustic echo suppression
  const startMicrophone = useCallback(async () => {
    isManuallyStoppedRef.current = false;
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }

      // Initialize speech recognition with echo suppression filter
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const initRec = () => {
          if (isManuallyStoppedRef.current) return;
          const rec = new SpeechRecognition();
          rec.lang = langRef.current === 'en' ? 'en-US' : 'pt-BR';
          rec.continuous = false;
          rec.interimResults = false;

          rec.onresult = (e: any) => {
            // ACOUSTIC ECHO SUPPRESSION:
            // If the model is currently speaking or in cooldown, ignore microphone input so it doesn't self-hear!
            if (isSpeakingRef.current) {
              console.log("Suppressed echo input while model was speaking.");
              return;
            }

            const spokenText = e.results[0][0].transcript;
            if (spokenText && spokenText.trim()) {
              console.log("Spoken transcript recognized from cardholder:", spokenText);
              sendTextQuery(spokenText.trim());
            }
          };

          rec.onend = () => {
            // Auto-restart listening if mic is still active and not manually stopped
            if (!isManuallyStoppedRef.current) {
              setTimeout(() => {
                if (!isManuallyStoppedRef.current) {
                  try {
                    rec.start();
                  } catch {}
                }
              }, 150);
            }
          };

          recognitionRef.current = rec;
          try {
            rec.start();
          } catch (err) {
            console.warn("SpeechRec start note:", err);
          }
        };

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
        requestAnimationFrame(updateVolume);
      };
      requestAnimationFrame(updateVolume);

      setIsListening(true);
    } catch (err) {
      console.error("Failed to start mic stream:", err);
      setIsListening(false);
    }
  }, [connect, sendTextQuery]);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    isManuallyStoppedRef.current = true;
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
  }, []);

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
