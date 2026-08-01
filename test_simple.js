// Test script for all endpoints in CONTRACT.md
const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('=== Testing all endpoints according to CONTRACT.md ===\n');
  
  // 1. First, test health endpoint
  console.log('1. Testing GET /api/health');
  try {
    const result = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${result.statusCode}\n`);
    console.log(result.body);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 2. Test Auth endpoints
  console.log('\n2. Testing Auth endpoints');
  console.log('\n2.1 Testing POST /api/auth/login with valid credentials');
  try {
    const result = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
    const token = result.body.data?.token;
    const maestro = result.body.data?.maestro;
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 3. Test Carreras endpoints
  console.log('3. Testing Carreras endpoints');
  console.log('\n3.1 Testing GET /api/carreras');
  try {
    const result = await makeRequest('GET', '/api/carreras?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 4. Test Salones endpoints
  console.log('4. Testing Salones endpoints');
  console.log('\n4.1 Testing GET /api/salones');
  try {
    const result = await makeRequest('GET', '/api/salones?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 5. Test Maestros endpoints
  console.log('5. Testing Maestros endpoints');
  console.log('\n5.1 Testing GET /api/maestros');
  try {
    const result = await makeRequest('GET', '/api/maestros?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 6. Test Alumnos endpoints
  console.log('6. Testing Alumnos endpoints');
  console.log('\n6.1 Testing GET /api/alumnos');
  try {
    const result = await makeRequest('GET', '/api/alumnos?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 7. Test Materias endpoints
  console.log('7. Testing Materias endpoints');
  console.log('\n7.1 Testing GET /api/materias');
  try {
    const result = await makeRequest('GET', '/api/materias?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 8. Test Grupos endpoints
  console.log('8. Testing Grupos endpoints');
  console.log('\n8.1 Testing GET /api/grupos');
  try {
    const result = await makeRequest('GET', '/api/grupos?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  // 9. Test Inscripciones endpoints
  console.log('9. Testing Inscripciones endpoints');
  console.log('\n9.1 Testing GET /api/inscripciones');
  try {
    const result = await makeRequest('GET', '/api/inscripciones?page=1&limit=10');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Body: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`   ERROR: ${err.message}\n`);
  }
  
  console.log('=== Test completed ===');
}

testAllEndpoints().catch(console.error);