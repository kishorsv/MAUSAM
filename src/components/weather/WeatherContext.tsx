'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WeatherPayload, WeatherLocation } from '@/lib/weather/types';
import { useLocation } from '@/components/location/LocationContext';
import { useTheme } from '@/components/theme/ThemeContext';
import { weatherSceneController } from '@/lib/theme/weather-scene-controller';

export type WeatherDashboardStatus = 'LOADING' | 'READY' | 'STALE' | 'ERROR' | 'OFFLINE';

export interface WeatherError {
  code: string;
  message: string;
  retryable: boolean;
}

interface WeatherContextType {
  weather: WeatherPayload | null;
  status: WeatherDashboardStatus;
  error: WeatherError | null;
  isRefreshing: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  refreshWeather: () => Promise<void>;
  retry: () => void;
}

const WeatherContext = createContext<WeatherContextType>({
  weather: null,
  status: 'LOADING',
  error: null,
  isRefreshing: false,
  isOffline: false,
  lastUpdated: null,
  refreshWeather: async () => {},
  retry: () => {}
});

// Central inflight promise map for request deduplication
const inflightPromises = new Map<string, Promise<WeatherPayload>>();

// Local storage cache key helper
const getCacheKey = (lat: number, lon: number) => `mausam_weather_cache_${lat.toFixed(3)}_${lon.toFixed(3)}`;

// Save to client localStorage cache
const saveToLocalCache = (lat: number, lon: number, payload: WeatherPayload) => {
  try {
    localStorage.setItem(getCacheKey(lat, lon), JSON.stringify({
      payload,
      cachedAt: new Date().toISOString()
    }));
  } catch {}
};

// Retrieve from client localStorage cache
const getFromLocalCache = (lat: number, lon: number): { payload: WeatherPayload; cachedAt: string } | null => {
  try {
    const raw = localStorage.getItem(getCacheKey(lat, lon));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { currentLocation } = useLocation();
  const { setWeatherForTheme } = useTheme();

  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [status, setStatus] = useState<WeatherDashboardStatus>('LOADING');
  const [error, setError] = useState<WeatherError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevCoordsRef = useRef<string>('');

  /**
   * Central fetcher with Deduplication, Timeout, and Retry
   */
  const fetchWeatherDeduplicated = useCallback(
    async (
      lat: number,
      lon: number,
      name?: string,
      region?: string,
      country?: string,
      bypassCache: boolean = false
    ): Promise<WeatherPayload> => {
      const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}${bypassCache ? '_fresh' : ''}`;

      // 1. Request Deduplication: Return existing inflight promise if already fetching
      if (inflightPromises.has(coordKey)) {
        return inflightPromises.get(coordKey)!;
      }

      const fetchPromise = (async () => {
        const queryParams = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString()
        });
        if (name) queryParams.set('name', name);
        if (region) queryParams.set('region', region);
        if (country) queryParams.set('country', country);
        if (bypassCache) queryParams.set('refresh', 'true');

        // Request timeout of 8 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const endpoint = bypassCache ? '/api/weather/refresh' : `/api/weather/current?${queryParams.toString()}`;
          const res = bypassCache
            ? await fetch('/api/weather/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon, name, region, country }),
                signal: controller.signal
              })
            : await fetch(endpoint, { signal: controller.signal });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData?.error?.message || errData?.error || `HTTP ${res.status}`);
          }

          const data: WeatherPayload = await res.json();
          return data;
        } finally {
          clearTimeout(timeoutId);
          inflightPromises.delete(coordKey);
        }
      })();

      inflightPromises.set(coordKey, fetchPromise);
      return fetchPromise;
    },
    []
  );

  /**
   * Main weather loader triggered when currentLocation changes or on manual refresh
   */
  const loadWeather = useCallback(
    async (bypassCache: boolean = false) => {
      const { latitude, longitude, city, locality, state, country } = currentLocation;
      const coordId = `${latitude},${longitude}`;

      // Check online status
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        setStatus('OFFLINE');
        const cached = getFromLocalCache(latitude, longitude);
        if (cached) {
          setWeather({ ...cached.payload, cached: true });
          setLastUpdated(cached.cachedAt);
        } else {
          setError({
            code: 'OFFLINE_NO_CACHE',
            message: 'You are currently offline and no cached weather data exists for this location.',
            retryable: true
          });
        }
        return;
      }

      setIsOffline(false);
      if (bypassCache) {
        setIsRefreshing(true);
      } else {
        // Fast local cache paint if available
        const cached = getFromLocalCache(latitude, longitude);
        if (cached && !weather) {
          setWeather({ ...cached.payload, cached: true });
          setStatus('READY');
          setLastUpdated(cached.cachedAt);
        } else if (!weather) {
          setStatus('LOADING');
        }
      }

      setError(null);

      try {
        const payload = await fetchWeatherDeduplicated(
          latitude,
          longitude,
          city,
          locality || state,
          country,
          bypassCache
        );

        setWeather(payload);
        setStatus('READY');
        setLastUpdated(payload.fetchedAt || new Date().toISOString());
        saveToLocalCache(latitude, longitude, payload);

        // Synchronize with visual themes & cinematic weather world
        setWeatherForTheme(payload);
        weatherSceneController.updateWeather(payload);
      } catch (err: any) {
        // Check if we have cached fallback
        const cached = getFromLocalCache(latitude, longitude);
        if (cached) {
          setWeather({ ...cached.payload, cached: true });
          setStatus('STALE');
          setLastUpdated(cached.cachedAt);
        } else {
          setStatus('ERROR');
          setError({
            code: 'WEATHER_FETCH_FAILED',
            message: err.message || 'Weather data temporarily unavailable.',
            retryable: true
          });
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [currentLocation, fetchWeatherDeduplicated, setWeatherForTheme, weather]
  );

  // Manual refresh action
  const refreshWeather = useCallback(async () => {
    await loadWeather(true);
  }, [loadWeather]);

  const retry = useCallback(() => {
    loadWeather(false);
  }, [loadWeather]);

  // Reactive Effect: Fetch weather when currentLocation changes
  useEffect(() => {
    const coords = `${currentLocation.latitude},${currentLocation.longitude}`;
    if (coords !== prevCoordsRef.current) {
      prevCoordsRef.current = coords;
      loadWeather(false);
    }
  }, [currentLocation, loadWeather]);

  // Periodic Refresh Effect (every 10 minutes)
  useEffect(() => {
    periodicTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        loadWeather(false);
      }
    }, 600000); // 10 minutes

    return () => {
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
    };
  }, [loadWeather]);

  // Browser Network Connectivity Monitor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      loadWeather(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadWeather]);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        status,
        error,
        isRefreshing,
        isOffline,
        lastUpdated,
        refreshWeather,
        retry
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
