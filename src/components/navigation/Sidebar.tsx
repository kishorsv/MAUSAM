'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CloudSun, Home, Cloud, Calendar, Map, Satellite, Radio, 
  Sparkles, Plane, Heart, Sprout, CalendarDays, Settings,
  ChevronLeft, ChevronRight, ShieldCheck, Activity
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';

interface SidebarProps {
  onOpenAI?: () => void;
  className?: string;
}

export function Sidebar({ onOpenAI, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tokens, theme } = useTheme();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Weather', href: '/forecast', icon: Cloud },
    { label: 'Forecast', href: '/forecast', icon: Calendar },
    { label: 'Map', href: '/map', icon: Map },
    { label: 'Satellite', href: '/satellite', icon: Satellite },
    { label: 'Radar', href: '/radar', icon: Radio },
    { label: 'AI Assistant', href: '#ai', icon: Sparkles, isAction: true },
    { label: 'Travel', href: '/travel', icon: Plane },
    { label: 'Health', href: '/health', icon: Heart },
    { label: 'Agriculture', href: '/agriculture', icon: Sprout },
    { label: 'Events', href: '/events', icon: CalendarDays },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen py-5 px-3 border-r select-none ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
      aria-label="Sidebar Navigation"
    >
      {/* 1. BRAND LOGO & TITLE */}
      <div className="flex items-center justify-between px-2 pb-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center p-[1.5px] transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
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
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[var(--foreground)]">
                  MAUSAM
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
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

      {/* 2. NAVIGATION MENU ITEMS */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 pr-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isAction && (
            item.href === '/' 
              ? pathname === '/' 
              : pathname?.startsWith(item.href)
          );

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={onOpenAI}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group text-left relative overflow-hidden bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-cyan-500/20 border border-violet-500/30 text-white hover:scale-[1.02] shadow-sm hover:shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)]"
                title={collapsed ? item.label : undefined}
              >
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-violet-600/30 text-violet-300 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                </div>
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-bold tracking-wide">MAUSAM AI</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 shadow-[var(--glow)] font-semibold'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div 
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" 
                />
              )}

              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)] group-hover:text-white'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. BOTTOM TELEMETRY STATUS PILL */}
      <div className="pt-3 border-t border-white/5">
        <div 
          className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-[var(--foreground-muted)] ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <span className="font-semibold text-slate-300">Live Telemetry</span>
              <p className="text-[10px] text-slate-500">IMD • ECMWF • NOAA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
