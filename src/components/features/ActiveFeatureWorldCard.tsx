'use client';

import React from 'react';
import { 
  Sprout, CloudRain, Sun, Cloud, Activity, 
  Waves, ShieldAlert, Sparkles, X, ChevronRight, Droplets,
  Wind, Eye, Thermometer, Compass
} from 'lucide-react';
import { FeatureWorldId } from '@/lib/theme/scene-registry';
import { GlassPanel } from '@/components/common/GlassPanel';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

interface ActiveFeatureWorldCardProps {
  selectedFeature: FeatureWorldId;
  weather: WeatherPayload;
  onClose: () => void;
  onAskAI: (prompt: string) => void;
}

export function ActiveFeatureWorldCard({
  selectedFeature,
  weather,
  onClose,
  onAskAI
}: ActiveFeatureWorldCardProps) {
  const current = weather.current;
  const daily = weather.daily?.[0];
  const rainProb = daily?.precipitationProbability ?? (current.precipitation > 0 ? 80 : 0);
  const aqi = weather.airQuality?.aqi ?? 45;

  switch (selectedFeature) {
    // 1. AGRICULTURE WORLD
    case 'agriculture':
      return (
        <GlassPanel
          variant="hero"
          glow="emerald"
          className="p-6 sm:p-7 mb-8 border-emerald-500/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Feature World
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Agri-Telemetry Live</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Smart Farming & Agriculture Intelligence
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Agriculture World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Estimated Soil Moisture</span>
              <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                {weather.agriculture?.soilMoisture ? `${Math.round(weather.agriculture.soilMoisture * 100)}%` : '62% (Optimal)'}
              </div>
              <span className="text-[10px] text-slate-400">Root zone saturation</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Evapotranspiration</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {weather.agriculture?.evapotranspiration ? `${weather.agriculture.evapotranspiration} mm` : '3.8 mm/day'}
              </div>
              <span className="text-[10px] text-slate-400">Crop moisture loss</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Rainfall Inflow</span>
              <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                {current.precipitation} mm ({rainProb}%)
              </div>
              <span className="text-[10px] text-slate-400">Precipitation potential</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Frost / Heat Risk</span>
              <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                {current.temperature < 4 ? 'Frost Alert' : current.temperature > 35 ? 'Heat Stress' : 'Favorable'}
              </div>
              <span className="text-[10px] text-slate-400">Canopy thermal check</span>
            </div>
          </div>

          {/* AI Agronomy Advisory & Action Chips */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-emerald-200">
              🌱 <span className="font-bold">Agronomist Recommendation:</span> Conditions are favorable for crop spraying between 07:00 and 11:00 AM before surface wind speeds rise.
            </p>
            <button
              onClick={() => onAskAI('What are the top agricultural precautions and irrigation advice for my crops today?')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm ml-auto"
            >
              Ask AI Farming Advisor →
            </button>
          </div>
        </GlassPanel>
      );

    // 2. RAIN WORLD
    case 'rain':
      return (
        <GlassPanel
          variant="hero"
          glow="cyan"
          className="p-6 sm:p-7 mb-8 border-sky-500/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-md">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Active Feature World
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Doppler Radar Active</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Precipitation Nowcasting & Rain Tracking
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Rain World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Precipitation Probability</span>
              <div className="text-lg font-black text-sky-300 font-mono mt-0.5">{rainProb}%</div>
              <span className="text-[10px] text-slate-400">Next 12-hour horizon</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Current Surface Rain</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">{current.precipitation} mm/hr</div>
              <span className="text-[10px] text-slate-400">Gauged precipitation</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Umbrella Advisory</span>
              <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                {rainProb >= 50 ? 'Required' : 'Optional'}
              </div>
              <span className="text-[10px] text-slate-400">Carry compact umbrella</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Wet Road Impact</span>
              <div className="text-lg font-black text-rose-300 font-mono mt-0.5">
                {current.precipitation > 2 ? 'Slippery' : rainProb >= 60 ? 'Moderate Caution' : 'Dry'}
              </div>
              <span className="text-[10px] text-slate-400">Commuter safety</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-sky-200">
              🌧 <span className="font-bold">Nowcast Alert:</span> {rainProb >= 60 ? 'Rain showers likely within the current meteorological window. Outdoor activities should be shielded.' : 'Low rain probability currently detected. Skies remain largely clear.'}
            </p>
            <button
              onClick={() => onAskAI('What is the minute-by-minute rain forecast for my exact coordinates today?')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-sky-950 font-bold text-xs hover:bg-sky-400 transition-colors shadow-sm ml-auto"
            >
              Analyze Rain Cells →
            </button>
          </div>
        </GlassPanel>
      );

    // 3. SUNNY WORLD
    case 'sunny':
      return (
        <GlassPanel
          variant="hero"
          glow="amber"
          className="p-6 sm:p-7 mb-8 border-amber-500/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Active Feature World
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Solar Telemetry Active</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Solar Radiation & Outdoor Sunlight Intelligence
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Sunny World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">UV Index</span>
              <div className="text-lg font-black text-amber-300 font-mono mt-0.5">{current.uvIndex} / 12</div>
              <span className="text-[10px] text-slate-400">{current.uvIndex >= 8 ? 'Very High Exposure' : 'Moderate Exposure'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Ambient Temperature</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">{Math.round(current.temperature)}°C</div>
              <span className="text-[10px] text-slate-400">Feels like {Math.round(current.feelsLike)}°C</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Sun Protection</span>
              <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                {current.uvIndex >= 6 ? 'SPF 50+ Required' : 'SPF 30 Recommended'}
              </div>
              <span className="text-[10px] text-slate-400">Sunglasses & hat advised</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Peak Solar Hours</span>
              <div className="text-lg font-black text-yellow-300 font-mono mt-0.5">11:30 AM – 3:30 PM</div>
              <span className="text-[10px] text-slate-400">Intense UV window</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-amber-200">
              ☀️ <span className="font-bold">Solar Advisory:</span> Ample bright sunlight provides excellent natural vitamin D synthesis. Seek intermittent shade during midday peak hours.
            </p>
            <button
              onClick={() => onAskAI('What precautions should I take for outdoor sun exposure and UV index today?')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm ml-auto"
            >
              Get Sun Safety Plan →
            </button>
          </div>
        </GlassPanel>
      );

    // 4. FITNESS WORLD
    case 'fitness':
      return (
        <GlassPanel
          variant="hero"
          glow="amber"
          className="p-6 sm:p-7 mb-8 border-orange-500/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Active Feature World
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Runner Telemetry Active</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Outdoor Running & Athletic Performance Window
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Fitness World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Optimal Running Time</span>
              <div className="text-lg font-black text-orange-300 font-mono mt-0.5">06:00 – 08:30 AM</div>
              <span className="text-[10px] text-slate-400">Coolest ambient temp</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Cardio Air Quality</span>
              <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">AQI {aqi}</div>
              <span className="text-[10px] text-slate-400">{aqi <= 50 ? 'Clean Air / High Stamina' : 'Moderate Particulates'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Hydration Index</span>
              <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">500 ml/hr</div>
              <span className="text-[10px] text-slate-400">Relative humidity {current.humidity}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Running Surface Risk</span>
              <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                {current.precipitation > 0 ? 'Wet Asphalt' : 'Dry & Stable'}
              </div>
              <span className="text-[10px] text-slate-400">Traction safety</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-orange-200">
              🏃 <span className="font-bold">Runner Advisory:</span> Morning thermal conditions are ideal for tempo and endurance runs. Keep hydration ready if training extends past 09:00 AM.
            </p>
            <button
              onClick={() => onAskAI('What is the best running and workout window for today considering weather and AQI?')}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-orange-950 font-bold text-xs hover:bg-orange-400 transition-colors shadow-sm ml-auto"
            >
              Analyze Workout Windows →
            </button>
          </div>
        </GlassPanel>
      );

    // 5. OCEAN WORLD
    case 'ocean':
      return (
        <GlassPanel
          variant="hero"
          glow="cyan"
          className="p-6 sm:p-7 mb-8 border-cyan-500/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Active Feature World
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Marine Buoy Network</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Oceanic Swell & Coastal Marine Conditions
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Ocean World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Wave Height</span>
              <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                {weather.marine?.waveHeight ? `${weather.marine.waveHeight} m` : '1.4 m (Moderate)'}
              </div>
              <span className="text-[10px] text-slate-400">Shoreline swell</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Coastal Wind Velocity</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">{current.windSpeed} km/h</div>
              <span className="text-[10px] text-slate-400">Direction {current.windDirection}°</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Water Temperature</span>
              <div className="text-lg font-black text-teal-300 font-mono mt-0.5">
                {weather.marine?.waterTemperature ? `${weather.marine.waterTemperature}°C` : '24.5°C'}
              </div>
              <span className="text-[10px] text-slate-400">Sea surface telemetry</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Marine Safety State</span>
              <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">Normal Nav</div>
              <span className="text-[10px] text-slate-400">No small craft advisories</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-cyan-200">
              🌊 <span className="font-bold">Marine Advisory:</span> Moderate wave swell and consistent onshore breeze. Excellent conditions for coastal walking and recreational shoreline boating.
            </p>
            <button
              onClick={() => onAskAI('What are the coastal marine conditions, wave height, and tides today?')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-cyan-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm ml-auto"
            >
              Consult Marine AI →
            </button>
          </div>
        </GlassPanel>
      );

    default:
      return null;
  }
}
