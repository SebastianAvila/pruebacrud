-- ============================================================
-- USUARIOS FICTICIOS — CONTROL ESCOLAR (MÉRIDA)
-- Inyección manual. Ejecutar: psql -U postgres -d control_escolar -f usuarios-ficticios.sql
-- Idempotente: si el email ya existe, actualiza los datos y el password.
--
-- CREDENCIALES:
--   ADMIN  -> midadmin@merida.edu.mx / admin123
--   Usuario-> lfernandez@merida.edu.mx / pass123
--   Usuario-> mgonzalez@merida.edu.mx / pass123
--   Usuario-> cibarra@merida.edu.mx   / pass123
--   Usuario-> atorres@merida.edu.mx   / pass123
--   Usuario-> rsalazar@merida.edu.mx  / pass123
-- ============================================================

INSERT INTO maestros (nombre, apellido, email, telefono, password_hash, activo) VALUES
  ('Mario',   'Iñiguez Domínguez', 'midadmin@merida.edu.mx', '999-100-0001', '$2b$10$UP4ujSOqsbWZFjjtQUgjz.GU4QN2weEmJqBtziA2NEfVAWrM0klzC', true),
  ('Luis',    'Fernández Canto',   'lfernandez@merida.edu.mx', '999-100-0002', '$2b$10$avlhkTw5Jh7KhecMcL1LlegsO85aTSj5iQzRQzxlXH9fOnR3th44i', true),
  ('María',   'González Pacheco',  'mgonzalez@merida.edu.mx', '999-100-0003', '$2b$10$KKPK2FU3RiFBTKplvIkl9uz3N0Fwu6bNqmbtVlkXjXEBocHMjjyEW', true),
  ('Carlos',  'Ibarra Sosa',       'cibarra@merida.edu.mx',   '999-100-0004', '$2b$10$ZOuKNiBJTwobKW/CizN6sO0TZBCWKNxE7anfrn1..0F24Pn9oKAn.', true),
  ('Ana',     'Torres May',        'atorres@merida.edu.mx',   '999-100-0005', '$2b$10$Sk5c5psVIq5tTdy9bR8QqeMCJMg3IQH1DCbPI/Y5OF9igL8pXABUS', true),
  ('Rodrigo', 'Salazar Pech',      'rsalazar@merida.edu.mx',  '999-100-0006', '$2b$10$0kdrmy0AWa0vTF3BugB/y.adgxWksTtRt0CZ5oOjpgezMyV39Df.S', true)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  telefono = EXCLUDED.telefono,
  password_hash = EXCLUDED.password_hash,
  activo = true;
