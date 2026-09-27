import React from 'react';
import { Activity, ShieldCheck, DatabaseZap } from 'lucide-react';

interface ModeBadgeProps {
  isLive: boolean;
  cached?: boolean;
  className?: string;
}

export function ModeBadge({ isLive, cached, className = "" }: ModeBadgeProps) {
  if (isLive) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <Activity className="w-3 h-3" />
        <span>LIVE DATA</span>
        {cached && (
          <span className="text-[10px] text-emerald-300/70 border-l border-emerald-500/20 pl-1.5 ml-0.5 normal-case font-normal">
            Cached
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      <DatabaseZap className="w-3 h-3" />
      <span>DEMO DATA</span>
    </div>
  );
}
