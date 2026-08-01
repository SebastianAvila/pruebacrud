# Frontend — Qué falta para cerrar el MVP

> Estado actualizado el **1 de agosto de 2026** tras el review de la sesión. Los pendientes 1, 2, 3, 5 y 6 quedaron **resueltos** en el código actual; solo queda el pendiente 4 como deuda técnica opcional (refactorización).

---

## Pendientes

### ✅ 1. Confirmación en inscripción masiva — RESUELTO (ya no aplica)

**Archivo:** `frontend/app/grupos/[id]/page.tsx`  
**Estado:** La inscripción masiva es un **alta**, no una baja. El flujo actual muestra `toast.success()`/`toast.info()` al completar y no requiere confirmación destructiva. Se descartó el uso de `confirm()` (no aplica a altas).

### ✅ 2. Inconsistencia en manejo de errores — RESUELTO

**Estado:** El código actual no usa `alert()`. Todas las páginas muestran errores como banner rojo inline (`setError`) y toasts (`ToastProvider` + `useToast`). Consistentes.

### ✅ 3. Modal no protegido contra cierre durante guardado — RESUELTO

**Componentes:** `src/components/Modal.tsx`, `src/components/FormModal.tsx`  
**Estado:** `Modal` tiene prop `disableClose` que bloquea overlay, Escape y botón X. `FormModal` pasa `disableClose={saving}`. Todos los modales de CRUD lo usan.

### 🟢 4. Duplicación de código entre páginas CRUD — PENDIENTE OPCIONAL (refactorización)

**Archivos:** Todas las páginas de listado (alumnos, maestros, carreras, salones, materias, grupos)  
**Problema:** Cada página repite el patrón CRUD (estados, fetchData, handleSubmit, handleDelete, paginación, banners, FormModal). No bloquea nada; es deuda técnica de mantenibilidad.  
**Corrección sugerida (si se decide hacer):** custom hook `useCrud(endpoint, options)` y/o componente `<CrudPage>`. **No** refactorizar sin motivo.

### ✅ 5. Falta de feedback visual al completar acciones exitosas — RESUELTO

**Archivo:** `frontend/app/grupos/[id]/page.tsx`  
**Estado:** Se usa `ToastProvider` con `toast.success(...)` / `toast.info(...)` en asignar maestro, remover maestro, inscripción individual, inscripción masiva y remover inscripción.

### ✅ 6. Campo con nombre dudoso en grupo detalle — RESUELTO

**Archivo:** `frontend/app/grupos/[id]/page.tsx`  
**Estado:** Confirmado contra la API real (1-ago-2026): `GET /api/grupos/:id/alumnos` devuelve `inscripcionId` en camelCase. El código actual usa `a.inscripcionId` y `DELETE /api/inscripciones/:id` funciona con ese valor.

---

## Pendientes abiertos (al cierre de la sesión)

| Nivel | Cantidad | Descripción |
|---|---|---|
| 🔴 Bloqueo | 0 | Nada impide el uso del MVP |
| 🟢 Refactorización opcional | 1 | Duplicación de código entre páginas CRUD (pendiente 4) |

---

## Notas de entorno (importantes para la siguiente sesión)

- **Chrome del sistema está roto** (error SxS "la configuración en paralelo no es correcta"). El navegador MCP no puede lanzarse. Para pruebas visuales usar el Chromium empaquetado en `C:\Users\sebas\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe`, o validar vía HTTP/`Invoke-WebRequest`.
- **Cambiar `next.config.ts` en caliente puede colgar el dev server** con `Could not find the module ... in the React Client Manifest` (bug de caché Turbopack). Solución: detener el proceso, borrar `frontend/.next`, `npm run dev` de nuevo.
- Hay **dos lockfiles** (raíz del repo y `frontend/`); `next.config.ts` ya fija `turbopack.root` para evitar el warning de workspace root.
- Credenciales demo: `admin@test.com` / `admin123`.
