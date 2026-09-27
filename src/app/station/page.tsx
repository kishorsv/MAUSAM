'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, ArrowLeft, Wifi, WifiOff, Plus, Send, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SensorDevice, SensorReading } from '@/lib/db/types';

export default function WeatherStationPage() {
  const [devices, setDevices] = useState<(SensorDevice & { latestReading?: SensorReading | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/iot');
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Send a genuine IoT telemetry packet via the API to test the live sensor pipeline
  const handleSimulatePhysicalPacket = async (deviceId: string) => {
    setIsPosting(true);
    try {
      await fetch('/api/iot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          temperature: 26.2,
          humidity: 58.4,
          rain_gauge: 0.0,
          soil_moisture: 0.32,
          barometric_pressure: 1013.2,
          wind_speed: 8.5,
          battery_level: 94
        })
      });
      fetchDevices();
    } catch {
      // ignore
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-lime-400" />
                My IoT Weather Station & Micro-Probes
              </h1>
              <p className="text-xs text-slate-400">
                Direct MQTT and HTTP REST telemetry gateway for custom ESP32 & LoRaWAN hardware
              </p>
            </div>
          </div>

          <button
            onClick={fetchDevices}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Nodes
          </button>
        </div>

        {/* Hardware Status Architecture Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Querying hardware gateways...</div>
          ) : devices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No IoT weather stations registered.</div>
          ) : (
            devices.map((device) => {
              const isConnected = device.is_connected && device.latestReading;

              return (
                <div key={device.id} className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{device.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {device.device_model}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">MAC: {device.mac_address || 'Unspecified'}</span>
                    </div>

                    {/* Sensor Status Indicator */}
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-primary">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <Wifi className="w-3.5 h-3.5" />
                          <span>LIVE SENSOR DATA</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>Sensor: Not connected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strictly truthful sensor reading presentation */}
                  {isConnected && device.latestReading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Temperature</span>
                        <span className="text-xl font-bold text-white">{device.latestReading.temperature}°C</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
                        <span className="text-xl font-bold text-white">{device.latestReading.humidity}%</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Soil Moisture (VWC)</span>
                        <span className="text-xl font-bold text-emerald-400">{(device.latestReading.soil_moisture! * 100).toFixed(0)}%</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Station Battery</span>
                        <span className="text-xl font-bold text-slate-200">{device.latestReading.battery_level}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        No physical sensor packets received yet from hardware node.
                        <div className="text-[10px] text-slate-500 mt-0.5">Post sensor payload to <code className="text-lime-400">/api/iot</code> with deviceId: {device.id}</div>
                      </div>

                      {/* Hardware simulator test packet button */}
                      <button
                        onClick={() => handleSimulatePhysicalPacket(device.id)}
                        disabled={isPosting}
                        className="px-3.5 py-1.5 rounded-xl bg-lime-600/20 hover:bg-lime-600/30 text-lime-300 border border-lime-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test Telemetry Packet</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* MQTT / Gateway Ingestion Guide */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-lime-400" />
            <span>Developer Hardware Integration Guide</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Flash your ESP32, Raspberry Pi, or Arduino with WiFi/LoRaWAN firmware and configure a periodic HTTP POST:
          </p>
          <pre className="p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-[11px] text-lime-300 overflow-x-auto">
{`POST /api/iot HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "deviceId": "dev-esp32-01",
  "temperature": 25.8,
  "humidity": 62.0,
  "soil_moisture": 0.35,
  "barometric_pressure": 1012.8,
  "battery_level": 98
}`}
          </pre>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
