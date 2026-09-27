import { WeatherPayload, WeatherAlertItem } from "../weather/types";
import { UserPreferences } from "../db/types";

export interface AutomationThresholds {
  rainProbabilityThreshold: number; // e.g. 60%
  highUvThreshold: number; // e.g. 8
  highTempThreshold: number; // e.g. 38°C
  lowTempThreshold: number; // e.g. 8°C
  highAqiThreshold: number; // e.g. 150
  lowVisibilityThreshold: number; // e.g. 3 km
  highWindThreshold: number; // e.g. 45 km/h
}

export const DEFAULT_THRESHOLDS: AutomationThresholds = {
  rainProbabilityThreshold: 60,
  highUvThreshold: 8,
  highTempThreshold: 38,
  lowTempThreshold: 8,
  highAqiThreshold: 150,
  lowVisibilityThreshold: 3,
  highWindThreshold: 45
};

export interface GeneratedInsight {
  id: string;
  ruleKey: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionableRecommendation: string;
  category: string;
}

export class SmartAutomationEngine {
  evaluateRules(
    weather: WeatherPayload,
    prefs?: UserPreferences | null,
    thresholds: AutomationThresholds = DEFAULT_THRESHOLDS
  ): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    const currentRainProb = weather.hourly[0]?.precipitationProbability ?? 0;
    const currentTemp = weather.current.temperature;
    const currentUv = weather.current.uvIndex;
    const currentAqi = weather.airQuality?.aqi ?? 0;
    const currentVis = weather.current.visibility;

    // Rule 1: Rain Probability Alert
    if (currentRainProb >= thresholds.rainProbabilityThreshold || weather.current.precipitation > 0) {
      insights.push({
        id: `rule-rain-${Date.now()}`,
        ruleKey: 'RAIN_ALERT',
        title: 'High Precipitation Risk',
        message: `Rain probability is currently ${currentRainProb}% in ${weather.location.name}.`,
        urgency: currentRainProb >= 80 ? 'high' : 'medium',
        actionableRecommendation: 'Carry an umbrella and expect possible road waterlogging.',
        category: 'rain'
      });
    }

    // Rule 2: High UV Alert
    if (currentUv >= thresholds.highUvThreshold) {
      insights.push({
        id: `rule-uv-${Date.now()}`,
        ruleKey: 'UV_ALERT',
        title: 'Intense Solar UV Radiation',
        message: `UV Index has reached ${currentUv}, posing high skin and eye exposure index.`,
        urgency: currentUv >= 11 ? 'critical' : 'high',
        actionableRecommendation: 'Apply broad-spectrum sunscreen and seek shaded areas during midday.',
        category: 'uv'
      });
    }

    // Rule 3: Extreme Heat Alert
    if (currentTemp >= thresholds.highTempThreshold) {
      insights.push({
        id: `rule-heat-${Date.now()}`,
        ruleKey: 'HEAT_ALERT',
        title: 'Elevated Temperature Advisory',
        message: `Ambient temperature is ${currentTemp}°C with feels-like at ${weather.current.feelsLike}°C.`,
        urgency: currentTemp >= 42 ? 'critical' : 'high',
        actionableRecommendation: 'Ensure regular hydration and minimize heavy exertion during peak hours.',
        category: 'heat'
      });
    }

    // Rule 4: Air Quality Alert
    if (currentAqi >= thresholds.highAqiThreshold) {
      insights.push({
        id: `rule-aqi-${Date.now()}`,
        ruleKey: 'AQI_ALERT',
        title: 'Unhealthy Air Quality Index',
        message: `Current AQI is ${currentAqi} (${weather.airQuality?.status || 'Elevated'}).`,
        urgency: currentAqi >= 200 ? 'critical' : 'high',
        actionableRecommendation: 'Sensitive individuals and outdoor runners should consider an N95 mask or indoor air purifier.',
        category: 'aqi'
      });
    }

    // Rule 5: Low Visibility Alert
    if (currentVis <= thresholds.lowVisibilityThreshold) {
      insights.push({
        id: `rule-vis-${Date.now()}`,
        ruleKey: 'VISIBILITY_ALERT',
        title: 'Reduced Roadway Visibility',
        message: `Atmospheric visibility has dropped to ${currentVis} km due to fog/mist/particulates.`,
        urgency: currentVis <= 1 ? 'high' : 'medium',
        actionableRecommendation: 'Use low-beam headlights and maintain extra vehicle following distance.',
        category: 'commute'
      });
    }

    // Rule 6: Fitness + Poor Conditions Alternate Window
    if (prefs?.fitness_enabled && (currentRainProb >= 70 || currentTemp >= 35 || currentAqi >= 150)) {
      // Find the cleanest, driest upcoming hour
      const bestAlternative = weather.hourly.find(h => h.precipitationProbability < 40 && h.temperature < 32);
      insights.push({
        id: `rule-fitness-alt-${Date.now()}`,
        ruleKey: 'FITNESS_ALTERNATE_WINDOW',
        title: 'Alternate Workout Window Suggested',
        message: 'Current conditions outside are sub-optimal for high-intensity training.',
        urgency: 'medium',
        actionableRecommendation: bestAlternative
          ? `Conditions improve significantly around ${bestAlternative.time.includes('T') ? bestAlternative.time.slice(11, 16) : bestAlternative.time} (${bestAlternative.temperature}°C, ${bestAlternative.precipitationProbability}% rain).`
          : 'Consider indoor strength or treadmill training for today.',
        category: 'fitness'
      });
    }

    return insights;
  }
}

export const smartAutomationEngine = new SmartAutomationEngine();
