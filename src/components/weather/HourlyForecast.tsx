'use client';

import React, { useState, useMemo } from 'react';
import { 
  Clock, Droplets, ArrowRight, Wind, Cloud, Sparkles, 
  Terminal, ChevronDown, ChevronUp, AlertCircle, RefreshCw 
} from 'lucide-react';
import { HourlyForecastItem } from '@/lib/weather/types';
import { formatTemperature, formatWindSpeed, formatTimeAgo } from '@/lib/utils';
import { GlassPanel } from '@/components/common/GlassPanel';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  unit?: 'celsius' | 'fahrenheit';
  windUnit?: 'kmh' | 'mph' | 'ms';
  fetchedAt?: string;
  locationName?: string;
  coordinates?: { lat: number; lon: number };
  timezone?: string;
  isUpdating?: boolean;
}

export function HourlyForecast({
  items,
  unit = 'celsius',
  windUnit = 'kmh',
  fetchedAt: propFetchedAt,
  locationName: propLocationName,
  coordinates: propCoordinates,
  timezone: propTimezone,
  isUpdating = false
}: HourlyForecastProps) {
  const { currentLocation } = useLocation();
  const { weather, lastUpdated, isRefreshing } = useWeather();
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Fallback metadata from unified context
  const resolvedFetchedAt = propFetchedAt || weather?.fetchedAt || lastUpdated || new Date().toISOString();
  const resolvedLocationName = propLocationName || weather?.location.name || currentLocation.city;
  const resolvedCoords = propCoordinates || {
    lat: weather?.location.lat ?? currentLocation.latitude,
    lon: weather?.location.lon ?? currentLocation.longitude
  };
  const resolvedTimezone = propTimezone || weather?.location.timezone || 'auto';

  // Slice exactly the next 24 consecutive hours unconditionally using useMemo
  const hourlyData = useMemo(() => (Array.isArray(items) ? items.slice(0, 24) : []), [items]);

  // Format timestamp to 12-hour user-friendly AM/PM local label
  const formatHourLabel = (timeStr: string, idx: number) => {
    if (idx === 0) return 'NOW';
    try {
      const rawHour = timeStr.includes('T')
        ? parseInt(timeStr.slice(11, 13), 10)
        : parseInt(timeStr.slice(0, 2), 10);
      const period = rawHour >= 12 ? 'PM' : 'AM';
      const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
      return `${hour12} ${period}`;
    } catch {
      return timeStr.slice(11, 16);
    }
  };

  // Format full local timestamp for tooltip/hover
  const formatFullTimestamp = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  // Temperature Graph Calculations (SVG Sparkline Spline)
  const temperatures = useMemo(
    () => (hourlyData.length > 0 ? hourlyData.map((h) => h.temperature) : [0]),
    [hourlyData]
  );
  const minTemp = useMemo(() => Math.min(...temperatures), [temperatures]);
  const maxTemp = useMemo(() => Math.max(...temperatures), [temperatures]);
  const tempRange = Math.max(maxTemp - minTemp, 1);

  // Generate SVG path points
  const graphWidth = 1000;
  const graphHeight = 56;
  const paddingX = 20;
  const paddingY = 8;
  const usableWidth = graphWidth - paddingX * 2;
  const usableHeight = graphHeight - paddingY * 2;

  const points = useMemo(() => {
    if (hourlyData.length === 0) return [];
    return hourlyData.map((hour, idx) => {
      const x = paddingX + (idx / Math.max(hourlyData.length - 1, 1)) * usableWidth;
      const normalizedY = (hour.temperature - minTemp) / tempRange;
      const y = graphHeight - paddingY - normalizedY * usableHeight;
      return { x, y, temp: hour.temperature, time: hour.time };
    });
  }, [hourlyData, minTemp, tempRange, usableWidth, usableHeight]);

  // Smooth SVG Bezier Path
  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  const svgAreaPath = useMemo(() => {
    if (!svgPath || points.length === 0) return '';
    const lastPoint = points[points.length - 1];
    return `${svgPath} L ${lastPoint.x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`;
  }, [svgPath, points]);

  // If no hourly data available, safely render fallback AFTER all hooks have run
  if (hourlyData.length === 0) {
    console.error('[HOURLY_DATA_LENGTH_MISMATCH] Hourly forecast array is empty or invalid.');
    return (
      <GlassPanel variant="card" className="p-6 text-center border-amber-500/20">
        <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold mb-1">
          <AlertCircle className="w-4 h-4" />
          <span>Hourly forecast temporarily unavailable</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Atmospheric models are synchronizing fresh hourly points.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="card" className="p-5 sm:p-7 relative overflow-hidden space-y-4">
      {/* Header: Title, Next 24 Hours, Freshness Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                Hourly Forecast Timeline
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-bold tracking-wider uppercase border border-[var(--primary)]/30">
                Next 24 Hours
              </span>
              {(isUpdating || isRefreshing) && (
                <span className="flex items-center gap-1 text-[10px] text-sky-400 animate-pulse font-mono">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Updating live...</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              High-resolution thermodynamic progression for {resolvedLocationName} • Updated{' '}
              {resolvedFetchedAt ? formatTimeAgo(resolvedFetchedAt) : 'just now'}
            </p>
          </div>
        </div>

        {/* Temperature Range & Debug Toggle */}
        <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
            <span className="text-slate-400">Range:</span>
            <span className="text-cyan-400 font-bold">{formatTemperature(minTemp, unit)}</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 font-bold">{formatTemperature(maxTemp, unit)}</span>
          </div>

          <button
            onClick={() => setShowDebug((prev) => !prev)}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-colors"
            title="Toggle Hourly Meteorological Diagnostics"
          >
            <Terminal className="w-3 h-3 text-primary-400" />
            <span>Diagnostics</span>
            {showDebug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Developer Diagnostics Bar (Section 18) */}
      {showDebug && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5 animate-in fade-in duration-200">
          <div className="font-bold text-primary-300 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>⚡ HOURLY FORECAST MET DATA TRACE</span>
            <span className="text-[10px] text-slate-500">24 Indexed Slices</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
            <div>
              <span className="text-slate-500">Location: </span>
              <span className="text-slate-200 font-semibold">{resolvedLocationName}</span>
            </div>
            <div>
              <span className="text-slate-500">Coordinates: </span>
              <span className="text-slate-200 font-semibold">
                {resolvedCoords.lat.toFixed(4)}°, {resolvedCoords.lon.toFixed(4)}°
              </span>
            </div>
            <div>
              <span className="text-slate-500">Timezone: </span>
              <span className="text-slate-200 font-semibold">{resolvedTimezone}</span>
            </div>
            <div>
              <span className="text-slate-500">Records Count: </span>
              <span className="text-emerald-400 font-bold">{hourlyData.length} hours</span>
            </div>
            <div>
              <span className="text-slate-500">First Timestamp: </span>
              <span className="text-sky-300">{hourlyData[0]?.time}</span>
            </div>
            <div>
              <span className="text-slate-500">Last Timestamp: </span>
              <span className="text-sky-300">{hourlyData[hourlyData.length - 1]?.time}</span>
            </div>
            <div>
              <span className="text-slate-500">Forecast Fetch: </span>
              <span className="text-slate-300">{resolvedFetchedAt.slice(11, 19)}</span>
            </div>
            <div>
              <span className="text-slate-500">Selected Hour: </span>
              <span className="text-amber-400 font-bold">
                {selectedHourIndex !== null ? `Hour #${selectedHourIndex}` : 'Index 0 (NOW)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Temperature Sparkline Visual Curve (Section 11) */}
      <div className="relative pt-1 px-1">
        <div className="h-14 w-full relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5">
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="tempLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under the curve */}
            <path d={svgAreaPath} fill="url(#tempAreaGradient)" />

            {/* Spline Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="url(#tempLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hourly Data Points on the Curve */}
            {points.map((pt, idx) => {
              const isSelected = selectedHourIndex === idx;
              const isNow = idx === 0;
              return (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 4.5 : isNow ? 3.5 : 2}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? 'fill-amber-400 stroke-white stroke-2'
                      : isNow
                      ? 'fill-[var(--primary)] stroke-white stroke-1'
                      : 'fill-slate-400 opacity-60'
                  }`}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hourly Timeline Rail (Section 8, 9, 10, 12, 22) */}
      <div className="relative z-10">
        <div className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto pb-3 pt-1 custom-scrollbar scroll-smooth">
          {hourlyData.map((item, idx) => {
            const timeLabel = formatHourLabel(item.time, idx);
            const isHighRain = item.precipitationProbability >= 40;
            const isNow = idx === 0;
            const isSelected = selectedHourIndex === idx;

            return (
              <div
                key={`${item.time}-${idx}`}
                onClick={() => setSelectedHourIndex(idx)}
                title={`${formatFullTimestamp(item.time)}: ${item.temperature}°C, ${item.condition}, Rain: ${item.precipitationProbability}%`}
                className={`flex-shrink-0 w-24 sm:w-28 p-3 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center justify-between gap-2 group cursor-pointer ${
                  isNow
                    ? 'bg-[var(--primary)]/15 border-[var(--primary)]/50 shadow-lg shadow-[var(--glow)] ring-1 ring-[var(--primary)]/30 scale-[1.02]'
                    : isSelected
                    ? 'bg-white/10 border-amber-400/60 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                {/* Dynamic NOW / Time Label */}
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[11px] font-extrabold tracking-tight uppercase ${
                      isNow
                        ? 'px-2 py-0.5 rounded-full bg-[var(--primary)] text-white shadow-sm'
                        : isSelected
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {timeLabel}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[80px]">
                    {item.time.includes('T') ? item.time.slice(11, 16) : item.time}
                  </span>
                </div>

                {/* Animated Hour-Specific Weather Icon (Section 10) */}
                <div className="my-0.5 transition-transform group-hover:scale-115">
                  <AnimatedWeatherIcon
                    wmoCode={item.wmoCode}
                    isDay={item.isDay}
                    size="md"
                  />
                </div>

                {/* Hour-Specific Temperature (Section 1, 9) */}
                <div className="space-y-0.5">
                  <div className="text-base font-black tracking-tight text-[var(--foreground)] font-mono">
                    {formatTemperature(item.temperature, unit)}
                  </div>
                  <div className="text-[10px] text-[var(--foreground-muted)] truncate max-w-[85px]" title={item.condition}>
                    {item.condition}
                  </div>
                </div>

                {/* Hour-Specific Rain Probability Pill (Section 12) */}
                <div
                  className={`w-full flex items-center justify-center gap-1 text-[10px] font-bold py-1 px-1.5 rounded-xl border ${
                    isHighRain
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                >
                  <Droplets className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>{item.precipitationProbability}%</span>
                </div>

                {/* Auxiliary Telemetry (Humidity & Wind) */}
                <div className="w-full flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                  <span title="Humidity">{item.humidity}%</span>
                  <span title="Wind Speed">{formatWindSpeed(item.windSpeed, windUnit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
