import { WeatherPayload, HourlyForecastItem } from "../weather/types";
import { UserPreferences, PlannedEvent, TravelPlan } from "../db/types";

export interface RiskTimelineSlot {
  timeLabel: string;
  riskLevel: 'Good' | 'Moderate' | 'High';
  riskColor: string;
  temperature: number;
  feelsLike: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  aqi?: number;
  visibility: number;
  condition: string;
  summary: string;
}

export interface DecisionEngineOutput {
  overallRiskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Severe';
  topPriorityAction: string;
  explanation: string;
  activityWindow?: {
    slot: string;
    verdict: string;
  };
  eventViabilityNote?: string;
  travelNote?: string;
  riskTimeline: RiskTimelineSlot[];
}

export class WeatherDecisionEngine {
  evaluate(
    weather: WeatherPayload,
    preferences?: UserPreferences | null,
    events?: PlannedEvent[],
    travelPlans?: TravelPlan[]
  ): DecisionEngineOutput {
    const current = weather.current;
    const aqi = weather.airQuality?.aqi ?? 50;
    const rainProb = weather.hourly[0]?.precipitationProbability ?? 0;

    // 1. Calculate Overall Risk Level
    let overallRiskLevel: DecisionEngineOutput['overallRiskLevel'] = 'Low';
    let topPriorityAction = "Conditions are stable. Proceed with standard scheduled routines.";
    let explanation = "All meteorological parameters (thermal, precipitation, particulate, wind) are within baseline safety margins.";

    if (weather.alerts.length > 0 || current.temperature >= 40 || current.windSpeed >= 50) {
      overallRiskLevel = 'Severe';
      topPriorityAction = weather.alerts[0]?.instruction || "Avoid non-essential outdoor travel and seek secure shelter.";
      explanation = `Active severe warning: ${weather.alerts[0]?.title || 'Extreme meteorological thresholds crossed'}.`;
    } else if (rainProb >= 70 || aqi >= 180 || current.uvIndex >= 10 || current.visibility < 3) {
      overallRiskLevel = 'Elevated';
      topPriorityAction = rainProb >= 70
        ? "Equip rain protection and prepare for extended road commute times."
        : aqi >= 180
        ? "Wear an N95 particulate mask outdoors or transfer workouts indoors."
        : "Apply broad-spectrum sunblock and minimize midday UV exposure.";
      explanation = `Elevated risk triggered by ${rainProb >= 70 ? 'high rain probability (' + rainProb + '%)' : aqi >= 180 ? 'unhealthy AQI (' + aqi + ')' : 'adverse weather elements'}.`;
    } else if (rainProb >= 40 || aqi >= 100 || current.temperature >= 33) {
      overallRiskLevel = 'Moderate';
      topPriorityAction = "Stay hydrated and check radar feed periodically.";
      explanation = "Mild atmospheric shifts observed. Moderate caution advised for sensitive individuals.";
    }

    // 2. Build 6-Slot Risk Timeline (6 AM, 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, 6 PM)
    const targetHours = [6, 8, 10, 12, 14, 16, 18, 20];
    const riskTimeline: RiskTimelineSlot[] = targetHours.map(hour => {
      const hourStr = hour < 10 ? `0${hour}:` : `${hour}:`;
      const match = weather.hourly.find(h => h.time.includes(hourStr)) || weather.hourly[0];
      
      const slotTemp = match?.temperature ?? current.temperature;
      const slotRain = match?.precipitationProbability ?? rainProb;
      const slotWind = match?.windSpeed ?? current.windSpeed;
      const slotUv = match?.uvIndex ?? 0;

      let riskLevel: RiskTimelineSlot['riskLevel'] = 'Good';
      let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      let summary = "Mild and comfortable conditions.";

      if (slotRain >= 65 || slotTemp >= 37 || slotWind >= 45 || aqi >= 180) {
        riskLevel = 'High';
        riskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        summary = slotRain >= 65 ? "Elevated precipitation probability" : "Thermal or air particulate strain";
      } else if (slotRain >= 35 || slotTemp >= 32 || slotUv >= 8 || aqi >= 100) {
        riskLevel = 'Moderate';
        riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        summary = "Moderate weather caution advised";
      }

      const displayHour = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

      return {
        timeLabel: displayHour,
        riskLevel,
        riskColor,
        temperature: slotTemp,
        feelsLike: match?.feelsLike ?? slotTemp,
        precipitationProbability: slotRain,
        windSpeed: slotWind,
        humidity: match?.humidity ?? current.humidity,
        uvIndex: slotUv,
        aqi,
        visibility: current.visibility,
        condition: match?.condition ?? current.condition,
        summary
      };
    });

    // 3. Event and Travel Viability Notes
    let eventViabilityNote: string | undefined = undefined;
    if (events && events.length > 0) {
      const topEvent = events[0];
      eventViabilityNote = rainProb > 40
        ? `Event "${topEvent.title}" at ${topEvent.location_name} faces a ${rainProb}% rain chance. Waterproof canopy advised.`
        : `Event "${topEvent.title}" has favorable weather forecast (${current.temperature}°C, ${current.condition}).`;
    }

    let travelNote: string | undefined = undefined;
    if (travelPlans && travelPlans.length > 0) {
      const topTrip = travelPlans[0];
      travelNote = `Monitoring departure route to ${topTrip.destination_name} for ${topTrip.departure_date}.`;
    }

    return {
      overallRiskLevel,
      topPriorityAction,
      explanation,
      riskTimeline,
      eventViabilityNote,
      travelNote
    };
  }
}

export const weatherDecisionEngine = new WeatherDecisionEngine();
