import { IWeatherProvider } from "./provider";
import { WeatherPayload, WeatherLocation } from "./types";

export class DemoWeatherProvider implements IWeatherProvider {
  readonly id = "demo-provider";
  readonly name = "Demo Sandbox Provider (Simulated)";

  async getWeather(lat: number, lon: number, locationMeta?: Partial<WeatherLocation>): Promise<WeatherPayload> {
    const cityName = locationMeta?.name || "Demo Bengaluru";
    
    // Explicitly labeled mock sample data with static timestamps
    return {
      location: {
        name: cityName,
        region: locationMeta?.region || "Demo Region",
        country: locationMeta?.country || "Demo Country",
        lat,
        lon,
        timezone: "Asia/Kolkata"
      },
      current: {
        temperature: 24,
        feelsLike: 25,
        humidity: 65,
        pressure: 1012,
        windSpeed: 14,
        windDirection: 180,
        visibility: 8.5,
        uvIndex: 6,
        wmoCode: 2,
        condition: "Partly Cloudy (Demo)",
        isDay: true,
        precipitation: 0
      },
      airQuality: {
        aqi: 95,
        pm25: 32.4,
        pm10: 64.1,
        no2: 18.2,
        so2: 5.1,
        o3: 45.0,
        co: 0.8,
        category: "moderate",
        status: "Moderate (Demo Sample)",
        dominantPollutant: "PM2.5"
      },
      hourly: [
        { time: "06:00", temperature: 20, feelsLike: 20, precipitationProbability: 10, precipitation: 0, windSpeed: 8, uvIndex: 1, humidity: 82, wmoCode: 1, condition: "Mainly Clear", isDay: true },
        { time: "07:00", temperature: 21, feelsLike: 21, precipitationProbability: 10, precipitation: 0, windSpeed: 10, uvIndex: 2, humidity: 78, wmoCode: 1, condition: "Mainly Clear", isDay: true },
        { time: "08:00", temperature: 23, feelsLike: 23, precipitationProbability: 15, precipitation: 0, windSpeed: 12, uvIndex: 4, humidity: 72, wmoCode: 2, condition: "Partly Cloudy", isDay: true },
        { time: "09:00", temperature: 25, feelsLike: 26, precipitationProbability: 20, precipitation: 0, windSpeed: 14, uvIndex: 6, humidity: 66, wmoCode: 2, condition: "Partly Cloudy", isDay: true },
        { time: "10:00", temperature: 27, feelsLike: 28, precipitationProbability: 25, precipitation: 0, windSpeed: 15, uvIndex: 8, humidity: 60, wmoCode: 2, condition: "Partly Cloudy", isDay: true },
        { time: "11:00", temperature: 28, feelsLike: 29, precipitationProbability: 35, precipitation: 0.2, windSpeed: 16, uvIndex: 9, humidity: 58, wmoCode: 3, condition: "Overcast", isDay: true },
        { time: "12:00", temperature: 29, feelsLike: 30, precipitationProbability: 55, precipitation: 1.2, windSpeed: 18, uvIndex: 7, humidity: 65, wmoCode: 61, condition: "Passing Rain", isDay: true },
        { time: "13:00", temperature: 28, feelsLike: 29, precipitationProbability: 70, precipitation: 2.5, windSpeed: 20, uvIndex: 5, humidity: 75, wmoCode: 80, condition: "Rain Showers", isDay: true }
      ],
      daily: [
        { date: "Day 1", temperatureMin: 19, temperatureMax: 29, precipitationProbability: 60, precipitationSum: 3.5, windSpeedMax: 20, uvIndexMax: 8, sunrise: "06:05", sunset: "18:22", wmoCode: 80, condition: "Scattered Rain" },
        { date: "Day 2", temperatureMin: 18, temperatureMax: 28, precipitationProbability: 40, precipitationSum: 1.0, windSpeedMax: 16, uvIndexMax: 9, sunrise: "06:05", sunset: "18:21", wmoCode: 2, condition: "Partly Cloudy" },
        { date: "Day 3", temperatureMin: 20, temperatureMax: 30, precipitationProbability: 20, precipitationSum: 0, windSpeedMax: 14, uvIndexMax: 9, sunrise: "06:06", sunset: "18:20", wmoCode: 1, condition: "Mainly Clear" },
        { date: "Day 4", temperatureMin: 19, temperatureMax: 31, precipitationProbability: 15, precipitationSum: 0, windSpeedMax: 12, uvIndexMax: 10, sunrise: "06:06", sunset: "18:19", wmoCode: 0, condition: "Sunny" },
        { date: "Day 5", temperatureMin: 21, temperatureMax: 30, precipitationProbability: 45, precipitationSum: 2.1, windSpeedMax: 18, uvIndexMax: 8, sunrise: "06:07", sunset: "18:18", wmoCode: 61, condition: "Light Rain" }
      ],
      alerts: [
        {
          id: "demo-rain-alert",
          title: "Demo Advisory: Afternoon Showers",
          severity: "moderate",
          category: "rain",
          description: "This is a simulated demo alert for testing notification workflows.",
          instruction: "Keep umbrella handy in demo mode.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 4 * 3600000).toISOString(),
          source: "Demo Sandbox"
        }
      ],
      agriculture: {
        frostRisk: false,
        isSensorLive: false,
        note: "Simulated demo soil profile."
      },
      marine: {
        isAvailable: false
      },
      provider: this.name,
      isLive: false, // EXPLICITLY LABELED NOT LIVE
      fetchedAt: new Date().toISOString()
    };
  }

  async searchLocations(query: string): Promise<WeatherLocation[]> {
    return [
      { name: "Bengaluru (Demo)", region: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946 },
      { name: "Mumbai (Demo)", region: "Maharashtra", country: "India", lat: 19.0760, lon: 72.8777 },
      { name: "New Delhi (Demo)", region: "Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
      { name: "London (Demo)", region: "Greater London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 }
    ].filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()));
  }
}
