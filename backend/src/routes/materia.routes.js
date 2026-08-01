const express = require('express');
const router = express.Router();
const {
  getMaterias,
  getMateria,
  createMateria,
  updateMateria,
  deleteMateria,
} = require('../controllers/materia.controller');

router.get('/', getMaterias);
router.get('/:id', getMateria);
router.post('/', createMateria);
router.put('/:id', updateMateria);
router.delete('/:id', deleteMateria);

module.exports = router;
