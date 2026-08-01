# BACKEND_CODER.md

## Rol
Eres el agente de backend. Trabajas SOLO dentro de la carpeta backend/.
Implementas CRUD completo para cada entidad siguiendo exactamente el
contrato definido en CONTRACT.md (raíz del proyecto).

## Estado actual del proyecto (ya existe, no lo recrees)
- backend/ ya tiene package.json con: express, pg, jsonwebtoken, bcrypt,
  dotenv, cors, nodemon (devDependency)
- backend/.env ya existe con DATABASE_URL, PORT y JWT_SECRET configurados
- backend/src/config/db.js ya existe y exporta un pool de pg funcional
- backend/server.js ya existe, levanta Express, tiene un endpoint
  GET /api/health que confirma conexión a la base
- La base de datos control_escolar ya existe en PostgreSQL local con
  las 8 tablas del schema ya creadas (carreras, salones, maestros,
  alumnos, materias, grupos, grupo_maestros, inscripciones)
- Estructura de carpetas ya existe: src/models, src/controllers,
  src/routes, src/middleware, src/utils (vacías, listas para llenar)

## Qué construir
Para cada entidad definida en CONTRACT.md, crea:
- src/models/{entidad}.model.js  → queries a PostgreSQL (usa el pool de config/db.js)
- src/controllers/{entidad}.controller.js → lógica de cada endpoint,
  convierte snake_case de la DB a camelCase en las respuestas JSON
- src/routes/{entidad}.routes.js → define las rutas y las monta

Monta todas las rutas en server.js bajo el prefijo /api definido en
CONTRACT.md.

Implementa también:
- src/middleware/auth.middleware.js → verifica JWT, rechaza con 401 si
  no hay token o es inválido, deja req.maestro con los datos del token
- POST /api/auth/login → valida email+password contra la tabla maestros
  (bcrypt.compare), devuelve JWT firmado con JWT_SECRET

## Orden sugerido
1. Auth (login + middleware) primero, porque todo lo demás lo requiere
2. Carreras, Salones, Maestros, Alumnos (CRUD simple)
3. Materias
4. Grupos (incluye sub-rutas de maestros e inscripciones del CONTRACT.md)

## Convenciones obligatorias (de CONTRACT.md)
- Bajas SIEMPRE lógicas (activo = false), nunca DELETE físico
- Formato de respuesta: { data: ... } en éxito, { error, code } en error
- Códigos: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, CONFLICT, SERVER_ERROR
- JSON en camelCase, columnas de DB en snake_case — el controller hace el mapeo
- Todas las rutas requieren Authorization: Bearer <token> excepto /api/auth/login

## Qué NO hacer
- No toques frontend/
- No cambies el schema de la base de datos ni CONTRACT.md
- No uses ORM (Prisma, Sequelize) — queries directas con pg, como ya
  está armado en config/db.js
- Si encuentras algo ambiguo en CONTRACT.md, documenta el supuesto que
  tomaste en un comentario en el código y continúa, no te detengas a preguntar

## Al terminar
Reporta: qué entidades quedaron completas, si el servidor levanta sin
errores (npm run dev), y cualquier endpoint que hayas dejado pendiente
o con supuestos que valga la pena que el humano revise.