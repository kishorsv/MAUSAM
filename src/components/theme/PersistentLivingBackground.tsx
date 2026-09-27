'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { LivingWeatherBackground } from './LivingWeatherBackground';

export function PersistentLivingBackground() {
  const { visualState } = useTheme();
  return <LivingWeatherBackground visualState={visualState} />;
}
