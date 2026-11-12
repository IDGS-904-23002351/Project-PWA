import { peticion } from './http'

export function obtenerAsistencias(token) {
  return peticion('/api/asistencia', { token })
}

export function registrarAsistencia(token, datosAsistencia) {
  return peticion('/api/asistencia', {
    method: 'POST',
    token,
    body: JSON.stringify(datosAsistencia),
  })
}

export function corregirAsistencia(token, id, datosCorreccion) {
  return peticion(`/api/asistencia/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(datosCorreccion),
  })
}