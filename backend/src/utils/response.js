/**
 * Helpers de respuesta y conversión según CONTRACT.md
 * - JSON en camelCase, columnas de DB en snake_case
 * - Formato: { data } para éxito, { error, code } para error
 */

// ─── Conversión snake_case ↔ camelCase ──────────────────────────

/**
 * Convierte una clave snake_case a camelCase
 */
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
};

/**
 * Convierte un objeto de DB (snake_case) a formato JSON (camelCase).
 * Excluye password_hash por seguridad.
 */
const toCamelCaseObj = (obj) => {
  if (!obj) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'password_hash') continue; // nunca exponer el hash
    result[toCamelCase(key)] = value;
  }
  return result;
};

/**
 * Convierte un array de objetos de DB a camelCase
 */
const toCamelCaseArr = (arr) => {
  if (!arr) return [];
  return arr.map(toCamelCaseObj);
};

/**
 * Convierte una clave camelCase a snake_case
 */
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
};

/**
 * Convierte un objeto de requests (camelCase) a snake_case para queries
 */
const toSnakeCaseObj = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCase(key)] = value;
  }
  return result;
};

// ─── Formateo de respuestas ────────────────────────────────────

/**
 * Respuesta exitosa (ítem único o lista simple)
 */
const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

/**
 * Respuesta paginada exitosa
 */
const paginatedSuccess = (res, data, page, limit, total) => {
  return res.status(200).json({ data, page, limit, total });
};

/**
 * Respuesta de error
 * Codes: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, CONFLICT, SERVER_ERROR
 */
const sendError = (res, message, code, statusCode = 500) => {
  return res.status(statusCode).json({ error: message, code });
};

module.exports = {
  toCamelCaseObj,
  toCamelCaseArr,
  toSnakeCaseObj,
  success,
  paginatedSuccess,
  sendError,
};
