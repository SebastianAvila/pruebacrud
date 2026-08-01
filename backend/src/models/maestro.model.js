const pool = require('../config/db');

const findAll = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM maestros WHERE activo = true'
  );
  const total = parseInt(countResult.rows[0].count);
  const result = await pool.query(
    'SELECT * FROM maestros WHERE activo = true ORDER BY id ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM maestros WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ nombre, apellido, email, telefono, passwordHash }) => {
  const result = await pool.query(
    'INSERT INTO maestros (nombre, apellido, email, telefono, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [nombre, apellido, email, telefono || null, passwordHash]
  );
  return result.rows[0];
};

const update = async (id, { nombre, apellido, telefono }) => {
  // Solo se permite actualizar nombre, apellido, telefono (no password ni email)
  const result = await pool.query(
    `UPDATE maestros 
     SET nombre = COALESCE($1, nombre), 
         apellido = COALESCE($2, apellido), 
         telefono = COALESCE($3, telefono) 
     WHERE id = $4 AND activo = true 
     RETURNING *`,
    [nombre, apellido, telefono, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE maestros SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, deactivate };
