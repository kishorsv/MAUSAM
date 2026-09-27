'use client';

import React from 'react';
import { AVAILABLE_THEMES, ThemeId } from '@/lib/theme/types';
import { useTheme } from './ThemeContext';
import { Palette, Check, X, Sparkles, Sliders } from 'lucide-react';

export function ThemeSwitcherModal() {
  const { theme, setTheme, isThemeModalOpen, closeThemeModal, visualState } = useTheme();

  if (!isThemeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 p-[1px] shadow-glow-primary">
              <div className="w-8 h-8 rounded-[15px] bg-slate-950 flex items-center justify-center">
                <Palette className="w-4 h-4 text-primary-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Select Visual Atmosphere</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-mono">
                  5 Modes
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose how Mausam renders atmospheric lighting, particles, and depth
              </p>
            </div>
          </div>

          <button
            onClick={closeThemeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Atmosphere Status */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              Active Environment: <strong className="text-white">{visualState.heroHeadline}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono capitalize">
            {visualState.timeOfDay} • {visualState.conditionKey}
          </span>
        </div>

        {/* 5 Selectable Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {AVAILABLE_THEMES.map((item) => {
            const isSelected = theme === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-primary-900/30 border-primary-500 shadow-glow-primary ring-1 ring-primary-500/40'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/15 hover:bg-slate-800/40'
                }`}
              >
                {/* Accent glow corner */}
                <div
                  className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                  style={{ background: item.accentColor }}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-primary-300 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold bg-white/5 text-slate-400 border border-white/5">
                      {item.badge}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-slate-950 font-bold ml-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.accentColor }} />
                    <span className="font-mono">Motion Speed: Tiered</span>
                  </span>
                  <span className="font-semibold text-primary-400 group-hover:underline">
                    {isSelected ? 'Currently Active' : 'Switch to Theme'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            Prefers-reduced-motion respected • Contextual WCAG AAA contrast
          </span>
          <button
            onClick={closeThemeModal}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white shadow-lg transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
