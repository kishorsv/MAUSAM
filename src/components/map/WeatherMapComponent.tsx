'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, MapPin, Navigation, Wind, Thermometer, CloudRain, 
  AlertTriangle, Eye, ZoomIn, ZoomOut, Compass, ShieldCheck, 
  Info, ExternalLink, RefreshCw 
} from 'lucide-react';
import { WeatherPayload, WeatherLocation } from '@/lib/weather/types';
import { useLocation } from '@/components/location/LocationContext';
import { formatTemperature, formatWindSpeed } from '@/lib/utils';

interface WeatherMapProps {
  weather: WeatherPayload;
  onSelectLocation?: (loc: WeatherLocation) => void;
}

// Google Maps Night/Dark Styling Schema
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#14253d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2563eb' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

export function WeatherMapComponent({ weather, onSelectLocation }: WeatherMapProps) {
  const { currentLocation, accuracy, isLowAccuracy } = useLocation();
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'aqi'>('temp');
  const [mapMode, setMapMode] = useState<'radar' | 'google'>('radar');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error' | 'auth_failed' | 'not_configured'
  >('idle');
  const [googleMapsErrorMsg, setGoogleMapsErrorMsg] = useState<string | null>(null);

  const googleMapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);

  const googleApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';

  // Check Google Maps availability and initialize if key is present
  useEffect(() => {
    if (!googleApiKey || googleApiKey.trim() === '') {
      setGoogleMapsStatus('not_configured');
      setMapMode('radar');
      return;
    }

    setGoogleMapsStatus('loading');

    // Register global Google Maps auth failure callback
    (window as any).gm_authFailure = () => {
      setGoogleMapsStatus('auth_failed');
      setGoogleMapsErrorMsg(
        'Google Maps API authorization failed. Check API key, billing status, and HTTP referrer restrictions.'
      );
      setMapMode('radar');
    };

    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsStatus('ready');
      setMapMode('google');
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsStatus('ready');
        setMapMode('google');
      };
      script.onerror = () => {
        setGoogleMapsStatus('error');
        setGoogleMapsErrorMsg('Failed to load Google Maps SDK script. Falling back to Weather Radar.');
        setMapMode('radar');
      };
      document.head.appendChild(script);
    }
  }, [googleApiKey]);

  // Mount Google Map when in 'google' mode and ready
  const weatherLat = weather.location.lat;
  const weatherLon = weather.location.lon;
  const weatherLocationName = weather.location.name;
  const currentTemp = weather.current.temperature;
  const currentCondition = weather.current.condition;

  useEffect(() => {
    if (mapMode !== 'google' || googleMapsStatus !== 'ready' || !googleMapRef.current) return;
    if (!(window as any).google || !(window as any).google.maps) return;

    const g = (window as any).google.maps;
    const centerLatLng = { lat: weatherLat, lng: weatherLon };

    if (!mapInstanceRef.current) {
      const map = new g.Map(googleMapRef.current, {
        center: centerLatLng,
        zoom: 11,
        styles: GOOGLE_MAPS_DARK_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      });

      mapInstanceRef.current = map;

      // Handle map click to select new real coordinates
      map.addListener('click', (e: any) => {
        const clickedLat = e.latLng.lat();
        const clickedLon = e.latLng.lng();
        onSelectLocation?.({
          name: `${clickedLat.toFixed(2)}°, ${clickedLon.toFixed(2)}°`,
          lat: clickedLat,
          lon: clickedLon,
          country: 'Selected Point'
        });
      });
    } else {
      mapInstanceRef.current.panTo(centerLatLng);
    }

    // Current Location Marker
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setMap(null);
    }

    const marker = new g.Marker({
      position: centerLatLng,
      map: mapInstanceRef.current,
      title: `📍 Current Location: ${weatherLocationName} (${currentTemp}°C, ${currentCondition})`,
      animation: g.Animation.DROP
    });
    markerInstanceRef.current = marker;

    // Accuracy Circle
    if (circleInstanceRef.current) {
      circleInstanceRef.current.setMap(null);
    }

    if (accuracy && accuracy < 20000) {
      const circle = new g.Circle({
        strokeColor: '#38bdf8',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        map: mapInstanceRef.current,
        center: centerLatLng,
        radius: accuracy
      });
      circleInstanceRef.current = circle;
    }
  }, [
    mapMode,
    googleMapsStatus,
    weatherLat,
    weatherLon,
    weatherLocationName,
    currentTemp,
    currentCondition,
    accuracy,
    onSelectLocation
  ]);

  // Key reference points for regional weather map display
  const keyCities = [
    {
      name: weather.location.name,
      lat: weather.location.lat,
      lon: weather.location.lon,
      temp: weather.current.temperature,
      rain: weather.hourly[0]?.precipitationProbability ?? 10,
      wind: weather.current.windSpeed,
      aqi: weather.airQuality?.aqi ?? 65,
      x: 50,
      y: 50,
      isCurrent: true
    },
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, temp: 24, rain: 20, wind: 14, aqi: 75, x: 42, y: 68 },
    { name: 'Mumbai', lat: 19.076, lon: 72.8777, temp: 31, rain: 65, wind: 24, aqi: 135, x: 28, y: 48 },
    { name: 'Delhi NCR', lat: 28.6139, lon: 77.209, temp: 28, rain: 15, wind: 10, aqi: 210, x: 38, y: 24 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707, temp: 33, rain: 30, wind: 18, aqi: 82, x: 52, y: 72 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, temp: 30, rain: 75, wind: 16, aqi: 142, x: 74, y: 44 },
    { name: 'Hyderabad', lat: 17.385, lon: 78.4867, temp: 29, rain: 25, wind: 15, aqi: 95, x: 45, y: 56 }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden space-y-4">
      {/* Top Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            <span>Regional Weather Radar & Geospatial Map</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized with latitude {weather.location.lat.toFixed(4)}°, longitude {weather.location.lon.toFixed(4)}°
          </p>
        </div>

        {/* View Mode Toggle & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setMapMode('radar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapMode === 'radar'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weather Radar
            </button>
            <button
              onClick={() => {
                if (googleMapsStatus === 'ready') {
                  setMapMode('google');
                } else {
                  alert(
                    googleMapsStatus === 'not_configured'
                      ? 'Google Maps API key is not configured in .env. Falling back to high-precision Weather Radar.'
                      : 'Google Maps API encountered an authorization or billing error. Using Weather Radar.'
                  );
                }
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapMode === 'google'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : googleMapsStatus === 'ready'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
              title={
                googleMapsStatus === 'ready'
                  ? 'Switch to interactive Google Map'
                  : 'Google Maps requires API key & billing'
              }
            >
              <span>Google Map</span>
              {googleMapsStatus === 'ready' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Layer Toggles (Radar Mode) */}
          {mapMode === 'radar' && (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                onClick={() => setActiveLayer('temp')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLayer === 'temp'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Temp</span>
              </button>
              <button
                onClick={() => setActiveLayer('rain')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLayer === 'rain'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
                <span>Rain</span>
              </button>
              <button
                onClick={() => setActiveLayer('wind')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLayer === 'wind'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-indigo-300" />
                <span>Wind</span>
              </button>
              <button
                onClick={() => setActiveLayer('aqi')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLayer === 'aqi'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>AQI</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Diagnostics Badge */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            📍 <strong>{weather.location.name}</strong> ({weather.location.lat.toFixed(2)}°N,{' '}
            {weather.location.lon.toFixed(2)}°E)
          </span>
          {accuracy && (
            <span className="text-slate-400 ml-1">
              • Accuracy: ±{Math.round(accuracy)}m {isLowAccuracy && '(Low)'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Map Provider:</span>
          <span className="font-semibold text-slate-200">
            {mapMode === 'google' && googleMapsStatus === 'ready'
              ? 'Google Maps JS SDK'
              : 'MAUSAM Radar Canvas Engine'}
          </span>
          {googleMapsStatus !== 'ready' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20">
              {googleMapsStatus === 'not_configured' ? 'Google Maps: Key not in .env' : 'Google Maps: Auth Notice'}
            </span>
          )}
        </div>
      </div>

      {/* Map Canvas / Google Map Container */}
      <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Google Map Element */}
        <div
          ref={googleMapRef}
          className={`w-full h-full ${mapMode === 'google' ? 'block' : 'hidden'}`}
        />

        {/* Radar Canvas Mode */}
        {mapMode === 'radar' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated Geographic Mesh Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Dynamic Heatmap Glow Layer */}
            {activeLayer === 'temp' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-rose-500/15 animate-pulse-slow" />
            )}
            {activeLayer === 'rain' && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent animate-pulse-slow" />
            )}
            {activeLayer === 'wind' && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent animate-pulse-slow" />
            )}
            {activeLayer === 'aqi' && (
              <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/15 via-amber-500/10 to-emerald-500/10 animate-pulse-slow" />
            )}

            {/* Map Markers */}
            <div
              className="relative w-full h-full transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {keyCities.map((city, idx) => {
                const isTarget = city.isCurrent;
                const badgeValue =
                  activeLayer === 'temp'
                    ? `${city.temp}°C`
                    : activeLayer === 'rain'
                    ? `${city.rain}% rain`
                    : activeLayer === 'wind'
                    ? `${city.wind} km/h`
                    : `AQI ${city.aqi}`;

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      onSelectLocation?.({
                        name: city.name,
                        lat: city.lat,
                        lon: city.lon,
                        country: 'India'
                      })
                    }
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
                    style={{ left: `${city.x}%`, top: `${city.y}%` }}
                    title={`Select ${city.name}`}
                  >
                    {/* Marker Pin */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-xl backdrop-blur-md transition-all ${
                        isTarget
                          ? 'bg-primary-600/90 text-white border-primary-400 ring-2 ring-primary-500/40 shadow-glow-primary scale-105'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeLayer === 'temp'
                            ? city.temp > 30
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                            : activeLayer === 'rain'
                            ? city.rain > 50
                              ? 'bg-cyan-400 animate-pulse'
                              : 'bg-slate-400'
                            : activeLayer === 'wind'
                            ? 'bg-indigo-400'
                            : city.aqi > 150
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="truncate">{city.name}</span>
                      <span className="text-[11px] font-mono text-slate-300 font-normal border-l border-slate-700 pl-1.5 ml-0.5">
                        {badgeValue}
                      </span>
                    </div>

                    {isTarget && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-primary-300 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-full border border-primary-500/30">
                        📍 Current Location
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Radar Legend Overlay */}
            <div className="absolute bottom-4 left-4 p-3 rounded-2xl glass-panel border border-slate-800 text-[11px] text-slate-300 space-y-1 z-30">
              <div className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                Radar Legend ({activeLayer.toUpperCase()})
              </div>
              {activeLayer === 'temp' && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> &lt;20°C Cool
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" /> 20-30°C Mild
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> &gt;30°C Warm
                </div>
              )}
              {activeLayer === 'rain' && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> &lt;30% Dry
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2" /> 30-70% Showers
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-2" /> &gt;70% Downpour
                </div>
              )}
              {activeLayer === 'aqi' && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 0-50 Good
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" /> 51-100 Mod
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> &gt;150 Unhealthy
                </div>
              )}
              {activeLayer === 'wind' && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-300" /> &lt;20 km/h Breeze
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2" /> &gt;35 km/h Strong
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 z-30">
              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.6))}
                className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 shadow-md"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
                className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 shadow-md"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
