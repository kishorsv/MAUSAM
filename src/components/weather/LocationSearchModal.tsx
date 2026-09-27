import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { WeatherLocation } from '@/lib/weather/types';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: WeatherLocation) => void;
  onUseCurrentLocation: () => void;
}

export function LocationSearchModal({
  isOpen,
  onClose,
  onSelectLocation,
  onUseCurrentLocation
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            Select Location
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Quick Button */}
        <button
          onClick={() => {
            onUseCurrentLocation();
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3.5 mb-4 rounded-2xl bg-primary-600/10 hover:bg-primary-600/20 text-primary-300 border border-primary-500/20 transition-all font-medium text-sm group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Navigation className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-primary-200">Use Real-time Device Location</div>
            <div className="text-xs text-primary-400/80">Detect accurate coordinates via GPS / browser sensor</div>
          </div>
        </button>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type city (e.g. Bengaluru, Mumbai, London, Tokyo)..."
            autoFocus
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 animate-spin" />
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {results.length > 0 ? (
            results.map((loc, idx) => (
              <button
                key={`${loc.name}-${loc.lat}-${loc.lon}-${idx}`}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 text-left transition-colors border border-transparent hover:border-slate-700 group"
              >
                <div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-primary-300">
                    {loc.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {[loc.region, loc.country].filter(Boolean).join(', ')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                </span>
              </button>
            ))
          ) : query.trim().length >= 2 && !loading ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching cities found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500">
              Enter at least 2 characters to search global cities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
