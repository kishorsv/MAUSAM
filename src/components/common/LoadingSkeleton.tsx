import React from 'react';
import { MapPin, CloudRain, Compass, Calendar, Loader2 } from 'lucide-react';

export function LoadingSkeleton({ className = "h-48 w-full" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl glass-panel animate-pulse bg-slate-800/40 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
}

export function LocationLoadingSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/5 bg-slate-900/40 animate-pulse flex items-center gap-3.5 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0">
        <MapPin className="w-5 h-5 animate-bounce" />
      </div>
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-400" />
          <h4 className="text-xs font-bold text-white tracking-wide">Detecting your location...</h4>
        </div>
        <p className="text-[11px] text-slate-400">Querying satellite positioning and reverse geocoding area coordinates.</p>
      </div>
    </div>
  );
}

export function WeatherLoadingSkeleton() {
  return (
    <div className="p-6 sm:p-9 rounded-3xl glass-panel border border-white/5 bg-slate-900/50 animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Loading live weather...</span>
        </div>
        <div className="h-4 w-28 bg-slate-800/80 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-slate-800/60" />
          <div className="space-y-2">
            <div className="h-16 w-32 bg-slate-800/80 rounded-2xl" />
            <div className="h-4 w-48 bg-slate-800/60 rounded-md" />
          </div>
        </div>
        <div className="md:col-span-5 space-y-2.5">
          <div className="h-10 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="h-64 sm:h-80 rounded-3xl glass-panel border border-white/5 bg-slate-900/50 flex flex-col items-center justify-center gap-3 animate-pulse p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <Compass className="w-6 h-6 animate-spin-slow" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-white tracking-wide">Loading map...</h4>
        <p className="text-[11px] text-slate-400">Synchronizing radar geospatial tiles and atmospheric overlays</p>
      </div>
    </div>
  );
}

export function ForecastLoadingSkeleton() {
  return (
    <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-slate-900/50 animate-pulse space-y-4">
      <div className="flex items-center gap-2 text-indigo-400">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Loading forecast...</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/60 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <WeatherLoadingSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MapLoadingSkeleton />
        <ForecastLoadingSkeleton />
      </div>
    </div>
  );
}
