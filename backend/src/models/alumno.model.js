const pool = require('../config/db');

/**
 * Lista alumnos con paginación y filtros opcionales (carreraId, salonId).
 * Solo devuelve registros activos.
 */
const findAll = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE a.activo = true';
  const params = [];
  let paramIndex = 1;

  if (filters.carreraId) {
    whereClause += ` AND a.carrera_id = $${paramIndex}`;
    params.push(filters.carreraId);
    paramIndex++;
  }

  if (filters.salonId) {
    whereClause += ` AND a.salon_id = $${paramIndex}`;
    params.push(filters.salonId);
    paramIndex++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM alumnos a ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT a.* FROM alumnos a ${whereClause} ORDER BY a.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM alumnos WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ nombre, apellido, matricula, carreraId, salonId, fechaNacimiento }) => {
  const result = await pool.query(
    `INSERT INTO alumnos (nombre, apellido, matricula, carrera_id, salon_id, fecha_nacimiento) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [nombre, apellido, matricula, carreraId || null, salonId || null, fechaNacimiento || null]
  );
  return result.rows[0];
};

const update = async (id, { nombre, apellido, carreraId, salonId, fechaNacimiento }) => {
  const result = await pool.query(
    `UPDATE alumnos 
     SET nombre = COALESCE($1, nombre), 
         apellido = COALESCE($2, apellido), 
         carrera_id = COALESCE($3, carrera_id), 
         salon_id = COALESCE($4, salon_id), 
         fecha_nacimiento = COALESCE($5, fecha_nacimiento) 
     WHERE id = $6 AND activo = true 
     RETURNING *`,
    [nombre, apellido, carreraId, salonId, fechaNacimiento, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE alumnos SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Devuelve los grupos activos en los que está inscrito un alumno.
 */
const findGruposByAlumno = async (alumnoId) => {
  const result = await pool.query(
    `SELECT g.*, m.nombre AS materia_nombre, m.clave AS materia_clave,
            s.nombre AS salon_nombre
     FROM inscripciones i
     JOIN grupos g ON g.id = i.grupo_id AND g.activo = true
     JOIN materias m ON m.id = g.materia_id AND m.activo = true
     JOIN salones s ON s.id = g.salon_id AND s.activo = true
     WHERE i.alumno_id = $1 AND i.activo = true
     ORDER BY g.id ASC`,
    [alumnoId]
  );
  return result.rows;
};

module.exports = { findAll, findById, create, update, deactivate, findGruposByAlumno };
