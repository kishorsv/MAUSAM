'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Wind, Sun, Info } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AQICard } from '@/components/weather/AQICard';
import { WeatherPayload } from '@/lib/weather/types';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

export default function HealthPage() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather/current?lat=12.9716&lon=77.5946&name=Bengaluru')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              Health, Air Quality & Allergy Intelligence
            </h1>
            <p className="text-xs text-slate-400">
              Particulate matter, ozone, UV radiation, and non-medical respiratory advisories
            </p>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : weather ? (
          <div className="space-y-6">
            <AQICard airQuality={weather.airQuality} />
          </div>
        ) : null}
      </main>

      <MobileBottomNav />
    </div>
  );
}
