'use client';

import React from 'react';
import { CloudRain, ShieldCheck, Info } from 'lucide-react';
import { RainNowcastResult } from '@/lib/weather/nowcast';
import { GlassPanel } from '@/components/common/GlassPanel';

interface RainNowcastCardProps {
  nowcast: RainNowcastResult;
}

export function RainNowcastCard({ nowcast }: RainNowcastCardProps) {
  const isHighConfidence = nowcast.confidence === 'High';
  const isRainImminent = nowcast.hasImminentRain;

  return (
    <GlassPanel 
      variant="card"
      glow={isRainImminent ? 'cyan' : false}
      className="p-6 relative overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isRainImminent ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[var(--primary)]/15 text-[var(--primary)]'}`}>
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[var(--foreground)] tracking-tight">
                Rain Nowcast & Confidence
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                Near-Term Radar
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Short-term precipitation modeling with source agreement telemetry
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isHighConfidence
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidence: {nowcast.confidence}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Expected Precipitation:</span>
          <span className={`text-xs font-bold font-mono ${isRainImminent ? 'text-cyan-400' : 'text-slate-400'}`}>
            {nowcast.intensity}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Forecast Interval Window:</span>
          <span className="text-xs font-bold text-white font-mono">
            {nowcast.expectedTimeWindow}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-2.5">
          {nowcast.summary}
        </p>
      </div>

      {/* Source Agreement & Methodology Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
          <span>{nowcast.confidenceReason}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>{nowcast.sourceAgreement}</span>
          <span>•</span>
          <span>Freshness: {nowcast.dataFreshnessMinutes}m</span>
        </div>
      </div>
    </GlassPanel>
  );
}
