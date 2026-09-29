'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Layers, MapPin, Navigation, Wind, Thermometer, CloudRain, 
  AlertTriangle, Eye, ZoomIn, ZoomOut, Compass, ShieldCheck, 
  Info, ExternalLink, RefreshCw, Orbit, Maximize2, Minimize2,
  Check, Globe, Key, AlertCircle, Sparkles, ChevronDown, ChevronUp,
  Search, Bookmark, Plus, Trash2, Home, Briefcase, GraduationCap, 
  Dumbbell, Sprout, Plane, Calendar, X
} from 'lucide-react';
import { WeatherPayload, WeatherLocation } from '@/lib/weather/types';
import { SavedLocation } from '@/lib/db/types';
import { useLocation } from '@/components/location/LocationContext';
import { 
  GoogleMapType, 
  GoogleMapsDiagnosticCode, 
  GoogleMapsDiagnosticInfo, 
  GoogleMapsLoaderStatus,
  loadGoogleMapsScript,
  getActiveGoogleMapsApiKey,
  maskGoogleMapsApiKey,
  resolveMapTypeId,
  getGoogleMapsDiagnostics,
  subscribeToGoogleMaps,
  reportGoogleMapsError
} from '@/lib/maps/google-maps-loader';

export interface GoogleWeatherMapProps {
  weather: WeatherPayload;
  onSelectLocation?: (loc: WeatherLocation) => void;
  initialMapType?: GoogleMapType;
  externalMapType?: GoogleMapType;
  showRadarFallbackToggle?: boolean;
  className?: string;
  routeWaypoints?: Array<{ name: string; lat: number; lon: number }>;
}

// Google Maps Night/Dark Styling Schema for Roadmap
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

const KEY_CITIES = [
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, temp: 24, condition: 'Partly Cloudy', rain: 20 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, temp: 31, condition: 'Showers', rain: 65 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.209, temp: 28, condition: 'Haze', rain: 15 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, temp: 33, condition: 'Sunny', rain: 30 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, temp: 30, condition: 'Thunderstorm', rain: 75 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867, temp: 29, condition: 'Mild Rain', rain: 25 },
  { name: 'Mysuru', lat: 12.2958, lon: 76.6394, temp: 25, condition: 'Clear', rain: 10 },
  { name: 'Coorg', lat: 12.3375, lon: 75.8069, temp: 21, condition: 'Mist', rain: 45 }
];

export function GoogleWeatherMap({ 
  weather, 
  onSelectLocation,
  initialMapType = 'roadmap',
  externalMapType,
  showRadarFallbackToggle = true,
  className = '',
  routeWaypoints
}: GoogleWeatherMapProps) {
  const { currentLocation, requestDeviceLocation, isDetecting, accuracy } = useLocation();

  // Map Mode & State
  const [mapMode, setMapMode] = useState<'google' | 'radar'>('google');
  const [selectedMapType, setSelectedMapType] = useState<GoogleMapType>(initialMapType);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSwitchingType, setIsSwitchingType] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'aqi'>('temp');
  const [showMultiCity, setShowMultiCity] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Saved Locations State
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveLocationType, setSaveLocationType] = useState<SavedLocation['location_type']>('home');
  const [saveLocationName, setSaveLocationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Diagnostics & Status
  const [loaderStatus, setLoaderStatus] = useState<GoogleMapsLoaderStatus>('idle');
  const [diagnostic, setDiagnostic] = useState<GoogleMapsDiagnosticInfo>(
    getGoogleMapsDiagnostics(false, initialMapType)
  );
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyApplySuccess, setKeyApplySuccess] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const googleMapDivRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const cityMarkersRef = useRef<any[]>([]);
  const savedMarkersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  const weatherLat = weather.location.lat;
  const weatherLon = weather.location.lon;
  const weatherLocationName = weather.location.name;
  const currentTemp = weather.current.temperature;
  const currentCondition = weather.current.condition;

  // Restore user map type preference on mount (or use initialMapType)
  useEffect(() => {
    try {
      const savedType = localStorage.getItem('mausam-map-type') as GoogleMapType | null;
      if (savedType && ['roadmap', 'satellite', 'hybrid', 'terrain'].includes(savedType)) {
        setSelectedMapType(savedType);
      } else if (initialMapType) {
        setSelectedMapType(initialMapType);
      }
    } catch {}
  }, [initialMapType]);

  // Load Saved Locations from Database API
  const fetchSavedLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.locations)) {
          setSavedLocations(data.locations);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSavedLocations();
  }, [fetchSavedLocations]);

  // Subscribe to Google Maps singleton loader
  useEffect(() => {
    const unsubscribe = subscribeToGoogleMaps((status, diag) => {
      setLoaderStatus(status);
      setDiagnostic(diag);
      if (status === 'ready') {
        setMapMode('google');
      }
    });

    loadGoogleMapsScript().catch(() => {});

    return () => unsubscribe();
  }, []);

  // Core: Switch Map Type on Existing Map Instance
  const handleMapTypeChange = useCallback((targetType: GoogleMapType) => {
    setSelectedMapType(targetType);

    try {
      localStorage.setItem('mausam-map-type', targetType);
    } catch {}

    setMapMode('google');

    if (!mapInstanceRef.current) {
      reportGoogleMapsError('GOOGLE_MAP_NOT_READY', 'Map container is still initializing');
      return;
    }

    try {
      setIsSwitchingType(true);
      const g = (window as any).google?.maps;
      if (!g) return;

      const typeId = resolveMapTypeId(targetType, g);

      // CRITICAL: Call setMapTypeId on the existing map instance without reload!
      mapInstanceRef.current.setMapTypeId(typeId);

      // Dark style on roadmap; natural crystal clarity on satellite/hybrid
      if (targetType === 'roadmap') {
        mapInstanceRef.current.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
      } else {
        mapInstanceRef.current.setOptions({ styles: null });
      }

      setDiagnostic(getGoogleMapsDiagnostics(true, targetType));
      setTimeout(() => setIsSwitchingType(false), 350);
    } catch (err: any) {
      setIsSwitchingType(false);
      reportGoogleMapsError('SATELLITE_MODE_ERROR', err?.message || 'Error executing setMapTypeId');
    }
  }, []);

  // Handle external map type changes (e.g. from Satellite page or FeatureDock)
  useEffect(() => {
    if (externalMapType && ['roadmap', 'satellite', 'hybrid', 'terrain'].includes(externalMapType)) {
      handleMapTypeChange(externalMapType);
    }
  }, [externalMapType, handleMapTypeChange]);

  // Global event listener for direct map type switching from feature worlds & satellite docks
  useEffect(() => {
    const handleGlobalSetMapType = (e: any) => {
      const type = e?.detail;
      if (type && ['roadmap', 'satellite', 'hybrid', 'terrain'].includes(type)) {
        handleMapTypeChange(type);
      }
    };
    window.addEventListener('mausam:set-map-type', handleGlobalSetMapType);
    return () => window.removeEventListener('mausam:set-map-type', handleGlobalSetMapType);
  }, [handleMapTypeChange]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize Google Map (once) when in 'google' mode and ready
  useEffect(() => {
    if (mapMode !== 'google' || loaderStatus !== 'ready' || !googleMapDivRef.current) return;
    if (!(window as any).google || !(window as any).google.maps) return;

    const g = (window as any).google.maps;
    const centerLatLng = { lat: weatherLat, lng: weatherLon };

    if (!mapInstanceRef.current) {
      const initialTypeId = resolveMapTypeId(selectedMapType, g);

      const map = new g.Map(googleMapDivRef.current, {
        center: centerLatLng,
        zoom: 11,
        mapTypeId: initialTypeId,
        styles: selectedMapType === 'roadmap' ? GOOGLE_MAPS_DARK_STYLE : null,
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy'
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
      setDiagnostic(getGoogleMapsDiagnostics(true, selectedMapType));

      // Click on map to select new weather point
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

      // Initialize Places Autocomplete if search input ref exists and places library is loaded
      if (searchInputRef.current && g.places && !autocompleteRef.current) {
        try {
          const autocomplete = new g.places.Autocomplete(searchInputRef.current, {
            types: ['geocode', 'establishment'],
            fields: ['name', 'geometry', 'formatted_address']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const newLat = place.geometry.location.lat();
              const newLng = place.geometry.location.lng();
              const placeName = place.name || place.formatted_address || 'Searched Location';

              map.panTo({ lat: newLat, lng: newLng });
              map.setZoom(13);

              onSelectLocation?.({
                name: placeName,
                lat: newLat,
                lon: newLng,
                country: 'India'
              });
              setSearchQuery('');
            }
          });

          autocompleteRef.current = autocomplete;
        } catch {}
      }
    } else {
      // Existing map instance: verify mapTypeId is synchronized
      const currentTypeId = resolveMapTypeId(selectedMapType, g);
      if (mapInstanceRef.current.getMapTypeId() !== currentTypeId) {
        mapInstanceRef.current.setMapTypeId(currentTypeId);
        if (selectedMapType === 'roadmap') {
          mapInstanceRef.current.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
        } else {
          mapInstanceRef.current.setOptions({ styles: null });
        }
      }
    }

    // Refresh Current Location Pin Marker
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setMap(null);
    }

    const marker = new g.Marker({
      position: centerLatLng,
      map: mapInstanceRef.current,
      title: `📍 Current: ${weatherLocationName} (${currentTemp}°C, ${currentCondition})`,
      animation: g.Animation.DROP
    });
    markerInstanceRef.current = marker;

    // Refresh Accuracy Circle
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
    loaderStatus,
    weatherLat,
    weatherLon,
    weatherLocationName,
    currentTemp,
    currentCondition,
    accuracy,
    onSelectLocation,
    selectedMapType
  ]);

  // Multi-City Weather Markers on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const g = (window as any).google.maps;

    // Clear old city markers
    cityMarkersRef.current.forEach(m => m.setMap(null));
    cityMarkersRef.current = [];

    if (!showMultiCity) return;

    KEY_CITIES.forEach(city => {
      if (Math.abs(city.lat - weatherLat) < 0.05 && Math.abs(city.lon - weatherLon) < 0.05) return;

      const m = new g.Marker({
        position: { lat: city.lat, lng: city.lon },
        map: mapInstanceRef.current,
        title: `${city.name}: ${city.temp}°C, ${city.condition}`
      });

      const infoWindow = new g.InfoWindow({
        content: `
          <div style="color: #0f172a; font-family: system-ui; padding: 4px; min-width: 120px;">
            <div style="font-weight: 800; font-size: 13px;">${city.name}</div>
            <div style="font-size: 16px; font-weight: bold; color: #0284c7;">${city.temp}°C • ${city.condition}</div>
            <div style="font-size: 11px; color: #64748b;">Rain: ${city.rain}%</div>
          </div>
        `
      });

      m.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, m);
        onSelectLocation?.({
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          country: 'India'
        });
      });

      cityMarkersRef.current.push(m);
    });
  }, [showMultiCity, weatherLat, weatherLon, onSelectLocation]);

  // Saved Location Markers on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const g = (window as any).google.maps;

    savedMarkersRef.current.forEach(m => m.setMap(null));
    savedMarkersRef.current = [];

    savedLocations.forEach(loc => {
      const m = new g.Marker({
        position: { lat: loc.latitude, lng: loc.longitude },
        map: mapInstanceRef.current,
        title: `★ Saved: ${loc.name} (${loc.location_type})`
      });

      m.addListener('click', () => {
        mapInstanceRef.current.panTo({ lat: loc.latitude, lng: loc.longitude });
        mapInstanceRef.current.setZoom(13);
        onSelectLocation?.({
          name: loc.name,
          lat: loc.latitude,
          lon: loc.longitude,
          country: 'India'
        });
      });

      savedMarkersRef.current.push(m);
    });
  }, [savedLocations, onSelectLocation]);

  // Route Waypoints Directions Service Integration (Section 18)
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps || !routeWaypoints || routeWaypoints.length < 2) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      return;
    }

    const g = (window as any).google.maps;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new g.DirectionsRenderer({
        map: mapInstanceRef.current,
        polylineOptions: {
          strokeColor: '#38bdf8',
          strokeWeight: 5,
          strokeOpacity: 0.85
        },
        suppressMarkers: false
      });
    }

    const directionsService = new g.DirectionsService();
    const origin = { lat: routeWaypoints[0].lat, lng: routeWaypoints[0].lon };
    const destination = { lat: routeWaypoints[routeWaypoints.length - 1].lat, lng: routeWaypoints[routeWaypoints.length - 1].lon };
    const waypoints = routeWaypoints.slice(1, -1).map(wp => ({
      location: { lat: wp.lat, lng: wp.lon },
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: g.TravelMode.DRIVING
      },
      (result: any, status: any) => {
        if (status === g.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);
        }
      }
    );
  }, [routeWaypoints]);

  // Fallback Internal Location Search
  const handleInternalSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = result.latitude || result.lat;
    const lon = result.longitude || result.lon;
    const name = result.name || result.city || searchQuery;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng: lon });
      mapInstanceRef.current.setZoom(13);
    }

    onSelectLocation?.({
      name,
      lat,
      lon,
      country: result.country || 'India'
    });

    setSearchQuery('');
    setSearchOpen(false);
  };

  // "Use my location" button handler (Section 10)
  const handleUseMyLocation = async () => {
    const loc = await requestDeviceLocation();
    if (loc && loc.latitude && loc.longitude && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({
        lat: loc.latitude,
        lng: loc.longitude
      });
      mapInstanceRef.current.setZoom(13);
      onSelectLocation?.({
        name: loc.city,
        lat: loc.latitude,
        lon: loc.longitude,
        country: loc.country || 'India'
      });
    }
  };

  // Save current location to Database API (Section 13)
  const handleSaveCurrentLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = saveLocationName.trim() || weatherLocationName;
    setIsSaving(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          label: saveLocationType,
          latitude: weatherLat,
          longitude: weatherLon,
          location_type: saveLocationType,
          is_pinned: false
        })
      });

      if (res.ok) {
        setIsSaveModalOpen(false);
        setSaveLocationName('');
        fetchSavedLocations();
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  // Floating controls
  const handleZoomIn = () => {
    if (mapMode === 'google' && mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 11) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapMode === 'google' && mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(Math.max((mapInstanceRef.current.getZoom() || 11) - 1, 2));
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleApplyCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyInput || customKeyInput.trim() === '') return;
    try {
      sessionStorage.setItem('mausam-google-maps-key-override', customKeyInput.trim());
      setKeyApplySuccess(true);
      loadGoogleMapsScript(customKeyInput.trim())
        .then(() => setMapMode('google'))
        .catch(() => {});
      setTimeout(() => setKeyApplySuccess(false), 3000);
    } catch {}
  };

  return (
    <div 
      id="mausam-map-container"
      ref={containerRef}
      className={`glass-panel rounded-3xl p-4 sm:p-6 border border-white/5 relative overflow-hidden space-y-4 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6' : ''
      } ${className}`}
    >
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Coordinates */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>{selectedMapType === 'satellite' ? 'Real Google Satellite Map' : 'Interactive Google Weather Map'}</span>
            </h3>
            {selectedMapType === 'satellite' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Orbit className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                SATELLITE ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized with {weather.location.name} ({weather.location.lat.toFixed(4)}°N, {weather.location.lon.toFixed(4)}°E)
          </p>
        </div>

        {/* Search Bar + Autocomplete */}
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleInternalSearch(e.target.value)}
              placeholder="Search city, area or place..."
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-400 backdrop-blur-md transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Internal search dropdown fallback */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-40 max-h-56 overflow-y-auto space-y-1 backdrop-blur-xl">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">{res.name || res.city}</span>
                  <span className="text-[10px] text-slate-400">{res.country || ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Controls: [ Map ] [ Satellite ] [ Hybrid ] [ Terrain ] — ALWAYS ACCESSIBLE */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <button
              onClick={() => handleMapTypeChange('roadmap')}
              title={!isMapReady ? 'Map is still loading...' : 'Switch to standard roadmap'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMapType === 'roadmap'
                  ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Map</span>
              {selectedMapType === 'roadmap' && (
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-white/20 text-white ml-1">
                  ACTIVE
                </span>
              )}
            </button>

            <button
              onClick={() => handleMapTypeChange('satellite')}
              title={!isMapReady ? 'Map is still loading...' : 'Switch to real Google Satellite imagery'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMapType === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-glow-primary ring-1 ring-indigo-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Satellite</span>
              {selectedMapType === 'satellite' ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 ml-1 animate-pulse">
                  ACTIVE
                </span>
              ) : null}
            </button>

            <button
              onClick={() => handleMapTypeChange('hybrid')}
              title={!isMapReady ? 'Map is still loading...' : 'Switch to Satellite with labels'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMapType === 'hybrid'
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Hybrid</span>
              {selectedMapType === 'hybrid' && (
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-white/20 text-white ml-1">
                  ACTIVE
                </span>
              )}
            </button>

            <button
              onClick={() => handleMapTypeChange('terrain')}
              title={!isMapReady ? 'Map is still loading...' : 'Switch to topographic terrain'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMapType === 'terrain'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Terrain</span>
              {selectedMapType === 'terrain' && (
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-white/20 text-white ml-1">
                  ACTIVE
                </span>
              )}
            </button>
          </div>

          {/* Toggle Multi-city & Save location buttons */}
          <button
            onClick={() => setShowMultiCity(!showMultiCity)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showMultiCity
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle multi-city weather pins"
          >
            Multi-City
          </button>

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white transition-all"
            title="Save current location"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Fallback to Weather Radar Canvas Toggle */}
          {showRadarFallbackToggle && (
            <button
              onClick={() => setMapMode(mapMode === 'radar' ? 'google' : 'radar')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                mapMode === 'radar'
                  ? 'bg-cyan-600/90 text-white border-cyan-400 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Doppler Weather Radar Canvas"
            >
              {mapMode === 'radar' ? 'Radar Active' : 'Radar Canvas'}
            </button>
          )}

          {/* Diagnostics Drawer Toggle */}
          <button
            onClick={() => setIsDiagnosticsOpen(!isDiagnosticsOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium border bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Developer Map Diagnostics"
          >
            <span>⚡ Diagnostics</span>
            {isDiagnosticsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Saved Locations Quick-Select Pills Bar */}
      {savedLocations.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">Saved Places:</span>
          {savedLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.panTo({ lat: loc.latitude, lng: loc.longitude });
                  mapInstanceRef.current.setZoom(13);
                }
                onSelectLocation?.({
                  name: loc.name,
                  lat: loc.latitude,
                  lon: loc.longitude,
                  country: 'India'
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-primary-400/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all whitespace-nowrap"
            >
              {loc.location_type === 'home' && <Home className="w-3 h-3 text-cyan-400" />}
              {loc.location_type === 'office' && <Briefcase className="w-3 h-3 text-amber-400" />}
              {loc.location_type === 'school' && <GraduationCap className="w-3 h-3 text-indigo-400" />}
              {loc.location_type === 'gym' && <Dumbbell className="w-3 h-3 text-orange-400" />}
              {loc.location_type === 'farm' && <Sprout className="w-3 h-3 text-emerald-400" />}
              {loc.location_type === 'custom' && <MapPin className="w-3 h-3 text-rose-400" />}
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Developer Diagnostics Drawer */}
      {isDiagnosticsOpen && (
        <div className="p-4 rounded-2xl bg-slate-950/95 border border-indigo-500/25 space-y-3 animate-in fade-in duration-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                GOOGLE MAPS PLATFORM TELEMETRY & DIAGNOSTICS
              </span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                loaderStatus === 'ready' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : loaderStatus === 'loading'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                STATUS: {loaderStatus.toUpperCase()}
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-400">
              Code: <strong className="text-cyan-300">{diagnostic.code}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block">Active Mode</span>
              <span className="text-white font-semibold capitalize">{selectedMapType}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block">Map Instance</span>
              <span className={isMapReady ? 'text-emerald-400' : 'text-amber-400'}>
                {isMapReady ? 'Ready & Attached' : 'Pending Init'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block">API Key State</span>
              <span className="text-slate-200">{diagnostic.maskedKey}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block">GPS Coordinates</span>
              <span className="text-cyan-300">{weatherLat.toFixed(4)}°, {weatherLon.toFixed(4)}°</span>
            </div>
          </div>

          {/* Diagnostic resolution hint */}
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong>Resolution Hint:</strong> {diagnostic.resolutionHint}
            </div>
          </div>

          {/* Developer Quick Key Input */}
          <form onSubmit={handleApplyCustomKey} className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Key className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Paste Google Maps API key to test live..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              Apply & Reload SDK
            </button>
            {keyApplySuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> Key Saved
              </span>
            )}
          </form>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className={`relative w-full ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[400px] sm:h-[500px]'} rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center`}>
        {/* Google Map Target Div */}
        <div
          ref={googleMapDivRef}
          className={`w-full h-full ${mapMode === 'google' ? 'block' : 'hidden'}`}
        />

        {/* Subtle Map Type Transition Indicator */}
        {isSwitchingType && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 backdrop-blur-md shadow-lg text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Switching to {selectedMapType.toUpperCase()}...</span>
          </div>
        )}

        {/* Map Loading State Notice if container pending */}
        {mapMode === 'google' && !isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-2">
            <Orbit className="w-8 h-8 text-indigo-400 animate-spin-slow" />
            <p className="text-xs text-slate-300 font-mono">Initializing Google Maps Platform...</p>
          </div>
        )}

        {/* Floating Glass Controls for Google Map */}
        {mapMode === 'google' && (
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30">
            <button
              onClick={handleZoomIn}
              className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 shadow-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleUseMyLocation}
              className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 shadow-lg"
              title="Use my location (GPS Center)"
            >
              <Navigation className={`w-4 h-4 ${isDetecting ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} />
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 shadow-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Radar Canvas Fallback View */}
        {mapMode === 'radar' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            {activeLayer === 'temp' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-rose-500/15 animate-pulse-slow" />
            )}
            {activeLayer === 'rain' && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent animate-pulse-slow" />
            )}
            <div className="relative z-10 text-center space-y-2 p-6 glass-panel rounded-3xl border border-white/10 max-w-sm">
              <Compass className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
              <div className="font-bold text-white text-base">Weather Radar Canvas</div>
              <p className="text-xs text-slate-300">
                Centered on {weatherLocationName} ({currentTemp}°C, {currentCondition})
              </p>
            </div>
          </div>
        )}

        {/* Live Weather Overlay Badge on Google Map */}
        {mapMode === 'google' && (
          <div className="absolute bottom-4 left-4 p-3 rounded-2xl glass-panel border border-slate-800 text-xs text-slate-200 z-30 space-y-1.5 max-w-xs shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {selectedMapType.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-cyan-300">
                {selectedMapType === 'satellite' ? 'Google Satellite' : 'Google Vector'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Location: <strong>{weather.location.name}</strong> • {currentTemp}°C ({currentCondition})
            </div>
          </div>
        )}
      </div>

      {/* Save Location Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCurrentLocation} className="w-full max-w-md p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Save This Location
              </h4>
              <button type="button" onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Save <strong>{weatherLocationName}</strong> to your personalized locations for quick meteorological access.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Custom Label / Name</label>
              <input
                type="text"
                placeholder={weatherLocationName}
                value={saveLocationName}
                onChange={e => setSaveLocationName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-primary-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['home', 'office', 'school', 'gym', 'farm', 'custom'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSaveLocationType(type)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      saveLocationType === type
                        ? 'bg-primary-600 text-white border-primary-400 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
