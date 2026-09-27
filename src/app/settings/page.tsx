'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, ArrowLeft, Sliders, Globe, Bell, Shield, 
  Palette, Moon, Sun, Monitor, Activity, Sparkles, Check 
} from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Language } from '@/lib/i18n/translations';
import { UserPreferences } from '@/lib/db/types';
import { useTheme } from '@/components/theme/ThemeContext';
import { AVAILABLE_THEMES, ThemeId, ThemeMode, MotionPreference, WeatherEffectsPreference } from '@/lib/theme/types';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { 
    theme, 
    setTheme, 
    mode, 
    setMode, 
    resolvedMode, 
    motion, 
    setMotion, 
    weatherEffects, 
    setWeatherEffects 
  } = useTheme();

  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => setPreferences(data))
      .catch(() => {});
  }, []);

  const handleUpdate = async (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    const updated = { ...preferences, ...updates };
    setPreferences(updated);

    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setSavedMessage("Settings saved successfully.");
      setTimeout(() => setSavedMessage(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col pb-20 sm:pb-12 transition-colors duration-300"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <Header
        isLive={true}
        language={preferences?.language || 'en'}
        onLanguageChange={(l) => handleUpdate({ language: l })}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2 rounded-xl border transition-colors hover:opacity-80"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Settings className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              Settings & Platform Configuration
            </h1>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Theme appearance, motion ergonomics, measurement standards & regional localization
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* 1. APPEARANCE & THEME SETTINGS */}
        <div 
          className="rounded-3xl p-6 border space-y-5"
          style={{ background: 'var(--surface-glass)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Palette className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Appearance & Global Theme
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border capitalize" style={{ borderColor: 'var(--border-subtle)', color: 'var(--primary)' }}>
              {theme} • {resolvedMode}
            </span>
          </div>

          {/* Theme Selection Grid */}
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--foreground-muted)' }}>
              Select Visual Atmosphere (5 Premium Themes)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_THEMES.map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 relative ${
                      isSelected 
                        ? 'ring-2 shadow-md scale-[1.01]' 
                        : 'hover:border-opacity-60'
                    }`}
                    style={{
                      background: isSelected ? 'var(--surface-elevated)' : 'var(--surface)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                      boxShadow: isSelected ? 'var(--glow)' : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>
                          {item.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--primary)' }}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full pt-1">
                      <span className="text-[9px] font-mono uppercase font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                        {item.badge}
                      </span>
                      <div className="flex items-center -space-x-1">
                        {item.previewColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/30"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector (Dark / Light / Auto) */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--foreground-muted)' }}>
              Color Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
                { id: 'auto' as ThemeMode, label: 'Auto (System)', icon: Monitor }
              ].map((m) => {
                const isSelected = mode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className="p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2"
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--surface)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--foreground-muted)',
                      boxShadow: isSelected ? 'var(--glow)' : 'none'
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motion & Weather Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <label className="text-xs font-semibold block mb-2 flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motion Preference</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full' as MotionPreference, label: 'Full' },
                  { id: 'reduced' as MotionPreference, label: 'Reduced' },
                  { id: 'auto' as MotionPreference, label: 'Auto' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMotion(item.id)}
                    className="p-2 rounded-xl text-xs font-bold border transition-all text-center"
                    style={{
                      background: motion === item.id ? 'var(--primary)' : 'var(--surface)',
                      borderColor: motion === item.id ? 'var(--primary)' : 'var(--border-subtle)',
                      color: motion === item.id ? '#ffffff' : 'var(--foreground-muted)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2 flex items-center gap-1.5" style={{ color: 'var(--foreground-muted)' }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Weather Atmosphere</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'enabled' as WeatherEffectsPreference, label: 'Enabled' },
                  { id: 'disabled' as WeatherEffectsPreference, label: 'Disabled' },
                  { id: 'auto' as WeatherEffectsPreference, label: 'Auto' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setWeatherEffects(item.id)}
                    className="p-2 rounded-xl text-xs font-bold border transition-all text-center"
                    style={{
                      background: weatherEffects === item.id ? 'var(--primary)' : 'var(--surface)',
                      borderColor: weatherEffects === item.id ? 'var(--primary)' : 'var(--border-subtle)',
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

        {/* 2. UNITS CONFIGURATION */}
        <div 
          className="rounded-3xl p-6 border space-y-4"
          style={{ background: 'var(--surface-glass)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
        >
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Sliders className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            Measurement Standards
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--foreground-muted)' }}>Temperature Unit</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdate({ temperature_unit: 'celsius' })}
                  className="p-2.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    background: preferences?.temperature_unit === 'celsius' ? 'var(--primary)' : 'var(--surface)',
                    borderColor: preferences?.temperature_unit === 'celsius' ? 'var(--primary)' : 'var(--border-subtle)',
                    color: preferences?.temperature_unit === 'celsius' ? '#ffffff' : 'var(--foreground-muted)'
                  }}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => handleUpdate({ temperature_unit: 'fahrenheit' })}
                  className="p-2.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    background: preferences?.temperature_unit === 'fahrenheit' ? 'var(--primary)' : 'var(--surface)',
                    borderColor: preferences?.temperature_unit === 'fahrenheit' ? 'var(--primary)' : 'var(--border-subtle)',
                    color: preferences?.temperature_unit === 'fahrenheit' ? '#ffffff' : 'var(--foreground-muted)'
                  }}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--foreground-muted)' }}>Wind Velocity</label>
              <div className="grid grid-cols-3 gap-2">
                {['kmh', 'mph', 'ms'].map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUpdate({ wind_unit: u as any })}
                    className="p-2.5 rounded-xl text-xs font-bold uppercase border transition-all"
                    style={{
                      background: preferences?.wind_unit === u ? 'var(--primary)' : 'var(--surface)',
                      borderColor: preferences?.wind_unit === u ? 'var(--primary)' : 'var(--border-subtle)',
                      color: preferences?.wind_unit === u ? '#ffffff' : 'var(--foreground-muted)'
                    }}
                  >
                    {u === 'kmh' ? 'km/h' : u === 'ms' ? 'm/s' : 'mph'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. LOCALIZATION */}
        <div 
          className="rounded-3xl p-6 border space-y-4"
          style={{ background: 'var(--surface-glass)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
        >
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Globe className="w-4 h-4 text-cyan-400" />
            Language & Regional Localization
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English' },
              { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              { id: 'hi', label: 'हिंदी (Hindi)' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => handleUpdate({ language: l.id as Language })}
                className="p-3 rounded-2xl text-xs font-bold border transition-all"
                style={{
                  background: preferences?.language === l.id ? 'var(--primary)' : 'var(--surface)',
                  borderColor: preferences?.language === l.id ? 'var(--primary)' : 'var(--border-subtle)',
                  color: preferences?.language === l.id ? '#ffffff' : 'var(--foreground-muted)'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. PRIVACY */}
        <div 
          className="rounded-3xl p-6 border space-y-3"
          style={{ background: 'var(--surface-glass)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
        >
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Shield className="w-4 h-4 text-emerald-400" />
            Data Privacy & Security
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            Mausam operates under a strict privacy-first principle: GPS coordinates are never stored without consent and are only queried transiently for hyper-local microclimate calculation. API keys are shielded server-side with zero browser exposure.
          </p>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
