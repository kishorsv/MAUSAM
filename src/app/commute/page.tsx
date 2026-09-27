'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { CommuterModule } from '@/components/modules/CommuterModule';
import { WeatherPayload } from '@/lib/weather/types';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

export default function CommutePage() {
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
              <Car className="w-5 h-5 text-amber-400" />
              Daily Commute Transit Safety Center
            </h1>
            <p className="text-xs text-slate-400">
              Road surface telemetry, optical visibility, and crosswind alerts
            </p>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : weather ? (
          <CommuterModule weather={weather} />
        ) : null}
      </main>

      <MobileBottomNav />
    </div>
  );
}
