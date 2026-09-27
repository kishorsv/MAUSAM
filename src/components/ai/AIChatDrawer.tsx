'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Send, Bot, User, CheckCircle2, AlertCircle, 
  Loader2, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, 
  Plus, Trash2, History, ChevronDown, MapPin 
} from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { useTheme } from '@/components/theme/ThemeContext';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherPayload;
  initialPrompt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    location?: string;
    sources?: string[];
    dataAgeSeconds?: number;
    confidence?: string;
  };
  timestamp: string;
}

interface ConversationItem {
  id: string;
  title: string;
  updated_at: string;
}

export function AIChatDrawer({ isOpen, onClose, weather, initialPrompt }: AIChatDrawerProps) {
  const { theme, tokens, resolvedMode } = useTheme();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-default');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am Mausam AI, your personal weather intelligence advisor. I have live meteorological readings for ${weather.location.name}. Ask me about running conditions, rain timing, packing advice, or outdoor transit!`,
      metadata: {
        location: weather.location.name,
        sources: [weather.provider, 'CPCB Air Quality'],
        dataAgeSeconds: 30,
        confidence: 'High'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratedMessages, setRatedMessages] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load conversations on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai/conversations')
        .then(res => res.json())
        .then(data => {
          if (data.conversations && data.conversations.length > 0) {
            setConversations(data.conversations);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Context-aware dynamic suggestions based on current weather
  const dynamicSuggestions = React.useMemo(() => {
    const list: string[] = [];
    const rainProb = weather.hourly[0]?.precipitationProbability ?? 0;
    const aqi = weather.airQuality?.aqi ?? 50;

    if (rainProb >= 40) {
      list.push("Should I carry an umbrella?");
      list.push("When will the rain stop today?");
    } else {
      list.push("Can I go running now?");
      list.push("What is the best time to go outside?");
    }

    if (aqi > 100) {
      list.push("Is the AQI safe for outdoor exercise?");
    } else {
      list.push("How is the air quality right now?");
    }

    list.push("What should I wear today?");
    list.push("Will my commute be affected by weather?");
    return list.slice(0, 4);
  }, [weather]);

  // Handle New Conversation
  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Weather Consultation' })
      });
      const data = await res.json();
      if (data.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: `New consultation started for ${weather.location.name}. What would you like to know about today's atmospheric conditions?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setHistoryOpen(false);
      }
    } catch {
      // ignore
    }
  };

  // Switch Conversation
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setHistoryOpen(false);
    try {
      const res = await fetch(`/api/ai/conversations?conversationId=${convId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          metadata: m.metadata,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch {
      // ignore
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/conversations?id=${convId}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewConversation();
      }
    } catch {
      // ignore
    }
  };

  // Copy Message to Clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Feedback
  const handleFeedback = async (messageId: string, rating: 'thumbs_up' | 'thumbs_down') => {
    setRatedMessages(prev => ({ ...prev, [messageId]: rating === 'thumbs_up' ? 'up' : 'down' }));
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating })
      });
    } catch {
      // ignore
    }
  };

  // Send Query via SSE Streaming
  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || streaming) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({
          question: q,
          weather,
          conversationId: activeConversationId,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      if (response.headers.get('content-type')?.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let lastMetadata;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.token) {
                  accumulated += parsed.token;
                  setStreamingText(accumulated);
                }
                if (parsed.metadata) {
                  lastMetadata = parsed.metadata;
                }
              } catch {
                // ignore chunk parse errors
              }
            }
          }
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: accumulated || "Grounded recommendations ready.",
          metadata: lastMetadata,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Fallback to JSON response
        const data = await response.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.recommendation || "Atmospheric advice processed.",
          metadata: {
            location: data.observedWeather?.location,
            sources: data.sources,
            confidence: data.confidence
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Mausam AI encountered a temporary service hiccup: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  };

  // Auto-send initial prompt if provided when drawer opens
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 backdrop-blur-2xl"
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)'
      }}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ 
              background: 'var(--primary)', 
              color: '#ffffff',
              boxShadow: 'var(--glow)' 
            }}
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              Mausam AI
              <span 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                style={{ 
                  background: 'var(--border-subtle)', 
                  color: 'var(--primary)',
                  borderColor: 'var(--border)' 
                }}
              >
                Grounded Truth
              </span>
            </h3>
            <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{weather.location.name} • {weather.current.temperature}°C • {weather.current.condition}</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* History Dropdown Toggle */}
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-2 rounded-xl border transition-colors hover:opacity-80"
            style={{ 
              background: historyOpen ? 'var(--primary)' : 'var(--surface)', 
              borderColor: 'var(--border-subtle)', 
              color: historyOpen ? '#ffffff' : 'var(--foreground)' 
            }}
            title="Conversation History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewConversation}
            className="p-2 rounded-xl border transition-colors hover:opacity-80"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Close Drawer Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl border transition-colors hover:opacity-80"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Slide-down Overlay */}
      {historyOpen && (
        <div 
          className="border-b p-3 space-y-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs px-2 font-bold" style={{ color: 'var(--foreground-muted)' }}>
            <span>CONVERSATION HISTORY</span>
            <button 
              onClick={() => {
                fetch('/api/ai/conversations', { method: 'POST', body: JSON.stringify({ action: 'clear_all' }) });
                setConversations([]);
                setMessages([]);
              }}
              className="text-[10px] text-rose-400 hover:underline"
            >
              Clear All
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs p-3 text-center" style={{ color: 'var(--foreground-muted)' }}>
              No previous conversations recorded yet.
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer border transition-all ${
                    activeConversationId === conv.id ? 'font-bold' : 'hover:opacity-80'
                  }`}
                  style={{
                    background: activeConversationId === conv.id ? 'var(--primary)' : 'var(--surface)',
                    color: activeConversationId === conv.id ? '#ffffff' : 'var(--foreground)',
                    borderColor: 'var(--border-subtle)'
                  }}
                >
                  <span className="truncate flex-1 pr-2">{conv.title}</span>
                  <button 
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-1 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-tr-none font-medium'
                  : 'rounded-tl-none border shadow-md'
              }`}
              style={{
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--foreground)',
                borderColor: msg.role === 'user' ? 'transparent' : 'var(--border-subtle)',
                boxShadow: msg.role === 'user' ? 'var(--glow)' : 'none'
              }}
            >
              {/* Message Content with structured formatting */}
              <div className="whitespace-pre-line space-y-1 font-sans">
                {msg.content}
              </div>

              {/* Source/Ground-truth Metadata Footer */}
              {msg.role === 'assistant' && msg.metadata && (
                <div 
                  className="mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[10px]"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--foreground-muted)' }}
                >
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                    <span>{msg.metadata.sources?.join(', ') || 'Live Open-Meteo'}</span>
                    {msg.metadata.dataAgeSeconds !== undefined && (
                      <span>• {Math.max(1, Math.round(msg.metadata.dataAgeSeconds / 60))}m ago</span>
                    )}
                  </div>

                  {/* Actions: Copy, Thumbs Up, Thumbs Down, Regenerate */}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded hover:opacity-80 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                      className={`p-1 rounded transition-colors ${
                        ratedMessages[msg.id] === 'up' ? 'text-emerald-400 font-bold' : 'hover:opacity-80'
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                      className={`p-1 rounded transition-colors ${
                        ratedMessages[msg.id] === 'down' ? 'text-rose-400 font-bold' : 'hover:opacity-80'
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] mt-1 px-1" style={{ color: 'var(--foreground-muted)' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {/* Live Streaming Response Progress */}
        {streaming && (
          <div className="flex flex-col items-start animate-in fade-in">
            <div 
              className="max-w-[92%] rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm leading-relaxed border shadow-md"
              style={{
                background: 'var(--surface)',
                color: 'var(--foreground)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <div className="whitespace-pre-line font-sans">
                {streamingText || "Synthesizing meteorological parameters..."}
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div 
        className="p-3 border-t space-y-1.5"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)' }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
          Suggested questions:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {dynamicSuggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={streaming}
              className="whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm shrink-0 disabled:opacity-50 hover:scale-105 active:scale-95"
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

      {/* Input Field Form */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-glass)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Mausam AI about ${weather.location.name}...`}
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="p-3 rounded-2xl text-white font-medium transition-all shadow-md shrink-0 disabled:opacity-50 hover:scale-105 active:scale-95"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--glow)'
            }}
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
