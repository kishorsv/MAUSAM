import React from 'react';
import { CloudRain, ShieldCheck, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import { RainNowcastResult } from '@/lib/weather/nowcast';

interface RainNowcastCardProps {
  nowcast: RainNowcastResult;
}

export function RainNowcastCard({ nowcast }: RainNowcastCardProps) {
  const isHighConfidence = nowcast.confidence === 'High';
  const isRainImminent = nowcast.hasImminentRain;

  return (
    <div className={`rounded-3xl p-6 border shadow-xl transition-all ${
      isRainImminent
        ? 'bg-cyan-950/20 border-cyan-500/30'
        : 'glass-panel border-white/5'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isRainImminent ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary-500/10 text-primary-400'}`}>
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Rain Nowcast & Confidence
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Near-Term Radar
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Short-term precipitation modeling with source agreement telemetry
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isHighConfidence
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidence: {nowcast.confidence}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Expected Precipitation:</span>
          <span className={`text-xs font-bold ${isRainImminent ? 'text-cyan-400' : 'text-slate-400'}`}>
            {nowcast.intensity}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Forecast Interval Window:</span>
          <span className="text-xs font-bold text-white">
            {nowcast.expectedTimeWindow}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2.5">
          {nowcast.summary}
        </p>
      </div>

      {/* Source Agreement & Methodology Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          <span>{nowcast.confidenceReason}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span>{nowcast.sourceAgreement}</span>
          <span>•</span>
          <span>Telemetry Freshness: {nowcast.dataFreshnessMinutes}m</span>
        </div>
      </div>
    </div>
  );
}
