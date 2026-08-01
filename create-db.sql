-- Create database control_escolar
-- Run this first: psql -U postgres -c "CREATE DATABASE control_escolar;"

-- Then run this file: psql -U postgres -d control_escolar -f create-db.sql

-- Schema from CONTRACT.md

CREATE TABLE IF NOT EXISTS carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  clave VARCHAR(20) UNIQUE NOT NULL,
  duracion_semestres INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS salones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  edificio VARCHAR(50),
  capacidad INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS maestros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS alumnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  matricula VARCHAR(30) UNIQUE NOT NULL,
  carrera_id INT REFERENCES carreras(id),
  salon_id INT REFERENCES salones(id),
  fecha_nacimiento DATE,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  clave VARCHAR(20) UNIQUE NOT NULL,
  carrera_id INT REFERENCES carreras(id),
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS grupos (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES materias(id),
  salon_id INT NOT NULL REFERENCES salones(id),
  ciclo_escolar VARCHAR(20) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS grupo_maestros (
  id SERIAL PRIMARY KEY,
  grupo_id INT NOT NULL REFERENCES grupos(id),
  maestro_id INT NOT NULL REFERENCES maestros(id),
  rol VARCHAR(20) NOT NULL DEFAULT 'titular',
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(grupo_id, maestro_id)
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id SERIAL PRIMARY KEY,
  alumno_id INT NOT NULL REFERENCES alumnos(id),
  grupo_id INT NOT NULL REFERENCES grupos(id),
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(alumno_id, grupo_id)
);
