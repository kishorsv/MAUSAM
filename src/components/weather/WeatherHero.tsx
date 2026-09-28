'use client';

import React from 'react';
import { 
  Wind, Droplets, Compass, Eye, Gauge, Sparkles, Navigation,
  Sunrise, Sunset, Radio, ShieldCheck, CloudRain, Cloud, RotateCw, MapPin
} from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature, formatWindSpeed, formatTimeAgo } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n/translations';
import { useTheme } from '@/components/theme/ThemeContext';
import { useLocation } from '@/components/location/LocationContext';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { GlassPanel } from '@/components/common/GlassPanel';

interface WeatherHeroProps {
  weather: WeatherPayload;
  unit?: 'celsius' | 'fahrenheit';
  windUnit?: 'kmh' | 'mph' | 'ms';
  language?: Language;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenSearch?: () => void;
}

export function WeatherHero({
  weather,
  unit = 'celsius',
  windUnit = 'kmh',
  language = 'en',
  isRefreshing = false,
  onRefresh,
  onOpenSearch
}: WeatherHeroProps) {
  const { visualState, tokens } = useTheme();
  const { accuracy, isLowAccuracy, currentLocation } = useLocation();
  const t = translations[language] || translations.en;
  const current = weather.current;
  const location = weather.location;

  const sunriseTime = weather.daily[0]?.sunrise 
    ? (weather.daily[0].sunrise.includes('T') ? weather.daily[0].sunrise.slice(11, 16) : weather.daily[0].sunrise) 
    : '06:12';
  const sunsetTime = weather.daily[0]?.sunset 
    ? (weather.daily[0].sunset.includes('T') ? weather.daily[0].sunset.slice(11, 16) : weather.daily[0].sunset) 
    : '18:25';

  return (
    <GlassPanel 
      variant="hero" 
      glow="primary"
      className="p-6 sm:p-9 relative overflow-hidden"
    >
      {/* Decorative ambient color spots */}
      <div 
        className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25" 
        style={{ background: visualState.accentColor }}
      />
      <div 
        className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: visualState.accentColor }}
      />

      {/* Atmospheric Real-Time Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background: visualState.accentColor }} />
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Atmosphere:</span>
            <span className="text-xs font-bold" style={{ color: visualState.accentColor }}>{visualState.heroHeadline}</span>
          </div>
        </div>

        <p className="text-[11px] hidden lg:block text-slate-300 max-w-md truncate">
          {visualState.atmosphereNote}
        </p>

        {/* Sunrise & Sunset Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono ml-auto sm:ml-0 text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-400" /> 
            <span>{sunriseTime}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <Sunset className="w-4 h-4 text-rose-400" /> 
            <span>{sunsetTime}</span>
          </span>
        </div>
      </div>

      {/* Header Meta: Location Name, LIVE Indicator, Provider Source */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="group flex items-center gap-2 text-left transition-transform hover:scale-[1.01]"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                  {currentLocation.locality && currentLocation.locality !== location.name ? `${currentLocation.locality}, ` : ''}{location.name}
                </h1>
                {location.region && location.region !== currentLocation.locality && (
                  <span className="text-sm font-medium text-[var(--foreground-muted)] hidden sm:inline">
                    , {location.region}
                  </span>
                )}
                {/* LIVE INDICATOR BADGE */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE WEATHER</span>
                </div>
                {accuracy && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    isLowAccuracy 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}>
                    <span>±{Math.round(accuracy)}m</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-200 border border-white/10 transition-all hover:text-white disabled:opacity-50"
              title="Refresh live weather"
            >
              <RotateCw className={`w-3 h-3 text-[var(--primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
          <span className="font-mono text-[11px]">Updated {weather.fetchedAt ? formatTimeAgo(weather.fetchedAt) : 'just now'}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 font-semibold text-[11px] text-slate-300">
            <Radio className="w-3 h-3 text-[var(--primary)]" />
            {weather.provider}
          </span>
        </div>
      </div>

      {/* HERO SECTION: Large Temperature & Condition Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 mb-8">
        <div className="md:col-span-7 flex items-center gap-6 sm:gap-9">
          {/* Animated Weather Icon Display */}
          <div className="shrink-0 p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
            <AnimatedWeatherIcon 
              wmoCode={current.wmoCode} 
              isDay={current.isDay} 
              size="hero" 
            />
          </div>

          <div>
            {/* Primary Large Temperature */}
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-8xl font-black tracking-tighter text-[var(--foreground)] leading-none select-none">
                {formatTemperature(current.temperature, unit)}
              </span>
            </div>

            {/* Condition Description */}
            <div className="text-lg sm:text-xl font-bold mt-2 text-[var(--foreground)] flex items-center gap-2">
              <span>{current.condition}</span>
            </div>

            {/* Feels-Like Subtitle */}
            <div className="text-xs sm:text-sm mt-1 font-medium text-[var(--foreground-muted)]">
              {t.feelsLike} <span className="font-bold text-[var(--foreground)]">{formatTemperature(current.feelsLike, unit)}</span>
            </div>
          </div>
        </div>

        {/* Quick Range & Key Highlights */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-8">
          <div className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[var(--foreground-muted)]">Today&apos;s Range</span>
            <span className="font-bold text-[var(--foreground)] font-mono">
              {weather.daily[0] ? `${formatTemperature(weather.daily[0].temperatureMin, unit)} / ${formatTemperature(weather.daily[0].temperatureMax, unit)}` : '--'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[var(--foreground-muted)]">{t.rainProbability}</span>
            <span className="font-bold font-mono text-[var(--primary)]">
              {weather.hourly[0]?.precipitationProbability ?? 0}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[var(--foreground-muted)]">Air Quality</span>
            <span className="font-bold font-mono text-emerald-400">
              {weather.airQuality && weather.airQuality.aqi !== undefined ? `AQI ${weather.airQuality.aqi} • ${weather.airQuality.status}` : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* SUPPORTING METRIC CARDS (Wind, Humidity, Rain, Cloud Cover, UV, Visibility, Pressure) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 relative z-10 pt-5 border-t border-white/10">
        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--primary)] transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Wind className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{t.wind}</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {formatWindSpeed(current.windSpeed, windUnit)}
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            Dir {current.windDirection}°
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.humidity}</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.humidity !== undefined ? `${current.humidity}%` : '--'}
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            {current.humidity > 70 ? 'High Moisture' : 'Comfortable'}
          </div>
        </div>

        {/* Rain & Precipitation */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rain</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.rain !== undefined ? `${current.rain} mm` : current.precipitation !== undefined ? `${current.precipitation} mm` : '--'}
          </div>
          <div className="text-[10px] text-blue-400 mt-0.5 font-medium">
            {(current.rain || current.precipitation) > 0 ? 'Active Rain' : 'Dry Surface'}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Cloud Cover</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.cloudCover !== undefined ? `${current.cloudCover}%` : '--'}
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            {current.cloudCover !== undefined && current.cloudCover > 60 ? 'Overcast Sky' : 'Clear Spans'}
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.uvIndex}</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.uvIndex !== undefined ? current.uvIndex : '--'} <span className="text-xs font-normal text-slate-400">/12</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
            {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
          </div>
        </div>

        {/* Visibility */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.visibility}</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.visibility !== undefined ? `${current.visibility} km` : '--'}
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            {current.visibility >= 10 ? 'Optimal' : 'Moderate'}
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.pressure}</span>
          </div>
          <div className="text-base font-extrabold text-[var(--foreground)] font-mono">
            {current.pressure !== undefined ? `${current.pressure} hPa` : '--'}
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
            {current.pressure > 1013 ? 'High (Stable)' : 'Low (Variable)'}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
