/**
 * MAUSAM — DynamicWeatherBackgroundEngine
 * 
 * Computes deterministic weather-reactive scenes and feature world environments
 * driven by live meteorological telemetry and active feature contexts.
 */

import { ThemeId, WeatherConditionKey } from './types';
import { SCENE_PRESETS, WeatherSceneId, WeatherScenePreset, FeatureWorldId } from './scene-registry';

export interface DynamicEngineInput {
  weatherCondition?: string;
  wmoCode?: number;
  temperature?: number;
  rainProbability?: number;
  windSpeed?: number;
  humidity?: number;
  visibility?: number;
  aqi?: number;
  uvIndex?: number;
  timeOfDay?: 'sunrise' | 'day' | 'sunset' | 'night';
  sunrise?: string;
  sunset?: string;
  selectedFeature?: FeatureWorldId | null;
  selectedLocation?: string;
  theme?: ThemeId;
  prefersReducedMotion?: boolean;
}

export interface DynamicEngineOutput {
  backgroundScene: WeatherScenePreset;
  sceneId: WeatherSceneId;
  cloudAnimation: {
    active: boolean;
    opacity: number;
    speed: string;
    density: 'light' | 'moderate' | 'dense' | 'overcast';
  };
  rainAnimation: {
    active: boolean;
    intensity: number; // 0 - 100
    speed: string;
    particleCount: number;
  };
  sunAnimation: {
    active: boolean;
    glow: string;
    rayIntensity: number;
    position: { top: string; right?: string; left?: string };
  };
  fogAnimation: {
    active: boolean;
    density: number;
    speed: string;
  };
  snowAnimation: {
    active: boolean;
    flakeCount: number;
    speed: string;
  };
  windAnimation: {
    speedNormalized: number; // 0 - 100
    angleDeg: number;
  };
  lighting: {
    primaryAmbient: string;
    skyGradient: string;
    horizonGradient: string;
    atmosphericGlow: string;
    accentColor: string;
    vignetteIntensity: number;
  };
  particles: {
    type: WeatherScenePreset['particleType'];
    count: number;
    speed: number;
    color: string;
  };
  colorGrade: WeatherScenePreset['colorGrade'];
  animationIntensity: 'standard' | 'reduced';
  featureMode: FeatureWorldId | null;
  atmosphereHeadline: string;
  atmosphereDescription: string;
}

export class DynamicWeatherBackgroundEngine {
  /**
   * Deterministic weather state mapping based on WMO code, precipitation probability,
   * visibility, and time of day
   */
  mapWeatherToSceneId(
    wmoCode: number = 0,
    rainProb: number = 0,
    visibility: number = 10,
    timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night' = 'day',
    aqi: number = 45
  ): WeatherSceneId {
    // 1. Severe Convective Storms (WMO 95, 96, 99)
    if (wmoCode >= 95) {
      return 'storm';
    }

    // 2. Winter Snow / Ice (WMO 71-77, 85-86)
    if ((wmoCode >= 71 && wmoCode <= 77) || (wmoCode >= 85 && wmoCode <= 86)) {
      return 'snow';
    }

    // 3. Heavy Rain / Squall (WMO 65, 67, 82 or high rain probability with heavy rain)
    if (wmoCode === 65 || wmoCode === 67 || wmoCode === 82 || rainProb >= 85) {
      return 'heavy-rain';
    }

    // 4. Moderate Rain (WMO 61, 63, 80, 81 or rainProb >= 60)
    if (wmoCode === 61 || wmoCode === 63 || (wmoCode >= 80 && wmoCode <= 81) || rainProb >= 60) {
      return 'rain';
    }

    // 5. Light Rain / Drizzle (WMO 51-57)
    if ((wmoCode >= 51 && wmoCode <= 57) || (rainProb >= 40 && rainProb < 60)) {
      return 'rain-light';
    }

    // 6. Fog / Reduced Visibility (WMO 45, 48 or vis < 2.5km)
    if (wmoCode === 45 || wmoCode === 48 || visibility < 2.5) {
      return 'fog';
    }

    // 7. Haze / High particulate matter
    if (aqi >= 150 || (visibility < 5 && wmoCode <= 2)) {
      return 'haze';
    }

    // 8. Overcast / Cloudy (WMO 3)
    if (wmoCode === 3) {
      return 'cloudy';
    }

    // 9. Partly Cloudy (WMO 2)
    if (wmoCode === 2) {
      return timeOfDay === 'night' ? 'clear-night' : 'sunny-clouds';
    }

    // 10. Clear Sky (WMO 0, 1)
    if (timeOfDay === 'night') {
      return 'clear-night';
    }

    return 'sunny';
  }

  /**
   * Determine time of day from sunrise/sunset or current hours
   */
  resolveTimeOfDay(
    hour: number = new Date().getHours(),
    sunriseIso?: string,
    sunsetIso?: string
  ): 'sunrise' | 'day' | 'sunset' | 'night' {
    if (sunriseIso && sunsetIso) {
      const now = Date.now();
      const sunrise = new Date(sunriseIso).getTime();
      const sunset = new Date(sunsetIso).getTime();

      if (Math.abs(now - sunrise) <= 60 * 60 * 1000) return 'sunrise';
      if (Math.abs(now - sunset) <= 60 * 60 * 1000) return 'sunset';
      if (now > sunrise && now < sunset) return 'day';
      return 'night';
    }

    if (hour >= 5 && hour < 7) return 'sunrise';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'sunset';
    return 'night';
  }

  /**
   * Main computation method: derives complete visual scene environment
   */
  computeScene(input: DynamicEngineInput): DynamicEngineOutput {
    const timeOfDay = input.timeOfDay || this.resolveTimeOfDay(
      new Date().getHours(), 
      input.sunrise, 
      input.sunset
    );
    const wmo = input.wmoCode ?? 0;
    const rainProb = input.rainProbability ?? 0;
    const vis = input.visibility ?? 10;
    const aqi = input.aqi ?? 45;
    const windSpeed = input.windSpeed ?? 14;
    const windNormalized = Math.min(100, Math.round((windSpeed / 50) * 100));
    const reducedMotion = input.prefersReducedMotion ?? false;

    // 1. Resolve scene ID: Check for explicit Feature World first, else map from weather
    let sceneId: WeatherSceneId;
    const featureMode = input.selectedFeature && input.selectedFeature !== 'weather'
      ? input.selectedFeature 
      : null;

    if (featureMode) {
      // Direct Feature World scene
      switch (featureMode) {
        case 'agriculture':
          sceneId = 'agriculture';
          break;
        case 'rain':
          sceneId = rainProb >= 80 ? 'heavy-rain' : 'rain';
          break;
        case 'sunny':
          sceneId = 'sunny';
          break;
        case 'cloudy':
          sceneId = 'cloudy';
          break;
        case 'fitness':
          sceneId = 'fitness';
          break;
        case 'ocean':
          sceneId = 'ocean';
          break;
        case 'satellite':
          sceneId = 'satellite';
          break;
        case 'radar':
          sceneId = 'radar';
          break;
        case 'travel':
          sceneId = 'travel';
          break;
        case 'health':
          sceneId = 'health';
          break;
        case 'events':
          sceneId = 'events';
          break;
        default:
          sceneId = this.mapWeatherToSceneId(wmo, rainProb, vis, timeOfDay, aqi);
      }
    } else {
      sceneId = this.mapWeatherToSceneId(wmo, rainProb, vis, timeOfDay, aqi);
    }

    // 2. Fetch base preset from registry
    const basePreset = SCENE_PRESETS[sceneId] || SCENE_PRESETS['sunny'];

    // 3. Compose animations
    const isStorm = sceneId === 'storm';
    const isRain = sceneId === 'rain' || sceneId === 'heavy-rain' || sceneId === 'rain-light';
    const isSnow = sceneId === 'snow';
    const isFog = sceneId === 'fog';

    const cloudDensity: 'light' | 'moderate' | 'dense' | 'overcast' = 
      isStorm || sceneId === 'heavy-rain' ? 'overcast' :
      sceneId === 'cloudy' || isFog ? 'dense' :
      sceneId === 'sunny-clouds' || isRain ? 'moderate' : 'light';

    const rainIntensity = isStorm ? 95 :
      sceneId === 'heavy-rain' ? 100 :
      sceneId === 'rain' ? 75 :
      sceneId === 'rain-light' ? 40 : 0;

    const rainParticleCount = reducedMotion ? Math.round(basePreset.particleCount * 0.4) : basePreset.particleCount;

    // 4. Headline & Atmosphere description
    let headline = basePreset.name;
    let description = basePreset.vibe;

    if (featureMode === 'agriculture') {
      headline = '🌾 Agriculture Intelligence World';
      description = 'Soil moisture, evapotranspiration, rainfall nowcast, and crop protection advisories.';
    } else if (featureMode === 'rain') {
      headline = '🌧 Rain Nowcasting & Radar World';
      description = `Real-time precipitation telemetry with ${rainProb}% rain probability and Doppler tracking.`;
    } else if (featureMode === 'fitness') {
      headline = '🏃 Fitness & Outdoor Run Haven';
      description = 'Atmospheric conditions analyzed for running cadence, hydration needs, and optimal workout windows.';
    } else if (featureMode === 'ocean') {
      headline = '🌊 Marine & Coastal Weather World';
      description = 'Coastal wind velocity, swell height, sea surface temperature, and shoreline stability.';
    }

    return {
      backgroundScene: basePreset,
      sceneId,
      cloudAnimation: {
        active: basePreset.cloudOpacity > 0,
        opacity: basePreset.cloudOpacity,
        speed: reducedMotion ? '120s' : basePreset.cloudSpeed,
        density: cloudDensity
      },
      rainAnimation: {
        active: isRain || isStorm,
        intensity: rainIntensity,
        speed: isStorm ? '0.4s' : '0.7s',
        particleCount: isRain || isStorm ? rainParticleCount : 0
      },
      sunAnimation: {
        active: basePreset.sunMoonPosition.isSun,
        glow: basePreset.sunMoonPosition.glow,
        rayIntensity: basePreset.sunMoonPosition.isSun ? 0.8 : 0.2,
        position: {
          top: basePreset.sunMoonPosition.top,
          right: basePreset.sunMoonPosition.right,
          left: basePreset.sunMoonPosition.left
        }
      },
      fogAnimation: {
        active: isFog,
        density: isFog ? 0.8 : 0,
        speed: reducedMotion ? '120s' : '75s'
      },
      snowAnimation: {
        active: isSnow,
        flakeCount: isSnow ? (reducedMotion ? 35 : 90) : 0,
        speed: '8s'
      },
      windAnimation: {
        speedNormalized: windNormalized,
        angleDeg: 15
      },
      lighting: {
        primaryAmbient: basePreset.accentColor,
        skyGradient: basePreset.skyGradient,
        horizonGradient: basePreset.horizonGradient,
        atmosphericGlow: basePreset.atmosphericGlow,
        accentColor: basePreset.accentColor,
        vignetteIntensity: 0.35
      },
      particles: {
        type: basePreset.particleType,
        count: reducedMotion ? Math.round(basePreset.particleCount * 0.3) : basePreset.particleCount,
        speed: reducedMotion ? 0.4 : 1.0,
        color: basePreset.accentColor
      },
      colorGrade: basePreset.colorGrade,
      animationIntensity: reducedMotion ? 'reduced' : 'standard',
      featureMode,
      atmosphereHeadline: headline,
      atmosphereDescription: description
    };
  }
}

export const dynamicWeatherBackgroundEngine = new DynamicWeatherBackgroundEngine();
