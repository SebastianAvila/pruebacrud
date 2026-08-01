const pool = require('../config/db');

/**
 * Crea una inscripción (alumno en grupo).
 */
const create = async ({ alumnoId, grupoId }) => {
  const result = await pool.query(
    `INSERT INTO inscripciones (alumno_id, grupo_id) 
     VALUES ($1, $2) RETURNING *`,
    [alumnoId, grupoId]
  );
  return result.rows[0];
};

/**
 * Desactiva una inscripción por su id (baja lógica).
 */
const deactivate = async (id) => {
  const result = await pool.query(
    'UPDATE inscripciones SET activo = false WHERE id = $1 AND activo = true RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Verifica si un alumno ya está inscrito activo en un grupo.
 */
const findByAlumnoAndGrupo = async (alumnoId, grupoId) => {
  const result = await pool.query(
    'SELECT * FROM inscripciones WHERE alumno_id = $1 AND grupo_id = $2 AND activo = true',
    [alumnoId, grupoId]
  );
  return result.rows[0] || null;
};

/**
 * Crea múltiples inscripciones en lote.
 * Retorna { exitosas: [...], errores: [...] }
 */
const createBatch = async (grupoId, alumnoIds) => {
  const exitosas = [];
  const errores = [];

  for (const alumnoId of alumnoIds) {
    // Verificar si ya está inscrito
    const existente = await findByAlumnoAndGrupo(alumnoId, grupoId);
    if (existente) {
      errores.push({
        alumnoId,
        motivo: 'El alumno ya está inscrito activo en este grupo',
      });
      continue;
    }

    try {
      const inscripcion = await create({ alumnoId, grupoId });
      exitosas.push(inscripcion);
    } catch (err) {
      errores.push({
        alumnoId,
        motivo: err.message || 'Error al inscribir',
      });
    }
  }

  return { exitosas, errores };
};

/**
 * Devuelve inscripciones activas de un alumno con info del grupo.
 */
const findByAlumno = async (alumnoId) => {
  const result = await pool.query(
    `SELECT i.*, g.ciclo_escolar,
            m.nombre AS materia_nombre, m.clave AS materia_clave,
            s.nombre AS salon_nombre
     FROM inscripciones i
     JOIN grupos g ON g.id = i.grupo_id AND g.activo = true
     JOIN materias m ON m.id = g.materia_id AND m.activo = true
     JOIN salones s ON s.id = g.salon_id AND s.activo = true
     WHERE i.alumno_id = $1 AND i.activo = true
     ORDER BY i.fecha_inscripcion DESC`,
    [alumnoId]
  );
  return result.rows;
};

module.exports = { create, deactivate, findByAlumnoAndGrupo, createBatch, findByAlumno };
