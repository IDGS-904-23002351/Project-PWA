import { peticion } from './http'

export function obtenerMetricasDashboard(token) {
  return peticion('/api/inicio', { token })
}

export function obtenerMenuUsuario(token, usuarioId) {
  return peticion(`/api/inicio/menu/${usuarioId}`, { token })
}