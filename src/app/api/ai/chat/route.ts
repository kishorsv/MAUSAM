import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { askMausamAI } from "@/lib/ai/gemini";
import { WeatherPayload } from "@/lib/weather/types";

export async function POST(req: NextRequest) {
  try {
    const { question, weather } = await req.json() as { question: string; weather: WeatherPayload };

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
    }

    if (!weather || !weather.current) {
      return NextResponse.json({ error: "Real-time weather context is required for Mausam AI." }, { status: 400 });
    }

    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const preferences = await db.getPreferences(userId);

    const aiResult = await askMausamAI(question, weather, preferences);

    return NextResponse.json(aiResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process AI query" }, { status: 500 });
  }
}
