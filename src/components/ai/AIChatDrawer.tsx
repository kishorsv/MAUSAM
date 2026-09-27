import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { AIResponsePayload } from '@/lib/ai/gemini';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherPayload;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  data?: AIResponsePayload;
  timestamp: string;
}

export function AIChatDrawer({ isOpen, onClose, weather }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am Mausam AI, your personal weather intelligence advisor. I have live meteorological readings for ${weather.location.name}. Ask me anything about your activities, running windows, packing suggestions, or weather risks!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "Can I go running this morning?",
    "Should I carry an umbrella?",
    "What should I pack for travel?",
    "Is tonight suitable for an outdoor event?",
    "Why is today's weather alert important?"
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, weather })
      });

      if (res.ok) {
        const aiData: AIResponsePayload = await res.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: aiData.recommendation,
          data: aiData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `I had trouble synthesizing meteorological data: ${errData.error || 'Server connection error.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Network error. Please verify your connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] glass-panel border-l border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-primary-500 p-[1px] shadow-glow-primary">
            <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Mausam AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Ground-Truth AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Grounded in live telemetry for {weather.location.name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary-600 text-white font-medium rounded-tr-none shadow-glow-primary'
                  : 'bg-slate-900/95 text-slate-200 border border-violet-500/30 shadow-[0_0_24px_-4px_rgba(139,92,246,0.25)] rounded-tl-none'
              }`}
            >
              {/* If it's an AI response with grounded telemetry, display clearly separated sections */}
              {msg.data && (
                <div className="mb-3 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-1.5 text-[11px] text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-violet-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>[Observed Weather Data]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <div>Temp: <span className="font-semibold text-white">{msg.data.observedWeather.temperature}</span></div>
                    <div>Rain: <span className="font-semibold text-white">{msg.data.observedWeather.rainProbability}</span></div>
                    <div>Wind: <span className="font-semibold text-white">{msg.data.observedWeather.windSpeed}</span></div>
                    <div>UV: <span className="font-semibold text-white">{msg.data.observedWeather.uvIndex}</span></div>
                  </div>
                </div>
              )}

              {/* Recommendation Content */}
              <div>{msg.text}</div>

              {/* Action items if returned */}
              {msg.data && msg.data.actionItems && msg.data.actionItems.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Recommended Actions:
                  </div>
                  {msg.data.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {msg.data && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono text-right">
                  Powered by {msg.data.poweredBy}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/30 text-xs text-violet-300 animate-pulse">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            Synthesizing grounded real-time meteorological variables...
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/40">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Suggested queries:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-violet-950/30 hover:bg-violet-900/40 border border-violet-500/30 hover:border-violet-400 text-violet-300 text-xs font-medium transition-all shadow-sm shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mausam AI about running, rain, packing..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium transition-all shadow-glow-primary shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
