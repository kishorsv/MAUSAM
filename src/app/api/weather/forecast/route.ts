import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";
import { WeatherValidator } from "@/lib/weather/validator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (!latStr || !lonStr) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_COORDINATES", message: "Latitude and longitude required." } },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (!WeatherValidator.validateCoordinates(lat, lon)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_COORDINATES", message: "Invalid coordinates." } },
        { status: 400 }
      );
    }

    const weatherPayload = await weatherService.getWeather(lat, lon);
    const validated = WeatherValidator.validatePayload(weatherPayload);

    return NextResponse.json({
      success: true,
      location: validated.location,
      hourly: validated.hourly,
      daily: validated.daily,
      alerts: validated.alerts,
      updatedAt: validated.updatedAt,
      cached: validated.cached
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "FORECAST_ERROR", message: err.message || "Failed to load forecast." } },
      { status: 503 }
    );
  }
}
