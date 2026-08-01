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
  let r = await req('POST', '/api/auth/login', { email: 'admin@test.com', password: 'admin123' });
  const tok = r.body?.data?.token;
  console.log('Token:', tok ? 'OK' : 'MISSING');

  // Test individual operations with details
  console.log('\n--- GET /api/carreras ---');
  r = await req('GET', '/api/carreras?page=1&limit=5', null, tok);
  console.log('Status:', r.status, 'Data length:', r.body?.data?.length, 'Error:', r.body?.error);

  console.log('\n--- POST /api/carreras (crear) ---');
  r = await req('POST', '/api/carreras', { nombre: 'TestX', clave: 'XX99', duracionSemestres: 5 }, tok);
  console.log('Status:', r.status, 'Body:', JSON.stringify(r.body).slice(0,200));

  console.log('\n--- GET /api/carreras/1 ---');
  r = await req('GET', '/api/carreras/1', null, tok);
  console.log('Status:', r.status, 'Body:', JSON.stringify(r.body).slice(0,200));

  console.log('\n--- POST /api/alumnos ---');
  r = await req('POST', '/api/alumnos', { nombre: 'Test', apellido: 'Alumno', matricula: 'ALM999' }, tok);
  console.log('Status:', r.status, 'Body:', JSON.stringify(r.body).slice(0,200));
}

main().catch(console.error);
