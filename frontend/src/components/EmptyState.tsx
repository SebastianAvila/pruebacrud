"use client";

import { PackageOpen, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 dark:bg-navy-900/50">
        <Icon className="w-6 h-6 text-navy-500 dark:text-navy-300" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy-700 hover:bg-navy-800 text-white px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
