import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/lib/weather/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const forceDemo = searchParams.get("demo") === "true";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await weatherService.searchLocations(q.trim(), forceDemo);
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: "Location search failed", results: [] }, { status: 500 });
  }
}
