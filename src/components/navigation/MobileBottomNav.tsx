'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CloudRain, Map, Bell, User } from 'lucide-react';

export function MobileBottomNav({ unreadAlerts = 0 }: { unreadAlerts?: number }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Weather', href: '/forecast', icon: CloudRain },
    { label: 'Map', href: '/map', icon: Map },
    { label: 'Alerts', href: '/notifications', icon: Bell, badge: unreadAlerts },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-primary-400' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary-400 -mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
