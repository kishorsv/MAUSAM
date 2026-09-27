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
  const { visualState, tokens } = useTheme();
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
    <div 
      className={`relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border shadow-2xl transition-all duration-500 ${visualState.glassBorderClass}`}
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)'
      }}
    >
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
      <div 
        className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-2xl border relative z-10"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: visualState.accentColor }} />
          <span className="text-xs font-bold tracking-wide flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
            <span style={{ color: 'var(--foreground-muted)' }}>Atmosphere:</span>
            <span style={{ color: visualState.accentColor }}>{visualState.heroHeadline}</span>
          </span>
        </div>
        <p className="text-[11px] hidden lg:block max-w-md truncate" style={{ color: 'var(--foreground-muted)' }}>
          {visualState.atmosphereNote}
        </p>
        <div className="flex items-center gap-3 text-[11px] font-mono ml-auto sm:ml-0" style={{ color: 'var(--foreground-muted)' }}>
          <span className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-amber-400" /> {sunriseTime}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-rose-400" /> {sunsetTime}</span>
        </div>
      </div>

      {/* Top Meta: Location, Updated, Provider */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="group flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: 'var(--primary)' }} />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {location.name}
            </h1>
            {location.region && (
              <span className="text-sm font-normal" style={{ color: 'var(--foreground-muted)' }}>
                , {location.region}
              </span>
            )}
            {location.country && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full border ml-1 font-semibold"
                style={{ background: 'var(--border-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {location.country}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--foreground-muted)' }}>
          <span>{t.lastUpdated}: {formatTimeAgo(weather.fetchedAt)}</span>
          <span>•</span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{weather.provider}</span>
        </div>
      </div>

      {/* Hero Temperature & Condition Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 mb-8">
        <div className="md:col-span-7 flex items-center gap-6 sm:gap-8">
          <div 
            className="shrink-0 p-3 sm:p-4 rounded-3xl border shadow-inner backdrop-blur-md"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
          >
            {getWeatherIcon(current.wmoCode, current.isDay)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold tracking-tighter" style={{ color: 'var(--foreground)' }}>
                {formatTemperature(current.temperature, unit)}
              </span>
            </div>
            <div className="text-base sm:text-lg font-semibold mt-1 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <span>{current.condition}</span>
            </div>
            <div className="text-xs sm:text-sm mt-0.5 font-medium" style={{ color: 'var(--foreground-muted)' }}>
              {t.feelsLike} <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{formatTemperature(current.feelsLike, unit)}</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights / High-Low */}
        <div 
          className="md:col-span-5 flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span style={{ color: 'var(--foreground-muted)' }}>Today&apos;s Range</span>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
              {weather.daily[0] ? `${formatTemperature(weather.daily[0].temperatureMin, unit)} / ${formatTemperature(weather.daily[0].temperatureMax, unit)}` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span style={{ color: 'var(--foreground-muted)' }}>{t.rainProbability}</span>
            <span className="font-semibold" style={{ color: weather.hourly[0]?.precipitationProbability > 40 ? 'var(--primary)' : 'var(--foreground)' }}>
              {weather.hourly[0]?.precipitationProbability ?? 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span style={{ color: 'var(--foreground-muted)' }}>Atmospheric Air</span>
            <span className="font-semibold text-emerald-400">
              {weather.airQuality ? `AQI ${weather.airQuality.aqi} • ${weather.airQuality.status}` : t.dataUnavailable}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Strip */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10 pt-4 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {/* Wind */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Wind className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span>{t.wind}</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {formatWindSpeed(current.windSpeed, windUnit)}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            Dir {current.windDirection}°
          </div>
        </div>

        {/* Humidity */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.humidity}</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {current.humidity}%
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            {current.humidity > 70 ? 'High Moisture' : 'Comfortable'}
          </div>
        </div>

        {/* UV Index */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.uvIndex}</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {current.uvIndex} / 12
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
          </div>
        </div>

        {/* Visibility */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.visibility}</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {current.visibility} km
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            {current.visibility >= 8 ? 'Clear View' : 'Haze/Fog'}
          </div>
        </div>

        {/* Pressure */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Gauge className="w-3.5 h-3.5 text-violet-400" />
            <span>{t.pressure}</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {current.pressure} hPa
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            Barometric
          </div>
        </div>

        {/* Precipitation */}
        <div 
          className="p-3 rounded-2xl border transition-colors hover:border-opacity-60"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Precipitation</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {current.precipitation} mm
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
            {current.precipitation > 0 ? 'Active Rain' : 'Dry Surface'}
          </div>
        </div>
      </div>
    </div>
  );
}
