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

// MÓDULO 2: ASISTENCIAS
// GET /api/asistencia
export function obtenerAsistencias() {
  return peticion('/api/asistencia')
}

// POST /api/asistencia
export function registrarAsistencia(datosAsistencia) {
  return peticion('/api/asistencia', {
    method: 'POST',
    body: JSON.stringify(datosAsistencia),
  })
}

// NUEVO: PUT /api/asistencia/:id (Para guardar correcciones de asistencia desde el Drawer)
export function corregirAsistencia(id, datosCorreccion) {
  return peticion(`/api/asistencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datosCorreccion),
  })
}