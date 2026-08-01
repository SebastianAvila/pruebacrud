"use client";

import { X } from "lucide-react";

export type ChipColor = "navy" | "emerald" | "amber" | "gray";

const colorClasses: Record<ChipColor, string> = {
  navy: "bg-navy-50 text-navy-700 border-navy-200 dark:bg-navy-900/50 dark:text-navy-200 dark:border-navy-700",
  emerald:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  gray: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

interface ChipProps {
  children: React.ReactNode;
  color?: ChipColor;
  onRemove?: () => void;
  removeLabel?: string;
}

export default function Chip({ children, color = "navy", onRemove, removeLabel }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${colorClasses[color]}`}
    >
      <span className="truncate max-w-[16rem]">{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={removeLabel || "Quitar"}
          className="-mr-1 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
