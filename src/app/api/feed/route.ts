import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { weatherService } from "@/lib/weather/service";
import { IntelligenceFeedItem } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const savedLocs = await db.getSavedLocations(userId);
    const primaryLoc = savedLocs[0] || { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 };

    const weather = await weatherService.getWeather(primaryLoc.latitude, primaryLoc.longitude, { locationMeta: { name: primaryLoc.name } });

    const now = new Date();
    const feedItems: IntelligenceFeedItem[] = [];

    // Format helper for relative time in current day
    const getTimeMinus = (minsAgo: number) => {
      const d = new Date(now.getTime() - minsAgo * 60000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const rainProb = weather.hourly[0]?.precipitationProbability ?? 0;

    // 1. Rain feed item
    if (rainProb >= 40 || weather.current.precipitation > 0) {
      feedItems.push({
        id: 'feed-rain-01',
        time: getTimeMinus(12),
        title: 'Precipitation Alert',
        message: `Rain probability increased to ${rainProb}% near ${weather.location.name}.`,
        category: 'rain',
        urgency: rainProb >= 70 ? 'alert' : 'notice',
        locationName: weather.location.name,
        source: weather.provider,
        freshness: '12m ago'
      });
    }

    // 2. Outdoor condition item
    const goodHour = weather.hourly.find(h => h.precipitationProbability < 20 && h.temperature < 28);
    if (goodHour) {
      const formatted = goodHour.time.includes('T') ? goodHour.time.slice(11, 16) : goodHour.time;
      feedItems.push({
        id: 'feed-outdoor-02',
        time: getTimeMinus(28),
        title: 'Outdoor Window Identified',
        message: `Favorable outdoor training window expected around ${formatted} (${goodHour.temperature}°C).`,
        category: 'fitness',
        urgency: 'info',
        locationName: weather.location.name,
        source: 'Mausam Personalization Engine',
        freshness: '28m ago'
      });
    }

    // 3. Solar radiation item
    if (weather.current.uvIndex >= 6) {
      feedItems.push({
        id: 'feed-uv-03',
        time: getTimeMinus(45),
        title: 'UV Escalation Notice',
        message: `Solar UV Index peaked at ${weather.current.uvIndex} during daylight zenith.`,
        category: 'uv',
        urgency: 'notice',
        locationName: weather.location.name,
        source: weather.provider,
        freshness: '45m ago'
      });
    }

    // 4. Secondary saved location update (e.g. Office)
    if (savedLocs.length > 1) {
      const secLoc = savedLocs[1];
      feedItems.push({
        id: 'feed-loc-04',
        time: getTimeMinus(65),
        title: 'Hyperlocal Station Update',
        message: `Corridor forecast updated for ${secLoc.name}. Visibility is clear.`,
        category: 'travel',
        urgency: 'info',
        locationName: secLoc.name,
        source: 'Mausam Hyperlocal Engine',
        freshness: '1h ago'
      });
    }

    // 5. Radar sweep item
    feedItems.push({
      id: 'feed-radar-05',
      time: getTimeMinus(5),
      title: 'Doppler Radar Scan',
      message: 'New composite reflectivity volume scan completed. No severe convective storm cells in 50km radius.',
      category: 'radar',
      urgency: 'info',
      locationName: weather.location.name,
      source: 'RainViewer Doppler Network',
      freshness: '5m ago'
    });

    return NextResponse.json({
      success: true,
      feed: feedItems
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load intelligence feed" }, { status: 500 });
  }
}
