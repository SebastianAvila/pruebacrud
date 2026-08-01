const alumnoModel = require('../models/alumno.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

/**
 * GET /api/alumnos?page=&limit=&carreraId=&salonId=
 */
const getAlumnos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};
    if (req.query.carreraId) filters.carreraId = parseInt(req.query.carreraId);
    if (req.query.salonId) filters.salonId = parseInt(req.query.salonId);

    const { rows, total } = await alumnoModel.findAll(page, limit, filters);
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener alumnos:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/alumnos/:id
 */
const getAlumno = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const alumno = await alumnoModel.findById(id);
    if (!alumno) {
      return sendError(res, 'Alumno no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(alumno));
  } catch (err) {
    console.error('Error al obtener alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/alumnos
 * Body: { nombre, apellido, matricula, carreraId?, salonId?, fechaNacimiento? }
 */
const createAlumno = async (req, res) => {
  try {
    const { nombre, apellido, matricula, carreraId, salonId, fechaNacimiento } = req.body;

    if (!nombre || !apellido || !matricula) {
      return sendError(res, 'Nombre, apellido y matrícula son requeridos', 'VALIDATION_ERROR', 400);
    }

    const alumno = await alumnoModel.create({ nombre, apellido, matricula, carreraId, salonId, fechaNacimiento });
    return success(res, toCamelCaseObj(alumno), 201);
  } catch (err) {
    // Matrícula duplicada
    if (err.code === '23505') {
      return sendError(res, 'Ya existe un alumno con esa matrícula', 'CONFLICT', 409);
    }
    console.error('Error al crear alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/alumnos/:id
 * Body: { nombre?, apellido?, carreraId?, salonId?, fechaNacimiento? }
 */
const updateAlumno = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, apellido, carreraId, salonId, fechaNacimiento } = req.body;

    const alumno = await alumnoModel.update(id, { nombre, apellido, carreraId, salonId, fechaNacimiento });
    if (!alumno) {
      return sendError(res, 'Alumno no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(alumno));
  } catch (err) {
    console.error('Error al actualizar alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/alumnos/:id → activo=false
 */
const deleteAlumno = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const alumno = await alumnoModel.deactivate(id);
    if (!alumno) {
      return sendError(res, 'Alumno no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(alumno));
  } catch (err) {
    console.error('Error al eliminar alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/alumnos/:id/grupos
 * Devuelve los grupos activos en los que está inscrito el alumno.
 */
const getAlumnoGrupos = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verificar que el alumno exista y esté activo
    const alumno = await alumnoModel.findById(id);
    if (!alumno) {
      return sendError(res, 'Alumno no encontrado', 'NOT_FOUND', 404);
    }

    const grupos = await alumnoModel.findGruposByAlumno(id);
    return paginatedSuccess(res, toCamelCaseArr(grupos), 1, grupos.length, grupos.length);
  } catch (err) {
    console.error('Error al obtener grupos del alumno:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { getAlumnos, getAlumno, createAlumno, updateAlumno, deleteAlumno, getAlumnoGrupos };
