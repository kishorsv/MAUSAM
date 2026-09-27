import React from 'react';
import { Clock, Droplets, Sun, CloudRain } from 'lucide-react';
import { HourlyForecastItem } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  unit?: 'celsius' | 'fahrenheit';
}

export function HourlyForecast({ items, unit = 'celsius' }: HourlyForecastProps) {
  if (!items || items.length === 0) return null;

  return (
    <div 
      className="glass-panel rounded-3xl p-5 sm:p-6 border"
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          Hourly Progression (Next 24 Hours)
        </h3>
        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Scroll for hourly breakdown →</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {items.map((item, idx) => {
          const displayTime = item.time.includes('T') ? item.time.slice(11, 16) : item.time;
          const isHighRain = item.precipitationProbability >= 40;

          return (
            <div
              key={`${item.time}-${idx}`}
              className="flex-shrink-0 w-24 p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-2 group hover:scale-105"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
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

              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                {formatTemperature(item.temperature, unit)}
              </span>

              {/* Rain Probability Pill */}
              <div 
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isHighRain 
                    ? 'border-cyan-500/30' 
                    : ''
                }`}
                style={{
                  background: isHighRain ? 'rgba(56, 189, 248, 0.15)' : 'var(--border-subtle)',
                  color: isHighRain ? 'var(--primary)' : 'var(--foreground-muted)',
                  borderColor: isHighRain ? 'var(--border)' : 'transparent'
                }}
              >
                <Droplets className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                <span>{item.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
