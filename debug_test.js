const http = require('http');

function req(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = http.request({ hostname:'localhost', port:4000, path, method, headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
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
  // Login
  let r = await req('POST', '/api/auth/login', { email:'admin@test.com', password:'admin123' });
  const TOKEN = r.body?.data?.token;
  console.log('1. Login status:', r.status, 'token:', TOKEN ? 'OK' : 'MISSING');

  // Test paso a paso
  console.log('\n2. GET /api/carreras');
  r = await req('GET', '/api/carreras?page=1&limit=10', null, TOKEN);
  console.log('   status:', r.status, '| data:', r.body?.data?.length);

  console.log('\n3. POST /api/carreras');
  r = await req('POST', '/api/carreras', { nombre:'Test', clave:'TST99', duracionSemestres:5 }, TOKEN);
  console.log('   status:', r.status, '| id:', r.body?.data?.id, '| error:', r.body?.error);
  const carreraId = r.body?.data?.id;

  console.log('\n4. GET /api/carreras/' + carreraId);
  r = await req('GET', '/api/carreras/' + carreraId, null, TOKEN);
  console.log('   status:', r.status, '| nombre:', r.body?.data?.nombre);

  console.log('\n5. PUT /api/carreras/' + carreraId);
  r = await req('PUT', '/api/carreras/' + carreraId, { nombre:'TestEdit' }, TOKEN);
  console.log('   status:', r.status, '| nombre:', r.body?.data?.nombre);

  console.log('\n6. DELETE /api/carreras/' + carreraId);
  r = await req('DELETE', '/api/carreras/' + carreraId, null, TOKEN);
  console.log('   status:', r.status, '| activo:', r.body?.data?.activo);

  console.log('\n7. GET /api/alumnos');
  r = await req('GET', '/api/alumnos?page=1&limit=10', null, TOKEN);
  console.log('   status:', r.status, '| data:', r.body?.data?.length);

  console.log('\n8. POST /api/maestros');
  r = await req('POST', '/api/maestros', { nombre:'Nuevo', apellido:'Maestro', email:'nuevo@test.com', password:'pass123' }, TOKEN);
  console.log('   status:', r.status, '| id:', r.body?.data?.id, '| error:', r.body?.error);
}

main().catch(console.error);
