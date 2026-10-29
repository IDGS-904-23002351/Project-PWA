// src/api/empleadoApi.js
const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...opciones,
    })
  } catch (error) {
    console.error('Error de red detectado:', error)
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión o el certificado SSL.')
  }

  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  let datos = {}
  try { datos = texto ? JSON.parse(texto) : {} } catch { datos = { raw: texto } }

  if (!respuesta.ok) {
    console.error(`[${respuesta.status}] ${ruta}`, datos)
    const mensaje =
      datos?.mensaje ||
      datos?.message ||
      datos?.title ||
      datos?.error ||
      (datos?.errors && Object.values(datos.errors).flat().join(', ')) ||
      `Error ${respuesta.status}: ${respuesta.statusText}`
    const error = new Error(mensaje)
    error.status = respuesta.status
    error.detalle = datos
    throw error
  }

  return datos
}

export const empleadoApi = {
  listar: async () => peticion(`/api/Empleado/Listar`, { method: 'GET' }),
  obtener: async (id) => peticion(`/api/Empleado/Obtener/${id}`, { method: 'GET' }),
  crear: async (empleado) => peticion('/api/Empleado/Crear', { method: 'POST', body: JSON.stringify(empleado) }),
  actualizar: async (id, empleado) => peticion(`/api/Empleado/Actualizar/${id}`, { method: 'PUT', body: JSON.stringify(empleado) }),
  eliminar: async (id, motivo = 'No especificado') => peticion(`/api/Empleado/Eliminar/${id}?motivo=${encodeURIComponent(motivo)}`, { method: 'DELETE' }),
  reactivar: async (id) => peticion(`/api/Empleado/Reactivar/${id}`, { method: 'PATCH' }),
  obtenerEmpresas: async () => peticion('/api/Empleado/Empresas', { method: 'GET' }),
  obtenerSedes: async () => peticion('/api/Empleado/Sedes', { method: 'GET' }),
  obtenerDepartamentos: async () => peticion('/api/Empleado/Departamentos', { method: 'GET' }),
  obtenerTurnos: async () => peticion('/api/Empleado/Turnos', { method: 'GET' }),
  obtenerRoles: async () => peticion('/api/Empleado/Roles', { method: 'GET' }),
  obtenerDirecciones: async () => peticion('/api/Empleado/Direcciones', { method: 'GET' }),
}