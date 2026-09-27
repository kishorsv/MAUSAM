'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, CloudRain, Sun, Leaf, Info, ChevronRight } from 'lucide-react';
import { WeatherAlertItem } from '@/lib/weather/types';
import { formatTimeAgo } from '@/lib/utils';
import { GlassPanel } from '@/components/common/GlassPanel';

interface WeatherAlertProps {
  alerts: WeatherAlertItem[];
}

export function WeatherAlert({ alerts }: WeatherAlertProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3.5">
      {alerts.map((alert) => {
        const isExtreme = alert.severity === 'extreme' || alert.severity === 'severe';
        const isWarning = alert.severity === 'moderate' || alert.severity === 'minor';
        
        let accentGlow: 'rose' | 'amber' | 'cyan' = isExtreme ? 'rose' : isWarning ? 'amber' : 'cyan';
        let badgeBg = isExtreme ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
        let iconBg = isExtreme ? 'bg-rose-500/25 text-rose-300' : isWarning ? 'bg-amber-500/25 text-amber-300' : 'bg-cyan-500/25 text-cyan-300';

        return (
          <GlassPanel
            key={alert.id}
            variant="card"
            glow={accentGlow}
            className={`p-5 sm:p-6 transition-all duration-300 ${
              isExtreme 
                ? 'border-rose-500/40 bg-rose-950/20' 
                : isWarning 
                ? 'border-amber-500/35 bg-amber-950/15' 
                : 'border-cyan-500/35 bg-cyan-950/15'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${iconBg} shadow-sm shrink-0`}>
                  {isExtreme ? (
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  ) : alert.category === 'rain' ? (
                    <CloudRain className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {alert.severity} • {alert.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTimeAgo(alert.effective)}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1">
                    {alert.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                <span>{alert.source}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3 pl-12">
              {alert.description}
            </p>

            {alert.instruction && (
              <div className="ml-12 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300">Safety Advisory: </span>
                  {alert.instruction}
                </div>
              </div>
            )}
          </GlassPanel>
        );
      })}
    </div>
  );
}
