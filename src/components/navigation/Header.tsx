'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  CloudSun, Search, Bell, User, MapPin, Globe, Sparkles, 
  Palette, Moon, Sun, Monitor, ChevronDown, Check,
  Radio, Layers, Route, Users, Cpu, Settings, LogOut, Info, Command
} from 'lucide-react';
import { WeatherLocation } from '@/lib/weather/types';
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
  onOpenCommandPalette?: () => void;
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
  onOpenCommandPalette,
  unreadCount = 0,
  userName = 'Priya',
  isOffline = false
}: HeaderProps) {
  const { theme, openThemeModal, mode, setMode } = useTheme();
  const activeTheme = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];
  
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [liveInfoOpen, setLiveInfoOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations.en;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (liveRef.current && !liveRef.current.contains(e.target as Node)) {
        setLiveInfoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleThemeMode = () => {
    if (mode === 'dark') setMode('light');
    else if (mode === 'light') setMode('auto');
    else setMode('dark');
  };

  const locationLabel = currentLocation 
    ? `${currentLocation.name}${currentLocation.region ? ', ' + currentLocation.region : ''}`
    : 'Search city, state...';

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      <div 
        className="w-full rounded-2xl sm:rounded-3xl border shadow-xl transition-all duration-300 backdrop-blur-2xl relative overflow-hidden"
        style={{
          background: 'var(--surface-glass)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)'
        }}
      >
        {/* Specular Top Inner Highlight Line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-amber-500/90 text-slate-950 text-xs font-bold py-1 px-4 text-center tracking-wide backdrop-blur-sm">
            OFFLINE MODE — Displaying cached weather telemetry
          </div>
        )}

        <div className="px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* ============================================================== */}
          {/* 1. LEFT: Clean Logo & Brand Identity                          */}
          {/* ============================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl p-[1.5px] transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  boxShadow: 'var(--glow)'
                }}
              >
                <div 
                  className="w-full h-full rounded-[14px] flex items-center justify-center"
                  style={{ background: 'var(--background)' }}
                >
                  <CloudSun className="w-5 h-5 transition-colors" style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-[var(--foreground)]">
                    MAUSAM
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                    AI
                  </span>
                </div>
                <p className="hidden md:block text-[10px] text-[var(--foreground-muted)] truncate font-medium -mt-0.5">
                  Smart Weather Intelligence
                </p>
              </div>
            </Link>
          </div>

          {/* ============================================================== */}
          {/* 2. CENTER: Location Search & Quick Command Palette             */}
          {/* ============================================================== */}
          <div className="flex-1 max-w-md hidden sm:flex items-center justify-center px-2">
            <button
              onClick={onOpenCommandPalette || onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl border text-xs transition-all duration-200 group hover:border-[var(--primary)] shadow-inner"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground-muted)'
              }}
              title="Search location or press ⌘K for features"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="truncate font-semibold text-[var(--foreground)] group-hover:text-white transition-colors">
                  {locationLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-400 border border-white/10">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </div>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 3. RIGHT: Compact Controls (LIVE, AI, Theme, Mode, Lang, User)*/}
          {/* ============================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* COMPACT LIVE STATUS BEACON */}
            <div className="relative" ref={liveRef}>
              <button
                onClick={() => setLiveInfoOpen(!liveInfoOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  isLive 
                    ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25' 
                    : 'bg-amber-500/15 border-amber-500/35 text-amber-400 hover:bg-amber-500/25'
                }`}
                title="Click for meteorological telemetry data status"
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="hidden xs:inline">{isLive ? 'LIVE' : 'CACHED'}</span>
              </button>

              {/* Live Telemetry Mini Popover */}
              {liveInfoOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 p-3 rounded-2xl shadow-2xl border z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Telemetry Stream
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Connected</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provider:</span>
                      <span className="font-semibold text-white">Open-Meteo & IMD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sync Mode:</span>
                      <span className="font-mono text-cyan-300">SWR Cache / 15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Precision:</span>
                      <span className="font-mono text-slate-300">High-Res Doppler</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* COMPACT AI BUTTON */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-violet-600/25 via-purple-600/20 to-cyan-500/25 border-violet-500/35 text-white hover:border-violet-400"
              title="Open MAUSAM AI Weather Workspace"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI</span>
            </button>

            {/* COMPACT THEME SELECTOR BUTTON */}
            <button
              onClick={openThemeModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 group"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground)'
              }}
              title={`Theme: ${activeTheme.name}. Click to change.`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0 group-hover:scale-125 transition-transform"
                style={{ background: activeTheme.accentColor }}
              />
              <span className="hidden md:inline font-semibold text-[11px] truncate max-w-[85px]">
                {activeTheme.name}
              </span>
            </button>

            {/* DARK / LIGHT / AUTO MODE TOGGLE */}
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-xl border text-xs transition-all hover:scale-105 active:scale-95 text-[var(--foreground-muted)] hover:text-white"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)'
              }}
              title={`Mode: ${mode.toUpperCase()} (Click to toggle)`}
            >
              {mode === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : mode === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Monitor className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* COMPACT LANGUAGE SWITCHER */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-colors text-[var(--foreground)]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-subtle)'
                }}
                title="Change language"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] uppercase hidden xs:inline">{language}</span>
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 rounded-2xl p-1.5 shadow-2xl border z-50 text-xs backdrop-blur-xl animate-in zoom-in-95 duration-150"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <button
                    onClick={() => { onLanguageChange('en'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      language === 'en' ? 'bg-[var(--primary)] text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { onLanguageChange('kn'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      language === 'kn' ? 'bg-[var(--primary)] text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>ಕನ್ನಡ</span>
                    {language === 'kn' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { onLanguageChange('hi'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      language === 'hi' ? 'bg-[var(--primary)] text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>हिंदी</span>
                    {language === 'hi' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* COMPACT PROFILE AVATAR & DROPDOWN */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl border transition-all hover:scale-105 group"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-subtle)'
                }}
                title="Account menu"
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 group-hover:scale-105 transition-transform"
                >
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-2xl border z-50 text-xs backdrop-blur-xl animate-in zoom-in-95 duration-150 space-y-1"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="font-extrabold text-sm text-white">{userName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Personalized AI Account</p>
                  </div>

                  <Link 
                    href="/profile" 
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link 
                    href="/notifications" 
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    href="/settings" 
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Preferences & Units</span>
                  </Link>

                  <div className="border-t border-white/10 pt-1 mt-1">
                    <Link 
                      href="/auth/login" 
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
