'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Radio, Layers, Route, Users, Cpu, Sprout, 
  Activity, CloudRain, Waves, Heart, ArrowUpRight, 
  Sparkles, Compass, ShieldCheck
} from 'lucide-react';
import { FeatureWorldId } from '@/lib/theme/scene-registry';
import { GlassPanel } from '@/components/common/GlassPanel';

interface FeatureCardItem {
  id: string;
  title: string;
  category: 'Centers & Radar' | 'Personal Worlds';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  badgeType: 'live' | 'ready' | 'interactive';
  href?: string;
  featureWorldId?: FeatureWorldId;
}

const EXPLORE_FEATURES: FeatureCardItem[] = [
  {
    id: 'doppler-radar',
    title: 'Doppler Radar',
    category: 'Centers & Radar',
    description: 'High-resolution atmospheric storm reflectivity, precipitation velocity & cell tracking.',
    icon: Radio,
    accentColor: '#06b6d4',
    badge: '● Live Doppler',
    badgeType: 'live',
    href: '/radar'
  },
  {
    id: 'satellite-view',
    title: 'Satellite Earth Observation',
    category: 'Centers & Radar',
    description: 'Orbital multispectral imagery, cloud layer thermodynamics and continental synoptic views.',
    icon: Layers,
    accentColor: '#6366f1',
    badge: '● Orbital Stream',
    badgeType: 'live',
    href: '/satellite'
  },
  {
    id: 'route-intelligence',
    title: 'Commuter Route Intelligence',
    category: 'Centers & Radar',
    description: 'Waypoint weather risk modeling, rain hazard prediction & road travel conditions.',
    icon: Route,
    accentColor: '#10b981',
    badge: 'Route Engine',
    badgeType: 'ready',
    href: '/route'
  },
  {
    id: 'group-sharing',
    title: 'Group Weather Hub',
    category: 'Centers & Radar',
    description: 'Collaborative team expeditions, family alerts & shared location microclimates.',
    icon: Users,
    accentColor: '#a855f7',
    badge: 'Live Sync',
    badgeType: 'interactive',
    href: '/group'
  },
  {
    id: 'iot-station',
    title: 'IoT Weather Station',
    category: 'Centers & Radar',
    description: 'Personal hardware sensor node telemetry: barometric pressure, soil and solar flux.',
    icon: Cpu,
    accentColor: '#84cc16',
    badge: 'Sensors Active',
    badgeType: 'live',
    href: '/station'
  },
  {
    id: 'agriculture-world',
    title: 'Agriculture Intelligence',
    category: 'Personal Worlds',
    description: 'Evapotranspiration calculations, crop irrigation planning and frost warning alerts.',
    icon: Sprout,
    accentColor: '#10b981',
    badge: 'Agronomy AI',
    badgeType: 'interactive',
    href: '/agriculture',
    featureWorldId: 'agriculture'
  },
  {
    id: 'fitness-haven',
    title: 'Fitness & Runner Haven',
    category: 'Personal Worlds',
    description: 'Optimal outdoor training windows, heat exhaustion risk & aerodynamic wind ratings.',
    icon: Activity,
    accentColor: '#f97316',
    badge: 'Runner Score',
    badgeType: 'interactive',
    href: '/fitness',
    featureWorldId: 'fitness'
  },
  {
    id: 'rain-tracker',
    title: 'Rain Tracker & Nowcasting',
    category: 'Personal Worlds',
    description: 'Hyperlocal 0–120 minute precipitation forecasting with radar-derived velocity.',
    icon: CloudRain,
    accentColor: '#0284c7',
    badge: '● 0-min Nowcast',
    badgeType: 'live',
    featureWorldId: 'rain'
  },
  {
    id: 'ocean-marine',
    title: 'Ocean Marine & Swell',
    category: 'Personal Worlds',
    description: 'Coastal wave heights, offshore swell periods, sea surface temperature and surf index.',
    icon: Waves,
    accentColor: '#0ea5e9',
    badge: 'Marine Buoy',
    badgeType: 'interactive',
    featureWorldId: 'ocean'
  },
  {
    id: 'health-aqi',
    title: 'Health & AQI Sanctuary',
    category: 'Personal Worlds',
    description: 'Real-time PM2.5, respiratory exposure advisory and pollen count mitigation.',
    icon: Heart,
    accentColor: '#2dd4bf',
    badge: 'Air Quality',
    badgeType: 'ready',
    href: '/health',
    featureWorldId: 'health'
  }
];

interface ExploreMausamGridProps {
  activeFeatureWorld: FeatureWorldId | null;
  onSelectFeatureWorld: (featureId: FeatureWorldId) => void;
}

export function ExploreMausamGrid({
  activeFeatureWorld,
  onSelectFeatureWorld
}: ExploreMausamGridProps) {
  return (
    <section className="relative z-20 space-y-4">
      {/* Section Header with Spacious Typography */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary)]">
              Integrated Meteorological Ecosystem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
            Explore MAUSAM
          </h2>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] max-w-md">
          Access specialized observation centers, satellite telemetry, commuter hazard routing, and personal intelligence worlds.
        </p>
      </div>

      {/* Grid: 1 col on mobile, 2 col on tablet, 3 or 4 col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {EXPLORE_FEATURES.map((item) => {
          const Icon = item.icon;
          const isActive = item.featureWorldId && activeFeatureWorld === item.featureWorldId;

          const CardContent = (
            <GlassPanel
              variant="card"
              className={`h-full p-5 rounded-3xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 hover:border-white/20 select-none ${
                isActive
                  ? 'ring-2 ring-[var(--primary)] shadow-[var(--glow)] border-[var(--primary)]/50'
                  : ''
              }`}
            >
              {/* Top Row: Icon + Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.accentColor}18`,
                      borderColor: `${item.accentColor}40`,
                      color: item.accentColor
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                      item.badgeType === 'live'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                        : item.badgeType === 'ready'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-extrabold text-[var(--foreground)] tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mt-2 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Bottom Quick-Launch Action */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span 
                  className="text-xs font-bold transition-colors group-hover:underline flex items-center gap-1"
                  style={{ color: item.accentColor }}
                >
                  {item.href ? 'Launch Module' : isActive ? 'Active Scene' : 'Activate World'}
                </span>
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ backgroundColor: `${item.accentColor}20`, color: item.accentColor }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </GlassPanel>
          );

          if (item.href) {
            return (
              <Link 
                key={item.id} 
                href={item.href}
                className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-3xl"
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.featureWorldId) {
                  onSelectFeatureWorld(item.featureWorldId);
                }
              }}
              className="block h-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-3xl"
            >
              {CardContent}
            </button>
          );
        })}
      </div>
    </section>
  );
}
