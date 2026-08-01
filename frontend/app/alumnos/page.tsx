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

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  carreraId: number | null;
  salonId: number | null;
  fechaNacimiento: string | null;
  activo: boolean;
}
interface Carrera { id: number; nombre: string; }
interface Salon { id: number; nombre: string; }

const emptyForm = { nombre: "", apellido: "", matricula: "", carreraId: "", salonId: "", fechaNacimiento: "" };
const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const btnPagination = "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none";

export default function AlumnosPage() {
  const toast = useToast();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Alumno | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Alumno | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { document.title = "Alumnos | Control Escolar"; }, []);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const [alRes, caRes, saRes] = await Promise.all([
        api.get(`/alumnos?page=${p}&limit=${limit}`),
        api.get("/carreras?limit=100"),
        api.get("/salones?limit=100"),
      ]);
      setAlumnos(alRes.data);
      setTotal(alRes.total || 0);
      setCarreras(caRes.data);
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
        const [alRes, caRes, saRes] = await Promise.all([
          api.get(`/alumnos?page=1&limit=${limit}`),
          api.get("/carreras?limit=100"),
          api.get("/salones?limit=100"),
        ]);
        if (cancelled) return;
        setAlumnos(alRes.data);
        setTotal(alRes.total || 0);
        setCarreras(caRes.data);
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
  const openEdit = (a: Alumno) => {
    setEditing(a);
    setForm({
      nombre: a.nombre,
      apellido: a.apellido,
      matricula: a.matricula,
      carreraId: a.carreraId ? String(a.carreraId) : "",
      salonId: a.salonId ? String(a.salonId) : "",
      fechaNacimiento: a.fechaNacimiento || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: { nombre: string; apellido: string; matricula: string; carreraId?: number; salonId?: number; fechaNacimiento?: string } = { nombre: form.nombre.trim(), apellido: form.apellido.trim(), matricula: form.matricula.trim() };
      if (form.carreraId) body.carreraId = Number(form.carreraId);
      if (form.salonId) body.salonId = Number(form.salonId);
      if (form.fechaNacimiento) body.fechaNacimiento = form.fechaNacimiento;
      if (editing) {
        await api.put(`/alumnos/${editing.id}`, body);
        toast.success("Alumno actualizado exitosamente");
      } else {
        await api.post("/alumnos", body);
        toast.success("Alumno creado exitosamente");
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
      await api.delete(`/alumnos/${deleteTarget.id}`);
      toast.success(`Alumno ${deleteTarget.nombre} ${deleteTarget.apellido} dado de baja`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const carreraNameById = new Map(carreras.map((c) => [c.id, c.nombre]));
  const salonNameById = new Map(salones.map((s) => [s.id, s.nombre]));

  const columns = [
    { key: "matricula", label: "Matrícula" },
    { key: "nombre", label: "Nombre", render: (a: Alumno) => `${a.nombre} ${a.apellido}` },
    { key: "carrera", label: "Carrera", render: (a: Alumno) => (a.carreraId ? carreraNameById.get(a.carreraId) || "—" : "—") },
    { key: "salon", label: "Salón", render: (a: Alumno) => (a.salonId ? salonNameById.get(a.salonId) || "—" : "—") },
    { key: "fechaNacimiento", label: "Fecha Nac.", render: (a: Alumno) => a.fechaNacimiento || "—" },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <PageHeader
        title="Alumnos"
        description={`${total.toLocaleString("es-MX")} alumnos activos en el sistema`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo alumno
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
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <>
          <Table
            columns={columns}
            data={alumnos}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            emptyTitle="No hay alumnos registrados"
            emptyDescription="Crea tu primer alumno para comenzar a poblar el sistema."
            emptyActionLabel="Crear primer alumno"
            onEmptyAction={openCreate}
          />
          {totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-4 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => { setPage(page - 1); fetchData(page - 1); }}
                className={btnPagination}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums" aria-current="page">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => { setPage(page + 1); fetchData(page + 1); }}
                className={btnPagination}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Alumno" : "Nuevo Alumno"}
        saving={saving}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="alumno-nombre" className={labelCls}>Nombre *</label>
            <input id="alumno-nombre" required autoComplete="given-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="alumno-apellido" className={labelCls}>Apellido *</label>
            <input id="alumno-apellido" required autoComplete="family-name" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="alumno-matricula" className={labelCls}>Matrícula *</label>
            <input id="alumno-matricula" required autoComplete="off" spellCheck={false} value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="alumno-carrera" className={labelCls}>Carrera</label>
            <select id="alumno-carrera" value={form.carreraId} onChange={(e) => setForm({ ...form, carreraId: e.target.value })} className={inputCls}>
              <option value="">Sin carrera</option>
              {carreras.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="alumno-salon" className={labelCls}>Salón</label>
            <select id="alumno-salon" value={form.salonId} onChange={(e) => setForm({ ...form, salonId: e.target.value })} className={inputCls}>
              <option value="">Sin salón</option>
              {salones.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="alumno-fecha" className={labelCls}>Fecha de nacimiento</label>
            <input id="alumno-fecha" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-navy-800 disabled:bg-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:outline-none">
              {saving && <span className="spinner" aria-hidden="true" />}
              {saving ? "Guardando…" : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Dar de baja alumno"
        message={
          <>
            ¿Estás seguro de que deseas dar de baja a{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {deleteTarget?.nombre} {deleteTarget?.apellido}
            </strong>{" "}
            ({deleteTarget?.matricula})? Esta acción es reversible pero lo ocultará del sistema.
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
