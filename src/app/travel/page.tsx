'use client';

import React from 'react';
import Link from 'next/link';
import { Plane, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { TravelModule } from '@/components/modules/TravelModule';

export default function TravelPage() {
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
              <Plane className="w-5 h-5 text-violet-400" />
              Travel Intelligence Center
            </h1>
            <p className="text-xs text-slate-400">
              Destination forecast tracking, transit warnings, and meteorological packing recommendations
            </p>
          </div>
        </div>

        <TravelModule />
      </main>

      <MobileBottomNav />
    </div>
  );
}
