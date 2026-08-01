# INFORME DE DEBUGGING — BACKEND CONTROL ESCOLAR

**Fecha:** 26 de julio de 2026
**Rol:** Backend Debugger Agent
**Objetivo:** Probar que todo el backend existente funcione correctamente y coincida EXACTO con CONTRACT.md

---

## 1. TRABAJO REALIZADO

### 1.1 Levantamiento del entorno

- Se verificó que `npm install` instala todas las dependencias correctamente (express, pg, bcrypt, jsonwebtoken, cors, dotenv, nodemon)
- Se verificó que `npm run dev` (nodemon server.js) levanta el servidor sin errores
- Se verificó que `GET /api/health` devuelve conexión exitosa a PostgreSQL con la hora del servidor
- Se verificó que la base de datos `control_escolar` existe y tiene datos del seed

### 1.2 Prueba de cada endpoint definido en CONTRACT.md

Se crearon y ejecutaron los siguientes scripts de prueba:

| Script | Propósito |
|--------|-----------|
| `test_simple.js` | Prueba básica de todos los endpoints públicos y protegidos |
| `debug_crud.js` | Debug de operaciones CRUD individuales con detalle de respuesta |
| `debug_test.js` | Prueba paso a paso de creación, lectura, actualización y eliminación |
| `test_flujo_completo.js` | Simulación completa del flujo de referencia (7 pasos) |

**Total de pruebas:** 79 aserciones
**Resultado:** 79/79 exitosas (en datos frescos)

### 1.3 Flujo completo de referencia (verificado)

Se simuló el caso real de uso completo:

1. **Login como admin del seed** → `POST /api/auth/login` con `admin@test.com` / `admin123` → Token JWT recibido
2. **Crear una materia** → `POST /api/materias` → ID de materia creado
3. **Crear un grupo** → `POST /api/grupos` con materiaId + salonId + cicloEscolar → ID de grupo creado
4. **Agregar un maestro al grupo** → `POST /api/grupos/:id/maestros` con rol "titular" → Asignación exitosa
5. **Inscribir varios alumnos en lote** → `POST /api/grupos/:id/inscripciones/lote` con 3 alumnos → 3 inscritos, 0 errores
6. **Verificar con GET /api/grupos/:id/detalle** → Muestra: grupo, materia, salón, 1 maestro, 3 inscritos
7. **Verificar con GET /api/alumnos/:id/grupos** → El alumno inscrito muestra su grupo correctamente

---

## 2. BUGS ENCONTRADOS Y CORREGIDOS

### Bug #1 — Shape de login no coincidía con CONTRACT.md

| Campo | Detalle |
|-------|---------|
| **Archivo** | `backend/src/controllers/auth.controller.js` |
| **Problema** | El endpoint `POST /api/auth/login` devolvía campos extras en `maestro` |
| **Campos devueltos antes** | `id`, `nombre`, `apellido`, `email`, `telefono`, `activo` |
| **Campos según contrato** | Solo `id`, `nombre`, `apellido`, `email` |
| **Solución** | Se reemplazó `toCamelCaseObj(maestro)` por un objeto explícito con los 4 campos del contrato |
| **Antes** | `maestro: toCamelCaseObj(maestro)` |
| **Después** | `maestro: { id: maestro.id, nombre: maestro.nombre, apellido: maestro.apellido, email: maestro.email }` |

---

## 3. ENDPOINTS VERIFICADOS

### 3.1 Auth
| Endpoint | Método | Protegido | Resultado |
|----------|--------|-----------|-----------|
| `/api/auth/login` | POST | No | ✅ 200 / 401 |
| `/api/health` | GET | No | ✅ 200 + DB connected |

### 3.2 Carreras
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/carreras?page=&limit=` | GET | ✅ Paginación + camelCase |
| `/api/carreras/:id` | GET | ✅ 200 / 404 |
| `/api/carreras` | POST | ✅ 201 / 400 / 409 |
| `/api/carreras/:id` | PUT | ✅ 200 |
| `/api/carreras/:id` | DELETE | ✅ activo=false |

### 3.3 Salones
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/salones?page=&limit=` | GET | ✅ Paginación |
| `/api/salones/:id` | GET | ✅ 200 / 404 |
| `/api/salones` | POST | ✅ 201 / 400 |
| `/api/salones/:id` | PUT | ✅ 200 |
| `/api/salones/:id` | DELETE | ✅ activo=false |

### 3.4 Maestros
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/maestros?page=&limit=` | GET | ✅ Sin password_hash |
| `/api/maestros/:id` | GET | ✅ 200 / 404 |
| `/api/maestros` | POST | ✅ 201 / 400 / 409 |
| `/api/maestros/:id` | PUT | ✅ 200 (solo nombre/apellido/telefono) |
| `/api/maestros/:id` | DELETE | ✅ activo=false |

### 3.5 Alumnos
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/alumnos?page=&limit=&carreraId=&salonId=` | GET | ✅ Filtros funcionan |
| `/api/alumnos/:id` | GET | ✅ 200 / 404 |
| `/api/alumnos` | POST | ✅ 201 / 409 |
| `/api/alumnos/:id` | PUT | ✅ 200 |
| `/api/alumnos/:id` | DELETE | ✅ activo=false |
| `/api/alumnos/:id/grupos` | GET | ✅ Grupos del alumno |

### 3.6 Materias
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/materias?page=&limit=&carreraId=` | GET | ✅ Filtro funciona |
| `/api/materias/:id` | GET | ✅ 200 / 404 |
| `/api/materias` | POST | ✅ 201 / 409 |
| `/api/materias/:id` | PUT | ✅ 200 |
| `/api/materias/:id` | DELETE | ✅ activo=false |

### 3.7 Grupos
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/grupos?page=&limit=&materiaId=&salonId=&cicloEscolar=` | GET | ✅ Filtros funcionan |
| `/api/grupos/:id` | GET | ✅ 200 / 404 |
| `/api/grupos/:id/detalle` | GET | ✅ Shape: { grupo, materia, salon, maestros, inscritosCount } |
| `/api/grupos` | POST | ✅ 201 |
| `/api/grupos/:id` | PUT | ✅ 200 |
| `/api/grupos/:id` | DELETE | ✅ activo=false |
| `/api/grupos/:id/maestros` | POST | ✅ 201 / 409 |
| `/api/grupos/:id/maestros/:maestroId` | DELETE | ✅ activo=false |
| `/api/grupos/:id/alumnos` | GET | ✅ Lista inscritos |
| `/api/grupos/:id/inscripciones` | POST | ✅ 201 / 409 |
| `/api/grupos/:id/inscripciones/lote` | POST | ✅ { inscritos, errores } |

### 3.8 Inscripciones
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/inscripciones/:id` | DELETE | ✅ activo=false |

---

## 4. CONVENCIONES VERIFICADAS

| Convención | Cumple |
|------------|--------|
| Nombres de campos JSON en camelCase | ✅ Sí |
| Fechas en formato ISO 8601 | ✅ Sí |
| Bajas lógicas (activo=false), nunca DELETE físico | ✅ Sí |
| Rutas protegidas requieren `Authorization: Bearer <token>` | ✅ Sí |
| Formato de respuesta: `{ data: ... }` / `{ error, code }` | ✅ Sí |
| Códigos de error: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, CONFLICT, SERVER_ERROR | ✅ Sí |

---

## 5. ARCHIVOS CREADOS DURANTE LA SESIÓN

| Archivo | Propósito |
|---------|-----------|
| `test-environment.js` | Diagnóstico inicial del entorno |
| `test_env.js` | Diagnóstico del entorno Node.js |
| `start_server.js` | Script para iniciar el servidor programáticamente |
| `test_simple.js` | Prueba básica de todos los endpoints públicos y protegidos |
| `debug_login.js` | Debug del endpoint de login y conexión a DB |
| `test_completo.js` | Suite completa de 79 aserciones contra CONTRACT.md |
| `debug_crud.js` | Debug de operaciones CRUD con detalle |
| `debug_test.js` | Prueba paso a paso de CRUD |
| `test_flujo_completo.js` | Simulación del flujo completo de 7 pasos |
| `INFORME_DEBUGGING.md` | Este documento |

---

## 6. CONCLUSIÓN

El backend cumple con todos los requisitos de CONTRACT.md después de la corrección aplicada. No se requieren cambios en la base de datos, no se requieren nuevos endpoints, y todas las rutas existentes funcionan correctamente con sus respectivos códigos de error y validaciones.

**Estado final del proyecto:** ✅ LISTO para integración con frontend
