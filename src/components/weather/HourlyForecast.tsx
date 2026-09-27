import React from 'react';
import { Clock, Droplets, Wind, Sun, CloudRain } from 'lucide-react';
import { HourlyForecastItem } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  unit?: 'celsius' | 'fahrenheit';
}

export function HourlyForecast({ items, unit = 'celsius' }: HourlyForecastProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-400" />
          Hourly Progression (Next 24 Hours)
        </h3>
        <span className="text-xs text-slate-400">Scroll for hourly breakdown →</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {items.map((item, idx) => {
          const displayTime = item.time.includes('T') ? item.time.slice(11, 16) : item.time;
          const isHighRain = item.precipitationProbability >= 40;

          return (
            <div
              key={`${item.time}-${idx}`}
              className="flex-shrink-0 w-24 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-center flex flex-col items-center justify-between gap-2 group"
            >
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                {idx === 0 ? 'Now' : displayTime}
              </span>

              <div className="my-1">
                {item.precipitationProbability > 50 ? (
                  <CloudRain className="w-7 h-7 text-cyan-400" />
                ) : item.isDay ? (
                  <Sun className="w-7 h-7 text-amber-400" />
                ) : (
                  <Sun className="w-7 h-7 text-indigo-300" />
                )}
              </div>

              <span className="text-sm font-bold text-slate-100">
                {formatTemperature(item.temperature, unit)}
              </span>

              {/* Rain Probability Pill */}
              <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isHighRain 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'bg-slate-800/80 text-slate-400'
              }`}>
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>{item.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
