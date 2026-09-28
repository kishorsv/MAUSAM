'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CloudSun, Home, Cloud, Calendar, MapPin, Satellite, Radio, 
  Sparkles, Plane, Heart, Sprout, CalendarDays, Settings, 
  ChevronLeft, ChevronRight, Activity, Route, Users, Cpu, 
  Mic, Globe, Command
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';

interface SidebarProps {
  onOpenAI?: () => void;
  onOpenVoice?: () => void;
  onOpenCommandPalette?: () => void;
  className?: string;
}

export function Sidebar({ 
  onOpenAI, 
  onOpenVoice,
  onOpenCommandPalette,
  className = '' 
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tokens, theme } = useTheme();

  // 1. PRIMARY NAVIGATION
  const primaryItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Weather', href: '/forecast', icon: Cloud },
    { label: 'Forecast', href: '/forecast', icon: Calendar },
    { label: 'Map', href: '/map', icon: MapPin },
  ];

  // 2. SECONDARY / TELEMETRY CENTERS
  const secondaryItems = [
    { label: 'Doppler Radar', href: '/radar', icon: Radio, accentColor: '#06b6d4' },
    { label: 'Satellite View', href: '/satellite', icon: Satellite, accentColor: '#6366f1' },
    { label: 'Route Intelligence', href: '/route', icon: Route, accentColor: '#10b981' },
    { label: 'Group Weather', href: '/group', icon: Users, accentColor: '#a855f7' },
    { label: 'IoT Station', href: '/station', icon: Cpu, accentColor: '#84cc16' },
  ];

  // 3. PERSONAL WORLDS
  const personalItems = [
    { label: 'Travel & Trips', href: '/travel', icon: Plane, accentColor: '#eab308' },
    { label: 'Health & AQI', href: '/health', icon: Heart, accentColor: '#2dd4bf' },
    { label: 'Agriculture', href: '/agriculture', icon: Sprout, accentColor: '#10b981' },
    { label: 'Fitness & Run', href: '/fitness', icon: Activity, accentColor: '#f97316' },
    { label: 'Events & Social', href: '/events', icon: CalendarDays, accentColor: '#ec4899' },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen py-4 px-3 border-r select-none ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border-subtle)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)'
      }}
      aria-label="Sidebar Navigation"
    >
      {/* BRAND LOGO & TITLE */}
      <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center p-[1.5px] transition-transform duration-300 group-hover:scale-105 flex-shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: 'var(--glow)'
            }}
          >
            <div 
              className="w-full h-full rounded-[14px] flex items-center justify-center"
              style={{ background: 'var(--background)' }}
            >
              <CloudSun className="w-5 h-5 text-[var(--primary)]" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-[var(--foreground)]">
                  MAUSAM
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[var(--foreground-muted)] truncate font-medium">
                Weather Intelligence
              </p>
            </div>
          )}
        </Link>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl hover:bg-white/10 text-[var(--foreground-muted)] hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* QUICK COMMAND PALETTE BUTTON */}
      {onOpenCommandPalette && (
        <div className="pt-3 px-1">
          <button
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center gap-2 p-2 rounded-2xl border text-xs text-[var(--foreground-muted)] hover:text-white hover:border-[var(--primary)] transition-all ${
              collapsed ? 'justify-center' : 'justify-between px-3'
            }`}
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Search commands (Ctrl+K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Command className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              {!collapsed && <span className="font-medium text-[11px]">Command Menu</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                ⌘K
              </span>
            )}
          </button>
        </div>
      )}

      {/* NAVIGATION SECTIONS */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-none">
        {/* 1. PRIMARY SECTION */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Primary
            </div>
          )}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/35 shadow-[var(--glow)]'
                    : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                )}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[var(--primary)]' : 'text-slate-400 group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAI}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 group text-left relative overflow-hidden bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-cyan-500/20 border border-violet-500/35 text-white hover:scale-[1.02] shadow-sm ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Ask MAUSAM AI' : undefined}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-violet-600/30 text-violet-300 group-hover:scale-110 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            </div>
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">MAUSAM AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
            )}
          </button>
        </div>

        {/* 2. SECONDARY / OBSERVATION CENTERS */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Centers & Observation
            </div>
          )}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm font-semibold'
                    : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                  style={{ color: item.accentColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* 3. PERSONAL / FEATURE WORLDS */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Personal Worlds
            </div>
          )}
          {personalItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm font-semibold'
                    : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                  style={{ color: item.accentColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* 4. TOOLS & SETTINGS */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Tools & Preferences
            </div>
          )}

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all text-slate-400 hover:text-white hover:bg-white/5 text-left ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? 'Voice Assistant' : undefined}
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              {!collapsed && <span className="truncate">Voice Assistant</span>}
            </button>
          )}

          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5 ${
              pathname === '/settings' ? 'bg-white/10 text-white font-semibold' : ''
            }`}
            title={collapsed ? 'App Settings' : undefined}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            {!collapsed && <span className="truncate">Settings</span>}
          </Link>
        </div>
      </nav>

      {/* BOTTOM TELEMETRY STATUS PILL */}
      <div className="pt-3 border-t border-white/5">
        <div 
          className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-[var(--foreground-muted)] ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-slate-300">Live Telemetry</span>
              <p className="text-[10px] text-slate-500 font-mono">IMD • NOAA • ECMWF</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
