const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { toCamelCaseObj, success, sendError } = require('../utils/response');

/**
 * POST /api/auth/login
 * Body: { email, password }
 * 200: { data: { token, maestro: { id, nombre, apellido, email } } }
 * 401: { error, code: "UNAUTHORIZED" }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return sendError(res, 'Email y password son requeridos', 'VALIDATION_ERROR', 400);
    }

    // Buscar maestro activo por email
    const result = await pool.query(
      'SELECT * FROM maestros WHERE email = $1 AND activo = true',
      [email]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Credenciales inválidas', 'UNAUTHORIZED', 401);
    }

    const maestro = result.rows[0];

    // Verificar password con bcrypt
    const validPassword = await bcrypt.compare(password, maestro.password_hash);
    if (!validPassword) {
      return sendError(res, 'Credenciales inválidas', 'UNAUTHORIZED', 401);
    }

    // Generar JWT
    const tokenPayload = {
      id: maestro.id,
      nombre: maestro.nombre,
      apellido: maestro.apellido,
      email: maestro.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Responder solo con los campos definidos en CONTRACT.md
    return success(res, {
      token,
      maestro: {
        id: maestro.id,
        nombre: maestro.nombre,
        apellido: maestro.apellido,
        email: maestro.email,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return sendError(res, 'Error interno del servidor', 'SERVER_ERROR', 500);
  }
};

module.exports = { login };
