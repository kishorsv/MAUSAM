import { WeatherPayload } from "../weather/types";
import { ThemeId, WeatherConditionKey, ParticleType, WeatherVisualState } from "./types";

export class WeatherMotionEngine {
  /**
   * Deterministically calculates the visual atmosphere state given live weather data and theme preference
   */
  calculateVisualState(weather: WeatherPayload | null, themeId: ThemeId = 'living-weather'): WeatherVisualState {
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

    // 3. Assemble Visual State according to active Theme
    switch (themeId) {
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

      case 'living-weather':
      default:
        // Living weather reacts directly to the exact weather condition
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
