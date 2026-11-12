import { useState, useEffect, useRef, useCallback } from 'react';

// Browser SpeechRecognition interface
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: any) => void) | null;
}

interface UseVoiceProps {
  onTranscript: (text: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  initialLanguage?: 'en-US' | 'hi-IN';
}

export function useVoice({
  onTranscript,
  onSpeakingChange,
  initialLanguage = 'en-US',
}: UseVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>(initialLanguage);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.05);

  // Real-time transcript feedback and audio reactive level
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isStartingRef = useRef<boolean>(false);

  // Stable callback refs to prevent effect recreation on parent re-renders
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const onSpeakingChangeRef = useRef(onSpeakingChange);
  onSpeakingChangeRef.current = onSpeakingChange;

  const selectedVoiceRef = useRef(selectedVoice);
  selectedVoiceRef.current = selectedVoice;

  const availableVoicesRef = useRef(availableVoices);
  availableVoicesRef.current = availableVoices;

  const speechRateRef = useRef(speechRate);
  speechRateRef.current = speechRate;

  const speechPitchRef = useRef(speechPitch);
  speechPitchRef.current = speechPitch;

  const languageRef = useRef(language);
  languageRef.current = language;

  // Cleanup helper for Web Audio analyzer
  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Check Web Speech and SpeechSynthesis availability
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    setVoiceSupported(!!SpeechRecognitionAPI);

    // Check SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Prefer an elegant, clear female voice (e.g. Samantha, Karen, Victoria, Google US English Female, etc.)
        const femaleVoice =
          voices.find(
            (v) =>
              (v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Karen') ||
                v.name.includes('Moira') ||
                v.name.includes('Tessa') ||
                v.name.includes('Female')) &&
              v.lang.startsWith('en')
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (femaleVoice) {
          setSelectedVoice(femaleVoice);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopAudioAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioAnalyser]);

  // Switch recognition language dynamically
  const switchLanguage = useCallback((newLang: 'en-US' | 'hi-IN') => {
    setLanguage(newLang);
    languageRef.current = newLang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  }, []);

  // Request explicit mic permission and start real-time audio analysis
  const initAudioAnalyser = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioMeter = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / (dataArray.length * 255);
          // Scale for responsiveness
          setAudioLevel(Math.min(1.0, avg * 2.2));
          animFrameRef.current = requestAnimationFrame(updateAudioMeter);
        };
        updateAudioMeter();
      }
      return stream;
    } catch (err: any) {
      console.warn('Microphone permission / capture error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission denied. Please allow microphone access in your browser or macOS settings.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No microphone detected on your MacBook. Check audio settings.');
      }
      return null;
    }
  }, []);

  // Start Push-to-Talk listening with fresh session lifecycle
  const startListening = useCallback(async () => {
    if (isStartingRef.current || isListening) return;
    isStartingRef.current = true;

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setPermissionError('Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      isStartingRef.current = false;
      return;
    }

    // Stop speaking when user wants to speak
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    }

    // Abort existing recognition session cleanly before creating new instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    setPermissionError(null);
    setInterimTranscript('');

    // Trigger explicit mic permission and audio meter
    await initAudioAnalyser();

    try {
      const recognition = new SpeechRecognitionAPI() as IWindowSpeechRecognition;
      // Single push-to-talk utterance
      recognition.continuous = false;
      // Enable interim results so user sees live speech feedback immediately
      recognition.interimResults = true;
      recognition.lang = languageRef.current;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
        isStartingRef.current = false;
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioAnalyser();
        recognitionRef.current = null;
        isStartingRef.current = false;
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        stopAudioAnalyser();
        recognitionRef.current = null;
        isStartingRef.current = false;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          // Clean exit if user stayed silent; no error alert needed
          setInterimTranscript('');
        } else if (event.error === 'aborted') {
          // Expected on cancel/abort
        } else {
          setPermissionError(`Voice recognition: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcriptChunk = item[0]?.transcript || '';
          if (item.isFinal) {
            finalStr += transcriptChunk;
          } else {
            interimStr += transcriptChunk;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr && finalStr.trim()) {
          const cleaned = finalStr.trim();
          setInterimTranscript('');
          setFinalTranscript(cleaned);
          onTranscriptRef.current(cleaned);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('Failed to start speech recognition session:', e);
      isStartingRef.current = false;
      stopAudioAnalyser();
      if (e?.name !== 'InvalidStateError') {
        setPermissionError('Could not start voice recognition: ' + (e?.message || 'unknown error'));
      }
    }
  }, [isListening, initAudioAnalyser, stopAudioAnalyser]);

  // Cancel listening
  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    stopAudioAnalyser();
    setIsListening(false);
    setInterimTranscript('');
    isStartingRef.current = false;
  }, [stopAudioAnalyser]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      cancelListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, cancelListening]);

  // Speak text using SpeechSynthesis with automatic Hindi/English voice routing
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Chrome bugfix: resume if paused, then cancel prior speech
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // Clean markdown tags or code blocks for smooth natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`~>]/g, '')
      .replace(/\[SYS\]|\[YOU\]|\[JARVIS\]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect if text contains Devanagari / Hindi characters
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    if (isHindi) {
      const hindiVoice = availableVoicesRef.current.find(
        (v) => v.lang.startsWith('hi') || v.name.includes('Hindi') || v.name.includes('Lekha')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      } else if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }
    } else if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    utterance.rate = speechRateRef.current;
    utterance.pitch = speechPitchRef.current;

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChangeRef.current?.(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    };

    utterance.onerror = (e) => {
      // Ignore normal canceled speech events
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis utterance error:', e.error);
      }
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    }
  }, []);

  // Standalone diagnostic check for testing microphone access
  const testMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('MediaDevices API not available in this browser context.');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionError(null);
      return true;
    } catch (e: any) {
      setPermissionError('Microphone test failed: ' + (e?.message || 'Access denied'));
      return false;
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceSupported,
    speechSupported,
    permissionError,
    availableVoices,
    selectedVoice,
    speechRate,
    speechPitch,
    language,
    interimTranscript,
    finalTranscript,
    audioLevel,
    switchLanguage,
    startListening,
    cancelListening,
    toggleListening,
    speakText,
    stopSpeaking,
    testMicrophone,
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
  };
}
