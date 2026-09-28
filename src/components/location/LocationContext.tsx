'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NormalizedLocation, LocationPermissionState } from '@/lib/location/types';

interface LocationContextType {
  currentLocation: NormalizedLocation;
  permissionState: LocationPermissionState;
  isDetecting: boolean;
  error: string | null;
  accuracy: number | null;
  isLowAccuracy: boolean;
  accuracyWarning: string | null;
  showPromptBanner: boolean;
  isWatching: boolean;
  requestDeviceLocation: () => Promise<NormalizedLocation | null>;
  setManualLocation: (loc: NormalizedLocation) => void;
  dismissPrompt: () => void;
  retryPermission: () => void;
  toggleWatch: () => void;
}

// Initial neutral reference coordinates (used before location permission or manual selection)
const INITIAL_LOCATION: NormalizedLocation = {
  latitude: 12.9716,
  longitude: 77.5946,
  city: 'Detected Region',
  locality: 'Regional Center',
  state: 'India',
  country: 'India',
  countryCode: 'IN',
  timezone: 'Asia/Kolkata',
  source: 'default',
  updatedAt: new Date().toISOString()
};

const STORAGE_KEY = 'mausam_selected_location';
const PROMPT_DISMISSED_KEY = 'mausam_location_prompt_dismissed';

const LocationContext = createContext<LocationContextType>({
  currentLocation: INITIAL_LOCATION,
  permissionState: 'idle',
  isDetecting: false,
  error: null,
  accuracy: null,
  isLowAccuracy: false,
  accuracyWarning: null,
  showPromptBanner: false,
  isWatching: false,
  requestDeviceLocation: async () => null,
  setManualLocation: () => {},
  dismissPrompt: () => {},
  retryPermission: () => {},
  toggleWatch: () => {}
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<NormalizedLocation>(INITIAL_LOCATION);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('idle');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState<boolean>(false);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  // Watch position reference ID
  const watchIdRef = useRef<number | null>(null);
  const hasAttemptedAutoDetect = useRef(false);

  const isLowAccuracy = typeof accuracy === 'number' && accuracy > 3000;
  const accuracyWarning = isLowAccuracy
    ? `Location accuracy is low (~${Math.round(accuracy)}m). Weather may be less precise.`
    : null;

  /**
   * Reverse geocodes coordinates via our resilient backend endpoint
   */
  const reverseGeocodeCoords = async (
    lat: number,
    lon: number,
    accuracyVal?: number,
    timestampVal?: number
  ): Promise<NormalizedLocation> => {
    try {
      const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.location) {
          return {
            ...data.location,
            accuracy: accuracyVal,
            timestamp: timestampVal,
            updatedAt: new Date().toISOString(),
            source: 'gps'
          };
        }
      }
    } catch {
      // Fall through to fallback
    }

    const latCard = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
    const lonCard = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;

    return {
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      accuracy: accuracyVal,
      timestamp: timestampVal,
      city: `${latCard}, ${lonCard}`,
      locality: 'Current Location',
      country: 'Live GPS',
      source: 'gps',
      updatedAt: new Date().toISOString()
    };
  };

  /**
   * Primary action to request browser GPS coordinates
   */
  const requestDeviceLocation = useCallback(async (): Promise<NormalizedLocation | null> => {
    if (typeof window === 'undefined') return null;

    // 1. Secure context validation (HTTPS check)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setPermissionState('error');
      setError('Location access requires a secure HTTPS connection.');
      return null;
    }

    // 2. Browser Geolocation support check
    if (!navigator.geolocation) {
      setPermissionState('unavailable');
      setError("We couldn't determine your location. Check your device location services and try again.");
      return null;
    }

    setIsDetecting(true);
    setPermissionState('requesting');
    setError(null);

    return new Promise<NormalizedLocation | null>((resolve) => {
      const timeoutTimer = setTimeout(() => {
        setIsDetecting(false);
        setPermissionState('timeout');
        setError('Location request timed out. Try again.');
        resolve(null);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutTimer);
          setPermissionState('granted');
          setShowPromptBanner(false);

          const { latitude, longitude, accuracy: acc } = position.coords;
          const posTimestamp = position.timestamp;
          setAccuracy(acc);

          try {
            const geocoded = await reverseGeocodeCoords(latitude, longitude, acc, posTimestamp);
            setCurrentLocation(geocoded);
            setIsDetecting(false);

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(geocoded));
            } catch {}

            resolve(geocoded);
          } catch {
            const fallback: NormalizedLocation = {
              latitude: Number(latitude.toFixed(4)),
              longitude: Number(longitude.toFixed(4)),
              accuracy: acc,
              timestamp: posTimestamp,
              city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
              locality: 'Current Location',
              country: 'Live GPS',
              source: 'gps',
              updatedAt: new Date().toISOString()
            };
            setCurrentLocation(fallback);
            setIsDetecting(false);
            resolve(fallback);
          }
        },
        (geoError) => {
          clearTimeout(timeoutTimer);
          setIsDetecting(false);

          if (geoError.code === geoError.PERMISSION_DENIED) {
            setPermissionState('denied');
            setError('Location permission was denied. Allow location access in your browser settings and try again.');
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            setPermissionState('unavailable');
            setError("We couldn't determine your location. Check your device location services and try again.");
          } else if (geoError.code === geoError.TIMEOUT) {
            setPermissionState('timeout');
            setError('Location request timed out. Try again.');
          } else {
            setPermissionState('error');
            setError('Unable to detect your location.');
          }

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 60000 // 1 minute max cache for real GPS freshness
        }
      );
    });
  }, []);

  /**
   * Watch position toggle (for dynamic GPS tracking)
   */
  const toggleWatch = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    if (isWatching) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatching(false);
    } else {
      setIsWatching(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords;
          setAccuracy(acc);
          const geocoded = await reverseGeocodeCoords(latitude, longitude, acc, position.timestamp);
          setCurrentLocation(geocoded);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(geocoded));
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }
  }, [isWatching]);

  /**
   * Manual location selection (e.g. from Search Modal or Map)
   */
  const setManualLocation = useCallback((loc: NormalizedLocation) => {
    const normalized: NormalizedLocation = {
      ...loc,
      accuracy: undefined,
      source: 'search',
      updatedAt: new Date().toISOString()
    };
    setCurrentLocation(normalized);
    setShowPromptBanner(false);
    setError(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {}
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPromptBanner(false);
    try {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    } catch {}
  }, []);

  const retryPermission = useCallback(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  // Initial Mount Lifecycle: Load saved location first, query permissions safely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check local storage for previously selected location
    let hasSavedLocation = false;
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          setCurrentLocation({
            ...parsed,
            source: parsed.source || 'saved'
          });
          if (typeof parsed.accuracy === 'number') {
            setAccuracy(parsed.accuracy);
          }
          hasSavedLocation = true;
        }
      }
    } catch {}

    const isDismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';

    // 2. Query browser permission state where supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          const state = permissionStatus.state as LocationPermissionState;
          setPermissionState(state);

          if (state === 'granted') {
            // Permission already granted: detect location silently
            if (!hasAttemptedAutoDetect.current) {
              hasAttemptedAutoDetect.current = true;
              requestDeviceLocation();
            }
          } else if (state === 'prompt') {
            if (!hasSavedLocation && !isDismissed) {
              setShowPromptBanner(true);
            }
          } else if (state === 'denied') {
            setPermissionState('denied');
          }

          // Reactive listener for permission toggle
          permissionStatus.onchange = () => {
            const nextState = permissionStatus.state as LocationPermissionState;
            setPermissionState(nextState);
            if (nextState === 'granted') {
              requestDeviceLocation();
            }
          };
        })
        .catch(() => {
          if (!hasSavedLocation && !isDismissed) {
            setShowPromptBanner(true);
          }
        });
    } else {
      if (!hasSavedLocation && !isDismissed) {
        setShowPromptBanner(true);
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestDeviceLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        permissionState,
        isDetecting,
        error,
        accuracy,
        isLowAccuracy,
        accuracyWarning,
        showPromptBanner,
        isWatching,
        requestDeviceLocation,
        setManualLocation,
        dismissPrompt,
        retryPermission,
        toggleWatch
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
