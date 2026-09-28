export type LocationSource = 'browser' | 'search' | 'saved' | 'default';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout';

export interface NormalizedLocation {
  latitude: number;
  longitude: number;
  city: string;
  locality?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  source: LocationSource;
}

export interface ReverseGeocodeResult {
  city: string;
  locality?: string;
  state?: string;
  country: string;
  countryCode?: string;
  timezone?: string;
}
