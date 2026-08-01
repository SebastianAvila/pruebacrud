# FRONTEND_CODER.md

## Rol
Eres el agente de frontend. Trabajas SOLO dentro de la carpeta frontend/.
Implementas todas las páginas y componentes necesarios para consumir
la API del backend, siguiendo exactamente CONTRACT.md (raíz del proyecto).

## Entorno — IMPORTANTE
Esta terminal es PowerShell 5.1 en Windows. NO soporta el operador &&
para encadenar comandos. Usa ; en su lugar, o mejor aún, ejecuta un
comando a la vez sin encadenar. Si necesitas correr varias verificaciones,
créalas como un script .js y córrelo con "node archivo.js" en vez de
depender de comandos de shell encadenados.

## Estado actual del proyecto (ya existe, no lo recrees)
- frontend/ ya tiene Next.js + TypeScript + Tailwind instalado (App Router)
- frontend/src/lib/api.js ya existe: cliente fetch base con funciones
  api.get(), api.post(), api.put(), api.delete() que arman la URL desde
  NEXT_PUBLIC_API_URL, agregan el token JWT desde localStorage automático,
  y lanzan error si la respuesta no es ok
- frontend/.env.local ya existe con NEXT_PUBLIC_API_URL=http://localhost:4000/api
- El backend YA está completo y funcionando en localhost:4000 — puedes
  probar contra la API real, no necesitas mocks
- frontend/src/components/ y frontend/src/lib/ existen, listas para usar

## Qué construir
Usa el cliente api.js ya existente (import { api } from '@/lib/api') para
todas las llamadas. No crees un cliente HTTP nuevo.

Páginas a construir (dentro de src/app/):
1. /login → formulario de email + password, guarda el token en localStorage
   al hacer login exitoso, redirige a /alumnos
2. /alumnos → tabla con listado, botón crear, editar y dar de baja
3. /maestros → mismo patrón CRUD
4. /carreras → mismo patrón CRUD
5. /salones → mismo patrón CRUD
6. /materias → mismo patrón CRUD
7. /grupos → listado de grupos, vista de detalle (/grupos/[id]) que muestre
   materia, salón, maestros asignados y alumnos inscritos. Debe incluir:
   - formulario para agregar maestro al grupo
   - formulario de inscripción individual Y botón de inscripción masiva
     (selector múltiple de alumnos + botón "inscribir seleccionados")

Componentes reutilizables sugeridos en src/components/:
- Table.jsx (tabla genérica reutilizable)
- FormModal.jsx (modal genérico para crear/editar)
- ProtectedRoute.jsx (redirige a /login si no hay token)

## Convenciones obligatorias
- Todos los shapes de request/response deben coincidir EXACTO con
  CONTRACT.md (camelCase, estructura { data: ... })
- Maneja estados de loading y error en cada página — no dejes pantallas
  en blanco mientras carga o si falla una petición
- Después de crear/editar/eliminar, refresca el listado automáticamente

## Qué NO hacer
- No toques backend/
- No cambies CONTRACT.md
- No uses librerías externas de estado (redux, zustand) — usa useState/
  useEffect nativos de React, es un MVP
- No hardcodees la URL del backend — siempre a través de api.js

## Al terminar
Reporta: qué páginas quedaron completas, si npm run dev levanta sin
errores, y cualquier endpoint del backend que hayas encontrado que no
se comporte como dice CONTRACT.md (repórtalo, no lo "arregles" tú mismo
modificando el backend).