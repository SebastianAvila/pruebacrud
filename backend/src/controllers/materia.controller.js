const materiaModel = require('../models/materia.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

/**
 * GET /api/materias?page=&limit=&carreraId=
 */
const getMaterias = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};
    if (req.query.carreraId) filters.carreraId = parseInt(req.query.carreraId);

    const { rows, total } = await materiaModel.findAll(page, limit, filters);
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener materias:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/materias/:id
 */
const getMateria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const materia = await materiaModel.findById(id);
    if (!materia) {
      return sendError(res, 'Materia no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(materia));
  } catch (err) {
    console.error('Error al obtener materia:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/materias
 * Body: { nombre, clave, carreraId? }
 */
const createMateria = async (req, res) => {
  try {
    const { nombre, clave, carreraId } = req.body;

    if (!nombre || !clave) {
      return sendError(res, 'Nombre y clave son requeridos', 'VALIDATION_ERROR', 400);
    }

    const materia = await materiaModel.create({ nombre, clave, carreraId });
    return success(res, toCamelCaseObj(materia), 201);
  } catch (err) {
    if (err.code === '23505') {
      return sendError(res, 'Ya existe una materia con esa clave', 'CONFLICT', 409);
    }
    console.error('Error al crear materia:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/materias/:id
 * Body: { nombre?, clave?, carreraId? }
 */
const updateMateria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, clave, carreraId } = req.body;

    const materia = await materiaModel.update(id, { nombre, clave, carreraId });
    if (!materia) {
      return sendError(res, 'Materia no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(materia));
  } catch (err) {
    if (err.code === '23505') {
      return sendError(res, 'Ya existe una materia con esa clave', 'CONFLICT', 409);
    }
    console.error('Error al actualizar materia:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/materias/:id → activo=false
 */
const deleteMateria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const materia = await materiaModel.deactivate(id);
    if (!materia) {
      return sendError(res, 'Materia no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(materia));
  } catch (err) {
    console.error('Error al eliminar materia:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { getMaterias, getMateria, createMateria, updateMateria, deleteMateria };
