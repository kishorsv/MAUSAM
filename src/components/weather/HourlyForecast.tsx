'use client';

import React from 'react';
import { Clock, Droplets, ArrowRight } from 'lucide-react';
import { HourlyForecastItem } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';
import { GlassPanel } from '@/components/common/GlassPanel';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  unit?: 'celsius' | 'fahrenheit';
}

export function HourlyForecast({ items, unit = 'celsius' }: HourlyForecastProps) {
  if (!items || items.length === 0) return null;

  // Format timestamp to 12-hour AM/PM label
  const formatHourLabel = (timeStr: string, idx: number) => {
    if (idx === 0) return 'Now';
    try {
      const rawHour = timeStr.includes('T') ? parseInt(timeStr.slice(11, 13), 10) : parseInt(timeStr.slice(0, 2), 10);
      const period = rawHour >= 12 ? 'PM' : 'AM';
      const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
      return `${hour12} ${period}`;
    } catch {
      return timeStr.slice(11, 16);
    }
  };

  return (
    <GlassPanel 
      variant="card" 
      className="p-5 sm:p-7 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Hourly Forecast Timeline
            </h3>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Next 24 hours atmospheric progression
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
          <span>Horizontal Timeline</span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--primary)]" />
        </div>
      </div>

      {/* Hourly Timeline Rail */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar">
          {items.map((item, idx) => {
            const timeLabel = formatHourLabel(item.time, idx);
            const isHighRain = item.precipitationProbability >= 40;
            const isNow = idx === 0;

            return (
              <div
                key={`${item.time}-${idx}`}
                className={`flex-shrink-0 w-24 sm:w-28 p-3.5 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center justify-between gap-2.5 group hover:-translate-y-1 hover:shadow-xl ${
                  isNow 
                    ? 'bg-[var(--primary)]/15 border-[var(--primary)]/50 shadow-[var(--glow)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Time Label */}
                <span className={`text-xs font-bold ${isNow ? 'text-[var(--primary)]' : 'text-slate-400'}`}>
                  {timeLabel}
                </span>

                {/* Animated Icon */}
                <div className="my-1 transition-transform group-hover:scale-110">
                  <AnimatedWeatherIcon 
                    wmoCode={item.wmoCode} 
                    isDay={item.isDay} 
                    size="md" 
                  />
                </div>

                {/* Temperature */}
                <span className="text-base font-black tracking-tight text-[var(--foreground)] font-mono">
                  {formatTemperature(item.temperature, unit)}
                </span>

                {/* Rain Probability Pill */}
                <div 
                  className={`w-full flex items-center justify-center gap-1 text-[11px] font-bold py-1 px-2 rounded-xl border ${
                    isHighRain
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                >
                  <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{item.precipitationProbability}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
