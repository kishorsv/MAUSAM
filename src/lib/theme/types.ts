export type ThemeId = 'aurora' | 'living-weather' | 'earth' | 'nature' | 'glass';

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
  | 'satellite-grid';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
  description: string;
  accentColor: string;
  primaryGlow: string;
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
    id: 'living-weather',
    name: 'Living Weather',
    tagline: 'Environmentally Reactive Atmosphere',
    icon: '🌦️',
    badge: 'Dynamic Real-time',
    description: 'Interface dynamically morphs colors, particles, and lighting to match real-time weather conditions.',
    accentColor: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.25)'
  },
  {
    id: 'aurora',
    name: 'Aurora Intelligence',
    tagline: 'Futuristic AI & Atmospheric Waves',
    icon: '🌌',
    badge: 'AI Futuristic',
    description: 'Deep cosmic space gradients with electric cyan & violet aurora waves, glowing data lines, and floating motes.',
    accentColor: '#22d3ee',
    primaryGlow: 'rgba(34, 211, 238, 0.3)'
  },
  {
    id: 'earth',
    name: 'Earth Intelligence',
    tagline: 'Satellite & Command Center',
    icon: '🛰️',
    badge: 'Command Center',
    description: 'Orbital telemetry, satellite observation sweeps, radar grid overlays, and geospatial data lines.',
    accentColor: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.25)'
  },
  {
    id: 'nature',
    name: 'Nature & Human',
    tagline: 'Atmospheric Scenery & Harmony',
    icon: '🌿',
    badge: 'Organic Calm',
    description: 'Soft sunlight gradients, gentle breeze particles, horizon transitions, and warm human-centric typography.',
    accentColor: '#34d399',
    primaryGlow: 'rgba(52, 211, 153, 0.25)'
  },
  {
    id: 'glass',
    name: 'Weather Glass',
    tagline: 'VisionOS Spatial Frosted Glass',
    icon: '🔮',
    badge: 'Spatial Glass',
    description: 'Ultra-modern frosted translucent surfaces, specular edge reflections, deep blurs, and bold clean numbers.',
    accentColor: '#e2e8f0',
    primaryGlow: 'rgba(255, 255, 255, 0.2)'
  }
];
