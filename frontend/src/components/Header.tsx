"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface UserInfo {
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

function getUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initialsOf(user: UserInfo | null): string {
  if (!user?.nombre) return "U";
  const parts = [user.nombre, user.apellido].filter((p): p is string => Boolean(p));
  return parts.map((p) => p.charAt(0).toUpperCase()).join("").slice(0, 2);
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lee el usuario desde localStorage tras hidratar o navegar (fuente externa).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
    setMounted(true);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const displayName = user?.nombre
    ? `${user.nombre} ${user.apellido ?? ""}`.trim()
    : "Usuario";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {mounted ? displayName : "…"}
        </p>
        <p className="truncate text-xs text-gray-400 dark:text-gray-500">
          {mounted && user?.email ? user.email : "Sesión iniciada"}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 dark:bg-navy-900 text-navy-700 dark:text-navy-200">
            {mounted ? (
              <span className="text-sm font-semibold">{initialsOf(user)}</span>
            ) : (
              <UserCircle2 className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
