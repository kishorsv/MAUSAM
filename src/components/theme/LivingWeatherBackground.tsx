'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WeatherVisualState } from '@/lib/theme/types';

interface LivingWeatherBackgroundProps {
  visualState: WeatherVisualState;
}

export function LivingWeatherBackground({ visualState }: LivingWeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightningActive, setLightningActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check user system reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Lightning periodic flash generator
  useEffect(() => {
    if (!visualState.enableLightning || reducedMotion) return;

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
  }, [visualState.enableLightning, reducedMotion]);

  // Particle Engine on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion || visualState.particleType === 'none') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = visualState.particleType === 'rain' ? 80 :
                          visualState.particleType === 'snow' ? 50 :
                          visualState.particleType === 'stars' ? 70 :
                          visualState.particleType === 'sunlight' ? 35 :
                          visualState.particleType === 'aurora' ? 25 : 30;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulseSpeed?: number;
      length?: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: visualState.particleType === 'rain' ? Math.random() * 12 + 10 :
            visualState.particleType === 'snow' ? Math.random() * 1.5 + 0.8 :
            visualState.particleType === 'sunlight' ? -Math.random() * 0.6 - 0.2 :
            (Math.random() - 0.5) * 0.2,
        size: visualState.particleType === 'rain' ? 1.5 :
              visualState.particleType === 'snow' ? Math.random() * 3 + 1.5 :
              visualState.particleType === 'stars' ? Math.random() * 2 + 0.8 :
              visualState.particleType === 'sunlight' ? Math.random() * 3 + 1 : 2,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        length: Math.random() * 15 + 10
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render specific particle types
      if (visualState.particleType === 'rain') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
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
      } else if (visualState.particleType === 'snow') {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
        for (let p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.vy;
          p.x += Math.sin(p.y * 0.02) * 0.5;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      } else if (visualState.particleType === 'stars') {
        for (let p of particles) {
          p.alpha += (p.pulseSpeed || 0.02);
          const currentAlpha = (Math.sin(p.alpha) + 1) * 0.35 + 0.15;
          ctx.fillStyle = `rgba(224, 231, 255, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (visualState.particleType === 'sunlight') {
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
      } else if (visualState.particleType === 'satellite-grid') {
        // Draw delicate orbital telemetry sweep lines
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

        // Sweeping radar arm
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
    };
  }, [visualState.particleType, reducedMotion]);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden transition-colors duration-1000">
      {/* 1. Underlying Atmospheric Background Gradient */}
      <div className={`absolute inset-0 ${visualState.bgGradient} transition-all duration-1000`} />

      {/* 2. Radial Atmospheric Illumination Layer */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-90"
        style={{ background: visualState.atmosphericGlow }}
      />

      {/* 3. Aurora Flowing Waves (when theme === 'aurora') */}
      {visualState.themeId === 'aurora' && !reducedMotion && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -top-[30%] -left-[20%] w-[140%] h-[80%] rounded-full bg-gradient-to-r from-cyan-500/20 via-primary-500/25 to-violet-600/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[70%] rounded-full bg-gradient-to-l from-violet-500/20 via-cyan-400/25 to-emerald-400/15 blur-3xl animate-float" />
        </div>
      )}

      {/* 4. Fog/Mist Horizontal Drift (when condition === 'fog') */}
      {visualState.conditionKey === 'fog' && !reducedMotion && (
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-1/4 -left-1/2 w-[200%] h-64 bg-gradient-to-r from-transparent via-slate-300/20 to-transparent blur-2xl animate-float" />
          <div className="absolute top-1/2 -right-1/2 w-[200%] h-80 bg-gradient-to-r from-transparent via-slate-400/15 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      )}

      {/* 5. Lightning Flash Screen Overlay */}
      {lightningActive && (
        <div className="absolute inset-0 bg-indigo-200/20 backdrop-blur-[1px] transition-opacity duration-75 z-10" />
      )}

      {/* 6. Dynamic Particles Canvas */}
      {visualState.particleType !== 'none' && !reducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* 7. Deep Translucent Contrast Barrier (Ensures WCAG AAA Accessibility) */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
    </div>
  );
}
