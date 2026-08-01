"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogIn } from "lucide-react";
import { api } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Iniciar sesión | Control Escolar";
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.maestro));
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message === "Credenciales inválidas"
          ? "El email o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo."
          : message || "Ocurrió un error al conectar con el servidor. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Panel de marca */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-800 p-12 lg:flex">
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <GraduationCap className="absolute -right-10 -top-10 h-80 w-80 text-white" />
          <GraduationCap className="absolute -bottom-16 -left-8 h-96 w-96 text-white" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Control Escolar</p>
              <p className="text-xs text-white/60">ERP Académico</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Administra tu escuela desde un solo lugar
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Alumnos, maestros, materias, salones y grupos: todo el control académico
            con una experiencia clara y profesional.
          </p>
        </div>

        <p className="relative text-xs text-white/40">© 2026 Control Escolar · Demo para cliente</p>
      </div>

      {/* Panel de formulario */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700 text-white shadow-layered lg:hidden">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bienvenido de nuevo
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Inicia sesión para acceder al panel
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-layered">
            <div aria-live="polite">
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username email"
                  spellCheck={false}
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors placeholder:text-gray-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="admin@test.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors placeholder:text-gray-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Ingresa tu contraseña…"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-navy-800 disabled:bg-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
              >
                {loading && <span className="spinner" aria-hidden="true" />}
                {loading ? "Ingresando…" : (
                  <>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              Demo: <span className="font-medium text-gray-500 dark:text-gray-400">admin@test.com</span> ·{" "}
              <span className="font-medium text-gray-500 dark:text-gray-400">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
