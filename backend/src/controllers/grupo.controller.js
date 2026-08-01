const pool = require('../config/db');
const inscripcionModel = require('../models/inscripcion.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

// ─── CRUD de Grupos ────────────────────────────────────────────

/**
 * GET /api/grupos?page=&limit=&materiaId=&salonId=&cicloEscolar=
 */
const getGrupos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Importar modelo dinámicamente para evitar circular
    const grupoModel = require('../models/grupo.model');
    const filters = {};
    if (req.query.materiaId) filters.materiaId = parseInt(req.query.materiaId);
    if (req.query.salonId) filters.salonId = parseInt(req.query.salonId);
    if (req.query.cicloEscolar) filters.cicloEscolar = req.query.cicloEscolar;

    const { rows, total } = await grupoModel.findAll(page, limit, filters);
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener grupos:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/grupos/:id
 */
const getGrupo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.findById(id);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(grupo));
  } catch (err) {
    console.error('Error al obtener grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/grupos/:id/detalle
 * Devuelve grupo + materia + salon + maestros + count inscritos
 */
const getGrupoDetalle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const grupoModel = require('../models/grupo.model');
    const detalle = await grupoModel.findDetalle(id);
    if (!detalle) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }

    // Convertir a camelCase cada parte del detalle
    return success(res, {
      grupo: toCamelCaseObj(detalle.grupo),
      materia: toCamelCaseObj(detalle.materia),
      salon: toCamelCaseObj(detalle.salon),
      maestros: toCamelCaseArr(detalle.maestros),
      inscritosCount: detalle.inscritosCount,
    });
  } catch (err) {
    console.error('Error al obtener detalle del grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/grupos
 * Body: { materiaId, salonId, cicloEscolar }
 */
const createGrupo = async (req, res) => {
  try {
    const { materiaId, salonId, cicloEscolar } = req.body;

    if (!materiaId || !salonId || !cicloEscolar) {
      return sendError(res, 'MateriaId, salonId y cicloEscolar son requeridos', 'VALIDATION_ERROR', 400);
    }

    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.create({ materiaId, salonId, cicloEscolar });
    return success(res, toCamelCaseObj(grupo), 201);
  } catch (err) {
    console.error('Error al crear grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/grupos/:id
 * Body: { materiaId?, salonId?, cicloEscolar? }
 */
const updateGrupo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { materiaId, salonId, cicloEscolar } = req.body;

    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.update(id, { materiaId, salonId, cicloEscolar });
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(grupo));
  } catch (err) {
    console.error('Error al actualizar grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/grupos/:id → activo=false
 */
const deleteGrupo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.deactivate(id);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(grupo));
  } catch (err) {
    console.error('Error al eliminar grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

// ─── Grupo-Maestros ────────────────────────────────────────────

/**
 * POST /api/grupos/:id/maestros
 * Body: { maestroId, rol } (rol: "titular" | "auxiliar")
 */
const addMaestroToGrupo = async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);
    const { maestroId, rol } = req.body;

    if (!maestroId) {
      return sendError(res, 'MaestroId es requerido', 'VALIDATION_ERROR', 400);
    }

    if (rol && !['titular', 'auxiliar'].includes(rol)) {
      return sendError(res, 'El rol debe ser "titular" o "auxiliar"', 'VALIDATION_ERROR', 400);
    }

    const grupoModel = require('../models/grupo.model');

    // Verificar que el grupo exista
    const grupo = await grupoModel.findById(grupoId);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }

    // Verificar que el maestro exista y esté activo
    const maestroResult = await pool.query(
      'SELECT id FROM maestros WHERE id = $1 AND activo = true',
      [maestroId]
    );
    if (maestroResult.rows.length === 0) {
      return sendError(res, 'Maestro no encontrado', 'NOT_FOUND', 404);
    }

    // Verificar que no esté ya asignado
    const existente = await grupoModel.findMaestroEnGrupo(grupoId, maestroId);
    if (existente) {
      return sendError(res, 'El maestro ya está asignado a este grupo', 'CONFLICT', 409);
    }

    const asignacion = await grupoModel.addMaestro(grupoId, maestroId, rol || 'titular');
    return success(res, toCamelCaseObj(asignacion), 201);
  } catch (err) {
    console.error('Error al asignar maestro al grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/grupos/:id/maestros/:maestroId → activo=false en grupo_maestros
 */
const removeMaestroFromGrupo = async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);
    const maestroId = parseInt(req.params.maestroId);

    const grupoModel = require('../models/grupo.model');
    const resultado = await grupoModel.removeMaestro(grupoId, maestroId);
    if (!resultado) {
      return sendError(res, 'Asignación de maestro no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(resultado));
  } catch (err) {
    console.error('Error al desasignar maestro del grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

// ─── Grupo-Alumnos (Inscripciones) ─────────────────────────────

/**
 * GET /api/grupos/:id/alumnos → alumnos inscritos activos
 */
const getGrupoAlumnos = async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);

    const grupoModel = require('../models/grupo.model');

    // Verificar que el grupo exista
    const grupo = await grupoModel.findById(grupoId);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }

    const alumnos = await grupoModel.findAlumnos(grupoId);
    return paginatedSuccess(res, toCamelCaseArr(alumnos), 1, alumnos.length, alumnos.length);
  } catch (err) {
    console.error('Error al obtener alumnos del grupo:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/grupos/:id/inscripciones
 * Body: { alumnoId }
 */
const inscribirAlumno = async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);
    const { alumnoId } = req.body;

    if (!alumnoId) {
      return sendError(res, 'AlumnoId es requerido', 'VALIDATION_ERROR', 400);
    }

    // Verificar que el grupo exista
    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.findById(grupoId);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }

    // Verificar que el alumno exista y esté activo
    const alumnoResult = await pool.query(
      'SELECT id FROM alumnos WHERE id = $1 AND activo = true',
      [alumnoId]
    );
    if (alumnoResult.rows.length === 0) {
      return sendError(res, 'Alumno no encontrado', 'NOT_FOUND', 404);
    }

    // Verificar que no esté ya inscrito activo
    const existente = await inscripcionModel.findByAlumnoAndGrupo(alumnoId, grupoId);
    if (existente) {
      return sendError(res, 'El alumno ya está inscrito en este grupo', 'CONFLICT', 409);
    }

    const inscripcion = await inscripcionModel.create({ alumnoId, grupoId });
    return success(res, toCamelCaseObj(inscripcion), 201);
  } catch (err) {
    console.error('Error al inscribir alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/grupos/:id/inscripciones/lote
 * Body: { alumnoIds: [1, 2, 3, ...] }
 */
const inscribirLote = async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);
    const { alumnoIds } = req.body;

    if (!alumnoIds || !Array.isArray(alumnoIds) || alumnoIds.length === 0) {
      return sendError(res, 'alumnoIds es requerido y debe ser un array no vacío', 'VALIDATION_ERROR', 400);
    }

    // Verificar que el grupo exista
    const grupoModel = require('../models/grupo.model');
    const grupo = await grupoModel.findById(grupoId);
    if (!grupo) {
      return sendError(res, 'Grupo no encontrado', 'NOT_FOUND', 404);
    }

    const { exitosas, errores } = await inscripcionModel.createBatch(grupoId, alumnoIds);

    return success(res, {
      inscritos: toCamelCaseArr(exitosas),
      errores,
    }, exitosas.length > 0 ? 201 : 200);
  } catch (err) {
    console.error('Error al inscribir lote:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getGrupos,
  getGrupo,
  getGrupoDetalle,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  addMaestroToGrupo,
  removeMaestroFromGrupo,
  getGrupoAlumnos,
  inscribirAlumno,
  inscribirLote,
};
