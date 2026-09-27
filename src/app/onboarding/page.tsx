'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Heart, Activity, Waves, Plane, Users, 
  Sprout, Car, PartyPopper, MapPin, Bell, Globe, ArrowRight, Check, Loader2 
} from 'lucide-react';
import { Language } from '@/lib/i18n/translations';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Persona selections
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['fitness', 'health']);
  
  // Location
  const [city, setCity] = useState('Bengaluru');
  const [lat, setLat] = useState(12.9716);
  const [lon, setLon] = useState(77.5946);

  // Settings
  const [language, setLanguage] = useState<Language>('en');
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');
  const [notifications, setNotifications] = useState(true);

  const personas = [
    { id: 'health', title: 'Health & Allergy', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Air quality (AQI), PM2.5 particulates, pollen & respiratory alerts' },
    { id: 'fitness', title: 'Fitness & Outdoor', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Optimal running hours, outdoor workout scores & weather shifts' },
    { id: 'beach', title: 'Beach & Surf', icon: Waves, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: 'Coastal onshore winds, tide swells, and solar radiation index' },
    { id: 'travel', title: 'Travel Intelligence', icon: Plane, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', desc: 'Saved destination forecasts, luggage checklists & transit rain' },
    { id: 'family', title: 'Family & Parents', icon: Users, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', desc: 'School departure timing, playground comfort & sudden storm alerts' },
    { id: 'agriculture', title: 'Agriculture & Soil', icon: Sprout, color: 'text-lime-400 bg-lime-500/10 border-lime-500/20', desc: 'Frost warnings, rainfall volume & evapotranspiration index' },
    { id: 'commuter', title: 'Daily Commuter', icon: Car, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Road slickness, optical visibility in fog & route traffic alerts' },
    { id: 'event', title: 'Event Planner', icon: PartyPopper, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Outdoor comfort index, rain canopy risk & hourly party windows' }
  ];

  const togglePersona = (id: string) => {
    setSelectedPersonas(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save preferences to database
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          health_enabled: selectedPersonas.includes('health'),
          fitness_enabled: selectedPersonas.includes('fitness'),
          travel_enabled: selectedPersonas.includes('travel'),
          family_enabled: selectedPersonas.includes('family'),
          agriculture_enabled: selectedPersonas.includes('agriculture'),
          commuter_enabled: selectedPersonas.includes('commuter'),
          event_enabled: selectedPersonas.includes('event'),
          beach_enabled: selectedPersonas.includes('beach'),
          language,
          temperature_unit: unit,
          wind_unit: windUnit,
          notification_enabled: notifications
        })
      });

      // Save default location if changed
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: city,
          latitude: lat,
          longitude: lon,
          location_type: 'home',
          is_pinned: true
        })
      });

      // Redirect to personalized dashboard
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-primary-500 shadow-glow-primary' : s < step ? 'w-2 bg-primary-700' : 'w-2 bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 p-[1px] mx-auto shadow-glow-primary">
              <div className="w-full h-full rounded-[23px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to Mausam
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Traditional weather apps show the same static forecast to everyone. Mausam learns what matters to your lifestyle and dynamically reorganizes itself around you.
            </p>
            <div className="pt-6">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all shadow-glow-primary inline-flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Lifestyle Personas */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">What matters to you most?</h2>
              <p className="text-xs text-slate-400 mt-1">Select all lifestyles you want your homepage to track</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersonas.includes(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-primary-950/40 border-primary-500 shadow-glow-primary/40'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${p.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{p.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedPersonas.length === 0}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-glow-primary inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Location Search */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Primary Location</h2>
              <p className="text-xs text-slate-400 mt-1">Set your default station for hyper-local microclimate feeds</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">City or District</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city (e.g. Bengaluru, Mumbai, London)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        setLat(pos.coords.latitude);
                        setLon(pos.coords.longitude);
                        setCity("Current Device GPS");
                      },
                      () => {}
                    );
                  }
                }}
                className="w-full p-3 rounded-2xl bg-primary-600/10 hover:bg-primary-600/20 border border-primary-500/20 text-primary-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Auto-detect my current coordinates
              </button>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">Back</button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Notifications */}
        {step === 4 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Smart Alerts & Notifications</h2>
              <p className="text-xs text-slate-400 mt-1">Receive proactive alerts for sudden downpours and unhealthy AQI</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-200">Enable Smart Severe Alerts</div>
                  <div className="text-[11px] text-slate-400">Get notified when rain, gale wind, or hazardous AQI strikes</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-500 focus:ring-0"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(3)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">Back</button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Language & Units */}
        {step === 5 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Units & Localization</h2>
              <p className="text-xs text-slate-400 mt-1">Choose your measurement units and language</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'kn', label: 'ಕನ್ನಡ (KN)' },
                    { id: 'hi', label: 'हिंदी (HI)' }
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id as Language)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        language === l.id ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Temperature Unit</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnit('celsius')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      unit === 'celsius' ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('fahrenheit')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      unit === 'fahrenheit' ? 'bg-primary-600 text-white border-primary-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(4)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">Back</button>
              <button
                onClick={() => setStep(6)}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Generate Personalized Dashboard */}
        {step === 6 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Ready to Generate Your Dashboard
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Mausam has configured your {selectedPersonas.length} personalized lifestyle models for {city}. Your homepage cards will now dynamically reorganize based on live weather severity and time relevance.
            </p>
            <div className="pt-4">
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all shadow-glow-primary inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configuring Intelligence...</span>
                  </>
                ) : (
                  <>
                    <span>Enter My Mausam</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
