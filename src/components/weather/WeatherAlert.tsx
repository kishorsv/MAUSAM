import React from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { WeatherAlertItem } from '@/lib/weather/types';
import { formatTimeAgo } from '@/lib/utils';

interface WeatherAlertProps {
  alerts: WeatherAlertItem[];
}

export function WeatherAlert({ alerts }: WeatherAlertProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isExtreme = alert.severity === 'extreme' || alert.severity === 'severe';

        return (
          <div
            key={alert.id}
            className={`rounded-3xl p-5 border shadow-lg transition-all animate-in fade-in duration-300 ${
              isExtreme
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-glow-rose'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200 shadow-glow-amber'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isExtreme ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isExtreme ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isExtreme ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {alert.severity} • {alert.category}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {alert.title}
                  </h4>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                Source: {alert.source}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3 pl-11">
              {alert.description}
            </p>

            {alert.instruction && (
              <div className="ml-11 p-3 rounded-2xl bg-black/30 border border-white/5 text-xs text-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-300">Action: </span>
                  {alert.instruction}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
