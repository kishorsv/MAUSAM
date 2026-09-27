import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";
import { rainNowcastingEngine } from "@/lib/weather/nowcast";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 12.9716;
    const lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : 77.5946;

    const weather = await weatherService.getWeather(lat, lon);
    const nowcast = rainNowcastingEngine.calculateNowcast(weather);

    return NextResponse.json({
      success: true,
      location: weather.location,
      nowcast
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Unable to calculate rain nowcast.",
      details: err.message
    }, { status: 500 });
  }
}
