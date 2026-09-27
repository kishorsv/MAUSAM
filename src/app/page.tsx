'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { WeatherHero } from '@/components/weather/WeatherHero';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { AQICard } from '@/components/weather/AQICard';
import { WeatherAlert } from '@/components/weather/WeatherAlert';
import { ActivityScore } from '@/components/weather/ActivityScore';
import { SmartRecommendation } from '@/components/weather/SmartRecommendation';
import dynamic from 'next/dynamic';

const LocationSearchModal = dynamic(
  () => import('@/components/weather/LocationSearchModal').then((mod) => mod.LocationSearchModal),
  { ssr: false }
);

const AIChatDrawer = dynamic(
  () => import('@/components/ai/AIChatDrawer').then((mod) => mod.AIChatDrawer),
  { ssr: false }
);

const WeatherMapComponent = dynamic(
  () => import('@/components/map/WeatherMapComponent').then((mod) => mod.WeatherMapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-3xl glass-panel border border-white/5 flex items-center justify-center text-slate-500 text-xs">
        Loading Interactive Weather Radar Map...
      </div>
    )
  }
);

// Persona Modules
import { FitnessModule } from '@/components/modules/FitnessModule';
import { TravelModule } from '@/components/modules/TravelModule';
import { FamilyModule } from '@/components/modules/FamilyModule';
import { AgricultureModule } from '@/components/modules/AgricultureModule';
import { CommuterModule } from '@/components/modules/CommuterModule';
import { EventModule } from '@/components/modules/EventModule';
import { BeachModule } from '@/components/modules/BeachModule';

// Common States
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

// Types
import { WeatherPayload, WeatherLocation } from '@/lib/weather/types';
import { PrioritizedCard, ActivityWindow } from '@/lib/personalization/types';
import { GeneratedInsight } from '@/lib/automation/rules';
import { ContextualScore } from '@/lib/scores/weather-scores';
import { UserPreferences, SavedLocation } from '@/lib/db/types';
import { Language, translations } from '@/lib/i18n/translations';

// Advanced Intelligence & Decision Engines
import { rainNowcastingEngine, RainNowcastResult } from '@/lib/weather/nowcast';
import { weatherDecisionEngine, DecisionEngineOutput } from '@/lib/intelligence/decision-engine';
import { personalizationEngine } from '@/lib/personalization/engine';

// Extended Weather Components
import { RainNowcastCard } from '@/components/weather/RainNowcastCard';
import { WeatherRiskTimeline } from '@/components/weather/WeatherRiskTimeline';
import { HyperlocalSwitcher } from '@/components/weather/HyperlocalSwitcher';
import { IntelligenceFeed } from '@/components/weather/IntelligenceFeed';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AIAssistantHeroCard } from '@/components/ai/AIAssistantHeroCard';
import { GlassPanel } from '@/components/common/GlassPanel';

// Atmospheric Living Background & Theme Engine
import { useTheme } from '@/components/theme/ThemeContext';

// Icons
import { 
  Sparkles, SlidersHorizontal, Info, RefreshCw, 
  Activity, Heart, Waves, Plane, Users, Sprout, Car, PartyPopper, Check
} from 'lucide-react';

export default function HomePage() {
  const { visualState, setWeatherForTheme } = useTheme();
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Personalization State
  const [prioritizedCards, setPrioritizedCards] = useState<PrioritizedCard[]>([]);
  const [fitnessWindows, setFitnessWindows] = useState<ActivityWindow[]>([]);
  const [scores, setScores] = useState<{
    fitnessScore: ContextualScore;
    outdoorScore: ContextualScore;
    commuteScore: ContextualScore;
    eventScore: ContextualScore;
  } | null>(null);
  const [insights, setInsights] = useState<GeneratedInsight[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // UI Modals & Settings
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const handleOpenAIWithPrompt = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIOpen(true);
  };
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>({
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946
  });
  const [language, setLanguage] = useState<Language>('en');
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [isOffline, setIsOffline] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  // Browser Network Connectivity Monitor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch Hyperlocal Saved Microclimate Locations
  useEffect(() => {
    const fetchSavedLocations = async () => {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            setSavedLocations(data.locations);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchSavedLocations();
  }, []);

  // Fetch Weather and execute Personalization Engine
  const loadWeatherAndPersonalization = useCallback(async (loc: WeatherLocation, prefsOverride?: UserPreferences) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Real Weather Data via Backend Provider
      const weatherRes = await fetch(
        `/api/weather/current?lat=${loc.lat}&lon=${loc.lon}&name=${encodeURIComponent(loc.name)}&region=${encodeURIComponent(loc.region || '')}&country=${encodeURIComponent(loc.country || '')}`
      );

      if (!weatherRes.ok) {
        throw new Error("Live weather data temporarily unavailable.");
      }

      const weatherData: WeatherPayload = await weatherRes.json();
      setWeather(weatherData);
      setWeatherForTheme(weatherData);

      // FAST FIRST PAINT: Compute card priorities instantly in 0ms on the client!
      const immediateCards = personalizationEngine.calculateCardPriorities(weatherData, prefsOverride || preferences);
      const immediateWindows = personalizationEngine.calculateFitnessWindows(weatherData.hourly, weatherData.airQuality?.aqi);
      setPrioritizedCards(immediateCards);
      setFitnessWindows(immediateWindows);
      setLoading(false); // Immediately dismiss skeleton & reveal core dashboard

      // 2. Non-blocking Asynchronous Background Synchronization
      fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather: weatherData,
          preferences: prefsOverride || preferences
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((pData) => {
          if (pData) {
            if (pData.prioritizedCards) setPrioritizedCards(pData.prioritizedCards);
            if (pData.fitnessWindows) setFitnessWindows(pData.fitnessWindows);
            if (pData.scores) setScores(pData.scores);
            if (pData.insights) setInsights(pData.insights);
            if (pData.activePreferences && !preferences) {
              setPreferences(pData.activePreferences);
              setLanguage(pData.activePreferences.language || 'en');
            }
          }
        })
        .catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to load weather data.");
      setLoading(false);
    }
  }, [preferences, setWeatherForTheme]);

  // Initial mount load
  useEffect(() => {
    loadWeatherAndPersonalization(selectedLocation);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle GPS Current Device Location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: WeatherLocation = {
            name: 'Device GPS Location',
            country: 'Live Sensor',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          setSelectedLocation(loc);
          loadWeatherAndPersonalization(loc);
        },
        () => {
          // If permission denied, keep current location
          setLoading(false);
        }
      );
    }
  };

  // Toggle Persona on the fly and re-rank homepage dynamically
  const handleTogglePersona = async (personaKey: keyof UserPreferences) => {
    if (!preferences) return;
    const updated = {
      ...preferences,
      [personaKey]: !preferences[personaKey]
    };
    setPreferences(updated);

    // INSTANT 0ms local recalculation: Re-rank cards immediately on user touch
    if (weather) {
      const immediateCards = personalizationEngine.calculateCardPriorities(weather, updated);
      setPrioritizedCards(immediateCards);
    }

    // Persist to database asynchronously
    fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [personaKey]: updated[personaKey] })
    }).catch(() => {});

    // Asynchronously refresh server insights in background
    if (weather) {
      fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather, preferences: updated })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((pData) => {
          if (pData) {
            if (pData.scores) setScores(pData.scores);
            if (pData.insights) setInsights(pData.insights);
          }
        })
        .catch(() => {});
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (preferences) {
      setPreferences({ ...preferences, language: lang });
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
    }
  };

  const t = translations[language] || translations.en;

  // Real-time Meteorological Decision & Nowcast Evaluations
  const nowcast: RainNowcastResult | null = weather ? rainNowcastingEngine.calculateNowcast(weather) : null;
  const decision: DecisionEngineOutput | null = weather ? weatherDecisionEngine.evaluate(weather, preferences) : null;

  const lifestyleToggles = [
    { key: 'fitness_enabled' as const, label: 'Fitness', icon: Activity, active: preferences?.fitness_enabled },
    { key: 'health_enabled' as const, label: 'Health & AQI', icon: Heart, active: preferences?.health_enabled },
    { key: 'travel_enabled' as const, label: 'Travel', icon: Plane, active: preferences?.travel_enabled },
    { key: 'commuter_enabled' as const, label: 'Commute', icon: Car, active: preferences?.commuter_enabled },
    { key: 'family_enabled' as const, label: 'Family', icon: Users, active: preferences?.family_enabled },
    { key: 'agriculture_enabled' as const, label: 'Agriculture', icon: Sprout, active: preferences?.agriculture_enabled },
    { key: 'event_enabled' as const, label: 'Events', icon: PartyPopper, active: preferences?.event_enabled },
    { key: 'beach_enabled' as const, label: 'Beach & Surf', icon: Waves, active: preferences?.beach_enabled },
  ];

  return (
    <div 
      className="min-h-screen flex relative overflow-x-hidden transition-colors duration-500"
      style={{ color: 'var(--foreground)' }}
    >
      {/* Premium Desktop Sidebar Navigation */}
      <Sidebar onOpenAI={() => handleOpenAIWithPrompt()} />

      {/* Main Content Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 sm:pb-12">
        {/* Floating Top Header Bar */}
        <Header
          currentLocation={weather?.location || selectedLocation}
          isLive={weather?.isLive ?? true}
          cached={weather?.cached}
          language={language}
          onLanguageChange={handleLanguageChange}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAI={() => handleOpenAIWithPrompt()}
          unreadCount={unreadNotifications}
          userName="Priya"
          isOffline={isOffline}
        />

        {/* Main Content Dashboard */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-6">
          {/* Lifestyle Persona Dynamic Toggles Bar */}
          <GlassPanel 
            variant="card"
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-xs font-bold text-[var(--foreground)]">
                Personalized Lifestyle Engine:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {lifestyleToggles.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleTogglePersona(item.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      item.active
                        ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/40 shadow-sm'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.active && <Check className="w-3 h-3 text-[var(--primary)] ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Explainability Button */}
            <button
              onClick={() => setShowExplanationModal(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[var(--primary)] transition-colors ml-auto sm:ml-0"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Why this card order?</span>
            </button>
          </GlassPanel>

        {/* Hyperlocal Microclimate Stations Switcher */}
        {savedLocations.length > 0 && (
          <HyperlocalSwitcher
            locations={savedLocations}
            activeLocationName={weather?.location?.name || selectedLocation.name}
            onSelect={(loc) => {
              const targetLoc: WeatherLocation = {
                name: loc.name,
                region: loc.location_type,
                country: 'Saved Station',
                lat: loc.latitude,
                lon: loc.longitude
              };
              setSelectedLocation(targetLoc);
              loadWeatherAndPersonalization(targetLoc);
            }}
          />
        )}

        {/* Loading Skeleton */}
        {loading && <DashboardSkeleton />}

        {/* Error State */}
        {!loading && error && (
          <ErrorState
            title="Live weather data temporarily unavailable."
            message={error}
            onRetry={() => loadWeatherAndPersonalization(selectedLocation)}
          />
        )}

        {/* Populated Intelligent Dynamic Feed */}
        {!loading && !error && weather && (
          <div className="space-y-6">
            {/* Prominent Cinematic MAUSAM AI Weather Intelligence Panel */}
            <AIAssistantHeroCard 
              weather={weather} 
              onOpenAI={handleOpenAIWithPrompt} 
            />

            {/* Render Cards Dynamically in Priority Order */}
            {prioritizedCards.map((card) => {
              switch (card.id) {
                case 'severe-alerts':
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <WeatherAlert alerts={weather.alerts} />
                    </div>
                  );

                case 'rain-warning':
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      {nowcast && <RainNowcastCard nowcast={nowcast} />}
                    </div>
                  );

                case 'hero-weather':
                  return (
                    <div key={card.id} className="transition-all duration-300 space-y-6">
                      <WeatherHero
                        weather={weather}
                        unit={preferences?.temperature_unit || 'celsius'}
                        windUnit={preferences?.wind_unit || 'kmh'}
                        language={language}
                        onRefresh={() => loadWeatherAndPersonalization(selectedLocation)}
                        onOpenSearch={() => setIsSearchOpen(true)}
                      />
                      {nowcast && !prioritizedCards.some(c => c.id === 'rain-warning') && (
                        <RainNowcastCard nowcast={nowcast} />
                      )}
                    </div>
                  );

                case 'fitness-card':
                  if (!preferences?.fitness_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <FitnessModule
                        weather={weather}
                        windows={fitnessWindows}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                case 'health-card':
                  if (!preferences?.health_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <AQICard airQuality={weather.airQuality} />
                    </div>
                  );

                case 'smart-scores':
                  if (!scores) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <ActivityScore scores={scores} />
                    </div>
                  );

                case 'hourly-timeline':
                  return (
                    <div key={card.id} className="transition-all duration-300 space-y-6">
                      {decision?.riskTimeline && (
                        <WeatherRiskTimeline
                          slots={decision.riskTimeline}
                          unit={preferences?.temperature_unit || 'celsius'}
                        />
                      )}
                      <HourlyForecast
                        items={weather.hourly}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                case 'commute-card':
                  if (!preferences?.commuter_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <CommuterModule weather={weather} />
                    </div>
                  );

                case 'travel-card':
                  if (!preferences?.travel_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <TravelModule unit={preferences?.temperature_unit || 'celsius'} />
                    </div>
                  );

                case 'family-card':
                  if (!preferences?.family_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <FamilyModule
                        weather={weather}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                case 'agriculture-card':
                  if (!preferences?.agriculture_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <AgricultureModule
                        weather={weather}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                case 'event-card':
                  if (!preferences?.event_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <EventModule unit={preferences?.temperature_unit || 'celsius'} />
                    </div>
                  );

                case 'beach-card':
                  if (!preferences?.beach_enabled) return null;
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <BeachModule
                        weather={weather}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                case 'daily-forecast':
                  return (
                    <div key={card.id} className="transition-all duration-300">
                      <ForecastCard
                        items={weather.daily}
                        unit={preferences?.temperature_unit || 'celsius'}
                      />
                    </div>
                  );

                default:
                  return null;
              }
            })}

            {/* Smart Automated Rules Advisory Strip */}
            {insights.length > 0 && (
              <SmartRecommendation insights={insights} />
            )}

            {/* Live Telemetry Chronological Intelligence Feed */}
            <IntelligenceFeed />

            {/* Interactive Weather Radar Map */}
            <WeatherMapComponent weather={weather} />
          </div>
        )}
      </main>
      </div>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-16 sm:bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenAIWithPrompt()}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-primary-600 to-cyan-500 hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-2xl transition-all shadow-glow-primary border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Ask Mausam AI</span>
        </button>
      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <MobileBottomNav unreadAlerts={weather?.alerts.length || 0} />

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          loadWeatherAndPersonalization(loc);
        }}
        onUseCurrentLocation={handleUseCurrentLocation}
      />

      {/* AI Assistant Chat Drawer */}
      {weather && (
        <AIChatDrawer
          isOpen={isAIOpen}
          onClose={() => {
            setIsAIOpen(false);
            setAiInitialPrompt(undefined);
          }}
          weather={weather}
          initialPrompt={aiInitialPrompt}
        />
      )}

      {/* Explainability Priority Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                Personalization Engine Transparency
              </h3>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mausam orders cards mathematically using the deterministic formula:
              <br />
              <code className="block p-2 rounded-xl bg-slate-900 border border-slate-800 text-primary-300 font-mono text-[11px] my-2">
                Priority = userInterestScore + weatherSeverityScore + timeRelevanceScore + locationRelevanceScore + activityRelevanceScore
              </code>
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {prioritizedCards.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>#{c.rank} {c.title}</span>
                    <span className="text-primary-400 font-mono">{c.priorityScore} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{c.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplanationModal(false)}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
