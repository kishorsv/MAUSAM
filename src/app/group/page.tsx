'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, Plus, Trash2, MapPin, CheckCircle2, AlertTriangle, CloudRain } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { GroupWeatherItem } from '@/lib/db/types';

export default function GroupWeatherPage() {
  const [groups, setGroups] = useState<GroupWeatherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [cities, setCities] = useState('Bengaluru, Mysuru, Coorg, Ooty');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/group');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !cities) return;

    try {
      const cityNames = cities.split(',').map(c => c.trim()).filter(Boolean);
      const res = await fetch('/api/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          group_type: 'road_trip',
          cityNames
        })
      });

      if (res.ok) {
        setTitle('');
        setCities('');
        setIsAdding(false);
        fetchGroups();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/group?id=${id}`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g.id !== id));
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
                <Users className="w-5 h-5 text-violet-400" />
                Group Weather & Multi-City Comparison
              </h1>
              <p className="text-xs text-slate-400">
                Compare multi-destination conditions side-by-side for college tours and road trips
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-violet-300 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Trip Group
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddGroup} className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3 animate-in fade-in">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Group Trip Title</label>
              <input
                type="text"
                placeholder="e.g. South India College Tour"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Destinations to Compare (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Mysuru, Coorg, Wayanad"
                value={cities}
                onChange={e => setCities(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white">Create Group</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Comparing group destinations...</div>
        ) : groups.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No trip groups created yet.</div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{group.title}</h3>
                  <button onClick={() => handleDelete(group.id)} className="p-1 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {group.locations.map((loc, idx) => {
                    const isGood = loc.status === 'Good';
                    const isPoor = loc.status === 'Poor';

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-200 truncate">{loc.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isGood
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isPoor
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {loc.status}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold text-white">
                              {loc.temperature !== undefined ? `${loc.temperature}°C` : '--'}
                            </span>
                            <span className="text-xs text-slate-400 truncate">
                              {loc.condition || 'Clear'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-cyan-400 pt-2 border-t border-white/5">
                          <CloudRain className="w-3.5 h-3.5" />
                          <span>{loc.rainProb ?? 0}% rain chance</span>
                        </div>
                      </div>
                    );
                  })}
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
