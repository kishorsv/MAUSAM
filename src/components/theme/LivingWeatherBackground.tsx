'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WeatherVisualState } from '@/lib/theme/types';
import { useTheme } from './ThemeContext';

interface LivingWeatherBackgroundProps {
  visualState: WeatherVisualState;
}

export function LivingWeatherBackground({ visualState }: LivingWeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightningActive, setLightningActive] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const { theme, resolvedMode, motion, weatherEffects } = useTheme();

  // Check user system reduced motion preference
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

  // Lightning periodic flash generator
  useEffect(() => {
    if (!visualState.enableLightning || isMotionSuppressed || !areWeatherEffectsEnabled) return;

    let timeoutId: NodeJS.Timeout;
    const triggerLightning = () => {
      setLightningActive(true);
      setTimeout(() => {
        setLightningActive(false);
        // Double flash effect
        setTimeout(() => {
          setLightningActive(true);
          setTimeout(() => setLightningActive(false), 90);
        }, 120);
      }, 150);

      // Schedule next random flash between 8s and 20s
      const nextDelay = Math.random() * 12000 + 8000;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    timeoutId = setTimeout(triggerLightning, 6000);
    return () => clearTimeout(timeoutId);
  }, [visualState.enableLightning, isMotionSuppressed, areWeatherEffectsEnabled]);

  // Dynamic Particle Engine on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMotionSuppressed || !areWeatherEffectsEnabled || visualState.particleType === 'none') return;

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
    const countMultiplier = isMobile ? 0.5 : 1.0;
    const baseCount = visualState.particleType === 'rain' ? 80 :
                      visualState.particleType === 'snow' ? 50 :
                      visualState.particleType === 'stars' || visualState.particleType === 'cosmic' ? 70 :
                      visualState.particleType === 'leaves' ? 30 :
                      visualState.particleType === 'embers' ? 35 :
                      visualState.particleType === 'sunlight' ? 35 :
                      visualState.particleType === 'aurora' ? 25 : 30;
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
      color?: string;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: visualState.particleType === 'rain' ? Math.random() * 12 + 10 :
            visualState.particleType === 'snow' ? Math.random() * 1.5 + 0.8 :
            visualState.particleType === 'leaves' ? Math.random() * 1.2 + 0.6 :
            visualState.particleType === 'embers' ? -Math.random() * 0.8 - 0.3 :
            visualState.particleType === 'sunlight' ? -Math.random() * 0.6 - 0.2 :
            (Math.random() - 0.5) * 0.25,
        size: visualState.particleType === 'rain' ? 1.5 :
              visualState.particleType === 'snow' ? Math.random() * 3 + 1.5 :
              visualState.particleType === 'leaves' ? Math.random() * 4 + 2.5 :
              visualState.particleType === 'embers' ? Math.random() * 2.5 + 1 :
              visualState.particleType === 'stars' || visualState.particleType === 'cosmic' ? Math.random() * 2 + 0.8 :
              visualState.particleType === 'sunlight' ? Math.random() * 3 + 1 : 2,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        length: Math.random() * 15 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. RAIN
      if (visualState.particleType === 'rain') {
        ctx.strokeStyle = resolvedMode === 'dark' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.55)';
        ctx.lineWidth = 1.2;
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
      // 2. SNOW / ARCTIC
      else if (visualState.particleType === 'snow') {
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
      // 3. LEAVES / EMERALD BIOSPHERE
      else if (visualState.particleType === 'leaves') {
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
          
          // Draw leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.015) * 0.8;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
      } 
      // 4. EMBERS / SUNSET
      else if (visualState.particleType === 'embers') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = (Math.sin(p.alpha) + 1) * 0.35 + 0.2;
          ctx.fillStyle = resolvedMode === 'dark' 
            ? `rgba(249, 115, 22, ${currentAlpha * 0.65})` 
            : `rgba(234, 88, 12, ${currentAlpha * 0.5})`;
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
      } 
      // 5. STARS & VIOLET COSMOS
      else if (visualState.particleType === 'stars' || visualState.particleType === 'cosmic') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = (Math.sin(p.alpha) + 1) * 0.35 + 0.15;
          ctx.fillStyle = theme === 'violet-cosmos'
            ? `rgba(217, 70, 239, ${currentAlpha * 0.7})`
            : `rgba(224, 231, 255, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw delicate orbital telemetry sweep lines for Violet Cosmos
        if (theme === 'violet-cosmos') {
          const time = Date.now() * 0.0003;
          const centerX = width * 0.85;
          const centerY = height * 0.18;

          ctx.strokeStyle = 'rgba(139, 92, 246, 0.10)';
          ctx.lineWidth = 1;
          for (let r = 70; r <= 280; r += 70) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Sweeping radar beam
          ctx.strokeStyle = 'rgba(217, 70, 239, 0.15)';
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(time) * 280,
            centerY + Math.sin(time) * 280
          );
          ctx.stroke();
        }
      } 
      // 6. SUNLIGHT
      else if (visualState.particleType === 'sunlight') {
        for (let p of particles) {
          ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.01) * 0.3;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      } 
      // 7. SATELLITE GRID (EARTH LEGACY)
      else if (visualState.particleType === 'satellite-grid') {
        const time = Date.now() * 0.0005;
        const centerX = width * 0.8;
        const centerY = height * 0.2;

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 1;
        for (let r = 80; r <= 320; r += 80) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(time) * 320,
          centerY + Math.sin(time) * 320
        );
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visualState.particleType, isMotionSuppressed, areWeatherEffectsEnabled, resolvedMode, theme]);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden transition-colors duration-700">
      {/* 1. Underlying Atmospheric Background Gradient */}
      <div className={`absolute inset-0 ${visualState.bgGradient} transition-all duration-700`} />

      {/* 2. Radial Atmospheric Illumination Layer */}
      <div
        className="absolute inset-0 transition-all duration-700 opacity-90"
        style={{ background: visualState.atmosphericGlow }}
      />

      {/* 3. Midnight AI Aurora Waves */}
      {(theme === 'midnight-ai' || visualState.themeId === 'aurora') && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <div className="absolute -top-[30%] -left-[20%] w-[140%] h-[80%] rounded-full bg-gradient-to-r from-cyan-500/20 via-primary-500/25 to-violet-600/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[70%] rounded-full bg-gradient-to-l from-violet-500/20 via-cyan-400/25 to-emerald-400/15 blur-3xl animate-float" />
        </div>
      )}

      {/* 4. Violet Cosmos Cosmic Waves */}
      {theme === 'violet-cosmos' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-[25%] -right-[15%] w-[130%] h-[75%] rounded-full bg-gradient-to-r from-purple-600/20 via-fuchsia-500/20 to-indigo-600/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[60%] rounded-full bg-gradient-to-tr from-violet-700/25 via-pink-500/15 to-transparent blur-3xl animate-float" />
        </div>
      )}

      {/* 5. Sunset Horizon Glow Waves */}
      {theme === 'sunset' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <div className="absolute top-[10%] -left-[10%] w-[120%] h-[60%] rounded-full bg-gradient-to-r from-orange-600/25 via-amber-500/20 to-rose-600/20 blur-3xl animate-float" />
        </div>
      )}

      {/* 6. Fog/Mist Horizontal Drift */}
      {visualState.conditionKey === 'fog' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-1/4 -left-1/2 w-[200%] h-64 bg-gradient-to-r from-transparent via-slate-300/20 to-transparent blur-2xl animate-float" />
          <div className="absolute top-1/2 -right-1/2 w-[200%] h-80 bg-gradient-to-r from-transparent via-slate-400/15 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      )}

      {/* 7. Lightning Flash Screen Overlay */}
      {lightningActive && (
        <div className="absolute inset-0 bg-indigo-200/25 backdrop-blur-[1px] transition-opacity duration-75 z-10" />
      )}

      {/* 8. Dynamic Particles Canvas */}
      {visualState.particleType !== 'none' && !isMotionSuppressed && areWeatherEffectsEnabled && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* 9. Contrast Barrier for WCAG AAA Accessibility */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        resolvedMode === 'dark' 
          ? 'bg-slate-950/60 backdrop-blur-[1.5px]' 
          : 'bg-white/50 backdrop-blur-[1px]'
      }`} />
    </div>
  );
}
