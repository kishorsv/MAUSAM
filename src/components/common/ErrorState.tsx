import React from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onChangeLocation?: () => void;
}

export function ErrorState({
  title = "Weather data temporarily unavailable.",
  message = "We encountered a temporary network or provider delay while fetching current atmospheric readings.",
  onRetry,
  onChangeLocation
}: ErrorStateProps) {
  return (
    <div className="glass-panel rounded-3xl p-8 text-center max-w-lg mx-auto my-12 border border-rose-500/20 shadow-2xl backdrop-blur-xl">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-md">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-primary-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        )}
        {onChangeLocation && (
          <button
            onClick={onChangeLocation}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all duration-200 border border-white/10"
          >
            <Search className="w-4 h-4" />
            <span>Change Location</span>
          </button>
        )}
      </div>
    </div>
  );
}
