"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus } from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Table from "@/src/components/Table";
import FormModal from "@/src/components/FormModal";
import ConfirmModal from "@/src/components/ConfirmModal";
import PageHeader from "@/src/components/PageHeader";
import { SkeletonTable } from "@/src/components/Skeleton";
import { useToast } from "@/src/components/ToastProvider";

interface Carrera {
  id: number;
  nombre: string;
  clave: string;
  duracionSemestres: number;
  activo: boolean;
}

const emptyForm = { nombre: "", clave: "", duracionSemestres: "" };
const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const btnPagination = "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function CarrerasPage() {
  const toast = useToast();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Carrera | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Carrera | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { document.title = "Carreras | Control Escolar"; }, []);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/carreras?page=${p}&limit=${limit}`);
      setCarreras(res.data);
      setTotal(res.total || 0);
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
        const res = await api.get(`/carreras?page=1&limit=${limit}`);
        if (cancelled) return;
        setCarreras(res.data);
        setTotal(res.total || 0);
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

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Carrera) => {
    setEditing(c);
    setForm({ nombre: c.nombre, clave: c.clave, duracionSemestres: String(c.duracionSemestres) });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { nombre: form.nombre.trim(), clave: form.clave.trim(), duracionSemestres: Number(form.duracionSemestres) };
      if (editing) {
        await api.put(`/carreras/${editing.id}`, body);
        toast.success("Carrera actualizada exitosamente");
      } else {
        await api.post("/carreras", body);
        toast.success("Carrera creada exitosamente");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/carreras/${deleteTarget.id}`);
      toast.success(`Carrera "${deleteTarget.nombre}" dada de baja`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "clave", label: "Clave", render: (c: Carrera) => (
      <span className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{c.clave}</span>
    ) },
    { key: "nombre", label: "Nombre" },
    { key: "duracionSemestres", label: "Duración", align: "right" as const, render: (c: Carrera) => `${c.duracionSemestres} sem.` },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Carreras"
        description={`${total.toLocaleString("es-MX")} programas académicos`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva carrera
          </button>
        }
      />

      <div aria-live="polite">
        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={4} cols={3} />
      ) : (
        <>
          <Table
            columns={columns}
            data={carreras}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            emptyTitle="No hay carreras registradas"
            emptyDescription="Crea tu primera carrera para asignar alumnos y materias."
            emptyActionLabel="Crear primera carrera"
            onEmptyAction={openCreate}
          />
          {totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-4 flex items-center justify-center gap-4">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); fetchData(page - 1); }} className={btnPagination}>Anterior</button>
              <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums" aria-current="page">Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchData(page + 1); }} className={btnPagination}>Siguiente</button>
            </nav>
          )}
        </>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Carrera" : "Nueva Carrera"} saving={saving}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="carrera-nombre" className={labelCls}>Nombre *</label>
            <input id="carrera-nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="carrera-clave" className={labelCls}>Clave *</label>
            <input id="carrera-clave" required spellCheck={false} autoComplete="off" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="carrera-duracion" className={labelCls}>Duración (semestres) *</label>
            <input id="carrera-duracion" type="number" min={1} inputMode="numeric" required value={form.duracionSemestres} onChange={(e) => setForm({ ...form, duracionSemestres: e.target.value })} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-navy-800 disabled:bg-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none">
              {saving && <span className="spinner" aria-hidden="true" />}
              {saving ? "Guardando…" : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Dar de baja carrera"
        message={
          <>
            ¿Estás seguro de que deseas dar de baja la carrera{" "}
            <strong className="text-gray-900 dark:text-gray-100">{deleteTarget?.nombre}</strong> (
            {deleteTarget?.clave})? Los alumnos y materias asociados conservarán su referencia.
          </>
        }
        confirmLabel="Dar de baja"
        loading={deleting}
        loadingLabel="Dando de baja…"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </ProtectedRoute>
  );
}
