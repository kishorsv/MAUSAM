import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="glass-panel-subtle rounded-2xl p-8 text-center border border-dashed border-slate-700/60 my-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-medium text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
