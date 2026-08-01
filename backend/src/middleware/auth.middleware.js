const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 * Verifica el header Authorization: Bearer <token>.
 * Si es válido, decodifica el payload y lo coloca en req.maestro.
 * Si no, responde 401 UNAUTHORIZED.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token no proporcionado',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.maestro = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      code: 'UNAUTHORIZED',
    });
  }
};

module.exports = authMiddleware;
