const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

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
    if (respuesta.status === 401 && token) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
    const porFormato = respuesta.status === 400 && datos.errors
    const error = new Error(
      datos.mensaje ||
      (porFormato ? 'Algún dato no tiene el formato correcto. Revisa el formulario.' : 'Ocurrió un error. Intenta de nuevo.')
    )
    error.status = respuesta.status
    throw error
  }
  return datos
}
