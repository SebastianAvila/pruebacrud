const pool = require('../config/db');

// ─── CRUD de Grupos ────────────────────────────────────────────

/**
 * Lista grupos con paginación y filtros opcionales.
 * Filtros: materiaId, salonId, cicloEscolar
 */
const findAll = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE g.activo = true';
  const params = [];
  let paramIndex = 1;

  if (filters.materiaId) {
    whereClause += ` AND g.materia_id = $${paramIndex}`;
    params.push(filters.materiaId);
    paramIndex++;
  }

  if (filters.salonId) {
    whereClause += ` AND g.salon_id = $${paramIndex}`;
    params.push(filters.salonId);
    paramIndex++;
  }

  if (filters.cicloEscolar) {
    whereClause += ` AND g.ciclo_escolar = $${paramIndex}`;
    params.push(filters.cicloEscolar);
    paramIndex++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM grupos g ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT g.* FROM grupos g ${whereClause} ORDER BY g.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return { rows: result.rows, total };
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM grupos WHERE id = $1 AND activo = true',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ materiaId, salonId, cicloEscolar }) => {
  const result = await pool.query(
    'INSERT INTO grupos (materia_id, salon_id, ciclo_escolar) VALUES ($1, $2, $3) RETURNING *',
    [materiaId, salonId, cicloEscolar]
  );
  return result.rows[0];
};

const update = async (id, { materiaId, salonId, cicloEscolar }) => {
  const result = await pool.query(
    `UPDATE grupos 
     SET materia_id = COALESCE($1, materia_id), 
         salon_id = COALESCE($2, salon_id), 
         ciclo_escolar = COALESCE($3, ciclo_escolar) 
     WHERE id = $4 AND activo = true 
     RETURNING *`,
    [materiaId, salonId, cicloEscolar, id]
  );
  return result.rows[0] || null;
};

const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE grupos SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

// ─── Detalle de Grupo ──────────────────────────────────────────

/**
 * Devuelve el detalle completo de un grupo:
 * grupo + materia + salon + maestros asignados + count de inscritos
 */
const findDetalle = async (id) => {
  // Datos del grupo con materia y salon
  const grupoResult = await pool.query(
    `SELECT g.*,
            m.nombre AS materia_nombre, m.clave AS materia_clave,
            s.nombre AS salon_nombre, s.edificio AS salon_edificio, s.capacidad AS salon_capacidad
     FROM grupos g
     JOIN materias m ON m.id = g.materia_id AND m.activo = true
     JOIN salones s ON s.id = g.salon_id AND s.activo = true
     WHERE g.id = $1 AND g.activo = true`,
    [id]
  );

  if (grupoResult.rows.length === 0) return null;

  const grupo = grupoResult.rows[0];

  // Maestros asignados al grupo
  const maestrosResult = await pool.query(
    `SELECT ma.id, ma.nombre, ma.apellido, ma.email, gm.rol
     FROM grupo_maestros gm
     JOIN maestros ma ON ma.id = gm.maestro_id AND ma.activo = true
     WHERE gm.grupo_id = $1 AND gm.activo = true
     ORDER BY gm.rol ASC, ma.apellido ASC`,
    [id]
  );

  // Conteo de inscritos activos
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM inscripciones WHERE grupo_id = $1 AND activo = true',
    [id]
  );

  return {
    grupo,
    materia: {
      id: grupo.materia_id,
      nombre: grupo.materia_nombre,
      clave: grupo.materia_clave,
    },
    salon: {
      id: grupo.salon_id,
      nombre: grupo.salon_nombre,
      edificio: grupo.salon_edificio,
      capacidad: grupo.salon_capacidad,
    },
    maestros: maestrosResult.rows,
    inscritosCount: parseInt(countResult.rows[0].count),
  };
};

// ─── Grupo-Maestros ────────────────────────────────────────────

/**
 * Asigna un maestro a un grupo (INSERT en grupo_maestros).
 */
const addMaestro = async (grupoId, maestroId, rol = 'titular') => {
  const result = await pool.query(
    'INSERT INTO grupo_maestros (grupo_id, maestro_id, rol) VALUES ($1, $2, $3) RETURNING *',
    [grupoId, maestroId, rol]
  );
  return result.rows[0];
};

/**
 * Desasigna un maestro de un grupo (UPDATE activo=false en grupo_maestros).
 */
const removeMaestro = async (grupoId, maestroId) => {
  const result = await pool.query(
    `UPDATE grupo_maestros 
     SET activo = false 
     WHERE grupo_id = $1 AND maestro_id = $2 AND activo = true 
     RETURNING *`,
    [grupoId, maestroId]
  );
  return result.rows[0] || null;
};

/**
 * Lista maestros asignados activos a un grupo.
 */
const findMaestros = async (grupoId) => {
  const result = await pool.query(
    `SELECT ma.id, ma.nombre, ma.apellido, ma.email, gm.rol
     FROM grupo_maestros gm
     JOIN maestros ma ON ma.id = gm.maestro_id AND ma.activo = true
     WHERE gm.grupo_id = $1 AND gm.activo = true
     ORDER BY gm.rol ASC, ma.apellido ASC`,
    [grupoId]
  );
  return result.rows;
};

/**
 * Verifica si un maestro ya está asignado activo a un grupo.
 */
const findMaestroEnGrupo = async (grupoId, maestroId) => {
  const result = await pool.query(
    'SELECT * FROM grupo_maestros WHERE grupo_id = $1 AND maestro_id = $2 AND activo = true',
    [grupoId, maestroId]
  );
  return result.rows[0] || null;
};

// ─── Grupo-Alumnos (inscripciones) ─────────────────────────────

/**
 * Lista alumnos inscritos activos en un grupo.
 */
const findAlumnos = async (grupoId) => {
  const result = await pool.query(
    `SELECT a.id, a.nombre, a.apellido, a.matricula, i.fecha_inscripcion, i.id AS inscripcion_id
     FROM inscripciones i
     JOIN alumnos a ON a.id = i.alumno_id AND a.activo = true
     WHERE i.grupo_id = $1 AND i.activo = true
     ORDER BY a.apellido ASC, a.nombre ASC`,
    [grupoId]
  );
  return result.rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  deactivate,
  findDetalle,
  addMaestro,
  removeMaestro,
  findMaestros,
  findMaestroEnGrupo,
  findAlumnos,
};
