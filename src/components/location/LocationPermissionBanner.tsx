'use client';

import React from 'react';
import { 
  MapPin, Navigation, Search, AlertCircle, X, Loader2, RotateCw, 
  ShieldAlert, Compass, CheckCircle2 
} from 'lucide-react';
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
    accuracy,
    isLowAccuracy,
    accuracyWarning,
    showPromptBanner,
    requestDeviceLocation,
    dismissPrompt,
    retryPermission
  } = useLocation();

  // If granted and no accuracy warning, do not render banner
  if (permissionState === 'granted' && !isLowAccuracy) {
    return null;
  }

  // If no banner is required and no active error
  if (!showPromptBanner && !error && permissionState === 'idle') {
    return null;
  }

  // 1. LOW ACCURACY NOTICE
  if (permissionState === 'granted' && isLowAccuracy) {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>Location accuracy is low (~{Math.round(accuracy || 0)}m).</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Weather forecasts may be less precise. You can calibrate or search your exact area manually.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={retryPermission}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>Try Again</span>
            </button>
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-xs font-bold text-white shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Location</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 2. PERMISSION DENIED BANNER
  if (permissionState === 'denied') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 sm:p-5 rounded-3xl border border-rose-500/30 bg-rose-950/25 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Location permission was denied.</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                Allow location access in your browser settings and try again, or search for your city manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
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
              <span>Search Location Manually</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 3. POSITION UNAVAILABLE BANNER
  if (permissionState === 'unavailable') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                We couldn&apos;t determine your location.
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                Check your device location services and try again, or search for your location manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
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
              <span>Search Location Manually</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 4. TIMEOUT BANNER
  if (permissionState === 'timeout') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 sm:p-5 rounded-3xl border border-sky-500/30 bg-sky-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Location request timed out.
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                The satellite GPS query took too long to resolve. Please try again or search manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
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
              <span>Search Location Manually</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 5. SECURE HTTPS OR UNKNOWN ERROR BANNER
  if (permissionState === 'error' && error) {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          className="p-4 sm:p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {error.includes('HTTPS') ? 'Location access requires a secure HTTPS connection.' : 'Unable to detect your location.'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                {error}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
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
              <span>Search Location Manually</span>
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // 6. PROMPT CARD: Premium "Use your current location" UI Card
  if (showPromptBanner || permissionState === 'requesting' || permissionState === 'idle') {
    return (
      <div className="relative z-30 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
        <GlassPanel
          variant="card"
          glow="primary"
          className="p-5 sm:p-6 rounded-3xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-lg shadow-[var(--glow)]">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-2">
                  <span>📍 Use your current location</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-xl leading-relaxed">
                  Get hyperlocal weather, alerts and recommendations. Real GPS telemetry maps straight to live weather models.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all border border-white/10"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Location Manually</span>
              </button>

              <button
                onClick={() => requestDeviceLocation()}
                disabled={isDetecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:brightness-110 text-xs font-extrabold text-white shadow-xl shadow-[var(--glow)] transition-all disabled:opacity-60 transform active:scale-95"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting Coordinates...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Allow Location</span>
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
