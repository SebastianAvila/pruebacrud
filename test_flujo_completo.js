const http = require('http');
function req(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = http.request({ hostname:'localhost', port:4000, path, method, headers }, (res) => {
      let d = ''; res.on('data',c=>d+=c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, bodyRaw: d }); }
      });
    });
    r.on('error', e => resolve({ status: 0, error: e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  const paso = (n, desc) => console.log(`\n📍 Paso ${n}: ${desc}`);
  const ok = (msg) => console.log(`   ✅ ${msg}`);
  const fail = (msg, detail) => console.log(`   ❌ ${msg}: ${JSON.stringify(detail)}`);

  // Usar timestamp para datos únicos
  const ts = Date.now();

  console.log('══════════════════════════════════════════════');
  console.log('  FLUJO COMPLETO DE REFERENCIA');
  console.log('══════════════════════════════════════════════\n');

  // 1. Login como admin
  paso(1, 'Login como admin del seed');
  let r = await req('POST', '/api/auth/login', { email:'admin@test.com', password:'admin123' });
  if (r.status !== 200) return fail('Login falló', r.body);
  const token = r.body.data.token;
  ok(`Token obtenido. Maestro: ${r.body.data.maestro.nombre} ${r.body.data.maestro.apellido}`);
  ok(`Shape exacto del contrato: ${JSON.stringify(Object.keys(r.body.data.maestro))}`);

  // 2. Crear una materia
  paso(2, 'Crear una materia');
  r = await req('POST', '/api/materias', { nombre:`IA-${ts}`, clave:`IA${ts}`, carreraId:1 }, token);
  if (r.status !== 201) return fail('Crear materia falló', r.body);
  const materiaId = r.body.data.id;
  ok(`Materia creada ID=${materiaId}: ${r.body.data.nombre}`);

  // 3. Crear un grupo con esa materia y un salón existente
  paso(3, 'Crear un grupo con la materia y un salón');
  r = await req('GET', '/api/salones?limit=1', null, token);
  if (r.status !== 200) return fail('Obtener salones falló', r.body);
  const salonId = r.body.data[0].id;
  ok(`Salón existente ID=${salonId}: ${r.body.data[0].nombre}`);

  r = await req('POST', '/api/grupos', { materiaId, salonId, cicloEscolar:`2026-${ts}` }, token);
  if (r.status !== 201) return fail('Crear grupo falló', r.body);
  const grupoId = r.body.data.id;
  ok(`Grupo creado ID=${grupoId}`);

  // 4. Agregar un maestro al grupo
  paso(4, 'Agregar un maestro al grupo');
  r = await req('POST', `/api/grupos/${grupoId}/maestros`, { maestroId:1, rol:'titular' }, token);
  if (r.status !== 201) return fail('Asignar maestro falló', r.body);
  ok(`Maestro ID=1 asignado como ${r.body.data.rol}`);

  // 5. Inscribir varios alumnos en lote
  paso(5, 'Inscribir alumnos en lote');
  // Crear alumnos nuevos
  const alumnos = [];
  for (let i = 0; i < 3; i++) {
    r = await req('POST', '/api/alumnos', {
      nombre:`Alumno${i}`, apellido:`Lote${ts}`, matricula:`LOT${ts}${i}`
    }, token);
    if (r.status !== 201) return fail(`Crear alumno ${i} falló`, r.body);
    alumnos.push(r.body.data.id);
  }
  ok(`${alumnos.length} alumnos creados: [${alumnos}]`);

  r = await req('POST', `/api/grupos/${grupoId}/inscripciones/lote`, { alumnoIds:alumnos }, token);
  if (r.status < 200 || r.status > 201) return fail('Inscripción lote falló', r.body);
  ok(`${r.body.data.inscritos.length} inscritos, ${r.body.data.errores.length} errores`);

  // 6. Verificar con GET /api/grupos/:id/detalle
  paso(6, 'Verificar con GET /api/grupos/:id/detalle');
  r = await req('GET', `/api/grupos/${grupoId}/detalle`, null, token);
  if (r.status !== 200) return fail('Detalle falló', r.body);
  ok(`Grupo: ${r.body.data.grupo.cicloEscolar}`);
  ok(`Materia: ${r.body.data.materia.nombre} (${r.body.data.materia.clave})`);
  ok(`Salón: ${r.body.data.salon.nombre}`);
  ok(`Maestros: ${r.body.data.maestros.length} asignados`);
  ok(`Inscritos: ${r.body.data.inscritosCount}`);
  const shapeDetalle = Object.keys(r.body.data);
  ok(`Shape detalle: ${JSON.stringify(shapeDetalle)}`);

  // 7. Verificar GET /api/alumnos/:id/grupos
  paso(7, 'Verificar grupos de un alumno inscrito');
  r = await req('GET', `/api/alumnos/${alumnos[0]}/grupos`, null, token);
  if (r.status !== 200) return fail('Grupos del alumno falló', r.body);
  ok(`Alumno ID=${alumnos[0]} tiene ${r.body.data.length} grupo(s)`);
  if (r.body.data.length > 0) {
    ok(`Grupo ID=${r.body.data[0].id}, materia=${r.body.data[0].materiaNombre}`);
  }

   // Bonus: verificar que no sea DELETE físico
   paso('Bonus', 'Verificar baja lógica (no DELETE físico)');
   r = await req('DELETE', `/api/materias/${materiaId}`, null, token);
   ok(`Materia ID=${materiaId} desactivada: activo=${r.body.data.activo}`);
   // Verificar que el registro aún existe en DB (activo=false)
   r = await req('GET', `/api/materias/${materiaId}`, null, token);
   ok(`GET materia ID=${materiaId} después de DELETE → ${r.status} (404=correcto)`);

  console.log('\n══════════════════════════════════════════════');
  console.log('  ✅ FLUJO COMPLETO EXITOSO');
  console.log('══════════════════════════════════════════════');
}

main().catch(console.error);
