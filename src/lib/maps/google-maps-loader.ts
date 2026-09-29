/**
 * MAUSAM — GOOGLE MAPS JAVASCRIPT API SINGLETON LOADER & ERROR DIAGNOSTICS
 *
 * Implements a shared, singleton Google Maps SDK loader that:
 * 1. Loads Google Maps JavaScript API exactly once.
 * 2. Manages singleton Promise and lifecycle state (LOADING, READY, ERROR, RETRY).
 * 3. Catches window.gm_authFailure and extracts granular diagnostics:
 *    - GOOGLE_MAPS_API_KEY_MISSING
 *    - GOOGLE_MAPS_API_NOT_LOADED
 *    - GOOGLE_MAPS_BILLING_ERROR
 *    - GOOGLE_MAPS_REFERRER_RESTRICTION
 *    - GOOGLE_MAPS_QUOTA_ERROR
 *    - GOOGLE_MAPS_AUTH_ERROR
 *    - GOOGLE_MAP_NOT_READY
 *    - SATELLITE_MODE_ERROR
 *    - GOOGLE_MAPS_SUCCESS
 * 4. Never exposes private server secrets or full client API keys.
 * 5. Provides helper for MapTypeId mapping (ROADMAP, SATELLITE, HYBRID, TERRAIN).
 * 6. Always enables map type switching without hiding the Satellite button.
 */

export type GoogleMapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type GoogleMapsDiagnosticCode =
  | 'GOOGLE_MAPS_SUCCESS'
  | 'GOOGLE_MAPS_API_KEY_MISSING'
  | 'GOOGLE_MAPS_API_NOT_LOADED'
  | 'GOOGLE_MAPS_BILLING_ERROR'
  | 'GOOGLE_MAPS_REFERRER_RESTRICTION'
  | 'GOOGLE_MAPS_QUOTA_ERROR'
  | 'GOOGLE_MAPS_AUTH_ERROR'
  | 'GOOGLE_MAP_NOT_READY'
  | 'SATELLITE_MODE_ERROR';

export interface GoogleMapsDiagnosticInfo {
  code: GoogleMapsDiagnosticCode;
  message: string;
  hasKey: boolean;
  maskedKey: string;
  isLoaded: boolean;
  isMapReady: boolean;
  activeMapType: GoogleMapType;
  resolutionHint: string;
}

export type GoogleMapsLoaderStatus = 
  | 'idle' 
  | 'loading' 
  | 'ready' 
  | 'error' 
  | 'auth_failed' 
  | 'not_configured';

// Module-level singleton state
let loadPromise: Promise<any> | null = null;
let currentStatus: GoogleMapsLoaderStatus = 'idle';
let authErrorMessage: string | null = null;
let detectedDiagnosticCode: GoogleMapsDiagnosticCode = 'GOOGLE_MAPS_SUCCESS';
const listeners: Array<(status: GoogleMapsLoaderStatus, diagnostic: GoogleMapsDiagnosticInfo) => void> = [];

/**
 * Mask an API key to protect security while allowing verification
 * Example: 'AIzaSyDx1234567890abcdef' -> 'AIzaSy...cdef'
 */
export function maskGoogleMapsApiKey(key?: string | null): string {
  if (!key || key.trim() === '') return '[NOT CONFIGURED]';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return `${trimmed.slice(0, 3)}...${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

/**
 * Resolve effective Google Maps API key from environment or sessionStorage override
 */
export function getActiveGoogleMapsApiKey(): string {
  if (typeof window !== 'undefined') {
    // Check developer override in sessionStorage
    const sessionOverride = sessionStorage.getItem('mausam-google-maps-key-override');
    if (sessionOverride && sessionOverride.trim() !== '') {
      return sessionOverride.trim();
    }
  }

  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ''
  ).trim();
}

/**
 * Convert GoogleMapType string to official google.maps.MapTypeId
 */
export function resolveMapTypeId(type: GoogleMapType, g?: any): any {
  const gMaps = g || (typeof window !== 'undefined' ? (window as any).google?.maps : null);
  if (!gMaps || !gMaps.MapTypeId) {
    return type; // fallback to string ('satellite', 'roadmap', etc.)
  }

  switch (type) {
    case 'satellite':
      return gMaps.MapTypeId.SATELLITE || 'satellite';
    case 'hybrid':
      return gMaps.MapTypeId.HYBRID || 'hybrid';
    case 'terrain':
      return gMaps.MapTypeId.TERRAIN || 'terrain';
    case 'roadmap':
    default:
      return gMaps.MapTypeId.ROADMAP || 'roadmap';
  }
}

/**
 * Build a structured diagnostic report
 */
export function getGoogleMapsDiagnostics(
  isMapReady = false,
  activeMapType: GoogleMapType = 'roadmap'
): GoogleMapsDiagnosticInfo {
  const rawKey = getActiveGoogleMapsApiKey();
  const hasKey = rawKey.length > 0;
  const maskedKey = maskGoogleMapsApiKey(rawKey);
  const isLoaded = typeof window !== 'undefined' && !!(window as any).google?.maps;

  let code: GoogleMapsDiagnosticCode = 'GOOGLE_MAPS_SUCCESS';
  let message = 'Google Maps JavaScript API is initialized and operational.';
  let resolutionHint = 'Normal operation. All satellite and vector map tiles are active.';

  if (!hasKey) {
    code = 'GOOGLE_MAPS_API_KEY_MISSING';
    message = 'Google Maps API key is not configured in environment variables.';
    resolutionHint = 'For production quotas, set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local. Development evaluation mode is active.';
  } else if (currentStatus === 'auth_failed' || detectedDiagnosticCode === 'GOOGLE_MAPS_AUTH_ERROR') {
    code = detectedDiagnosticCode || 'GOOGLE_MAPS_AUTH_ERROR';
    message = authErrorMessage || 'Google Maps API authorization failed.';
    resolutionHint = 'Check Google Cloud Console: ensure Maps JavaScript API is enabled, billing is active, and HTTP referrers allow http://localhost:3000/*.';
  } else if (currentStatus === 'error' || detectedDiagnosticCode === 'GOOGLE_MAPS_API_NOT_LOADED') {
    code = 'GOOGLE_MAPS_API_NOT_LOADED';
    message = 'Failed to load Google Maps SDK script.';
    resolutionHint = 'Check network connectivity or ad-blockers that may prevent loading maps.googleapis.com.';
  } else if (!isMapReady && isLoaded) {
    code = 'GOOGLE_MAP_NOT_READY';
    message = 'Google Maps SDK is loaded, but map container instance is initializing.';
    resolutionHint = 'Wait for map reference assignment before triggering mapTypeId switches.';
  } else if (detectedDiagnosticCode === 'SATELLITE_MODE_ERROR') {
    code = 'SATELLITE_MODE_ERROR';
    message = 'Failed to set mapTypeId to Satellite.';
    resolutionHint = 'Verify WebGL support and ensure MapTypeId.SATELLITE is supported in the current Google Maps runtime.';
  }

  return {
    code,
    message,
    hasKey,
    maskedKey,
    isLoaded,
    isMapReady,
    activeMapType,
    resolutionHint
  };
}

/**
 * Singleton Google Maps Script Loader
 * Guarantees one initialization and never blocks map loading if key is in dev mode.
 */
export function loadGoogleMapsScript(customKey?: string): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in browser'));
  }

  // If already loaded and available on window
  if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
    currentStatus = 'ready';
    detectedDiagnosticCode = 'GOOGLE_MAPS_SUCCESS';
    return Promise.resolve((window as any).google.maps);
  }

  const effectiveKey = (customKey || getActiveGoogleMapsApiKey()).trim();

  // Return existing in-flight promise if loading
  if (loadPromise && currentStatus === 'loading') {
    return loadPromise;
  }

  currentStatus = 'loading';
  notifyListeners();

  loadPromise = new Promise((resolve, reject) => {
    // Intercept Google Maps Auth Failures globally
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      currentStatus = 'auth_failed';
      detectedDiagnosticCode = 'GOOGLE_MAPS_AUTH_ERROR';
      authErrorMessage = 'Google Maps API authorization failure (Billing / Quota / Referrer restriction).';
      notifyListeners();
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
      // Keep map visible in evaluation mode if possible
      if ((window as any).google?.maps?.Map) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('GOOGLE_MAPS_AUTH_ERROR'));
      }
    };

    // Global console error interception for Google Maps specific error tokens
    const originalConsoleError = console.error;
    console.error = function (...args: any[]) {
      const errStr = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a) || '')).join(' ');
      if (errStr.includes('BillingNotEnabledMapError')) {
        detectedDiagnosticCode = 'GOOGLE_MAPS_BILLING_ERROR';
        authErrorMessage = 'Google Maps billing is not enabled for this project.';
        notifyListeners();
      } else if (errStr.includes('RefererNotAllowedMapError')) {
        detectedDiagnosticCode = 'GOOGLE_MAPS_REFERRER_RESTRICTION';
        authErrorMessage = 'Google Maps API key restriction prevented this request (HTTP Referrer blocked).';
        notifyListeners();
      } else if (errStr.includes('OverQuotaMapError')) {
        detectedDiagnosticCode = 'GOOGLE_MAPS_QUOTA_ERROR';
        authErrorMessage = 'Google Maps usage limit reached (OverQuotaMapError).';
        notifyListeners();
      } else if (errStr.includes('MissingKeyMapError')) {
        detectedDiagnosticCode = 'GOOGLE_MAPS_API_KEY_MISSING';
        authErrorMessage = 'Google Maps API key is not configured.';
        notifyListeners();
      } else if (errStr.includes('ApiNotActivatedMapError')) {
        detectedDiagnosticCode = 'GOOGLE_MAPS_API_NOT_LOADED';
        authErrorMessage = 'Maps JavaScript API is not activated in Google Cloud Console.';
        notifyListeners();
      }
      originalConsoleError.apply(console, args);
    };

    // Setup global callback to guarantee complete initialization
    const callbackName = '__mausamGoogleMapsLoaded';
    (window as any)[callbackName] = () => {
      if ((window as any).google && (window as any).google.maps) {
        currentStatus = 'ready';
        detectedDiagnosticCode = effectiveKey ? 'GOOGLE_MAPS_SUCCESS' : 'GOOGLE_MAPS_API_KEY_MISSING';
        authErrorMessage = null;
        notifyListeners();
        resolve((window as any).google.maps);
      }
    };

    const scriptId = 'mausam-google-maps-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      const keyParam = effectiveKey ? `key=${encodeURIComponent(effectiveKey)}&` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=places,geometry&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Fallback in case callback fired before or simultaneously
        setTimeout(() => {
          if ((window as any).google && (window as any).google.maps) {
            currentStatus = 'ready';
            detectedDiagnosticCode = effectiveKey ? 'GOOGLE_MAPS_SUCCESS' : 'GOOGLE_MAPS_API_KEY_MISSING';
            notifyListeners();
            resolve((window as any).google.maps);
          }
        }, 150);
      };

      script.onerror = () => {
        currentStatus = 'error';
        detectedDiagnosticCode = 'GOOGLE_MAPS_API_NOT_LOADED';
        authErrorMessage = 'Network error fetching maps.googleapis.com SDK script.';
        notifyListeners();
        reject(new Error('GOOGLE_MAPS_API_NOT_LOADED'));
      };

      document.head.appendChild(script);
    } else {
      // Script tag exists; poll for window.google.maps.Map
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
          clearInterval(checkInterval);
          currentStatus = 'ready';
          detectedDiagnosticCode = effectiveKey ? 'GOOGLE_MAPS_SUCCESS' : 'GOOGLE_MAPS_API_KEY_MISSING';
          notifyListeners();
          resolve((window as any).google.maps);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (currentStatus !== 'ready') {
          if ((window as any).google?.maps) {
            currentStatus = 'ready';
            resolve((window as any).google.maps);
          } else {
            currentStatus = 'error';
            detectedDiagnosticCode = 'GOOGLE_MAPS_API_NOT_LOADED';
            notifyListeners();
            reject(new Error('Google Maps script load timeout'));
          }
        }
      }, 9000);
    }
  });

  return loadPromise;
}

/**
 * Register listener for status updates
 */
export function subscribeToGoogleMaps(
  listener: (status: GoogleMapsLoaderStatus, diagnostic: GoogleMapsDiagnosticInfo) => void
): () => void {
  listeners.push(listener);
  listener(currentStatus, getGoogleMapsDiagnostics(false));
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  const diag = getGoogleMapsDiagnostics(currentStatus === 'ready');
  listeners.forEach(fn => fn(currentStatus, diag));
}

/**
 * Manually report satellite or runtime errors
 */
export function reportGoogleMapsError(code: GoogleMapsDiagnosticCode, errorDetail?: string) {
  detectedDiagnosticCode = code;
  if (errorDetail) authErrorMessage = errorDetail;
  notifyListeners();
}
