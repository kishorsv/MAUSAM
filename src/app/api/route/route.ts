import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { weatherService } from "@/lib/weather/service";
import { RouteWaypoint } from "@/lib/db/types";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const trips = await db.getRouteTrips(userId);

    // Enrich waypoints with live weather conditions along each route
    const enrichedTrips = await Promise.all(trips.map(async (trip) => {
      const enrichedWaypoints: RouteWaypoint[] = await Promise.all(trip.waypoints.map(async (wp) => {
        try {
          const w = await weatherService.getWeather(wp.latitude, wp.longitude, { locationMeta: { name: wp.name } });
          return {
            ...wp,
            temp: w.current.temperature,
            condition: w.current.condition,
            rainProb: w.hourly[0]?.precipitationProbability ?? 0,
            windSpeed: w.current.windSpeed,
            visibility: w.current.visibility,
            alerts: w.alerts.map(a => a.title)
          };
        } catch {
          return wp;
        }
      }));

      return {
        ...trip,
        waypoints: enrichedWaypoints
      };
    }));

    return NextResponse.json({ success: true, trips: enrichedTrips });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load route trips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { title, start_location, end_location, stops, travel_mode } = await req.json();

    if (!title || !start_location || !end_location) {
      return NextResponse.json({ error: "Title, start, and end locations are required." }, { status: 400 });
    }

    // Geocode all stops
    const allStopNames = [start_location, ...(stops || []), end_location];
    const waypoints: RouteWaypoint[] = [];

    for (const name of allStopNames) {
      try {
        const geoResults = await weatherService.searchLocations(name);
        if (geoResults.length > 0) {
          waypoints.push({
            name: geoResults[0].name,
            latitude: geoResults[0].lat,
            longitude: geoResults[0].lon
          });
        } else {
          waypoints.push({
            name,
            latitude: 12.9716,
            longitude: 77.5946
          });
        }
      } catch {
        waypoints.push({ name, latitude: 12.9716, longitude: 77.5946 });
      }
    }

    const newTrip = await db.addRouteTrip(userId, {
      title,
      start_location,
      end_location,
      waypoints,
      travel_mode: travel_mode || 'car'
    });

    return NextResponse.json({ success: true, trip: newTrip }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create route trip" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Trip ID required" }, { status: 400 });

    const deleted = await db.deleteRouteTrip(userId, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete trip" }, { status: 500 });
  }
}
