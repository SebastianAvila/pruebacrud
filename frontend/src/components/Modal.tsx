"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
  /** Bloquea cerrar el modal (se usa mientras una acción está en curso). */
  disableClose?: boolean;
  /** Oculta el botón X. */
  hideClose?: boolean;
  /** Ref al elemento que debe recibir el foco al abrir (default: primer input). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  disableClose = false,
  hideClose = false,
  initialFocusRef,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const firstInput = contentRef.current?.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
          );
          if (firstInput) {
            firstInput.focus();
          } else {
            closeButtonRef.current?.focus();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open, initialFocusRef]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) {
        onClose();
        return;
      }

      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, disableClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current && !disableClose) onClose();
      }}
    >
      <div
        ref={contentRef}
        className={`modal-content bg-white dark:bg-gray-800 rounded-xl shadow-layered w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {!hideClose && (
            <button
              ref={closeButtonRef}
              onClick={disableClose ? undefined : onClose}
              disabled={disableClose}
              aria-label="Cerrar modal"
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                disableClose
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
