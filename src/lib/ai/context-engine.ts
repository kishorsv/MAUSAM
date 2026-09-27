import { db } from "../db/database";
import { weatherService } from "../weather/service";
import { WeatherPayload, WeatherLocation } from "../weather/types";
import { AIContextPayload, AIIntent } from "./types";
import { intentRouter, IntentRouteResult } from "./intent-router";

export class WeatherContextEngine {
  /**
   * Concurrently gathers and builds an isolated, grounded context payload for the AI
   */
  async buildContext(params: {
    question: string;
    userId: string;
    conversationId?: string;
    providedWeather?: WeatherPayload | null;
    targetLocationOverride?: WeatherLocation;
  }): Promise<{ context: AIContextPayload; route: IntentRouteResult }> {
    const { question, userId, conversationId, providedWeather, targetLocationOverride } = params;

    // 1. Classify Intent and route context requirements
    const route = intentRouter.classify(question);

    // 2. Concurrently fetch database profiles and saved locations in parallel
    const [prefsResult, savedLocsResult, memoryResult, messagesResult] = await Promise.allSettled([
      db.getPreferences(userId),
      db.getSavedLocations(userId),
      db.getAIMemory(userId),
      conversationId ? db.getAIMessages(conversationId, 6) : Promise.resolve([])
    ]);

    const preferences = prefsResult.status === 'fulfilled' ? prefsResult.value : null;
    const savedLocations = savedLocsResult.status === 'fulfilled' ? savedLocsResult.value : [];
    const memory = memoryResult.status === 'fulfilled' ? memoryResult.value : undefined;
    const recentMessages = messagesResult.status === 'fulfilled' 
      ? messagesResult.value.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      : [];

    // 3. Resolve Target Location
    let targetLocation: WeatherLocation = targetLocationOverride || providedWeather?.location || {
      name: 'Bengaluru',
      region: 'Karnataka',
      country: 'India',
      lat: 12.9716,
      lon: 77.5946
    };
    let locationSource: 'current_gps' | 'saved_location' | 'query_parsed' = 'current_gps';

    if (route.extractedLocation) {
      const qLoc = route.extractedLocation.toLowerCase();
      // Check saved locations first (e.g. "home", "office", "college", "cubbon park")
      const matchedSaved = savedLocations.find(s => 
        s.name.toLowerCase().includes(qLoc) || 
        s.location_type.toLowerCase() === qLoc ||
        (qLoc.includes('college') && s.location_type === 'school') ||
        (qLoc.includes('office') && s.location_type === 'office') ||
        (qLoc.includes('home') && s.location_type === 'home')
      );

      if (matchedSaved) {
        targetLocation = {
          name: matchedSaved.name,
          country: 'India',
          lat: matchedSaved.latitude,
          lon: matchedSaved.longitude
        };
        locationSource = 'saved_location';
      } else {
        // Query parsed location
        locationSource = 'query_parsed';
      }
    }

    // 4. Resolve Weather Data (use provided weather if matching location, or fetch via weather service)
    let weatherData: WeatherPayload;
    if (
      providedWeather && 
      Math.abs(providedWeather.location.lat - targetLocation.lat) < 0.05 && 
      Math.abs(providedWeather.location.lon - targetLocation.lon) < 0.05
    ) {
      weatherData = providedWeather;
    } else {
      try {
        weatherData = await weatherService.getWeather(targetLocation.lat, targetLocation.lon, { locationMeta: targetLocation });
      } catch {
        // Fallback to provided weather or demo provider if remote fetch encounters a glitch
        weatherData = providedWeather || await weatherService.getWeather(targetLocation.lat, targetLocation.lon, { 
          forceDemo: true, 
          locationMeta: targetLocation 
        });
      }
    }

    // 5. Calculate data age in seconds
    const fetchedTime = new Date(weatherData.fetchedAt).getTime();
    const nowTime = Date.now();
    const dataAgeSeconds = Math.max(0, Math.round((nowTime - fetchedTime) / 1000));

    // 6. Assemble Grounded Context Payload
    const context: AIContextPayload = {
      intent: route.intent,
      location: {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        lat: weatherData.location.lat,
        lon: weatherData.location.lon,
        source: locationSource
      },
      weather: {
        temperature: weatherData.current.temperature,
        feelsLike: weatherData.current.feelsLike,
        condition: weatherData.current.condition,
        rainProbability: weatherData.hourly[0]?.precipitationProbability ?? 0,
        precipitationMm: weatherData.current.precipitation,
        windSpeed: weatherData.current.windSpeed,
        windDirection: weatherData.current.windDirection,
        humidity: weatherData.current.humidity,
        uvIndex: weatherData.current.uvIndex,
        visibilityKm: weatherData.current.visibility,
        pressureHpa: weatherData.current.pressure,
        sunrise: weatherData.daily[0]?.sunrise ? weatherData.daily[0].sunrise.slice(-5) : '06:12',
        sunset: weatherData.daily[0]?.sunset ? weatherData.daily[0].sunset.slice(-5) : '18:25',
        isDay: weatherData.current.isDay,
        dataAgeSeconds,
        dataSource: weatherData.provider
      },
      airQuality: weatherData.airQuality ? {
        aqi: weatherData.airQuality.aqi,
        status: weatherData.airQuality.status,
        pm25: weatherData.airQuality.pm25,
        pm10: weatherData.airQuality.pm10
      } : undefined,
      alerts: weatherData.alerts.map(a => ({
        title: a.title,
        severity: a.severity,
        description: a.description
      })),
      userContext: {
        language: preferences?.language || 'en',
        temperatureUnit: preferences?.temperature_unit || 'celsius',
        lifestyle: preferences 
          ? Object.entries(preferences)
              .filter(([k, v]) => k.endsWith('_enabled') && v)
              .map(([k]) => k.replace('_enabled', ''))
          : ['fitness', 'health'],
        savedLocations: savedLocations.map(s => ({ name: s.name, type: s.location_type }))
      },
      memory,
      recentMessages
    };

    return { context, route };
  }
}

export const weatherContextEngine = new WeatherContextEngine();
