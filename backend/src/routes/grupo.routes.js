const express = require('express');
const router = express.Router();
const {
  getGrupos,
  getGrupo,
  getGrupoDetalle,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  addMaestroToGrupo,
  removeMaestroFromGrupo,
  getGrupoAlumnos,
  inscribirAlumno,
  inscribirLote,
} = require('../controllers/grupo.controller');

// CRUD de grupos
router.get('/', getGrupos);
router.get('/:id', getGrupo);
router.get('/:id/detalle', getGrupoDetalle);
router.post('/', createGrupo);
router.put('/:id', updateGrupo);
router.delete('/:id', deleteGrupo);

// Sub-rutas: Maestros del grupo
router.post('/:id/maestros', addMaestroToGrupo);
router.delete('/:id/maestros/:maestroId', removeMaestroFromGrupo);

// Sub-rutas: Alumnos del grupo
router.get('/:id/alumnos', getGrupoAlumnos);

// Sub-rutas: Inscripciones
router.post('/:id/inscripciones', inscribirAlumno);
router.post('/:id/inscripciones/lote', inscribirLote);

module.exports = router;
