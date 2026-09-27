import { IWeatherProvider } from "./provider";
import { OpenMeteoProvider } from "./open-meteo";
import { DemoWeatherProvider } from "./demo-provider";
import { WeatherPayload, WeatherLocation } from "./types";
import globalWeatherCache from "./cache";

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

  async getWeather(lat: number, lon: number, options?: { forceDemo?: boolean; locationMeta?: Partial<WeatherLocation>; bypassCache?: boolean }): Promise<WeatherPayload> {
    const provider = this.getProvider(options?.forceDemo);
    
    // Check Cache (only in live mode)
    if (provider.id !== 'demo-provider' && !options?.bypassCache) {
      const cached = globalWeatherCache.get(lat, lon, provider.id);
      if (cached) {
        return cached;
      }
    }

    const startTime = Date.now();
    this.healthStats.totalCalls++;

    try {
      const payload = await provider.getWeather(lat, lon, options?.locationMeta);
      this.healthStats.latencyMs = Date.now() - startTime;
      this.healthStats.isOnline = true;
      this.healthStats.lastChecked = new Date().toISOString();

      if (provider.id !== 'demo-provider') {
        globalWeatherCache.set(lat, lon, provider.id, payload, 600); // 10 minutes cache
      }

      return payload;
    } catch (err: any) {
      this.healthStats.failureCount++;
      this.healthStats.isOnline = false;
      this.healthStats.lastChecked = new Date().toISOString();
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
      cache: globalWeatherCache.getStats()
    };
  }
}

export const weatherService = new WeatherService();
