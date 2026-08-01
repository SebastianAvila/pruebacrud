/**
 * SETUP COMPLETO PARA LAPTOP NUEVA (un solo comando).
 *
 * Hace todo lo necesario para que el login funcione:
 *   1. Crea la base de datos si no existe (según DATABASE_URL del .env)
 *   2. Crea el esquema (tablas) si no existen
 *   3. Inyecta los usuarios de login (admin + demo) con hashes bcrypt correctos
 *
 * Requisitos previos en la laptop:
 *   - PostgreSQL instalado y corriendo en localhost:5432
 *   - El archivo backend/.env existe y apunta a esa BD
 *     (DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/control_escolar)
 *     OJO: en la laptop la contraseña de postgres puede ser distinta a la del .env.
 *
 * Ejecutar (dentro de backend/):
 *   npm install
 *   node setup.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const SCHEMA_FILE = path.join(__dirname, '..', 'create-db.sql');

const users = [
  { nombre: 'Admin', apellido: 'Sistema', email: 'admin@test.com', telefono: '555-0100', password: 'admin123', admin: true },
  { nombre: 'Roberto', apellido: 'Flores', email: 'roberto@test.com', telefono: '555-0101', password: 'roberto123' },
  { nombre: 'María', apellido: 'García', email: 'maria@test.com', telefono: '555-0102', password: 'maria123' },
  { nombre: 'Carlos', apellido: 'López', email: 'carlos@test.com', telefono: '555-0103', password: 'carlos123' },
  { nombre: 'Ana', apellido: 'Hernández', email: 'ana@test.com', telefono: '555-0104', password: 'ana123' },
];

async function ensureDatabase(dbUrl) {
  const url = new URL(dbUrl);
  const dbName = url.pathname.slice(1);
  const adminUrl = new URL(dbUrl);
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName.replace(/"/g, '""')}`);
      console.log(`✓ Base de datos "${dbName}" creada`);
    } else {
      console.log(`✓ Base de datos "${dbName}" ya existía`);
    }
  } finally {
    await client.end();
  }
}

async function ensureSchema(client) {
  const sql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  await client.query(sql);
  console.log('✓ Esquema (tablas) verificado');
}

async function upsertUser(client, user) {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const result = await client.query(
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
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('FALTA: no existe backend/.env con DATABASE_URL. Cópialo o créalo.');
    console.error('Ejemplo: DATABASE_URL=postgres://postgres:TU_PASSWORD@localhost:5432/control_escolar');
    process.exit(1);
  }

  console.log('Conectando a:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  try {
    await ensureDatabase(dbUrl);

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    try {
      await ensureSchema(client);
      console.log('\nInyectando usuarios de login...');
      for (const user of users) {
        await upsertUser(client, user);
      }
      console.log('\n¡LISTO! Usuarios disponibles en la laptop:');
      for (const user of users) {
        const label = user.admin ? ' (admin)' : '';
        console.log(`  - ${user.email} / ${user.password}${label}`);
      }
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error('\nERROR:', err.message);
    console.error('\nPosibles causas:');
    console.error('  1. PostgreSQL no está corriendo en la laptop.');
    console.error('  2. La contraseña de postgres en backend/.env no coincide con la instalada.');
    console.error('     Ajusta DATABASE_URL: postgres://postgres:<password_real>@localhost:5432/control_escolar');
  }
}

main();
