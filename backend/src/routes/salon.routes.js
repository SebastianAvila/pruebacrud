const express = require('express');
const router = express.Router();
const {
  getSalones,
  getSalon,
  createSalon,
  updateSalon,
  deleteSalon,
} = require('../controllers/salon.controller');

router.get('/', getSalones);
router.get('/:id', getSalon);
router.post('/', createSalon);
router.put('/:id', updateSalon);
router.delete('/:id', deleteSalon);

module.exports = router;
