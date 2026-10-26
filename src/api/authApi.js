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