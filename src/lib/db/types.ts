import { Language } from "../i18n/translations";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  default_lat: number;
  default_lon: number;
  default_city: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  health_enabled: boolean;
  fitness_enabled: boolean;
  travel_enabled: boolean;
  family_enabled: boolean;
  agriculture_enabled: boolean;
  commuter_enabled: boolean;
  event_enabled: boolean;
  beach_enabled: boolean;
  language: Language;
  temperature_unit: 'celsius' | 'fahrenheit';
  wind_unit: 'kmh' | 'mph' | 'ms';
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  label?: string;
  latitude: number;
  longitude: number;
  location_type: 'home' | 'office' | 'school' | 'gym' | 'farm' | 'event' | 'custom';
  is_pinned?: boolean;
  place_id?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface TravelPlan {
  id: string;
  user_id: string;
  destination_name: string;
  latitude: number;
  longitude: number;
  departure_date: string;
  return_date?: string;
  notes?: string;
  packing_advice?: string[];
  created_at: string;
}

export interface PlannedEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  is_outdoor: boolean;
  comfort_score?: number;
  weather_summary?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: 'rain' | 'storm' | 'heat' | 'uv' | 'aqi' | 'travel' | 'fitness' | 'commute' | 'events';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  rain_alert: boolean;
  severe_storm: boolean;
  heat_wave: boolean;
  aqi_warning: boolean;
  fitness_window: boolean;
  travel_update: boolean;
  commute_update: boolean;
  created_at: string;
}

export interface WeatherSource {
  id: string;
  name: string;
  source_type: 'weather' | 'aqi' | 'radar' | 'satellite' | 'marine' | 'ai';
  status: 'operational' | 'degraded' | 'unavailable';
  latency_ms: number;
  last_checked: string;
  error_count: number;
}

export interface SensorDevice {
  id: string;
  user_id: string;
  name: string;
  device_model: string;
  mac_address?: string;
  is_connected: boolean;
  last_reading_at?: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  temperature?: number;
  humidity?: number;
  rain_gauge?: number;
  soil_moisture?: number;
  barometric_pressure?: number;
  wind_speed?: number;
  battery_level?: number;
  recorded_at: string;
}

export interface RouteWaypoint {
  name: string;
  latitude: number;
  longitude: number;
  temp?: number;
  condition?: string;
  rainProb?: number;
  windSpeed?: number;
  visibility?: number;
  alerts?: string[];
}

export interface RouteTrip {
  id: string;
  user_id: string;
  title: string;
  start_location: string;
  end_location: string;
  waypoints: RouteWaypoint[];
  travel_mode: 'car' | 'bike' | 'train' | 'bus';
  created_at: string;
}

export interface GroupWeatherItem {
  id: string;
  user_id: string;
  title: string;
  group_type: 'road_trip' | 'college_tour' | 'family_outing' | 'event';
  locations: {
    name: string;
    latitude: number;
    longitude: number;
    status: 'Good' | 'Moderate' | 'Poor';
    temperature?: number;
    condition?: string;
    rainProb?: number;
  }[];
  created_at: string;
}

export interface IntelligenceFeedItem {
  id: string;
  time: string;
  title: string;
  message: string;
  category: 'rain' | 'fitness' | 'uv' | 'travel' | 'aqi' | 'satellite' | 'radar';
  urgency: 'info' | 'notice' | 'alert';
  locationName: string;
  source: string;
  freshness: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    weather_context_id?: string;
    location?: string;
    model?: string;
    provider?: string;
    response_time?: number;
    token_usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    sources?: string[];
    confidence?: string;
    data_age_seconds?: number;
    intent?: string;
  };
  created_at: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  preferred_activities: string[];
  saved_locations: string[];
  weather_interests: string[];
  notification_preferences?: Record<string, boolean>;
  travel_preferences?: Record<string, any>;
  notes?: string[];
  updated_at: string;
}

export interface AIUsage {
  id: string;
  user_id: string;
  model: string;
  provider: string;
  request_time: string;
  response_time_ms: number;
  success: boolean;
  token_usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  cost_estimate?: number;
  created_at: string;
}

export interface AIFeedback {
  id: string;
  user_id: string;
  message_id: string;
  rating: 'thumbs_up' | 'thumbs_down';
  feedback_text?: string;
  created_at: string;
}

export interface WeatherContextRecord {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  condition: string;
  rain_probability: number;
  aqi?: number;
  uv_index: number;
  wind_speed: number;
  alerts?: string[];
  fetched_at: string;
  created_at: string;
}

export interface ActivityPreferences {
  id: string;
  user_id: string;
  running_preferred_temp_min: number;
  running_preferred_temp_max: number;
  outdoor_threshold_rain_prob: number;
  cycling_max_wind_speed: number;
  travel_alert_level: 'minor' | 'moderate' | 'severe';
  updated_at: string;
}

