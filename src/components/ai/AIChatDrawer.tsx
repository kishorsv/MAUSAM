import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { AIResponsePayload } from '@/lib/ai/gemini';
import { useTheme } from '@/components/theme/ThemeContext';

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
  const { theme, tokens } = useTheme();
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
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 backdrop-blur-2xl"
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)'
      }}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ 
              background: 'var(--primary)', 
              color: '#ffffff',
              boxShadow: 'var(--glow)' 
            }}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              Mausam AI
              <span 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ 
                  background: 'var(--border-subtle)', 
                  color: 'var(--primary)',
                  borderColor: 'var(--border)' 
                }}
              >
                Grounded AI
              </span>
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--foreground-muted)' }}>
              Telemetry grounded for {weather.location.name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl transition-colors hover:opacity-80"
          style={{ background: 'var(--surface)', color: 'var(--foreground-muted)', border: '1px solid var(--border-subtle)' }}
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
                  ? 'rounded-tr-none font-medium'
                  : 'rounded-tl-none border shadow-md'
              }`}
              style={{
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--surface)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--foreground)',
                borderColor: msg.sender === 'user' ? 'transparent' : 'var(--border-subtle)',
                boxShadow: msg.sender === 'user' ? 'var(--glow)' : 'none'
              }}
            >
              {/* Grounded telemetry overview if available */}
              {msg.data && (
                <div 
                  className="mb-3 p-3 rounded-xl border space-y-1.5 text-[11px]"
                  style={{ 
                    background: 'var(--border-subtle)', 
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>[Observed Weather Data]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <div>Temp: <span className="font-semibold">{msg.data.observedWeather.temperature}</span></div>
                    <div>Rain: <span className="font-semibold">{msg.data.observedWeather.rainProbability}</span></div>
                    <div>Wind: <span className="font-semibold">{msg.data.observedWeather.windSpeed}</span></div>
                    <div>AQI: <span className="font-semibold">{msg.data.observedWeather.aqi}</span></div>
                  </div>
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
            <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--foreground-muted)' }}>{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div 
            className="flex items-center gap-2 p-3.5 rounded-2xl border text-xs animate-pulse"
            style={{ 
              background: 'var(--surface)', 
              borderColor: 'var(--border)',
              color: 'var(--primary)' 
            }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Synthesizing grounded real-time meteorological variables...
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)' }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground-muted)' }}>
          Suggested queries:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm shrink-0 disabled:opacity-50"
              style={{
                background: 'var(--border-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-glass)' }}>
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
            className="flex-1 px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl text-white font-medium transition-all shadow-md shrink-0 disabled:opacity-50"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--glow)'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
