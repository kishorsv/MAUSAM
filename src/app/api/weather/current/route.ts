import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");
    const name = searchParams.get("name") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const forceDemo = searchParams.get("demo") === "true";

    const lat = latStr ? parseFloat(latStr) : 12.9716;
    const lon = lonStr ? parseFloat(lonStr) : 77.5946;

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: "Invalid latitude or longitude coordinates." }, { status: 400 });
    }

    const weather = await weatherService.getWeather(lat, lon, {
      forceDemo,
      locationMeta: { name, region, country }
    });

    return NextResponse.json(weather);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Live weather data temporarily unavailable.", details: err.message },
      { status: 503 }
    );
  }
}
