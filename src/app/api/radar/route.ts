import { NextResponse } from "next/server";
import { radarProvider } from "@/lib/providers/radar-provider";

export async function GET() {
  try {
    const radarData = await radarProvider.getRadarFrames();
    return NextResponse.json({
      success: true,
      provider: radarProvider.name,
      ...radarData
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Live radar data temporarily unavailable from telemetry provider.",
      details: err.message
    }, { status: 503 });
  }
}
