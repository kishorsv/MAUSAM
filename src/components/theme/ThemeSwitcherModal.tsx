'use client';

import React, { useEffect, useRef } from 'react';
import { AVAILABLE_THEMES, ThemeId, ThemeMode, MotionPreference, WeatherEffectsPreference } from '@/lib/theme/types';
import { useTheme } from './ThemeContext';
import { 
  Palette, Check, X, Moon, Sun, Monitor, 
  Sparkles, Wind, Eye, Activity, CheckCircle2, ChevronRight 
} from 'lucide-react';

export function ThemeSwitcherModal() {
  const { 
    theme, 
    setTheme, 
    mode, 
    setMode, 
    resolvedMode, 
    motion, 
    setMotion, 
    weatherEffects, 
    setWeatherEffects, 
    isThemeModalOpen, 
    closeThemeModal, 
    visualState,
    tokens 
  } = useTheme();

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeThemeModal();
      }
    };
    if (isThemeModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThemeModalOpen, closeThemeModal]);

  if (!isThemeModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeThemeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Appearance and Theme Selector"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg rounded-3xl glass-panel border shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        style={{
          background: 'var(--surface-glass)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ 
                background: 'var(--primary)', 
                color: '#ffffff',
                boxShadow: 'var(--glow)' 
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                Theme & Appearance
              </h2>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Transform visual identity, atmospheric motion & lighting
              </p>
            </div>
          </div>

          <button
            onClick={closeThemeModal}
            className="p-1.5 rounded-xl hover:opacity-80 transition-opacity"
            style={{ 
              background: 'var(--surface)', 
              color: 'var(--foreground-muted)',
              border: '1px solid var(--border-subtle)' 
            }}
            aria-label="Close theme panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECTION 1: THEME SELECTION */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
              Theme
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--border-subtle)', color: 'var(--primary)' }}>
              5 Visual Worlds
            </span>
          </div>

          <div className="space-y-2">
            {AVAILABLE_THEMES.map((item) => {
              const isSelected = theme === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group relative overflow-hidden ${
                    isSelected 
                      ? 'ring-2 ring-offset-1 ring-offset-transparent shadow-lg scale-[1.01]' 
                      : 'hover:border-opacity-60 hover:scale-[1.005]'
                  }`}
                  style={{
                    background: isSelected ? 'var(--surface-elevated)' : 'var(--surface)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                    boxShadow: isSelected ? 'var(--glow)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Radio indicator circle */}
                    <div 
                      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                      style={{ 
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                        background: isSelected ? 'var(--primary)' : 'transparent'
                      }}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Theme name & tagline */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
                          {item.name}
                        </span>
                        <span 
                          className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold shrink-0"
                          style={{ 
                            background: 'var(--border-subtle)', 
                            color: isSelected ? 'var(--primary)' : 'var(--foreground-muted)' 
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Theme Palette Color Preview Circles */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center -space-x-1.5">
                      {item.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-black/30 shadow-sm transition-transform group-hover:scale-110"
                          style={{ background: color, zIndex: 10 - idx }}
                          title={`Color swatch ${idx + 1}: ${color}`}
                        />
                      ))}
                    </div>

                    {isSelected && (
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ml-1"
                        style={{ background: 'var(--primary)' }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MODE (DARK / LIGHT / AUTO) */}
        <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
              Mode
            </span>
            <span className="text-[11px] font-mono capitalize" style={{ color: 'var(--foreground-muted)' }}>
              Currently: {resolvedMode}
            </span>
          </div>

          <div 
            className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border"
            style={{ 
              background: 'var(--surface)', 
              borderColor: 'var(--border-subtle)' 
            }}
          >
            {[
              { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { id: 'auto' as ThemeMode, label: 'Auto', icon: Monitor }
            ].map((m) => {
              const isActive = mode === m.id;
              const Icon = m.icon;

              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? 'shadow-md scale-[1.02]' 
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--foreground-muted)',
                    boxShadow: isActive ? 'var(--glow)' : 'none'
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: ATMOSPHERE & MOTION PREFERENCES */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Motion Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motion Preference</span>
              </label>
              <div 
                className="grid grid-cols-3 gap-1 p-1 rounded-xl border text-[11px]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
              >
                {[
                  { id: 'full' as MotionPreference, label: 'Full' },
                  { id: 'reduced' as MotionPreference, label: 'Reduced' },
                  { id: 'auto' as MotionPreference, label: 'Auto' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMotion(item.id)}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      motion === item.id ? 'shadow-sm font-bold' : 'hover:opacity-75'
                    }`}
                    style={{
                      background: motion === item.id ? 'var(--primary)' : 'transparent',
                      color: motion === item.id ? '#ffffff' : 'var(--foreground-muted)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather Effects Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Weather Atmosphere</span>
              </label>
              <div 
                className="grid grid-cols-3 gap-1 p-1 rounded-xl border text-[11px]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
              >
                {[
                  { id: 'enabled' as WeatherEffectsPreference, label: 'Active' },
                  { id: 'disabled' as WeatherEffectsPreference, label: 'Off' },
                  { id: 'auto' as WeatherEffectsPreference, label: 'Auto' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setWeatherEffects(item.id)}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      weatherEffects === item.id ? 'shadow-sm font-bold' : 'hover:opacity-75'
                    }`}
                    style={{
                      background: weatherEffects === item.id ? 'var(--primary)' : 'transparent',
                      color: weatherEffects === item.id ? '#ffffff' : 'var(--foreground-muted)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: LIVE TOKENS FOOTER PREVIEW */}
        <div 
          className="p-3 rounded-2xl border flex items-center justify-between text-xs"
          style={{ 
            background: 'var(--surface)', 
            borderColor: 'var(--border-subtle)' 
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {visualState.heroHeadline}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: 'var(--foreground-muted)' }}>
            <span className="px-2 py-0.5 rounded border capitalize" style={{ borderColor: 'var(--border-subtle)' }}>
              {theme} • {resolvedMode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
