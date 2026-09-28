import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const locations = await db.getSavedLocations(userId);
    return NextResponse.json({ locations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load saved locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { name, label, latitude, longitude, location_type, is_pinned, place_id, address } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Name, latitude, and longitude are required." }, { status: 400 });
    }

    const newLoc = await db.addSavedLocation(userId, {
      name,
      label: label || location_type || 'custom',
      latitude: Number(latitude),
      longitude: Number(longitude),
      location_type: location_type || 'custom',
      is_pinned: Boolean(is_pinned),
      place_id,
      address
    });

    return NextResponse.json({ success: true, location: newLoc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save location" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Location id is required" }, { status: 400 });
    }

    const deleted = await db.deleteSavedLocation(userId, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete location" }, { status: 500 });
  }
}
