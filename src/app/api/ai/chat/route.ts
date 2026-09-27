import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { aiService } from "@/lib/ai/service";
import { WeatherPayload, WeatherLocation } from "@/lib/weather/types";
import { AIProviderName } from "@/lib/ai/types";

// In-memory rate limiting map: ip/userId -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    // 1. Rate Limiting Check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-client';
    const rateLimitKey = `${userId}:${clientIp}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before sending another query." },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 2. Parse and Validate Request Payload
    const body = await req.json();
    const { 
      question, 
      weather, 
      conversationId, 
      targetLocation, 
      stream = false,
      provider 
    } = body as {
      question: string;
      weather?: WeatherPayload | null;
      conversationId?: string;
      targetLocation?: WeatherLocation;
      stream?: boolean;
      provider?: AIProviderName;
    };

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json({ error: "Question exceeds maximum limit of 500 characters." }, { status: 400 });
    }

    // 3. Handle Streaming Response if requested
    const wantsStream = stream || req.headers.get('accept')?.includes('text/event-stream');

    if (wantsStream) {
      const responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      // Launch async stream generation
      aiService.askStream(
        {
          question: question.trim(),
          userId,
          conversationId,
          providedWeather: weather,
          targetLocationOverride: targetLocation,
          providerOverride: provider
        },
        (chunk) => {
          const sseEvent = `data: ${JSON.stringify(chunk)}\n\n`;
          writer.write(encoder.encode(sseEvent)).catch(() => {});
        }
      )
        .then(() => {
          writer.close().catch(() => {});
        })
        .catch((err) => {
          const errorEvent = `data: ${JSON.stringify({ error: err.message || "AI stream interrupted", isDone: true })}\n\n`;
          writer.write(encoder.encode(errorEvent)).catch(() => {});
          writer.close().catch(() => {});
        });

      return new Response(responseStream.readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        }
      });
    }

    // 4. Standard Non-Streaming JSON Response
    const response = await aiService.ask({
      question: question.trim(),
      userId,
      conversationId,
      providedWeather: weather,
      targetLocationOverride: targetLocation,
      providerOverride: provider
    });

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process AI query." },
      { status: 500 }
    );
  }
}
