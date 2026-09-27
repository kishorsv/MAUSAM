'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, WeatherVisualState, AVAILABLE_THEMES } from '@/lib/theme/types';
import { weatherMotionEngine } from '@/lib/theme/weather-motion-engine';
import { WeatherPayload } from '@/lib/weather/types';

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  visualState: WeatherVisualState;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  setWeatherForTheme: (weather: WeatherPayload | null) => void;
}

const defaultVisualState = weatherMotionEngine.calculateVisualState(null, 'living-weather');

const ThemeContext = createContext<ThemeContextType>({
  theme: 'living-weather',
  setTheme: () => {},
  visualState: defaultVisualState,
  isThemeModalOpen: false,
  openThemeModal: () => {},
  closeThemeModal: () => {},
  setWeatherForTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('living-weather');
  const [currentWeather, setCurrentWeather] = useState<WeatherPayload | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mausam-theme') as ThemeId | null;
      if (saved && AVAILABLE_THEMES.some(t => t.id === saved)) {
        setThemeState(saved);
      }
    }
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausam-theme', newTheme);
    }
    // Optionally sync with user preferences API
    try {
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const visualState = weatherMotionEngine.calculateVisualState(currentWeather, theme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        visualState,
        isThemeModalOpen,
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
