import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01'; // Fallback to demo profile for guest customization
    const preferences = await db.getPreferences(userId);
    return NextResponse.json(preferences);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load preferences" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const updates = await req.json();

    const updated = await db.updatePreferences(userId, updates);
    return NextResponse.json({ success: true, preferences: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update preferences" }, { status: 500 });
  }
}
