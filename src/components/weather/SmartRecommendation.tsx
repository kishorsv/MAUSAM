import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { GeneratedInsight } from '@/lib/automation/rules';

interface SmartRecommendationProps {
  insights: GeneratedInsight[];
}

export function SmartRecommendation({ insights }: SmartRecommendationProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Smart Automation & Lifestyle Advisory
        </h3>
        <span className="text-xs text-slate-400">Rules Engine Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                {insight.title}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                insight.urgency === 'critical'
                  ? 'bg-rose-500/20 text-rose-300'
                  : insight.urgency === 'high'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-primary-500/20 text-primary-300'
              }`}>
                {insight.urgency}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {insight.message}
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span>{insight.actionableRecommendation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
