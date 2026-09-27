'use client';

import React from 'react';
import { 
  Sprout, CloudRain, Sun, Cloud, Activity, 
  Waves, Sparkles, Orbit, Compass, MapPin, 
  Heart, Calendar, Check
} from 'lucide-react';
import { FeatureWorldId } from '@/lib/theme/scene-registry';
import { GlassPanel } from '@/components/common/GlassPanel';

export interface FeatureDockItem {
  id: FeatureWorldId;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  gradient: string;
  statusText: string;
  badgeColor: string;
}

export const FEATURE_WORLDS: FeatureDockItem[] = [
  {
    id: 'agriculture',
    title: 'Agriculture',
    shortDesc: 'Smart farming, soil moisture & crop protection',
    icon: Sprout,
    accentColor: '#10b981',
    gradient: 'from-emerald-950/70 via-emerald-900/40 to-green-950/60',
    statusText: 'Agri Telemetry',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'rain',
    title: 'Rain Tracker',
    shortDesc: 'Precipitation nowcasting & live radar',
    icon: CloudRain,
    accentColor: '#0284c7',
    gradient: 'from-sky-950/70 via-blue-900/40 to-cyan-950/60',
    statusText: 'Nowcast Live',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
  },
  {
    id: 'sunny',
    title: 'Sunny & UV',
    shortDesc: 'Solar radiation & outdoor exposure guidance',
    icon: Sun,
    accentColor: '#f59e0b',
    gradient: 'from-amber-950/70 via-yellow-900/40 to-orange-950/60',
    statusText: 'High Sunlight',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'cloudy',
    title: 'Cloud Cover',
    shortDesc: 'Atmospheric layers, ceiling & visibility',
    icon: Cloud,
    accentColor: '#94a3b8',
    gradient: 'from-slate-950/70 via-slate-900/40 to-zinc-950/60',
    statusText: 'Overcast Radar',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  },
  {
    id: 'fitness',
    title: 'Fitness & Run',
    shortDesc: 'Optimal outdoor workout window & runner score',
    icon: Activity,
    accentColor: '#f97316',
    gradient: 'from-orange-950/70 via-red-900/40 to-amber-950/60',
    statusText: 'Prime Window',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  {
    id: 'ocean',
    title: 'Ocean Marine',
    shortDesc: 'Wave height, swell, water temp & shoreline wind',
    icon: Waves,
    accentColor: '#0ea5e9',
    gradient: 'from-cyan-950/70 via-teal-900/40 to-blue-950/60',
    statusText: 'Marine Waves',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'weather',
    title: 'Live Weather',
    shortDesc: 'Full real-time meteorological intelligence',
    icon: Sparkles,
    accentColor: '#38bdf8',
    gradient: 'from-indigo-950/70 via-blue-900/40 to-slate-950/60',
    statusText: 'Synchronized',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'satellite',
    title: 'Satellite',
    shortDesc: 'Orbital Earth observation & weather layers',
    icon: Orbit,
    accentColor: '#06b6d4',
    gradient: 'from-cyan-950/70 via-sky-900/40 to-blue-950/60',
    statusText: 'Orbital Telemetry',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'radar',
    title: 'Doppler Radar',
    shortDesc: 'Atmospheric storm cells & rain velocity',
    icon: Compass,
    accentColor: '#10b981',
    gradient: 'from-emerald-950/70 via-teal-900/40 to-green-950/60',
    statusText: 'Doppler Active',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'travel',
    title: 'Travel & Trips',
    shortDesc: 'Scenic destinations & departure climate check',
    icon: MapPin,
    accentColor: '#eab308',
    gradient: 'from-yellow-950/70 via-amber-900/40 to-orange-950/60',
    statusText: 'Destination Safe',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  {
    id: 'health',
    title: 'Health & AQI',
    shortDesc: 'Particulate air quality & respiratory guidance',
    icon: Heart,
    accentColor: '#2dd4bf',
    gradient: 'from-teal-950/70 via-emerald-900/40 to-cyan-950/60',
    statusText: 'Air Sanctuary',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  },
  {
    id: 'events',
    title: 'Events & Social',
    shortDesc: 'Outdoor gathering & party weather feasibility',
    icon: Calendar,
    accentColor: '#ec4899',
    gradient: 'from-pink-950/70 via-purple-900/40 to-rose-950/60',
    statusText: 'Event Horizon',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  }
];

interface FeatureDockProps {
  selectedFeature: FeatureWorldId | null;
  onSelectFeature: (featureId: FeatureWorldId) => void;
}

export function FeatureDock({ selectedFeature, onSelectFeature }: FeatureDockProps) {
  return (
    <section className="relative z-20 my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            Explore Dynamic Weather Worlds
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono hidden sm:inline">
            Interactive Scenery
          </span>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] hidden md:block">
          Select a world to transform the cinematic background & AI context
        </p>
      </div>

      {/* Horizontal Scrolling Feature Cards Container */}
      <div className="relative">
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
          {FEATURE_WORLDS.map((item) => {
            const isSelected = selectedFeature === item.id || (!selectedFeature && item.id === 'weather');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectFeature(item.id)}
                className={`group relative text-left shrink-0 w-64 sm:w-72 p-4 sm:p-5 rounded-3xl transition-all duration-300 snap-start select-none outline-none overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[var(--primary)] shadow-[var(--glow)] scale-[1.02]'
                    : 'hover:scale-[1.02] hover:border-white/20'
                }`}
                style={{
                  background: 'var(--surface-glass)',
                  backdropFilter: 'blur(20px)',
                  border: isSelected 
                    ? `1.5px solid ${item.accentColor}` 
                    : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Background Ambient Gradient */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-40 group-hover:opacity-60 transition-opacity duration-300`} 
                />

                {/* Top Specular Inner Reflection */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${item.accentColor}25`,
                        borderColor: `${item.accentColor}50`,
                        color: item.accentColor
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.statusText}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-[var(--foreground)] tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[var(--foreground-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {item.shortDesc}
                    </p>
                  </div>

                  {/* Active Indicator Bar */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold">
                    <span style={{ color: item.accentColor }}>
                      {isSelected ? 'Active World' : 'Click to enter scene'}
                    </span>
                    <span className="text-slate-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
