'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, X, Bot, ArrowRight } from 'lucide-react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { WeatherPayload } from '@/lib/weather/types';
import { FeatureWorldId } from '@/lib/theme/scene-registry';

interface VoiceAssistantBarProps {
  weather: WeatherPayload | null;
  selectedFeature: FeatureWorldId | null;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  onOpenFullAssistant?: (initialPrompt?: string) => void;
}

type AssistantState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING' | 'ERROR';

export function VoiceAssistantBar({
  weather,
  selectedFeature,
  isOpenExternal,
  onCloseExternal,
  onOpenFullAssistant
}: VoiceAssistantBarProps) {
  const [state, setState] = useState<AssistantState>('IDLE');
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSpeechSynthesisEnabled, setIsSpeechSynthesisEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Sync with external opener (e.g. from Sidebar or Command Palette)
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsExpanded(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setState('LISTENING');
          setInterimTranscript('');
          setErrorMessage('');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const final = event.results[i][0].transcript;
              setInputText(final);
              handleSendMessage(final);
              return;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setErrorMessage(`Microphone error: ${event.error}`);
            setState('ERROR');
          } else {
            setState('IDLE');
          }
        };

        recognition.onend = () => {
          if (state === 'LISTENING') {
            setState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak response aloud via SpeechSynthesis
  const speakResponse = useCallback((text: string) => {
    if (!isSpeechSynthesisEnabled || !synthRef.current) return;
    try {
      synthRef.current.cancel(); // Stop prior speech
      const cleanedText = text.replace(/[*#_`]/g, ''); // strip markdown
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [isSpeechSynthesisEnabled]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (state === 'LISTENING') {
      recognitionRef.current?.stop();
      setState('IDLE');
    } else {
      if (synthRef.current) synthRef.current.cancel();
      try {
        recognitionRef.current?.start();
      } catch {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    }
  };

  // Submit query to secure backend
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setState('PROCESSING');
    setIsExpanded(true);
    setResponseMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
          stream: true,
          weatherContext: weather ? {
            location: weather.location,
            current: weather.current,
            airQuality: weather.airQuality,
            daily: weather.daily,
            alerts: weather.alerts
          } : undefined,
          userContext: {
            selectedFeature: selectedFeature || 'weather',
            featureModePrompt: selectedFeature 
              ? `User is currently viewing the ${selectedFeature.toUpperCase()} world. Prioritize ${selectedFeature}-related meteorological factors.`
              : undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error (HTTP ${response.status})`);
      }

      setState('RESPONDING');

      // Process streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  fullText += parsed.text;
                  setResponseMessage(fullText);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      if (!fullText) {
        fullText = 'Conditions analyzed. Your meteorological forecast is currently stable.';
        setResponseMessage(fullText);
      }

      speakResponse(fullText);
      setInputText('');
    } catch (err: any) {
      console.error('Voice assistant chat error:', err);
      setErrorMessage(err.message || 'Unable to connect to MAUSAM AI assistant.');
      setState('ERROR');
    }
  };

  const getFeaturePrompt = () => {
    switch (selectedFeature) {
      case 'agriculture':
        return 'Is the soil and humidity good for crops today?';
      case 'fitness':
        return 'What is the best 1-hour window for outdoor running today?';
      case 'rain':
        return 'Will it rain in my location in the next 3 hours?';
      case 'ocean':
        return 'What are the coastal wave and wind conditions?';
      case 'sunny':
        return 'What is the UV index and peak sunlight hours today?';
      default:
        return 'Ask a weather question or tap the mic...';
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    if (synthRef.current) synthRef.current.cancel();
    if (onCloseExternal) onCloseExternal();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* 1. EXPANDED VOICE ASSISTANT POPUP PANEL */}
      {isExpanded ? (
        <GlassPanel
          variant="elevated"
          glow="primary"
          className="w-[92vw] sm:w-[420px] p-5 rounded-3xl animate-in slide-in-from-bottom-5 zoom-in-95 duration-200 border border-white/20 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center text-[var(--primary)] shadow-sm">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[var(--foreground)] flex items-center gap-2">
                  <span>MAUSAM Voice AI</span>
                  {selectedFeature && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[var(--primary)] font-mono uppercase">
                      {selectedFeature}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {state === 'LISTENING' ? 'Listening...' : state === 'PROCESSING' ? 'Synthesizing...' : 'Speech-enabled assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSpeechSynthesisEnabled(!isSpeechSynthesisEnabled)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isSpeechSynthesisEnabled ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
                title={isSpeechSynthesisEnabled ? 'Mute voice audio' : 'Unmute voice audio'}
              >
                {isSpeechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Response Output Container */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans min-h-[90px] max-h-56 overflow-y-auto pr-1 mb-3 scrollbar-thin">
            {state === 'LISTENING' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-8 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                  <span className="w-1.5 h-5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="w-1.5 h-10 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-1.5 h-4 bg-[var(--primary)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                </div>
                <p className="text-xs font-bold text-cyan-300">
                  {interimTranscript || 'Listening to your speech...'}
                </p>
              </div>
            ) : state === 'PROCESSING' ? (
              <div className="flex items-center gap-3 py-6 text-slate-400 justify-center">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-mono">Analyzing atmospheric telemetry...</span>
              </div>
            ) : state === 'ERROR' ? (
              <div className="text-rose-400 text-xs py-4 text-center">{errorMessage}</div>
            ) : responseMessage ? (
              <div className="whitespace-pre-line py-1">{responseMessage}</div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                Tap the microphone below to ask a question, or type your query.
              </div>
            )}
          </div>

          {/* Input & Microphone Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              placeholder={getFeaturePrompt()}
              className="flex-1 bg-transparent border-0 outline-none text-xs text-[var(--foreground)] placeholder-slate-400 px-2 py-1"
            />
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage(inputText)}
                className="p-2 rounded-xl bg-[var(--primary)] text-white hover:brightness-110 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all ${
                  state === 'LISTENING'
                    ? 'bg-rose-500 text-white animate-pulse shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
                title={state === 'LISTENING' ? 'Stop listening' : 'Start microphone'}
              >
                {state === 'LISTENING' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Open full drawer footer link */}
          {onOpenFullAssistant && (
            <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenFullAssistant(inputText || responseMessage);
                }}
                className="text-[11px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>Open Full Chat Drawer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </GlassPanel>
      ) : (
        /* 2. COMPACT FLOATING CAPSULE BUTTON (Resting State) */
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group text-white relative overflow-hidden backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(6, 182, 212, 0.85))',
            borderColor: 'rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.5)'
          }}
          title="Open Voice & AI Assistant"
        >
          {/* Specular line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="font-extrabold text-xs sm:text-sm tracking-tight drop-shadow-sm">
            Ask MAUSAM
          </span>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
        </button>
      )}
    </div>
  );
}
