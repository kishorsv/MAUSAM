import { WeatherPayload } from "./types";

interface CacheEntry {
  data: WeatherPayload;
  expiresAt: number;
  storedAt: number;
}

class WeatherCacheService {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  private getCacheKey(lat: number, lon: number, provider: string): string {
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);
    return `${provider}:${roundedLat},${roundedLon}`;
  }

  get(lat: number, lon: number, provider: string): WeatherPayload | null {
    const key = this.getCacheKey(lat, lon, provider);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    // Return cloned data with cached flag
    return {
      ...entry.data,
      cached: true,
    };
  }

  set(lat: number, lon: number, provider: string, data: WeatherPayload, ttlSeconds: number = 600): void {
    const key = this.getCacheKey(lat, lon, provider);
    this.cache.set(key, {
      data,
      storedAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    this.stats.sets++;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) + '%' 
        : '0%',
    };
  }
}

// Global singleton cache across requests
const globalWeatherCache = new WeatherCacheService();
export default globalWeatherCache;
