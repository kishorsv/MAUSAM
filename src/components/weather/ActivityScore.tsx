import React from 'react';
import { Award, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { ContextualScore } from '@/lib/scores/weather-scores';

interface ActivityScoreProps {
  scores: {
    fitnessScore: ContextualScore;
    outdoorScore: ContextualScore;
    commuteScore: ContextualScore;
    eventScore: ContextualScore;
  };
}

export function ActivityScore({ scores }: ActivityScoreProps) {
  const scoreList = [
    scores.fitnessScore,
    scores.outdoorScore,
    scores.commuteScore,
    scores.eventScore
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Smart Weather Comfort Scores
        </h3>
        <span className="text-xs text-slate-400">Contextual algorithms</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreList.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  {item.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {item.score}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/100</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                &ldquo;{item.reason}&rdquo;
              </p>
            </div>

            {/* Factors pill list */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              {item.factors.slice(0, 2).map((factor, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    factor.impact === 'positive' ? 'bg-emerald-400' : factor.impact === 'negative' ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                  <span className="truncate">{factor.name}: {factor.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
