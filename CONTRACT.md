# CONTRACT.md — Control Escolar (MVP)

Fuente de verdad única para backend y frontend. Ningún agente debe
inventar campos, endpoints o convenciones que no estén aquí.

## Stack

- Backend: Node.js + Express + PostgreSQL (driver `pg`, sin ORM)
- Frontend: Next.js + Tailwind CSS
- Auth: JWT + bcrypt
- Todo local: Postgres en localhost:5432

## Variables de entorno

### backend/.env

PORT=4000
DATABASE_URL=postgres://usuario:password@localhost:5432/control_escolar
JWT_SECRET=cambiar_esto_en_produccion


### frontend/.env

NEXT_PUBLIC_API_URL=http://localhost:4000/api


## Schema (PostgreSQL)

```sql
CREATE TABLE carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  clave VARCHAR(20) UNIQUE NOT NULL,
  duracion_semestres INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE salones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  edificio VARCHAR(50),
  capacidad INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE maestros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  matricula VARCHAR(30) UNIQUE NOT NULL,
  carrera_id INT REFERENCES carreras(id),
  salon_id INT REFERENCES salones(id),
  fecha_nacimiento DATE,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  clave VARCHAR(20) UNIQUE NOT NULL,
  carrera_id INT REFERENCES carreras(id),
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE grupos (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES materias(id),
  salon_id INT NOT NULL REFERENCES salones(id),
  ciclo_escolar VARCHAR(20) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE grupo_maestros (
  id SERIAL PRIMARY KEY,
  grupo_id INT NOT NULL REFERENCES grupos(id),
  maestro_id INT NOT NULL REFERENCES maestros(id),
  rol VARCHAR(20) NOT NULL DEFAULT 'titular',
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(grupo_id, maestro_id)
);

CREATE TABLE inscripciones (
  id SERIAL PRIMARY KEY,
  alumno_id INT NOT NULL REFERENCES alumnos(id),
  grupo_id INT NOT NULL REFERENCES grupos(id),
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(alumno_id, grupo_id)
);
```

## Convenciones

- Nombres de campos JSON: `camelCase` en requests/responses, aunque la DB use `snake_case` (el backend hace el mapeo)
- Fechas: formato ISO 8601 (`YYYY-MM-DD`)
- Bajas: siempre lógicas (`activo = false`), nunca DELETE físico
- Todas las rutas excepto `/api/auth/login` requieren header `Authorization: Bearer <token>`

## Formato de respuestas

```json
// Lista
{ "data": [ { ... } ], "page": 1, "limit": 20, "total": 45 }

// Item único
{ "data": { ... } }

// Error
{ "error": "mensaje descriptivo", "code": "VALIDATION_ERROR" }
```

Códigos usados: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `CONFLICT` (ej. matrícula/email duplicado), `SERVER_ERROR`.

## Endpoints

### Auth

POST /api/auth/login
body: { email, password }
200: { data: { token, maestro: { id, nombre, apellido, email } } }
401: { error, code: "UNAUTHORIZED" }


### Carreras

GET /api/carreras ?page=&limit=
GET /api/carreras/:id
POST /api/carreras body: { nombre, clave, duracionSemestres }
PUT /api/carreras/:id body: { nombre?, clave?, duracionSemestres? }
DELETE /api/carreras/:id → activo=false


### Salones

GET /api/salones ?page=&limit=
GET /api/salones/:id
POST /api/salones body: { nombre, edificio?, capacidad }
PUT /api/salones/:id body: { nombre?, edificio?, capacidad? }
DELETE /api/salones/:id → activo=false


### Maestros

GET /api/maestros ?page=&limit=
GET /api/maestros/:id
POST /api/maestros body: { nombre, apellido, email, telefono?, password }
PUT /api/maestros/:id body: { nombre?, apellido?, telefono? } (no password aquí)
DELETE /api/maestros/:id → activo=false


### Alumnos

GET /api/alumnos ?page=&limit=&carreraId=&salonId=
GET /api/alumnos/:id
POST /api/alumnos body: { nombre, apellido, matricula, carreraId?, salonId?, fechaNacimiento? }
PUT /api/alumnos/:id body: { nombre?, apellido?, carreraId?, salonId?, fechaNacimiento? }
DELETE /api/alumnos/:id → activo=false
GET /api/alumnos/:id/grupos → grupos en los que está inscrito


### Materias

GET /api/materias ?page=&limit=&carreraId=
GET /api/materias/:id
POST /api/materias body: { nombre, clave, carreraId? }
PUT /api/materias/:id body: { nombre?, clave?, carreraId? }
DELETE /api/materias/:id → activo=false


### Grupos

GET /api/grupos ?page=&limit=&materiaId=&salonId=&cicloEscolar=
GET /api/grupos/:id
GET /api/grupos/:id/detalle → grupo + materia + salón + maestros + count de inscritos
POST /api/grupos body: { materiaId, salonId, cicloEscolar }
PUT /api/grupos/:id body: { materiaId?, salonId?, cicloEscolar? }
DELETE /api/grupos/:id → activo=false

POST /api/grupos/:id/maestros body: { maestroId, rol } (rol: "titular" | "auxiliar")
DELETE /api/grupos/:id/maestros/:maestroId → activo=false en grupo_maestros

GET /api/grupos/:id/alumnos → alumnos inscritos activos
POST /api/grupos/:id/inscripciones body: { alumnoId }
POST /api/grupos/:id/inscripciones/lote body: { alumnoIds: [1,2,3,...] }
DELETE /api/inscripciones/:id → activo=false


## Seed de datos (para pruebas)

- 1 maestro admin: `admin@test.com` / `admin123`
- 2 carreras (ej. Mecatrónica, Sistemas)
- 3 salones
- 3 materias
- 5 alumnos