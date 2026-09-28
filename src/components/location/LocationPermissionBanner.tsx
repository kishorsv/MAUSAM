'use client';

import React from 'react';
import { MapPin, Navigation, Search, AlertCircle, X, Loader2, RotateCw } from 'lucide-react';
import { useLocation } from './LocationContext';
import { GlassPanel } from '@/components/common/GlassPanel';

interface LocationPermissionBannerProps {
  onOpenSearch: () => void;
}

export function LocationPermissionBanner({ onOpenSearch }: LocationPermissionBannerProps) {
  const {
    permissionState,
    isDetecting,
    error,
    showPromptBanner,
    requestDeviceLocation,
    dismissPrompt,
    retryPermission
  } = useLocation();

  // If no banner is required to be shown and no active error
  if (!showPromptBanner && !error && permissionState !== 'denied' && permissionState !== 'unavailable') {
    return null;
  }

  // 1. PERMISSION DENIED BANNER
  if (permissionState === 'denied') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 sm:p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Location access is blocked.</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Allow permission in your browser address bar to view hyper-local weather, or search for any global city.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={retryPermission}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>Try Again</span>
            </button>
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:brightness-110 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Manually</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 2. GEOLOCATION UNAVAILABLE BANNER
  if (permissionState === 'unavailable') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Location is not supported by this browser.</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">Please use manual search to set your weather location.</p>
            </div>
          </div>
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-xs font-bold text-white self-end sm:self-auto"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Location</span>
          </button>
        </GlassPanel>
      </div>
    );
  }

  // 3. PROMPT BANNER: "Allow location access to get local weather"
  if (showPromptBanner) {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          glow="primary"
          className="p-4 sm:p-5 rounded-3xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[var(--foreground)] tracking-tight">
                  Allow location access to get local weather
                </h4>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5 max-w-xl leading-relaxed">
                  MAUSAM detects real-time coordinates, live rain nowcasts, air quality, and atmospheric scenes for your exact vicinity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all border border-white/10"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Location</span>
              </button>

              <button
                onClick={() => requestDeviceLocation()}
                disabled={isDetecting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-[var(--glow)] transition-all disabled:opacity-60"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use My Location</span>
                  </>
                )}
              </button>

              <button
                onClick={dismissPrompt}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return null;
}
