import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { weatherService } from "@/lib/weather/service";
import { db } from "@/lib/db/database";

export async function GET() {
  try {
    const session = await getCurrentUser();
    // Allow admin access or dev mode access
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && session?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const weatherHealth = weatherService.getHealth();
    const systemStats = await db.getSystemStats();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      dataMode: process.env.NEXT_PUBLIC_DATA_MODE || 'live',
      provider: weatherHealth,
      database: {
        engine: process.env.DATABASE_URL ? 'PostgreSQL (Connected)' : 'Local Resilient Storage (Active)',
        stats: systemStats
      },
      system: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load admin telemetry" }, { status: 500 });
  }
}
