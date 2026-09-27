import { IWeatherProvider } from "./provider";
import { OpenMeteoProvider } from "./open-meteo";
import { DemoWeatherProvider } from "./demo-provider";
import { WeatherPayload, WeatherLocation } from "./types";
import { redisCache } from "../cache/redis";

export interface ProviderHealthStatus {
  providerId: string;
  providerName: string;
  isOnline: boolean;
  lastChecked: string;
  latencyMs: number;
  totalCalls: number;
  failureCount: number;
}

class WeatherService {
  private liveProvider: IWeatherProvider;
  private demoProvider: IWeatherProvider;
  private healthStats: ProviderHealthStatus;

  constructor() {
    this.liveProvider = new OpenMeteoProvider();
    this.demoProvider = new DemoWeatherProvider();
    this.healthStats = {
      providerId: this.liveProvider.id,
      providerName: this.liveProvider.name,
      isOnline: true,
      lastChecked: new Date().toISOString(),
      latencyMs: 0,
      totalCalls: 0,
      failureCount: 0
    };
  }

  getProvider(forceDemo: boolean = false): IWeatherProvider {
    const isGlobalDemo = process.env.NEXT_PUBLIC_DATA_MODE === 'demo';
    if (forceDemo || isGlobalDemo) {
      return this.demoProvider;
    }
    return this.liveProvider;
  }

  async getWeather(
    lat: number,
    lon: number,
    options?: { forceDemo?: boolean; locationMeta?: Partial<WeatherLocation>; bypassCache?: boolean }
  ): Promise<WeatherPayload> {
    const provider = this.getProvider(options?.forceDemo);

    if (provider.id === 'demo-provider' || options?.bypassCache) {
      return provider.getWeather(lat, lon, options?.locationMeta);
    }

    const cacheKey = redisCache.getSpatialKey('weather', lat, lon);

    // Stale-While-Revalidate: Fresh TTL = 3 mins (180s), Stale TTL = 15 mins (900s)
    try {
      const result = await redisCache.getOrSet(
        cacheKey,
        async () => {
          const startTime = Date.now();
          this.healthStats.totalCalls++;
          try {
            const payload = await provider.getWeather(lat, lon, options?.locationMeta);
            this.healthStats.latencyMs = Date.now() - startTime;
            this.healthStats.isOnline = true;
            this.healthStats.lastChecked = new Date().toISOString();
            return payload;
          } catch (err: any) {
            this.healthStats.failureCount++;
            this.healthStats.isOnline = false;
            this.healthStats.lastChecked = new Date().toISOString();
            throw err;
          }
        },
        { freshTtlSeconds: 180, staleTtlSeconds: 900 }
      );

      return {
        ...result.data,
        cached: result.cached
      };
    } catch (err: any) {
      // Error Isolation & Fallback: If external API failed, check if we have ANY cached data for this location
      const fallback = redisCache.get<WeatherPayload>(cacheKey);
      if (fallback) {
        return {
          ...fallback.data,
          cached: true
        };
      }
      throw err;
    }
  }

  async searchLocations(query: string, forceDemo: boolean = false): Promise<WeatherLocation[]> {
    const provider = this.getProvider(forceDemo);
    return provider.searchLocations(query);
  }

  getHealth(): ProviderHealthStatus & { cache: any } {
    return {
      ...this.healthStats,
      cache: redisCache.getStats()
    };
  }
}

export const weatherService = new WeatherService();
