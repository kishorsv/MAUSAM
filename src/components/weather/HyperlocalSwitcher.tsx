import React from 'react';
import { Home, Building2, School, Dumbbell, Sprout, PartyPopper, MapPin, Check } from 'lucide-react';
import { SavedLocation } from '@/lib/db/types';

interface HyperlocalSwitcherProps {
  locations: SavedLocation[];
  activeLocationName: string;
  onSelect: (loc: SavedLocation) => void;
}

export function HyperlocalSwitcher({ locations, activeLocationName, onSelect }: HyperlocalSwitcherProps) {
  if (!locations || locations.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'office': return Building2;
      case 'school': return School;
      case 'gym': return Dumbbell;
      case 'farm': return Sprout;
      case 'event': return PartyPopper;
      default: return MapPin;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Hyperlocal Microclimate Stations:
        </span>
        <span className="text-[11px] text-slate-500">{locations.length} pinned points</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {locations.map((loc) => {
          const Icon = getIcon(loc.location_type);
          const isActive = loc.name.toLowerCase() === activeLocationName.toLowerCase();

          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-600 text-white border-primary-500 shadow-glow-primary'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{loc.name}</span>
              {isActive && <Check className="w-3 h-3 text-white ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
