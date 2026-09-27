import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const notifications = await db.getNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { title, message, category, severity, metadata } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    const notif = await db.addNotification(userId, {
      title,
      message,
      category: category || 'rain',
      severity: severity || 'moderate',
      metadata
    });

    return NextResponse.json({ success: true, notification: notif }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { id, markAll } = await req.json();

    if (markAll) {
      await db.markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      await db.markNotificationRead(userId, id);
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Notification id or markAll flag required" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update notification status" }, { status: 500 });
  }
}
