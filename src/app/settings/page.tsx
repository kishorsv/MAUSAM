'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Sliders, Globe, Bell, Shield, Lock, Check } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Language } from '@/lib/i18n/translations';
import { UserPreferences } from '@/lib/db/types';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language={preferences?.language || 'en'}
        onLanguageChange={(l) => handleUpdate({ language: l })}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-400" />
              Settings & Platform Configuration
            </h1>
            <p className="text-xs text-slate-400">
              Measurement units, multilingual localization, and privacy controls
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Units Configuration */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-400" />
            Measurement Standards
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Temperature Unit</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdate({ temperature_unit: 'celsius' })}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    preferences?.temperature_unit === 'celsius' ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => handleUpdate({ temperature_unit: 'fahrenheit' })}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    preferences?.temperature_unit === 'fahrenheit' ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Wind Velocity</label>
              <div className="grid grid-cols-3 gap-2">
                {['kmh', 'mph', 'ms'].map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUpdate({ wind_unit: u as any })}
                    className={`p-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                      preferences?.wind_unit === u ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {u === 'kmh' ? 'km/h' : u === 'ms' ? 'm/s' : 'mph'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
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
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  preferences?.language === l.id ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Privacy Policy */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Data Privacy & Security
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mausam operates under a strict privacy-first principle: GPS coordinates are never stored without consent and are only queried transiently for hyper-local microclimate calculation. API keys are shielded server-side with zero browser exposure.
          </p>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
