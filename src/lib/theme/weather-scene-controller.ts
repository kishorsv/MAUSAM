/**
 * MAUSAM — WeatherSceneController
 * 
 * Orchestrates real-time weather scene transitions, manages active feature worlds,
 * and controls smooth crossfade animations (800-2000ms) without polling the weather API excessively.
 */

import { WeatherPayload } from '../weather/types';
import { ThemeId } from './types';
import { FeatureWorldId, WeatherSceneId } from './scene-registry';
import { dynamicWeatherBackgroundEngine, DynamicEngineOutput } from './dynamic-background-engine';

export type SceneChangeListener = (state: WeatherSceneControllerState) => void;

export interface WeatherSceneControllerState {
  currentScene: DynamicEngineOutput;
  previousScene: DynamicEngineOutput | null;
  isTransitioning: boolean;
  transitionProgress: number; // 0 to 1
  selectedFeature: FeatureWorldId | null;
  lastWeatherUpdate: string | null;
}

export class WeatherSceneController {
  private currentState: WeatherSceneControllerState;
  private listeners: Set<SceneChangeListener> = new Set();
  private transitionTimer: NodeJS.Timeout | null = null;
  private currentTheme: ThemeId = 'midnight-ai';
  private currentWeather: WeatherPayload | null = null;
  private transitionDurationMs: number = 1200;

  constructor() {
    const initialScene = dynamicWeatherBackgroundEngine.computeScene({});
    this.currentState = {
      currentScene: initialScene,
      previousScene: null,
      isTransitioning: false,
      transitionProgress: 1,
      selectedFeature: null,
      lastWeatherUpdate: null
    };
  }

  /**
   * Subscribe to scene controller state updates
   */
  subscribe(listener: SceneChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('WeatherSceneController listener error:', err);
      }
    });
  }

  /**
   * Get current state snapshot
   */
  getState(): WeatherSceneControllerState {
    return this.currentState;
  }

  /**
   * Set active Feature World (e.g. 'agriculture', 'rain', 'fitness', 'ocean', 'sunny', 'cloudy')
   * or null to return to live weather scene
   */
  selectFeature(featureId: FeatureWorldId | null) {
    if (this.currentState.selectedFeature === featureId) return;

    const newScene = this.calculateOutput(this.currentWeather, this.currentTheme, featureId);
    this.triggerTransition(newScene, featureId);
  }

  /**
   * Set theme preference
   */
  setTheme(themeId: ThemeId) {
    this.currentTheme = themeId;
    const newScene = this.calculateOutput(this.currentWeather, themeId, this.currentState.selectedFeature);
    this.triggerTransition(newScene, this.currentState.selectedFeature);
  }

  /**
   * Update live weather data from API / cache
   * Only triggers visual transition if meteorological condition has actually changed
   */
  updateWeather(weather: WeatherPayload | null) {
    this.currentWeather = weather;
    const newScene = this.calculateOutput(weather, this.currentTheme, this.currentState.selectedFeature);

    // If sceneId changed or weather update arrived
    if (newScene.sceneId !== this.currentState.currentScene.sceneId || !this.currentState.lastWeatherUpdate) {
      this.triggerTransition(newScene, this.currentState.selectedFeature);
    } else {
      // Minor metric update without full crossfade
      this.currentState = {
        ...this.currentState,
        currentScene: newScene,
        lastWeatherUpdate: weather?.fetchedAt || new Date().toISOString()
      };
      this.notify();
    }
  }

  private calculateOutput(
    weather: WeatherPayload | null,
    theme: ThemeId,
    feature: FeatureWorldId | null
  ): DynamicEngineOutput {
    const current = weather?.current;
    const daily = weather?.daily?.[0];
    const rainProb = daily?.precipitationProbability ?? (current && current.precipitation > 0 ? 80 : 0);

    return dynamicWeatherBackgroundEngine.computeScene({
      wmoCode: current?.wmoCode,
      rainProbability: rainProb,
      temperature: current?.temperature,
      windSpeed: current?.windSpeed,
      humidity: current?.humidity,
      visibility: current?.visibility,
      aqi: weather?.airQuality?.aqi,
      uvIndex: current?.uvIndex,
      sunrise: daily?.sunrise,
      sunset: daily?.sunset,
      selectedFeature: feature,
      selectedLocation: weather?.location?.name,
      theme
    });
  }

  /**
   * Execute smooth 800 - 2000ms atmospheric crossfade transition
   */
  private triggerTransition(newScene: DynamicEngineOutput, feature: FeatureWorldId | null) {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }

    const previous = this.currentState.currentScene;
    this.currentState = {
      ...this.currentState,
      previousScene: previous,
      currentScene: newScene,
      isTransitioning: true,
      transitionProgress: 0,
      selectedFeature: feature,
      lastWeatherUpdate: this.currentWeather?.fetchedAt || new Date().toISOString()
    };
    this.notify();

    // End transition after duration
    this.transitionTimer = setTimeout(() => {
      this.currentState = {
        ...this.currentState,
        previousScene: null,
        isTransitioning: false,
        transitionProgress: 1
      };
      this.transitionTimer = null;
      this.notify();
    }, this.transitionDurationMs);
  }
}

export const weatherSceneController = new WeatherSceneController();
