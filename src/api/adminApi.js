import { peticion } from './http'

export function listarBitacora(token, filtros) {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) parametros.set(clave, valor)
  })
  return peticion(`/api/bitacora?${parametros}`, { token })
}

export function obtenerFiltrosBitacora(token) {
  return peticion('/api/bitacora/filtros', { token })
}

export function obtenerConfiguracion(token) {
  return peticion('/api/configuracion', { token })
}

export function guardarParametro(token, clave, valor) {
  return peticion(`/api/configuracion/${encodeURIComponent(clave)}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ valor }),
  })
}
