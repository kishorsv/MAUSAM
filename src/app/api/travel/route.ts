import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const plans = await db.getTravelPlans(userId);
    return NextResponse.json({ plans });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load travel plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { destination_name, latitude, longitude, departure_date, return_date, notes, packing_advice } = await req.json();

    if (!destination_name || latitude === undefined || longitude === undefined || !departure_date) {
      return NextResponse.json({ error: "Destination name, coordinates, and departure date are required." }, { status: 400 });
    }

    const newPlan = await db.addTravelPlan(userId, {
      destination_name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      departure_date,
      return_date,
      notes,
      packing_advice: packing_advice || ['Weather-appropriate layer', 'Comfortable walking footwear', 'Travel umbrella']
    });

    return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save travel plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Plan id required" }, { status: 400 });

    const deleted = await db.deleteTravelPlan(userId, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete travel plan" }, { status: 500 });
  }
}
