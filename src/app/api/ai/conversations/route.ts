import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const messages = await db.getAIMessages(conversationId);
      return NextResponse.json({ conversationId, messages });
    }

    const conversations = await db.getAIConversations(userId);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const body = await req.json().catch(() => ({}));

    if (body.action === 'clear_all') {
      await db.clearAIConversations(userId);
      return NextResponse.json({ success: true, message: "Conversation history cleared." });
    }

    const newConv = await db.createAIConversation(userId, body.title);
    return NextResponse.json({ success: true, conversation: newConv });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation id is required." }, { status: 400 });
    }

    await db.deleteAIConversation(conversationId);
    return NextResponse.json({ success: true, message: "Conversation deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete conversation" }, { status: 500 });
  }
}
