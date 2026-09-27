import { AIIntent } from "./types";

export interface IntentRouteResult {
  intent: AIIntent;
  requiredContexts: Array<'weather' | 'forecast' | 'aqi' | 'uv' | 'fitness' | 'travel' | 'commute' | 'alerts' | 'saved_locations' | 'clothing' | 'agriculture' | 'event'>;
  extractedLocation?: string;
  isStructuredWeatherQuery: boolean;
}

export class IntentRouter {
  /**
   * Evaluates user prompt to route required contexts and extract entities
   */
  classify(prompt: string): IntentRouteResult {
    const text = prompt.toLowerCase().trim();

    // 1. Extract location hints (e.g. "in Delhi", "at college", "for Bangalore", "at my office")
    let extractedLocation: string | undefined;
    const locationMatch = text.match(/(?:in|at|for|around)\s+([a-zA-Z\s]{3,25})(?:\?|\.|\s|$)/i);
    if (locationMatch && locationMatch[1]) {
      const candidate = locationMatch[1].trim();
      const ignoreWords = ['the morning', 'the afternoon', 'the evening', 'night', 'now', 'today', 'tomorrow', 'this week', 'a run', 'cycling', 'outdoor'];
      if (!ignoreWords.includes(candidate)) {
        extractedLocation = candidate;
      }
    }

    // 2. Classify by Intent
    if (text.includes('run') || text.includes('jog') || text.includes('fitness') || text.includes('workout') || text.includes('cycling') || text.includes('exercise')) {
      return {
        intent: 'running_fitness',
        requiredContexts: ['weather', 'forecast', 'aqi', 'uv', 'fitness'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('rain') || text.includes('umbrella') || text.includes('shower') || text.includes('downpour') || text.includes('precipitation')) {
      return {
        intent: 'rain_forecast',
        requiredContexts: ['weather', 'forecast', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('aqi') || text.includes('air quality') || text.includes('pollution') || text.includes('smog') || text.includes('breathe') || text.includes('pm2.5') || text.includes('asthma')) {
      return {
        intent: 'weather_now',
        requiredContexts: ['weather', 'aqi', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('trip') || text.includes('travel') || text.includes('flight') || text.includes('highway') || text.includes('drive') || text.includes('journey')) {
      return {
        intent: 'travel',
        requiredContexts: ['weather', 'forecast', 'travel', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('commute') || text.includes('traffic') || text.includes('office') || text.includes('school') || text.includes('road')) {
      return {
        intent: 'commute',
        requiredContexts: ['weather', 'forecast', 'commute', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('farm') || text.includes('crop') || text.includes('soil') || text.includes('harvest') || text.includes('irrigation') || text.includes('sow') || text.includes('agriculture')) {
      return {
        intent: 'agriculture',
        requiredContexts: ['weather', 'forecast', 'agriculture'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('event') || text.includes('wedding') || text.includes('party') || text.includes('gathering') || text.includes('picnic') || text.includes('barbecue')) {
      return {
        intent: 'outdoor_event',
        requiredContexts: ['weather', 'forecast', 'event', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('wear') || text.includes('clothes') || text.includes('jacket') || text.includes('sweater') || text.includes('outfit')) {
      return {
        intent: 'clothing',
        requiredContexts: ['weather', 'clothing', 'uv'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('compare') || text.includes('tomorrow') || text.includes('yesterday') || text.includes('next week')) {
      return {
        intent: 'compare_days',
        requiredContexts: ['weather', 'forecast'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('saved') || text.includes('favorites') || text.includes('my locations') || text.includes('home') || text.includes('college')) {
      return {
        intent: 'saved_locations',
        requiredContexts: ['saved_locations', 'weather'],
        extractedLocation,
        isStructuredWeatherQuery: false
      };
    }

    if (text.includes('alert') || text.includes('warning') || text.includes('storm') || text.includes('cyclone') || text.includes('hazard')) {
      return {
        intent: 'alerts',
        requiredContexts: ['weather', 'alerts'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    if (text.includes('temperature') || text.includes('weather') || text.includes('now') || text.includes('current') || text.includes('outside')) {
      return {
        intent: 'weather_now',
        requiredContexts: ['weather', 'forecast', 'aqi', 'uv'],
        extractedLocation,
        isStructuredWeatherQuery: true
      };
    }

    return {
      intent: 'general',
      requiredContexts: ['weather'],
      extractedLocation,
      isStructuredWeatherQuery: false
    };
  }
}

export const intentRouter = new IntentRouter();
