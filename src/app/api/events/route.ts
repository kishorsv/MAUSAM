import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const events = await db.getEvents(userId);
    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { title, event_date, start_time, end_time, location_name, latitude, longitude, is_outdoor } = await req.json();

    if (!title || !event_date || !start_time || !location_name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Title, date, time, location, and coordinates are required." }, { status: 400 });
    }

    const newEvent = await db.addEvent(userId, {
      title,
      event_date,
      start_time,
      end_time,
      location_name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      is_outdoor: is_outdoor !== false,
      comfort_score: 85,
      weather_summary: "Forecast indicates favorable conditions for planned timing."
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Event id required" }, { status: 400 });

    const deleted = await db.deleteEvent(userId, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete event" }, { status: 500 });
  }
}
