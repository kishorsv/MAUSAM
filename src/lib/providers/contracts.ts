import { WeatherPayload, WeatherLocation, CurrentWeather, AirQualityData, WeatherAlertItem } from "../weather/types";

export interface IWeatherProvider {
  readonly id: string;
  readonly name: string;
  getWeather(lat: number, lon: number, locationMeta?: Partial<WeatherLocation>): Promise<WeatherPayload>;
  searchLocations(query: string): Promise<WeatherLocation[]>;
}

export interface IAirQualityProvider {
  readonly id: string;
  readonly name: string;
  getAirQuality(lat: number, lon: number): Promise<AirQualityData | null>;
}

export interface RadarFrame {
  time: number; // Unix timestamp
  path: string; // Tile path
  formattedTime: string;
  relativeLabel: string; // e.g. -30m, NOW, +15m
}

export interface IRadarProvider {
  readonly id: string;
  readonly name: string;
  getRadarFrames(): Promise<{
    host: string;
    frames: RadarFrame[];
    currentFrameIndex: number;
    generatedAt: number;
    freshnessMinutes: number;
  }>;
}

export interface SatelliteLayerInfo {
  layerId: string;
  name: string;
  description: string;
  tileUrlTemplate: string;
  attribution: string;
  lastUpdated: string;
  freshnessMinutes: number;
  cloudCoveragePct?: number;
}

export interface ISatelliteProvider {
  readonly id: string;
  readonly name: string;
  getSatelliteLayers(lat: number, lon: number): Promise<{
    layers: SatelliteLayerInfo[];
    activeCycloneAlert?: string;
    cloudMovementHeading?: string;
    lastUpdated: string;
  }>;
}

export interface ITrafficProvider {
  readonly id: string;
  readonly name: string;
  isConfigured(): boolean;
  getTrafficStatus(startLat: number, startLon: number, endLat: number, endLon: number): Promise<{
    isAvailable: boolean;
    congestionLevel?: 'Low' | 'Moderate' | 'Heavy';
    delayMinutes?: number;
    statusNote: string;
  }>;
}

export interface IMarineProvider {
  readonly id: string;
  readonly name: string;
  getMarineConditions(lat: number, lon: number): Promise<{
    isCoastal: boolean;
    waveHeightMeters?: number;
    waterTemperatureC?: number;
    swellDirection?: number;
    statusNote: string;
  }>;
}

export interface IIoTProvider {
  readonly id: string;
  readonly name: string;
  ingestReading(deviceId: string, payload: any): Promise<boolean>;
  getDeviceTelemetry(deviceId: string): Promise<any | null>;
}
