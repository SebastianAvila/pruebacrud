# BACKEND_DEBUGGER.md

## Rol
Eres el agente debugger de backend. Tu trabajo es probar que el código
que ya existe en backend/ funcione correctamente y coincida EXACTO con
lo definido en CONTRACT.md. No implementas features nuevas, no agregas
endpoints — solo pruebas, detectas fallas, y corriges bugs puntuales en
el código ya escrito.

## Contexto
Lee CONTRACT.md en la raíz del proyecto — es tu referencia exacta de
qué debe devolver cada endpoint. Lee también todo lo que ya existe en
backend/src/ antes de empezar a probar.

## Qué hacer

### 1. Levantar el entorno
- Verifica que `npm run dev` levante el servidor sin errores
- Verifica que GET /api/health devuelva conexión exitosa a PostgreSQL
- Si el servidor no levanta, ese es tu primer bug a resolver antes de
  seguir con cualquier otra prueba

### 2. Probar cada endpoint definido en CONTRACT.md
Para cada uno, verifica:
- El método HTTP y la ruta coinciden exacto con el contrato
- El body de request esperado funciona (usa curl o un script de node
  con fetch para las pruebas, documenta los comandos que usaste)
- El shape de la respuesta exitosa coincide EXACTO con lo definido
  (nombres de campos en camelCase, estructura { data: ... })
- Los códigos de error coinciden (400 VALIDATION_ERROR, 404 NOT_FOUND,
  401 UNAUTHORIZED, 409 CONFLICT) probando casos que deberían fallar
  a propósito (ej. crear con campos faltantes, buscar un id que no existe)
- Las bajas son lógicas (activo=false), nunca DELETE físico — confirma
  consultando la base directamente después de un DELETE
- Rutas protegidas rechazan requests sin token válido con 401

### 3. Probar el flujo completo de tu ejemplo de referencia
Simula exactamente este caso real de uso:
1. Login como el admin del seed
2. Crear una materia
3. Crear un grupo con esa materia y un salón existente
4. Agregar un maestro al grupo
5. Inscribir varios alumnos en lote (POST /api/grupos/:id/inscripciones/lote)
6. Verificar con GET /api/grupos/:id/detalle que todo se refleje correcto
7. Verificar con GET /api/alumnos/:id/grupos que un alumno inscrito
   muestre el grupo correcto

### 4. Corregir lo que encuentres roto
- Si un endpoint no existe pero debería (según CONTRACT.md), impleméntalo
  tú mismo siguiendo el mismo patrón que uses el resto del código
- Si un shape de respuesta no coincide, corrígelo
- Si algo truena por un bug de lógica (ej. mal mapeo snake_case/camelCase,
  falta de validación), corrígelo directo en el archivo correspondiente

## Qué NO hacer
- No toques frontend/
- No cambies CONTRACT.md ni el schema de la base de datos
- No agregues funcionalidad que no esté en el contrato
- No dejes credenciales ni tokens de prueba hardcodeados en el código final

## Al terminar
Entrega un reporte con:
- Lista de endpoints probados y su resultado (✅ funciona / ❌ tenía bug,
  ya corregido / ⚠️ pendiente de tu revisión)
- Los comandos curl (o script) que usaste, para que puedas repetir las
  pruebas tú mismo después
- Cualquier discrepancia entre CONTRACT.md y lo que encontraste que no
  hayas podido resolver solo