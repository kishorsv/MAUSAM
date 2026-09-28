'use client';

/**
 * MAUSAM — REGIONAL WEATHER MAP COMPONENT WRAPPER
 * Exports the modular GoogleWeatherMap implementation while preserving backward compatibility.
 */
export * from './GoogleWeatherMap';
export { GoogleWeatherMap as WeatherMapComponent } from './GoogleWeatherMap';
export type { GoogleWeatherMapProps as WeatherMapProps } from './GoogleWeatherMap';
