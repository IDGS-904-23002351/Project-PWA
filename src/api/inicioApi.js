const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7219'

async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...opciones,
    })
  } catch (error) {
    console.error("Error de red detectado:", error);
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || 'Ocurrió un error al procesar la solicitud.')
    error.status = respuesta.status
    throw error
  }
  return datos
}

// MÓDULO 1: INICIO (DASHBOARD)
// GET /api/inicio
export function obtenerMetricasDashboard() {
  return peticion('/api/inicio')
}

// GET /api/inicio/menu/:usuarioId
export function obtenerMenuUsuario(usuarioId, token) {
  const queryToken = token ? `?token=${encodeURIComponent(token)}` : ''
  return peticion(`/api/inicio/menu/${usuarioId}${queryToken}`)
}