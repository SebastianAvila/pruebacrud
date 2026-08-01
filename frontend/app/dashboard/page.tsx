"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  GraduationCap,
  Users,
  Layers,
  BookOpen,
  Landmark,
  DoorOpen,
  ArrowRight,
  BookOpenCheck,
  BarChart3,
} from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import KpiCard from "@/src/components/KpiCard";
import PageHeader from "@/src/components/PageHeader";
import EmptyState from "@/src/components/EmptyState";
import { SkeletonKpis, SkeletonTable, SkeletonCard } from "@/src/components/Skeleton";

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  carreraId: number | null;
  activo: boolean;
}
interface Carrera {
  id: number;
  nombre: string;
  clave: string;
}
interface Grupo {
  id: number;
  materiaId: number;
  salonId: number;
  cicloEscolar: string;
}
interface Materia {
  id: number;
  nombre: string;
}
interface Salon {
  id: number;
  nombre: string;
}

const CHART_COLORS = ["#1e3a5f", "#35618f", "#5d85b5", "#8baacf", "#b6cae3", "#254d75"];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [kpis, setKpis] = useState({
    alumnos: 0,
    maestros: 0,
    grupos: 0,
    materias: 0,
    carreras: 0,
    salones: 0,
  });

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);

  useEffect(() => {
    document.title = "Dashboard | Control Escolar";
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [alRes, maRes, grRes, mtRes, caRes, saRes] = await Promise.all([
          api.get("/alumnos?limit=200"),
          api.get("/maestros?limit=1"),
          api.get("/grupos?limit=100"),
          api.get("/materias?limit=100"),
          api.get("/carreras?limit=100"),
          api.get("/salones?limit=100"),
        ]);
        if (cancelled) return;

        setKpis({
          alumnos: alRes.total || 0,
          maestros: maRes.total || 0,
          grupos: grRes.total || 0,
          materias: mtRes.total || 0,
          carreras: caRes.total || 0,
          salones: saRes.total || 0,
        });

        setAlumnos(alRes.data || []);
        setCarreras(caRes.data || []);
        setGrupos(grRes.data || []);
        setMaterias(mtRes.data || []);
        setSalones(saRes.data || []);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Últimos 5 grupos por id desc
  const ultimosGrupos = [...grupos].sort((a, b) => b.id - a.id).slice(0, 5);

  // Alumnos por carrera para el gráfico
  const carreraNameById = new Map(carreras.map((c) => [c.id, c.nombre]));
  const porCarrera = new Map<string, number>();
  alumnos.forEach((a) => {
    const name = a.carreraId ? carreraNameById.get(a.carreraId) : null;
    const label = name || "Sin carrera";
    porCarrera.set(label, (porCarrera.get(label) || 0) + 1);
  });
  const chartData = Array.from(porCarrera.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Dashboard"
        description="Resumen general del estado académico"
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* KPIs */}
      {loading ? (
        <SkeletonKpis count={6} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Alumnos activos" value={kpis.alumnos} icon={GraduationCap} accent="navy" />
          <KpiCard label="Maestros" value={kpis.maestros} icon={Users} accent="blue" />
          <KpiCard label="Grupos activos" value={kpis.grupos} icon={Layers} accent="emerald" />
          <KpiCard label="Materias" value={kpis.materias} icon={BookOpen} accent="amber" />
          <KpiCard label="Carreras" value={kpis.carreras} icon={Landmark} accent="purple" />
          <KpiCard label="Salones" value={kpis.salones} icon={DoorOpen} accent="teal" />
        </div>
      )}

      {/* Últimos grupos + gráfico */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Últimos grupos creados */}
        <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Últimos grupos creados
            </h2>
            <Link
              href="/grupos"
              className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 dark:text-navy-300 hover:text-navy-800 dark:hover:text-navy-200 transition-colors"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              <SkeletonTable rows={5} cols={3} />
            </div>
          ) : ultimosGrupos.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={BookOpenCheck}
                title="Todavía no hay grupos"
                description="Crea tu primer grupo para comenzar a organizar el ciclo escolar."
                actionLabel="Crear grupo"
                onAction={() => router.push("/grupos")}
              />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {ultimosGrupos.map((g) => {
                const materia = materias.find((m) => m.id === g.materiaId);
                const salon = salones.find((s) => s.id === g.salonId);
                return (
                  <li key={g.id}>
                    <Link
                      href={`/grupos/${g.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {materia?.nombre || "Materia sin nombre"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          Grupo #{g.id} · Salón {salon?.nombre || g.salonId} · Ciclo {g.cicloEscolar}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Gráfico de alumnos por carrera */}
        <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered">
          <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Alumnos por carrera
            </h2>
          </div>

          {loading ? (
            <div className="p-5">
              <SkeletonCard className="h-64" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={BarChart3}
                title="Sin datos para graficar"
                description="Registra alumnos y asígnales una carrera para ver la distribución."
              />
            </div>
          ) : (
            <div className="h-72 p-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(30,58,95,0.06)" }}
                    formatter={(value, name) => [`${value ?? 0} alumnos`, name === "count" ? "Alumnos" : name]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
