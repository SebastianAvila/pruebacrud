const http = require('http');

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { hostname: 'localhost', port: 4000, path, method, headers };
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

let TOKEN;
let creado = { carreraId: null, salonId: null, materiaId: null, maestroId: null, grupoId: null, alumnoId: null, inscripcionId: null };
let ok = 0, fail = 0;

function check(nombre, condicion, detalle = '') {
  if (condicion) { ok++; console.log(`  ✅ ${nombre}${detalle}`); }
  else { fail++; console.log(`  ❌ ${nombre}${detalle}`); }
}

async function run() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   TEST COMPLETO vs CONTRACT.md           ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ─── 1. AUTH ─────────────────────────────────────────────
  console.log('─── 1. AUTH ───');
  let r = await req('POST', '/api/auth/login', { email: 'admin@test.com', password: 'admin123' });
  check('POST /api/auth/login 200', r.status === 200, ` → token OK`);
  TOKEN = r.body?.data?.token;
  check('Token recibido', !!TOKEN);
  check('Shape: { data: { token, maestro } }', !!r.body?.data?.token && !!r.body?.data?.maestro?.email);

  // 2. Login inválido
  r = await req('POST', '/api/auth/login', { email: 'x@x.com', password: 'x' });
  check('POST /api/auth/login inválido → 401', r.status === 401);
  check('Error code UNAUTHORIZED', r.body?.code === 'UNAUTHORIZED');

  // ─── 2. CARRERAS ──────────────────────────────────────────
  console.log('\n─── 2. CARRERAS ───');
  r = await req('GET', '/api/carreras?page=1&limit=10', null, TOKEN);
  check('GET /api/carreras 200', r.status === 200);
  check('Shape paginado: { data, page, limit, total }', r.body?.data && r.body?.page === 1);
  check('Campos camelCase', r.body?.data?.[0]?.duracionSemestres !== undefined);

  const CARRERA = { nombre: 'Ingeniería de Prueba', clave: 'TEST01', duracionSemestres: 9 };
  r = await req('POST', '/api/carreras', CARRERA, TOKEN);
  check('POST /api/carreras 201', r.status === 201);
  creado.carreraId = r.body?.data?.id;
  check('Shape: { data: { id, nombre, clave, duracionSemestres, activo } }',
    r.body?.data?.nombre === CARRERA.nombre && r.body?.data?.activo === true);

  r = await req('GET', `/api/carreras/${creado.carreraId}`, null, TOKEN);
  check('GET /api/carreras/:id 200', r.status === 200);

  r = await req('PUT', `/api/carreras/${creado.carreraId}`, { nombre: 'Ing. Prueba Edit' }, TOKEN);
  check('PUT /api/carreras/:id 200', r.status === 200);
  check('Nombre actualizado', r.body?.data?.nombre === 'Ing. Prueba Edit');

  r = await req('DELETE', `/api/carreras/${creado.carreraId}`, null, TOKEN);
  check('DELETE /api/carreras/:id 200 (baja lógica)', r.status === 200);
  check('activo=false', r.body?.data?.activo === false);

  r = await req('GET', `/api/carreras/${creado.carreraId}`, null, TOKEN);
  check('GET después de DELETE → 404', r.status === 404);

  // Error: crear sin campos
  r = await req('POST', '/api/carreras', { nombre: 'x' }, TOKEN);
  check('POST sin clave → 400 VALIDATION_ERROR', r.status === 400 && r.body?.code === 'VALIDATION_ERROR');

  // ─── 3. SALONES ────────────────────────────────────────────
  console.log('\n─── 3. SALONES ───');
  const SALON = { nombre: 'LAB-01', edificio: 'Laboratorios', capacidad: 30 };
  r = await req('POST', '/api/salones', SALON, TOKEN);
  check('POST /api/salones 201', r.status === 201);
  creado.salonId = r.body?.data?.id;
  check('Shape camelCase', r.body?.data?.nombre === SALON.nombre);

  r = await req('GET', `/api/salones/${creado.salonId}`, null, TOKEN);
  check('GET /api/salones/:id 200', r.status === 200);

  r = await req('PUT', `/api/salones/${creado.salonId}`, { capacidad: 35 }, TOKEN);
  check('PUT /api/salones/:id 200', r.status === 200);
  check('Capacidad actualizada', r.body?.data?.capacidad === 35);

  r = await req('DELETE', `/api/salones/${creado.salonId}`, null, TOKEN);
  check('DELETE /api/salones/:id → activo=false', r.status === 200 && r.body?.data?.activo === false);

  // Error: capacidad inválida
  r = await req('POST', '/api/salones', { nombre: 'X', capacidad: -1 }, TOKEN);
  check('POST capacidad negativa → 400', r.status === 400);

  // ─── 4. MAESTROS ───────────────────────────────────────────
  console.log('\n─── 4. MAESTROS ───');
  const MAESTRO = { nombre: 'Pedro', apellido: 'Navajas', email: 'pedro@test.com', password: 'pass123', telefono: '555-1000' };
  r = await req('POST', '/api/maestros', MAESTRO, TOKEN);
  check('POST /api/maestros 201', r.status === 201);
  creado.maestroId = r.body?.data?.id;
  check('password_hash NO expuesto', !JSON.stringify(r.body).includes('password_hash'));
  check('Shape camelCase', r.body?.data?.nombre === 'Pedro');

  r = await req('GET', `/api/maestros/${creado.maestroId}`, null, TOKEN);
  check('GET /api/maestros/:id 200', r.status === 200);
  check('password_hash NO en GET', !JSON.stringify(r.body).includes('password_hash'));

  r = await req('PUT', `/api/maestros/${creado.maestroId}`, { nombre: 'Pedro Edit' }, TOKEN);
  check('PUT /api/maestros/:id 200', r.status === 200);
  check('Nombre actualizado', r.body?.data?.nombre === 'Pedro Edit');

  r = await req('DELETE', `/api/maestros/${creado.maestroId}`, null, TOKEN);
  check('DELETE /api/maestros/:id → activo=false', r.status === 200 && r.body?.data?.activo === false);

  // Error: email duplicado
  r = await req('POST', '/api/maestros', { nombre: 'Otro', apellido: 'X', email: 'admin@test.com', password: 'pass123' }, TOKEN);
  check('POST email duplicado → 409 CONFLICT', r.status === 409 && r.body?.code === 'CONFLICT');

  // ─── 5. MATERIAS ───────────────────────────────────────────
  console.log('\n─── 5. MATERIAS ───');
  const MATERIA = { nombre: 'Inteligencia Artificial', clave: 'IA01', carreraId: 1 };
  r = await req('POST', '/api/materias', MATERIA, TOKEN);
  check('POST /api/materias 201', r.status === 201);
  creado.materiaId = r.body?.data?.id;

  r = await req('GET', `/api/materias/${creado.materiaId}`, null, TOKEN);
  check('GET /api/materias/:id 200', r.status === 200);

  r = await req('PUT', `/api/materias/${creado.materiaId}`, { nombre: 'IA Avanzada' }, TOKEN);
  check('PUT /api/materias/:id 200', r.status === 200);

  r = await req('DELETE', `/api/materias/${creado.materiaId}`, null, TOKEN);
  check('DELETE /api/materias/:id → activo=false', r.status === 200 && r.body?.data?.activo === false);

  // ─── 6. ALUMNOS ────────────────────────────────────────────
  console.log('\n─── 6. ALUMNOS ───');
  const ALUMNO = { nombre: 'Luis', apellido: 'Ramírez', matricula: 'ALM100', carreraId: 1, salonId: 1, fechaNacimiento: '2002-06-15' };
  r = await req('POST', '/api/alumnos', ALUMNO, TOKEN);
  check('POST /api/alumnos 201', r.status === 201);
  creado.alumnoId = r.body?.data?.id;

  r = await req('GET', `/api/alumnos/${creado.alumnoId}`, null, TOKEN);
  check('GET /api/alumnos/:id 200', r.status === 200);
  check('Shape camelCase', r.body?.data?.fechaNacimiento !== undefined);

  r = await req('PUT', `/api/alumnos/${creado.alumnoId}`, { nombre: 'Luis Edit' }, TOKEN);
  check('PUT /api/alumnos/:id 200', r.status === 200);

  // Error: matrícula duplicada
  r = await req('POST', '/api/alumnos', { nombre: 'Otro', apellido: 'X', matricula: 'ALM100' }, TOKEN);
  check('POST matrícula duplicada → 409 CONFLICT', r.status === 409);

  r = await req('DELETE', `/api/alumnos/${creado.alumnoId}`, null, TOKEN);
  check('DELETE /api/alumnos/:id → activo=false', r.status === 200 && r.body?.data?.activo === false);

  // ─── 7. GRUPOS (flujo completo) ────────────────────────────
  console.log('\n─── 7. GRUPOS (FLUJO COMPLETO) ───');

  // Crear materia activa para usar en grupo
  r = await req('POST', '/api/materias', { nombre: 'Redes', clave: 'RED01', carreraId: 1 }, TOKEN);
  creado.materiaId = r.body?.data?.id;

  // Crear salón activo para usar en grupo
  r = await req('POST', '/api/salones', { nombre: 'C-101', edificio: 'Edificio C', capacidad: 25 }, TOKEN);
  creado.salonId = r.body?.data?.id;

  // Crear grupo
  const GRUPO = { materiaId: creado.materiaId, salonId: creado.salonId, cicloEscolar: '2026-A' };
  r = await req('POST', '/api/grupos', GRUPO, TOKEN);
  check('POST /api/grupos 201', r.status === 201);
  creado.grupoId = r.body?.data?.id;

  r = await req('GET', `/api/grupos/${creado.grupoId}`, null, TOKEN);
  check('GET /api/grupos/:id 200', r.status === 200);

  r = await req('PUT', `/api/grupos/${creado.grupoId}`, { cicloEscolar: '2026-B' }, TOKEN);
  check('PUT /api/grupos/:id 200', r.status === 200);
  check('cicloEscolar actualizado', r.body?.data?.cicloEscolar === '2026-B');

  // GET /api/grupos/:id/detalle
  r = await req('GET', `/api/grupos/${creado.grupoId}/detalle`, null, TOKEN);
  check('GET /api/grupos/:id/detalle 200', r.status === 200);
  check('Shape: { data: { grupo, materia, salon, maestros, inscritosCount } }',
    r.body?.data?.grupo && r.body?.data?.materia && r.body?.data?.salon && r.body?.data?.inscritosCount !== undefined);
  check('inscritosCount es 0 al inicio', r.body?.data?.inscritosCount === 0);

  // ─── 8. GRUPO-MAESTROS ────────────────────────────────────
  console.log('\n─── 8. GRUPO-MAESTROS ───');
  r = await req('POST', `/api/grupos/${creado.grupoId}/maestros`, { maestroId: 1, rol: 'titular' }, TOKEN);
  check('POST /api/grupos/:id/maestros 201', r.status === 201);
  check('Rol titular', r.body?.data?.rol === 'titular');

  // Duplicado → 409
  r = await req('POST', `/api/grupos/${creado.grupoId}/maestros`, { maestroId: 1, rol: 'titular' }, TOKEN);
  check('POST duplicado → 409 CONFLICT', r.status === 409);

  // DELETE grupo-maestro
  r = await req('DELETE', `/api/grupos/${creado.grupoId}/maestros/1`, null, TOKEN);
  check('DELETE /api/grupos/:id/maestros/:maestroId → 200', r.status === 200);
  check('activo=false', r.body?.data?.activo === false);

  // ─── 9. INSCRIPCIONES ──────────────────────────────────────
  console.log('\n─── 9. INSCRIPCIONES ───');

  // Crear alumnos activos para inscribir
  r = await req('POST', '/api/alumnos', { nombre: 'Alumno1', apellido: 'Test', matricula: 'ALM200' }, TOKEN);
  const alumnoId1 = r.body?.data?.id;
  r = await req('POST', '/api/alumnos', { nombre: 'Alumno2', apellido: 'Test', matricula: 'ALM201' }, TOKEN);
  const alumnoId2 = r.body?.data?.id;
  r = await req('POST', '/api/alumnos', { nombre: 'Alumno3', apellido: 'Test', matricula: 'ALM202' }, TOKEN);
  const alumnoId3 = r.body?.data?.id;

  // Inscripción individual
  r = await req('POST', `/api/grupos/${creado.grupoId}/inscripciones`, { alumnoId: alumnoId1 }, TOKEN);
  check('POST /api/grupos/:id/inscripciones 201', r.status === 201);
  creado.inscripcionId = r.body?.data?.id;
  check('Shape: { data: { id, alumnoId, grupoId, fechaInscripcion, activo } }',
    r.body?.data?.alumnoId !== undefined && r.body?.data?.fechaInscripcion !== undefined);

  // Duplicado → 409
  r = await req('POST', `/api/grupos/${creado.grupoId}/inscripciones`, { alumnoId: alumnoId1 }, TOKEN);
  check('POST inscripción duplicada → 409 CONFLICT', r.status === 409);

  // Inscripción en lote
  r = await req('POST', `/api/grupos/${creado.grupoId}/inscripciones/lote`, { alumnoIds: [alumnoId2, alumnoId3] }, TOKEN);
  check('POST /api/grupos/:id/inscripciones/lote 201', r.status === 201);
  check('Shape: { data: { inscritos, errores } }', Array.isArray(r.body?.data?.inscritos) && Array.isArray(r.body?.data?.errores));
  check('2 inscritos nuevos', r.body?.data?.inscritos?.length === 2);

  // Lote con alumno ya inscrito (parcial)
  r = await req('POST', `/api/grupos/${creado.grupoId}/inscripciones/lote`, { alumnoIds: [alumnoId1, 99999] }, TOKEN);
  check('Lote con errores → status 200-201', r.status === 200 || r.status === 201);
  check('alumno duplicado en errores', r.body?.data?.errores?.length > 0);

  // GET /api/grupos/:id/alumnos
  r = await req('GET', `/api/grupos/${creado.grupoId}/alumnos`, null, TOKEN);
  check('GET /api/grupos/:id/alumnos 200', r.status === 200);
  check('3 alumnos inscritos', r.body?.data?.length === 3);

  // DELETE inscripción individual
  r = await req('DELETE', `/api/inscripciones/${creado.inscripcionId}`, null, TOKEN);
  check('DELETE /api/inscripciones/:id → activo=false', r.status === 200 && r.body?.data?.activo === false);

  // Verificar después de baja
  r = await req('GET', `/api/grupos/${creado.grupoId}/alumnos`, null, TOKEN);
  check('Solo 2 alumnos después de baja', r.body?.data?.length === 2);

  // ─── 10. GET /api/alumnos/:id/grupos ──────────────────────
  console.log('\n─── 10. GET /api/alumnos/:id/grupos ───');
  r = await req('GET', `/api/alumnos/${alumnoId2}/grupos`, null, TOKEN);
  check('GET /api/alumnos/:id/grupos 200', r.status === 200);
  check('Alumno tiene 1 grupo', r.body?.data?.length === 1);
  check('Grupo tiene materiaNombre', r.body?.data?.[0]?.materiaNombre !== undefined);

  // ─── 11. RUTAS PROTEGIDAS ──────────────────────────────────
  console.log('\n─── 11. RUTAS PROTEGIDAS ───');
  r = await req('GET', '/api/carreras', null, null);
  check('GET /api/carreras sin token → 401', r.status === 401);
  r = await req('POST', '/api/salones', { nombre: 'X', capacidad: 10 }, 'token_invalido');
  check('POST /api/salones con token malo → 401', r.status === 401);

  // ─── 12. ENDPOINTS DE LISTADO ──────────────────────────────
  console.log('\n─── 12. LISTADOS CON FILTROS ───');
  r = await req('GET', '/api/materias?carreraId=1', null, TOKEN);
  check('GET /api/materias?carreraId= 200', r.status === 200);
  r = await req('GET', '/api/alumnos?carreraId=1&salonId=1', null, TOKEN);
  check('GET /api/alumnos?carreraId=&salonId= 200', r.status === 200);
  r = await req('GET', '/api/grupos?materiaId=1&salonId=1&cicloEscolar=2026-A', null, TOKEN);
  check('GET /api/grupos?materiaId=&salonId=&cicloEscolar= 200', r.status === 200);

  // ─── 13. ERROR 404 ─────────────────────────────────────────
  console.log('\n─── 13. ERRORES 404 ───');
  r = await req('GET', '/api/carreras/99999', null, TOKEN);
  check('GET carrera inexistente → 404', r.status === 404);
  r = await req('GET', '/api/alumnos/99999', null, TOKEN);
  check('GET alumno inexistente → 404', r.status === 404);
  r = await req('GET', '/api/grupos/99999', null, TOKEN);
  check('GET grupo inexistente → 404', r.status === 404);
  r = await req('GET', '/api/grupos/99999/detalle', null, TOKEN);
  check('GET detalle grupo inexistente → 404', r.status === 404);

  // ─── RESUMEN ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(`  ✅ Pruebas exitosas: ${ok}`);
  console.log(`  ❌ Pruebas fallidas: ${fail}`);
  console.log(`  Total: ${ok + fail}`);
  console.log('══════════════════════════════════════════');
}

run().catch(console.error);
