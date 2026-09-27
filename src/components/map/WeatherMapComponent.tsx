'use client';

import React, { useState } from 'react';
import { Layers, MapPin, Navigation, Wind, Thermometer, CloudRain, AlertTriangle, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { WeatherPayload, WeatherLocation } from '@/lib/weather/types';
import { formatTemperature, formatWindSpeed } from '@/lib/utils';

interface WeatherMapProps {
  weather: WeatherPayload;
  onSelectLocation?: (loc: WeatherLocation) => void;
}

export function WeatherMapComponent({ weather, onSelectLocation }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'aqi'>('temp');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Key reference points for regional weather map display
  const keyCities = [
    { name: weather.location.name, temp: weather.current.temperature, rain: weather.hourly[0]?.precipitationProbability ?? 10, wind: weather.current.windSpeed, aqi: weather.airQuality?.aqi ?? 65, x: 50, y: 50, isCurrent: true },
    { name: 'Bengaluru', temp: 24, rain: 20, wind: 14, aqi: 75, x: 42, y: 68 },
    { name: 'Mumbai', temp: 31, rain: 65, wind: 24, aqi: 135, x: 28, y: 48 },
    { name: 'Delhi NCR', temp: 28, rain: 15, wind: 10, aqi: 210, x: 38, y: 24 },
    { name: 'Chennai', temp: 33, rain: 30, wind: 18, aqi: 82, x: 52, y: 72 },
    { name: 'Kolkata', temp: 30, rain: 75, wind: 16, aqi: 142, x: 74, y: 44 },
    { name: 'Hyderabad', temp: 29, rain: 25, wind: 15, aqi: 95, x: 45, y: 56 },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      {/* Top Map Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            Interactive Weather Radar & Atmospheric Map
          </h3>
          <p className="text-xs text-slate-400">
            Real-time geospatial heatmaps and weather layers
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'temp' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveLayer('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'rain' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
            <span>Rain Radar</span>
          </button>
          <button
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'wind' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-indigo-300" />
            <span>Wind Flow</span>
          </button>
          <button
            onClick={() => setActiveLayer('aqi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'aqi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Air Quality</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Animated Geographic Mesh Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Dynamic Heatmap Glow Layer */}
        {activeLayer === 'temp' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-rose-500/15 animate-pulse-slow" />
        )}
        {activeLayer === 'rain' && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent animate-pulse-slow" />
        )}
        {activeLayer === 'wind' && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent animate-pulse-slow" />
        )}
        {activeLayer === 'aqi' && (
          <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/15 via-amber-500/10 to-emerald-500/10 animate-pulse-slow" />
        )}

        {/* Map Markers */}
        <div
          className="relative w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {keyCities.map((city, idx) => {
            const isTarget = city.isCurrent;
            const badgeValue =
              activeLayer === 'temp'
                ? `${city.temp}°C`
                : activeLayer === 'rain'
                ? `${city.rain}% rain`
                : activeLayer === 'wind'
                ? `${city.wind} km/h`
                : `AQI ${city.aqi}`;

            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
              >
                {/* Marker Pin */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-xl backdrop-blur-md transition-all ${
                  isTarget
                    ? 'bg-primary-600/90 text-white border-primary-400 ring-2 ring-primary-500/40 shadow-glow-primary scale-105'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-slate-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    activeLayer === 'temp'
                      ? city.temp > 30 ? 'bg-rose-400' : 'bg-amber-400'
                      : activeLayer === 'rain'
                      ? city.rain > 50 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'
                      : activeLayer === 'wind'
                      ? 'bg-indigo-400'
                      : city.aqi > 150 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                  }`} />
                  <span className="truncate">{city.name}</span>
                  <span className="text-[11px] font-mono text-slate-300 font-normal border-l border-slate-700 pl-1.5 ml-0.5">
                    {badgeValue}
                  </span>
                </div>

                {isTarget && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-primary-300 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-full border border-primary-500/30">
                    Selected Location
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3 rounded-2xl glass-panel border border-slate-800 text-[11px] text-slate-300 space-y-1 z-30">
          <div className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
            Layer Legend ({activeLayer.toUpperCase()})
          </div>
          {activeLayer === 'temp' && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> &lt;20°C Cool
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" /> 20-30°C Mild
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> &gt;30°C Warm
            </div>
          )}
          {activeLayer === 'rain' && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> &lt;30% Dry
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2" /> 30-70% Showers
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-2" /> &gt;70% Downpour
            </div>
          )}
          {activeLayer === 'aqi' && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 0-50 Good
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" /> 51-100 Mod
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> &gt;150 Unhealthy
            </div>
          )}
          {activeLayer === 'wind' && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-300" /> &lt;20 km/h Breeze
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2" /> &gt;35 km/h Strong
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-30">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.6))}
            className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
