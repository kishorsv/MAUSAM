export type ThemeId = 
  | 'midnight-ai' 
  | 'arctic' 
  | 'emerald' 
  | 'violet-cosmos' 
  | 'sunset'
  | 'ocean-pulse'
  | 'monsoon'
  | 'desert-glow'
  | 'aurora-sky'
  | 'storm-core'
  // Legacy aliases for backward compatibility with earlier builds and tests
  | 'aurora' 
  | 'living-weather' 
  | 'earth' 
  | 'nature' 
  | 'glass';

export type ThemeMode = 'dark' | 'light' | 'auto';
export type MotionPreference = 'full' | 'reduced' | 'auto';
export type WeatherEffectsPreference = 'enabled' | 'disabled' | 'auto';

export type WeatherConditionKey = 
  | 'clear-day' 
  | 'clear-night' 
  | 'rain' 
  | 'storm' 
  | 'snow' 
  | 'fog' 
  | 'cloudy' 
  | 'sunrise' 
  | 'sunset';

export type ParticleType = 
  | 'none'
  | 'rain' 
  | 'sunlight' 
  | 'stars' 
  | 'lightning' 
  | 'fog' 
  | 'snow' 
  | 'aurora' 
  | 'satellite-grid'
  | 'leaves'
  | 'embers'
  | 'cosmic'
  | 'water'
  | 'dust';

export interface ThemeTokens {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  foreground: string;
  foregroundMuted: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  border: string;
  borderSubtle: string;
  shadow: string;
  glow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  chartPrimary: string;
  chartSecondary: string;
  mapAccent: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
  description: string;
  accentColor: string;
  primaryGlow: string;
  previewColors: string[];
}

export interface WeatherVisualState {
  themeId: ThemeId;
  conditionKey: WeatherConditionKey;
  particleType: ParticleType;
  timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night';
  bgGradient: string;
  atmosphericGlow: string;
  accentColor: string;
  glassPanelClass: string;
  glassBorderClass: string;
  heroHeadline: string;
  atmosphereNote: string;
  enableLightning: boolean;
  rainIntensity: number; // 0 - 100
  windSpeedNormalized: number; // 0 - 100
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'midnight-ai',
    name: 'Midnight AI',
    tagline: 'AI & Futuristic Intelligence',
    icon: '🌌',
    badge: 'AI Futuristic',
    description: 'Dark cyber-glass surfaces, electric cyan pulses, subtle purple neural glow, and hyper-predictive data stream aesthetics.',
    accentColor: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.35)',
    previewColors: ['#05070d', '#0b1020', '#38bdf8', '#8b5cf6']
  },
  {
    id: 'arctic',
    name: 'Arctic',
    tagline: 'Cold, Clean & Crystal-Clear',
    icon: '❄️',
    badge: 'Crystal Pure',
    description: 'Sub-zero frosted glass, crystalline borders, crisp cyan precision highlights, and serene falling snow atmosphere.',
    accentColor: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.4)',
    previewColors: ['#06131f', '#0b2535', '#38bdf8', '#bae6fd']
  },
  {
    id: 'emerald',
    name: 'Emerald',
    tagline: 'Biosphere, Nature & Agriculture',
    icon: '🌿',
    badge: 'Biosphere',
    description: 'Deep rainforest glass, organic chlorophyll greens, gentle ambient spores, and soil-nourishing environmental intelligence.',
    accentColor: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.35)',
    previewColors: ['#02130e', '#06281e', '#10b981', '#34d399']
  },
  {
    id: 'violet-cosmos',
    name: 'Violet Cosmos',
    tagline: 'Space, Orbital & Satellite Deep Space',
    icon: '🟣',
    badge: 'Orbital Space',
    description: 'Deep cosmic void, galactic nebula dust, orbital telemetry sweeps, and luminous ultraviolet stellar intelligence.',
    accentColor: '#8b5cf6',
    primaryGlow: 'rgba(139, 92, 246, 0.4)',
    previewColors: ['#080512', '#120a24', '#7c3aed', '#d946ef']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Warm Atmospheric Golden Horizon',
    icon: '🌅',
    badge: 'Cinematic Warmth',
    description: 'Cinematic golden hour gradients, peach & amber atmospheric scattering, warm ember motes, and soft glowing dusk.',
    accentColor: '#ea580c',
    primaryGlow: 'rgba(234, 88, 12, 0.4)',
    previewColors: ['#180a08', '#32100b', '#ea580c', '#fbbf24']
  },
  {
    id: 'ocean-pulse',
    name: 'Ocean Pulse',
    tagline: 'Deep Marine & Coastal Horizon',
    icon: '🌊',
    badge: 'Coastal Marine',
    description: 'Deep abyss navy, luminous turquoise surf highlights, slow rhythmic tidal swell, and oceanic coastal clarity.',
    accentColor: '#06b6d4',
    primaryGlow: 'rgba(6, 182, 212, 0.4)',
    previewColors: ['#031322', '#05223c', '#06b6d4', '#22d3ee']
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    tagline: 'Rain-Drenched Tempest Atmospheric',
    icon: '🌧️',
    badge: 'Precipitation',
    description: 'Wet slate and deep storm navy, rain streak refractions, rolling precipitation fronts, and cool saturated droplets.',
    accentColor: '#0284c7',
    primaryGlow: 'rgba(2, 132, 199, 0.4)',
    previewColors: ['#05101a', '#0b1c2e', '#0284c7', '#38bdf8']
  },
  {
    id: 'desert-glow',
    name: 'Desert Glow',
    tagline: 'Solar Dunes & Amber Heat Haze',
    icon: '🏜️',
    badge: 'Solar Dunes',
    description: 'Rich terra-cotta, radiant amber sun rays, golden atmospheric dust motes, and expansive desert horizon warmth.',
    accentColor: '#d97706',
    primaryGlow: 'rgba(217, 119, 6, 0.4)',
    previewColors: ['#1c0f05', '#331c0a', '#d97706', '#fbbf24']
  },
  {
    id: 'aurora-sky',
    name: 'Aurora Sky',
    tagline: 'Geomagnetic Polar Light Curtains',
    icon: '🌌',
    badge: 'Polar Aurora',
    description: 'Electric cyan and emerald magnetic wave curtains flowing across high-latitude twilight skies with deep celestial violet.',
    accentColor: '#22d3ee',
    primaryGlow: 'rgba(34, 211, 238, 0.45)',
    previewColors: ['#040a18', '#081735', '#22d3ee', '#10b981']
  },
  {
    id: 'storm-core',
    name: 'Storm Core',
    tagline: 'Electric Tempest & Thunder Front',
    icon: '⚡',
    badge: 'Severe Tempest',
    description: 'Pitch-black thunderheads, high-voltage electric blue discharges, violent barometric drop, and rapid pulse lighting.',
    accentColor: '#6366f1',
    primaryGlow: 'rgba(99, 102, 241, 0.45)',
    previewColors: ['#050814', '#0d132a', '#6366f1', '#38bdf8']
  }
];

export const LEGACY_THEMES: ThemeConfig[] = [
  {
    id: 'living-weather',
    name: 'Living Weather',
    tagline: 'Environmentally Reactive Atmosphere',
    icon: '🌦️',
    badge: 'Dynamic Real-time',
    description: 'Interface dynamically morphs colors, particles, and lighting to match real-time weather conditions.',
    accentColor: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.25)',
    previewColors: ['#030e1c', '#061933', '#38bdf8', '#818cf8']
  },
  {
    id: 'aurora',
    name: 'Aurora Intelligence',
    tagline: 'Futuristic AI & Atmospheric Waves',
    icon: '🌌',
    badge: 'AI Futuristic',
    description: 'Deep cosmic space gradients with electric cyan & violet aurora waves, glowing data lines, and floating motes.',
    accentColor: '#22d3ee',
    primaryGlow: 'rgba(34, 211, 238, 0.3)',
    previewColors: ['#050816', '#0b1329', '#22d3ee', '#8b5cf6']
  },
  {
    id: 'earth',
    name: 'Earth Intelligence',
    tagline: 'Satellite & Command Center',
    icon: '🛰️',
    badge: 'Command Center',
    description: 'Orbital telemetry, satellite observation sweeps, radar grid overlays, and geospatial data lines.',
    accentColor: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.25)',
    previewColors: ['#030712', '#05111e', '#10b981', '#06b6d4']
  },
  {
    id: 'nature',
    name: 'Nature & Human',
    tagline: 'Atmospheric Scenery & Harmony',
    icon: '🌿',
    badge: 'Organic Calm',
    description: 'Soft sunlight gradients, gentle breeze particles, horizon transitions, and warm human-centric typography.',
    accentColor: '#34d399',
    primaryGlow: 'rgba(52, 211, 153, 0.25)',
    previewColors: ['#041d1a', '#072522', '#34d399', '#10b981']
  },
  {
    id: 'glass',
    name: 'Weather Glass',
    tagline: 'VisionOS Spatial Frosted Glass',
    icon: '🔮',
    badge: 'Spatial Glass',
    description: 'Ultra-modern frosted translucent surfaces, specular edge reflections, deep blurs, and bold clean numbers.',
    accentColor: '#e2e8f0',
    primaryGlow: 'rgba(255, 255, 255, 0.2)',
    previewColors: ['#090d16', '#0f172a', '#e2e8f0', '#94a3b8']
  }
];

export const ALL_THEMES: ThemeConfig[] = [...AVAILABLE_THEMES, ...LEGACY_THEMES];
