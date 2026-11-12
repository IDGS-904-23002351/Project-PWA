import { peticion } from './http'

export function obtenerSolicitudes(token) {
  return peticion('/api/solicitud', { token })
}

export function crearSolicitud(token, datosSolicitud) {
  return peticion('/api/solicitud', {
    method: 'POST',
    token,
    body: JSON.stringify(datosSolicitud),
  })
}

export function actualizarEstadoSolicitud(token, id, datosEstado) {
  return peticion(`/api/solicitud/${id}/estado`, {
    method: 'PUT',
    token,
    body: JSON.stringify(datosEstado),
  })
}