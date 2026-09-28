'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Radio, Layers, Route, Users, Cpu, Sparkles, Mic, 
  Globe, Palette, Home, Cloud, Calendar, MapPin, Heart, 
  Sprout, Activity, Waves, Plane, CalendarDays, Settings, 
  User, Bell, ArrowRight, X, Command
} from 'lucide-react';
import { FeatureWorldId } from '@/lib/theme/scene-registry';
import { Language } from '@/lib/i18n/translations';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Feature Worlds' | 'Tools & AI' | 'Account & Settings';
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAI: () => void;
  onOpenVoice?: () => void;
  onOpenTheme: () => void;
  onSelectFeature?: (featureId: FeatureWorldId) => void;
  onLanguageChange?: (lang: Language) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenAI,
  onOpenVoice,
  onOpenTheme,
  onSelectFeature,
  onLanguageChange
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allCommands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-home', title: 'Home Dashboard', category: 'Navigation', icon: Home, href: '/' },
    { id: 'nav-forecast', title: '7-Day Extended Forecast', category: 'Navigation', icon: Calendar, href: '/forecast' },
    { id: 'nav-map', title: 'Interactive Weather Map', category: 'Navigation', icon: MapPin, href: '/map' },
    { id: 'nav-radar', title: 'Doppler Radar Precipitation', category: 'Navigation', icon: Radio, accentColor: '#06b6d4', href: '/radar', keywords: ['rain', 'storm', 'radar'] },
    { id: 'nav-satellite', title: 'Satellite Earth Observation', category: 'Navigation', icon: Layers, accentColor: '#6366f1', href: '/satellite', keywords: ['clouds', 'space', 'satellite'] },
    { id: 'nav-routes', title: 'Commuter Route Intelligence', category: 'Navigation', icon: Route, accentColor: '#10b981', href: '/route', keywords: ['traffic', 'travel', 'drive', 'route'] },
    { id: 'nav-groups', title: 'Group Weather Sharing', category: 'Navigation', icon: Users, accentColor: '#a855f7', href: '/group', keywords: ['family', 'team', 'share'] },
    { id: 'nav-station', title: 'IoT Weather Station Sensors', category: 'Navigation', icon: Cpu, accentColor: '#84cc16', href: '/station', keywords: ['hardware', 'sensor', 'iot'] },

    // Feature Worlds
    { 
      id: 'feat-agri', 
      title: 'Agriculture Intelligence World', 
      category: 'Feature Worlds', 
      icon: Sprout, 
      accentColor: '#10b981',
      action: () => onSelectFeature?.('agriculture'),
      keywords: ['farming', 'crops', 'soil', 'irrigation']
    },
    { 
      id: 'feat-fitness', 
      title: 'Fitness & Outdoor Running Haven', 
      category: 'Feature Worlds', 
      icon: Activity, 
      accentColor: '#f97316',
      action: () => onSelectFeature?.('fitness'),
      keywords: ['run', 'workout', 'cardio', 'exercise']
    },
    { 
      id: 'feat-rain', 
      title: 'Rain Tracker & Nowcast World', 
      category: 'Feature Worlds', 
      icon: Cloud, 
      accentColor: '#0284c7',
      action: () => onSelectFeature?.('rain'),
      keywords: ['rain', 'umbrella', 'nowcast', 'precipitation']
    },
    { 
      id: 'feat-ocean', 
      title: 'Ocean Marine & Swell World', 
      category: 'Feature Worlds', 
      icon: Waves, 
      accentColor: '#0ea5e9',
      action: () => onSelectFeature?.('ocean'),
      keywords: ['marine', 'waves', 'surf', 'beach', 'sea']
    },
    { 
      id: 'feat-travel', 
      title: 'Travel Destination Climate', 
      category: 'Feature Worlds', 
      icon: Plane, 
      accentColor: '#eab308',
      action: () => onSelectFeature?.('travel'),
      keywords: ['flight', 'trip', 'hotel', 'tourism']
    },
    { 
      id: 'feat-health', 
      title: 'Health & Air Quality Sanctuary', 
      category: 'Feature Worlds', 
      icon: Heart, 
      accentColor: '#2dd4bf',
      action: () => onSelectFeature?.('health'),
      keywords: ['aqi', 'pm2.5', 'pollen', 'allergy', 'respiratory']
    },
    { 
      id: 'feat-events', 
      title: 'Outdoor Events Feasibility', 
      category: 'Feature Worlds', 
      icon: CalendarDays, 
      accentColor: '#ec4899',
      action: () => onSelectFeature?.('events'),
      keywords: ['wedding', 'party', 'concert', 'gathering']
    },

    // Tools & AI
    { 
      id: 'tool-ai', 
      title: 'Ask MAUSAM AI Assistant', 
      category: 'Tools & AI', 
      shortcut: 'AI',
      icon: Sparkles, 
      accentColor: '#a855f7',
      action: onOpenAI,
      keywords: ['chat', 'assistant', 'ask', 'prompt', 'intelligence']
    },
    { 
      id: 'tool-voice', 
      title: 'Voice Assistant & Dictation', 
      category: 'Tools & AI', 
      icon: Mic, 
      accentColor: '#06b6d4',
      action: onOpenVoice,
      keywords: ['speak', 'mic', 'voice', 'microphone']
    },
    { 
      id: 'tool-theme', 
      title: 'Theme & Appearance Selector', 
      category: 'Tools & AI', 
      shortcut: 'T',
      icon: Palette, 
      accentColor: '#f59e0b',
      action: onOpenTheme,
      keywords: ['color', 'dark', 'light', 'midnight', 'arctic', 'emerald', 'sunset']
    },
    { 
      id: 'tool-lang-en', 
      title: 'Language: English', 
      category: 'Tools & AI', 
      icon: Globe, 
      action: () => onLanguageChange?.('en'),
      keywords: ['language', 'english']
    },
    { 
      id: 'tool-lang-kn', 
      title: 'Language: ಕನ್ನಡ (Kannada)', 
      category: 'Tools & AI', 
      icon: Globe, 
      action: () => onLanguageChange?.('kn'),
      keywords: ['language', 'kannada', 'kn']
    },
    { 
      id: 'tool-lang-hi', 
      title: 'Language: हिंदी (Hindi)', 
      category: 'Tools & AI', 
      icon: Globe, 
      action: () => onLanguageChange?.('hi'),
      keywords: ['language', 'hindi', 'hi']
    },

    // Account & Settings
    { id: 'acc-profile', title: 'My Profile & Demographics', category: 'Account & Settings', icon: User, href: '/profile' },
    { id: 'acc-notifs', title: 'Notifications & Extreme Alerts', category: 'Account & Settings', icon: Bell, href: '/notifications' },
    { id: 'acc-settings', title: 'App Settings & Preferences', category: 'Account & Settings', icon: Settings, href: '/settings' },
  ], [onOpenAI, onOpenVoice, onOpenTheme, onSelectFeature, onLanguageChange]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter(c => {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      const matchKeywords = c.keywords?.some(k => k.toLowerCase().includes(q));
      return matchTitle || matchCategory || matchKeywords;
    });
  }, [query, allCommands]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  }, [onClose, router]);

  // Keyboard navigation inside Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div 
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: 'var(--surface-elevated)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7)'
        }}
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search features, tools, worlds (e.g. Radar, Satellite, Agriculture, AI)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/10 text-slate-400 border border-white/10 hidden sm:inline">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching features or commands found for &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-left transition-all duration-150 ${
                    isSelected 
                      ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50 shadow-sm' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: cmd.accentColor ? `${cmd.accentColor}20` : 'rgba(255,255,255,0.08)',
                        borderColor: cmd.accentColor ? `${cmd.accentColor}40` : 'rgba(255,255,255,0.15)',
                        color: cmd.accentColor || 'var(--primary)'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="truncate">
                      <div className="text-sm font-bold text-white truncate">
                        {cmd.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 border border-white/10">
                        {cmd.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[var(--primary)] translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Help Footer */}
        <div className="px-5 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">↑↓</span> to navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">↵</span> to select
            </span>
          </div>
          <span className="text-slate-500 font-medium hidden sm:inline">
            Global Feature Search
          </span>
        </div>
      </div>
    </div>
  );
}
