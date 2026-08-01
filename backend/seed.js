/**
 * Seed de datos de prueba según CONTRACT.md
 * Ejecutar: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function seed() {
  try {
    console.log('Iniciando seed de datos de prueba...');

    // ─── 1. Maestro admin ────────────────────────────────────
    const passwordHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO maestros (nombre, apellido, email, telefono, password_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      ['Admin', 'Sistema', 'admin@test.com', '555-0100', passwordHash]
    );
    console.log('✓ Maestro admin creado: admin@test.com / admin123');

    // ─── 2. Carreras ─────────────────────────────────────────
    await pool.query(
      `INSERT INTO carreras (nombre, clave, duracion_semestres) VALUES 
       ('Ingeniería en Mecatrónica', 'MECA', 8),
       ('Ingeniería en Sistemas Computacionales', 'SISY', 8)`
    );
    console.log('✓ 2 carreras creadas');

    // ─── 3. Salones ──────────────────────────────────────────
    await pool.query(
      `INSERT INTO salones (nombre, edificio, capacidad) VALUES 
       ('A-101', 'Edificio A', 40),
       ('A-201', 'Edificio A', 35),
       ('B-101', 'Edificio B', 45)`
    );
    console.log('✓ 3 salones creados');

    // ─── 4. Materias ─────────────────────────────────────────
    await pool.query(
      `INSERT INTO materias (nombre, clave, carrera_id) VALUES 
       ('Cálculo I', 'CAL1', 1),
       ('Programación Web', 'PRWE', 2),
       ('Física Mecánica', 'FIME', 1)`
    );
    console.log('✓ 3 materias creadas');

    // ─── 5. Alumnos ──────────────────────────────────────────
    await pool.query(
      `INSERT INTO alumnos (nombre, apellido, matricula, carrera_id, salon_id, fecha_nacimiento) VALUES 
       ('Juan', 'Pérez López', 'ALM001', 1, 1, '2000-05-15'),
       ('María', 'García Ruiz', 'ALM002', 2, 2, '2001-03-22'),
       ('Carlos', 'López Martínez', 'ALM003', 1, 1, '1999-11-08'),
       ('Ana', 'Hernández Castro', 'ALM004', 2, 3, '2000-08-30'),
       ('Pedro', 'Torres Sánchez', 'ALM005', 1, 2, '2001-01-17')`
    );
    console.log('✓ 5 alumnos creados');

    console.log('\nSeed completado exitosamente.');
  } catch (err) {
    console.error('Error durante el seed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
