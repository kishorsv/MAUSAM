'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { FitnessModule } from '@/components/modules/FitnessModule';
import { WeatherPayload } from '@/lib/weather/types';
import { ActivityWindow } from '@/lib/personalization/types';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

export default function FitnessPage() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [windows, setWindows] = useState<ActivityWindow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather/current?lat=12.9716&lon=77.5946&name=Bengaluru')
      .then(res => res.json())
      .then(wData => {
        setWeather(wData);
        return fetch('/api/personalization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weather: wData })
        });
      })
      .then(res => res.json())
      .then(pData => {
        setWindows(pData.fitnessWindows || []);
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
              <Activity className="w-5 h-5 text-emerald-400" />
              Fitness & Outdoor Training Center
            </h1>
            <p className="text-xs text-slate-400">
              Optimal activity windows for running, cycling, and outdoor recreation
            </p>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : weather ? (
          <FitnessModule weather={weather} windows={windows} />
        ) : null}
      </main>

      <MobileBottomNav />
    </div>
  );
}
