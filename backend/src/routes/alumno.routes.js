const express = require('express');
const router = express.Router();
const {
  getAlumnos,
  getAlumno,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  getAlumnoGrupos,
} = require('../controllers/alumno.controller');

router.get('/', getAlumnos);
router.get('/:id', getAlumno);
router.post('/', createAlumno);
router.put('/:id', updateAlumno);
router.delete('/:id', deleteAlumno);
router.get('/:id/grupos', getAlumnoGrupos);

module.exports = router;
