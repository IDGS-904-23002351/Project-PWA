import { peticion } from './http'

// GET /api/bitacora?...  ->  { registros, total, pagina, tamano }
export function listarBitacora(token, filtros) {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) parametros.set(clave, valor)
  })
  return peticion(`/api/bitacora?${parametros}`, { token })
}

// GET /api/bitacora/filtros  ->  { acciones, usuarios }
export function obtenerFiltrosBitacora(token) {
  return peticion('/api/bitacora/filtros', { token })
}

// GET /api/configuracion  ->  { empresa, parametros }
export function obtenerConfiguracion(token) {
  return peticion('/api/configuracion', { token })
}

// PUT /api/configuracion/{clave}  { valor }
export function guardarParametro(token, clave, valor) {
  return peticion(`/api/configuracion/${encodeURIComponent(clave)}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ valor }),
  })
}
