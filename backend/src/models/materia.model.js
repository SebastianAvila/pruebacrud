const pool = require('../config/db');

/**
 * Lista materias con paginación y filtro opcional por carreraId.
 * Solo devuelve registros activos.
 */
const findAll = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE m.activo = true';
  const params = [];
  let paramIndex = 1;

  if (filters.carreraId) {
    whereClause += ` AND m.carrera_id = $${paramIndex}`;
    params.push(filters.carreraId);
    paramIndex++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM materias m ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT m.* FROM materias m ${whereClause} ORDER BY m.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM materias WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ nombre, clave, carreraId }) => {
  const result = await pool.query(
    'INSERT INTO materias (nombre, clave, carrera_id) VALUES ($1, $2, $3) RETURNING *',
    [nombre, clave, carreraId || null]
  );
  return result.rows[0];
};

const update = async (id, { nombre, clave, carreraId }) => {
  const result = await pool.query(
    `UPDATE materias 
     SET nombre = COALESCE($1, nombre), 
         clave = COALESCE($2, clave), 
         carrera_id = COALESCE($3, carrera_id) 
     WHERE id = $4 AND activo = true 
     RETURNING *`,
    [nombre, clave, carreraId, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE materias SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, deactivate };
