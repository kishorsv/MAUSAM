import { WeatherPayload } from "../weather/types";
import { ThemeId, WeatherConditionKey, ParticleType, WeatherVisualState } from "./types";

export class WeatherMotionEngine {
  /**
   * Deterministically calculates the visual atmosphere state given live weather data and theme preference
   */
  calculateVisualState(
    weather: WeatherPayload | null, 
    themeId: ThemeId = 'midnight-ai',
    mode: 'dark' | 'light' = 'dark'
  ): WeatherVisualState {
    const hour = new Date().getHours();
    const isDay = weather ? weather.current.isDay : (hour >= 6 && hour < 19);

    // 1. Determine time of day
    let timeOfDay: WeatherVisualState['timeOfDay'] = 'day';
    if (hour >= 5 && hour < 7) {
      timeOfDay = 'sunrise';
    } else if (hour >= 7 && hour < 17) {
      timeOfDay = 'day';
    } else if (hour >= 17 && hour < 19) {
      timeOfDay = 'sunset';
    } else {
      timeOfDay = 'night';
    }

    // 2. Determine meteorological condition key
    const current = weather?.current;
    const wmo = current?.wmoCode ?? 0;
    const precip = current?.precipitation ?? 0;
    const rainProb = weather?.hourly?.[0]?.precipitationProbability ?? 0;
    const visibility = current?.visibility ?? 10;
    const hasAlerts = (weather?.alerts?.length ?? 0) > 0;

    let conditionKey: WeatherConditionKey = 'clear-day';
    let enableLightning = false;

    if (wmo === 95 || wmo === 96 || wmo === 99 || (hasAlerts && weather?.alerts[0]?.title.toLowerCase().includes('storm'))) {
      conditionKey = 'storm';
      enableLightning = true;
    } else if (wmo >= 71 && wmo <= 77 || wmo >= 85 && wmo <= 86) {
      conditionKey = 'snow';
    } else if (precip > 0 || (wmo >= 51 && wmo <= 67) || (wmo >= 80 && wmo <= 82) || rainProb >= 60) {
      conditionKey = 'rain';
    } else if (wmo === 45 || wmo === 48 || visibility < 2.5) {
      conditionKey = 'fog';
    } else if (wmo === 2 || wmo === 3) {
      conditionKey = 'cloudy';
    } else if (timeOfDay === 'sunrise') {
      conditionKey = 'sunrise';
    } else if (timeOfDay === 'sunset') {
      conditionKey = 'sunset';
    } else if (!isDay) {
      conditionKey = 'clear-night';
    } else {
      conditionKey = 'clear-day';
    }

    const rainIntensity = Math.min(100, Math.max(0, precip > 0 ? Math.round(precip * 15) : rainProb));
    const windSpeedNormalized = Math.min(100, Math.round(((current?.windSpeed ?? 15) / 60) * 100));

    // Determine weather particle override when active weather conditions exist
    const isStorm = conditionKey === 'storm';
    const isRain = conditionKey === 'rain';
    const isSnow = conditionKey === 'snow';

    // 3. Assemble Visual State according to active Theme
    switch (themeId) {
      // 1. MIDNIGHT AI
      case 'midnight-ai':
        return {
          themeId: 'midnight-ai',
          conditionKey,
          particleType: isStorm ? 'lightning' : isRain ? 'rain' : isSnow ? 'snow' : 'aurora',
          timeOfDay,
          bgGradient: mode === 'dark' 
            ? 'bg-gradient-to-b from-[#05070d] via-[#0b1020] to-[#04060a]'
            : 'bg-gradient-to-b from-[#f0f6fc] via-[#e2e8f0] to-[#f8fafc]',
          atmosphericGlow: mode === 'dark'
            ? 'radial-gradient(circle at 50% -10%, rgba(56, 189, 248, 0.25) 0%, rgba(139, 92, 246, 0.20) 40%, transparent 80%)'
            : 'radial-gradient(circle at 50% -10%, rgba(2, 132, 199, 0.15) 0%, rgba(124, 58, 237, 0.12) 40%, transparent 80%)',
          accentColor: '#38bdf8',
          glassPanelClass: mode === 'dark'
            ? 'bg-[#0b1020]/75 backdrop-blur-2xl border-cyan-500/25 shadow-glow-primary'
            : 'bg-white/80 backdrop-blur-xl border-cyan-500/20 shadow-lg',
          glassBorderClass: 'border-cyan-500/35',
          heroHeadline: isStorm ? 'Thunderstorm Convective AI' : isRain ? 'Precipitation Neural Stream' : 'Midnight AI Intelligence',
          atmosphereNote: 'Atmospheric ionosphere energized with electric cyan & violet neural data lines.',
          enableLightning: isStorm,
          rainIntensity,
          windSpeedNormalized
        };

      // 2. ARCTIC
      case 'arctic':
        return {
          themeId: 'arctic',
          conditionKey,
          particleType: isStorm ? 'lightning' : isRain ? 'rain' : 'snow',
          timeOfDay,
          bgGradient: mode === 'dark'
            ? 'bg-gradient-to-b from-[#06131f] via-[#0b2535] to-[#040d16]'
            : 'bg-gradient-to-b from-[#eaf8ff] via-[#dff6ff] to-[#bae6fd]',
          atmosphericGlow: mode === 'dark'
            ? 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.28) 0%, rgba(186, 230, 253, 0.15) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.18) 0%, rgba(186, 230, 253, 0.22) 50%, transparent 80%)',
          accentColor: '#38bdf8',
          glassPanelClass: mode === 'dark'
            ? 'bg-[#0b2535]/75 backdrop-blur-2xl border-sky-400/25'
            : 'bg-white/85 backdrop-blur-xl border-sky-400/20 shadow-md',
          glassBorderClass: 'border-sky-300/35',
          heroHeadline: isSnow ? 'Sub-Zero Arctic Snow Flurry' : 'Arctic Crystal Intelligence',
          atmosphereNote: 'Sub-zero frosted crystal surfaces with serene falling ice particles and high thermal clarity.',
          enableLightning: isStorm,
          rainIntensity,
          windSpeedNormalized
        };

      // 3. EMERALD
      case 'emerald':
        return {
          themeId: 'emerald',
          conditionKey,
          particleType: isStorm ? 'lightning' : isRain ? 'rain' : isSnow ? 'snow' : 'leaves',
          timeOfDay,
          bgGradient: mode === 'dark'
            ? 'bg-gradient-to-b from-[#02130e] via-[#06281e] to-[#010c09]'
            : 'bg-gradient-to-b from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]',
          atmosphericGlow: mode === 'dark'
            ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25) 0%, rgba(52, 211, 153, 0.15) 55%, transparent 80%)'
            : 'radial-gradient(circle at 50% 0%, rgba(5, 150, 105, 0.18) 0%, rgba(52, 211, 153, 0.14) 55%, transparent 80%)',
          accentColor: '#10b981',
          glassPanelClass: mode === 'dark'
            ? 'bg-[#06281e]/75 backdrop-blur-2xl border-emerald-500/25'
            : 'bg-white/85 backdrop-blur-xl border-emerald-500/20 shadow-md',
          glassBorderClass: 'border-emerald-400/35',
          heroHeadline: isRain ? 'Monsoon Biosphere Regeneration' : 'Emerald Biosphere Intelligence',
          atmosphereNote: 'Living chlorophyll atmosphere tuned for agricultural health, clean oxygen, and nature living.',
          enableLightning: isStorm,
          rainIntensity,
          windSpeedNormalized
        };

      // 4. VIOLET COSMOS
      case 'violet-cosmos':
        return {
          themeId: 'violet-cosmos',
          conditionKey,
          particleType: isStorm ? 'lightning' : isRain ? 'rain' : 'cosmic',
          timeOfDay,
          bgGradient: mode === 'dark'
            ? 'bg-gradient-to-b from-[#080512] via-[#120a24] to-[#05030b]'
            : 'bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
          atmosphericGlow: mode === 'dark'
            ? 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.3) 0%, rgba(217, 70, 239, 0.18) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.16) 0%, rgba(217, 70, 239, 0.12) 50%, transparent 80%)',
          accentColor: '#8b5cf6',
          glassPanelClass: mode === 'dark'
            ? 'bg-[#120a24]/75 backdrop-blur-2xl border-purple-500/25'
            : 'bg-white/85 backdrop-blur-xl border-purple-500/20 shadow-md',
          glassBorderClass: 'border-purple-400/35',
          heroHeadline: isStorm ? 'Cosmic Ion Discharge' : 'Violet Cosmos Intelligence',
          atmosphereNote: 'Deep orbital telemetry with galactic nebula dust, stellar observations, and satellite arrays.',
          enableLightning: isStorm,
          rainIntensity,
          windSpeedNormalized
        };

      // 5. SUNSET
      case 'sunset':
        return {
          themeId: 'sunset',
          conditionKey,
          particleType: isStorm ? 'lightning' : isRain ? 'rain' : 'embers',
          timeOfDay,
          bgGradient: mode === 'dark'
            ? 'bg-gradient-to-b from-[#180a08] via-[#32100b] to-[#0f0605]'
            : 'bg-gradient-to-b from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
          atmosphericGlow: mode === 'dark'
            ? 'radial-gradient(circle at 50% 0%, rgba(234, 88, 12, 0.3) 0%, rgba(251, 113, 133, 0.2) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 0%, rgba(194, 65, 12, 0.18) 0%, rgba(251, 113, 133, 0.14) 50%, transparent 80%)',
          accentColor: '#ea580c',
          glassPanelClass: mode === 'dark'
            ? 'bg-[#32100b]/75 backdrop-blur-2xl border-orange-500/25'
            : 'bg-white/85 backdrop-blur-xl border-orange-500/20 shadow-md',
          glassBorderClass: 'border-orange-400/35',
          heroHeadline: 'Sunset Horizon Intelligence',
          atmosphereNote: 'Warm golden hour atmospheric scattering with radiant dusk illumination and gentle thermals.',
          enableLightning: isStorm,
          rainIntensity,
          windSpeedNormalized
        };

      // LEGACY: AURORA
      case 'aurora':
        return {
          themeId: 'aurora',
          conditionKey,
          particleType: 'aurora',
          timeOfDay,
          bgGradient: 'bg-gradient-to-b from-[#050816] via-[#0b1329] to-[#070b19]',
          atmosphericGlow: 'radial-gradient(circle at 50% -10%, rgba(34, 211, 238, 0.22) 0%, rgba(139, 92, 246, 0.18) 40%, transparent 80%)',
          accentColor: '#22d3ee',
          glassPanelClass: 'bg-[#0b1329]/75 backdrop-blur-2xl border-cyan-500/20 shadow-glow-primary',
          glassBorderClass: 'border-cyan-500/30',
          heroHeadline: 'Cosmic Aurora Intelligence',
          atmosphereNote: 'Atmospheric ionosphere energized with electric cyan & violet magnetic waves.',
          enableLightning: conditionKey === 'storm',
          rainIntensity,
          windSpeedNormalized
        };

      // LEGACY: EARTH
      case 'earth':
        return {
          themeId: 'earth',
          conditionKey,
          particleType: 'satellite-grid',
          timeOfDay,
          bgGradient: 'bg-gradient-to-b from-[#030712] via-[#05111e] to-[#020617]',
          atmosphericGlow: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 75%)',
          accentColor: '#10b981',
          glassPanelClass: 'bg-[#05111e]/80 backdrop-blur-xl border-emerald-500/20 shadow-lg',
          glassBorderClass: 'border-emerald-500/30',
          heroHeadline: 'Earth Command Telemetry',
          atmosphereNote: 'High-resolution geospatial grid active. Synchronized with orbital satellite observations.',
          enableLightning: conditionKey === 'storm',
          rainIntensity,
          windSpeedNormalized
        };

      // LEGACY: NATURE
      case 'nature':
        return {
          themeId: 'nature',
          conditionKey,
          particleType: conditionKey === 'rain' ? 'rain' : 'sunlight',
          timeOfDay,
          bgGradient: isDay
            ? 'bg-gradient-to-b from-[#041d1a] via-[#072522] to-[#031311]'
            : 'bg-gradient-to-b from-[#021312] via-[#041a18] to-[#010a09]',
          atmosphericGlow: 'radial-gradient(circle at 50% -5%, rgba(52, 211, 153, 0.18) 0%, rgba(56, 189, 248, 0.12) 60%, transparent 85%)',
          accentColor: '#34d399',
          glassPanelClass: 'bg-[#072522]/70 backdrop-blur-xl border-emerald-400/20',
          glassBorderClass: 'border-emerald-400/30',
          heroHeadline: 'Living Nature Atmosphere',
          atmosphereNote: 'Harmonious organic atmospheric modeling tuned to natural daylight cycles.',
          enableLightning: conditionKey === 'storm',
          rainIntensity,
          windSpeedNormalized
        };

      // LEGACY: GLASS
      case 'glass':
        return {
          themeId: 'glass',
          conditionKey,
          particleType: 'none',
          timeOfDay,
          bgGradient: 'bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#020617]',
          atmosphericGlow: 'radial-gradient(circle at 50% -10%, rgba(255, 255, 255, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 80%)',
          accentColor: '#e2e8f0',
          glassPanelClass: 'bg-white/[0.04] backdrop-blur-3xl border-white/15 shadow-2xl',
          glassBorderClass: 'border-white/20',
          heroHeadline: 'Spatial Vision Glass',
          atmosphereNote: 'Ultra-clarity frosted crystal optics with dynamic specular rim illumination.',
          enableLightning: conditionKey === 'storm',
          rainIntensity,
          windSpeedNormalized
        };

      // LEGACY: LIVING WEATHER
      case 'living-weather':
      default:
        switch (conditionKey) {
          case 'storm':
            return {
              themeId: 'living-weather',
              conditionKey: 'storm',
              particleType: 'lightning',
              timeOfDay,
              bgGradient: 'bg-gradient-to-b from-[#05060f] via-[#0d0f22] to-[#04050b]',
              atmosphericGlow: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.18) 50%, transparent 80%)',
              accentColor: '#818cf8',
              glassPanelClass: 'bg-[#0d0f22]/80 backdrop-blur-xl border-indigo-500/30 shadow-lg',
              glassBorderClass: 'border-indigo-500/40 shadow-glow-primary',
              heroHeadline: 'Thunderstorm Convective Cell',
              atmosphereNote: 'Severe atmospheric instability detected with intense electrostatic charge.',
              enableLightning: true,
              rainIntensity: 90,
              windSpeedNormalized
            };

          case 'rain':
            return {
              themeId: 'living-weather',
              conditionKey: 'rain',
              particleType: 'rain',
              timeOfDay,
              bgGradient: 'bg-gradient-to-b from-[#030e1c] via-[#061933] to-[#020914]',
              atmosphericGlow: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.15) 60%, transparent 85%)',
              accentColor: '#38bdf8',
              glassPanelClass: 'bg-[#061933]/75 backdrop-blur-xl border-cyan-500/25 shadow-lg',
              glassBorderClass: 'border-cyan-500/35',
              heroHeadline: 'Active Precipitation Zone',
              atmosphereNote: 'Precipitation streaks actively sweeping through local tropospheric layer.',
              enableLightning: false,
              rainIntensity,
              windSpeedNormalized
            };

          case 'snow':
            return {
              themeId: 'living-weather',
              conditionKey: 'snow',
              particleType: 'snow',
              timeOfDay,
              bgGradient: 'bg-gradient-to-b from-[#071322] via-[#0f233d] to-[#050d18]',
              atmosphericGlow: 'radial-gradient(circle at 50% 0%, rgba(224, 242, 254, 0.22) 0%, rgba(186, 230, 253, 0.12) 60%, transparent 80%)',
              accentColor: '#bae6fd',
              glassPanelClass: 'bg-[#0f233d]/75 backdrop-blur-xl border-sky-300/25',
              glassBorderClass: 'border-sky-200/30',
              heroHeadline: 'Sub-Zero Snow Flurry',
              atmosphereNote: 'Freezing thermal profile generating light crystal deposition.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'fog':
            return {
              themeId: 'living-weather',
              conditionKey: 'fog',
              particleType: 'fog',
              timeOfDay,
              bgGradient: 'bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#090d12]',
              atmosphericGlow: 'radial-gradient(circle at 50% 20%, rgba(203, 213, 225, 0.18) 0%, transparent 70%)',
              accentColor: '#94a3b8',
              glassPanelClass: 'bg-[#161b22]/80 backdrop-blur-2xl border-slate-600/30',
              glassBorderClass: 'border-slate-500/30',
              heroHeadline: 'Low Visibility Fog Layer',
              atmosphereNote: 'Dense saturation barrier restricting ground visibility below baseline safety margin.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'sunrise':
            return {
              themeId: 'living-weather',
              conditionKey: 'sunrise',
              particleType: 'sunlight',
              timeOfDay: 'sunrise',
              bgGradient: 'bg-gradient-to-b from-[#1a0e1b] via-[#2d1527] to-[#0c0812]',
              atmosphericGlow: 'radial-gradient(circle at 50% 10%, rgba(249, 115, 22, 0.28) 0%, rgba(244, 63, 94, 0.18) 45%, transparent 75%)',
              accentColor: '#fb923c',
              glassPanelClass: 'bg-[#2d1527]/75 backdrop-blur-xl border-orange-500/25',
              glassBorderClass: 'border-orange-500/35',
              heroHeadline: 'Dawn Radiant Horizon',
              atmosphereNote: 'Solar rays breaking through low morning atmosphere with radiant peach & amber hue.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'sunset':
            return {
              themeId: 'living-weather',
              conditionKey: 'sunset',
              particleType: 'sunlight',
              timeOfDay: 'sunset',
              bgGradient: 'bg-gradient-to-b from-[#180a24] via-[#281033] to-[#0b0512]',
              atmosphericGlow: 'radial-gradient(circle at 50% 10%, rgba(217, 70, 239, 0.25) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)',
              accentColor: '#f43f5e',
              glassPanelClass: 'bg-[#281033]/75 backdrop-blur-xl border-fuchsia-500/25',
              glassBorderClass: 'border-fuchsia-500/35',
              heroHeadline: 'Twilight Golden Hour',
              atmosphereNote: 'Evening twilight transition with long spectral scattering and atmospheric calm.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'clear-night':
            return {
              themeId: 'living-weather',
              conditionKey: 'clear-night',
              particleType: 'stars',
              timeOfDay: 'night',
              bgGradient: 'bg-gradient-to-b from-[#030611] via-[#070c20] to-[#020308]',
              atmosphericGlow: 'radial-gradient(circle at 50% -10%, rgba(129, 140, 248, 0.18) 0%, rgba(56, 189, 248, 0.1) 50%, transparent 80%)',
              accentColor: '#818cf8',
              glassPanelClass: 'bg-[#070c20]/80 backdrop-blur-xl border-indigo-500/20',
              glassBorderClass: 'border-indigo-500/30',
              heroHeadline: 'Clear Celestial Night',
              atmosphereNote: 'Unobstructed starry canopy with gentle lunar atmospheric illumination.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'cloudy':
            return {
              themeId: 'living-weather',
              conditionKey: 'cloudy',
              particleType: 'none',
              timeOfDay,
              bgGradient: 'bg-gradient-to-b from-[#090f1a] via-[#111c2e] to-[#060a12]',
              atmosphericGlow: 'radial-gradient(circle at 50% 0%, rgba(148, 163, 184, 0.18) 0%, rgba(56, 189, 248, 0.1) 60%, transparent 80%)',
              accentColor: '#38bdf8',
              glassPanelClass: 'bg-[#111c2e]/75 backdrop-blur-xl border-slate-500/20',
              glassBorderClass: 'border-slate-500/30',
              heroHeadline: 'Overcast Cloud Stratum',
              atmosphereNote: 'Diffuse ambient solar radiation with layered stratus and cumulus cover.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };

          case 'clear-day':
          default:
            return {
              themeId: 'living-weather',
              conditionKey: 'clear-day',
              particleType: 'sunlight',
              timeOfDay: 'day',
              bgGradient: 'bg-gradient-to-b from-[#041026] via-[#09214a] to-[#030a17]',
              atmosphericGlow: 'radial-gradient(circle at 50% -15%, rgba(245, 158, 11, 0.24) 0%, rgba(56, 189, 248, 0.18) 45%, transparent 75%)',
              accentColor: '#f59e0b',
              glassPanelClass: 'bg-[#09214a]/75 backdrop-blur-xl border-sky-400/25',
              glassBorderClass: 'border-sky-400/35',
              heroHeadline: 'Sunny Solar Radiance',
              atmosphereNote: 'Vibrant direct solar irradiance with optimal horizontal visibility.',
              enableLightning: false,
              rainIntensity: 0,
              windSpeedNormalized
            };
        }
    }
  }
}

export const weatherMotionEngine = new WeatherMotionEngine();
