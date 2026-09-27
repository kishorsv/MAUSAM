import React, { useState } from 'react';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Droplets, Wind, Eye, Sun, ChevronRight } from 'lucide-react';
import { RiskTimelineSlot } from '@/lib/intelligence/decision-engine';
import { formatTemperature } from '@/lib/utils';

interface WeatherRiskTimelineProps {
  slots: RiskTimelineSlot[];
  unit?: 'celsius' | 'fahrenheit';
}

export function WeatherRiskTimeline({ slots, unit = 'celsius' }: WeatherRiskTimelineProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  if (!slots || slots.length === 0) return null;

  const currentSlot = slots[selectedSlotIndex] || slots[0];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Weather Risk Timeline
          </h3>
          <p className="text-xs text-slate-400">
            Hourly risk grading across daylight and twilight windows
          </p>
        </div>
        <span className="text-[11px] text-slate-400">Click time slot for diagnostic</span>
      </div>

      {/* Horizontal Time Slots Strip */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {slots.map((slot, idx) => {
          const isSelected = selectedSlotIndex === idx;
          const isHigh = slot.riskLevel === 'High';
          const isMod = slot.riskLevel === 'Moderate';

          return (
            <button
              key={idx}
              onClick={() => setSelectedSlotIndex(idx)}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                isSelected
                  ? 'bg-primary-600/30 border-primary-400 ring-2 ring-primary-500/40 shadow-glow-primary scale-105'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-xs font-bold text-slate-200">
                {slot.timeLabel}
              </span>

              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                isHigh
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : isMod
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {slot.riskLevel}
              </span>

              <span className="text-[11px] font-semibold text-slate-300 font-mono">
                {formatTemperature(slot.temperature, unit)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Diagnostic for Selected Hour */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {currentSlot.timeLabel} Atmospheric Breakdown
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${currentSlot.riskColor}`}>
              Risk: {currentSlot.riskLevel}
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            {currentSlot.summary}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Temperature</span>
            <span className="font-bold text-slate-200">{formatTemperature(currentSlot.temperature, unit)}</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Feels Like</span>
            <span className="font-bold text-slate-200">{formatTemperature(currentSlot.feelsLike, unit)}</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Rain Chance</span>
            <span className="font-bold text-cyan-400">{currentSlot.precipitationProbability}%</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Wind Speed</span>
            <span className="font-bold text-slate-200">{currentSlot.windSpeed} km/h</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Humidity</span>
            <span className="font-bold text-slate-200">{currentSlot.humidity}%</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">UV Index</span>
            <span className="font-bold text-amber-400">{currentSlot.uvIndex} / 12</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-slate-400 block">Visibility</span>
            <span className="font-bold text-indigo-400">{currentSlot.visibility} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
