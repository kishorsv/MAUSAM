import React from 'react';
import { Users, School, Home, Building2, Sun, CloudRain, Clock, ShieldCheck } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

export function FamilyModule({ weather, unit = 'celsius' }: { weather: WeatherPayload; unit?: 'celsius' | 'fahrenheit' }) {
  const current = weather.current;
  const morningSlot = weather.hourly.find(h => h.time.includes('07:') || h.time.includes('08:')) || weather.hourly[0];
  const afternoonSlot = weather.hourly.find(h => h.time.includes('14:') || h.time.includes('15:')) || weather.hourly[4] || weather.hourly[0];
  const eveningSlot = weather.hourly.find(h => h.time.includes('18:') || h.time.includes('19:')) || weather.hourly[8] || weather.hourly[0];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Family & Child Safety Overview
            </h3>
            <p className="text-xs text-slate-400">
              School commute, playground comfort, and return timing weather windows
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Morning School Drop-off */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <School className="w-4 h-4 text-amber-400" />
              School Departure (07:30 - 08:30)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">
              {formatTemperature(morningSlot?.temperature ?? current.temperature, unit)}
            </span>
            <span className="text-xs text-slate-400">
              {morningSlot?.condition ?? current.condition}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {morningSlot && morningSlot.precipitationProbability > 40 ? 'Pack raincoat or umbrella in school backpack.' : 'Mild morning; light layer is recommended.'}
          </div>
        </div>

        {/* Afternoon Pick-up & Playground */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              School Return (14:30 - 15:30)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">
              {formatTemperature(afternoonSlot?.temperature ?? current.temperature, unit)}
            </span>
            <span className="text-xs text-slate-400">
              UV {afternoonSlot?.uvIndex ?? current.uvIndex}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {afternoonSlot && afternoonSlot.uvIndex >= 7 ? 'High midday UV. Water bottle and cap recommended.' : 'Pleasant outdoor playtime conditions.'}
          </div>
        </div>

        {/* Evening Family Return */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-400" />
              Evening Transit (18:00 - 19:30)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">
              {formatTemperature(eveningSlot?.temperature ?? current.temperature, unit)}
            </span>
            <span className="text-xs text-slate-400">
              {eveningSlot?.precipitationProbability ?? 0}% rain
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {eveningSlot && eveningSlot.precipitationProbability > 50 ? 'Precipitation expected; plan for commute delays.' : 'Clear skies expected for evening return.'}
          </div>
        </div>
      </div>
    </div>
  );
}
