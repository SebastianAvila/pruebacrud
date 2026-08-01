# Registro de Sesión - Backend API Control Escolar

**Fecha:** 26 de julio de 2026

---

## Resumen

Se construyó el **backend completo** de una API REST para un sistema de control escolar, siguiendo el contrato definido en `CONTRACT.md`. La API está desarrollada con **Node.js + Express + PostgreSQL**.

---

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js |
| Framework | Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT (jsonwebtoken) |
| Hash de passwords | bcrypt |
| Variables de entorno | dotenv |
| CORS | cors |

---

## Estructura del proyecto

```
backend/
├── .env                          # DATABASE_URL, PORT, JWT_SECRET
├── package.json
├── server.js                     # Entrypoint de Express
└── src/
    ├── config/
    │   └── db.js                 # Pool de conexión a PostgreSQL
    ├── middleware/
    │   └── auth.middleware.js    # Verificación de JWT
    ├── models/
    │   ├── alumno.model.js
    │   ├── carrera.model.js
    │   ├── grupo.model.js
    │   ├── inscripcion.model.js
    │   ├── maestro.model.js
    │   ├── materia.model.js
    │   └── salon.model.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── alumno.controller.js
    │   ├── carrera.controller.js
    │   ├── grupo.controller.js
    │   ├── inscripcion.controller.js
    │   ├── maestro.controller.js
    │   ├── materia.controller.js
    │   └── salon.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── alumno.routes.js
    │   ├── carrera.routes.js
    │   ├── grupo.routes.js
    │   ├── inscripcion.routes.js
    │   ├── maestro.routes.js
    │   ├── materia.routes.js
    │   └── salon.routes.js
    └── utils/
        └── response.js           # Utilidades de respuesta (success, error, paginated)
```

---

## Endpoints implementados (35 en total)

### Auth (público - sin token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check de la base de datos |
| `POST` | `/api/auth/login` | Login con email + password, devuelve JWT (expira 24h) |

### Carreras (`/api/carreras`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/carreras` | Listar todas (paginado) |
| `GET` | `/api/carreras/:id` | Obtener por ID |
| `POST` | `/api/carreras` | Crear carrera |
| `PUT` | `/api/carreras/:id` | Actualizar carrera |
| `DELETE` | `/api/carreras/:id` | Baja lógica (activo=false) |

### Salones (`/api/salones`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/salones` | Listar todos (paginado) |
| `GET` | `/api/salones/:id` | Obtener por ID |
| `POST` | `/api/salones` | Crear salón |
| `PUT` | `/api/salones/:id` | Actualizar salón |
| `DELETE` | `/api/salones/:id` | Baja lógica |

### Maestros (`/api/maestros`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/maestros` | Listar todos (paginado) |
| `GET` | `/api/maestros/:id` | Obtener por ID |
| `POST` | `/api/maestros` | Crear maestro (hashea password con bcrypt) |
| `PUT` | `/api/maestros/:id` | Actualizar (solo nombre, apellido, teléfono) |
| `DELETE` | `/api/maestros/:id` | Baja lógica |

### Alumnos (`/api/alumnos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/alumnos` | Listar todos (paginado) |
| `GET` | `/api/alumnos/:id` | Obtener por ID |
| `POST` | `/api/alumnos` | Crear alumno |
| `PUT` | `/api/alumnos/:id` | Actualizar alumno |
| `DELETE` | `/api/alumnos/:id` | Baja lógica |
| `GET` | `/api/alumnos/:id/grupos` | Grupos del alumno |

### Materias (`/api/materias`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/materias` | Listar todas (paginado) |
| `GET` | `/api/materias/:id` | Obtener por ID |
| `POST` | `/api/materias` | Crear materia |
| `PUT` | `/api/materias/:id` | Actualizar materia |
| `DELETE` | `/api/materias/:id` | Baja lógica |

### Grupos (`/api/grupos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/grupos` | Listar todos (paginado) |
| `GET` | `/api/grupos/:id` | Obtener por ID |
| `GET` | `/api/grupos/:id/detalle` | Detalle completo (materia, carrera, salón) |
| `POST` | `/api/grupos` | Crear grupo |
| `PUT` | `/api/grupos/:id` | Actualizar grupo |
| `DELETE` | `/api/grupos/:id` | Baja lógica |
| `POST` | `/api/grupos/:id/maestros` | Asignar maestro al grupo |
| `DELETE` | `/api/grupos/:id/maestros/:maestroId` | Remover maestro del grupo |
| `GET` | `/api/grupos/:id/alumnos` | Listar alumnos del grupo |
| `POST` | `/api/grupos/:id/inscripciones` | Inscribir un alumno |
| `POST` | `/api/grupos/:id/inscripciones/lote` | Inscribir varios alumnos en lote |

### Inscripciones (`/api/inscripciones`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `DELETE` | `/api/inscripciones/:id` | Baja lógica de inscripción |

---

## Convenciones implementadas

- **Bajas lógicas:** Todos los DELETE hacen `activo = false`, nunca DELETE físico
- **Formato de respuesta:** `{ data: ... }` en éxito, `{ error, code }` en error
- **Códigos de error:** `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `CONFLICT`, `SERVER_ERROR`
- **Casing:** JSON en camelCase, columnas de DB en snake_case (el controller hace el mapeo)
- **Autenticación:** Todas las rutas requieren `Authorization: Bearer <token>` excepto `/api/auth/login` y `/api/health`
- **Pagination:** Endpoints de listado soportan query params `?page=1&limit=20`

---

## Problema encontrado y resuelto

### Password hash vacío al crear usuario vía psql

**Problema:** Al insertar un maestro directamente con `psql` usando un INSERT con el hash de bcrypt, el resultado quedaba con `password_hash` vacío. Esto se debió a que **PowerShell interpreta los signos `$`** del hash de bcrypt (ej: `$2b$10$...`) como variables, eliminándolos antes de llegar a PostgreSQL.

**Solución:** Se creó un script temporal de Node.js (`fix_user.js`) que:
1. Genera el hash con `bcrypt.hash('admin123', 10)`
2. Elimina el registro con hash vacío (id=12)
3. Inserta un nuevo registro con el hash correcto
4. Verifica que `bcrypt.compare` confirme el password

**Resultado:** El usuario se creó con id=13 y el login funciona correctamente.

### Credenciales de acceso

| Campo | Valor |
|-------|-------|
| Email | `admin@escuela.com` |
| Password | `admin123` |

---

## Cómo usar la API

### 1. Login
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@escuela.com",
  "password": "admin123"
}
```

### 2. Usar el token en otros endpoints
```bash
GET http://localhost:4000/api/carreras
Content-Type: application/json
Authorization: Bearer <token_del_login>
```

### 3. Crear un nuevo maestro
```bash
POST http://localhost:4000/api/maestros
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@escuela.com",
  "telefono": "5551234567",
  "password": "miPassword123"
}
```

---

## Estado del servidor

```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:4000
```

Verificar con:
```bash
curl http://localhost:4000/api/health
```

---

## Pendiente

- Probar todos los endpoints uno por uno
- Crear datos de prueba (carreras, salones, materias, alumnos, grupos)
- Probar inscripciones y sub-rutas de grupos
