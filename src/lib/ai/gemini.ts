import { WeatherPayload } from "../weather/types";
import { UserPreferences } from "../db/types";
import { aiService } from "./service";
import { AIStructuredResponse } from "./types";

export interface AIResponsePayload {
  observedWeather: {
    location: string;
    temperature: string;
    condition: string;
    rainProbability: string;
    aqi?: string;
    uvIndex: number;
    windSpeed: string;
  };
  recommendation: string;
  actionItems: string[];
  confidence: 'High' | 'Moderate';
  poweredBy: 'Google Gemini' | 'Mausam Weather Synthesizer' | 'OpenAI';
}

export async function askMausamAI(
  userQuestion: string,
  weather: WeatherPayload,
  preferences?: UserPreferences | null
): Promise<AIResponsePayload> {
  const result: AIStructuredResponse = await aiService.ask({
    question: userQuestion,
    userId: preferences?.user_id || 'usr-demo-01',
    providedWeather: weather
  });

  return {
    observedWeather: {
      location: result.observedWeather.location,
      temperature: result.observedWeather.temperature,
      condition: result.observedWeather.condition,
      rainProbability: result.observedWeather.rainProbability,
      aqi: result.observedWeather.aqi,
      uvIndex: result.observedWeather.uvIndex,
      windSpeed: result.observedWeather.windSpeed
    },
    recommendation: result.recommendation,
    actionItems: result.actionItems,
    confidence: result.confidence,
    poweredBy: result.provider as any
  };
}
