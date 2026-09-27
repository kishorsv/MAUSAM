'use client';

import React from 'react';

export type WeatherIconType = 
  | 'sun' 
  | 'moon' 
  | 'cloud' 
  | 'partly-cloudy-day' 
  | 'partly-cloudy-night' 
  | 'rain' 
  | 'heavy-rain' 
  | 'storm' 
  | 'snow' 
  | 'wind' 
  | 'fog';

interface AnimatedWeatherIconProps {
  type?: WeatherIconType;
  wmoCode?: number;
  isDay?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}

export function AnimatedWeatherIcon({
  type,
  wmoCode,
  isDay = true,
  className = '',
  size = 'md'
}: AnimatedWeatherIconProps) {
  // Map WMO code to icon type if not provided
  let resolvedType: WeatherIconType = type || 'sun';
  if (wmoCode !== undefined) {
    if (wmoCode === 0 || wmoCode === 1) {
      resolvedType = isDay ? 'sun' : 'moon';
    } else if (wmoCode === 2) {
      resolvedType = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    } else if (wmoCode === 3) {
      resolvedType = 'cloud';
    } else if (wmoCode === 45 || wmoCode === 48) {
      resolvedType = 'fog';
    } else if (wmoCode >= 51 && wmoCode <= 55) {
      resolvedType = 'rain';
    } else if (wmoCode >= 61 && wmoCode <= 67) {
      resolvedType = 'rain';
    } else if (wmoCode >= 71 && wmoCode <= 77) {
      resolvedType = 'snow';
    } else if (wmoCode >= 80 && wmoCode <= 82) {
      resolvedType = 'heavy-rain';
    } else if (wmoCode >= 85 && wmoCode <= 86) {
      resolvedType = 'snow';
    } else if (wmoCode >= 95) {
      resolvedType = 'storm';
    } else {
      resolvedType = 'cloud';
    }
  }

  // Dimension scaling
  let sizeClasses = 'w-10 h-10';
  if (size === 'sm') sizeClasses = 'w-6 h-6';
  if (size === 'md') sizeClasses = 'w-10 h-10';
  if (size === 'lg') sizeClasses = 'w-16 h-16';
  if (size === 'xl') sizeClasses = 'w-20 h-20';
  if (size === 'hero') sizeClasses = 'w-24 h-24 sm:w-28 sm:h-28';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      {/* 1. SUN ICON */}
      {resolvedType === 'sun' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="sunBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Animated rotating sun rays */}
          <g className="animate-[spin_20s_linear_infinite] origin-center">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="32"
                y1="8"
                x2="32"
                y2="14"
                stroke="#fbbf24"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${angle} 32 32)`}
                className="opacity-90 animate-pulse"
              />
            ))}
          </g>
          {/* Sun center core */}
          <circle
            cx="32"
            cy="32"
            r="13"
            fill="url(#sunGlow)"
            filter="url(#sunBlur)"
            className="animate-pulse-slow"
          />
        </svg>
      )}

      {/* 2. MOON ICON */}
      {resolvedType === 'moon' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="moonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <path
            d="M38 14 A18 18 0 1 0 50 46 A22 22 0 0 1 38 14 Z"
            fill="url(#moonGlow)"
            className="drop-shadow-[0_0_12px_rgba(129,140,248,0.6)] animate-pulse-slow"
          />
          <circle cx="20" cy="22" r="1.5" fill="#f8fafc" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="48" cy="18" r="1.2" fill="#f8fafc" className="animate-pulse" style={{ animationDuration: '2s' }} />
        </svg>
      )}

      {/* 3. CLOUD ICON */}
      {resolvedType === 'cloud' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <g className="animate-[float_5s_ease-in-out_infinite]">
            <path
              d="M18 44 h28 a12 12 0 0 0 0 -24 a16 16 0 0 0 -30 -3 a10 10 0 0 0 2 27 z"
              fill="url(#cloudGrad)"
              className="drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
            />
          </g>
        </svg>
      )}

      {/* 4. PARTLY CLOUDY (DAY) */}
      {resolvedType === 'partly-cloudy-day' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="sunPartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="cloudPartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <circle
            cx="40"
            cy="24"
            r="11"
            fill="url(#sunPartGrad)"
            className="animate-pulse-slow drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <g className="animate-[float_4s_ease-in-out_infinite]">
            <path
              d="M16 46 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 -2 a8 8 0 0 0 -2 22 z"
              fill="url(#cloudPartGrad)"
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          </g>
        </svg>
      )}

      {/* 5. PARTLY CLOUDY (NIGHT) */}
      {resolvedType === 'partly-cloudy-night' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="moonPartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="cloudNightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <path
            d="M40 18 A10 10 0 1 0 46 36 A12 12 0 0 1 40 18 Z"
            fill="url(#moonPartGrad)"
            className="drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]"
          />
          <g className="animate-[float_4s_ease-in-out_infinite]">
            <path
              d="M16 46 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 -2 a8 8 0 0 0 -2 22 z"
              fill="url(#cloudNightGrad)"
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          </g>
        </svg>
      )}

      {/* 6. RAIN ICON */}
      {(resolvedType === 'rain' || resolvedType === 'heavy-rain') && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <path
            d="M16 34 h32 a10 10 0 0 0 0 -20 a14 14 0 0 0 -28 -2 a9 9 0 0 0 -4 22 z"
            fill="url(#rainCloudGrad)"
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          />
          {/* Animated Falling Rain Drops */}
          <line
            x1="22"
            y1="40"
            x2="19"
            y2="50"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-rain-1"
          />
          <line
            x1="32"
            y1="40"
            x2="29"
            y2="52"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-rain-2"
          />
          <line
            x1="42"
            y1="40"
            x2="39"
            y2="49"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-rain-3"
          />
        </svg>
      )}

      {/* 7. STORM ICON */}
      {resolvedType === 'storm' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <path
            d="M16 34 h32 a10 10 0 0 0 0 -20 a14 14 0 0 0 -28 -2 a9 9 0 0 0 -4 22 z"
            fill="url(#stormCloudGrad)"
            className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] animate-pulse"
          />
          {/* Lightning Bolt */}
          <polygon
            points="31,34 26,45 32,45 29,56 39,43 33,43 36,34"
            fill="#facc15"
            className="drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-[pulse_1s_ease-in-out_infinite]"
          />
          {/* Rain streaks */}
          <line x1="20" y1="42" x2="17" y2="52" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="animate-rain-1 opacity-80" />
          <line x1="44" y1="42" x2="41" y2="51" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="animate-rain-3 opacity-80" />
        </svg>
      )}

      {/* 8. SNOW ICON */}
      {resolvedType === 'snow' && (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <path
            d="M16 34 h32 a10 10 0 0 0 0 -20 a14 14 0 0 0 -28 -2 a9 9 0 0 0 -4 22 z"
            fill="#cbd5e1"
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          />
          {/* Falling snowflakes */}
          <g className="text-cyan-200">
            <circle cx="22" cy="44" r="2" fill="currentColor" className="animate-pulse" />
            <circle cx="32" cy="49" r="2.5" fill="currentColor" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            <circle cx="42" cy="43" r="1.8" fill="currentColor" className="animate-pulse" />
            <circle cx="27" cy="54" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="37" cy="55" r="1.8" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          </g>
        </svg>
      )}

      {/* 9. WIND ICON */}
      {resolvedType === 'wind' && (
        <svg viewBox="0 0 64 64" className="w-full h-full" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M12 24 h26 a6 6 0 1 0 -6 -6" className="animate-[dash_3s_linear_infinite]" />
          <path d="M8 32 h34 a7 7 0 1 1 -7 7" className="animate-[dash_2.5s_linear_infinite]" />
          <path d="M16 40 h18 a5 5 0 1 0 -5 -5" className="animate-[dash_3.5s_linear_infinite]" />
        </svg>
      )}

      {/* 10. FOG ICON */}
      {resolvedType === 'fog' && (
        <svg viewBox="0 0 64 64" className="w-full h-full" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <line x1="14" y1="24" x2="50" y2="24" className="opacity-70 animate-pulse" />
          <line x1="10" y1="32" x2="54" y2="32" className="opacity-90 animate-pulse" style={{ animationDuration: '3s' }} />
          <line x1="18" y1="40" x2="46" y2="40" className="opacity-80 animate-pulse" style={{ animationDuration: '2s' }} />
          <line x1="12" y1="48" x2="52" y2="48" className="opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
        </svg>
      )}
    </div>
  );
}
