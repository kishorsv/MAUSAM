import { ReverseGeocodeResult, NormalizedLocation } from './types';
import { redisCache } from '../cache/redis';

class LocationService {
  /**
   * Reverse geocode latitude and longitude into city, locality, state, and country.
   * Uses resilient multi-tier providers (BigDataCloud + OpenStreetMap Nominatim) with strict timeouts.
   */
  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    const cacheKey = `geo:reverse:${lat.toFixed(3)}:${lon.toFixed(3)}`;
    const cached = redisCache.get<ReverseGeocodeResult>(cacheKey);
    if (cached) {
      return cached.data;
    }

    // Tier 1: BigDataCloud Client Reverse Geocode (free, high performance, no key required)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res = await fetch(bdcUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 } // Cache at edge for 24h
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Detected Location';
        const locality = data.locality && data.locality !== city ? data.locality : undefined;
        const state = data.principalSubdivision || undefined;
        const country = data.countryName || 'Global';
        const countryCode = data.countryCode || undefined;

        const result: ReverseGeocodeResult = {
          city,
          locality,
          state,
          country,
          countryCode
        };

        redisCache.set(cacheKey, result, 86400); // 24 hours cache
        return result;
      }
    } catch {
      // Fall through to Tier 2
    }

    // Tier 2: OpenStreetMap Nominatim with strict timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
      const res = await fetch(nomUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MausamWeatherIntelligence/1.0 (contact: info@mausam.met)',
          Accept: 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.suburb || address.county || 'Detected Location';
        const locality = address.suburb || address.neighbourhood || undefined;
        const state = address.state || address.region || undefined;
        const country = address.country || 'Global';
        const countryCode = address.country_code ? address.country_code.toUpperCase() : undefined;

        const result: ReverseGeocodeResult = {
          city,
          locality,
          state,
          country,
          countryCode
        };

        redisCache.set(cacheKey, result, 86400);
        return result;
      }
    } catch {
      // Fall through to fallback
    }

    // Tier 3: Coordinate fallback
    const latCard = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
    const lonCard = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;
    return {
      city: `${latCard}, ${lonCard}`,
      country: 'Live Coordinates'
    };
  }

  /**
   * Helper to normalize any location coordinates & metadata into NormalizedLocation
   */
  normalize(
    lat: number,
    lon: number,
    meta?: Partial<ReverseGeocodeResult>,
    source: NormalizedLocation['source'] = 'default'
  ): NormalizedLocation {
    return {
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      city: meta?.city || 'Bengaluru',
      locality: meta?.locality,
      state: meta?.state || 'Karnataka',
      country: meta?.country || 'India',
      countryCode: meta?.countryCode || 'IN',
      timezone: meta?.timezone,
      source
    };
  }
}

export const locationService = new LocationService();
