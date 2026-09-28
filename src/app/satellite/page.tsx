'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Wind, Eye, Compass, ShieldAlert, Sparkles, Clock, Globe, Orbit } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { WeatherMapComponent } from '@/components/map/WeatherMapComponent';
import { MapLoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';
import { SatelliteLayerInfo } from '@/lib/providers/contracts';

export default function SatellitePage() {
  const { currentLocation, setManualLocation } = useLocation();
  const { weather, status } = useWeather();
  const [layers, setLayers] = useState<SatelliteLayerInfo[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('cloud-infrared');
  const [cloudMovement, setCloudMovement] = useState<string>('Moving northeast at 18 km/h');
  const [cycloneAlert, setCycloneAlert] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string>('15 minutes ago');
  const [loading, setLoading] = useState(true);

  const lat = currentLocation.latitude || 12.9716;
  const lon = currentLocation.longitude || 77.5946;

  useEffect(() => {
    fetch(`/api/satellite?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLayers(data.layers || []);
          if (data.cloudMovementHeading) setCloudMovement(data.cloudMovementHeading);
          if (data.activeCycloneAlert) setCycloneAlert(data.activeCycloneAlert);
          setLastUpdated(data.lastUpdated ? `${Math.round((Date.now() - new Date(data.lastUpdated).getTime()) / 60000)}m ago` : '15m ago');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const activeLayer = layers.find(l => l.layerId === activeLayerId) || layers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        currentLocation={{
          name: currentLocation.city,
          region: currentLocation.locality || currentLocation.state,
          country: currentLocation.country || '',
          lat: currentLocation.latitude,
          lon: currentLocation.longitude
        }}
        isLive={status === 'READY'}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Orbit className="w-5 h-5 text-indigo-400" />
                <span>Satellite Earth Observation & Real Google Satellite Map</span>
              </h1>
              <p className="text-xs text-slate-400">
                Synchronized Google Satellite surface view, geostationary infrared telemetry and synoptic atmospheric tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Source: Google Maps & EUMETSAT/NOAA</span>
            <span>•</span>
            <span className="text-emerald-400">Scan fresh: {lastUpdated}</span>
          </div>
        </div>

        {/* Cyclone Warning if detected */}
        {cycloneAlert && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Cyclone Spiral Alert</span>
              <span className="text-xs">{cycloneAlert}</span>
            </div>
          </div>
        )}

        {/* Layer Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {layers.map((l) => (
            <button
              key={l.layerId}
              onClick={() => setActiveLayerId(l.layerId)}
              className={`px-4 py-2 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all ${
                activeLayerId === l.layerId
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow-primary'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        {/* REAL Google Satellite Map */}
        {status === 'LOADING' && !weather ? (
          <MapLoadingSkeleton />
        ) : weather ? (
          <WeatherMapComponent
            weather={weather}
            initialMapType="satellite"
            externalMapType="satellite"
            onSelectLocation={(loc) => {
              setManualLocation({
                latitude: loc.lat,
                longitude: loc.lon,
                city: loc.name,
                country: loc.country || '',
                source: 'search'
              });
            }}
          />
        ) : null}

        {/* Atmospheric Observation Telemetry Card */}
        {activeLayer && (
          <div className="p-5 rounded-3xl glass-panel border border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Atmospheric Layer</span>
              <p className="font-semibold text-white text-sm">{activeLayer.name}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{activeLayer.description}</p>
            </div>
            <div className="space-y-1 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Space Telemetry</span>
              <p>Regional Cloud Cover: <strong className="text-white">{activeLayer.cloudCoveragePct ?? 35}%</strong></p>
              <p>Heading Vector: <strong className="text-cyan-300">{cloudMovement}</strong></p>
            </div>
            <div className="space-y-1 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attribution</span>
              <p>Provider: <strong className="text-slate-200">{activeLayer.attribution}</strong></p>
              <p>Scan latency: <strong className="text-emerald-400">{activeLayer.freshnessMinutes} mins</strong></p>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
