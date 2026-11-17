const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

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
    const error = new Error(datos.mensaje || 'Ocurrió un error. Intenta de nuevo.')
    error.status = respuesta.status
    throw error
  }
  return datos
}
