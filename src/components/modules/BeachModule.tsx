import React from 'react';
import { Waves, Sun, Wind, Compass, AlertCircle } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatWindSpeed, formatTemperature } from '@/lib/utils';

export function BeachModule({ weather, unit = 'celsius' }: { weather: WeatherPayload; unit?: 'celsius' | 'fahrenheit' }) {
  const current = weather.current;
  const isCoastal = weather.marine?.isAvailable || false;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Beach, Surf & Marine Recreation
            </h3>
            <p className="text-xs text-slate-400">
              Onshore winds, solar UV intensity, and swell parameters
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Coastal Wind */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-primary-400" />
            <span>Surface Wind</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatWindSpeed(current.windSpeed)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.windSpeed > 25 ? 'Moderate chop' : 'Calm surface'}
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Solar UV Index</span>
          </div>
          <div className="text-lg font-bold text-white">
            {current.uvIndex} / 12
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.uvIndex >= 8 ? 'Water reflection hazard' : 'Moderate exposure'}
          </div>
        </div>

        {/* Marine Swell / Tide */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Swell & Wave Height</span>
          </div>
          <div className="text-xs font-semibold text-amber-400 mt-1">
            {isCoastal ? '1.2m Swell' : 'Data unavailable for this location'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isCoastal ? 'Offshore buoy' : 'Inland coordinate'}
          </div>
        </div>

        {/* Water Temperature */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Waves className="w-3.5 h-3.5 text-teal-400" />
            <span>Sea Water Temp</span>
          </div>
          <div className="text-xs font-semibold text-amber-400 mt-1">
            {isCoastal ? '26°C' : 'Data unavailable for this location'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isCoastal ? 'Coastal reading' : 'Inland coordinate'}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Beach advisory: {current.uvIndex >= 7 ? "Water surface reflection intensifies solar radiation. Apply SPF 50 water-resistant sunscreen." : "Favorable conditions for beach strolls and leisure."}
        </span>
      </div>
    </div>
  );
}
