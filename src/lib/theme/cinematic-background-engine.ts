/**
 * MAUSAM CINEMATIC BACKGROUND ENGINE
 * 
 * Generates high-fidelity, real-time reactive atmospheric environments:
 * - Scenery landscape (mountains, horizon, celestial sky)
 * - Volumetric cloud layers with GPU drift
 * - Lighting & radial glow
 * - Dynamic weather effects (rain, snow, fog, lightning, stars, sunrays)
 * - Theme-specific environmental worlds (Midnight AI, Arctic, Emerald, Violet Cosmos, Sunset,
 *   Ocean Pulse, Monsoon, Desert Glow, Aurora Sky, Storm Core)
 */

import { ThemeId, WeatherConditionKey, ParticleType } from './types';
import { WeatherPayload } from '@/lib/weather/types';

export interface CinematicBackgroundConfig {
  theme: ThemeId;
  condition: WeatherConditionKey;
  particleType: ParticleType;
  timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night';
  backdropSvg: string;
  skyGradient: string;
  horizonGradient: string;
  atmosphericGlow: string;
  cloudOpacity: number;
  cloudSpeed: string;
  enableLightning: boolean;
  rainIntensity: number; // 0 - 100
  windSpeedNormalized: number; // 0 - 100
  particleCount: number;
  environmentName: string;
  accentColor: string;
  starsOpacity: number;
  sunMoonPosition: { top: string; right: string; glow: string };
}

export interface EngineInput {
  themeId: ThemeId;
  weather?: WeatherPayload | null;
  forcedTimeOfDay?: 'sunrise' | 'day' | 'sunset' | 'night';
}

export class CinematicBackgroundEngine {
  /**
   * Determine time of day from sunrise/sunset or current hour
   */
  getTimeOfDay(weather?: WeatherPayload | null): 'sunrise' | 'day' | 'sunset' | 'night' {
    const currentIso = weather?.fetchedAt || (weather?.current as unknown as Record<string, unknown>)?.timestamp as string | undefined;
    if (!currentIso) {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 7) return 'sunrise';
      if (hr >= 7 && hr < 17) return 'day';
      if (hr >= 17 && hr < 19) return 'sunset';
      return 'night';
    }

    const currentHr = new Date(currentIso).getHours();
    
    // Check sunrise/sunset from daily forecast
    const daily = weather?.daily?.[0];
    if (daily?.sunrise && daily?.sunset) {
      const sunriseTime = new Date(daily.sunrise).getTime();
      const sunsetTime = new Date(daily.sunset).getTime();
      const currentTime = new Date(currentIso).getTime();

      // Check within 1 hour of sunrise / sunset
      if (Math.abs(currentTime - sunriseTime) <= 60 * 60 * 1000) return 'sunrise';
      if (Math.abs(currentTime - sunsetTime) <= 60 * 60 * 1000) return 'sunset';
      if (currentTime > sunriseTime && currentTime < sunsetTime) return 'day';
      return 'night';
    }

    if (currentHr >= 5 && currentHr < 7) return 'sunrise';
    if (currentHr >= 7 && currentHr < 17) return 'day';
    if (currentHr >= 17 && currentHr < 19) return 'sunset';
    return 'night';
  }

  /**
   * Map WMO weather code to normalized weather condition key
   */
  getConditionKey(wmoCode: number, timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night'): WeatherConditionKey {
    // Storm, rain, snow, fog take precedence over clear daylight/twilight
    if (wmoCode >= 95) return 'storm';
    if ((wmoCode >= 51 && wmoCode <= 67) || (wmoCode >= 80 && wmoCode <= 82)) return 'rain';
    if ((wmoCode >= 71 && wmoCode <= 77) || (wmoCode >= 85 && wmoCode <= 86)) return 'snow';
    if (wmoCode === 45 || wmoCode === 48) return 'fog';

    if (timeOfDay === 'sunrise') return 'sunrise';
    if (timeOfDay === 'sunset') return 'sunset';

    // Clear
    if (wmoCode === 0 || wmoCode === 1) {
      return timeOfDay === 'night' ? 'clear-night' : 'clear-day';
    }
    // Cloudy
    if (wmoCode === 2 || wmoCode === 3) return 'cloudy';

    return timeOfDay === 'night' ? 'clear-night' : 'clear-day';
  }

  /**
   * Build complete cinematic environment configuration
   */
  buildEnvironment(input: EngineInput): CinematicBackgroundConfig {
    const timeOfDay = input.forcedTimeOfDay || this.getTimeOfDay(input.weather);
    const currentRecord = input.weather?.current as unknown as Record<string, unknown> | undefined;
    const wmo = (input.weather?.current?.wmoCode ?? currentRecord?.weatherCode ?? 0) as number;
    const condition = this.getConditionKey(wmo, timeOfDay);
    const theme = input.themeId;

    const rainIntensity = (input.weather?.daily?.[0]?.precipitationProbability ?? currentRecord?.rainProbability ?? (condition === 'rain' ? 80 : condition === 'storm' ? 95 : 0)) as number;
    const windSpeed = input.weather?.current?.windSpeed ?? 14;
    const windNormalized = Math.min(100, Math.round((windSpeed / 50) * 100));

    // Resolve theme-specific landscape scenery
    return this.getThemeScenery(theme, condition, timeOfDay, rainIntensity, windNormalized);
  }

  private getThemeScenery(
    theme: ThemeId,
    condition: WeatherConditionKey,
    timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night',
    rainIntensity: number,
    windNormalized: number
  ): CinematicBackgroundConfig {
    // 1. MIDNIGHT AI
    if (theme === 'midnight-ai' || theme === 'aurora') {
      return {
        theme: 'midnight-ai',
        condition,
        particleType: condition === 'rain' ? 'rain' : condition === 'storm' ? 'rain' : 'aurora',
        timeOfDay,
        skyGradient: 'from-[#030712] via-[#081128] to-[#04091a]',
        horizonGradient: 'from-[#05112e]/70 via-[#0a1e4a]/40 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 15%, rgba(34, 211, 238, 0.22) 0%, rgba(139, 92, 246, 0.16) 45%, transparent 75%)',
        backdropSvg: 'mountain-cyber',
        cloudOpacity: 0.25,
        cloudSpeed: '80s',
        enableLightning: condition === 'storm',
        rainIntensity,
        windSpeedNormalized: windNormalized,
        particleCount: 45,
        environmentName: 'Cyber Atmospheric Mountains & Aurora Peak',
        accentColor: '#38bdf8',
        starsOpacity: 0.8,
        sunMoonPosition: { top: '15%', right: '20%', glow: 'rgba(56, 189, 248, 0.4)' }
      };
    }

    // 2. ARCTIC
    if (theme === 'arctic' || theme === 'glass') {
      return {
        theme: 'arctic',
        condition,
        particleType: 'snow',
        timeOfDay,
        skyGradient: 'from-[#04101d] via-[#092237] to-[#051322]',
        horizonGradient: 'from-[#0b334d]/60 via-[#082236]/30 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.25) 0%, rgba(186, 230, 253, 0.14) 50%, transparent 80%)',
        backdropSvg: 'mountain-glacier',
        cloudOpacity: 0.35,
        cloudSpeed: '95s',
        enableLightning: false,
        rainIntensity: 0,
        windSpeedNormalized: windNormalized,
        particleCount: 50,
        environmentName: 'Sub-Zero Glacier Peaks & Crystalline Ice',
        accentColor: '#38bdf8',
        starsOpacity: 0.6,
        sunMoonPosition: { top: '12%', right: '25%', glow: 'rgba(186, 230, 253, 0.45)' }
      };
    }

    // 3. EMERALD
    if (theme === 'emerald' || theme === 'nature' || theme === 'earth') {
      return {
        theme: 'emerald',
        condition,
        particleType: condition === 'rain' ? 'rain' : 'leaves',
        timeOfDay,
        skyGradient: 'from-[#02130e] via-[#05261d] to-[#031711]',
        horizonGradient: 'from-[#083a2b]/70 via-[#05251c]/35 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 25%, rgba(16, 185, 129, 0.24) 0%, rgba(20, 184, 166, 0.15) 50%, transparent 80%)',
        backdropSvg: 'mountain-forest',
        cloudOpacity: 0.3,
        cloudSpeed: '75s',
        enableLightning: condition === 'storm',
        rainIntensity,
        windSpeedNormalized: windNormalized,
        particleCount: 35,
        environmentName: 'Rainforest Biosphere Ridge & Valley Canopy',
        accentColor: '#10b981',
        starsOpacity: 0.5,
        sunMoonPosition: { top: '18%', right: '18%', glow: 'rgba(52, 211, 153, 0.4)' }
      };
    }

    // 4. VIOLET COSMOS
    if (theme === 'violet-cosmos') {
      return {
        theme: 'violet-cosmos',
        condition,
        particleType: 'cosmic',
        timeOfDay,
        skyGradient: 'from-[#060311] via-[#100824] to-[#09041a]',
        horizonGradient: 'from-[#200e47]/70 via-[#13072c]/35 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 15%, rgba(168, 85, 247, 0.28) 0%, rgba(139, 92, 246, 0.18) 50%, transparent 80%)',
        backdropSvg: 'mountain-cosmic',
        cloudOpacity: 0.2,
        cloudSpeed: '110s',
        enableLightning: false,
        rainIntensity: 0,
        windSpeedNormalized: windNormalized,
        particleCount: 60,
        environmentName: 'Cosmic Nebula Mountain & Stellar Orbital Sky',
        accentColor: '#a855f7',
        starsOpacity: 0.95,
        sunMoonPosition: { top: '14%', right: '22%', glow: 'rgba(217, 70, 239, 0.5)' }
      };
    }

    // 5. SUNSET
    if (theme === 'sunset') {
      return {
        theme: 'sunset',
        condition,
        particleType: 'embers',
        timeOfDay: timeOfDay,
        skyGradient: 'from-[#190a07] via-[#35120c] to-[#1c0805]',
        horizonGradient: 'from-[#ea580c]/50 via-[#c2410c]/30 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 35%, rgba(234, 88, 12, 0.35) 0%, rgba(249, 115, 22, 0.2) 45%, transparent 75%)',
        backdropSvg: 'mountain-sunset',
        cloudOpacity: 0.45,
        cloudSpeed: '65s',
        enableLightning: false,
        rainIntensity: 0,
        windSpeedNormalized: windNormalized,
        particleCount: 30,
        environmentName: 'Golden Twilight Horizon & Crimson Foothills',
        accentColor: '#ea580c',
        starsOpacity: 0.2,
        sunMoonPosition: { top: '35%', right: '30%', glow: 'rgba(251, 146, 60, 0.65)' }
      };
    }

    // 6. OCEAN PULSE
    if (theme === 'ocean-pulse') {
      return {
        theme: 'ocean-pulse',
        condition,
        particleType: condition === 'rain' ? 'rain' : 'water',
        timeOfDay,
        skyGradient: 'from-[#020e1a] via-[#041c33] to-[#031322]',
        horizonGradient: 'from-[#06b6d4]/40 via-[#032b4d]/30 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 30%, rgba(6, 182, 212, 0.28) 0%, rgba(14, 165, 233, 0.16) 50%, transparent 80%)',
        backdropSvg: 'coastal-reef',
        cloudOpacity: 0.3,
        cloudSpeed: '70s',
        enableLightning: condition === 'storm',
        rainIntensity,
        windSpeedNormalized: windNormalized,
        particleCount: 40,
        environmentName: 'Deep Coastal Tide Horizon & Ocean Swell',
        accentColor: '#06b6d4',
        starsOpacity: 0.6,
        sunMoonPosition: { top: '16%', right: '28%', glow: 'rgba(34, 211, 238, 0.45)' }
      };
    }

    // 7. MONSOON
    if (theme === 'monsoon') {
      return {
        theme: 'monsoon',
        condition,
        particleType: 'rain',
        timeOfDay,
        skyGradient: 'from-[#030910] via-[#091829] to-[#040e18]',
        horizonGradient: 'from-[#0b2847]/60 via-[#071b30]/30 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 20%, rgba(14, 165, 233, 0.22) 0%, rgba(2, 132, 199, 0.15) 50%, transparent 75%)',
        backdropSvg: 'mountain-monsoon',
        cloudOpacity: 0.6,
        cloudSpeed: '50s',
        enableLightning: condition === 'storm',
        rainIntensity: Math.max(70, rainIntensity),
        windSpeedNormalized: Math.max(40, windNormalized),
        particleCount: 75,
        environmentName: 'Rain-Saturated Atmospheric Front & Heavy Stratus',
        accentColor: '#0ea5e9',
        starsOpacity: 0.1,
        sunMoonPosition: { top: '15%', right: '20%', glow: 'rgba(56, 189, 248, 0.3)' }
      };
    }

    // 8. DESERT GLOW
    if (theme === 'desert-glow') {
      return {
        theme: 'desert-glow',
        condition,
        particleType: 'dust',
        timeOfDay,
        skyGradient: 'from-[#140b04] via-[#2a1708] to-[#170c04]',
        horizonGradient: 'from-[#d97706]/45 via-[#78350f]/25 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 25%, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.18) 50%, transparent 80%)',
        backdropSvg: 'desert-dunes',
        cloudOpacity: 0.2,
        cloudSpeed: '90s',
        enableLightning: false,
        rainIntensity: 0,
        windSpeedNormalized: windNormalized,
        particleCount: 30,
        environmentName: 'Solar Dunes & Expansive Shimmering Desert Horizon',
        accentColor: '#f59e0b',
        starsOpacity: 0.4,
        sunMoonPosition: { top: '22%', right: '22%', glow: 'rgba(251, 191, 36, 0.6)' }
      };
    }

    // 9. AURORA SKY
    if (theme === 'aurora-sky') {
      return {
        theme: 'aurora-sky',
        condition,
        particleType: 'aurora',
        timeOfDay,
        skyGradient: 'from-[#020712] via-[#05142e] to-[#030b1c]',
        horizonGradient: 'from-[#082852]/70 via-[#041630]/35 to-transparent',
        atmosphericGlow: 'radial-gradient(ellipse at 50% 15%, rgba(34, 211, 238, 0.32) 0%, rgba(52, 211, 153, 0.22) 40%, rgba(168, 85, 247, 0.18) 70%, transparent 85%)',
        backdropSvg: 'mountain-polar',
        cloudOpacity: 0.2,
        cloudSpeed: '85s',
        enableLightning: false,
        rainIntensity: 0,
        windSpeedNormalized: windNormalized,
        particleCount: 50,
        environmentName: 'Geomagnetic Polar Light Curtains & Fjord Horizon',
        accentColor: '#22d3ee',
        starsOpacity: 0.9,
        sunMoonPosition: { top: '15%', right: '24%', glow: 'rgba(34, 211, 238, 0.5)' }
      };
    }

    // 10. STORM CORE
    return {
      theme: 'storm-core',
      condition,
      particleType: 'rain',
      timeOfDay,
      skyGradient: 'from-[#03050c] via-[#080d1e] to-[#040713]',
      horizonGradient: 'from-[#1e1b4b]/80 via-[#0d132a]/40 to-transparent',
      atmosphericGlow: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.35) 0%, rgba(56, 189, 248, 0.18) 50%, transparent 80%)',
      backdropSvg: 'mountain-tempest',
      cloudOpacity: 0.7,
      cloudSpeed: '40s',
      enableLightning: true,
      rainIntensity: Math.max(85, rainIntensity),
      windSpeedNormalized: Math.max(60, windNormalized),
      particleCount: 80,
      environmentName: 'Electric Tempest Thunderhead & Squall Line',
      accentColor: '#6366f1',
      starsOpacity: 0.05,
      sunMoonPosition: { top: '18%', right: '22%', glow: 'rgba(99, 102, 241, 0.35)' }
    };
  }
}

export const cinematicBackgroundEngine = new CinematicBackgroundEngine();
