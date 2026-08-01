"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastProvider } from "./ToastProvider";

/**
 * Estructura general de la app:
 * - /login se renderiza a pantalla completa sin shell.
 * - El resto de rutas muestran Sidebar + Header + contenido.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marca el shell como montado tras la hidratación (inicialización intencional).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Antes de hidratar, evita parpadeos del layout.
  if (!mounted) {
    return <div className="min-h-screen bg-gray-100" aria-hidden="true" />;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
