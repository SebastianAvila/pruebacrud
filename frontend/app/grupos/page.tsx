"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Table from "@/src/components/Table";
import FormModal from "@/src/components/FormModal";
import ConfirmModal from "@/src/components/ConfirmModal";
import PageHeader from "@/src/components/PageHeader";
import { SkeletonTable } from "@/src/components/Skeleton";
import { useToast } from "@/src/components/ToastProvider";

interface Grupo {
  id: number;
  materiaId: number;
  salonId: number;
  cicloEscolar: string;
  activo: boolean;
}
interface Materia { id: number; nombre: string; }
interface Salon { id: number; nombre: string; }

const emptyForm = { materiaId: "", salonId: "", cicloEscolar: "" };
const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const btnPagination = "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function GruposPage() {
  const toast = useToast();
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grupo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Grupo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { document.title = "Grupos | Control Escolar"; }, []);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const [grRes, maRes, saRes] = await Promise.all([
        api.get(`/grupos?page=${p}&limit=${limit}`),
        api.get("/materias?limit=100"),
        api.get("/salones?limit=100"),
      ]);
      setGrupos(grRes.data);
      setTotal(grRes.total || 0);
      setMaterias(maRes.data);
      setSalones(saRes.data);
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
        const [grRes, maRes, saRes] = await Promise.all([
          api.get(`/grupos?page=1&limit=${limit}`),
          api.get("/materias?limit=100"),
          api.get("/salones?limit=100"),
        ]);
        if (cancelled) return;
        setGrupos(grRes.data);
        setTotal(grRes.total || 0);
        setMaterias(maRes.data);
        setSalones(saRes.data);
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
  const openEdit = (g: Grupo) => {
    setEditing(g);
    setForm({ materiaId: String(g.materiaId), salonId: String(g.salonId), cicloEscolar: g.cicloEscolar });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { materiaId: Number(form.materiaId), salonId: Number(form.salonId), cicloEscolar: form.cicloEscolar.trim() };
      if (editing) {
        await api.put(`/grupos/${editing.id}`, body);
        toast.success("Grupo actualizado exitosamente");
      } else {
        await api.post("/grupos", body);
        toast.success("Grupo creado exitosamente");
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
      await api.delete(`/grupos/${deleteTarget.id}`);
      toast.success(`Grupo #${deleteTarget.id} dado de baja`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const materiaNameById = new Map(materias.map((m) => [m.id, m.nombre]));
  const salonNameById = new Map(salones.map((s) => [s.id, s.nombre]));

  const columns = [
    { key: "id", label: "ID", render: (g: Grupo) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">#{g.id}</span>
    ) },
    { key: "materia", label: "Materia", render: (g: Grupo) => materiaNameById.get(g.materiaId) || "—" },
    { key: "salon", label: "Salón", render: (g: Grupo) => salonNameById.get(g.salonId) || "—" },
    { key: "cicloEscolar", label: "Ciclo Escolar", render: (g: Grupo) => (
      <span className="rounded-md bg-navy-50 dark:bg-navy-900/50 px-2 py-0.5 text-xs font-semibold text-navy-700 dark:text-navy-200">{g.cicloEscolar}</span>
    ) },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Grupos"
        description={`${total.toLocaleString("es-MX")} grupos en el ciclo vigente`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo grupo
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
        <SkeletonTable rows={5} cols={4} />
      ) : (
        <>
          <Table
            columns={columns}
            data={grupos}
            onView={(g) => router.push(`/grupos/${g.id}`)}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            emptyTitle="No hay grupos registrados"
            emptyDescription="Crea tu primer grupo asignando una materia, un salón y un ciclo escolar."
            emptyActionLabel="Crear primer grupo"
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

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Grupo" : "Nuevo Grupo"} saving={saving}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="grupo-materia" className={labelCls}>Materia *</label>
            <select id="grupo-materia" required value={form.materiaId} onChange={(e) => setForm({ ...form, materiaId: e.target.value })} className={inputCls}>
              <option value="">Seleccionar materia</option>
              {materias.map((m) => (<option key={m.id} value={m.id}>{m.nombre}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="grupo-salon" className={labelCls}>Salón *</label>
            <select id="grupo-salon" required value={form.salonId} onChange={(e) => setForm({ ...form, salonId: e.target.value })} className={inputCls}>
              <option value="">Seleccionar salón</option>
              {salones.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="grupo-ciclo" className={labelCls}>Ciclo Escolar *</label>
            <input id="grupo-ciclo" required placeholder="Ej: 2025-1" value={form.cicloEscolar} onChange={(e) => setForm({ ...form, cicloEscolar: e.target.value })} className={inputCls} />
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
        title="Dar de baja grupo"
        message={
          <>
            ¿Estás seguro de que deseas dar de baja el grupo{" "}
            <strong className="text-gray-900 dark:text-gray-100">#{deleteTarget?.id}</strong>? Las
            inscripciones asociadas quedarán inactivas.
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
