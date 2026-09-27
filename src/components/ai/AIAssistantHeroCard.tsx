'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, Zap, MessageSquare, Compass, Send } from 'lucide-react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { WeatherPayload } from '@/lib/weather/types';

interface AIAssistantHeroCardProps {
  weather: WeatherPayload;
  onOpenAI: (initialPrompt?: string) => void;
  className?: string;
}

export function AIAssistantHeroCard({
  weather,
  onOpenAI,
  className = ''
}: AIAssistantHeroCardProps) {
  const [customInput, setCustomInput] = useState('');

  // Contextual greeting based on hour & conditions
  const getContextualGreeting = () => {
    const hr = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hr >= 12 && hr < 17) timeGreeting = 'Good afternoon';
    else if (hr >= 17 && hr < 21) timeGreeting = 'Good evening';
    else if (hr >= 21 || hr < 5) timeGreeting = 'Good night';

    const temp = Math.round(weather.current.temperature);
    const rain = weather.daily?.[0]?.precipitationProbability ?? (weather.current.precipitation > 0 ? 80 : 0);
    const aqi = weather.airQuality?.aqi ?? 45;

    let conditionNote = 'Weather conditions are currently comfortable for outdoor activity.';
    if (rain >= 50) {
      conditionNote = `Precipitation probability is elevated (${rain}%). Carrying an umbrella is advised.`;
    } else if (aqi > 100) {
      conditionNote = `Air Quality Index is ${aqi} (elevated particulate matter). Sensitive groups should reduce strenuous exertion.`;
    } else if (temp > 32) {
      conditionNote = `Temperature is elevated at ${temp}°C. Hydrate adequately during outdoor hours.`;
    } else if (temp < 15) {
      conditionNote = `Current temperature is a crisp ${temp}°C. Layered warm clothing is recommended.`;
    }

    return `${timeGreeting}. ${conditionNote}`;
  };

  const quickActions = [
    { label: 'Best time to run?', prompt: 'What is the best time for outdoor running today based on current temperature, rain probability, and AQI?' },
    { label: 'Will it rain?', prompt: 'Will it rain in my area today or in the next 12 hours? Give me the exact precipitation probability.' },
    { label: 'What should I wear?', prompt: 'What clothing should I wear today based on the temperature, humidity, and wind conditions?' }
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onOpenAI(customInput.trim());
    setCustomInput('');
  };

  return (
    <GlassPanel 
      variant="card" 
      glow="purple"
      className={`p-6 sm:p-7 relative overflow-hidden ${className}`}
    >
      {/* Decorative Neural Wave Glow in the background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-violet-600/25 via-purple-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Glowing AI Orb + Greeting */}
        <div className="flex items-start gap-4 sm:gap-5 flex-1">
          {/* Glowing Animated AI Orb */}
          <div className="relative shrink-0 mt-0.5">
            {/* Outer Pulsing Waveform Ring */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-400 opacity-40 blur-md animate-pulse" />
            
            {/* Core Orb Container */}
            <div className="relative w-14 h-14 rounded-2xl p-[1.5px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 shadow-xl">
              <div className="w-full h-full rounded-[14px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
                {/* Waveform Bars animation */}
                <div className="flex items-center gap-0.5 h-6">
                  <span className="w-1 bg-cyan-400 rounded-full animate-[pulse_1s_ease-in-out_infinite] h-3" />
                  <span className="w-1 bg-violet-400 rounded-full animate-[pulse_1.4s_ease-in-out_infinite] h-5" />
                  <span className="w-1 bg-fuchsia-400 rounded-full animate-[pulse_1.1s_ease-in-out_infinite] h-6" />
                  <span className="w-1 bg-cyan-300 rounded-full animate-[pulse_1.3s_ease-in-out_infinite] h-4" />
                </div>
              </div>
            </div>

            {/* Live Indicator Beacon */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </span>
          </div>

          {/* AI Status & Real Intelligence Greeting */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                MAUSAM AI Assistant
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-semibold text-violet-300">
                Ground-Truth Real-Time
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
              {getContextualGreeting()}
            </p>

            <p className="text-xs text-slate-400 hidden sm:block">
              Connected to meteorological telemetry, live Doppler radar, and personalized health/fitness profiles.
            </p>
          </div>
        </div>

        {/* Right Section: Action Trigger Button */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <button
            onClick={() => onOpenAI()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-[0_0_24px_-3px_rgba(139,92,246,0.5)] transition-all border border-white/20"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Open AI Weather Chat</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Quick Action Decision Pills */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5 relative z-10">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Quick Actions:
        </span>

        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => onOpenAI(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-xs text-slate-200 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3 h-3 text-violet-400 opacity-60" />
          </button>
        ))}

        {/* Quick Question Input Form */}
        <form 
          onSubmit={handleCustomSubmit}
          className="flex-1 min-w-[200px] flex items-center gap-1.5 ml-auto bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus-within:border-violet-400 transition-colors"
        >
          <input 
            type="text"
            placeholder="Ask anything about today's weather..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 outline-none"
          />
          <button 
            type="submit" 
            disabled={!customInput.trim()}
            className="p-1 text-violet-400 hover:text-white disabled:opacity-40 transition-colors"
            title="Ask"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </GlassPanel>
  );
}
