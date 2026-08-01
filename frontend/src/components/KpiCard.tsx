"use client";

import type { LucideIcon } from "lucide-react";

export type KpiAccent = "navy" | "blue" | "emerald" | "amber" | "purple" | "teal";

const accentClasses: Record<KpiAccent, { iconBox: string; icon: string }> = {
  navy: { iconBox: "bg-navy-50 dark:bg-navy-900/50", icon: "text-navy-600 dark:text-navy-300" },
  blue: { iconBox: "bg-blue-50 dark:bg-blue-900/40", icon: "text-blue-600 dark:text-blue-300" },
  emerald: { iconBox: "bg-emerald-50 dark:bg-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-300" },
  amber: { iconBox: "bg-amber-50 dark:bg-amber-900/40", icon: "text-amber-600 dark:text-amber-300" },
  purple: { iconBox: "bg-purple-50 dark:bg-purple-900/40", icon: "text-purple-600 dark:text-purple-300" },
  teal: { iconBox: "bg-teal-50 dark:bg-teal-900/40", icon: "text-teal-600 dark:text-teal-300" },
};

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: KpiAccent;
}

export default function KpiCard({ label, value, icon: Icon, accent = "navy" }: KpiCardProps) {
  const { iconBox, icon } = accentClasses[accent];
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {value.toLocaleString("es-MX")}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>
          <Icon className={`h-5 w-5 ${icon}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
