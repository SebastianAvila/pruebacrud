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

---

## SESIÓN 2026-08-01 — Inyección de datos en OTRA LAPTOP

**Contexto:** El proyecto se está moviendo a **otra laptop**. En la laptop la BD local **no tiene los usuarios**, por lo que el login devolvía `401 Unauthorized` en el frontend (aunque en la máquina de desarrollo todo funcionaba). Esta sesión se documenta con el contexto de que la inyección se hizo/ejecutará **en la laptop, no en esta máquina**.

### Causa raíz del 401 en la laptop
- Los `.env` están en `.gitignore` (`backend/.env`, `frontend/.env.local`), así que al copiar el proyecto **no se copian**. Si faltan, el backend no conecta o apunta a otra BD.
- La BD local de la laptop existía pero **sin usuarios de login** (o con hashes incorrectos).

### Archivos creados en esta sesión (para la laptop)

| Archivo | Uso |
|---------|-----|
| `backend/setup.js` | Setup de 1 comando: crea BD + tablas + inyecta usuarios. Correr: `node setup.js` |
| `backend/seed_users.js` | Solo inyecta/actualiza usuarios de login (idempotente). Correr: `node seed_users.js` |
| `usuarios-ficticios.sql` | Solo los usuarios de login en SQL listo para pegar/inyectar manualmente |
| `datos-ficticios.txt` | **TODAS las tablas** con datos falsos (carreras, salones, maestros, alumnos, materias, grupos, grupo_maestros, inscripciones) listo para pegar en psql/pgAdmin/DBeaver |

Además se modificó `create-db.sql`: las tablas ahora usan `CREATE TABLE IF NOT EXISTS` para que sea idempotente.

### Pasos en la laptop
1. Verificar/corregir `backend/.env` (contraseña real de postgres de la laptop):
   `DATABASE_URL=postgres://postgres:<password_real>@localhost:5432/control_escolar`
2. `cd backend && npm install`
3. Crear tablas: `create-db.sql` (o `node setup.js` que lo hace todo)
4. Inyectar datos: pegar `datos-ficticios.txt` en psql/pgAdmin, o `node seed_users.js` / `node setup.js`
5. Arrancar: `npm run dev` → login en `http://localhost:3000/login`

### Credenciales de login (admin prefijo "mid" de Mérida)
| Email | Password | Rol |
|-------|----------|-----|
| `midadmin@merida.edu.mx` | `admin123` | admin |
| `lfernandez@merida.edu.mx` | `pass123` | usuario |
| `mgonzalez@merida.edu.mx` | `pass123` | usuario |
| `cibarra@merida.edu.mx` | `pass123` | usuario |
| `atorres@merida.edu.mx` | `pass123` | usuario |
| `rsalazar@merida.edu.mx` | `pass123` | usuario |

### Notas técnicas
- Los hashes de bcrypt **no se deben escribir a mano**: PowerShell interpreta los `$` del hash como variables y los borra. Siempre generar el hash con Node (`bcrypt.hash`) y copiarlo tal cual.
- `datos-ficticios.txt` fue validado de corrido contra una BD limpia de prueba (todos los INSERT OK y relaciones verificadas con JOIN).
