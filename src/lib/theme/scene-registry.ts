/**
 * MAUSAM Dynamic Weather World — Scene Registry
 * Defines structured scene presets with desktop & mobile scenery backdrops,
 * color grades, atmospheric lighting, and particle configurations.
 */

export type WeatherSceneId =
  | 'sunny'
  | 'sunny-clouds'
  | 'cloudy'
  | 'rain-light'
  | 'rain'
  | 'heavy-rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'haze'
  | 'clear-night'
  | 'agriculture'
  | 'fitness'
  | 'ocean'
  | 'satellite'
  | 'radar'
  | 'travel'
  | 'health'
  | 'events'
  | 'weather';

export type FeatureWorldId =
  | 'agriculture'
  | 'rain'
  | 'sunny'
  | 'cloudy'
  | 'fitness'
  | 'ocean'
  | 'weather'
  | 'satellite'
  | 'radar'
  | 'travel'
  | 'health'
  | 'events';

export interface WeatherScenePreset {
  id: WeatherSceneId;
  name: string;
  category: 'weather' | 'feature';
  vibe: string;
  accentColor: string;
  skyGradient: string;
  horizonGradient: string;
  atmosphericGlow: string;
  backdropSvgType: string;
  particleType: 'rain' | 'snow' | 'lightning' | 'aurora' | 'embers' | 'dust' | 'marine-foam' | 'none';
  particleCount: number;
  cloudOpacity: number;
  cloudSpeed: string;
  rainIntensity: number;
  enableLightning: boolean;
  colorGrade: {
    brightness: number;
    contrast: number;
    saturate: number;
    hueRotate: number;
  };
  sunMoonPosition: {
    top: string;
    right?: string;
    left?: string;
    isSun: boolean;
    glow: string;
    size?: string;
  };
}

export const SCENE_PRESETS: Record<WeatherSceneId, WeatherScenePreset> = {
  'sunny': {
    id: 'sunny',
    name: 'Sun-Drenched Alpine Ridge',
    category: 'weather',
    vibe: 'Warm golden sunlight beaming through crisp mountain air',
    accentColor: '#f59e0b',
    skyGradient: 'from-[#08182b] via-[#133758] to-[#2563eb]',
    horizonGradient: 'from-[#fbbf24]/30 via-[#f59e0b]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 75% 20%, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 75%)',
    backdropSvgType: 'mountain-clear',
    particleType: 'dust',
    particleCount: 25,
    cloudOpacity: 0.15,
    cloudSpeed: '90s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.05, contrast: 1.05, saturate: 1.15, hueRotate: 0 },
    sunMoonPosition: { top: '15%', right: '25%', isSun: true, glow: 'rgba(251, 191, 36, 0.8)', size: 'w-24 h-24' }
  },

  'sunny-clouds': {
    id: 'sunny-clouds',
    name: 'Partly Cloudy Golden Horizon',
    category: 'weather',
    vibe: 'Sunbeams breaking through drifting cumulus cloud layers',
    accentColor: '#38bdf8',
    skyGradient: 'from-[#091a30] via-[#18395e] to-[#1e40af]',
    horizonGradient: 'from-[#38bdf8]/25 via-[#60a5fa]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 70% 25%, rgba(56, 189, 248, 0.3) 0%, rgba(96, 165, 250, 0.15) 50%, transparent 80%)',
    backdropSvgType: 'mountain-clear',
    particleType: 'dust',
    particleCount: 20,
    cloudOpacity: 0.45,
    cloudSpeed: '65s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.0, contrast: 1.02, saturate: 1.05, hueRotate: 0 },
    sunMoonPosition: { top: '18%', right: '28%', isSun: true, glow: 'rgba(251, 191, 36, 0.55)', size: 'w-20 h-20' }
  },

  'cloudy': {
    id: 'cloudy',
    name: 'Overcast Highland Canopy',
    category: 'weather',
    vibe: 'Dense, dramatic cloud blankets draped over mountain silhouettes',
    accentColor: '#94a3b8',
    skyGradient: 'from-[#0b101b] via-[#1a2333] to-[#2b394e]',
    horizonGradient: 'from-[#94a3b8]/20 via-[#64748b]/10 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 30%, rgba(148, 163, 184, 0.2) 0%, transparent 70%)',
    backdropSvgType: 'mountain-cloudy',
    particleType: 'none',
    particleCount: 0,
    cloudOpacity: 0.75,
    cloudSpeed: '45s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 0.95, contrast: 0.95, saturate: 0.85, hueRotate: 0 },
    sunMoonPosition: { top: '22%', right: '35%', isSun: true, glow: 'rgba(226, 232, 240, 0.25)', size: 'w-16 h-16' }
  },

  'rain-light': {
    id: 'rain-light',
    name: 'Gentle Highland Drizzle',
    category: 'weather',
    vibe: 'Soft rainfall misting over cool mountain valleys and wet pine needles',
    accentColor: '#38bdf8',
    skyGradient: 'from-[#07111e] via-[#0f2136] to-[#172c44]',
    horizonGradient: 'from-[#38bdf8]/20 via-[#0284c7]/10 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
    backdropSvgType: 'mountain-rain',
    particleType: 'rain',
    particleCount: 45,
    cloudOpacity: 0.65,
    cloudSpeed: '40s',
    rainIntensity: 40,
    enableLightning: false,
    colorGrade: { brightness: 0.92, contrast: 1.0, saturate: 0.9, hueRotate: 5 },
    sunMoonPosition: { top: '20%', right: '30%', isSun: false, glow: 'rgba(56, 189, 248, 0.2)' }
  },

  'rain': {
    id: 'rain',
    name: 'Cinematic Rainy Mountain Valley',
    category: 'weather',
    vibe: 'Rhythmic rainfall streaks, glistening slopes, and cool precipitation waves',
    accentColor: '#0284c7',
    skyGradient: 'from-[#050b14] via-[#0b1726] to-[#122238]',
    horizonGradient: 'from-[#0ea5e9]/25 via-[#0284c7]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.25) 0%, transparent 75%)',
    backdropSvgType: 'mountain-rain',
    particleType: 'rain',
    particleCount: 85,
    cloudOpacity: 0.75,
    cloudSpeed: '32s',
    rainIntensity: 75,
    enableLightning: false,
    colorGrade: { brightness: 0.88, contrast: 1.08, saturate: 0.95, hueRotate: 0 },
    sunMoonPosition: { top: '25%', right: '35%', isSun: false, glow: 'rgba(14, 165, 233, 0.2)' }
  },

  'heavy-rain': {
    id: 'heavy-rain',
    name: 'Torrential Mountain Downpour',
    category: 'weather',
    vibe: 'Intense precipitation sheets rushing across dark rugged cliffs',
    accentColor: '#0369a1',
    skyGradient: 'from-[#03070d] via-[#07101b] to-[#0c1b2c]',
    horizonGradient: 'from-[#0284c7]/30 via-[#0369a1]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 35%, rgba(2, 132, 199, 0.3) 0%, transparent 80%)',
    backdropSvgType: 'mountain-rain',
    particleType: 'rain',
    particleCount: 140,
    cloudOpacity: 0.85,
    cloudSpeed: '22s',
    rainIntensity: 100,
    enableLightning: false,
    colorGrade: { brightness: 0.82, contrast: 1.15, saturate: 0.9, hueRotate: -5 },
    sunMoonPosition: { top: '25%', right: '35%', isSun: false, glow: 'rgba(2, 132, 199, 0.2)' }
  },

  'storm': {
    id: 'storm',
    name: 'Tempest Peak & Lightning Surge',
    category: 'weather',
    vibe: 'Dark anvil supercell clouds torn by double-flash electric lightning',
    accentColor: '#6366f1',
    skyGradient: 'from-[#020308] via-[#070b18] to-[#0e122b]',
    horizonGradient: 'from-[#6366f1]/35 via-[#4f46e5]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 25%, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.2) 45%, transparent 80%)',
    backdropSvgType: 'mountain-storm',
    particleType: 'lightning',
    particleCount: 120,
    cloudOpacity: 0.9,
    cloudSpeed: '18s',
    rainIntensity: 95,
    enableLightning: true,
    colorGrade: { brightness: 0.8, contrast: 1.25, saturate: 1.1, hueRotate: -10 },
    sunMoonPosition: { top: '20%', right: '30%', isSun: false, glow: 'rgba(129, 140, 248, 0.4)' }
  },

  'snow': {
    id: 'snow',
    name: 'Glacial Alpine Winterscape',
    category: 'weather',
    vibe: 'Quiet crystalline snowflakes floating over majestic frosted peaks',
    accentColor: '#38bdf8',
    skyGradient: 'from-[#081320] via-[#102237] to-[#1c3857]',
    horizonGradient: 'from-[#38bdf8]/30 via-[#e0f2fe]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 25%, rgba(56, 189, 248, 0.35) 0%, transparent 75%)',
    backdropSvgType: 'mountain-snow',
    particleType: 'snow',
    particleCount: 90,
    cloudOpacity: 0.6,
    cloudSpeed: '55s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.05, contrast: 1.02, saturate: 0.85, hueRotate: 5 },
    sunMoonPosition: { top: '15%', right: '25%', isSun: false, glow: 'rgba(224, 242, 254, 0.75)' }
  },

  'fog': {
    id: 'fog',
    name: 'Shrouded Valley Mist & Fog',
    category: 'weather',
    vibe: 'Dense volumetric fog rolling slowly between mysterious mountain ridges',
    accentColor: '#94a3b8',
    skyGradient: 'from-[#080d14] via-[#131d2a] to-[#202d3d]',
    horizonGradient: 'from-[#94a3b8]/25 via-[#cbd5e1]/10 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.25) 0%, transparent 80%)',
    backdropSvgType: 'mountain-fog',
    particleType: 'none',
    particleCount: 0,
    cloudOpacity: 0.85,
    cloudSpeed: '80s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 0.9, contrast: 0.85, saturate: 0.75, hueRotate: 0 },
    sunMoonPosition: { top: '30%', right: '35%', isSun: true, glow: 'rgba(203, 213, 225, 0.2)' }
  },

  'haze': {
    id: 'haze',
    name: 'Warm Diffused Twilight Haze',
    category: 'weather',
    vibe: 'Soft particulate diffusion filtering ambient sunset tones across the horizon',
    accentColor: '#f97316',
    skyGradient: 'from-[#140b07] via-[#2a140d] to-[#431f13]',
    horizonGradient: 'from-[#f97316]/30 via-[#ea580c]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 60% 40%, rgba(249, 115, 22, 0.3) 0%, transparent 75%)',
    backdropSvgType: 'mountain-sunset',
    particleType: 'dust',
    particleCount: 30,
    cloudOpacity: 0.35,
    cloudSpeed: '70s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 0.98, contrast: 0.92, saturate: 1.1, hueRotate: 0 },
    sunMoonPosition: { top: '35%', right: '28%', isSun: true, glow: 'rgba(251, 146, 60, 0.5)' }
  },

  'clear-night': {
    id: 'clear-night',
    name: 'Midnight Celestial Ridge',
    category: 'weather',
    vibe: 'Deep starlit orbital sky overlooking silent dark mountain crests',
    accentColor: '#38bdf8',
    skyGradient: 'from-[#03060d] via-[#070e1c] to-[#0c1830]',
    horizonGradient: 'from-[#38bdf8]/20 via-[#1d4ed8]/10 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%)',
    backdropSvgType: 'mountain-night',
    particleType: 'aurora',
    particleCount: 50,
    cloudOpacity: 0.15,
    cloudSpeed: '100s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 0.9, contrast: 1.1, saturate: 1.05, hueRotate: 0 },
    sunMoonPosition: { top: '15%', right: '22%', isSun: false, glow: 'rgba(186, 230, 253, 0.7)' }
  },

  // FEATURE WORLDS
  'agriculture': {
    id: 'agriculture',
    name: 'Verdant Farmland & Terraced Slopes',
    category: 'feature',
    vibe: 'Lush green agricultural fields, terraced plantations, and fertile valley air',
    accentColor: '#10b981',
    skyGradient: 'from-[#04140b] via-[#092918] to-[#134e2f]',
    horizonGradient: 'from-[#10b981]/35 via-[#059669]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 35%, rgba(16, 185, 129, 0.3) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 80%)',
    backdropSvgType: 'farmland-fields',
    particleType: 'dust',
    particleCount: 40,
    cloudOpacity: 0.4,
    cloudSpeed: '60s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.02, contrast: 1.05, saturate: 1.25, hueRotate: -5 },
    sunMoonPosition: { top: '20%', right: '25%', isSun: true, glow: 'rgba(52, 211, 153, 0.6)' }
  },

  'fitness': {
    id: 'fitness',
    name: 'Alpine Sunrise Trail & Running Haven',
    category: 'feature',
    vibe: 'Crisp morning running ridge with energizing amber horizon glow',
    accentColor: '#f97316',
    skyGradient: 'from-[#120a06] via-[#27140c] to-[#451f11]',
    horizonGradient: 'from-[#f97316]/35 via-[#ea580c]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 65% 25%, rgba(249, 115, 22, 0.35) 0%, rgba(251, 146, 60, 0.2) 45%, transparent 80%)',
    backdropSvgType: 'mountain-trail',
    particleType: 'dust',
    particleCount: 35,
    cloudOpacity: 0.3,
    cloudSpeed: '65s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.05, contrast: 1.08, saturate: 1.2, hueRotate: 0 },
    sunMoonPosition: { top: '22%', right: '28%', isSun: true, glow: 'rgba(251, 146, 60, 0.7)' }
  },

  'ocean': {
    id: 'ocean',
    name: 'Oceanic Swell & Coastal Horizon',
    category: 'feature',
    vibe: 'Deep azure waves, hydro-luminescent ocean spray, and coastal marine mist',
    accentColor: '#0ea5e9',
    skyGradient: 'from-[#03101d] via-[#07243d] to-[#0c4068]',
    horizonGradient: 'from-[#0ea5e9]/35 via-[#0284c7]/20 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 45%, rgba(14, 165, 233, 0.35) 0%, rgba(56, 189, 248, 0.2) 50%, transparent 85%)',
    backdropSvgType: 'ocean-coastal',
    particleType: 'marine-foam',
    particleCount: 50,
    cloudOpacity: 0.35,
    cloudSpeed: '50s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.0, contrast: 1.08, saturate: 1.2, hueRotate: 5 },
    sunMoonPosition: { top: '20%', right: '30%', isSun: true, glow: 'rgba(56, 189, 248, 0.6)' }
  },

  'satellite': {
    id: 'satellite',
    name: 'Orbital Earth Observation Telemetry',
    category: 'feature',
    vibe: 'Sub-orbital vantage viewing planetary cloud systems and atmospheric flows',
    accentColor: '#06b6d4',
    skyGradient: 'from-[#01040a] via-[#040c1c] to-[#081832]',
    horizonGradient: 'from-[#06b6d4]/30 via-[#3b82f6]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 15%, rgba(6, 182, 212, 0.35) 0%, rgba(59, 130, 246, 0.2) 45%, transparent 85%)',
    backdropSvgType: 'orbital-earth',
    particleType: 'aurora',
    particleCount: 65,
    cloudOpacity: 0.25,
    cloudSpeed: '120s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 0.95, contrast: 1.15, saturate: 1.1, hueRotate: 0 },
    sunMoonPosition: { top: '12%', right: '18%', isSun: false, glow: 'rgba(34, 211, 238, 0.7)' }
  },

  'radar': {
    id: 'radar',
    name: 'Doppler Radar Precipitation Array',
    category: 'feature',
    vibe: 'High-frequency meteorological radar sweeps tracing rain cell density',
    accentColor: '#10b981',
    skyGradient: 'from-[#020b08] via-[#051711] to-[#0b291e]',
    horizonGradient: 'from-[#10b981]/30 via-[#059669]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.3) 0%, transparent 80%)',
    backdropSvgType: 'radar-grid',
    particleType: 'aurora',
    particleCount: 40,
    cloudOpacity: 0.3,
    cloudSpeed: '45s',
    rainIntensity: 25,
    enableLightning: false,
    colorGrade: { brightness: 0.95, contrast: 1.1, saturate: 1.15, hueRotate: 0 },
    sunMoonPosition: { top: '15%', right: '25%', isSun: false, glow: 'rgba(16, 185, 129, 0.6)' }
  },

  'travel': {
    id: 'travel',
    name: 'Golden Alpine Travel Destination',
    category: 'feature',
    vibe: 'Scenic mountain pass with wanderlust atmospheric lighting',
    accentColor: '#eab308',
    skyGradient: 'from-[#140f06] via-[#291f0d] to-[#453314]',
    horizonGradient: 'from-[#eab308]/30 via-[#ca8a04]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 65% 30%, rgba(234, 179, 8, 0.35) 0%, transparent 75%)',
    backdropSvgType: 'mountain-sunset',
    particleType: 'embers',
    particleCount: 30,
    cloudOpacity: 0.35,
    cloudSpeed: '60s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.04, contrast: 1.05, saturate: 1.15, hueRotate: 0 },
    sunMoonPosition: { top: '25%', right: '28%', isSun: true, glow: 'rgba(250, 204, 21, 0.65)' }
  },

  'health': {
    id: 'health',
    name: 'Pristine Pine Valley Air Sanctuary',
    category: 'feature',
    vibe: 'Clean, purifying mountain air enriched with refreshing forest mist',
    accentColor: '#2dd4bf',
    skyGradient: 'from-[#031313] via-[#072424] to-[#0c3938]',
    horizonGradient: 'from-[#2dd4bf]/30 via-[#14b8a6]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(ellipse at 50% 35%, rgba(45, 212, 191, 0.3) 0%, transparent 80%)',
    backdropSvgType: 'farmland-fields',
    particleType: 'dust',
    particleCount: 25,
    cloudOpacity: 0.25,
    cloudSpeed: '80s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.0, contrast: 1.0, saturate: 1.1, hueRotate: 0 },
    sunMoonPosition: { top: '18%', right: '25%', isSun: true, glow: 'rgba(45, 212, 191, 0.55)' }
  },

  'events': {
    id: 'events',
    name: 'Twilight Festival & Event Horizon',
    category: 'feature',
    vibe: 'Festive twilight atmosphere with soft luminous ambient highlights',
    accentColor: '#ec4899',
    skyGradient: 'from-[#170512] via-[#2e0b24] to-[#461237]',
    horizonGradient: 'from-[#ec4899]/30 via-[#db2777]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 60% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 80%)',
    backdropSvgType: 'mountain-sunset',
    particleType: 'embers',
    particleCount: 40,
    cloudOpacity: 0.35,
    cloudSpeed: '70s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.02, contrast: 1.06, saturate: 1.2, hueRotate: 0 },
    sunMoonPosition: { top: '30%', right: '30%', isSun: true, glow: 'rgba(244, 114, 182, 0.6)' }
  },

  'weather': {
    id: 'weather',
    name: 'Living MAUSAM Weather Horizon',
    category: 'feature',
    vibe: 'Complete real-time meteorological environment',
    accentColor: '#38bdf8',
    skyGradient: 'from-[#05070d] via-[#0b1020] to-[#04060a]',
    horizonGradient: 'from-[#38bdf8]/25 via-[#818cf8]/15 to-transparent',
    atmosphericGlow: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.25) 0%, transparent 80%)',
    backdropSvgType: 'mountain-clear',
    particleType: 'dust',
    particleCount: 30,
    cloudOpacity: 0.4,
    cloudSpeed: '60s',
    rainIntensity: 0,
    enableLightning: false,
    colorGrade: { brightness: 1.0, contrast: 1.0, saturate: 1.0, hueRotate: 0 },
    sunMoonPosition: { top: '20%', right: '25%', isSun: true, glow: 'rgba(56, 189, 248, 0.5)' }
  }
};
