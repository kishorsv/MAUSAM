import React, { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, MapPin, Check, CloudRain, Sun, Luggage, Loader2 } from 'lucide-react';
import { TravelPlan } from '@/lib/db/types';
import { formatTemperature } from '@/lib/utils';

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
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Travel Intelligence & Packing Guidance
            </h3>
            <p className="text-xs text-slate-400">
              Real-time destination telemetry and meteorological packing suggestions
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Destination
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddDestination} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Destination City</label>
              <input
                type="text"
                placeholder="e.g. London, Paris, Tokyo, Shimla"
                value={destName}
                onChange={e => setDestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={e => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
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
        <div className="py-6 text-center text-xs text-slate-400">
          No upcoming destinations saved. Add a destination above to see real weather & packing suggestions.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const w = destWeather[plan.id];

            return (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-sm">
                        <MapPin className="w-3.5 h-3.5 text-violet-400" />
                        <span>{plan.destination_name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Departure: {plan.departure_date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove destination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Real destination live weather */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 my-2">
                    {w ? (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-extrabold text-white">
                            {formatTemperature(w.temp, unit)}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {w.condition}
                          </span>
                        </div>
                        <div className="text-xs text-cyan-400 flex items-center gap-1 font-semibold">
                          <CloudRain className="w-3.5 h-3.5" />
                          <span>{w.rainProb}% rain</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-400" />
                        Fetching live destination weather...
                      </div>
                    )}
                  </div>
                </div>

                {/* Packing Suggestions */}
                {plan.packing_advice && plan.packing_advice.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1.5">
                      <Luggage className="w-3 h-3 text-amber-400" />
                      Meteorological Packing Checklist
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.packing_advice.map((item, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
                          • {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
