'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ArrowLeft, CheckCheck, Filter, ShieldAlert, CloudRain, Wind, Activity, Car, Plane, Users, Check } from 'lucide-react';
import { AppNotification } from '@/lib/db/types';
import { formatTimeAgo } from '@/lib/utils';
import { Header } from '@/components/navigation/Header';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // ignore
    }
  };

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'aqi', label: 'Air Quality' },
    { id: 'rain', label: 'Rain' },
    { id: 'commute', label: 'Commute' },
    { id: 'travel', label: 'Travel' },
  ];

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      <Header
        isLive={true}
        language="en"
        onLanguageChange={() => {}}
        onOpenSearch={() => {}}
        onOpenAI={() => {}}
        unreadCount={unreadCount}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-400" />
                Notification Inbox
              </h1>
              <p className="text-xs text-slate-400">
                Categorized proactive weather alerts and lifestyle warnings
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-primary-300 border border-slate-800 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === c.id
                  ? 'bg-primary-600 text-white border-primary-500 shadow-sm'
                  : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-300 mb-1">No alerts found</h4>
            <p className="text-xs text-slate-500">Your meteorological feed is clear in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && markRead(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.is_read
                    ? 'bg-white/[0.01] border-white/5 text-slate-400'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-4 leading-relaxed">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav unreadAlerts={unreadCount} />
    </div>
  );
}
