import React from 'react';

export function LoadingSkeleton({ className = "h-48 w-full" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl glass-panel animate-pulse bg-slate-800/40 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="h-64 rounded-3xl glass-panel bg-slate-800/40 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
        <LoadingSkeleton className="h-36" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LoadingSkeleton className="h-80 lg:col-span-2" />
        <LoadingSkeleton className="h-80" />
      </div>
    </div>
  );
}
