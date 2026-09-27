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
  latitude: number;
  longitude: number;
  location_type: 'home' | 'office' | 'school' | 'gym' | 'farm' | 'custom';
  is_pinned?: boolean;
  created_at: string;
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
