'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeId, 
  ThemeMode, 
  MotionPreference, 
  WeatherEffectsPreference, 
  WeatherVisualState, 
  ThemeTokens,
  AVAILABLE_THEMES 
} from '@/lib/theme/types';
import { weatherMotionEngine } from '@/lib/theme/weather-motion-engine';
import { getThemeTokens } from '@/lib/theme/tokens';
import { WeatherPayload } from '@/lib/weather/types';

interface ThemeContextType {
  theme: ThemeId;
  mode: ThemeMode;
  resolvedMode: 'dark' | 'light';
  motion: MotionPreference;
  weatherEffects: WeatherEffectsPreference;
  visualState: WeatherVisualState;
  tokens: ThemeTokens;
  isThemeModalOpen: boolean;
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  setMotion: (motion: MotionPreference) => void;
  setWeatherEffects: (effects: WeatherEffectsPreference) => void;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  setWeatherForTheme: (weather: WeatherPayload | null) => void;
}

const defaultTheme: ThemeId = 'midnight-ai';
const defaultMode: ThemeMode = 'dark';
const defaultTokens = getThemeTokens(defaultTheme, 'dark');
const defaultVisualState = weatherMotionEngine.calculateVisualState(null, defaultTheme, 'dark');

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  mode: defaultMode,
  resolvedMode: 'dark',
  motion: 'auto',
  weatherEffects: 'enabled',
  visualState: defaultVisualState,
  tokens: defaultTokens,
  isThemeModalOpen: false,
  setTheme: () => {},
  setMode: () => {},
  setMotion: () => {},
  setWeatherEffects: () => {},
  openThemeModal: () => {},
  closeThemeModal: () => {},
  setWeatherForTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme);
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(true);
  const [motion, setMotionState] = useState<MotionPreference>('auto');
  const [weatherEffects, setWeatherEffectsState] = useState<WeatherEffectsPreference>('enabled');
  const [currentWeather, setCurrentWeather] = useState<WeatherPayload | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Detect OS system dark/light preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Compute resolved mode ('dark' or 'light')
  const resolvedMode: 'dark' | 'light' = useMemo(() => {
    if (mode === 'auto') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemPrefersDark]);

  // Load persisted theme, mode, motion from localStorage or user API on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mausam-theme') as ThemeId | null;
      if (savedTheme && (AVAILABLE_THEMES.some(t => t.id === savedTheme) || savedTheme === 'aurora' || savedTheme === 'earth' || savedTheme === 'nature' || savedTheme === 'glass' || savedTheme === 'living-weather')) {
        setThemeState(savedTheme);
      }

      const savedMode = localStorage.getItem('mausam-mode') as ThemeMode | null;
      if (savedMode && (savedMode === 'dark' || savedMode === 'light' || savedMode === 'auto')) {
        setModeState(savedMode);
      }

      const savedMotion = localStorage.getItem('mausam-motion') as MotionPreference | null;
      if (savedMotion) {
        setMotionState(savedMotion);
      }

      const savedEffects = localStorage.getItem('mausam-effects') as WeatherEffectsPreference | null;
      if (savedEffects) {
        setWeatherEffectsState(savedEffects);
      }
    }
  }, []);

  // Apply CSS custom properties and data attributes globally to documentElement
  const tokens = useMemo(() => getThemeTokens(theme, resolvedMode), [theme, resolvedMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', resolvedMode);

    if (resolvedMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    // Set CSS custom variables dynamically for real-time instant rendering
    root.style.setProperty('--background', tokens.background);
    root.style.setProperty('--background-secondary', tokens.backgroundSecondary);
    root.style.setProperty('--surface', tokens.surface);
    root.style.setProperty('--surface-elevated', tokens.surfaceElevated);
    root.style.setProperty('--surface-glass', tokens.surfaceGlass);
    root.style.setProperty('--foreground', tokens.foreground);
    root.style.setProperty('--foreground-muted', tokens.foregroundMuted);
    root.style.setProperty('--primary', tokens.primary);
    root.style.setProperty('--primary-hover', tokens.primaryHover);
    root.style.setProperty('--secondary', tokens.secondary);
    root.style.setProperty('--accent', tokens.accent);
    root.style.setProperty('--border', tokens.border);
    root.style.setProperty('--border-subtle', tokens.borderSubtle);
    root.style.setProperty('--shadow', tokens.shadow);
    root.style.setProperty('--glow', tokens.glow);
    root.style.setProperty('--success', tokens.success);
    root.style.setProperty('--warning', tokens.warning);
    root.style.setProperty('--danger', tokens.danger);
    root.style.setProperty('--info', tokens.info);
    root.style.setProperty('--chart-primary', tokens.chartPrimary);
    root.style.setProperty('--chart-secondary', tokens.chartSecondary);
    root.style.setProperty('--map-accent', tokens.mapAccent);
  }, [theme, resolvedMode, tokens]);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausam-theme', newTheme);
    }
    try {
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      }).catch(() => {});
    } catch {
      // Ignore network errors on background persistence
    }
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausam-mode', newMode);
    }
    try {
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_mode: newMode })
      }).catch(() => {});
    } catch {
      // Ignore network errors
    }
  }, []);

  const setMotion = useCallback((newMotion: MotionPreference) => {
    setMotionState(newMotion);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausam-motion', newMotion);
    }
    try {
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motion_preference: newMotion })
      }).catch(() => {});
    } catch {
      // Ignore network errors
    }
  }, []);

  const setWeatherEffects = useCallback((effects: WeatherEffectsPreference) => {
    setWeatherEffectsState(effects);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausam-effects', effects);
    }
    try {
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather_effects: effects })
      }).catch(() => {});
    } catch {
      // Ignore network errors
    }
  }, []);

  const visualState = useMemo(() => {
    return weatherMotionEngine.calculateVisualState(currentWeather, theme, resolvedMode);
  }, [currentWeather, theme, resolvedMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        resolvedMode,
        motion,
        weatherEffects,
        visualState,
        tokens,
        isThemeModalOpen,
        setTheme,
        setMode,
        setMotion,
        setWeatherEffects,
        openThemeModal: () => setIsThemeModalOpen(true),
        closeThemeModal: () => setIsThemeModalOpen(false),
        setWeatherForTheme: setCurrentWeather
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
