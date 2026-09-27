import { UserPreferences } from "../db/types";
import { WeatherPayload, HourlyForecastItem } from "../weather/types";
import { CardId, PrioritizedCard, ActivityWindow } from "./types";

export class PersonalizationEngine {
  /**
   * Deterministically orders dashboard cards based on:
   * priority = userInterestScore + weatherSeverityScore + timeRelevanceScore + locationRelevanceScore + activityRelevanceScore
   */
  calculateCardPriorities(weather: WeatherPayload, prefs?: UserPreferences | null): PrioritizedCard[] {
    const cards: CardId[] = [
      'severe-alerts',
      'hero-weather',
      'rain-warning',
      'fitness-card',
      'health-card',
      'hourly-timeline',
      'smart-scores',
      'commute-card',
      'travel-card',
      'family-card',
      'agriculture-card',
      'event-card',
      'beach-card',
      'daily-forecast'
    ];

    const currentHour = new Date().getHours();
    const isCommuteHour = (currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20);
    const isFitnessHour = (currentHour >= 5 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19);

    const rainProb = weather.hourly[0]?.precipitationProbability ?? (weather.current.precipitation > 0 ? 80 : 10);
    const aqi = weather.airQuality?.aqi ?? 50;
    const isSevere = weather.alerts.length > 0;
    const isRainy = rainProb >= 50 || weather.current.precipitation > 0;

    const scoredCards: PrioritizedCard[] = cards.map(cardId => {
      let userInterestScore = 20; // baseline
      let weatherSeverityScore = 10;
      let timeRelevanceScore = 10;
      let locationRelevanceScore = 20;
      let activityRelevanceScore = 10;
      let explanation = "Standard baseline priority.";

      switch (cardId) {
        case 'severe-alerts':
          if (isSevere) {
            weatherSeverityScore = 200; // Critical priority override
            userInterestScore = 100;
            explanation = "Elevated to top: Active meteorological alerts require immediate awareness.";
          } else {
            weatherSeverityScore = 0;
            userInterestScore = 0;
            explanation = "No active severe alerts detected.";
          }
          break;

        case 'hero-weather':
          userInterestScore = 80;
          locationRelevanceScore = 50;
          explanation = "Essential current atmospheric conditions for your current location.";
          break;

        case 'rain-warning':
          if (isRainy) {
            weatherSeverityScore = 80;
            activityRelevanceScore = 40;
            explanation = `Elevated: ${rainProb}% rain probability detected in immediate forecast.`;
          } else {
            weatherSeverityScore = 5;
            explanation = "Clear conditions with low precipitation probability.";
          }
          break;

        case 'fitness-card':
          if (prefs?.fitness_enabled) {
            userInterestScore = 70;
            if (isFitnessHour) timeRelevanceScore = 35;
            if (isRainy || aqi > 120) {
              activityRelevanceScore = 45;
              explanation = "Prioritized for Fitness lifestyle: Weather conditions advise alternate activity timing.";
            } else {
              activityRelevanceScore = 30;
              explanation = "Prioritized for Fitness profile: Optimal outdoor workout windows identified.";
            }
          } else {
            userInterestScore = 10;
          }
          break;

        case 'health-card':
          if (prefs?.health_enabled) {
            userInterestScore = 75;
            if (aqi > 100 || weather.current.uvIndex > 7) {
              weatherSeverityScore = 65;
              activityRelevanceScore = 30;
              explanation = `High priority for Health: AQI is ${aqi} (${weather.airQuality?.status || 'Moderate'}) with UV ${weather.current.uvIndex}.`;
            } else {
              explanation = "Personalized for Health & Allergy: Monitoring ambient air particulate & UV levels.";
            }
          } else {
            userInterestScore = 15;
          }
          break;

        case 'commute-card':
          if (prefs?.commuter_enabled) {
            userInterestScore = 65;
            if (isCommuteHour) timeRelevanceScore = 45;
            if (isRainy || weather.current.visibility < 5) {
              weatherSeverityScore = 40;
              explanation = "Prioritized during transit hours: Rain and road visibility impact commute safety.";
            } else {
              explanation = "Active Commuter monitoring for peak travel windows.";
            }
          } else {
            userInterestScore = 10;
          }
          break;

        case 'travel-card':
          if (prefs?.travel_enabled) {
            userInterestScore = 60;
            explanation = "Destination weather intelligence & packing recommendations active.";
          } else {
            userInterestScore = 5;
          }
          break;

        case 'agriculture-card':
          if (prefs?.agriculture_enabled) {
            userInterestScore = 70;
            if (weather.agriculture?.frostRisk || isRainy) {
              weatherSeverityScore = 50;
              explanation = "Prioritized for Agriculture: Moisture, frost risk, and precipitation outlook.";
            } else {
              explanation = "Monitoring soil temperature & evaporation indices.";
            }
          } else {
            userInterestScore = 5;
          }
          break;

        case 'event-card':
          if (prefs?.event_enabled) {
            userInterestScore = 60;
            if (isRainy) weatherSeverityScore = 35;
            explanation = "Evaluating event comfort indices and outdoor viability.";
          } else {
            userInterestScore = 5;
          }
          break;

        case 'beach-card':
          if (prefs?.beach_enabled) {
            userInterestScore = 55;
            if (weather.current.windSpeed > 30) weatherSeverityScore = 30;
            explanation = "Coastal winds, UV index, and marine leisure conditions.";
          } else {
            userInterestScore = 5;
          }
          break;

        case 'family-card':
          if (prefs?.family_enabled) {
            userInterestScore = 60;
            if (isCommuteHour) timeRelevanceScore = 25;
            explanation = "Family safety: school route conditions and weather shifts.";
          } else {
            userInterestScore = 5;
          }
          break;

        case 'smart-scores':
          userInterestScore = 45;
          explanation = "Multi-activity contextual comfort scores.";
          break;

        case 'hourly-timeline':
          userInterestScore = 50;
          timeRelevanceScore = 30;
          explanation = "Real-time 24-hour hour-by-hour forecast progression.";
          break;

        case 'daily-forecast':
          userInterestScore = 40;
          explanation = "Multi-day outlook for mid-range weekly planning.";
          break;
      }

      const priorityScore =
        userInterestScore +
        weatherSeverityScore +
        timeRelevanceScore +
        locationRelevanceScore +
        activityRelevanceScore;

      let category: PrioritizedCard['category'] = 'core';
      if (cardId === 'severe-alerts' || cardId === 'rain-warning') category = 'alert';
      else if (cardId.endsWith('-card')) category = 'persona';
      else if (cardId.includes('forecast') || cardId.includes('hourly')) category = 'forecast';

      return {
        id: cardId,
        title: this.getCardTitle(cardId),
        category,
        priorityScore,
        rank: 0,
        explanation,
        scoringBreakdown: {
          userInterestScore,
          weatherSeverityScore,
          timeRelevanceScore,
          locationRelevanceScore,
          activityRelevanceScore
        }
      };
    });

    // Filter out inactive alerts card if there are no severe alerts
    const filtered = scoredCards.filter(c => {
      if (c.id === 'severe-alerts' && weather.alerts.length === 0) return false;
      if (c.id === 'rain-warning' && rainProb < 40 && weather.current.precipitation === 0) return false;
      return true;
    });

    // Deterministic sort: descending priorityScore
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign final rank
    return filtered.map((c, index) => ({
      ...c,
      rank: index + 1
    }));
  }

  /**
   * Calculates the best activity window for fitness users using hourly forecast data
   */
  calculateFitnessWindows(hourly: HourlyForecastItem[], aqi?: number): ActivityWindow[] {
    const windows: ActivityWindow[] = [];
    if (!hourly || hourly.length === 0) return windows;

    // Analyze next 12 hours
    const candidates = hourly.slice(0, 12);
    for (let i = 0; i < candidates.length; i += 2) {
      const h1 = candidates[i];
      const h2 = candidates[i + 1] || h1;
      const avgTemp = Math.round((h1.temperature + h2.temperature) / 2);
      const maxRainProb = Math.max(h1.precipitationProbability, h2.precipitationProbability);
      const maxWind = Math.max(h1.windSpeed, h2.windSpeed);

      let rating: ActivityWindow['rating'] = 'Optimal';
      let recommendation = 'Great time for outdoor running or cycling.';

      if (maxRainProb > 60 || avgTemp > 34 || maxWind > 40 || (aqi && aqi > 150)) {
        rating = 'Poor';
        recommendation = maxRainProb > 60
          ? 'High rain risk; indoor cardio recommended.'
          : (aqi && aqi > 150)
          ? 'Air quality is elevated; avoid strenuous outdoor breathing.'
          : 'High temperatures; stay hydrated or shift to early morning.';
      } else if (maxRainProb > 30 || avgTemp > 29 || maxWind > 25 || (aqi && aqi > 100)) {
        rating = 'Acceptable';
        recommendation = 'Suitable for moderate walking or light exercise with hydration.';
      }

      const formatTime = (timeStr: string) => {
        if (timeStr.includes('T')) return timeStr.slice(11, 16);
        return timeStr;
      };

      windows.push({
        startTime: formatTime(h1.time),
        endTime: formatTime(h2.time),
        temperature: avgTemp,
        condition: h1.condition,
        rainProbability: maxRainProb,
        aqi,
        rating,
        recommendation
      });
    }

    return windows;
  }

  private getCardTitle(id: CardId): string {
    switch (id) {
      case 'severe-alerts': return 'Severe Weather Alerts';
      case 'hero-weather': return 'Live Weather Conditions';
      case 'rain-warning': return 'Precipitation Alert';
      case 'fitness-card': return 'Fitness & Running Window';
      case 'health-card': return 'Air Quality & Allergy Watch';
      case 'hourly-timeline': return '24-Hour Timeline';
      case 'smart-scores': return 'Smart Lifestyle Scores';
      case 'commute-card': return 'Commute Weather Safety';
      case 'travel-card': return 'Travel Intelligence';
      case 'family-card': return 'Family Safety Overview';
      case 'agriculture-card': return 'Agri & Soil Conditions';
      case 'event-card': return 'Event Viability';
      case 'beach-card': return 'Beach & Marine Conditions';
      case 'daily-forecast': return '7-Day Extended Forecast';
    }
  }
}

export const personalizationEngine = new PersonalizationEngine();
