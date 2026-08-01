const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

// POST /api/auth/login — NO requiere token
router.post('/login', login);

module.exports = router;
