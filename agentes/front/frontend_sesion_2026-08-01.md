# Sesión Frontend — 1 de agosto de 2026

## Objetivo
Revisar el frontend construido previamente, verificar que cumpla CONTRACT.md, corregir pendientes y dejar el MVP funcionando.

## Verificaciones realizadas

### Build y lint
- `npm run build` ✅ — 0 errores, 12 rutas generadas (login, dashboard, home redirect, 6 listados CRUD, grupos, grupos/[id]).
- `npm run lint` ✅ — sin errores.

### API real (backend en :4000)
Todos los endpoints del frontend verificados contra la API real (no mocks):
- `POST /api/auth/login` con `admin@test.com` / `admin123` ✅ (token JWT)
- `GET /api/alumnos`, `/maestros`, `/carreras`, `/salones`, `/materias`, `/grupos` ✅ (formato `{ data, total, page, limit }`)
- `POST /api/carreras` ✅ (creación; dato de prueba id=11 posteriormente **borrado** para no dejar basura)
- `GET /api/grupos/:id` y `GET /api/grupos/:id/alumnos` ✅ — confirmado que el backend devuelve `inscripcionId` en camelCase
- `POST/DELETE` asignación de maestro a grupo, inscripción individual/masiva y remoción de inscripción ✅

### Rutas en dev
- Todas las rutas sirven HTTP 200, incluida `/grupos/1`.

## Arreglos aplicados

### 1. `frontend/next.config.ts`
- Agregado `turbopack: { root: path.resolve(process.cwd()) }` para silenciar el warning de múltiples lockfiles (raíz del repo + `frontend/`). Documentado en la doc oficial de Next 16 (ver `frontend/node_modules/next/dist/docs/`).

### 2. `frontend/DOCUMENTACION.md`
- El árbol de archivos mencionaba `src/components/Navbar.tsx` que no existe. Actualizado al estado real: `AppShell`, `Sidebar`, `Header` (y el resto de componentes).

### 3. Caché Turbopack corrupta
- El dev server colgaba con `Could not find the module "[project]/frontend/app/dashboard/page.tsx#default" in the React Client Manifest` tras cambiar `next.config.ts` en caliente.
- Solución: detener proceso, borrar `frontend/.next`, `npm run dev` de nuevo. Estable después.

## Pendientes de auditoría previa — estado final
Ver `frontend_pendientes.md` (actualizado). Resueltos: 1, 2, 3, 5, 6. Abierto opcional: 4 (refactorización CRUD).

## Bloqueos de entorno
- **Chrome del sistema roto** (error SxS "configuración en paralelo"). El navegador MCP falla con `spawn UNKNOWN`. No fue posible probar visualmente en navegador; validación vía HTTP/API.
- Posible alternativa futura: Chromium empaquetado en `C:\Users\sebas\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe`.

## Estado final
- MVP frontend completo y funcional contra la API real.
- Credenciales demo: `admin@test.com` / `admin123`.
- Dev server corriendo en :3000, backend en :4000.
