import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  if (isNaN(celsius)) return '--';
  if (unit === 'fahrenheit') {
    const fahrenheit = Math.round((celsius * 9) / 5 + 32);
    return `${fahrenheit}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms' = 'kmh'): string {
  if (isNaN(kmh)) return '--';
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${Math.round(kmh / 3.6)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatTimeAgo(dateStringOrTimestamp: string | number): string {
  const date = new Date(dateStringOrTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function getWmoWeatherDescription(code: number): { description: string; category: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' } {
  switch (code) {
    case 0:
      return { description: 'Clear Sky', category: 'sunny' };
    case 1:
      return { description: 'Mainly Clear', category: 'sunny' };
    case 2:
      return { description: 'Partly Cloudy', category: 'cloudy' };
    case 3:
      return { description: 'Overcast', category: 'cloudy' };
    case 45:
    case 48:
      return { description: 'Fog / Mist', category: 'fog' };
    case 51:
    case 53:
    case 55:
      return { description: 'Drizzle', category: 'rain' };
    case 61:
    case 63:
    case 65:
      return { description: 'Rain', category: 'rain' };
    case 71:
    case 73:
    case 75:
      return { description: 'Snowfall', category: 'snow' };
    case 80:
    case 81:
    case 82:
      return { description: 'Rain Showers', category: 'rain' };
    case 95:
      return { description: 'Thunderstorm', category: 'storm' };
    case 96:
    case 99:
      return { description: 'Severe Thunderstorm & Hail', category: 'storm' };
    default:
      return { description: 'Variable Weather', category: 'cloudy' };
  }
}

export function getAqiCategory(aqi: number): { label: string; color: string; level: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous' } {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-500', level: 'good' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-amber-400', level: 'moderate' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-500', level: 'unhealthy-sensitive' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-rose-500', level: 'unhealthy' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500', level: 'very-unhealthy' };
  return { label: 'Hazardous', color: 'text-red-700', level: 'hazardous' };
}

export function getUvCategory(uv: number): { label: string; color: string; advice: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', advice: 'No protection required.' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', advice: 'Wear sunglasses & sun protection on bright days.' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', advice: 'Protection required. Seek shade during midday.' };
  if (uv <= 10) return { label: 'Very High', color: 'text-rose-500', advice: 'Extra protection needed. Avoid direct sun between 11 AM - 3 PM.' };
  return { label: 'Extreme', color: 'text-purple-600', advice: 'Take full precautions. Unprotected skin can burn rapidly.' };
}
