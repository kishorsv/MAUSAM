import { IWeatherProvider } from "./provider";
import { WeatherPayload, WeatherLocation, HourlyForecastItem, DailyForecastItem, AirQualityData, WeatherAlertItem } from "./types";
import { getWmoWeatherDescription, getAqiCategory } from "../utils";

export class OpenMeteoProvider implements IWeatherProvider {
  readonly id = "open-meteo";
  readonly name = "Open-Meteo / IMD-ECMWF Core";

  async getWeather(lat: number, lon: number, locationMeta?: Partial<WeatherLocation>): Promise<WeatherPayload> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,european_aqi&timezone=auto`;

      const [forecastRes, aqiRes] = await Promise.allSettled([
        fetch(forecastUrl, { signal: controller.signal, next: { revalidate: 300 } }),
        fetch(aqiUrl, { signal: controller.signal, next: { revalidate: 300 } })
      ]);

      clearTimeout(timeoutId);

      if (forecastRes.status !== 'fulfilled' || !forecastRes.value.ok) {
        throw new Error(`Failed to fetch forecast from Open-Meteo: ${forecastRes.status === 'fulfilled' ? forecastRes.value.statusText : forecastRes.reason}`);
      }

      const forecastData = await forecastRes.value.json();
      
      let airQuality: AirQualityData | undefined = undefined;
      if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
        try {
          const aqiData = await aqiRes.value.json();
          if (aqiData.current && typeof aqiData.current.us_aqi === 'number') {
            const rawAqi = Math.round(aqiData.current.us_aqi);
            const aqiInfo = getAqiCategory(rawAqi);
            airQuality = {
              aqi: rawAqi,
              pm25: Number(aqiData.current.pm2_5?.toFixed(1) || 0),
              pm10: Number(aqiData.current.pm10?.toFixed(1) || 0),
              no2: aqiData.current.nitrogen_dioxide,
              so2: aqiData.current.sulphur_dioxide,
              o3: aqiData.current.ozone,
              co: aqiData.current.carbon_monoxide,
              europeanAqi: aqiData.current.european_aqi,
              category: aqiInfo.level,
              status: aqiInfo.label,
              dominantPollutant: aqiData.current.pm2_5 > aqiData.current.pm10 ? 'PM2.5' : 'PM10'
            };
          }
        } catch {
          // Gracefully omit AQI if response parsing fails
        }
      }

      const currentRaw = forecastData.current;
      const hourlyRaw = forecastData.hourly;
      const dailyRaw = forecastData.daily;

      const currentWeatherDesc = getWmoWeatherDescription(currentRaw.weather_code);

      // Hourly items (next 24 hours)
      const hourly: HourlyForecastItem[] = [];
      const currentIso = new Date().toISOString();
      let startIndex = 0;
      if (hourlyRaw && hourlyRaw.time) {
        for (let i = 0; i < hourlyRaw.time.length; i++) {
          if (hourlyRaw.time[i] >= currentIso.slice(0, 13)) {
            startIndex = i;
            break;
          }
        }
        for (let i = startIndex; i < Math.min(startIndex + 24, hourlyRaw.time.length); i++) {
          const desc = getWmoWeatherDescription(hourlyRaw.weather_code[i]);
          hourly.push({
            time: hourlyRaw.time[i],
            temperature: Math.round(hourlyRaw.temperature_2m[i]),
            feelsLike: Math.round(hourlyRaw.apparent_temperature[i]),
            precipitationProbability: Math.round(hourlyRaw.precipitation_probability[i] || 0),
            precipitation: Number(hourlyRaw.precipitation[i] || 0),
            windSpeed: Math.round(hourlyRaw.wind_speed_10m[i] || 0),
            uvIndex: Math.round(hourlyRaw.uv_index[i] || 0),
            humidity: Math.round(hourlyRaw.relative_humidity_2m[i] || 0),
            wmoCode: hourlyRaw.weather_code[i],
            condition: desc.description,
            isDay: Boolean(hourlyRaw.is_day[i])
          });
        }
      }

      // Daily items (next 7 days)
      const daily: DailyForecastItem[] = [];
      if (dailyRaw && dailyRaw.time) {
        for (let i = 0; i < Math.min(7, dailyRaw.time.length); i++) {
          const desc = getWmoWeatherDescription(dailyRaw.weather_code[i]);
          daily.push({
            date: dailyRaw.time[i],
            temperatureMin: Math.round(dailyRaw.temperature_2m_min[i]),
            temperatureMax: Math.round(dailyRaw.temperature_2m_max[i]),
            precipitationProbability: Math.round(dailyRaw.precipitation_probability_max[i] || 0),
            precipitationSum: Number(dailyRaw.precipitation_sum[i] || 0),
            windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max[i] || 0),
            uvIndexMax: Math.round(dailyRaw.uv_index_max[i] || 0),
            sunrise: dailyRaw.sunrise[i] ? dailyRaw.sunrise[i].slice(11, 16) : '--:--',
            sunset: dailyRaw.sunset[i] ? dailyRaw.sunset[i].slice(11, 16) : '--:--',
            wmoCode: dailyRaw.weather_code[i],
            condition: desc.description
          });
        }
      }

      // Calculate severe weather alerts from live parameters
      const alerts: WeatherAlertItem[] = [];
      const currentUv = hourly[0]?.uvIndex ?? 0;

      if (currentRaw.temperature_2m >= 39) {
        alerts.push({
          id: `heat-${lat}-${lon}`,
          title: "Extreme Heat Warning",
          severity: "extreme",
          category: "heat",
          description: `Current temperature is ${Math.round(currentRaw.temperature_2m)}°C with high thermal stress risk.`,
          instruction: "Avoid prolonged midday sun exposure and stay hydrated.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 6 * 3600000).toISOString(),
          source: "Mausam Met Engine"
        });
      }

      if (currentRaw.wind_speed_10m >= 50) {
        alerts.push({
          id: `wind-${lat}-${lon}`,
          title: "Gale Wind Warning",
          severity: "severe",
          category: "wind",
          description: `High sustained winds of ${Math.round(currentRaw.wind_speed_10m)} km/h detected in the area.`,
          instruction: "Secure loose outdoor items and exercise caution while driving high-profile vehicles.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 4 * 3600000).toISOString(),
          source: "Mausam Met Engine"
        });
      }

      if (hourly[0]?.precipitationProbability >= 80 || currentRaw.weather_code === 95 || currentRaw.weather_code === 96) {
        alerts.push({
          id: `rain-${lat}-${lon}`,
          title: currentRaw.weather_code >= 95 ? "Severe Thunderstorm Warning" : "Heavy Rain Advisory",
          severity: currentRaw.weather_code >= 95 ? "severe" : "moderate",
          category: currentRaw.weather_code >= 95 ? "storm" : "rain",
          description: `Precipitation probability is elevated (${hourly[0]?.precipitationProbability || 85}%) with risk of sudden downpours.`,
          instruction: "Carry rain protection and plan for potential traffic delays.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 3 * 3600000).toISOString(),
          source: "Mausam Met Engine"
        });
      }

      if (airQuality && airQuality.aqi > 150) {
        alerts.push({
          id: `aqi-${lat}-${lon}`,
          title: "Unhealthy Air Quality Advisory",
          severity: airQuality.aqi > 200 ? "severe" : "moderate",
          category: "aqi",
          description: `AQI has reached ${airQuality.aqi} (${airQuality.status}). Dominant pollutant: ${airQuality.dominantPollutant}.`,
          instruction: "Sensitive groups, children, and elderly should limit prolonged outdoor exertion.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 8 * 3600000).toISOString(),
          source: "CPCB / Open-Meteo Air Quality"
        });
      }

      if (currentUv >= 8) {
        alerts.push({
          id: `uv-${lat}-${lon}`,
          title: "Very High UV Radiation Alert",
          severity: "moderate",
          category: "heat",
          description: `Peak UV Index of ${currentUv} detected during daylight hours.`,
          instruction: "Apply SPF 30+ sunscreen and wear sunglasses if spending extended time outdoors.",
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 4 * 3600000).toISOString(),
          source: "Mausam Met Engine"
        });
      }

      const location: WeatherLocation = {
        name: locationMeta?.name || "Target Location",
        region: locationMeta?.region,
        country: locationMeta?.country || "",
        lat,
        lon,
        timezone: forecastData.timezone
      };

      return {
        location,
        current: {
          temperature: Math.round(currentRaw.temperature_2m),
          feelsLike: Math.round(currentRaw.apparent_temperature),
          humidity: Math.round(currentRaw.relative_humidity_2m),
          pressure: Math.round(currentRaw.surface_pressure),
          windSpeed: Math.round(currentRaw.wind_speed_10m),
          windDirection: Math.round(currentRaw.wind_direction_10m),
          windGusts: currentRaw.wind_gusts_10m ? Math.round(currentRaw.wind_gusts_10m) : undefined,
          visibility: hourlyRaw?.visibility?.[0] ? Number((hourlyRaw.visibility[0] / 1000).toFixed(1)) : 10,
          uvIndex: currentUv,
          wmoCode: currentRaw.weather_code,
          condition: currentWeatherDesc.description,
          isDay: Boolean(currentRaw.is_day),
          precipitation: Number(currentRaw.precipitation || 0)
        },
        airQuality,
        hourly,
        daily,
        alerts,
        agriculture: {
          frostRisk: currentRaw.temperature_2m < 2,
          isSensorLive: false,
          note: "Direct soil sensor data requires IoT gateway connection. Atmospheric agro-indicators derived from Met telemetry."
        },
        marine: {
          isAvailable: false
        },
        provider: this.name,
        isLive: true,
        fetchedAt: new Date().toISOString()
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`OpenMeteoProvider error: ${err.message || 'Unknown network error'}`);
    }
  }

  async searchLocations(query: string): Promise<WeatherLocation[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((item: any) => ({
        name: item.name,
        region: item.admin1 || item.admin2,
        country: item.country || "",
        lat: item.latitude,
        lon: item.longitude,
        timezone: item.timezone
      }));
    } catch {
      return [];
    }
  }
}
