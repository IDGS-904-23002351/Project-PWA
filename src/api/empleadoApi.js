// src/api/empleadoApi.js
const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

// La misma función peticion que tienes en authApi.js
async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...opciones,
    })
  } catch (error) {
    // Si el error es de certificado SSL en desarrollo, fetch lo lanza como TypeError
    console.error("Error de red detectado:", error);
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión o el certificado SSL.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || 'Ocurrió un error al procesar la solicitud.')
    error.status = respuesta.status
    throw error
  }
  return datos
}

export const empleadoApi = {
    listar: async (filtros = {}) => {
        const { buscar = 'null', estado = 'null' } = filtros;
        // Ajustamos la ruta según el controlador que hicimos
        const ruta = `/api/empleado/listar`;
        return peticion(ruta, { method: 'GET' });
    },
    
    obtener: async (id) => {
        return peticion(`/api/empleado/Obtener/${id}`, { method: 'GET' });
    }
};