import { peticion } from './http'

export function login(credenciales) {
  return peticion('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  })
}

export function logout(token) {
  return peticion('/api/auth/logout', { method: 'POST', token })
}

export function obtenerPerfil(token) {
  return peticion('/api/auth/perfil', { token })
}

export function cambiarContrasena(token, contrasenaActual, contrasenaNueva) {
  return peticion('/api/auth/cambiar-contrasena', {
    method: 'POST',
    token,
    body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
  })
}
