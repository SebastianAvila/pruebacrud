const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost', port: 4000, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ statusCode: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Verificar DB directa
  console.log('=== 1. Probando conexión a DB directamente ===');
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: 'postgres://postgres:12345@localhost:5432/control_escolar' });
    const r = await pool.query('SELECT NOW() as ahora');
    console.log('DB conectada:', r.rows[0].ahora);

    // Ver si hay maestros
    const maestros = await pool.query('SELECT COUNT(*) FROM maestros');
    console.log('Maestros en DB:', maestros.rows[0].count);

    // Ver si hay carreras
    const carreras = await pool.query('SELECT COUNT(*) FROM carreras');
    console.log('Carreras en DB:', carreras.rows[0].count);

    await pool.end();
  } catch (err) {
    console.log('ERROR de DB:', err.message);
    console.log('Stack:', err.stack?.split('\n').slice(0,3).join('\n'));
  }

  // 2. Login test
  console.log('\n=== 2. Probando POST /api/auth/login ===');
  const r1 = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@test.com', password: 'admin123'
  });
  console.log('Login status:', r1.statusCode);
  console.log('Login body:', JSON.stringify(r1.body, null, 2));
}

main().catch(console.error);
