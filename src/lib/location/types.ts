export type LocationSource = 'gps' | 'browser' | 'search' | 'saved' | 'default';

export type LocationPermissionState =
  | 'idle'
  | 'requesting'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface NormalizedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters
  timestamp?: number;
  city: string;
  locality?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  source: LocationSource;
  updatedAt?: string;
}

export interface ReverseGeocodeResult {
  city: string;
  locality?: string;
  state?: string;
  country: string;
  countryCode?: string;
  timezone?: string;
}

