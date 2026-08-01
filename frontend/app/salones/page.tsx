"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Building2 } from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Table from "@/src/components/Table";
import FormModal from "@/src/components/FormModal";
import ConfirmModal from "@/src/components/ConfirmModal";
import PageHeader from "@/src/components/PageHeader";
import { SkeletonTable } from "@/src/components/Skeleton";
import { useToast } from "@/src/components/ToastProvider";

interface Salon {
  id: number;
  nombre: string;
  edificio: string | null;
  capacidad: number;
  activo: boolean;
}

const emptyForm = { nombre: "", edificio: "", capacidad: "" };
const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const btnPagination = "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function SalonesPage() {
  const toast = useToast();
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Salon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Salon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { document.title = "Salones | Control Escolar"; }, []);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/salones?page=${p}&limit=${limit}`);
      setSalones(res.data);
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
        const res = await api.get(`/salones?page=1&limit=${limit}`);
        if (cancelled) return;
        setSalones(res.data);
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
  const openEdit = (s: Salon) => {
    setEditing(s);
    setForm({ nombre: s.nombre, edificio: s.edificio || "", capacidad: String(s.capacidad) });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: { nombre: string; capacidad: number; edificio?: string } = { nombre: form.nombre.trim(), capacidad: Number(form.capacidad) };
      if (form.edificio.trim()) body.edificio = form.edificio.trim();
      if (editing) {
        await api.put(`/salones/${editing.id}`, body);
        toast.success("Salón actualizado exitosamente");
      } else {
        await api.post("/salones", body);
        toast.success("Salón creado exitosamente");
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
      await api.delete(`/salones/${deleteTarget.id}`);
      toast.success(`Salón "${deleteTarget.nombre}" dado de baja`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "edificio", label: "Edificio", render: (s: Salon) => s.edificio ? (
      <span className="inline-flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        {s.edificio}
      </span>
    ) : "—" },
    { key: "capacidad", label: "Capacidad", align: "right" as const, render: (s: Salon) => `${s.capacidad} lugares` },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Salones"
        description={`${total.toLocaleString("es-MX")} espacios disponibles`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo salón
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
            data={salones}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            emptyTitle="No hay salones registrados"
            emptyDescription="Registra tu primer salón para asignarlo a los grupos."
            emptyActionLabel="Crear primer salón"
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

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Salón" : "Nuevo Salón"} saving={saving}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="salon-nombre" className={labelCls}>Nombre *</label>
            <input id="salon-nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="salon-edificio" className={labelCls}>Edificio</label>
            <input id="salon-edificio" value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="salon-capacidad" className={labelCls}>Capacidad *</label>
            <input id="salon-capacidad" type="number" min={1} inputMode="numeric" required value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} className={inputCls} />
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
        title="Dar de baja salón"
        message={
          <>
            ¿Estás seguro de que deseas dar de baja el salón{" "}
            <strong className="text-gray-900 dark:text-gray-100">{deleteTarget?.nombre}</strong>?
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
