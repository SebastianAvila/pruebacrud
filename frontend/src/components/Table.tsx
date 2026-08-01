"use client";

import { Pencil, Trash2, Eye, SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import EmptyState from "./EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  idKey?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  /** Acciones extra que se agregan a la izquierda de las acciones por fila. */
  rowActions?: (item: T) => React.ReactNode;
}

export default function Table<T>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  idKey = "id",
  emptyTitle = "No hay registros para mostrar",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  rowActions,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={SearchX as LucideIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  const hasActions = Boolean(onEdit || onDelete || onView || rowActions);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((item) => (
              <tr
                key={String((item as Record<string, unknown>)[idKey])}
                className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
              >
                {columns.map((col) => {
                  const cellValue = (item as Record<string, unknown>)[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${
                        col.align === "right"
                          ? "text-right tabular-nums"
                          : col.align === "center"
                          ? "text-center"
                          : ""
                      }`}
                    >
                      {col.render ? col.render(item) : cellValue !== undefined && cellValue !== null ? String(cellValue) : "—"}
                    </td>
                  );
                })}
                {hasActions && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-end gap-1">
                      {rowActions && rowActions(item)}
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          title="Ver detalle"
                          aria-label="Ver detalle"
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-navy-50 hover:text-navy-600 dark:hover:bg-navy-900/50 dark:hover:text-navy-300 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar"
                          aria-label="Editar"
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          title="Dar de baja"
                          aria-label="Dar de baja"
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
