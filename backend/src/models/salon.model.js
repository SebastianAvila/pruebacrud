const pool = require('../config/db');

const findAll = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM salones WHERE activo = true'
  );
  const total = parseInt(countResult.rows[0].count);
  const result = await pool.query(
    'SELECT * FROM salones WHERE activo = true ORDER BY id ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM salones WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ nombre, edificio, capacidad }) => {
  const result = await pool.query(
    'INSERT INTO salones (nombre, edificio, capacidad) VALUES ($1, $2, $3) RETURNING *',
    [nombre, edificio || null, capacidad]
  );
  return result.rows[0];
};

const update = async (id, { nombre, edificio, capacidad }) => {
  const result = await pool.query(
    `UPDATE salones 
     SET nombre = COALESCE($1, nombre), 
         edificio = COALESCE($2, edificio), 
         capacidad = COALESCE($3, capacidad) 
     WHERE id = $4 AND activo = true 
     RETURNING *`,
    [nombre, edificio, capacidad, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE salones SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, deactivate };
