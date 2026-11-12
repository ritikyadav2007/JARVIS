import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [voiceSupported] = useState(() => {
    return typeof window !== 'undefined'
      ? !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : false;
  });
  const [speechSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>(initialLanguage);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.05);

  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isStartingRef = useRef<boolean>(false);

  const onTranscriptRef = useRef(onTranscript);
  const onSpeakingChangeRef = useRef(onSpeakingChange);
  const selectedVoiceRef = useRef(selectedVoice);
  const availableVoicesRef = useRef(availableVoices);
  const speechRateRef = useRef(speechRate);
  const speechPitchRef = useRef(speechPitch);
  const languageRef = useRef(language);

  // Sync ref values safely
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onSpeakingChangeRef.current = onSpeakingChange;
    selectedVoiceRef.current = selectedVoice;
    availableVoicesRef.current = availableVoices;
    speechRateRef.current = speechRate;
    speechPitchRef.current = speechPitch;
    languageRef.current = language;
  }, [onTranscript, onSpeakingChange, selectedVoice, availableVoices, speechRate, speechPitch, language]);

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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

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

  const switchLanguage = useCallback((newLang: 'en-US' | 'hi-IN') => {
    setLanguage(newLang);
    languageRef.current = newLang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  }, []);

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
        setPermissionError('No microphone detected on this machine. Check audio settings.');
      }
      return null;
    }
  }, []);

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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    setPermissionError(null);
    setInterimTranscript('');

    await initAudioAnalyser();

    try {
      const recognition = new SpeechRecognitionAPI() as IWindowSpeechRecognition;
      recognition.continuous = false;
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
          setInterimTranscript('');
        } else if (event.error === 'aborted') {
          // Expected on cancel
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

  const toggleListening = useCallback(() => {
    if (isListening) {
      cancelListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, cancelListening]);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`~>]/g, '')
      .replace(/\[SYS\]|\[YOU\]|\[JARVIS\]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
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
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis utterance error:', e.error);
      }
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChangeRef.current?.(false);
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
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
  };
}
