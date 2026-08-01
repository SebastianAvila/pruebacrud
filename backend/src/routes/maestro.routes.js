const express = require('express');
const router = express.Router();
const {
  getMaestros,
  getMaestro,
  createMaestro,
  updateMaestro,
  deleteMaestro,
} = require('../controllers/maestro.controller');

router.get('/', getMaestros);
router.get('/:id', getMaestro);
router.post('/', createMaestro);
router.put('/:id', updateMaestro);
router.delete('/:id', deleteMaestro);

module.exports = router;
