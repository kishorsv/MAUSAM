'use client';

import React from 'react';
import { Wind, Shield, Info, Activity, AlertTriangle } from 'lucide-react';
import { AirQualityData } from '@/lib/weather/types';
import { getAqiCategory } from '@/lib/utils';
import { GlassPanel } from '@/components/common/GlassPanel';

interface AQICardProps {
  airQuality?: AirQualityData;
}

export function AQICard({ airQuality }: AQICardProps) {
  if (!airQuality) {
    return (
      <GlassPanel variant="card" className="p-6">
        <div className="flex items-center gap-2 mb-3 text-slate-300 font-bold text-sm">
          <Wind className="w-4 h-4 text-emerald-400" />
          Air Quality & Environmental Index
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 text-center">
          Live particulate sensor data currently unavailable for this specific coordinate. Monitoring regional stations.
        </div>
      </GlassPanel>
    );
  }

  const category = getAqiCategory(airQuality.aqi);
  const aqiVal = airQuality.aqi;
  const isHealthy = aqiVal <= 50;
  const isModerate = aqiVal > 50 && aqiVal <= 100;
  const isUnhealthy = aqiVal > 100;

  const glowType = isHealthy ? 'emerald' : isModerate ? 'amber' : 'rose';

  const getBarWidth = (val: number) => {
    return `${Math.min(100, Math.round((val / 300) * 100))}%`;
  };

  return (
    <GlassPanel 
      variant="card" 
      glow={glowType} 
      className="p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Air Quality Index (AQI)
            </h3>
            <p className="text-[10px] text-[var(--foreground-muted)]">Real-time Particulate Telemetry</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${category.color} bg-white/5 shadow-sm`}>
          {category.label}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-5xl font-black text-white tracking-tight font-mono">
          {airQuality.aqi}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          US EPA Standard (0-500 scale)
        </span>
      </div>

      {/* Visual AQI Gauge Bar */}
      <div className="w-full h-3 rounded-full bg-slate-900/80 p-0.5 border border-white/10 mb-4 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-700 shadow-sm"
          style={{ width: getBarWidth(airQuality.aqi) }}
        />
      </div>

      {/* Particulates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-[10px] font-bold text-slate-400 uppercase">PM2.5</div>
          <div className="text-sm font-extrabold text-slate-100 mt-0.5 font-mono">{airQuality.pm25} µg/m³</div>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-[10px] font-bold text-slate-400 uppercase">PM10</div>
          <div className="text-sm font-extrabold text-slate-100 mt-0.5 font-mono">{airQuality.pm10} µg/m³</div>
        </div>
        {airQuality.no2 !== undefined && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase">NO₂</div>
            <div className="text-sm font-extrabold text-slate-100 mt-0.5 font-mono">{airQuality.no2.toFixed(1)} µg/m³</div>
          </div>
        )}
        {airQuality.o3 !== undefined && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Ozone (O₃)</div>
            <div className="text-sm font-extrabold text-slate-100 mt-0.5 font-mono">{airQuality.o3.toFixed(1)} µg/m³</div>
          </div>
        )}
      </div>

      {/* Informational Guidance Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          {airQuality.aqi > 150
            ? "Air quality is unhealthy for sensitive individuals. Consider indoor air filtration and limiting vigorous outdoor exercise."
            : airQuality.aqi > 100
            ? "Acceptable air quality. Unusually sensitive individuals may experience mild throat irritation during prolonged outdoor cardio."
            : "Air quality is favorable and ideal for outdoor cardio, running, walks, and general recreation."}
        </span>
      </div>
    </GlassPanel>
  );
}
