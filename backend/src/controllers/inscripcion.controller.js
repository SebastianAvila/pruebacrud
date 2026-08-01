const inscripcionModel = require('../models/inscripcion.model');
const { toCamelCaseObj, success, sendError } = require('../utils/response');

/**
 * DELETE /api/inscripciones/:id → activo=false
 * Baja lógica de una inscripción.
 */
const deleteInscripcion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inscripcion = await inscripcionModel.deactivate(id);
    if (!inscripcion) {
      return sendError(res, 'Inscripción no encontrada', 'NOT_FOUND', 404);
    }
    return success(res, toCamelCaseObj(inscripcion));
  } catch (err) {
    console.error('Error al eliminar inscripción:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { deleteInscripcion };
