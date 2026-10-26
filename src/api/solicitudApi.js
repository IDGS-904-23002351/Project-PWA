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

// MÓDULO 3: SOLICITUDES
// GET /api/solicitud
export function obtenerSolicitudes() {
  return peticion('/api/solicitud')
}

// POST /api/solicitud
export function crearSolicitud(datosSolicitud) {
  return peticion('/api/solicitud', {
    method: 'POST',
    body: JSON.stringify(datosSolicitud),
  })
}

// PUT /api/solicitud/:id/estado
export function actualizarEstadoSolicitud(id, datosEstado) {
  return peticion(`/api/solicitud/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify(datosEstado),
  })
}
