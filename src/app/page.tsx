'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { WeatherHero } from '@/components/weather/WeatherHero';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { AQICard } from '@/components/weather/AQICard';
import { WeatherAlert } from '@/components/weather/WeatherAlert';
import { ActivityScore } from '@/components/weather/ActivityScore';
import { SmartRecommendation } from '@/components/weather/SmartRecommendation';
import { useLocation } from '@/components/location/LocationContext';
import { useWeather } from '@/components/weather/WeatherContext';
import { LocationPermissionBanner } from '@/components/location/LocationPermissionBanner';
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
import { formatTimeAgo } from '@/lib/utils';

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
import { FeatureDock } from '@/components/features/FeatureDock';
import { ExploreMausamGrid } from '@/components/features/ExploreMausamGrid';
import { ActiveFeatureWorldCard } from '@/components/features/ActiveFeatureWorldCard';
import { VoiceAssistantBar } from '@/components/ai/VoiceAssistantBar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { FeatureWorldId } from '@/lib/theme/scene-registry';
import { weatherSceneController } from '@/lib/theme/weather-scene-controller';

// Atmospheric Living Background & Theme Engine
import { useTheme } from '@/components/theme/ThemeContext';

// Icons
import { 
  Sparkles, SlidersHorizontal, Info, RefreshCw, 
  Activity, Heart, Waves, Plane, Users, Sprout, Car, PartyPopper, Check
} from 'lucide-react';

export default function HomePage() {
  const { visualState, setWeatherForTheme, openThemeModal } = useTheme();
  const { currentLocation, requestDeviceLocation, setManualLocation } = useLocation();
  const { 
    weather, 
    status, 
    error: weatherError, 
    isRefreshing, 
    isOffline: isWeatherOffline, 
    lastUpdated, 
    refreshWeather, 
    retry 
  } = useWeather();
  
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [activeFeatureWorld, setActiveFeatureWorld] = useState<FeatureWorldId | null>(null);

  // Unified selectedLocation object derived directly from currentLocation
  const selectedLocation: WeatherLocation = useMemo(() => ({
    name: currentLocation.city,
    region: currentLocation.locality || currentLocation.state,
    country: currentLocation.country || '',
    lat: currentLocation.latitude,
    lon: currentLocation.longitude,
    timezone: currentLocation.timezone
  }), [currentLocation]);

  // Global Command Menu Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAIWithPrompt = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIOpen(true);
  };

  const handleSelectFeatureWorld = (featureId: FeatureWorldId) => {
    if (activeFeatureWorld === featureId) {
      setActiveFeatureWorld(null);
      weatherSceneController.selectFeature(null);
    } else {
      setActiveFeatureWorld(featureId);
      weatherSceneController.selectFeature(featureId);
    }
  };

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

  // Synchronize Personalization & AI insights whenever real weather payload arrives
  useEffect(() => {
    if (weather) {
      const immediateCards = personalizationEngine.calculateCardPriorities(weather, preferences);
      const immediateWindows = personalizationEngine.calculateFitnessWindows(weather.hourly, weather.airQuality?.aqi);
      setPrioritizedCards(immediateCards);
      setFitnessWindows(immediateWindows);

      // Asynchronous Background Personalization Synchronization
      fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather, preferences })
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
    }
  }, [weather, preferences]);

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
      <Sidebar 
        onOpenAI={() => handleOpenAIWithPrompt()}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-32 sm:pb-28">
        {/* Floating Top Header Bar */}
        <Header
          currentLocation={selectedLocation}
          isLive={status === 'READY'}
          cached={status === 'STALE' || status === 'OFFLINE' || Boolean(weather?.cached)}
          language={language}
          onLanguageChange={handleLanguageChange}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAI={() => handleOpenAIWithPrompt()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          unreadCount={unreadNotifications}
          userName="Priya"
          isOffline={isWeatherOffline}
        />

        {/* Main Content Dashboard */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-8 sm:space-y-10">
          {/* Real-time Location Permission Banner */}
          <LocationPermissionBanner onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Stale / Offline Telemetry Indicator */}
          {status === 'OFFLINE' && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>You are offline. Showing cached weather ({lastUpdated ? formatTimeAgo(lastUpdated) : 'saved telemetry'}).</span>
            </div>
          )}

          {status === 'STALE' && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Showing recently cached weather ({lastUpdated ? formatTimeAgo(lastUpdated) : 'cached'}).</span>
              </div>
              <button 
                onClick={refreshWeather} 
                disabled={isRefreshing}
                className="text-[11px] font-bold underline hover:text-white disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          )}

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
              setManualLocation({
                latitude: loc.latitude,
                longitude: loc.longitude,
                city: loc.name,
                locality: loc.location_type,
                country: 'Saved Station',
                source: 'saved'
              });
            }}
          />
        )}

        {/* Loading Skeleton */}
        {status === 'LOADING' && !weather && <DashboardSkeleton />}

        {/* Error State */}
        {status === 'ERROR' && !weather && weatherError && (
          <ErrorState
            title="Live weather data temporarily unavailable."
            message={weatherError.message}
            onRetry={retry}
          />
        )}

        {/* Populated Intelligent Dynamic Feed */}
        {weather && (
          <div className="space-y-6">
            {/* Prominent Cinematic MAUSAM AI Weather Intelligence Panel */}
            <AIAssistantHeroCard 
              weather={weather} 
              onOpenAI={handleOpenAIWithPrompt} 
            />

            {/* Active Feature World Interactive Intelligence Console */}
            {activeFeatureWorld && (
              <ActiveFeatureWorldCard
                selectedFeature={activeFeatureWorld}
                weather={weather}
                onClose={() => handleSelectFeatureWorld(activeFeatureWorld)}
                onAskAI={handleOpenAIWithPrompt}
              />
            )}

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
                        isRefreshing={isRefreshing}
                        onRefresh={refreshWeather}
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

            {/* Explore MAUSAM & Specialized Observation Centers */}
            <ExploreMausamGrid
              activeFeatureWorld={activeFeatureWorld}
              onSelectFeatureWorld={handleSelectFeatureWorld}
            />

            {/* Interactive Weather Radar Map */}
            <WeatherMapComponent 
              weather={weather} 
              onSelectLocation={(loc) => {
                setManualLocation({
                  latitude: loc.lat,
                  longitude: loc.lon,
                  city: loc.name,
                  country: loc.country || '',
                  source: 'search'
                });
              }}
            />

            {/* Interactive Feature Worlds Selector Dock */}
            <FeatureDock
              selectedFeature={activeFeatureWorld}
              onSelectFeature={handleSelectFeatureWorld}
            />
          </div>
        )}
      </main>
      </div>

      {/* Persistent Floating Multi-Modal Voice & AI Assistant */}
      <VoiceAssistantBar
        weather={weather}
        selectedFeature={activeFeatureWorld}
        isOpenExternal={isVoiceOpen}
        onCloseExternal={() => setIsVoiceOpen(false)}
        onOpenFullAssistant={handleOpenAIWithPrompt}
      />

      {/* Global Keyboard-Accessible Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAI={() => {
          setIsCommandPaletteOpen(false);
          handleOpenAIWithPrompt();
        }}
        onOpenVoice={() => {
          setIsCommandPaletteOpen(false);
          setIsVoiceOpen(true);
        }}
        onOpenTheme={() => {
          setIsCommandPaletteOpen(false);
          openThemeModal();
        }}
        onSelectFeature={(featId) => {
          handleSelectFeatureWorld(featId);
        }}
        onLanguageChange={handleLanguageChange}
      />

      {/* Bottom Navigation for Mobile Devices */}
      <MobileBottomNav unreadAlerts={weather?.alerts.length || 0} />

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => {
          setManualLocation({
            latitude: loc.lat,
            longitude: loc.lon,
            city: loc.name,
            locality: loc.region,
            state: loc.region,
            country: loc.country,
            source: 'search'
          });
        }}
        onUseCurrentLocation={() => requestDeviceLocation()}
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
