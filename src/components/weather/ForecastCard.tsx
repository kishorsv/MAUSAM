import React, { useState } from 'react';
import { Calendar, Droplets, Wind, Sun, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyForecastItem } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

interface ForecastCardProps {
  items: DailyForecastItem[];
  unit?: 'celsius' | 'fahrenheit';
}

export function ForecastCard({ items, unit = 'celsius' }: ForecastCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const formatDateLabel = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-400" />
          7-Day Weather Outlook
        </h3>
        <span className="text-xs text-slate-400">Click a day for telemetry</span>
      </div>

      <div className="space-y-2.5">
        {items.map((day, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={`${day.date}-${idx}`}
              className="rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-3.5 flex items-center justify-between text-left gap-4"
              >
                <div className="w-28 sm:w-36">
                  <div className="text-sm font-semibold text-slate-200">
                    {formatDateLabel(day.date, idx)}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {day.condition}
                  </div>
                </div>

                {/* Rain probability */}
                <div className="flex items-center gap-1 text-xs text-cyan-400 w-16">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{day.precipitationProbability}%</span>
                </div>

                {/* Min / Max Temp Bar */}
                <div className="flex-1 max-w-xs flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-8 text-right font-medium">
                    {formatTemperature(day.temperatureMin, unit)}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <span className="text-xs text-slate-100 w-8 font-bold">
                    {formatTemperature(day.temperatureMax, unit)}
                  </span>
                </div>

                <div className="text-slate-500">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Day Details */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-white/5 bg-slate-900/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
                  <div>
                    <span className="text-slate-400">Sunrise:</span>
                    <span className="ml-1.5 font-semibold text-slate-200">{day.sunrise}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Sunset:</span>
                    <span className="ml-1.5 font-semibold text-slate-200">{day.sunset}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Max Wind:</span>
                    <span className="ml-1.5 font-semibold text-slate-200">{day.windSpeedMax} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Max UV:</span>
                    <span className="ml-1.5 font-semibold text-slate-200">{day.uvIndexMax} / 12</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
