import React, { useState } from 'react';
import { Activity, Flame, Clock, Wind, Droplets, Sun, CheckCircle, AlertTriangle } from 'lucide-react';
import { ActivityWindow } from '@/lib/personalization/types';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

interface FitnessModuleProps {
  weather: WeatherPayload;
  windows: ActivityWindow[];
  unit?: 'celsius' | 'fahrenheit';
}

export function FitnessModule({ weather, windows, unit = 'celsius' }: FitnessModuleProps) {
  const [selectedSport, setSelectedSport] = useState<'running' | 'cycling' | 'walking' | 'sports'>('running');

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Fitness & Outdoor Training Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              Optimal workout windows calculated from hourly meteorological telemetry
            </p>
          </div>
        </div>

        {/* Sport Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          {(['running', 'cycling', 'walking', 'sports'] as const).map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedSport === sport
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Window Cards calculated from real forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {windows.slice(0, 4).map((win, idx) => {
          const isOptimal = win.rating === 'Optimal';
          const isPoor = win.rating === 'Poor';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isOptimal
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isPoor
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-400" />
                  {win.startTime} - {win.endTime}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOptimal
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isPoor
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {win.rating}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-white">
                  {formatTemperature(win.temperature, unit)}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {win.condition}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Droplets className="w-3 h-3" />
                  {win.rainProbability}% rain
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {win.recommendation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
