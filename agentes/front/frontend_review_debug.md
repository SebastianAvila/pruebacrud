# Debug — Auditoría Frontend

## Qué hice y cómo

### 1. Lectura del contrato
Leí `CONTRACT.md` desde la raíz del proyecto para entender los endpoints, el schema de base de datos, las convenciones de naming (camelCase en requests/responses), el formato de respuestas (lista, item único, error) y los códigos de error definidos.

### 2. Exploración de la estructura del frontend
Usé `Get-ChildItem -Recurse` para mapear todo el contenido de `frontend/src/` y `frontend/app/`. La estructura encontrada fue:

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── alumnos/page.tsx
│   ├── maestros/page.tsx
│   ├── carreras/page.tsx
│   ├── salones/page.tsx
│   ├── materias/page.tsx
│   ├── grupos/page.tsx
│   └── grupos/[id]/page.tsx
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Table.tsx
│   │   ├── FormModal.tsx
│   │   └── ProtectedRoute.tsx
│   └── lib/
│       └── api.js
├── .env.local
├── package.json
├── tailwind.config (no leído, no relevante)
└── ...
```

### 3. Lectura de cada archivo fuente
Leí todos los archivos relevantes uno por uno:
- `CONTRACT.md` (fuente de verdad)
- `frontend/src/lib/api.js` (único lugar donde se define la URL base)
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/Table.tsx`
- `frontend/src/components/FormModal.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx` (redirección home)
- `frontend/app/login/page.tsx`
- `frontend/app/alumnos/page.tsx`
- `frontend/app/maestros/page.tsx`
- `frontend/app/carreras/page.tsx`
- `frontend/app/salones/page.tsx`
- `frontend/app/materias/page.tsx`
- `frontend/app/grupos/page.tsx`
- `frontend/app/grupos/[id]/page.tsx` (detalle de grupo con maestros, inscripciones)
- `frontend/app/globals.css`
- `frontend/.env.local` (verificar que no tenga credenciales)

### 4. Verificaciones específicas

#### console.log de debug
Busqué `console.log` en todos los archivos `.tsx`, `.ts` y `.js` de `app/` y `src/` con `Select-String`. No se encontró ninguno.

#### URLs hardcodeadas fuera de api.js
Busqué `http://`, `https://` y `localhost` en `app/` y `src/`. La única coincidencia fue en `api.js` (línea 1), que es la ubicación correcta.

#### Credenciales hardcodeadas
Busqué las palabras `password`, `secret`, `token`, `apikey` en los archivos fuente del frontend. No se encontró nada en el código. El `.env.local` solo contiene la URL de la API.

#### Patrón consistente en páginas de listado
Verifiqué que cada página de listado siguiera el mismo patrón: `ProtectedRoute` → estado de carga con "Cargando..." → banner de error rojo → `<Table>` → paginación → `<FormModal>` para crear/editar. Todas las páginas lo siguen.

#### Validación de formularios
Verifiqué que los campos requeridos tuvieran el atributo `required` de HTML y estuvieran marcados con `*` en el label. Todas las páginas son consistentes en esto.

#### Feedback visual de carga
Todas las páginas tienen `loading` con texto "Cargando..." y los botones de submit muestran "Guardando..." / "Ingresando..." cuando están en estado de guardado.

#### Confirmación antes de acciones destructivas
Verifiqué que `handleDelete` en todas las páginas usara `confirm()`. También verifiqué `handleRemoveMaestro` en el detalle de grupo. Encontré que `handleInscribirLote` (inscripción masiva en grupos/[id]) NO tiene confirmación.

#### Limpieza de formulario tras submit exitoso
Verifiqué que después de `setModalOpen(false)` se llame a `fetchData()` para refrescar la lista. Todas las páginas lo hacen correctamente.

### 5. Resultado

Total de archivos revisados: 19
Total de hallazgos encontrados: 10 (2 correctivos, 1 de mejora, 7 menores/info)
Veredicto: ⚠️ Aprobado con pendientes menores
