const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

// Nombre del aviso que se manda cuando el servidor ya no reconoce el token
export const EVENTO_SESION_EXPIRADA = 'nomi:sesion-expirada'

export async function peticion(ruta, { token, headers, ...opciones } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    // 401 con token = la sesión venció o la cerraron (por ejemplo, al dar de baja al usuario).
    // Se avisa a AuthContext para regresar al login. Sin token es el login fallido: no se avisa.
    if (respuesta.status === 401 && token) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
    const error = new Error(datos.mensaje || 'Ocurrió un error. Intenta de nuevo.')
    error.status = respuesta.status
    throw error
  }
  return datos
}
