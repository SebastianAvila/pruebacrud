"use client";

import { useState, useEffect, FormEvent, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  DoorOpen,
  CalendarDays,
  UserCheck,
  UserPlus,
  UsersRound,
  Search,
  UserX,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Modal from "@/src/components/Modal";
import ConfirmModal from "@/src/components/ConfirmModal";
import Chip from "@/src/components/Chip";
import EmptyState from "@/src/components/EmptyState";
import { SkeletonCard, SkeletonTable } from "@/src/components/Skeleton";
import { useToast } from "@/src/components/ToastProvider";

interface GrupoDetalle {
  grupo: { id: number; materiaId: number; salonId: number; cicloEscolar: string; activo: boolean };
  materia: { id: number; nombre: string; clave: string };
  salon: { id: number; nombre: string; edificio: string; capacidad: number };
  maestros: Array<{ id: number; nombre: string; apellido: string; email: string; rol: string }>;
  inscritosCount: number;
}
interface MaestroOption { id: number; nombre: string; apellido: string; activo?: boolean; }
interface AlumnoOption { id: number; nombre: string; apellido: string; matricula: string; activo?: boolean; }
interface AlumnoInscrito {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  inscripcionId: number;
  fechaInscripcion: string | null;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm";
const labelCls = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:bg-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function GrupoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const grupoId = resolvedParams.id;
  const toast = useToast();

  const [detalle, setDetalle] = useState<GrupoDetalle | null>(null);
  const [alumnosInscritos, setAlumnosInscritos] = useState<AlumnoInscrito[]>([]);
  const [maestrosDisponibles, setMaestrosDisponibles] = useState<MaestroOption[]>([]);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState<AlumnoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Agregar maestro
  const [maestroOpen, setMaestroOpen] = useState(false);
  const [maestroId, setMaestroId] = useState("");
  const [rol, setRol] = useState("titular");
  const [asignandoMaestro, setAsignandoMaestro] = useState(false);

  // Inscripción individual
  const [indOpen, setIndOpen] = useState(false);
  const [indSearch, setIndSearch] = useState("");
  const [indSelected, setIndSelected] = useState<number | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  // Inscripción masiva
  const [massOpen, setMassOpen] = useState(false);
  const [massSearch, setMassSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [inscribiendoLote, setInscribiendoLote] = useState(false);

  // Confirmaciones destructivas
  const [removerMaestroTarget, setRemoverMaestroTarget] = useState<MaestroOption | null>(null);
  const [removingMaestro, setRemovingMaestro] = useState(false);
  const [removerInscripcionTarget, setRemoverInscripcionTarget] = useState<AlumnoInscrito | null>(null);
  const [removingInscripcion, setRemovingInscripcion] = useState(false);

  useEffect(() => {
    document.title = `Grupo #${grupoId} | Control Escolar`;
  }, [grupoId]);

  const fetchDetalle = async () => {
    setLoading(true);
    setError("");
    try {
      const [detRes, alumnosRes, maestrosRes, inscritosRes] = await Promise.all([
        api.get(`/grupos/${grupoId}/detalle`),
        api.get("/alumnos?limit=200"),
        api.get("/maestros?limit=200"),
        api.get(`/grupos/${grupoId}/alumnos`),
      ]);
      setDetalle(detRes.data);
      setAlumnosInscritos(
        (inscritosRes.data || []).map((a: AlumnoInscrito) => ({
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          matricula: a.matricula,
          inscripcionId: a.inscripcionId,
          fechaInscripcion: a.fechaInscripcion || null,
        }))
      );
      const inscritosIds = new Set((inscritosRes.data || []).map((a: AlumnoInscrito) => a.id));
      setAlumnosDisponibles(
        (alumnosRes.data || []).filter((a: AlumnoOption) => a.activo && !inscritosIds.has(a.id))
      );
      const asignadosIds = new Set((detRes.data?.maestros || []).map((m: { id: number }) => m.id));
      setMaestrosDisponibles(
        (maestrosRes.data || []).filter((m: MaestroOption) => m.activo && !asignadosIds.has(m.id))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [detRes, alumnosRes, maestrosRes, inscritosRes] = await Promise.all([
          api.get(`/grupos/${grupoId}/detalle`),
          api.get("/alumnos?limit=200"),
          api.get("/maestros?limit=200"),
          api.get(`/grupos/${grupoId}/alumnos`),
        ]);
        if (cancelled) return;
        setDetalle(detRes.data);
        setAlumnosInscritos(
          (inscritosRes.data || []).map((a: AlumnoInscrito) => ({
            id: a.id,
            nombre: a.nombre,
            apellido: a.apellido,
            matricula: a.matricula,
            inscripcionId: a.inscripcionId,
            fechaInscripcion: a.fechaInscripcion || null,
          }))
        );
        const inscritosIds = new Set((inscritosRes.data || []).map((a: AlumnoInscrito) => a.id));
        setAlumnosDisponibles(
          (alumnosRes.data || []).filter((a: AlumnoOption) => a.activo && !inscritosIds.has(a.id))
        );
        const asignadosIds = new Set((detRes.data?.maestros || []).map((m: { id: number }) => m.id));
        setMaestrosDisponibles(
          (maestrosRes.data || []).filter((m: MaestroOption) => m.activo && !asignadosIds.has(m.id))
        );
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [grupoId]);

  // ─── Maestros ────────────────────────────────────────────────
  const handleAsignarMaestro = async (e: FormEvent) => {
    e.preventDefault();
    if (!maestroId) return;
    setAsignandoMaestro(true);
    setError("");
    try {
      await api.post(`/grupos/${grupoId}/maestros`, { maestroId: Number(maestroId), rol });
      setMaestroOpen(false);
      setMaestroId("");
      setRol("titular");
      toast.success("Maestro asignado al grupo");
      fetchDetalle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAsignandoMaestro(false);
    }
  };

  const handleRemoverMaestro = async () => {
    if (!removerMaestroTarget) return;
    setRemovingMaestro(true);
    setError("");
    try {
      await api.delete(`/grupos/${grupoId}/maestros/${removerMaestroTarget.id}`);
      toast.success("Maestro removido del grupo");
      setRemoverMaestroTarget(null);
      fetchDetalle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRemovingMaestro(false);
    }
  };

  // ─── Inscripción individual ──────────────────────────────────
  const handleInscribirIndividual = async () => {
    if (!indSelected) return;
    setInscribiendo(true);
    setError("");
    try {
      await api.post(`/grupos/${grupoId}/inscripciones`, { alumnoId: indSelected });
      toast.success("Alumno inscrito exitosamente");
      setIndOpen(false);
      setIndSelected(null);
      setIndSearch("");
      fetchDetalle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setInscribiendo(false);
    }
  };

  // ─── Inscripción masiva ──────────────────────────────────────
  const handleInscribirLote = async () => {
    if (seleccionados.length === 0) return;
    setInscribiendoLote(true);
    setError("");
    try {
      const res = await api.post(`/grupos/${grupoId}/inscripciones/lote`, { alumnoIds: seleccionados });
      const errores = res?.data?.errores?.length || 0;
      toast.success(`${seleccionados.length - errores} alumnos inscritos exitosamente`);
      if (errores > 0) {
        toast.info(`${errores} alumnos ya estaban inscritos o no se pudieron procesar`);
      }
      setMassOpen(false);
      setSeleccionados([]);
      setMassSearch("");
      fetchDetalle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setInscribiendoLote(false);
    }
  };

  // ─── Remover inscripción ─────────────────────────────────────
  const handleRemoverInscripcion = async () => {
    if (!removerInscripcionTarget) return;
    setRemovingInscripcion(true);
    setError("");
    try {
      await api.delete(`/inscripciones/${removerInscripcionTarget.inscripcionId}`);
      toast.success("Inscripción removida del grupo");
      setRemoverInscripcionTarget(null);
      fetchDetalle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRemovingInscripcion(false);
    }
  };

  const filterAlumnos = (search: string) => {
    const q = search.trim().toLowerCase();
    if (!q) return alumnosDisponibles;
    return alumnosDisponibles.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.apellido.toLowerCase().includes(q) ||
        a.matricula.toLowerCase().includes(q)
    );
  };

  const filteredIndividual = filterAlumnos(indSearch);
  const filteredMass = filterAlumnos(massSearch);
  const allFilteredSelected =
    filteredMass.length > 0 && filteredMass.every((a) => seleccionados.includes(a.id));
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      const ids = new Set(filteredMass.map((a) => a.id));
      setSeleccionados((prev) => prev.filter((id) => !ids.has(id)));
    } else {
      setSeleccionados((prev) => Array.from(new Set([...prev, ...filteredMass.map((a) => a.id)])));
    }
  };
  const toggleSeleccion = (id: number) =>
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pctOcupacion =
    detalle && detalle.salon.capacidad > 0
      ? Math.min(100, Math.round((detalle.inscritosCount / detalle.salon.capacidad) * 100))
      : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="skeleton h-8 w-72 rounded mb-8" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-6">
          <SkeletonCard className="h-40 mb-6" />
          <SkeletonTable rows={5} cols={3} />
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !detalle) {
    return (
      <ProtectedRoute>
        <div
          role="alert"
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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

      {/* Encabezado */}
      <div className="mb-6">
        <Link
          href="/grupos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 dark:text-navy-300 hover:text-navy-800 dark:hover:text-navy-200 transition-colors rounded focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a Grupos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Grupo #{grupoId}
          </h1>
          <span className="rounded-md bg-navy-50 dark:bg-navy-900/50 px-2.5 py-1 text-xs font-semibold text-navy-700 dark:text-navy-200">
            {detalle?.materia?.nombre}
          </span>
          <span className="rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
            Ciclo {detalle?.grupo?.cicloEscolar}
          </span>
        </div>
      </div>

      {detalle && (
        <>
          {/* Tarjetas de información */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 dark:bg-navy-900/50">
                <BookOpen className="h-4.5 w-4.5 text-navy-600 dark:text-navy-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Materia</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{detalle.materia.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clave {detalle.materia.clave}</p>
            </div>

            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/40">
                <DoorOpen className="h-4.5 w-4.5 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Salón</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{detalle.salon.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {detalle.salon.edificio || "Sin edificio"} · Cap. {detalle.salon.capacidad}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/40">
                <CalendarDays className="h-4.5 w-4.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Ciclo escolar</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{detalle.grupo.cicloEscolar}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Grupo activo</p>
            </div>

            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-layered">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/40">
                <UsersRound className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Inscritos</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {detalle.inscritosCount} / {detalle.salon.capacidad}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${pctOcupacion >= 90 ? "bg-red-500" : pctOcupacion >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${pctOcupacion}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Maestros asignados */}
          <section className="mt-6 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Maestros asignados
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {detalle.maestros.length} docente{detalle.maestros.length === 1 ? "" : "s"} en el grupo
                </p>
              </div>
              <button
                onClick={() => setMaestroOpen(true)}
                className={btnPrimary}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Agregar maestro
              </button>
            </div>

            <div className="p-5">
              {detalle.maestros.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="Aún no hay maestros asignados"
                  description="Asigna un docente titular o auxiliar para impartir esta materia."
                  actionLabel="Agregar maestro"
                  onAction={() => setMaestroOpen(true)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detalle.maestros.map((m) => (
                    <Chip
                      key={m.id}
                      color={m.rol === "titular" ? "navy" : "amber"}
                      onRemove={() => setRemoverMaestroTarget({ id: m.id, nombre: m.nombre, apellido: m.apellido })}
                      removeLabel={`Remover a ${m.nombre} ${m.apellido}`}
                    >
                      <span className="flex items-center gap-2">
                        {m.nombre} {m.apellido}
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            m.rol === "titular"
                              ? "bg-navy-700 text-white"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-100"
                          }`}
                        >
                          {m.rol}
                        </span>
                      </span>
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Alumnos inscritos */}
          <section className="mt-6 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-layered">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Alumnos inscritos
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {alumnosInscritos.length} alumno{alumnosInscritos.length === 1 ? "" : "s"} ·{" "}
                  {alumnosDisponibles.length} disponibles para inscribir
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setIndOpen(true)} className={btnSecondary}>
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                  Inscribir alumno
                </button>
                <button onClick={() => setMassOpen(true)} className={btnPrimary}>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Inscripción masiva
                </button>
              </div>
            </div>

            <div className="p-5">
              {alumnosInscritos.length === 0 ? (
                <EmptyState
                  icon={BookOpenCheck}
                  title="Todavía no hay alumnos inscritos"
                  description="Inscribe alumnos de forma individual o masiva para llenar este grupo."
                  actionLabel="Inscribir alumnos"
                  onAction={() => setMassOpen(true)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Matrícula</th>
                        <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</th>
                        <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha de inscripción</th>
                        <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {alumnosInscritos.map((a) => (
                        <tr key={a.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-sm tabular-nums text-gray-700 dark:text-gray-300">{a.matricula}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{a.nombre} {a.apellido}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {a.fechaInscripcion ? new Date(a.fechaInscripcion + "T00:00:00").toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setRemoverInscripcionTarget(a)}
                              title="Remover inscripción"
                              aria-label={`Remover inscripción de ${a.nombre} ${a.apellido}`}
                              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                            >
                              <UserX className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ─── Modal: Agregar maestro ─────────────────────────── */}
      <Modal
        open={maestroOpen}
        onClose={() => setMaestroOpen(false)}
        title="Agregar maestro al grupo"
        disableClose={asignandoMaestro}
      >
        <form onSubmit={handleAsignarMaestro} className="space-y-4">
          <div>
            <label htmlFor="asignar-maestro" className={labelCls}>Maestro *</label>
            <select
              id="asignar-maestro"
              required
              value={maestroId}
              onChange={(e) => setMaestroId(e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar maestro</option>
              {maestrosDisponibles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} {m.apellido}
                </option>
              ))}
            </select>
            {maestrosDisponibles.length === 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                No hay maestros disponibles: todos los docentes ya están asignados.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="asignar-rol" className={labelCls}>Rol</label>
            <select id="asignar-rol" value={rol} onChange={(e) => setRol(e.target.value)} className={inputCls}>
              <option value="titular">Titular</option>
              <option value="auxiliar">Auxiliar</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMaestroOpen(false)}
              disabled={asignandoMaestro}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={asignandoMaestro || maestrosDisponibles.length === 0}
              className={btnPrimary}
            >
              {asignandoMaestro && <span className="spinner" aria-hidden="true" />}
              {asignandoMaestro ? "Asignando…" : "Asignar maestro"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Inscripción individual ──────────────────── */}
      <Modal
        open={indOpen}
        onClose={() => setIndOpen(false)}
        title="Inscribir alumno al grupo"
        size="lg"
        disableClose={inscribiendo}
      >
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              autoFocus
              value={indSearch}
              onChange={(e) => { setIndSearch(e.target.value); setIndSelected(null); }}
              placeholder="Buscar por nombre o matrícula…"
              className={inputCls + " pl-9"}
              aria-label="Buscar alumno"
            />
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">
            {filteredIndividual.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {alumnosDisponibles.length === 0
                  ? "No hay alumnos disponibles para inscribir."
                  : "Sin resultados para tu búsqueda."}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredIndividual.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setIndSelected(a.id)}
                      aria-pressed={indSelected === a.id}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        indSelected === a.id
                          ? "bg-navy-50 dark:bg-navy-900/50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          indSelected === a.id
                            ? "border-navy-600 bg-navy-600 dark:border-navy-400 dark:bg-navy-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {indSelected === a.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                        )}
                      </span>
                      <span className="tabular-nums font-medium text-gray-500 dark:text-gray-400">{a.matricula}</span>
                      <span className="text-gray-900 dark:text-gray-100">{a.nombre} {a.apellido}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <button
              type="button"
              onClick={() => setIndOpen(false)}
              disabled={inscribiendo}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              onClick={handleInscribirIndividual}
              disabled={inscribiendo || !indSelected}
              className={btnPrimary}
            >
              {inscribiendo && <span className="spinner" aria-hidden="true" />}
              {inscribiendo ? "Inscribiendo…" : "Inscribir alumno"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal: Inscripción masiva ──────────────────────── */}
      <Modal
        open={massOpen}
        onClose={() => setMassOpen(false)}
        title="Inscripción masiva"
        size="lg"
        disableClose={inscribiendoLote}
      >
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              autoFocus
              value={massSearch}
              onChange={(e) => setMassSearch(e.target.value)}
              placeholder="Buscar por nombre o matrícula…"
              className={inputCls + " pl-9"}
              aria-label="Buscar alumnos para inscripción masiva"
            />
          </div>

          {filteredMass.length > 0 && (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAllFiltered}
                className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
              />
              Seleccionar todos ({filteredMass.length})
            </label>
          )}

          <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">
            {filteredMass.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {alumnosDisponibles.length === 0
                  ? "No hay alumnos disponibles para inscribir."
                  : "Sin resultados para tu búsqueda."}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredMass.map((a) => (
                  <li key={a.id}>
                    <label
                      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        seleccionados.includes(a.id)
                          ? "bg-navy-50 dark:bg-navy-900/50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(a.id)}
                        onChange={() => toggleSeleccion(a.id)}
                        className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                      />
                      <span className="tabular-nums font-medium text-gray-500 dark:text-gray-400">{a.matricula}</span>
                      <span className="text-gray-900 dark:text-gray-100">{a.nombre} {a.apellido}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{seleccionados.length}</span>{" "}
              seleccionado{seleccionados.length === 1 ? "" : "s"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMassOpen(false)}
                disabled={inscribiendoLote}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleInscribirLote}
                disabled={inscribiendoLote || seleccionados.length === 0}
                className={btnPrimary}
              >
                {inscribiendoLote && <span className="spinner" aria-hidden="true" />}
                {inscribiendoLote
                  ? "Inscribiendo…"
                  : `Inscribir seleccionados (${seleccionados.length})`}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Confirmaciones ─────────────────────────────────── */}
      <ConfirmModal
        open={!!removerMaestroTarget}
        title="Remover maestro del grupo"
        message={
          <>
            ¿Remover a{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {removerMaestroTarget?.nombre} {removerMaestroTarget?.apellido}
            </strong>{" "}
            de este grupo?
          </>
        }
        confirmLabel="Remover"
        loading={removingMaestro}
        loadingLabel="Removiendo…"
        onConfirm={handleRemoverMaestro}
        onClose={() => setRemoverMaestroTarget(null)}
      />

      <ConfirmModal
        open={!!removerInscripcionTarget}
        title="Remover inscripción"
        message={
          <>
            ¿Remover la inscripción de{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {removerInscripcionTarget?.nombre} {removerInscripcionTarget?.apellido}
            </strong>{" "}
            ({removerInscripcionTarget?.matricula}) de este grupo?
          </>
        }
        confirmLabel="Remover"
        loading={removingInscripcion}
        loadingLabel="Removiendo…"
        onConfirm={handleRemoverInscripcion}
        onClose={() => setRemoverInscripcionTarget(null)}
      />
    </ProtectedRoute>
  );
}
