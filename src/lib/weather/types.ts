export interface WeatherLocation {
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGusts?: number;
  visibility: number; // km
  uvIndex: number;
  wmoCode: number;
  condition: string;
  isDay: boolean;
  precipitation: number; // mm
  cloudCover?: number;
}

export interface AirQualityData {
  aqi: number; // US AQI standard (0-500)
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  no2?: number;
  so2?: number;
  o3?: number;
  co?: number;
  europeanAqi?: number;
  category: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  status: string;
  dominantPollutant?: string;
}

export interface HourlyForecastItem {
  time: string; // ISO string or HH:mm
  temperature: number;
  feelsLike: number;
  precipitationProbability: number; // %
  precipitation: number; // mm
  windSpeed: number;
  uvIndex: number;
  humidity: number;
  wmoCode: number;
  condition: string;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number; // %
  precipitationSum: number; // mm
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  wmoCode: number;
  condition: string;
}

export interface WeatherAlertItem {
  id: string;
  title: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  category: 'rain' | 'storm' | 'heat' | 'cold' | 'wind' | 'aqi' | 'visibility';
  description: string;
  instruction?: string;
  effective: string;
  expires: string;
  source: string;
}

export interface AgricultureData {
  soilTemperature?: number; // °C
  soilMoisture?: number; // m3/m3 (0-1)
  evapotranspiration?: number; // mm
  frostRisk: boolean;
  isSensorLive: boolean;
  note?: string;
}

export interface MarineData {
  waveHeight?: number; // meters
  waveDirection?: number; // degrees
  waterTemperature?: number; // °C
  swellHeight?: number;
  isAvailable: boolean;
}

export interface WeatherPayload {
  location: WeatherLocation;
  current: CurrentWeather;
  airQuality?: AirQualityData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlertItem[];
  agriculture?: AgricultureData;
  marine?: MarineData;
  provider: string;
  isLive: boolean;
  fetchedAt: string;
  cached?: boolean;
}
