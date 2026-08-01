"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Phone, Mail } from "lucide-react";
import { api } from "@/src/lib/api";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import Table from "@/src/components/Table";
import FormModal from "@/src/components/FormModal";
import ConfirmModal from "@/src/components/ConfirmModal";
import PageHeader from "@/src/components/PageHeader";
import { SkeletonTable } from "@/src/components/Skeleton";
import { useToast } from "@/src/components/ToastProvider";

interface Maestro {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
}

const emptyForm = { nombre: "", apellido: "", email: "", telefono: "", password: "" };
const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const btnPagination = "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function MaestrosPage() {
  const toast = useToast();
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Maestro | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Maestro | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { document.title = "Maestros | Control Escolar"; }, []);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/maestros?page=${p}&limit=${limit}`);
      setMaestros(res.data);
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
        const res = await api.get(`/maestros?page=1&limit=${limit}`);
        if (cancelled) return;
        setMaestros(res.data);
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
  const openEdit = (m: Maestro) => {
    setEditing(m);
    setForm({ nombre: m.nombre, apellido: m.apellido, email: m.email, telefono: m.telefono || "", password: "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/maestros/${editing.id}`, {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          telefono: form.telefono.trim() || null,
        });
        toast.success("Maestro actualizado exitosamente");
      } else {
        await api.post("/maestros", {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim() || null,
          password: form.password,
        });
        toast.success("Maestro creado exitosamente");
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
      await api.delete(`/maestros/${deleteTarget.id}`);
      toast.success(`Maestro ${deleteTarget.nombre} ${deleteTarget.apellido} dado de baja`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre", render: (m: Maestro) => `${m.nombre} ${m.apellido}` },
    { key: "email", label: "Email", render: (m: Maestro) => (
      <span className="inline-flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        {m.email}
      </span>
    ) },
    { key: "telefono", label: "Teléfono", render: (m: Maestro) => m.telefono ? (
      <span className="inline-flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        {m.telefono}
      </span>
    ) : "—" },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Maestros"
        description={`${total.toLocaleString("es-MX")} docentes registrados`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo maestro
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
        <SkeletonTable rows={5} cols={3} />
      ) : (
        <>
          <Table
            columns={columns}
            data={maestros}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            emptyTitle="No hay maestros registrados"
            emptyDescription="Registra a tu primer maestro para poder asignarlo a grupos."
            emptyActionLabel="Crear primer maestro"
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

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Maestro" : "Nuevo Maestro"} saving={saving}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="maestro-nombre" className={labelCls}>Nombre *</label>
            <input id="maestro-nombre" required autoComplete="given-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="maestro-apellido" className={labelCls}>Apellido *</label>
            <input id="maestro-apellido" required autoComplete="family-name" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="maestro-email" className={labelCls}>Email *</label>
            <input id="maestro-email" type="email" required autoComplete="email" spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editing} className={inputCls + " disabled:bg-gray-100 dark:disabled:bg-gray-600"} />
          </div>
          <div>
            <label htmlFor="maestro-telefono" className={labelCls}>Teléfono</label>
            <input id="maestro-telefono" type="tel" autoComplete="tel" inputMode="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputCls} />
          </div>
          {!editing && (
            <div>
              <label htmlFor="maestro-password" className={labelCls}>Contraseña *</label>
              <input id="maestro-password" type="password" required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
            </div>
          )}
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
        title="Dar de baja maestro"
        message={
          <>
            ¿Estás seguro de que deseas dar de baja a{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {deleteTarget?.nombre} {deleteTarget?.apellido}
            </strong>{" "}
            ({deleteTarget?.email})? Esta acción es reversible pero lo ocultará del sistema.
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
