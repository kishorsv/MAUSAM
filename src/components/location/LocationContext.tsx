'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NormalizedLocation, LocationPermissionState } from '@/lib/location/types';

interface LocationContextType {
  currentLocation: NormalizedLocation;
  permissionState: LocationPermissionState;
  isDetecting: boolean;
  error: string | null;
  showPromptBanner: boolean;
  requestDeviceLocation: () => Promise<NormalizedLocation | null>;
  setManualLocation: (loc: NormalizedLocation) => void;
  dismissPrompt: () => void;
  retryPermission: () => void;
}

const DEFAULT_LOCATION: NormalizedLocation = {
  latitude: 12.9716,
  longitude: 77.5946,
  city: 'Bengaluru',
  locality: 'Central',
  state: 'Karnataka',
  country: 'India',
  countryCode: 'IN',
  timezone: 'Asia/Kolkata',
  source: 'default'
};

const STORAGE_KEY = 'mausam_selected_location';
const PROMPT_DISMISSED_KEY = 'mausam_location_prompt_dismissed';

const LocationContext = createContext<LocationContextType>({
  currentLocation: DEFAULT_LOCATION,
  permissionState: 'prompt',
  isDetecting: false,
  error: null,
  showPromptBanner: false,
  requestDeviceLocation: async () => null,
  setManualLocation: () => {},
  dismissPrompt: () => {},
  retryPermission: () => {}
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<NormalizedLocation>(DEFAULT_LOCATION);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('prompt');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState<boolean>(false);
  
  // Guard to prevent repeated geolocation queries
  const hasAttemptedAutoDetect = useRef(false);

  /**
   * Reverse geocodes coordinates via our resilient backend endpoint
   */
  const reverseGeocodeCoords = async (lat: number, lon: number): Promise<NormalizedLocation> => {
    try {
      const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.location) {
          return {
            ...data.location,
            source: 'browser'
          };
        }
      }
    } catch {
      // Fall through to fallback
    }

    return {
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      city: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: 'Live GPS',
      source: 'browser'
    };
  };

  /**
   * Primary action to request browser GPS coordinates
   */
  const requestDeviceLocation = useCallback(async (): Promise<NormalizedLocation | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionState('unavailable');
      setError('Geolocation is not supported by your browser.');
      return null;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise<NormalizedLocation | null>((resolve) => {
      const timeoutTimer = setTimeout(() => {
        setIsDetecting(false);
        setPermissionState('timeout');
        setError('Location detection timed out. Please try again or search manually.');
        resolve(null);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutTimer);
          setPermissionState('granted');
          setShowPromptBanner(false);

          try {
            const geocoded = await reverseGeocodeCoords(
              position.coords.latitude,
              position.coords.longitude
            );

            setCurrentLocation(geocoded);
            setIsDetecting(false);

            // Persist to local storage
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(geocoded));
            } catch {}

            resolve(geocoded);
          } catch {
            const fallback: NormalizedLocation = {
              latitude: Number(position.coords.latitude.toFixed(4)),
              longitude: Number(position.coords.longitude.toFixed(4)),
              city: 'Detected Location',
              country: 'Live GPS',
              source: 'browser'
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
            setError('Location access was denied. You can search for your city manually.');
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            setPermissionState('unavailable');
            setError('Location information is currently unavailable.');
          } else {
            setPermissionState('timeout');
            setError('Location request timed out.');
          }

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }, []);

  /**
   * Manual location selection (e.g. from Search Modal or Map)
   */
  const setManualLocation = useCallback((loc: NormalizedLocation) => {
    const normalized: NormalizedLocation = {
      ...loc,
      source: 'search'
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
            source: 'saved'
          });
          hasSavedLocation = true;
        }
      }
    } catch {}

    // Check if user previously dismissed the prompt during this session
    const isDismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';

    // 2. Query browser permission state where supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state as LocationPermissionState);

          if (permissionStatus.state === 'granted') {
            // Permission already granted: detect location silently
            if (!hasAttemptedAutoDetect.current) {
              hasAttemptedAutoDetect.current = true;
              requestDeviceLocation();
            }
          } else if (permissionStatus.state === 'prompt') {
            // If user has not saved a location and hasn't dismissed banner, show prompt banner
            if (!hasSavedLocation && !isDismissed) {
              setShowPromptBanner(true);
            }
          } else if (permissionStatus.state === 'denied') {
            // Don't spam, keep default or saved location
            setPermissionState('denied');
          }

          // Listen for permission state changes (e.g. user toggles in browser address bar)
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state as LocationPermissionState);
            if (permissionStatus.state === 'granted') {
              requestDeviceLocation();
            }
          };
        })
        .catch(() => {
          // Permissions API failed, show prompt if no saved location
          if (!hasSavedLocation && !isDismissed) {
            setShowPromptBanner(true);
          }
        });
    } else {
      // Browser doesn't support navigator.permissions
      if (!hasSavedLocation && !isDismissed) {
        setShowPromptBanner(true);
      }
    }
  }, [requestDeviceLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        permissionState,
        isDetecting,
        error,
        showPromptBanner,
        requestDeviceLocation,
        setManualLocation,
        dismissPrompt,
        retryPermission
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
