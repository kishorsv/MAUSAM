'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, X, ChevronUp, Bot, ArrowRight } from 'lucide-react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { WeatherPayload } from '@/lib/weather/types';
import { FeatureWorldId } from '@/lib/theme/scene-registry';

interface VoiceAssistantBarProps {
  weather: WeatherPayload | null;
  selectedFeature: FeatureWorldId | null;
  onOpenFullAssistant?: (initialPrompt?: string) => void;
}

type AssistantState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING' | 'ERROR';

export function VoiceAssistantBar({
  weather,
  selectedFeature,
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
      const cleanedText = text.replace(/[*#_`]/g, ''); // strip markdown chars
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
      } catch (e) {
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
        throw new Error(`AI service responded with HTTP ${response.status}`);
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
                // Ignore chunk parse errors
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

  // Feature-aware quick prompt suggestions
  const getFeaturePrompt = () => {
    switch (selectedFeature) {
      case 'agriculture':
        return 'Is the soil and humidity good for spraying crops today?';
      case 'fitness':
        return 'What is the best 1-hour window for outdoor running today?';
      case 'rain':
        return 'Will it rain in my location in the next 3 hours?';
      case 'ocean':
        return 'What are the coastal wave and wind conditions?';
      case 'sunny':
        return 'What is the UV index and peak sunlight hours today?';
      default:
        return 'What is the complete weather outlook for today?';
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 max-w-3xl mx-auto px-4 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Expanded Response Popover */}
        {isExpanded && (
          <GlassPanel
            variant="elevated"
            glow="primary"
            className="mb-3 p-5 rounded-3xl animate-in slide-in-from-bottom-3 duration-300 border border-white/20 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center text-[var(--primary)] shadow-sm">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[var(--foreground)] flex items-center gap-2">
                    <span>MAUSAM AI Intelligence</span>
                    {selectedFeature && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[var(--primary)] font-mono uppercase">
                        {selectedFeature} mode
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    {state === 'PROCESSING' ? 'Synthesizing live atmospheric telemetry...' : 'Real-time contextual response'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSpeechSynthesisEnabled(!isSpeechSynthesisEnabled)}
                  className={`p-2 rounded-xl transition-colors ${
                    isSpeechSynthesisEnabled ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                  title={isSpeechSynthesisEnabled ? 'Mute voice audio' : 'Unmute voice audio'}
                >
                  {isSpeechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    if (synthRef.current) synthRef.current.cancel();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Response Output */}
            <div className="text-sm text-slate-200 leading-relaxed font-sans max-h-56 overflow-y-auto pr-2 scrollbar-thin">
              {state === 'PROCESSING' ? (
                <div className="flex items-center gap-3 py-4 text-slate-400">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-mono">Analyzing radar, AQI, and local meteorological data...</span>
                </div>
              ) : state === 'ERROR' ? (
                <div className="text-rose-400 text-xs py-2">{errorMessage}</div>
              ) : (
                <div className="whitespace-pre-line">{responseMessage}</div>
              )}
            </div>

            {/* Quick action to open full drawer */}
            {onOpenFullAssistant && (
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenFullAssistant(inputText || responseMessage);
                  }}
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <span>Open Full AI Chat Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </GlassPanel>
        )}

        {/* Main Floating Voice & Chat Bar */}
        <div 
          className="p-2 sm:p-2.5 rounded-full border shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 transition-all duration-300 relative group"
          style={{
            background: 'var(--surface-glass)',
            borderColor: state === 'LISTENING' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: state === 'LISTENING' ? '0 0 35px -5px var(--primary)' : 'var(--shadow)'
          }}
        >
          {/* Top Specular Line */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* AI Sparkle Icon / Context Pill */}
          <div className="pl-2 shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="text-xs font-extrabold text-[var(--foreground)] hidden sm:inline tracking-tight">
              Ask MAUSAM
            </span>
          </div>

          {/* Center Input / Listening Waveform */}
          <div className="flex-1 min-w-0">
            {state === 'LISTENING' ? (
              <div className="flex items-center gap-3 px-2 py-1">
                {/* Waveform animation */}
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                  <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="w-1 h-7 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 h-3 bg-[var(--primary)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                </div>
                <span className="text-xs font-bold text-cyan-300 truncate">
                  {interimTranscript || 'Listening to your weather question...'}
                </span>
              </div>
            ) : (
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(inputText);
                  }
                }}
                placeholder={getFeaturePrompt()}
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-[var(--foreground)] placeholder-slate-400 px-2 py-1"
              />
            )}
          </div>

          {/* Actions: Send / Mic */}
          <div className="flex items-center gap-1.5 pr-1">
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage(inputText)}
                className="p-2.5 rounded-full bg-[var(--primary)] text-white hover:brightness-110 active:scale-95 transition-all shadow-md"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-full transition-all duration-300 relative ${
                  state === 'LISTENING'
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white'
                }`}
                title={state === 'LISTENING' ? 'Stop listening' : 'Speak with microphone'}
              >
                {state === 'LISTENING' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
