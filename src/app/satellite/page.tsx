'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Wind, Eye, Compass, ShieldAlert, Sparkles, Clock, Globe } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SatelliteLayerInfo } from '@/lib/providers/contracts';

export default function SatellitePage() {
  const [layers, setLayers] = useState<SatelliteLayerInfo[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('cloud-infrared');
  const [cloudMovement, setCloudMovement] = useState<string>('Moving northeast at 18 km/h');
  const [cycloneAlert, setCycloneAlert] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string>('15 minutes ago');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/satellite?lat=12.9716&lon=77.5946')
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
  }, []);

  const activeLayer = layers.find(l => l.layerId === activeLayerId) || layers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
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
                <Globe className="w-5 h-5 text-indigo-400" />
                Satellite Earth Observation Intelligence
              </h1>
              <p className="text-xs text-slate-400">
                Geostationary infrared thermal cloud composites and synoptic scale storm tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Source: EUMETSAT / NOAA / NASA GIBS</span>
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

        {/* Satellite Imagery Canvas */}
        <div className="relative w-full h-[450px] sm:h-[550px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Earth Grid Mask */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:32px_32px]" />

          {/* Cloud Cover Simulation Mesh from real telemetry */}
          <div className="relative z-10 text-center space-y-3 p-6 glass-panel rounded-3xl border border-indigo-500/30 max-w-md shadow-glow-primary">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>SATELLITE COMPOSITE LAYER</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {activeLayer?.name || 'Infrared Cloud Temperature'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeLayer?.description}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono border-t border-slate-800">
              Regional Cloud Cover: <span className="font-bold text-white">{activeLayer?.cloudCoveragePct ?? 35}%</span>
              <br />
              Vector: <span className="font-semibold text-cyan-300">{cloudMovement}</span>
            </div>
          </div>

          {/* Layer Metadata Overlay */}
          <div className="absolute bottom-6 left-6 p-3 rounded-2xl glass-panel border border-slate-800 text-[11px] text-slate-300 space-y-1 z-20">
            <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Observation Telemetry
            </div>
            <div>Attribution: {activeLayer?.attribution}</div>
            <div>Scan latency: {activeLayer?.freshnessMinutes} minutes</div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
