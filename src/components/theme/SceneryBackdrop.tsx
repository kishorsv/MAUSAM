'use client';

import React from 'react';

interface SceneryBackdropProps {
  type: string;
  className?: string;
}

export function SceneryBackdrop({ type, className = '' }: SceneryBackdropProps) {
  // 1. AGRICULTURE: Farmland, terraced fields, crop contours
  if (type === 'farmland-fields') {
    return (
      <svg 
        viewBox="0 0 1440 480" 
        fill="none" 
        preserveAspectRatio="none" 
        className={`w-full h-full text-emerald-950 transition-colors duration-700 ${className}`}
      >
        {/* Distant rolling green hills */}
        <path 
          d="M0 290 Q360 210 720 280 T1440 250 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.35" 
        />
        {/* Mid terrace pasture */}
        <path 
          d="M0 340 Q320 280 680 350 T1440 320 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.6" 
        />
        {/* Terraced crop contour lines */}
        <path 
          d="M60 380 Q400 320 800 390 T1400 360" 
          stroke="rgba(52, 211, 153, 0.4)" 
          strokeWidth="2" 
          strokeDasharray="8 6" 
          fill="none" 
        />
        <path 
          d="M20 410 Q380 350 780 420 T1420 390" 
          stroke="rgba(52, 211, 153, 0.35)" 
          strokeWidth="2" 
          strokeDasharray="12 8" 
          fill="none" 
        />
        {/* Foreground fertile slope */}
        <path 
          d="M0 400 Q480 340 960 410 T1440 390 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.9" 
        />
      </svg>
    );
  }

  // 2. FITNESS: Alpine running trail, mountain path, pines
  if (type === 'mountain-trail') {
    return (
      <svg 
        viewBox="0 0 1440 480" 
        fill="none" 
        preserveAspectRatio="none" 
        className={`w-full h-full text-orange-950 transition-colors duration-700 ${className}`}
      >
        {/* Distant mountain ridge */}
        <path 
          d="M0 270 L220 200 L440 280 L700 170 L940 260 L1200 190 L1440 250 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.35" 
        />
        {/* Mid slope */}
        <path 
          d="M0 330 L300 260 L620 340 L880 250 L1180 340 L1440 290 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.6" 
        />
        {/* Winding running trail */}
        <path 
          d="M100 480 Q250 420 380 390 T650 350 T920 380 T1250 320" 
          stroke="rgba(251, 146, 60, 0.5)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Trail dashed center guideline */}
        <path 
          d="M100 480 Q250 420 380 390 T650 350 T920 380 T1250 320" 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="1.5" 
          strokeDasharray="6 6" 
          fill="none" 
        />
        {/* Foreground slope */}
        <path 
          d="M0 420 Q360 370 720 420 T1440 390 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.9" 
        />
      </svg>
    );
  }

  // 3. OCEAN: Rolling coastal swell, waves, sea horizon
  if (type === 'ocean-coastal') {
    return (
      <svg 
        viewBox="0 0 1440 480" 
        fill="none" 
        preserveAspectRatio="none" 
        className={`w-full h-full text-sky-950 transition-colors duration-700 ${className}`}
      >
        {/* Distant flat sea horizon */}
        <path 
          d="M0 290 L1440 290 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.3" 
        />
        {/* Deep swell wave */}
        <path 
          d="M0 320 Q240 300 480 325 T960 315 T1440 320 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.5" 
        />
        {/* Mid cresting wave */}
        <path 
          d="M0 360 Q180 340 360 365 T720 355 T1080 365 T1440 355 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.75" 
        />
        {/* Wave whitecap foam lines */}
        <path 
          d="M80 360 Q180 342 280 360 M420 362 Q520 345 640 362 M850 360 Q960 340 1080 360" 
          stroke="rgba(56, 189, 248, 0.6)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Near shore rolling wave */}
        <path 
          d="M0 410 Q240 380 480 415 T960 400 T1440 410 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.95" 
        />
      </svg>
    );
  }

  // 4. SATELLITE: Orbital Earth curvature, planetary limb
  if (type === 'orbital-earth') {
    return (
      <svg 
        viewBox="0 0 1440 480" 
        fill="none" 
        preserveAspectRatio="none" 
        className={`w-full h-full text-slate-950 transition-colors duration-700 ${className}`}
      >
        {/* Earth Horizon Curvature */}
        <path 
          d="M-200 480 Q720 180 1640 480 Z" 
          fill="currentColor" 
          opacity="0.7" 
        />
        {/* Atmospheric Blue Limb Glow */}
        <path 
          d="M-200 480 Q720 180 1640 480" 
          stroke="rgba(56, 189, 248, 0.7)" 
          strokeWidth="6" 
          fill="none" 
        />
        {/* Faint latitude arcs */}
        <path 
          d="M0 440 Q720 260 1440 440" 
          stroke="rgba(6, 182, 212, 0.25)" 
          strokeWidth="1.5" 
          strokeDasharray="6 8" 
          fill="none" 
        />
        <path 
          d="M100 470 Q720 320 1340 470" 
          stroke="rgba(6, 182, 212, 0.2)" 
          strokeWidth="1.5" 
          strokeDasharray="6 8" 
          fill="none" 
        />
      </svg>
    );
  }

  // 5. RADAR: Range rings & Doppler grid sweep
  if (type === 'radar-grid') {
    return (
      <svg 
        viewBox="0 0 1440 480" 
        fill="none" 
        preserveAspectRatio="none" 
        className={`w-full h-full text-emerald-950 transition-colors duration-700 ${className}`}
      >
        {/* Mountain Silhouette Base */}
        <path 
          d="M0 340 L280 270 L560 360 L840 250 L1120 340 L1440 280 L1440 480 L0 480 Z" 
          fill="currentColor" 
          opacity="0.6" 
        />
        {/* Concentric radar range arcs */}
        <circle cx="720" cy="480" r="160" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
        <circle cx="720" cy="480" r="280" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
        <circle cx="720" cy="480" r="420" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" fill="none" />
        {/* Azimuth lines */}
        <line x1="720" y1="480" x2="380" y2="120" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
        <line x1="720" y1="480" x2="1060" y2="120" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
        <line x1="720" y1="480" x2="720" y2="60" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
      </svg>
    );
  }

  // 6. DEFAULT / WEATHER: Mountain Peaks & Foothills (Clear, Rain, Storm, Snow, Fog, Sunset, Night)
  return (
    <svg 
      viewBox="0 0 1440 480" 
      fill="none" 
      preserveAspectRatio="none" 
      className={`w-full h-full text-[var(--background-secondary)] transition-colors duration-700 ${className}`}
    >
      {/* Back distant high peaks */}
      <path 
        d="M0 320 L180 240 L380 340 L580 210 L760 300 L980 180 L1180 290 L1360 220 L1440 270 L1440 480 L0 480 Z" 
        fill="currentColor" 
        opacity="0.35" 
      />
      {/* Mid mountain ridge */}
      <path 
        d="M0 370 L140 310 L320 400 L540 280 L720 380 L920 270 L1120 370 L1320 300 L1440 350 L1440 480 L0 480 Z" 
        fill="currentColor" 
        opacity="0.6" 
      />
      {/* Foreground rolling foothills */}
      <path 
        d="M0 420 Q240 360 480 430 T960 410 T1440 430 L1440 480 L0 480 Z" 
        fill="currentColor" 
        opacity="0.9" 
      />
    </svg>
  );
}
