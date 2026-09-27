import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { IntelligenceFeedItem } from '@/lib/db/types';

export function IntelligenceFeed() {
  const [feed, setFeed] = useState<IntelligenceFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/feed');
      if (res.ok) {
        const data = await res.json();
        setFeed(data.feed || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Mausam Intelligence Feed
            </h3>
            <p className="text-xs text-slate-400">
              Continuously updated chronological meteorological events
            </p>
          </div>
        </div>

        <button
          onClick={fetchFeed}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading intelligence telemetry...</div>
      ) : feed.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400">No recent meteorological events recorded.</div>
      ) : (
        <div className="space-y-2.5">
          {feed.map((item) => {
            const isAlert = item.urgency === 'alert';
            const isNotice = item.urgency === 'notice';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold text-primary-400 whitespace-nowrap mt-0.5">
                    {item.time}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span>{item.message}</span>
                      {isAlert && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Alert
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Source: {item.source}</span>
                      <span>•</span>
                      <span>Station: {item.locationName}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {item.freshness}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
