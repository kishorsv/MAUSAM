import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";
import { locationService } from "@/lib/location/service";
import { WeatherValidator } from "@/lib/weather/validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lat, lon, name, region, country } = body;

    const latitude = typeof lat === 'number' ? lat : parseFloat(lat);
    const longitude = typeof lon === 'number' ? lon : parseFloat(lon);

    if (!WeatherValidator.validateCoordinates(latitude, longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COORDINATES",
            message: "Valid numeric latitude and longitude are required.",
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    let cityName = name;
    let regionName = region;
    let countryName = country;

    if (!cityName) {
      try {
        const geo = await locationService.reverseGeocode(latitude, longitude);
        cityName = geo.city;
        regionName = geo.locality || geo.state;
        countryName = geo.country;
      } catch {
        cityName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
      }
    }

    // Force bypass cache for fresh real-time retrieval
    const weatherPayload = await weatherService.getWeather(latitude, longitude, {
      bypassCache: true,
      locationMeta: { name: cityName, region: regionName, country: countryName }
    });

    const validated = WeatherValidator.validatePayload(weatherPayload);

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
          code: "REFRESH_FAILED",
          message: err.message || "Failed to refresh live weather data.",
          retryable: true
        }
      },
      { status: 503 }
    );
  }
}
