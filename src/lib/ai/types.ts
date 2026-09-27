import { WeatherPayload } from "../weather/types";
import { UserPreferences, SavedLocation, PlannedEvent, TravelPlan, AIMessage, AIMemory } from "../db/types";

export type AIProviderName = 'gemini' | 'openai' | 'synthesizer';

export type AIIntent = 
  | 'weather_now'
  | 'rain_forecast'
  | 'running_fitness'
  | 'commute'
  | 'travel'
  | 'agriculture'
  | 'outdoor_event'
  | 'alerts'
  | 'clothing'
  | 'compare_days'
  | 'saved_locations'
  | 'general';

export interface AIContextPayload {
  intent: AIIntent;
  location: {
    name: string;
    region?: string;
    country?: string;
    lat: number;
    lon: number;
    source: 'current_gps' | 'saved_location' | 'query_parsed';
  };
  weather: {
    temperature: number;
    feelsLike: number;
    condition: string;
    rainProbability: number;
    precipitationMm: number;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    uvIndex: number;
    visibilityKm: number;
    pressureHpa: number;
    sunrise: string;
    sunset: string;
    isDay: boolean;
    dataAgeSeconds: number;
    dataSource: string;
  };
  airQuality?: {
    aqi: number;
    status: string;
    pm25?: number;
    pm10?: number;
  };
  alerts: Array<{
    title: string;
    severity: string;
    description?: string;
  }>;
  userContext: {
    language: string;
    temperatureUnit: 'celsius' | 'fahrenheit';
    lifestyle: string[];
    savedLocations: Array<{ name: string; type: string }>;
    activityPreferences?: Record<string, any>;
  };
  memory?: AIMemory;
  recentMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIStreamChunk {
  token: string;
  isDone: boolean;
  metadata?: {
    intent?: AIIntent;
    location?: string;
    provider?: string;
    model?: string;
    dataAgeSeconds?: number;
    confidence?: 'High' | 'Moderate';
    sources?: string[];
  };
}

export interface AIStructuredResponse {
  headline?: string;
  observedWeather: {
    location: string;
    temperature: string;
    condition: string;
    rainProbability: string;
    windSpeed: string;
    aqi: string;
    uvIndex: number;
    dataAge: string;
  };
  recommendation: string;
  bestWindow?: string;
  rationale?: string;
  actionItems: string[];
  confidence: 'High' | 'Moderate';
  sources: string[];
  provider: string;
  model: string;
  latencyMs: number;
}
