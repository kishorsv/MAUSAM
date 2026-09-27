import React, { useState } from 'react';
import { Car, Navigation, Eye, Wind, CloudRain, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatWindSpeed } from '@/lib/utils';

export function CommuterModule({ weather }: { weather: WeatherPayload }) {
  const [activeRoute, setActiveRoute] = useState<'home-office' | 'home-college'>('home-office');
  const current = weather.current;
  const isRainy = current.precipitation > 0 || (weather.hourly[0]?.precipitationProbability ?? 0) > 40;
  const isLowVisibility = current.visibility < 4;
  const isHighWind = current.windSpeed > 35;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Daily Commute Transit Safety
            </h3>
            <p className="text-xs text-slate-400">
              Road surface telemetry, atmospheric visibility, and crosswind alerts
            </p>
          </div>
        </div>

        {/* Route Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveRoute('home-office')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeRoute === 'home-office' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Home → Office
          </button>
          <button
            onClick={() => setActiveRoute('home-college')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeRoute === 'home-college' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Home → College
          </button>
        </div>
      </div>

      {/* Transit Condition Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Road Surface */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isRainy ? 'bg-amber-950/20 border-amber-500/30' : 'bg-white/[0.02] border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Roadway Surface
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRainy ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isRainy ? 'Wet / Slick' : 'Dry & Clear'}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {isRainy ? 'Braking distances are extended. Keep extra vehicle headway.' : 'Standard vehicular braking performance.'}
          </div>
        </div>

        {/* Visibility */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLowVisibility ? 'bg-rose-950/20 border-rose-500/30' : 'bg-white/[0.02] border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" />
              Optical Range
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLowVisibility ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {current.visibility} km
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {isLowVisibility ? 'Fog or heavy mist detected. Use low beams and drive with caution.' : 'Clear sightlines across expressways and corridors.'}
          </div>
        </div>

        {/* Crosswind */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isHighWind ? 'bg-amber-950/20 border-amber-500/30' : 'bg-white/[0.02] border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-primary-400" />
              Wind / Gusts
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHighWind ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {formatWindSpeed(current.windSpeed)}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {isHighWind ? 'Sustained crosswinds. Exercise care on flyovers and bridges.' : 'Gentle ambient breezes; no steering deflection.'}
          </div>
        </div>
      </div>

      {/* Traffic note: Strictly never display fake traffic */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time weather parameters aligned with {activeRoute === 'home-office' ? 'Office Corridor' : 'College Route'}.</span>
        </div>
        <span className="text-[10px] text-slate-500">Live Traffic API: Configurable</span>
      </div>
    </div>
  );
}
