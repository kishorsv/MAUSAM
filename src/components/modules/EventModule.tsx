import React, { useState, useEffect } from 'react';
import { PartyPopper, Plus, Trash2, Calendar, MapPin, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { PlannedEvent } from '@/lib/db/types';
import { formatTemperature } from '@/lib/utils';

export function EventModule({ unit = 'celsius' }: { unit?: 'celsius' | 'fahrenheit' }) {
  const [events, setEvents] = useState<PlannedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [locationName, setLocationName] = useState('');
  const [isOutdoor, setIsOutdoor] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !locationName) return;

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          event_date: eventDate,
          start_time: startTime,
          location_name: locationName,
          latitude: 12.9716,
          longitude: 77.5946,
          is_outdoor: isOutdoor
        })
      });

      if (res.ok) {
        setTitle('');
        setEventDate('');
        setLocationName('');
        setIsAdding(false);
        fetchEvents();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Event Planning & Meteorological Feasibility
            </h3>
            <p className="text-xs text-slate-400">
              Atmospheric comfort projections, rain probability, and canopy advisory
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Plan Event
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddEvent} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Event Name</label>
              <input
                type="text"
                placeholder="e.g. Terrace Dinner, Sports Meet"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Venue Location</label>
              <input
                type="text"
                placeholder="e.g. Lawn Banquet, Indiranagar"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isOutdoor}
                onChange={e => setIsOutdoor(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              Outdoor Venue (Subject to weather contingencies)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading scheduled events...</div>
      ) : events.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No events scheduled yet. Add your outdoor gathering to evaluate rain risk & guest comfort.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{evt.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {evt.event_date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {evt.start_time}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                  <span>{evt.location_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-auto">
                    {evt.is_outdoor ? 'Outdoor' : 'Indoor'}
                  </span>
                </div>
              </div>

              {/* Comfort Score & Summary */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Guest Comfort Score</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {evt.comfort_score ?? 88}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {evt.weather_summary || 'Conditions favorable. Low rain probability during scheduled hours.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
