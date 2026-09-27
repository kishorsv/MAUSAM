import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CloudSun, Search, Bell, User, MapPin, Globe, Sparkles, 
  Radio, Layers, Route, Users, Cpu, MoreHorizontal, Palette,
  Moon, Sun, Monitor
} from 'lucide-react';
import { WeatherLocation } from '@/lib/weather/types';
import { ModeBadge } from '../common/ModeBadge';
import { Language, translations } from '@/lib/i18n/translations';
import { useTheme } from '@/components/theme/ThemeContext';
import { AVAILABLE_THEMES } from '@/lib/theme/types';

interface HeaderProps {
  currentLocation?: WeatherLocation;
  isLive: boolean;
  cached?: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  unreadCount?: number;
  userName?: string;
  isOffline?: boolean;
}

export function Header({
  currentLocation,
  isLive,
  cached,
  language,
  onLanguageChange,
  onOpenSearch,
  onOpenAI,
  unreadCount = 0,
  userName,
  isOffline = false
}: HeaderProps) {
  const { theme, openThemeModal, tokens, mode, setMode, resolvedMode } = useTheme();
  const activeTheme = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const t = translations[language] || translations.en;

  const toggleThemeMode = () => {
    if (mode === 'dark') setMode('light');
    else if (mode === 'light') setMode('auto');
    else setMode('dark');
  };

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      <div 
        className="w-full glass-panel rounded-2xl sm:rounded-3xl border shadow-xl transition-all duration-300 backdrop-blur-2xl relative overflow-hidden"
        style={{
          background: 'var(--surface-glass)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)'
        }}
      >
        {/* Specular Top Inner Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Offline Status Bar if network disconnected */}
        {isOffline && (
          <div className="bg-amber-500 text-slate-950 text-xs font-bold py-1 px-4 text-center tracking-wide">
            OFFLINE MODE — Displaying last successfully retrieved weather data.
          </div>
        )}

        <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div 
              className="w-10 h-10 rounded-2xl p-[1px] shadow-sm group-hover:scale-105 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                boxShadow: 'var(--glow)'
              }}
            >
              <div 
                className="w-full h-full rounded-[15px] flex items-center justify-center"
                style={{ background: 'var(--background)' }}
              >
                <CloudSun className="w-5 h-5 transition-colors" style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
                  {t.appName}
                </span>
                <span 
                  className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border"
                  style={{
                    background: 'var(--border-subtle)',
                    color: 'var(--primary)',
                    borderColor: 'var(--border)'
                  }}
                >
                  PRO
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-medium" style={{ color: 'var(--foreground-muted)' }}>
                {t.appTagline}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Nav Links: Radar, Satellite, Route, Group, Station */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
          <Link 
            href="/radar" 
            className="px-2.5 py-1.5 rounded-xl hover:opacity-100 transition-colors flex items-center gap-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radar</span>
          </Link>
          <Link 
            href="/satellite" 
            className="px-2.5 py-1.5 rounded-xl hover:opacity-100 transition-colors flex items-center gap-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Satellite</span>
          </Link>
          <Link 
            href="/route" 
            className="px-2.5 py-1.5 rounded-xl hover:opacity-100 transition-colors flex items-center gap-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span>Routes</span>
          </Link>
          <Link 
            href="/group" 
            className="px-2.5 py-1.5 rounded-xl hover:opacity-100 transition-colors flex items-center gap-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>Groups</span>
          </Link>
          <Link 
            href="/station" 
            className="px-2.5 py-1.5 rounded-xl hover:opacity-100 transition-colors flex items-center gap-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            <Cpu className="w-3.5 h-3.5 text-lime-400" />
            <span>IoT Station</span>
          </Link>
        </nav>

        {/* Location & Search Bar */}
        <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl border text-xs transition-all shadow-inner group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground-muted)'
            }}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="truncate font-medium group-hover:opacity-100" style={{ color: 'var(--foreground)' }}>
                {currentLocation ? `${currentLocation.name}${currentLocation.region ? ', ' + currentLocation.region : ''}` : t.searchPlaceholder}
              </span>
            </div>
            <Search className="w-3.5 h-3.5 shrink-0 ml-2" style={{ color: 'var(--foreground-muted)' }} />
          </button>
        </div>

        {/* Right Actions: Mode Badge, AI Trigger, Theme Switcher, Language, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mode Indicator */}
          <ModeBadge isLive={isLive} cached={cached} className="hidden lg:inline-flex" />

          {/* AI Assistant Quick Pill */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(56, 189, 248, 0.15))`,
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            title="Ask Mausam AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Mausam AI</span>
          </button>

          {/* More Features Dropdown for smaller desktop viewports */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              className="p-2 rounded-xl border transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground)'
              }}
              title="More Feature Centers"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {navMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-2xl border z-50 text-xs space-y-1"
                style={{
                  background: 'var(--surface-glass)',
                  borderColor: 'var(--border)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <Link href="/radar" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Doppler Radar</span>
                </Link>
                <Link href="/satellite" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Satellite View</span>
                </Link>
                <Link href="/route" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <Route className="w-4 h-4 text-emerald-400" />
                  <span>Route Intelligence</span>
                </Link>
                <Link href="/group" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>Group Weather</span>
                </Link>
                <Link href="/station" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <Cpu className="w-4 h-4 text-lime-400" />
                  <span>IoT Weather Station</span>
                </Link>
                <Link href="/admin/system" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl border-t pt-2" style={{ borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}>
                  <span>API Health Monitor</span>
                </Link>
              </div>
            )}
          </div>

          {/* Visual Atmosphere Theme Switcher Trigger (Floating Panel Trigger) */}
          <button
            onClick={openThemeModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              boxShadow: 'var(--glow)'
            }}
            title="Appearance & Theme (5 Themes)"
          >
            <span className="text-sm">{activeTheme.icon}</span>
            <span className="hidden sm:inline font-medium text-[11px] truncate max-w-[90px]">
              {activeTheme.name}
            </span>
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm ml-0.5 shrink-0"
              style={{ background: 'var(--primary)' }}
            />
          </button>

          {/* Direct Dark / Light / Auto Quick Mode Switcher */}
          <button
            onClick={toggleThemeMode}
            className="flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)'
            }}
            title={`Mode: ${mode.toUpperCase()} (Click to toggle)`}
            aria-label={`Current mode: ${mode}. Click to toggle.`}
          >
            {mode === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : mode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Monitor className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground)'
              }}
              title="Change Language"
            >
              <Globe className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
              <span className="uppercase font-semibold">{language}</span>
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-36 rounded-2xl p-1.5 shadow-2xl border z-50"
                style={{
                  background: 'var(--surface-glass)',
                  borderColor: 'var(--border)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <button
                  onClick={() => { onLanguageChange('en'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'en' ? 'font-semibold' : 'hover:opacity-80'}`}
                  style={{
                    background: language === 'en' ? 'var(--primary)' : 'transparent',
                    color: language === 'en' ? '#ffffff' : 'var(--foreground)'
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => { onLanguageChange('kn'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'kn' ? 'font-semibold' : 'hover:opacity-80'}`}
                  style={{
                    background: language === 'kn' ? 'var(--primary)' : 'transparent',
                    color: language === 'kn' ? '#ffffff' : 'var(--foreground)'
                  }}
                >
                  ಕನ್ನಡ (Kannada)
                </button>
                <button
                  onClick={() => { onLanguageChange('hi'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'hi' ? 'font-semibold' : 'hover:opacity-80'}`}
                  style={{
                    background: language === 'hi' ? 'var(--primary)' : 'transparent',
                    color: language === 'hi' ? '#ffffff' : 'var(--foreground)'
                  }}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl border transition-colors"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)'
            }}
            title="Notifications"
          >
            <Bell className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)'
            }}
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform"
              style={{
                background: 'var(--border-subtle)',
                color: 'var(--primary)'
              }}
            >
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline text-xs font-medium truncate max-w-[100px]" style={{ color: 'var(--foreground)' }}>
              {userName || 'Account'}
            </span>
          </Link>
        </div>
      </div>
      </div>
    </header>
  );
}
