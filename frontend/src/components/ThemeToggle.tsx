"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
