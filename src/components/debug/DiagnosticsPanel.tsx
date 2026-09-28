'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  RefreshCw, ChevronDown, ChevronUp, Terminal, Cpu, Database, 
  MapPin, Globe 
} from 'lucide-react';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';
import { formatTimeAgo } from '@/lib/utils';

export function DiagnosticsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLocation, permissionState, accuracy, isLowAccuracy } = useLocation();
  const { weather, status: weatherStatus, lastUpdated, weatherSource } = useWeather();
  const [backendHealth, setBackendHealth] = useState<'CONNECTED' | 'ERROR' | 'CHECKING'>('CHECKING');
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  const googleApiKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
      : '';

  const googleMapsStatus =
    googleApiKey && googleApiKey.trim() !== ''
      ? typeof window !== 'undefined' && (window as any).google?.maps
        ? 'CONNECTED'
        : 'KEY_CONFIGURED'
      : 'NOT_CONFIGURED';

  // Live Backend Ping
  const pingBackend = async () => {
    setBackendHealth('CHECKING');
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const latency = Math.round(performance.now() - start);
      setBackendLatency(latency);
      if (res.ok) {
        setBackendHealth('CONNECTED');
      } else {
        setBackendHealth('ERROR');
      }
    } catch {
      setBackendHealth('ERROR');
      setBackendLatency(null);
    }
  };

  useEffect(() => {
    pingBackend();
  }, []);

  // Keyboard shortcut: Shift + D to toggle Diagnostics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatCoord = (coord: number, isLat: boolean) => {
    if (isNaN(coord)) return '••••';
    const dir = isLat ? (coord >= 0 ? '°N' : '°S') : coord >= 0 ? '°E' : '°W';
    return `${Math.abs(coord).toFixed(4)}${dir}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {/* Collapsed Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-slate-300 shadow-2xl backdrop-blur-md transition-all hover:scale-105"
          title="Open Developer Diagnostics (Shift + D)"
        >
          <Terminal className="w-3.5 h-3.5 text-primary-400" />
          <span>System Diagnostics</span>
          <span
            className={`w-2 h-2 rounded-full ${
              backendHealth === 'CONNECTED' && weatherStatus === 'READY'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
        </button>
      )}

      {/* Expanded Diagnostics Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-5 text-xs font-mono text-slate-300 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold">
              <Cpu className="w-4 h-4 text-primary-400" />
              <span>MAUSAM MET DIAGNOSTICS</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={pingBackend}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Collapse"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Diagnostic Metrics Table */}
          <div className="space-y-2.5">
            {/* 1. Location Permission */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location Permission:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                  permissionState === 'granted'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : permissionState === 'denied'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {permissionState.toUpperCase()}
              </span>
            </div>

            {/* 2. Location Source */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location Source:</span>
              <span className="font-semibold text-slate-200 uppercase">
                {currentLocation.source.toUpperCase()}
              </span>
            </div>

            {/* 3. Latitude & Longitude */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Coordinates:</span>
              <span className="text-primary-300 font-semibold">
                {formatCoord(currentLocation.latitude, true)}, {formatCoord(currentLocation.longitude, false)}
              </span>
            </div>

            {/* 4. Accuracy */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Accuracy:</span>
              <span className="text-slate-200 font-semibold">
                {typeof accuracy === 'number'
                  ? `±${Math.round(accuracy)}m ${isLowAccuracy ? '(Low Precision)' : '(High Precision)'}`
                  : 'N/A (Standard)'}
              </span>
            </div>

            {/* 5. Weather API */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Weather API:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                  weatherStatus === 'READY' || weatherStatus === 'STALE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {weatherStatus === 'READY' || weatherStatus === 'STALE' ? 'CONNECTED' : 'ERROR'}
              </span>
            </div>

            {/* 6. Weather Last Updated */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Weather Updated:</span>
              <span className="text-slate-200 truncate max-w-[170px]" title={lastUpdated || ''}>
                {lastUpdated ? formatTimeAgo(lastUpdated) : '••••'}
              </span>
            </div>

            {/* 7. Google Maps */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Google Maps:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                  googleMapsStatus === 'CONNECTED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : googleMapsStatus === 'KEY_CONFIGURED'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {googleMapsStatus}
              </span>
            </div>

            {/* 8. Backend */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Backend API:</span>
              <div className="flex items-center gap-1.5">
                {backendLatency !== null && (
                  <span className="text-[10px] text-slate-500">{backendLatency}ms</span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    backendHealth === 'CONNECTED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {backendHealth}
                </span>
              </div>
            </div>
          </div>

          {/* Safe Diagnostics Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Shift+D to toggle</span>
            <span className="flex items-center gap-1 text-emerald-400/80">
              <ShieldCheck className="w-3 h-3" />
              <span>Keys Protected</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
