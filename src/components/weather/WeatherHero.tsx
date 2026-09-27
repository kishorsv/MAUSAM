import React from 'react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, 
  Compass, Eye, Gauge, ShieldAlert, Sparkles, Navigation,
  Sunrise, Sunset
} from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature, formatWindSpeed, formatTimeAgo } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n/translations';
import { useTheme } from '@/components/theme/ThemeContext';

interface WeatherHeroProps {
  weather: WeatherPayload;
  unit?: 'celsius' | 'fahrenheit';
  windUnit?: 'kmh' | 'mph' | 'ms';
  language?: Language;
  onRefresh?: () => void;
  onOpenSearch?: () => void;
}

export function WeatherHero({
  weather,
  unit = 'celsius',
  windUnit = 'kmh',
  language = 'en',
  onRefresh,
  onOpenSearch
}: WeatherHeroProps) {
  const { visualState } = useTheme();
  const t = translations[language] || translations.en;
  const current = weather.current;
  const location = weather.location;

  const sunriseTime = weather.daily[0]?.sunrise 
    ? (weather.daily[0].sunrise.includes('T') ? weather.daily[0].sunrise.slice(11, 16) : weather.daily[0].sunrise) 
    : '06:12';
  const sunsetTime = weather.daily[0]?.sunset 
    ? (weather.daily[0].sunset.includes('T') ? weather.daily[0].sunset.slice(11, 16) : weather.daily[0].sunset) 
    : '18:25';

  const getWeatherIcon = (wmoCode: number, isDay: boolean) => {
    if (wmoCode === 0 || wmoCode === 1) {
      return isDay ? <Sun className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 animate-pulse-slow" /> : <Sun className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-300" />;
    }
    if (wmoCode >= 2 && wmoCode <= 3) {
      return <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" />;
    }
    if ((wmoCode >= 51 && wmoCode <= 67) || (wmoCode >= 80 && wmoCode <= 82)) {
      return <CloudRain className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" />;
    }
    if (wmoCode >= 95) {
      return <CloudLightning className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400" />;
    }
    return <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" />;
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border shadow-2xl transition-all duration-500 ${visualState.glassBorderClass}`}>
      {/* Decorative background atmospheric blur */}
      <div 
        className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" 
        style={{ background: visualState.accentColor }}
      />
      <div 
        className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: visualState.accentColor }}
      />

      {/* Live Atmospheric Real-Time Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: visualState.accentColor }} />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <span className="text-slate-400 font-normal">Atmosphere:</span>
            <span style={{ color: visualState.accentColor }}>{visualState.heroHeadline}</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 hidden lg:block max-w-md truncate">
          {visualState.atmosphereNote}
        </p>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 ml-auto sm:ml-0">
          <span className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-amber-400" /> {sunriseTime}</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-rose-400" /> {sunsetTime}</span>
        </div>
      </div>

      {/* Top Meta: Location, Updated, Provider */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="group flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Navigation className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {location.name}
            </h1>
            {location.region && (
              <span className="text-sm text-slate-400 font-normal">
                , {location.region}
              </span>
            )}
            {location.country && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 ml-1">
                {location.country}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{t.lastUpdated}: {formatTimeAgo(weather.fetchedAt)}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">{weather.provider}</span>
        </div>
      </div>

      {/* Hero Temperature & Condition Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 mb-8">
        <div className="md:col-span-7 flex items-center gap-6 sm:gap-8">
          <div className="shrink-0 p-3 sm:p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            {getWeatherIcon(current.wmoCode, current.isDay)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white">
                {formatTemperature(current.temperature, unit)}
              </span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-slate-200 mt-1 flex items-center gap-2">
              <span>{current.condition}</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
              {t.feelsLike} <span className="text-slate-200 font-semibold">{formatTemperature(current.feelsLike, unit)}</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights / High-Low */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400">Today&apos;s Range</span>
            <span className="font-semibold text-slate-200">
              {weather.daily[0] ? `${formatTemperature(weather.daily[0].temperatureMin, unit)} / ${formatTemperature(weather.daily[0].temperatureMax, unit)}` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400">{t.rainProbability}</span>
            <span className={`font-semibold ${weather.hourly[0]?.precipitationProbability > 40 ? 'text-cyan-400' : 'text-slate-200'}`}>
              {weather.hourly[0]?.precipitationProbability ?? 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400">Atmospheric Air</span>
            <span className="font-semibold text-emerald-400">
              {weather.airQuality ? `AQI ${weather.airQuality.aqi} • ${weather.airQuality.status}` : t.dataUnavailable}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Strip (8px spacing, clean modern glass cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10 pt-4 border-t border-white/5">
        {/* Wind */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Wind className="w-3.5 h-3.5 text-primary-400" />
            <span>{t.wind}</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {formatWindSpeed(current.windSpeed, windUnit)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Dir {current.windDirection}°
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.humidity}</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {current.humidity}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.humidity > 70 ? 'High Moisture' : 'Comfortable'}
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.uvIndex}</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {current.uvIndex} / 12
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
          </div>
        </div>

        {/* Visibility */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.visibility}</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {current.visibility} km
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.visibility >= 8 ? 'Clear View' : 'Haze/Fog'}
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-violet-400" />
            <span>{t.pressure}</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {current.pressure} hPa
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Barometric
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Precipitation</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {current.precipitation} mm
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {current.precipitation > 0 ? 'Active Rain' : 'Dry Surface'}
          </div>
        </div>
      </div>
    </div>
  );
}
