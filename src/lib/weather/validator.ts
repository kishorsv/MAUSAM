import { WeatherPayload, CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherLocation } from './types';
import { getWmoCondition } from './wmo';

export interface ValidatedWeatherResponse {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    locality?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
  weather: {
    temperature: number | null;
    feelsLike: number | null;
    humidity: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    rain: number | null;
    precipitation: number | null;
    precipitationProbability: number | null;
    weatherCode: number | null;
    condition: string;
    cloudCover: number | null;
    uvIndex: number | null;
    visibility: number | null;
    pressure: number | null;
  };
  airQuality?: {
    aqi: number | null;
    category: string;
    status: string;
    dominantPollutant?: string;
  };
  hourly: Array<{
    time: string;
    temperature: number | null;
    feelsLike: number | null;
    precipitationProbability: number | null;
    precipitation: number | null;
    rain: number | null;
    windSpeed: number | null;
    uvIndex: number | null;
    humidity: number | null;
    weatherCode: number | null;
    condition: string;
    isDay: boolean;
  }>;
  daily: Array<{
    date: string;
    temperatureMin: number | null;
    temperatureMax: number | null;
    precipitationProbability: number | null;
    precipitationSum: number | null;
    rainSum: number | null;
    sunrise: string;
    sunset: string;
    weatherCode: number | null;
    condition: string;
  }>;
  alerts: WeatherPayload['alerts'];
  updatedAt: string;
  source: string;
  cached: boolean;
  payload: WeatherPayload; // Retain full validated payload for existing consumers
}

export class WeatherValidator {
  /**
   * Safe number sanitizer: returns null if undefined, NaN, or non-finite
   */
  static safeNumber(val: any, decimals: number = 0): number | null {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) return null;
    if (decimals === 0) return Math.round(num);
    return Number(num.toFixed(decimals));
  }

  /**
   * Safe display string: returns '--' if null or undefined or NaN
   */
  static safeDisplay(val: any, unit: string = ''): string {
    const num = this.safeNumber(val);
    if (num === null) return '--';
    return `${num}${unit}`;
  }

  /**
   * Validate coordinates
   */
  static validateCoordinates(lat: number, lon: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  /**
   * Validate and sanitize entire WeatherPayload into consistent API structure
   */
  static validatePayload(payload: WeatherPayload): ValidatedWeatherResponse {
    const current = payload.current || ({} as CurrentWeather);
    const loc = payload.location || ({} as WeatherLocation);
    const wmo = typeof current.wmoCode === 'number' ? getWmoCondition(current.wmoCode) : getWmoCondition(2);

    const safeHourly = Array.isArray(payload.hourly)
      ? payload.hourly.slice(0, 24).map((h) => {
          const hWmo = typeof h.wmoCode === 'number' ? getWmoCondition(h.wmoCode) : getWmoCondition(2);
          return {
            time: h.time || new Date().toISOString(),
            temperature: this.safeNumber(h.temperature),
            feelsLike: this.safeNumber(h.feelsLike),
            precipitationProbability: this.safeNumber(h.precipitationProbability),
            precipitation: this.safeNumber(h.precipitation, 1),
            rain: this.safeNumber(h.rain, 1),
            windSpeed: this.safeNumber(h.windSpeed),
            uvIndex: this.safeNumber(h.uvIndex),
            humidity: this.safeNumber(h.humidity),
            weatherCode: typeof h.wmoCode === 'number' ? h.wmoCode : null,
            condition: h.condition || hWmo.condition,
            isDay: Boolean(h.isDay)
          };
        })
      : [];

    const safeDaily = Array.isArray(payload.daily)
      ? payload.daily.slice(0, 7).map((d) => {
          const dWmo = typeof d.wmoCode === 'number' ? getWmoCondition(d.wmoCode) : getWmoCondition(2);
          return {
            date: d.date || new Date().toISOString().slice(0, 10),
            temperatureMin: this.safeNumber(d.temperatureMin),
            temperatureMax: this.safeNumber(d.temperatureMax),
            precipitationProbability: this.safeNumber(d.precipitationProbability),
            precipitationSum: this.safeNumber(d.precipitationSum, 1),
            rainSum: this.safeNumber(d.rainSum, 1),
            sunrise: d.sunrise || '--:--',
            sunset: d.sunset || '--:--',
            weatherCode: typeof d.wmoCode === 'number' ? d.wmoCode : null,
            condition: d.condition || dWmo.condition
          };
        })
      : [];

    return {
      success: true,
      location: {
        latitude: this.safeNumber(loc.lat, 4) || 0,
        longitude: this.safeNumber(loc.lon, 4) || 0,
        city: loc.name || 'Current Location',
        locality: loc.region,
        state: loc.region,
        country: loc.country || '',
        timezone: loc.timezone || 'auto'
      },
      weather: {
        temperature: this.safeNumber(current.temperature),
        feelsLike: this.safeNumber(current.feelsLike),
        humidity: this.safeNumber(current.humidity),
        windSpeed: this.safeNumber(current.windSpeed),
        windDirection: this.safeNumber(current.windDirection),
        rain: this.safeNumber(current.rain, 1),
        precipitation: this.safeNumber(current.precipitation, 1),
        precipitationProbability: safeHourly[0]?.precipitationProbability ?? null,
        weatherCode: typeof current.wmoCode === 'number' ? current.wmoCode : null,
        condition: current.condition || wmo.condition,
        cloudCover: this.safeNumber(current.cloudCover),
        uvIndex: this.safeNumber(current.uvIndex),
        visibility: this.safeNumber(current.visibility, 1),
        pressure: this.safeNumber(current.pressure)
      },
      airQuality: payload.airQuality
        ? {
            aqi: this.safeNumber(payload.airQuality.aqi),
            category: payload.airQuality.category || 'moderate',
            status: payload.airQuality.status || 'Moderate',
            dominantPollutant: payload.airQuality.dominantPollutant
          }
        : undefined,
      hourly: safeHourly,
      daily: safeDaily,
      alerts: Array.isArray(payload.alerts) ? payload.alerts : [],
      updatedAt: payload.fetchedAt || new Date().toISOString(),
      source: payload.provider || 'Open-Meteo / IMD-ECMWF Core',
      cached: Boolean(payload.cached),
      payload
    };
  }
}
