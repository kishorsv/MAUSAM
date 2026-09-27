import { NextRequest, NextResponse } from "next/server";
import { satelliteProvider } from "@/lib/providers/satellite-provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 12.9716;
    const lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : 77.5946;

    const data = await satelliteProvider.getSatelliteLayers(lat, lon);
    return NextResponse.json({
      success: true,
      provider: satelliteProvider.name,
      ...data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Satellite observation layers temporarily unavailable.",
      details: err.message
    }, { status: 503 });
  }
}
