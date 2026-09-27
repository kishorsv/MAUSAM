import React from 'react';
import { Wind, Shield, Info, Activity, AlertTriangle } from 'lucide-react';
import { AirQualityData } from '@/lib/weather/types';
import { getAqiCategory } from '@/lib/utils';

interface AQICardProps {
  airQuality?: AirQualityData;
}

export function AQICard({ airQuality }: AQICardProps) {
  if (!airQuality) {
    return (
      <div className="glass-panel rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-sm">
          <Wind className="w-4 h-4 text-emerald-400" />
          Air Quality & Environmental Index
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 text-center">
          Live particulate sensor data currently unavailable for this specific coordinate. Gracefully monitoring regional stations.
        </div>
      </div>
    );
  }

  const category = getAqiCategory(airQuality.aqi);

  const getBarWidth = (val: number) => {
    return `${Math.min(100, Math.round((val / 300) * 100))}%`;
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">
            Air Quality Index (AQI)
          </h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${category.color} bg-white/5`}>
          {category.label}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-4xl font-extrabold text-white tracking-tight">
          {airQuality.aqi}
        </span>
        <span className="text-xs text-slate-400">
          US EPA Standard (0-500 scale)
        </span>
      </div>

      {/* Visual AQI Gauge Bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mb-4 relative">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
          style={{ width: getBarWidth(airQuality.aqi) }}
        />
      </div>

      {/* Particulates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">PM2.5</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">{airQuality.pm25} µg/m³</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">PM10</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">{airQuality.pm10} µg/m³</div>
        </div>
        {airQuality.no2 !== undefined && (
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">NO₂</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{airQuality.no2.toFixed(1)} µg/m³</div>
          </div>
        )}
        {airQuality.o3 !== undefined && (
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">Ozone (O₃)</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{airQuality.o3.toFixed(1)} µg/m³</div>
          </div>
        )}
      </div>

      {/* Informational Guidance Notice (WCAG & Neutral Compliance) */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          {airQuality.aqi > 150
            ? "Air quality is unhealthy for sensitive individuals. Consider indoor air filtration and limiting vigorous outdoor exercise."
            : airQuality.aqi > 100
            ? "Acceptable air quality. Unusually sensitive individuals may experience mild throat irritation during long runs."
            : "Air quality is favorable and ideal for outdoor cardio, walks, and general recreation."}
        </span>
      </div>
    </div>
  );
}
