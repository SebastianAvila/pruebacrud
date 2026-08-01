const salonModel = require('../models/salon.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

/**
 * GET /api/salones?page=&limit=
 */
const getSalones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await salonModel.findAll(page, limit);
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener salones:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/salones/:id
 */
const getSalon = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const salon = await salonModel.findById(id);
    if (!salon) {
      return sendError(res, 'Salón no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(salon));
  } catch (err) {
    console.error('Error al obtener salón:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/salones
 * Body: { nombre, edificio?, capacidad }
 */
const createSalon = async (req, res) => {
  try {
    const { nombre, edificio, capacidad } = req.body;

    if (!nombre || !capacidad) {
      return sendError(res, 'Nombre y capacidad son requeridos', 'VALIDATION_ERROR', 400);
    }

    if (typeof capacidad !== 'number' || capacidad <= 0) {
      return sendError(res, 'Capacidad debe ser un número positivo', 'VALIDATION_ERROR', 400);
    }

    const salon = await salonModel.create({ nombre, edificio, capacidad });
    return success(res, toCamelCaseObj(salon), 201);
  } catch (err) {
    console.error('Error al crear salón:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/salones/:id
 * Body: { nombre?, edificio?, capacidad? }
 */
const updateSalon = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, edificio, capacidad } = req.body;

    if (capacidad !== undefined && (typeof capacidad !== 'number' || capacidad <= 0)) {
      return sendError(res, 'Capacidad debe ser un número positivo', 'VALIDATION_ERROR', 400);
    }

    const salon = await salonModel.update(id, { nombre, edificio, capacidad });
    if (!salon) {
      return sendError(res, 'Salón no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(salon));
  } catch (err) {
    console.error('Error al actualizar salón:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/salones/:id → activo=false
 */
const deleteSalon = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const salon = await salonModel.deactivate(id);
    if (!salon) {
      return sendError(res, 'Salón no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(salon));
  } catch (err) {
    console.error('Error al eliminar salón:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { getSalones, getSalon, createSalon, updateSalon, deleteSalon };
