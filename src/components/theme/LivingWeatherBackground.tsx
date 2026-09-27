'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WeatherVisualState } from '@/lib/theme/types';
import { useTheme } from './ThemeContext';
import { cinematicBackgroundEngine } from '@/lib/theme/cinematic-background-engine';

interface LivingWeatherBackgroundProps {
  visualState: WeatherVisualState;
}

export function LivingWeatherBackground({ visualState }: LivingWeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightningActive, setLightningActive] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const { theme, resolvedMode, motion, weatherEffects } = useTheme();

  // Check system reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setSystemReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const isMotionSuppressed = useMemo(() => {
    if (motion === 'reduced') return true;
    if (motion === 'full') return false;
    return systemReducedMotion;
  }, [motion, systemReducedMotion]);

  const areWeatherEffectsEnabled = useMemo(() => {
    if (weatherEffects === 'disabled') return false;
    return true;
  }, [weatherEffects]);

  // Compute cinematic environment parameters
  const cinematicConfig = useMemo(() => {
    return cinematicBackgroundEngine.buildEnvironment({
      themeId: theme,
      forcedTimeOfDay: visualState.timeOfDay
    });
  }, [theme, visualState.timeOfDay]);

  // Lightning periodic generator for storm conditions
  useEffect(() => {
    const shouldFlash = visualState.enableLightning || cinematicConfig.enableLightning;
    if (!shouldFlash || isMotionSuppressed || !areWeatherEffectsEnabled) return;

    let timeoutId: NodeJS.Timeout;
    const triggerLightning = () => {
      setLightningActive(true);
      setTimeout(() => {
        setLightningActive(false);
        // Double flash micro-strike
        setTimeout(() => {
          setLightningActive(true);
          setTimeout(() => setLightningActive(false), 90);
        }, 120);
      }, 150);

      const nextDelay = Math.random() * 12000 + 7000;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    timeoutId = setTimeout(triggerLightning, 5000);
    return () => clearTimeout(timeoutId);
  }, [visualState.enableLightning, cinematicConfig.enableLightning, isMotionSuppressed, areWeatherEffectsEnabled]);

  // Dynamic Particle Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMotionSuppressed || !areWeatherEffectsEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (isPaused) {
          isPaused = false;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const isMobile = window.innerWidth < 640;
    const countMultiplier = isMobile ? 0.45 : 1.0;
    
    // Choose particle type based on weather and theme
    const activeParticleType = visualState.particleType !== 'none' 
      ? visualState.particleType 
      : cinematicConfig.particleType;

    const baseCount = activeParticleType === 'rain' ? 85 :
                      activeParticleType === 'snow' ? 50 :
                      activeParticleType === 'stars' || activeParticleType === 'cosmic' ? 65 :
                      activeParticleType === 'leaves' ? 30 :
                      activeParticleType === 'embers' ? 35 :
                      activeParticleType === 'dust' ? 40 :
                      activeParticleType === 'sunlight' ? 35 :
                      activeParticleType === 'aurora' ? 25 : 30;

    const particleCount = Math.max(12, Math.round(baseCount * countMultiplier));

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulseSpeed?: number;
      length?: number;
      rotation?: number;
      rotationSpeed?: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: activeParticleType === 'rain' ? Math.random() * 12 + 10 :
            activeParticleType === 'snow' ? Math.random() * 1.5 + 0.8 :
            activeParticleType === 'leaves' ? Math.random() * 1.2 + 0.6 :
            activeParticleType === 'embers' ? -Math.random() * 0.9 - 0.3 :
            activeParticleType === 'dust' ? (Math.random() - 0.5) * 0.4 :
            activeParticleType === 'sunlight' ? -Math.random() * 0.6 - 0.2 :
            (Math.random() - 0.5) * 0.25,
        size: activeParticleType === 'rain' ? 1.5 :
              activeParticleType === 'snow' ? Math.random() * 3 + 1.5 :
              activeParticleType === 'leaves' ? Math.random() * 4 + 2.5 :
              activeParticleType === 'embers' ? Math.random() * 2.5 + 1 :
              activeParticleType === 'dust' ? Math.random() * 2.2 + 0.8 :
              activeParticleType === 'stars' || activeParticleType === 'cosmic' ? Math.random() * 2 + 0.8 :
              activeParticleType === 'sunlight' ? Math.random() * 3 + 1 : 2,
        alpha: Math.random() * 0.6 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        length: Math.random() * 16 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. RAIN
      if (activeParticleType === 'rain') {
        ctx.strokeStyle = resolvedMode === 'dark' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.55)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + (p.length || 15));

          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();
      } 
      // 2. SNOW
      else if (activeParticleType === 'snow') {
        ctx.fillStyle = resolvedMode === 'dark' ? 'rgba(224, 242, 254, 0.75)' : 'rgba(14, 165, 233, 0.45)';
        for (let p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.02) * 0.6;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      } 
      // 3. LEAVES / BIOSPHERE
      else if (activeParticleType === 'leaves') {
        for (let p of particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) {
            p.rotation += (p.rotationSpeed || 0.02);
            ctx.rotate(p.rotation);
          }
          ctx.fillStyle = resolvedMode === 'dark' 
            ? `rgba(52, 211, 153, ${p.alpha * 0.6})` 
            : `rgba(5, 150, 105, ${p.alpha * 0.5})`;
          
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.03) * 0.8;

          if (p.y > height) {
            p.y = -15;
            p.x = Math.random() * width;
          }
        }
      }
      // 4. EMBERS / SUNSET
      else if (activeParticleType === 'embers') {
        for (let p of particles) {
          ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha * 0.7})`;
          ctx.shadowColor = 'rgba(234, 88, 12, 0.6)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.02) * 0.5;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
        ctx.shadowBlur = 0;
      }
      // 5. STARS / COSMIC
      else if (activeParticleType === 'stars' || activeParticleType === 'cosmic') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = Math.abs(Math.sin(p.alpha)) * 0.7 + 0.2;
          
          ctx.fillStyle = activeParticleType === 'cosmic'
            ? `rgba(192, 132, 252, ${currentAlpha})`
            : `rgba(248, 250, 252, ${currentAlpha})`;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 6. DUST / DESERT
      else if (activeParticleType === 'dust') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        for (let p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += Math.cos(p.y * 0.01) * 0.4 + 0.3;
          p.y += (Math.random() - 0.5) * 0.2;

          if (p.x > width) p.x = -10;
        }
      }
      // 7. SUNLIGHT MOTES
      else if (activeParticleType === 'sunlight') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = Math.abs(Math.sin(p.alpha)) * 0.5 + 0.15;
          ctx.fillStyle = `rgba(253, 224, 71, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visualState.particleType, cinematicConfig.particleType, isMotionSuppressed, areWeatherEffectsEnabled, resolvedMode, theme]);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden select-none transition-colors duration-700">
      {/* ============================================================== */}
      {/* LAYER 1: CINEMATIC HORIZON & MOUNTAIN SCENERY                   */}
      {/* ============================================================== */}
      
      {/* Sky Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cinematicConfig.skyGradient} transition-all duration-700`} />

      {/* Atmospheric Horizon Light */}
      <div 
        className="absolute inset-0 transition-all duration-700 opacity-90 pointer-events-none"
        style={{ background: cinematicConfig.atmosphericGlow }}
      />

      {/* Celestial Light: Sun / Moon with dynamic atmospheric halo */}
      <div 
        className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-2xl transition-all duration-1000 pointer-events-none opacity-40 animate-pulse-slow"
        style={{
          top: cinematicConfig.sunMoonPosition.top,
          right: cinematicConfig.sunMoonPosition.right,
          background: cinematicConfig.sunMoonPosition.glow
        }}
      />

      {/* Mountain Silhouettes: Layered depth parallax */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] sm:h-[46vh] pointer-events-none overflow-hidden opacity-30">
        <svg 
          viewBox="0 0 1440 480" 
          fill="none" 
          preserveAspectRatio="none" 
          className="w-full h-full text-[var(--background-secondary)] transition-colors duration-700"
        >
          {/* Back distant peaks */}
          <path 
            d="M0 320 L180 240 L380 340 L580 210 L760 300 L980 180 L1180 290 L1360 220 L1440 270 L1440 480 L0 480 Z" 
            fill="currentColor" 
            opacity="0.35"
          />
          {/* Mid mountain ridge */}
          <path 
            d="M0 370 L140 310 L320 400 L540 280 L720 380 L920 270 L1120 370 L1320 300 L1440 350 L1440 480 L0 480 Z" 
            fill="currentColor" 
            opacity="0.6"
          />
          {/* Foreground rolling foothills */}
          <path 
            d="M0 420 Q240 360 480 430 T960 410 T1440 430 L1440 480 L0 480 Z" 
            fill="currentColor" 
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* LAYER 2: VOLUMETRIC DRIFTING CLOUDS                            */}
      {/* ============================================================== */}
      {!isMotionSuppressed && areWeatherEffectsEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700"
          style={{ opacity: cinematicConfig.cloudOpacity }}
        >
          <div className="absolute top-[8%] -left-[20%] w-[140%] h-[35%] rounded-[100%] bg-gradient-to-r from-transparent via-slate-400/25 to-transparent blur-3xl animate-cloud-drift" />
          <div className="absolute top-[22%] -right-[15%] w-[130%] h-[30%] rounded-[100%] bg-gradient-to-l from-transparent via-slate-500/20 to-transparent blur-3xl animate-cloud-drift" style={{ animationDelay: '-30s' }} />
        </div>
      )}

      {/* ============================================================== */}
      {/* LAYER 3: THEME COLOR GLOW WAVES (Aurora, Cosmic, Sunset, Ocean)*/}
      {/* ============================================================== */}
      
      {/* Aurora Sky & Midnight AI ribbon waves */}
      {(theme === 'aurora-sky' || theme === 'aurora' || theme === 'midnight-ai') && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -top-[25%] -left-[15%] w-[130%] h-[75%] rounded-full bg-gradient-to-r from-cyan-500/25 via-emerald-400/20 to-violet-600/25 blur-3xl animate-aurora-flow" />
          <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[65%] rounded-full bg-gradient-to-l from-violet-500/25 via-cyan-400/20 to-teal-400/15 blur-3xl animate-float" />
        </div>
      )}

      {/* Violet Cosmos nebula dust */}
      {theme === 'violet-cosmos' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <div className="absolute -top-[20%] -right-[10%] w-[120%] h-[70%] rounded-full bg-gradient-to-r from-purple-600/25 via-fuchsia-500/20 to-indigo-600/25 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-[15%] -left-[10%] w-[120%] h-[60%] rounded-full bg-gradient-to-tr from-violet-700/30 via-pink-500/20 to-transparent blur-3xl animate-float" />
        </div>
      )}

      {/* Sunset warm horizon haze */}
      {theme === 'sunset' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-[15%] -left-[10%] w-[120%] h-[55%] rounded-full bg-gradient-to-r from-orange-600/30 via-amber-500/25 to-rose-600/25 blur-3xl animate-float" />
        </div>
      )}

      {/* Ocean Pulse coastal marine glow */}
      {theme === 'ocean-pulse' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <div className="absolute bottom-[5%] -left-[10%] w-[120%] h-[50%] rounded-full bg-gradient-to-r from-cyan-600/25 via-teal-500/25 to-sky-700/20 blur-3xl animate-float" />
        </div>
      )}

      {/* Desert Glow solar haze */}
      {theme === 'desert-glow' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <div className="absolute top-[20%] -right-[10%] w-[120%] h-[60%] rounded-full bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-600/25 blur-3xl animate-pulse-slow" />
        </div>
      )}

      {/* Storm Core tempest squall aura */}
      {theme === 'storm-core' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-45">
          <div className="absolute -top-[15%] -left-[10%] w-[120%] h-[70%] rounded-full bg-gradient-to-r from-indigo-900/35 via-blue-900/30 to-purple-950/35 blur-3xl animate-pulse-slow" />
        </div>
      )}

      {/* Fog/Mist Horizontal Layer */}
      {visualState.conditionKey === 'fog' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 -left-1/2 w-[200%] h-64 bg-gradient-to-r from-transparent via-slate-300/25 to-transparent blur-2xl animate-float" />
          <div className="absolute top-2/3 -right-1/2 w-[200%] h-80 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      )}

      {/* Lightning Flash Screen Illumination */}
      {lightningActive && (
        <div className="absolute inset-0 bg-indigo-100/35 backdrop-blur-[1px] transition-opacity duration-75 z-10" />
      )}

      {/* ============================================================== */}
      {/* LAYER 4: DYNAMIC PARTICLES CANVAS (Rain, Snow, Stars, Embers)  */}
      {/* ============================================================== */}
      {!isMotionSuppressed && areWeatherEffectsEnabled && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* ============================================================== */}
      {/* LAYER 5: CONTRAST READABILITY BARRIER (WCAG AAA Compliance)    */}
      {/* ============================================================== */}
      <div 
        className={`absolute inset-0 transition-all duration-700 pointer-events-none ${
          resolvedMode === 'dark' 
            ? 'bg-slate-950/65 backdrop-blur-[1.5px]' 
            : 'bg-white/55 backdrop-blur-[1.5px]'
        }`} 
      />
    </div>
  );
}
