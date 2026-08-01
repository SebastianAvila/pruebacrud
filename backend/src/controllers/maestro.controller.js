const bcrypt = require('bcrypt');
const maestroModel = require('../models/maestro.model');
const { toCamelCaseObj, toCamelCaseArr, success, paginatedSuccess, sendError } = require('../utils/response');

/**
 * GET /api/maestros?page=&limit=
 * Nunca expone password_hash en la respuesta.
 */
const getMaestros = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await maestroModel.findAll(page, limit);
    // toCamelCaseArr ya excluye password_hash
    return paginatedSuccess(res, toCamelCaseArr(rows), page, limit, total);
  } catch (err) {
    console.error('Error al obtener maestros:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * GET /api/maestros/:id
 */
const getMaestro = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const maestro = await maestroModel.findById(id);
    if (!maestro) {
      return sendError(res, 'Maestro no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(maestro));
  } catch (err) {
    console.error('Error al obtener maestro:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * POST /api/maestros
 * Body: { nombre, apellido, email, telefono?, password }
 * El password se hashea con bcrypt antes de guardar.
 */
const createMaestro = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return sendError(res, 'Nombre, apellido, email y password son requeridos', 'VALIDATION_ERROR', 400);
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'El formato del email no es válido', 'VALIDATION_ERROR', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'El password debe tener al menos 6 caracteres', 'VALIDATION_ERROR', 400);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const maestro = await maestroModel.create({ nombre, apellido, email, telefono, passwordHash });
    return success(res, toCamelCaseObj(maestro), 201);
  } catch (err) {
    // Email duplicado
    if (err.code === '23505') {
      return sendError(res, 'Ya existe un maestro con ese email', 'CONFLICT', 409);
    }
    console.error('Error al crear maestro:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * PUT /api/maestros/:id
 * Body: { nombre?, apellido?, telefono? }
 * NOTA: No se permite cambiar password ni email desde aquí (según CONTRACT.md).
 */
const updateMaestro = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, apellido, telefono } = req.body;

    const maestro = await maestroModel.update(id, { nombre, apellido, telefono });
    if (!maestro) {
      return sendError(res, 'Maestro no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(maestro));
  } catch (err) {
    console.error('Error al actualizar maestro:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

/**
 * DELETE /api/maestros/:id → activo=false
 */
const deleteMaestro = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const maestro = await maestroModel.deactivate(id);
    if (!maestro) {
      return sendError(res, 'Maestro no encontrado', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(maestro));
  } catch (err) {
    console.error('Error al eliminar maestro:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { getMaestros, getMaestro, createMaestro, updateMaestro, deleteMaestro };
