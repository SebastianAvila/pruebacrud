"use client";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function SkeletonText({ className = "", lines = 1 }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${[88, 74, 92, 66, 82][i % 5]}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered"
      aria-hidden="true"
    >
      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton h-3 w-20 rounded" />
          ))}
          <div className="ml-auto skeleton h-3 w-24 rounded" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="border-t border-gray-100 dark:border-gray-700 px-4 py-3.5 flex gap-8"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-4 rounded" style={{ width: `${[68, 84, 62, 90, 72, 58][c % 6]}%` }} />
          ))}
          <div className="flex gap-2 ml-auto">
            <div className="skeleton h-7 w-7 rounded-md" />
            <div className="skeleton h-7 w-7 rounded-md" />
            <div className="skeleton h-7 w-7 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonKpis({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="mt-3 skeleton h-8 w-14 rounded" />
            </div>
            <div className="skeleton h-11 w-11 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />;
}
