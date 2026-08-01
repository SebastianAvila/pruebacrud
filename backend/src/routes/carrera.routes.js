const express = require('express');
const router = express.Router();
const {
  getCarreras,
  getCarrera,
  createCarrera,
  updateCarrera,
  deleteCarrera,
} = require('../controllers/carrera.controller');

// Todas estas rutas requieren autenticación (montadas con authMiddleware en server.js)
router.get('/', getCarreras);
router.get('/:id', getCarrera);
router.post('/', createCarrera);
router.put('/:id', updateCarrera);
router.delete('/:id', deleteCarrera);

module.exports = router;
