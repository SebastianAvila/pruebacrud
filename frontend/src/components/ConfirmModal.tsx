"use client";

import { useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  /** Ícono/acento destructivo (rojo). Por defecto true. */
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  loadingLabel = "Procesando…",
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      disableClose={loading}
      initialFocusRef={cancelRef}
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-full ${
            destructive ? "bg-red-50 dark:bg-red-900/30" : "bg-navy-50 dark:bg-navy-900/40"
          }`}
        >
          {destructive ? (
            <Trash2
              className="w-5 h-5 text-red-500 dark:text-red-400"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="w-5 h-5 text-navy-600 dark:text-navy-300"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:outline-none ${
            destructive
              ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
              : "bg-navy-700 hover:bg-navy-800 focus-visible:ring-navy-500"
          }`}
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
