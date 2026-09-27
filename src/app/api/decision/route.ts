import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { weatherDecisionEngine } from "@/lib/intelligence/decision-engine";
import { WeatherPayload } from "@/lib/weather/types";

export async function POST(req: NextRequest) {
  try {
    const { weather, preferences: overridePrefs } = await req.json() as { weather: WeatherPayload; preferences?: any };

    if (!weather || !weather.current) {
      return NextResponse.json({ error: "Missing weather payload" }, { status: 400 });
    }

    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const prefs = overridePrefs || (await db.getPreferences(userId));
    const events = await db.getEvents(userId);
    const travelPlans = await db.getTravelPlans(userId);

    const decision = weatherDecisionEngine.evaluate(weather, prefs, events, travelPlans);

    return NextResponse.json({
      success: true,
      decision
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to evaluate decision engine" }, { status: 500 });
  }
}
