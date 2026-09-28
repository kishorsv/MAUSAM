'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';

export default function ForecastPage() {
  const { currentLocation } = useLocation();
  const { weather, status, isRefreshing, refreshWeather } = useWeather();

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
              <Calendar className="w-5 h-5 text-primary-400" />
              Extended Atmospheric Forecast
            </h1>
            <p className="text-xs text-slate-400">
              High-resolution hourly timeline and 7-day thermodynamic trends for {currentLocation.city}
            </p>
          </div>
        </div>

        {status === 'LOADING' && !weather ? (
          <DashboardSkeleton />
        ) : weather ? (
          <div className="space-y-6">
            <HourlyForecast
              items={weather.hourly}
              fetchedAt={weather.fetchedAt}
              locationName={weather.location.name}
              coordinates={{ lat: weather.location.lat, lon: weather.location.lon }}
              timezone={weather.location.timezone}
              isUpdating={isRefreshing}
            />
            <ForecastCard items={weather.daily} />
          </div>
        ) : null}
      </main>

      <MobileBottomNav />
    </div>
  );
}
