import { NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";

export async function GET() {
  try {
    const health = weatherService.getHealth();
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      provider: health
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "unhealthy", error: err.message },
      { status: 500 }
    );
  }
}
