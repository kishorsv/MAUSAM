import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";
import { locationService } from "@/lib/location/service";
import { WeatherValidator } from "@/lib/weather/validator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");
    let name = searchParams.get("name") || undefined;
    let region = searchParams.get("region") || undefined;
    let country = searchParams.get("country") || undefined;
    const forceDemo = searchParams.get("demo") === "true";
    const bypassCache = searchParams.get("refresh") === "true";

    if (!latStr || !lonStr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_COORDINATES",
            message: "Latitude and longitude query parameters are required.",
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (!WeatherValidator.validateCoordinates(lat, lon)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COORDINATES",
            message: "Latitude must be between -90 and 90, and longitude between -180 and 180.",
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    // Auto-resolve real city / locality if not provided
    if (!name || name === 'Current Location' || name === 'Device GPS Location' || name === 'Target Location') {
      try {
        const geo = await locationService.reverseGeocode(lat, lon);
        name = geo.city;
        region = geo.locality || geo.state || region;
        country = geo.country || country;
      } catch {
        // Safe fallback
        if (!name) name = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      }
    }

    const weatherPayload = await weatherService.getWeather(lat, lon, {
      forceDemo,
      bypassCache,
      locationMeta: { name, region, country }
    });

    const validated = WeatherValidator.validatePayload(weatherPayload);

    // Support both standardized root format and direct payload fields for backward-compatibility
    return NextResponse.json({
      ...validated.payload,
      success: true,
      standardized: validated
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WEATHER_API_TIMEOUT",
          message: "Live weather data temporarily unavailable.",
          details: err.message,
          retryable: true
        }
      },
      { status: 503 }
    );
  }
}
