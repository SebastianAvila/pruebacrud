require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
const authMiddleware = require('./src/middleware/auth.middleware');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const carreraRoutes = require('./src/routes/carrera.routes');
const salonRoutes = require('./src/routes/salon.routes');
const maestroRoutes = require('./src/routes/maestro.routes');
const alumnoRoutes = require('./src/routes/alumno.routes');
const materiaRoutes = require('./src/routes/materia.routes');
const grupoRoutes = require('./src/routes/grupo.routes');
const inscripcionRoutes = require('./src/routes/inscripcion.routes');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Health check (sin auth) ───────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos', code: 'SERVER_ERROR' });
  }
});

// ─── Auth routes (sin auth — login es público) ─────────────────
app.use('/api/auth', authRoutes);

// ─── Protected routes (todas requieren Bearer token) ───────────
app.use('/api/carreras', authMiddleware, carreraRoutes);
app.use('/api/salones', authMiddleware, salonRoutes);
app.use('/api/maestros', authMiddleware, maestroRoutes);
app.use('/api/alumnos', authMiddleware, alumnoRoutes);
app.use('/api/materias', authMiddleware, materiaRoutes);
app.use('/api/grupos', authMiddleware, grupoRoutes);
app.use('/api/inscripciones', authMiddleware, inscripcionRoutes);

// ─── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor', code: 'SERVER_ERROR' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
