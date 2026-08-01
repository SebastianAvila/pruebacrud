/**
 * Inyecta usuarios (maestros) con login, de forma idempotente.
 * - Crea o actualiza (upsert) el admin y usuarios demo.
 * - Los passwords se hashean con bcrypt y se re-hashean si el usuario ya existe.
 * - Se puede correr las veces que sea necesario (no falla por email duplicado).
 *
 * Ejecutar: node seed_users.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const users = [
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@test.com',
    telefono: '555-0100',
    password: 'admin123',
    admin: true,
  },
  {
    nombre: 'Roberto',
    apellido: 'Flores',
    email: 'roberto@test.com',
    telefono: '555-0101',
    password: 'roberto123',
  },
  {
    nombre: 'María',
    apellido: 'García',
    email: 'maria@test.com',
    telefono: '555-0102',
    password: 'maria123',
  },
  {
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos@test.com',
    telefono: '555-0103',
    password: 'carlos123',
  },
  {
    nombre: 'Ana',
    apellido: 'Hernández',
    email: 'ana@test.com',
    telefono: '555-0104',
    password: 'ana123',
  },
];

async function upsertUser(user) {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const result = await pool.query(
    `INSERT INTO maestros (nombre, apellido, email, telefono, password_hash, activo)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (email)
     DO UPDATE SET
       nombre = EXCLUDED.nombre,
       apellido = EXCLUDED.apellido,
       telefono = EXCLUDED.telefono,
       password_hash = EXCLUDED.password_hash,
       activo = true
     RETURNING id, email`,
    [user.nombre, user.apellido, user.email, user.telefono, passwordHash]
  );
  const { id, email } = result.rows[0];
  const label = user.admin ? ' [ADMIN]' : '';
  console.log(`✓ ${email}${label}  ->  ${user.password}  (id=${id})`);
}

async function main() {
  try {
    console.log('Inyectando usuarios con login...');
    for (const user of users) {
      await upsertUser(user);
    }
    console.log('\nListo. Estos son los usuarios disponibles para login:');
    for (const user of users) {
      const label = user.admin ? ' (admin)' : '';
      console.log(`  - ${user.email} / ${user.password}${label}`);
    }
  } catch (err) {
    console.error('Error al inyectar usuarios:', err.message);
  } finally {
    await pool.end();
  }
}

main();
