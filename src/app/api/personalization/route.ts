import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { personalizationEngine } from "@/lib/personalization/engine";
import { smartAutomationEngine } from "@/lib/automation/rules";
import { calculateFitnessScore, calculateOutdoorScore, calculateCommuteScore, calculateEventScore } from "@/lib/scores/weather-scores";
import { WeatherPayload } from "@/lib/weather/types";

export async function POST(req: NextRequest) {
  try {
    const { weather, preferences: overridePrefs } = await req.json() as { weather: WeatherPayload; preferences?: any };

    if (!weather || !weather.current) {
      return NextResponse.json({ error: "Missing weather payload" }, { status: 400 });
    }

    let prefs = overridePrefs;
    if (!prefs) {
      const session = await getCurrentUser();
      const userId = session?.userId || 'usr-demo-01';
      prefs = await db.getPreferences(userId);
    }

    // 1. Calculate deterministic card priority order
    const prioritizedCards = personalizationEngine.calculateCardPriorities(weather, prefs);

    // 2. Calculate fitness timeline windows
    const fitnessWindows = personalizationEngine.calculateFitnessWindows(weather.hourly, weather.airQuality?.aqi);

    // 3. Calculate smart weather scores
    const fitnessScore = calculateFitnessScore(weather.current, weather.airQuality, weather.hourly);
    const outdoorScore = calculateOutdoorScore(weather.current, weather.airQuality);
    const commuteScore = calculateCommuteScore(weather.current);
    const eventScore = calculateEventScore(weather.current, weather.hourly);

    // 4. Evaluate automated rules & insights
    const automatedInsights = smartAutomationEngine.evaluateRules(weather, prefs);

    return NextResponse.json({
      prioritizedCards,
      fitnessWindows,
      scores: {
        fitnessScore,
        outdoorScore,
        commuteScore,
        eventScore
      },
      insights: automatedInsights,
      activePreferences: prefs
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to compute personalization" }, { status: 500 });
  }
}
