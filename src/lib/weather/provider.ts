import { WeatherPayload, WeatherLocation } from "./types";

export interface IWeatherProvider {
  readonly id: string;
  readonly name: string;
  getWeather(lat: number, lon: number, locationMeta?: Partial<WeatherLocation>): Promise<WeatherPayload>;
  searchLocations(query: string): Promise<WeatherLocation[]>;
}
