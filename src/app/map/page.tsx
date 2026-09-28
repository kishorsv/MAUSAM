'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { WeatherMapComponent } from '@/components/map/WeatherMapComponent';
import { MapLoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';

export default function MapPage() {
  const { currentLocation, setManualLocation } = useLocation();
  const { weather, status, isRefreshing } = useWeather();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        currentLocation={{
          name: currentLocation.city,
          region: currentLocation.locality || currentLocation.state,
          country: currentLocation.country || '',
          lat: currentLocation.latitude,
          lon: currentLocation.longitude
        }}
        isLive={status === 'READY'}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-400" />
              Regional Weather Map & Radar
            </h1>
            <p className="text-xs text-slate-400">
              Interactive precipitation radar, thermal heatmaps, wind streams, and particulate spread for {currentLocation.city}
            </p>
          </div>
        </div>

        {status === 'LOADING' && !weather ? (
          <MapLoadingSkeleton />
        ) : weather ? (
          <WeatherMapComponent
            weather={weather}
            onSelectLocation={(loc) => {
              setManualLocation({
                latitude: loc.lat,
                longitude: loc.lon,
                city: loc.name,
                country: loc.country || '',
                source: 'search'
              });
            }}
          />
        ) : null}
      </main>

      <MobileBottomNav />
    </div>
  );
}
