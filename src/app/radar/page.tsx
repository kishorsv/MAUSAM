'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, ArrowLeft, Play, Pause, RotateCcw, Clock, ShieldCheck, Info } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { RadarFrame } from '@/lib/providers/contracts';

export default function RadarPage() {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [host, setHost] = useState<string>('https://tilecache.rainviewer.com');
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [freshnessMinutes, setFreshnessMinutes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/radar')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.frames)) {
          setFrames(data.frames);
          setHost(data.host);
          setActiveFrameIndex(data.currentFrameIndex || 0);
          setFreshnessMinutes(data.freshnessMinutes || 5);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Frame player loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const interval = setInterval(() => {
      setActiveFrameIndex(prev => (prev + 1) % frames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, frames]);

  const activeFrame = frames[activeFrameIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                Live Doppler Weather Radar
              </h1>
              <p className="text-xs text-slate-400">
                Calibrated precipitation reflectivity volume scans from ground radar networks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Provider: RainViewer Doppler Core</span>
            <span>•</span>
            <span className="text-emerald-400">Scanned {freshnessMinutes}m ago</span>
          </div>
        </div>

        {/* Radar View Canvas */}
        <div className="relative w-full h-[450px] sm:h-[550px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Animated Background Radar Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />

          {/* Radar Sweep Animation Ring */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/20 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/15 pointer-events-none" />
          <div className="absolute w-[150px] h-[150px] rounded-full border border-cyan-500/10 pointer-events-none" />

          {/* Active Frame Indicator */}
          {activeFrame && (
            <div className="relative z-10 text-center space-y-2 p-6 glass-panel rounded-3xl border border-cyan-500/30 shadow-glow-primary max-w-sm">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>RADAR FRAME: {activeFrame.relativeLabel}</span>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {activeFrame.formattedTime}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Displaying composite base reflectivity tile path:
                <br />
                <code className="text-[10px] text-cyan-400 font-mono mt-1 block truncate">
                  {host}{activeFrame.path}/256/z/x/y/2/1_1.png
                </code>
              </p>
            </div>
          )}

          {/* dBZ Intensity Scale Legend */}
          <div className="absolute bottom-6 left-6 p-3 rounded-2xl glass-panel border border-slate-800 text-[11px] text-slate-300 space-y-1.5 z-20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Precipitation Intensity (dBZ)
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-4 h-2.5 rounded bg-cyan-500/80" /> Light (15)
              <span className="w-4 h-2.5 rounded bg-emerald-500/80 ml-2" /> Moderate (30)
              <span className="w-4 h-2.5 rounded bg-amber-500/80 ml-2" /> Heavy (45)
              <span className="w-4 h-2.5 rounded bg-rose-600/80 ml-2" /> Extreme (60+)
            </div>
          </div>
        </div>

        {/* Radar Timeline Controller */}
        {frames.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-glow-primary"
                  title={isPlaying ? "Pause Radar Loop" : "Play Radar Loop"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveFrameIndex(0)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Reset to Oldest Frame"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-slate-300">
                Frame {activeFrameIndex + 1} of {frames.length}
              </div>
            </div>

            {/* Frame Timeline Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {frames.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveFrameIndex(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap border transition-all ${
                    activeFrameIndex === idx
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow-primary'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.relativeLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
