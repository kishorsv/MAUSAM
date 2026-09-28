import { NextRequest, NextResponse } from "next/server";
import { locationService } from "@/lib/location/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (!latStr || !lonStr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COORDINATES",
            message: "Latitude and longitude query parameters are required.",
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COORDINATE_BOUNDS",
            message: "Coordinates must be valid numbers within -90..90 lat and -180..180 lon.",
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    const geocoded = await locationService.reverseGeocode(lat, lon);
    const normalized = locationService.normalize(lat, lon, geocoded, 'browser');

    return NextResponse.json({
      success: true,
      location: normalized
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GEOCODE_FAILED",
          message: err.message || "Failed to reverse geocode coordinates.",
          retryable: true
        }
      },
      { status: 500 }
    );
  }
}
