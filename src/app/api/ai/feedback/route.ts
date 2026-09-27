import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const body = await req.json();

    const { messageId, rating, feedbackText } = body as {
      messageId: string;
      rating: 'thumbs_up' | 'thumbs_down';
      feedbackText?: string;
    };

    if (!messageId || !rating) {
      return NextResponse.json({ error: "messageId and rating are required." }, { status: 400 });
    }

    const recorded = await db.recordAIFeedback({
      user_id: userId,
      message_id: messageId,
      rating,
      feedback_text: feedbackText
    });

    return NextResponse.json({ success: true, feedback: recorded });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record feedback." }, { status: 500 });
  }
}
