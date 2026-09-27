'use client';

import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'elevated' | 'card' | 'interactive' | 'hero' | 'alert';
  glow?: boolean | 'primary' | 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose';
  hoverEffect?: boolean;
  innerHighlight?: boolean;
  as?: React.ElementType;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  {
    children,
    className = '',
    variant = 'default',
    glow = false,
    hoverEffect = false,
    innerHighlight = true,
    as: Component = 'div',
    style,
    ...props
  },
  ref
) {
  // Base glass styles
  let variantClasses = '';
  switch (variant) {
    case 'subtle':
      variantClasses = 'bg-[var(--surface)] backdrop-blur-md border border-[var(--border-subtle)]';
      break;
    case 'elevated':
      variantClasses = 'bg-[var(--surface-elevated)] backdrop-blur-2xl border border-[var(--border)] shadow-2xl';
      break;
    case 'card':
      variantClasses = 'bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl';
      break;
    case 'hero':
      variantClasses = 'bg-[var(--surface-glass)] backdrop-blur-2xl border border-[var(--border)] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]';
      break;
    case 'alert':
      variantClasses = 'bg-[var(--surface-glass)] backdrop-blur-xl border border-rose-500/30 shadow-lg';
      break;
    case 'interactive':
      variantClasses = 'bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border)] shadow-lg hover:border-[var(--primary)] hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-[0.99]';
      break;
    case 'default':
    default:
      variantClasses = 'bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border)] shadow-xl';
      break;
  }

  // Theme-aware glow accent classes
  let glowClasses = '';
  if (glow === true || glow === 'primary') {
    glowClasses = 'shadow-[var(--glow)]';
  } else if (glow === 'cyan') {
    glowClasses = 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.35)]';
  } else if (glow === 'purple') {
    glowClasses = 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.35)]';
  } else if (glow === 'amber') {
    glowClasses = 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.35)]';
  } else if (glow === 'emerald') {
    glowClasses = 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)]';
  } else if (glow === 'rose') {
    glowClasses = 'shadow-[0_0_30px_-5px_rgba(251,113,133,0.35)]';
  }

  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-0.5 hover:shadow-2xl hover:border-[var(--primary)] transition-all duration-300'
    : '';

  return (
    <Component
      ref={ref}
      className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${variantClasses} ${glowClasses} ${hoverClasses} ${className}`}
      style={{
        boxShadow: glowClasses ? undefined : 'var(--shadow)',
        ...style
      }}
      {...props}
    >
      {/* Subtle top inner reflection / specular highlight */}
      {innerHighlight && (
        <div 
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />
      )}

      {children}
    </Component>
  );
});
