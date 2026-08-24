import { useState, useRef, useCallback } from 'react';

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

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  // Audio playback queue for 24kHz raw PCM from Gemini Live
  const nextPlayTimeRef = useRef<number>(0);

  // Initialize playback AudioContext
  const getPlaybackContext = () => {
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (playbackContextRef.current.state === 'suspended') {
      playbackContextRef.current.resume();
    }
    return playbackContextRef.current;
  };

  // Convert Base64 PCM (16-bit LE, 24kHz) to Float32Array
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

  // Play continuous PCM chunks without gaps
  const queueAndPlayPCM = useCallback((pcmChunk: Float32Array) => {
    const ctx = getPlaybackContext();
    if (!ctx) return;

    setIsSpeaking(true);

    const buffer = ctx.createBuffer(1, pcmChunk.length, 24000);
    buffer.copyToChannel(pcmChunk, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;

    // Pulse waveform levels based on audio energy
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
      if (ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
        setIsSpeaking(false);
        setAudioLevels([15, 25, 40, 20, 35, 15, 30, 20, 25]);
      }
    };
  }, []);

  // Connect WebSocket to Gemini Live backend
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live?lang=${lang}`;

    console.log(`Connecting to Gemini Live WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Gemini Live WebSocket!");
      setIsConnected(true);
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

        // Tool call / Sub-Agent Execution from Gemini Live
        if (data.tool_call) {
          console.log("Gemini Live Tool Call:", data.tool_call);
          if (onToolCall) {
            onToolCall(data.tool_call.name, data.tool_call.args || {});
          }
          if (onActionTriggered) {
            onActionTriggered(data.tool_call.name);
          }
        }

        if (data.turn_complete) {
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
    };

    wsRef.current = ws;
  }, [lang, onToolCall, onActionTriggered, queueAndPlayPCM]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    stopMicrophone();
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
  }, []);

  // Start 16kHz microphone stream to Gemini Live
  const startMicrophone = async () => {
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Process 2048 sample frames (128ms)
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to 16-bit Linear PCM
        const pcm16 = new Int16Array(inputData.length);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          sum += Math.abs(s);
        }

        // Live input volume visualization
        const avg = Math.min(100, (sum / inputData.length) * 400);
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

        // Encode to Base64 binary string
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            realtime_audio_pcm_16k: base64Audio
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start mic stream:", err);
      setIsListening(false);
    }
  };

  // Stop microphone stream
  const stopMicrophone = () => {
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
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
  };

  // Send text query over WebSocket
  const sendTextQuery = useCallback((text: string) => {
    if (!text.trim()) return;
    setTranscript(prev => [...prev, { role: 'user', text: text.trim() }]);
    setIsProcessing(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        text_input: text.trim()
      }));
    }
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
