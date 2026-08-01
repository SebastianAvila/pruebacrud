const pool = require('../config/db');

const findAll = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM carreras WHERE activo = true'
  );
  const total = parseInt(countResult.rows[0].count);
  const result = await pool.query(
    'SELECT * FROM carreras WHERE activo = true ORDER BY id ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM carreras WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ nombre, clave, duracionSemestres }) => {
  const result = await pool.query(
    'INSERT INTO carreras (nombre, clave, duracion_semestres) VALUES ($1, $2, $3) RETURNING *',
    [nombre, clave, duracionSemestres]
  );
  return result.rows[0];
};

const update = async (id, { nombre, clave, duracionSemestres }) => {
  const result = await pool.query(
    `UPDATE carreras 
     SET nombre = COALESCE($1, nombre), 
         clave = COALESCE($2, clave), 
         duracion_semestres = COALESCE($3, duracion_semestres) 
     WHERE id = $4 AND activo = true 
     RETURNING *`,
    [nombre, clave, duracionSemestres, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE carreras SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, deactivate };
