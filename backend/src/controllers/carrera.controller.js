const carreraModel = require('../models/carrera.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

/**
 * GET /api/carreras?page=&limit=
 */
const getCarreras = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await carreraModel.findAll(page, limit);
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener carreras:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/carreras/:id
 */
const getCarrera = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const carrera = await carreraModel.findById(id);
    if (!carrera) {
      return sendError(res, 'Carrera no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(carrera));
  } catch (err) {
    console.error('Error al obtener carrera:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/carreras
 * Body: { nombre, clave, duracionSemestres }
 */
const createCarrera = async (req, res) => {
  try {
    const { nombre, clave, duracionSemestres } = req.body;

    // Validaciones
    if (!nombre || !clave || !duracionSemestres) {
      return sendError(res, 'Nombre, clave y duración en semestres son requeridos', 'VALIDATION_ERROR', 400);
    }

    if (typeof duracionSemestres !== 'number' || duracionSemestres <= 0) {
      return sendError(res, 'Duración en semestres debe ser un número positivo', 'VALIDATION_ERROR', 400);
    }

    const carrera = await carreraModel.create({ nombre, clave, duracionSemestres });
    return success(res, toCamelCaseObj(carrera), 201);
  } catch (err) {
    // Unique violation (clave duplicada)
    if (err.code === '23505') {
      return sendError(res, 'Ya existe una carrera con esa clave', 'CONFLICT', 409);
    }
    console.error('Error al crear carrera:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/carreras/:id
 * Body: { nombre?, clave?, duracionSemestres? }
 */
const updateCarrera = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, clave, duracionSemestres } = req.body;

    if (duracionSemestres !== undefined && (typeof duracionSemestres !== 'number' || duracionSemestres <= 0)) {
      return sendError(res, 'Duración en semestres debe ser un número positivo', 'VALIDATION_ERROR', 400);
    }

    const carrera = await carreraModel.update(id, { nombre, clave, duracionSemestres });
    if (!carrera) {
      return sendError(res, 'Carrera no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(carrera));
  } catch (err) {
    if (err.code === '23505') {
      return sendError(res, 'Ya existe una carrera con esa clave', 'CONFLICT', 409);
    }
    console.error('Error al actualizar carrera:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/carreras/:id → activo=false
 */
const deleteCarrera = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const carrera = await carreraModel.deactivate(id);
    if (!carrera) {
      return sendError(res, 'Carrera no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(carrera));
  } catch (err) {
    console.error('Error al eliminar carrera:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { getCarreras, getCarrera, createCarrera, updateCarrera, deleteCarrera };
