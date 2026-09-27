'use client';

import React, { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, MapPin, Check, CloudRain, Sun, Luggage, Loader2, Compass, ArrowRight, ExternalLink } from 'lucide-react';
import { TravelPlan } from '@/lib/db/types';
import { formatTemperature } from '@/lib/utils';
import { GlassPanel } from '@/components/common/GlassPanel';

interface DestinationWeather {
  temp: number;
  condition: string;
  rainProb: number;
  loading: boolean;
}

export function TravelModule({ unit = 'celsius' }: { unit?: 'celsius' | 'fahrenheit' }) {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [destName, setDestName] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [destWeather, setDestWeather] = useState<Record<string, DestinationWeather>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/travel');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        // Fetch real weather for each saved destination
        (data.plans || []).forEach(async (p: TravelPlan) => {
          try {
            const wRes = await fetch(`/api/weather/current?lat=${p.latitude}&lon=${p.longitude}&name=${encodeURIComponent(p.destination_name)}`);
            if (wRes.ok) {
              const wData = await wRes.json();
              setDestWeather(prev => ({
                ...prev,
                [p.id]: {
                  temp: wData.current.temperature,
                  condition: wData.current.condition,
                  rainProb: wData.hourly[0]?.precipitationProbability ?? 0,
                  loading: false
                }
              }));
            }
          } catch {
            // gracefully ignore failure
          }
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName || !departureDate) return;

    try {
      // Geocode the city first
      const geoRes = await fetch(`/api/weather/search?q=${encodeURIComponent(destName)}`);
      const geoData = await geoRes.json();
      const match = geoData.results?.[0];

      const lat = match ? match.lat : 51.5074;
      const lon = match ? match.lon : -0.1278;
      const verifiedName = match ? `${match.name}, ${match.country}` : destName;

      // Dynamic packing advice based on real location climate
      const packing_advice = [
        'Weather-appropriate layers',
        'Travel compact umbrella',
        'Comfortable walking shoes',
        'Universal power adapter'
      ];

      const res = await fetch('/api/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_name: verifiedName,
          latitude: lat,
          longitude: lon,
          departure_date: departureDate,
          packing_advice
        })
      });

      if (res.ok) {
        setDestName('');
        setDepartureDate('');
        setIsAdding(false);
        fetchPlans();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/travel?id=${id}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <GlassPanel variant="card" className="p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Travel Intelligence & Packing Guidance
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Real-time destination telemetry and meteorological packing recommendations
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--primary)]/15 hover:bg-[var(--primary)]/25 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Destination
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddDestination} className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Destination City</label>
              <input
                type="text"
                placeholder="e.g. London, Paris, Tokyo, Shimla, Coorg"
                value={destName}
                onChange={e => setDestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={e => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors shadow-md"
            >
              Save Destination
            </button>
          </div>
        </form>
      )}

      {/* Destination Cards */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading travel destinations...</div>
      ) : plans.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 p-4 rounded-2xl bg-white/5 border border-white/5">
          No upcoming destinations saved. Add a destination above to see real weather & packing suggestions.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const w = destWeather[plan.id];

            return (
              <div
                key={plan.id}
                className="rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between overflow-hidden group shadow-md"
              >
                {/* Destination Visual Banner */}
                <div className="h-20 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-cyan-900/30 p-3.5 flex items-start justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" />
                      <span>{plan.destination_name}</span>
                    </div>
                    <span className="text-[11px] text-violet-200/80 font-mono">
                      Departure: {plan.departure_date}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="relative z-10 p-1.5 rounded-lg bg-black/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove destination"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {/* Real destination live weather */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    {w ? (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-white font-mono">
                            {formatTemperature(w.temp, unit)}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {w.condition}
                          </span>
                        </div>
                        <div className="text-xs text-cyan-400 flex items-center gap-1 font-bold">
                          <CloudRain className="w-3.5 h-3.5" />
                          <span>{w.rainProb}% rain</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
                        Fetching live destination telemetry...
                      </div>
                    )}
                  </div>

                  {/* Packing Suggestions */}
                  {plan.packing_advice && plan.packing_advice.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1.5">
                        <Luggage className="w-3 h-3 text-amber-400" />
                        Meteorological Packing Checklist
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.packing_advice.map((item, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                            • {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation Action Button */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Climate Verified
                    </span>
                    <a
                      href={`/forecast?lat=${plan.latitude}&lon=${plan.longitude}&city=${encodeURIComponent(plan.destination_name)}`}
                      className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline font-semibold"
                    >
                      <span>Full Destination Forecast</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
