'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Route, ArrowLeft, Plus, Trash2, MapPin, Navigation, CloudRain, Wind, Eye, Check } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { RouteTrip } from '@/lib/db/types';
import { formatTemperature } from '@/lib/utils';

export default function RouteWeatherPage() {
  const [trips, setTrips] = useState<RouteTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startLoc, setStartLoc] = useState('');
  const [endLoc, setEndLoc] = useState('');
  const [stops, setStops] = useState<string>('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/route');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startLoc || !endLoc) return;

    try {
      const stopList = stops.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          start_location: startLoc,
          end_location: endLoc,
          stops: stopList,
          travel_mode: 'car'
        })
      });

      if (res.ok) {
        setTitle('');
        setStartLoc('');
        setEndLoc('');
        setStops('');
        setIsAdding(false);
        fetchTrips();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/route?id=${id}`, { method: 'DELETE' });
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch {
      // ignore
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
                <Route className="w-5 h-5 text-primary-400" />
                Weather Route Intelligence
              </h1>
              <p className="text-xs text-slate-400">
                Segment-by-segment atmospheric road conditions along transit corridors
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-primary-300 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Plan New Route
          </button>
        </div>

        {/* Add Route Form */}
        {isAdding && (
          <form onSubmit={handleAddTrip} className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Trip Name</label>
                <input
                  type="text"
                  placeholder="e.g. Western Ghats Drive"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Starting Point</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={startLoc}
                  onChange={e => setStartLoc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Coorg"
                  value={endLoc}
                  onChange={e => setEndLoc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Optional Stops (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Mysuru, Hassan"
                value={stops}
                onChange={e => setStops(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white">Save Route</button>
            </div>
          </form>
        )}

        {/* Saved Routes List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Computing route meteorological conditions...</div>
        ) : trips.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No route trips saved. Create one above to monitor road microclimates.</div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{trip.title}</h3>
                    <p className="text-xs text-slate-400">{trip.start_location} → {trip.end_location}</p>
                  </div>
                  <button onClick={() => handleDelete(trip.id)} className="p-1 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Waypoint Weather Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trip.waypoints.map((wp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary-400" />
                          {wp.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Stop #{idx + 1}</span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-white">
                          {wp.temp !== undefined ? `${wp.temp}°C` : '--'}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          {wp.condition || 'Clear'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <CloudRain className="w-3.5 h-3.5" />
                          {wp.rainProb ?? 0}% rain
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Wind className="w-3.5 h-3.5" />
                          {wp.windSpeed ?? 12} km/h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
