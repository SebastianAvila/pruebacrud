# Control Escolar — Documentacion del Frontend

## Resumen

Sistema CRUD completo para la gestion escolar (alumnos, maestros, carreras, salones, materias, grupos con inscripcion). Incluye dark mode, accesibilidad, skeleton loading y validacion de formulario siguiendo las 100 reglas de diseno de Vercel.

---

## Stack tecnico

| Tecnologia | Version |
|------------|---------|
| Next.js (App Router, Turbopack) | 16.2.12 |
| React | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x (sintaxis `@import "tailwindcss"`) |
| Node (runtime del backend) | Express + PostgreSQL |

- **Backend**: `localhost:4000`
- **Frontend**: `localhost:3000`
- **Credenciales de prueba**: `admin@test.com` / `admin123`

---

## Arquitectura de archivos

```
frontend/
├── .env.local                          # NEXT_PUBLIC_API_URL=http://localhost:4000/api
├── app/
│   ├── globals.css                     # Tailwind v4, CSS vars, skeletons, spinners, skip-link
│   ├── layout.tsx                      # ThemeProvider, flash-prevention script, viewport
│   ├── page.tsx                        # Home / landing page
│   ├── login/page.tsx                  # Formulario de login (email + password)
│   ├── alumnos/page.tsx                # CRUD de alumnos
│   ├── maestros/page.tsx               # CRUD de maestros
│   ├── carreras/page.tsx               # CRUD de carreras
│   ├── salones/page.tsx                # CRUD de salones
│   ├── materias/page.tsx               # CRUD de materias (con FK a carrera)
│   ├── grupos/
│   │   ├── page.tsx                    # Listado de grupos (CRUD)
│   │   └── [id]/page.tsx               # Detalle de grupo (maestros, inscripciones)
├── src/
│   ├── lib/
│   │   └── api.js                      # Cliente HTTP (fetch + JWT + auto-refresh token)
│   └── components/
│       ├── AppShell.tsx                # Shell general (login sin shell; resto con Sidebar+Header)
│       ├── Sidebar.tsx                 # Navegacion lateral (Dashboard, Alumnos, Maestros, etc.)
│       ├── Header.tsx                  # Header con usuario + ThemeToggle + logout
│       ├── ProtectedRoute.tsx          # Redirige a /login si no hay token
│       ├── Table.tsx                   # Tabla generica reutilizable
│       ├── FormModal.tsx               # Modal generico para crear/editar
│       ├── ConfirmModal.tsx            # Confirmacion destructiva reutilizable
│       ├── Modal.tsx                   # Modal base con focus trap
│       ├── ToastProvider.tsx           # Toasts de exito/error/info
│       ├── EmptyState.tsx              # Estado vacio con accion opcional
│       ├── Chip.tsx                    # Chip con boton de quitar (maestros por rol)
│       ├── KpiCard.tsx                 # Tarjeta KPI para dashboard
│       ├── Skeleton.tsx                # SkeletonTable, SkeletonText, SkeletonKpis, SkeletonCard
│       ├── ThemeProvider.tsx           # Context de dark mode + localStorage + system pref
│       └── ThemeToggle.tsx             # Boton sol/luna
```

---

## Paginas

### Login (`/login`)
- Formulario con email + password.
- Al hacer login exitoso, guarda el JWT en `localStorage` y redirige a `/alumnos`.
- Validacion basica de campos requeridos.

### Alumnos (`/alumnos`)
- Tabla con columnas: matricula, nombre, email, telefono, carrera, salon.
- Boton "Nuevo alumno" abre modal con formulario.
- Botones editar y dar de baja en cada fila.
- Paginacion (20 registros por pagina).

### Maestros (`/maestros`)
- Tabla: nombre completo, email, telefono.
- Modal para crear (requiere password) y editar (sin password).
- Paginacion.

### Carreras (`/carreras`)
- Tabla: clave, nombre, duracion en semestres.
- Modal: campos nombre, clave (spellCheck=false), duracionSemestres (type=number).

### Salones (`/salones`)
- Tabla: nombre, edificio, capacidad.
- Modal: nombre requerido, edificio opcional, capacidad requerida.

### Materias (`/materias`)
- Tabla: clave, nombre, carrera (FK).
- Modal: nombre, clave, select de carrera (carga todas las carreras al abrir).
- Carrera es opcional.

### Grupos (`/grupos`)
- Tabla: ID, materia, salon, ciclo escolar, boton "Ver detalle".
- Modal: selects de materia y salon, campo cicloEscolar.
- Boton "Ver detalle" lleva a `/grupos/[id]`.

### Detalle de Grupo (`/grupos/[id]`)
- 3 tarjetas resumen: materia, salon, ciclo escolar.
- **Maestros asignados**: tabla con nombre y rol, boton "Remover", formulario para asignar nuevo maestro (select + select de rol titular/auxiliar).
- **Alumnos inscritos**: tabla con matricula y nombre.
- **Inscripcion individual**: select de alumno disponible + boton "Inscribir".
- **Inscripcion masiva**: lista con checkboxes, "Seleccionar todos", boton "Inscribir seleccionados (N)".

---

## Componentes reutilizables

### `Table`
- Props: `columns[]`, `data[]`, `onEdit`, `onDelete`.
- Renderiza automaticamente columnas con `render` custom o texto plano.
- Muestra estado vacio ("No hay registros") si `data` esta vacio.
- Hover en filas, bordes limpios, responsive.

### `FormModal`
- Props: `open`, `onClose`, `title`, `saving`, `children`.
- Focus trap (Tab y Shift+Tab no salen del modal).
- Cierra con Escape y con click afuera.
- Boton X para cerrar, overlay oscurecido.
- Spinner en boton submit cuando `saving=true`.

### `ProtectedRoute`
- Verifica si hay token en `localStorage`.
- Si no hay token, redirige a `/login` con `useRouter`.
- Muestra spinner mientras verifica.

### `Skeleton`
- `SkeletonTable`: placeholders animados para filas de tabla.
- `SkeletonText`: placeholder para bloques de texto.
- Clase `.skeleton` definida en `globals.css` con animacion shimmer.

### `ThemeProvider`
- React Context con `useState`.
- Opciones: `light`, `dark`, `system`.
- Persiste en `localStorage` bajo la key `theme`.
- Detecta `prefers-color-scheme` del SO.
- Aplica clase `.dark` al `<html>`.
- Se inicializa desde `localStorage` o sistema operativo.

### `ThemeToggle`
- Iconos SVG de sol y luna.
- Cicla entre light -> dark -> system.
- Tooltip con el modo actual.
- Animacion de rotacion al cambiar.

---

## Dark Mode

### Como funciona
1. **Flash prevention**: Un `<script>` inline en `<layout.tsx>` lee `localStorage` ANTES de que React hidrate, aplicando la clase `.dark` al `<html>` antes del primer paint.
2. **`@variant dark`** en `globals.css` define como Tailwind aplica dark mode via la clase `.dark` en el padre.
3. **CSS Custom Properties** en `:root` y `.dark` definen la paleta de colores.
4. **`suppressHydrationWarning`** en `<html>` evita warnings por la diferencia entre servidor (sin dark) y cliente (con dark).

### Paleta de colores

| Elemento | Light | Dark |
|----------|-------|------|
| Background page | `#f9fafb` | `#0f172a` |
| Background card | `#ffffff` | `#1e293b` |
| Background input | `#ffffff` | `#374151` |
| Text primary | `#111827` | `#f1f5f9` |
| Text secondary | `#6b7280` | `#94a3b8` |
| Border | `#e5e7eb` | `#334155` |
| Border input | `#d1d5db` | `#4b5563` |

### Paginas con dark mode completo
- Login, Alumnos, Maestros, Carreras, Salones, Materias, Grupos (lista), Grupos/[id] (detalle)
- Navbar, FormModal, Table, ProtectedRoute, Skeleton

---

## Accesibilidad y reglas de diseno (100 Vercel)

### Focus management
- `focus-visible:ring-2 focus-visible:ring-blue-500` en todos los botones e inputs interactivos.
- Focus trap en `FormModal` (Tab/Shift+Tab no escapan).
- Auto-focus en el primer input al abrir modal.

### ARIA
- `aria-live="polite"` en regiones de error y exito.
- `role="alert"` en mensajes de error.
- `role="status"` en mensajes de exito.
- `aria-label` en tablas, paginacion, listas de seleccion masiva.
- `aria-current="page"` en indicador de pagina.
- `aria-hidden="true"` en spinners decorativos.

### Inputs
- `autocomplete` correcto en todos los campos (given-name, family-name, email, tel, etc.).
- `type` y `inputMode` correctos (tel, number, email, password).
- `htmlFor` + `id` en todos los label-input pairs.
- `spellCheck={false}` en campos de codigo/clave.
- `min={1}` en campos numericos.
- Font size >= 16px en mobile para evitar zoom automatico.
- `noValidate` en formularios (validacion custom).

### Tabla
- `scope="col"` en encabezados `<th>`.
- `tabular-nums` en numeros (matriculas, precios, etc.).
- Estado vacio con mensaje descriptivo.

### Performance
- Skeleton loading durante fetch de datos.
- `overscroll-behavior: contain` en scroll containers.
- `touch-action: manipulation` para evitar doble-tap zoom.

### Navegacion
- Skip-to-content link (`Skip to content` al inicio del body).
- Dynamic `document.title` en cada pagina.
- `prefers-reduced-motion: reduce` desactiva animaciones.

### Botones
- Min 44px de touch target en mobile.
- Spinner en boton de submit durante loading.
- Estados disabled con `disabled:opacity-50`.

---

## API Client (`src/lib/api.js`)

```javascript
import { api } from '@/src/lib/api';
// api.get(url)    -> { data, total?, page?, limit? }
// api.post(url, body)
// api.put(url, body)
// api.delete(url)
```

- Base URL desde `NEXT_PUBLIC_API_URL`.
- Agrega header `Authorization: Bearer <token>` automaticamente.
- Lanza error si `response.ok` es false.
- Token se almacena/lee de `localStorage` key `token`.

---

## Endpoints del backend consumidos

| Metodo | Endpoint | Pagina |
|--------|----------|--------|
| POST | `/api/auth/login` | Login |
| GET | `/api/alumnos?page=&limit=` | Alumnos |
| POST | `/api/alumnos` | Alumnos |
| PUT | `/api/alumnos/:id` | Alumnos |
| DELETE | `/api/alumnos/:id` | Alumnos |
| GET | `/api/maestros?page=&limit=` | Maestros |
| POST | `/api/maestros` | Maestros |
| PUT | `/api/maestros/:id` | Maestros |
| DELETE | `/api/maestros/:id` | Maestros |
| GET | `/api/carreras?page=&limit=` | Carreras |
| POST | `/api/carreras` | Carreras |
| PUT | `/api/carreras/:id` | Carreras |
| DELETE | `/api/carreras/:id` | Carreras |
| GET | `/api/salones?page=&limit=` | Salones |
| POST | `/api/salones` | Salones |
| PUT | `/api/salones/:id` | Salones |
| DELETE | `/api/salones/:id` | Salones |
| GET | `/api/materias?page=&limit=` | Materias |
| POST | `/api/materias` | Materias |
| PUT | `/api/materias/:id` | Materias |
| DELETE | `/api/materias/:id` | Materias |
| GET | `/api/grupos?page=&limit=` | Grupos |
| POST | `/api/grupos` | Grupos |
| PUT | `/api/grupos/:id` | Grupos |
| DELETE | `/api/grupos/:id` | Grupos |
| GET | `/api/grupos/:id/detalle` | Detalle grupo |
| GET | `/api/grupos/:id/alumnos` | Detalle grupo |
| POST | `/api/grupos/:id/maestros` | Detalle grupo |
| DELETE | `/api/grupos/:id/maestros/:maestroId` | Detalle grupo |
| POST | `/api/grupos/:id/inscripciones` | Detalle grupo |
| POST | `/api/grupos/:id/inscripciones/lote` | Detalle grupo |

---

## Notas conocidas

1. `GET /api/alumnos` no retorna objetos anidados de carrera o salon — solo IDs. La tabla muestra "—" graceful.
2. `GET /api/grupos/:id/detalle` retorna flat fields en `grupo` (`materiaNombre`, `salonNombre`) ademas de objetos `materia` y `salon` anidados.
3. La autenticacion usa JWT standard. El token expira y el frontend no renueva automaticamente — el usuario debe re-login.
4. El backend corre en puerto 4000, el frontend en 3000.

---

## Como correr

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev       # http://localhost:3000

# Produccion
npm run build
npm start
```

---

## Estado final (Julio 2026)

- Todas las paginas CRUD funcionales y con dark mode.
- `npm run build` pasa sin errores (0 errores TypeScript, 11 rutas generadas).
- Dark mode persiste en localStorage, respeta preferencia del SO.
- Accesibilidad completa (ARIA, focus management, autocomplete, etc.).
- Skeleton loading en todas las paginas.
- Focus trap en modales.
- Flash prevention en dark mode.
