'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, MapPin, Plus, Trash2, ArrowLeft, ShieldCheck, 
  LogOut, Check, Sliders, Globe, Bell, Heart, Activity, 
  Waves, Plane, Users, Sprout, Car, PartyPopper, Loader2 
} from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SavedLocation, UserPreferences } from '@/lib/db/types';

export default function ProfilePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState<'home' | 'office' | 'school' | 'gym' | 'farm' | 'custom'>('home');
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [locRes, prefRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/preferences')
      ]);

      if (locRes.ok) {
        const lData = await locRes.json();
        setLocations(lData.locations || []);
      }
      if (prefRes.ok) {
        const pData = await prefRes.json();
        setPreferences(pData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    setSavingLocation(true);
    try {
      // Geocode the city
      const geoRes = await fetch(`/api/weather/search?q=${encodeURIComponent(locName.trim())}`);
      const geoData = await geoRes.json();
      const match = geoData.results?.[0];

      const lat = match ? match.lat : 12.9716;
      const lon = match ? match.lon : 77.5946;
      const verifiedName = match ? `${match.name}, ${match.country}` : locName;

      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: verifiedName,
          latitude: lat,
          longitude: lon,
          location_type: locType,
          is_pinned: false
        })
      });

      if (res.ok) {
        setLocName('');
        setIsAddingLocation(false);
        fetchProfileData();
      }
    } catch {
      // ignore
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch {
      // ignore
    }
  };

  const handleUpdateUnit = async (type: 'temperature_unit' | 'wind_unit', value: string) => {
    if (!preferences) return;
    const updated = { ...preferences, [type]: value };
    setPreferences(updated);
    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: value })
      });
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language={preferences?.language || 'en'}
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Profile & Lifestyle Preferences
              </h1>
              <p className="text-xs text-slate-400">
                Manage saved locations, measurement units, and persona filters
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center font-bold text-xl text-white shadow-glow-primary">
            PS
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Priya Sharma</h3>
            <p className="text-xs text-slate-400">user@mausam.app • Bengaluru, India</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Personalized Account
              </span>
              <span className="text-[10px] text-slate-500">Member since 2026</span>
            </div>
          </div>
        </div>

        {/* Saved Locations Manager */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                Saved Locations
              </h3>
              <p className="text-xs text-slate-400">
                Hyper-local pins for Home, Work, School, and Custom spots
              </p>
            </div>

            <button
              onClick={() => setIsAddingLocation(!isAddingLocation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pin
            </button>
          </div>

          {isAddingLocation && (
            <form onSubmit={handleAddLocation} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location Name / City</label>
                  <input
                    type="text"
                    value={locName}
                    onChange={e => setLocName(e.target.value)}
                    placeholder="e.g. Indiranagar, Whitefield, Cubbon Park"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location Type</label>
                  <select
                    value={locType}
                    onChange={e => setLocType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="school">School</option>
                    <option value="gym">Gym / Running Track</option>
                    <option value="farm">Farm / Agri Field</option>
                    <option value="custom">Custom Point</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingLocation(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLocation}
                  className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white"
                >
                  {savingLocation ? 'Geocoding...' : 'Save Pin'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-primary-300 font-mono">
                      {loc.location_type}
                    </span>
                    <span>{loc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Units Configuration */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-400" />
            Measurement Units
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Temperature Unit</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateUnit('temperature_unit', 'celsius')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    preferences?.temperature_unit === 'celsius'
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => handleUpdateUnit('temperature_unit', 'fahrenheit')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    preferences?.temperature_unit === 'fahrenheit'
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Wind Speed Unit</label>
              <div className="grid grid-cols-3 gap-2">
                {['kmh', 'mph', 'ms'].map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUpdateUnit('wind_unit', u)}
                    className={`p-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                      preferences?.wind_unit === u
                        ? 'bg-primary-600 text-white border-primary-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {u === 'kmh' ? 'km/h' : u === 'ms' ? 'm/s' : 'mph'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
