import { peticion } from './http'

// POST /api/auth/login  ->  { token, expiracion, usuario: { id, nombre, rol } }
export function login(credenciales) {
  return peticion('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  })
}

// POST /api/auth/logout  (cierra la sesión en la tabla Sesion)
export function logout(token) {
  return peticion('/api/auth/logout', { method: 'POST', token })
}

// GET /api/auth/perfil  ->  datos de la persona y, si tiene, de su empleado
export function obtenerPerfil(token) {
  return peticion('/api/auth/perfil', { token })
}

// POST /api/auth/cambiar-contrasena  (el servidor cierra todas las sesiones del usuario)
export function cambiarContrasena(token, contrasenaActual, contrasenaNueva) {
  return peticion('/api/auth/cambiar-contrasena', {
    method: 'POST',
    token,
    body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
  })
}
