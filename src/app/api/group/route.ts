import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { weatherService } from "@/lib/weather/service";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const groups = await db.getGroupWeather(userId);

    // Enrich group locations with live weather conditions and comparison status
    const enrichedGroups = await Promise.all(groups.map(async (group) => {
      const enrichedLocs = await Promise.all(group.locations.map(async (loc) => {
        try {
          const w = await weatherService.getWeather(loc.latitude, loc.longitude, { locationMeta: { name: loc.name } });
          const rain = w.hourly[0]?.precipitationProbability ?? 0;
          let status: 'Good' | 'Moderate' | 'Poor' = 'Good';
          if (rain > 60 || w.current.precipitation > 0 || (w.airQuality && w.airQuality.aqi > 150)) {
            status = 'Poor';
          } else if (rain > 30 || w.current.temperature > 32) {
            status = 'Moderate';
          }

          return {
            ...loc,
            status,
            temperature: w.current.temperature,
            condition: w.current.condition,
            rainProb: rain
          };
        } catch {
          return loc;
        }
      }));

      return {
        ...group,
        locations: enrichedLocs
      };
    }));

    return NextResponse.json({ success: true, groups: enrichedGroups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load group weather" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { title, group_type, cityNames } = await req.json();

    if (!title || !cityNames || !Array.isArray(cityNames) || cityNames.length === 0) {
      return NextResponse.json({ error: "Title and array of cities required." }, { status: 400 });
    }

    const locations = [];
    for (const city of cityNames) {
      try {
        const geoResults = await weatherService.searchLocations(city);
        if (geoResults.length > 0) {
          locations.push({
            name: geoResults[0].name,
            latitude: geoResults[0].lat,
            longitude: geoResults[0].lon,
            status: 'Good' as const
          });
        }
      } catch {
        // ignore
      }
    }

    const newGroup = await db.addGroupWeather(userId, {
      title,
      group_type: group_type || 'road_trip',
      locations
    });

    return NextResponse.json({ success: true, group: newGroup }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create group weather" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Group ID required" }, { status: 400 });

    const deleted = await db.deleteGroupWeather(userId, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete group weather" }, { status: 500 });
  }
}
