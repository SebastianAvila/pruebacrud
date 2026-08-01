"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Landmark,
  DoorOpen,
  BookOpen,
  Layers,
  GraduationCap as LogoIcon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alumnos", label: "Alumnos", icon: GraduationCap },
  { href: "/maestros", label: "Maestros", icon: Users },
  { href: "/carreras", label: "Carreras", icon: Landmark },
  { href: "/salones", label: "Salones", icon: DoorOpen },
  { href: "/materias", label: "Materias", icon: BookOpen },
  { href: "/grupos", label: "Grupos", icon: Layers },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col bg-navy-800 dark:bg-gray-900 lg:w-64">
      {/* Marca */}
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 border-b border-white/10 px-3 lg:px-5"
        aria-label="Ir al Dashboard"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
          <LogoIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="hidden lg:block">
          <span className="block text-sm font-bold text-white leading-tight">Control Escolar</span>
          <span className="block text-[11px] text-white/60 leading-tight">ERP Académico</span>
        </span>
      </Link>

      {/* Navegación */}
      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2 lg:px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  title={label}
                  className={`group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors lg:px-3 ${
                    isActive
                      ? "bg-navy-700 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`}
                    aria-hidden="true"
                  />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pie */}
      <div className="border-t border-white/10 px-3 py-3 lg:px-5">
        <p className="hidden text-[11px] text-white/40 lg:block">v1.0 · Demo para cliente</p>
      </div>
    </aside>
  );
}
