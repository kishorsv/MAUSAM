'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WeatherVisualState } from '@/lib/theme/types';
import { useTheme } from './ThemeContext';
import { weatherSceneController, WeatherSceneControllerState } from '@/lib/theme/weather-scene-controller';
import { SceneryBackdrop } from './SceneryBackdrop';

interface LivingWeatherBackgroundProps {
  visualState?: WeatherVisualState;
}

export function LivingWeatherBackground({ visualState: propVisualState }: LivingWeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightningActive, setLightningActive] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [controllerState, setControllerState] = useState<WeatherSceneControllerState>(() => weatherSceneController.getState());
  const { theme, resolvedMode, motion, weatherEffects } = useTheme();

  // Subscribe to WeatherSceneController for real-time dynamic scene transitions
  useEffect(() => {
    const unsubscribe = weatherSceneController.subscribe((state) => {
      setControllerState(state);
    });
    return unsubscribe;
  }, []);

  // Sync theme changes with WeatherSceneController
  useEffect(() => {
    weatherSceneController.setTheme(theme);
  }, [theme]);

  // Check system reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setSystemReducedMotion(motionQuery.matches);
      const listener = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
      motionQuery.addEventListener('change', listener);
      return () => motionQuery.removeEventListener('change', listener);
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

  const activeScene = controllerState.currentScene;
  const previousScene = controllerState.previousScene;
  const isTransitioning = controllerState.isTransitioning;

  // Double-flash lightning trigger for thunderstorm conditions
  useEffect(() => {
    const isStorm = activeScene.sceneId === 'storm' || (propVisualState && propVisualState.enableLightning);
    if (!isStorm || isMotionSuppressed || !areWeatherEffectsEnabled) return;

    let timeoutId: NodeJS.Timeout;
    const triggerLightning = () => {
      setLightningActive(true);
      setTimeout(() => {
        setLightningActive(false);
        // Secondary lightning pulse
        setTimeout(() => {
          setLightningActive(true);
          setTimeout(() => setLightningActive(false), 90);
        }, 110);
      }, 140);

      const nextDelay = Math.random() * 10000 + 6000;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    timeoutId = setTimeout(triggerLightning, 4000);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene.sceneId, propVisualState?.enableLightning, isMotionSuppressed, areWeatherEffectsEnabled]);

  // Dynamic Particle Canvas Engine (Rain, Snow, Lightning, Dust, Marine Foam, Aurora, Embers)
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

    const particleConfig = activeScene.particles;
    const count = particleConfig.count;
    const type = particleConfig.type;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      length?: number;
      pulseSpeed?: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: type === 'rain' || type === 'lightning' ? (Math.random() - 0.5) * 1.5 - 1 : (Math.random() - 0.5) * 0.8,
        vy: type === 'rain' || type === 'lightning' 
          ? Math.random() * 12 + 10 
          : type === 'snow' 
          ? Math.random() * 1.5 + 0.8 
          : type === 'marine-foam'
          ? (Math.random() - 0.5) * 2
          : Math.random() * 0.5 + 0.2,
        size: type === 'rain' || type === 'lightning' 
          ? Math.random() * 1.5 + 1 
          : type === 'snow' 
          ? Math.random() * 3 + 1.5 
          : Math.random() * 2 + 0.8,
        length: type === 'rain' || type === 'lightning' ? Math.random() * 24 + 14 : undefined,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. RAIN & STORM
      if (type === 'rain' || type === 'lightning') {
        ctx.strokeStyle = resolvedMode === 'dark' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (let p of particles) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + (p.length || 20));
          ctx.stroke();

          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
        }
      } 
      // 2. SNOW
      else if (type === 'snow') {
        ctx.fillStyle = resolvedMode === 'dark' ? 'rgba(224, 242, 254, 0.75)' : 'rgba(186, 230, 253, 0.85)';
        for (let p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.02) * 0.7;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      } 
      // 3. AURORA / CELESTIAL
      else if (type === 'aurora') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = Math.abs(Math.sin(p.alpha)) * 0.6 + 0.2;
          ctx.fillStyle = `rgba(34, 211, 238, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += Math.sin(p.y * 0.005) * 0.3;
          p.y += 0.2;
          if (p.y > height) p.y = 0;
        }
      } 
      // 4. EMBERS & DUST
      else if (type === 'embers' || type === 'dust') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = Math.abs(Math.sin(p.alpha)) * 0.5 + 0.2;
          ctx.fillStyle = type === 'embers' 
            ? `rgba(249, 115, 22, ${currentAlpha})` 
            : `rgba(251, 191, 36, ${currentAlpha})`;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y -= 0.4;
          p.x += Math.cos(p.y * 0.01) * 0.3;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }
      // 5. MARINE FOAM
      else if (type === 'marine-foam') {
        for (let p of particles) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += Math.sin(p.x * 0.02) * 0.5;
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
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
  }, [activeScene.particles, isMotionSuppressed, areWeatherEffectsEnabled, resolvedMode]);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden select-none transition-colors duration-700">
      {/* ============================================================== */}
      {/* LAYER 1: CINEMATIC HORIZON & SCENERY (Smooth 1200ms Crossfade)  */}
      {/* ============================================================== */}

      {/* PREVIOUS SCENE LAYER (Fading out when transitioning) */}
      {previousScene && isTransitioning && (
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-b ${previousScene.lighting.skyGradient}`} />
          <div 
            className="absolute inset-0"
            style={{ background: previousScene.lighting.atmosphericGlow }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[38vh] sm:h-[46vh] pointer-events-none overflow-hidden opacity-30">
            <SceneryBackdrop type={previousScene.backgroundScene.backdropSvgType} />
          </div>
        </div>
      )}

      {/* ACTIVE SCENE LAYER (Current visual world) */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100"
        style={{
          filter: `contrast(${activeScene.colorGrade.contrast}) brightness(${activeScene.colorGrade.brightness}) saturate(${activeScene.colorGrade.saturate})`
        }}
      >
        {/* Sky Base Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${activeScene.lighting.skyGradient} transition-all duration-700`} />

        {/* Atmospheric Horizon Light */}
        <div 
          className="absolute inset-0 transition-all duration-700 opacity-90 pointer-events-none"
          style={{ background: activeScene.lighting.atmosphericGlow }}
        />

        {/* Celestial Light: Sun / Moon with dynamic atmospheric halo */}
        {activeScene.sunAnimation.active && (
          <div 
            className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-2xl transition-all duration-1000 pointer-events-none opacity-40 animate-pulse-slow"
            style={{
              top: activeScene.sunAnimation.position.top,
              right: activeScene.sunAnimation.position.right || '25%',
              background: activeScene.sunAnimation.glow
            }}
          />
        )}

        {/* Vector Scenery Backdrop (Mountains, Farmland, Trail, Ocean, Orbit, Radar) */}
        <div className="absolute inset-x-0 bottom-0 h-[38vh] sm:h-[46vh] pointer-events-none overflow-hidden opacity-35">
          <SceneryBackdrop type={activeScene.backgroundScene.backdropSvgType} />
        </div>
      </div>

      {/* ============================================================== */}
      {/* LAYER 2: VOLUMETRIC DRIFTING CLOUDS                            */}
      {/* ============================================================== */}
      {activeScene.cloudAnimation.active && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000"
          style={{ opacity: activeScene.cloudAnimation.opacity }}
        >
          <div 
            className="absolute top-[8%] -left-[20%] w-[140%] h-[35%] rounded-[100%] bg-gradient-to-r from-transparent via-slate-400/25 to-transparent blur-3xl animate-cloud-drift" 
            style={{ animationDuration: activeScene.cloudAnimation.speed }}
          />
          <div 
            className="absolute top-[22%] -right-[15%] w-[130%] h-[30%] rounded-[100%] bg-gradient-to-l from-transparent via-slate-500/20 to-transparent blur-3xl animate-cloud-drift" 
            style={{ animationDuration: activeScene.cloudAnimation.speed, animationDelay: '-30s' }} 
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* LAYER 3: LIGHTNING DOUBLE FLASH ILLUMINATION                  */}
      {/* ============================================================== */}
      {lightningActive && (
        <div className="absolute inset-0 bg-indigo-100/35 backdrop-blur-[1px] transition-opacity duration-75 z-10" />
      )}

      {/* ============================================================== */}
      {/* LAYER 4: DYNAMIC PARTICLES CANVAS (Rain, Snow, Foam, Embers)  */}
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
