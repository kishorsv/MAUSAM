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

export const GlassCard = React.forwardRef<HTMLDivElement, GlassPanelProps>(function GlassCard(props, ref) {
  return <GlassPanel ref={ref} variant="card" hoverEffect {...props} />;
});

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(function GlassButton(
  {
    children,
    className = '',
    variant = 'secondary',
    size = 'md',
    glow = false,
    disabled = false,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-2xl',
    lg: 'px-6 py-3.5 text-base rounded-2xl'
  }[size];

  const variantClasses = {
    primary: 'bg-[var(--primary)] text-white hover:brightness-110 border border-[var(--primary)]/50 shadow-md',
    secondary: 'bg-white/10 hover:bg-white/15 text-[var(--foreground)] border border-white/10 hover:border-white/25 shadow-sm',
    ghost: 'bg-transparent hover:bg-white/10 text-[var(--foreground)] border border-transparent hover:border-white/10',
    danger: 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
  }[variant];

  const glowClass = glow ? 'shadow-[var(--glow)]' : '';

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-bold tracking-tight backdrop-blur-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(function GlassInput(
  { className = '', icon, ...props },
  ref
) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-[var(--primary)] focus:bg-white/10 text-[var(--foreground)] placeholder-slate-400 backdrop-blur-xl outline-none transition-all duration-200 text-sm ${
          icon ? 'pl-10 pr-4' : 'px-4'
        } ${className}`}
        {...props}
      />
    </div>
  );
});

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlassModal({ isOpen, onClose, title, children, className = '' }: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <GlassPanel
        variant="elevated"
        glow="primary"
        className={`relative z-10 w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <h3 className="text-lg font-extrabold text-[var(--foreground)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </GlassPanel>
    </div>
  );
}
