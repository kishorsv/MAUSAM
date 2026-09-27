import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CloudSun, Search, Bell, User, MapPin, Globe, Sparkles, 
  Radio, Layers, Route, Users, Cpu, MoreHorizontal, Palette 
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
  const { theme, openThemeModal } = useTheme();
  const activeTheme = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const t = translations[language] || translations.en;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      {/* Offline Status Bar if network disconnected */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold py-1 px-4 text-center tracking-wide">
          OFFLINE MODE — Displaying last successfully retrieved weather data.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 p-[1px] shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  PRO
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                {t.appTagline}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Nav Links: Radar, Satellite, Route, Group, Station */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-300">
          <Link href="/radar" className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radar</span>
          </Link>
          <Link href="/satellite" className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Satellite</span>
          </Link>
          <Link href="/route" className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span>Routes</span>
          </Link>
          <Link href="/group" className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>Groups</span>
          </Link>
          <Link href="/station" className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-lime-400" />
            <span>IoT Station</span>
          </Link>
        </nav>

        {/* Location & Search Bar */}
        <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span className="truncate font-medium text-slate-300 group-hover:text-white">
                {currentLocation ? `${currentLocation.name}${currentLocation.region ? ', ' + currentLocation.region : ''}` : t.searchPlaceholder}
              </span>
            </div>
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 shrink-0 ml-2" />
          </button>
        </div>

        {/* Right Actions: Mode Badge, AI Trigger, Language, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mode Indicator */}
          <ModeBadge isLive={isLive} cached={cached} className="hidden lg:inline-flex" />

          {/* AI Assistant Quick Pill */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-primary-600/20 hover:from-violet-600/30 hover:to-primary-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Ask Mausam AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Mausam AI</span>
          </button>

          {/* More Features Dropdown for smaller desktop viewports */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="More Feature Centers"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {navMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700/80 z-50 text-xs space-y-1">
                <Link href="/radar" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Doppler Radar</span>
                </Link>
                <Link href="/satellite" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Satellite View</span>
                </Link>
                <Link href="/route" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800">
                  <Route className="w-4 h-4 text-emerald-400" />
                  <span>Route Intelligence</span>
                </Link>
                <Link href="/group" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>Group Weather</span>
                </Link>
                <Link href="/station" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800">
                  <Cpu className="w-4 h-4 text-lime-400" />
                  <span>IoT Weather Station</span>
                </Link>
                <Link href="/admin/system" onClick={() => setNavMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 border-t border-slate-800 pt-2">
                  <span>API Health Monitor</span>
                </Link>
              </div>
            )}
          </div>

          {/* Visual Atmosphere Theme Switcher Trigger */}
          <button
            onClick={openThemeModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-primary-500/40 text-slate-300 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 group"
            title="Switch Visual Atmosphere (5 Themes)"
          >
            <span className="text-sm">{activeTheme.icon}</span>
            <span className="hidden sm:inline font-mono text-[11px] group-hover:text-primary-300 transition-colors">
              {activeTheme.name}
            </span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="uppercase font-semibold">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 glass-panel rounded-2xl p-1.5 shadow-2xl border border-slate-700/80 z-50">
                <button
                  onClick={() => { onLanguageChange('en'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'en' ? 'bg-primary-600/20 text-primary-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { onLanguageChange('kn'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'kn' ? 'bg-primary-600/20 text-primary-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  ಕನ್ನಡ (Kannada)
                </button>
                <button
                  onClick={() => { onLanguageChange('hi'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'hi' ? 'bg-primary-600/20 text-primary-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
              {userName || 'Account'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
