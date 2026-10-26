// Dirección del backend
const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

// Hace un fetch y convierte los errores HTTP en errores de JavaScript con un mensaje legible
async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...opciones,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || 'Ocurrió un error. Intenta de nuevo.')
    error.status = respuesta.status
    throw error
  }
  return datos
}

// POST /api/auth/login
export function login(credenciales) {
  return peticion('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  })
}

// POST /api/auth/logout
export function logout(token) {
  return peticion('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// MÓDULO 1: INICIO (DASHBOARD)
// GET /api/inicio
export function obtenerMetricasDashboard() {
  return peticion('/api/inicio')
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

// GET /api/inicio/menu/:usuarioId
export function obtenerMenuUsuario(usuarioId, token) {
  const queryToken = token ? `?token=${encodeURIComponent(token)}` : ''
  return peticion(`/api/inicio/menu/${usuarioId}${queryToken}`)
}