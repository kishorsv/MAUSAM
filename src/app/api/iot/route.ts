import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    const devices = await db.getSensorDevices(userId);
    const devicesWithReadings = await Promise.all(devices.map(async (d) => {
      const latestReading = await db.getLatestSensorReading(d.id);
      return {
        ...d,
        latestReading
      };
    }));

    return NextResponse.json({
      success: true,
      devices: devicesWithReadings
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load IoT devices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { deviceId, temperature, humidity, rain_gauge, soil_moisture, barometric_pressure, wind_speed, battery_level, name, device_model, mac_address, action } = await req.json();

    const session = await getCurrentUser();
    const userId = session?.userId || 'usr-demo-01';

    // Register a new IoT device
    if (action === 'register') {
      if (!name || !device_model) {
        return NextResponse.json({ error: "Device name and model required." }, { status: 400 });
      }
      const newDev = await db.addSensorDevice(userId, {
        name,
        device_model,
        mac_address: mac_address || '00:00:00:00:00:00'
      });
      return NextResponse.json({ success: true, device: newDev }, { status: 201 });
    }

    // Ingest actual telemetry from physical sensor
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required to post telemetry" }, { status: 400 });
    }

    const reading = await db.recordSensorReading(deviceId, {
      temperature: temperature !== undefined ? Number(temperature) : undefined,
      humidity: humidity !== undefined ? Number(humidity) : undefined,
      rain_gauge: rain_gauge !== undefined ? Number(rain_gauge) : undefined,
      soil_moisture: soil_moisture !== undefined ? Number(soil_moisture) : undefined,
      barometric_pressure: barometric_pressure !== undefined ? Number(barometric_pressure) : undefined,
      wind_speed: wind_speed !== undefined ? Number(wind_speed) : undefined,
      battery_level: battery_level !== undefined ? Number(battery_level) : undefined
    });

    return NextResponse.json({
      success: true,
      message: "Telemetry packet ingested successfully",
      reading
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process IoT request" }, { status: 500 });
  }
}
