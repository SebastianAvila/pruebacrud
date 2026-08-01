const express = require('express');
const router = express.Router();
const { deleteInscripcion } = require('../controllers/inscripcion.controller');

// DELETE /api/inscripciones/:id → activo=false
router.delete('/:id', deleteInscripcion);

module.exports = router;
