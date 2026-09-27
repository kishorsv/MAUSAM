'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CloudSun, Sparkles, Activity, Heart, Waves, Plane, Users, 
  Sprout, Car, PartyPopper, ShieldCheck, ArrowRight, CheckCircle2, 
  Cpu, Layers, Zap, Globe 
} from 'lucide-react';

export default function LandingPage() {
  const lifestyleFeatures = [
    { title: 'Health & Allergy', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Real-time air quality index (AQI), PM2.5 particulate counters, and respiratory irritation warnings.' },
    { title: 'Fitness & Outdoor', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Calculates the optimal running, cycling, or walking windows using hourly thermodynamic forecast modeling.' },
    { title: 'Beach & Surf', icon: Waves, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: 'Coastal onshore winds, surface chop, swell heights, and high-intensity solar UV alerts.' },
    { title: 'Travel Intelligence', icon: Plane, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', desc: 'Destination microclimates and AI luggage checklists generated from real arrival forecasts.' },
    { title: 'Family & Safety', icon: Users, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', desc: 'School departure timing, playground temperature viability, and sudden storm alerts for parents.' },
    { title: 'Agriculture & Soil', icon: Sprout, color: 'text-lime-400 bg-lime-500/10 border-lime-500/20', desc: 'Precipitation volume, frost hazard modeling, and agricultural IoT soil probe gateway interface.' },
    { title: 'Daily Commute', icon: Car, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Roadway slickness indices, fog optical visibility measurements, and transit delays prevention.' },
    { title: 'Event Planning', icon: PartyPopper, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Open-air venue comfort scoring, rain canopy requirements, and guest temperature projections.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-primary-500/30 selection:text-primary-200">
      {/* Landing Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 p-[1px] shadow-glow-primary">
              <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-primary-400" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              MAUSAM
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs transition-all shadow-glow-primary inline-flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Smart Personalized Weather Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Weather that <span className="bg-gradient-to-r from-primary-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">adapts to you.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Traditional weather applications show the same forecast to everyone. Mausam automatically reorganizes its intelligence around your health, fitness, travel, family, agriculture, commuting, and event needs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm transition-all shadow-glow-primary hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Explore Mausam</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/onboarding"
              className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors border border-slate-700"
            >
              Personalize My Profile
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Lifestyle Personas Grid */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Real Human Lifestyles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            One intelligent dashboard that shifts priorities based on what matters to you right now.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifestyleFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl glass-panel border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Technology & Intelligence Engine */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Real-Time Ground-Truth Architecture</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Deterministic Personalization & AI Advisory
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Mausam never displays fake live weather or generic mock cards. Our backend abstracts Open-Meteo, ECMWF, and IMD data streams, caching readings across geographical micro-grids and feeding structured meteorological context to Google Gemini.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic mathematical card priority ranking</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict ground-truth AI chat assistant with zero weather hallucination</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-language localization for English, Kannada, and Hindi</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Configurable PostgreSQL relational schema & Redis cache telemetry</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300">Live Mathematical Formula</span>
              <span className="text-[10px] text-emerald-400 font-mono">Status: ACTIVE</span>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 p-4 rounded-2xl bg-black/60 border border-white/5 overflow-x-auto leading-relaxed">
{`Priority = 
  userInterestScore       // Profile lifestyle weight
+ weatherSeverityScore   // Rain, Heat, Gale wind, AQI
+ timeRelevanceScore     // Commute & workout hours
+ locationRelevanceScore // Selected GPS / Pinned pin
+ activityRelevanceScore // Suitability for scheduled sport`}
            </pre>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="mt-auto py-12 px-4 sm:px-6 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-primary-400" />
            <span className="font-bold text-sm text-slate-200">MAUSAM INTELLIGENCE</span>
          </div>
          <p className="text-xs text-slate-500">
            Mausam Personalized Weather Platform. Built with Next.js, TypeScript, Tailwind, and Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
