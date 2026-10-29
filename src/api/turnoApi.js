// src/api/turnoApi.js
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
  try { 
    datos = texto ? JSON.parse(texto) : {} 
  } catch { 
    datos = { raw: texto } 
  }

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

export const turnoApi = {
  obtenerResumen: async () => 
    peticion('/api/Turno/Resumen', { method: 'GET' }),

  listarAsignaciones: async (buscar = '', turno_id = '', departamento_id = '', pagina = 1, tamano_pagina = 10) => {
    // Si no hay valor, enviamos '0' para evitar barras dobles (//) que causan error 404
    const b = buscar ? encodeURIComponent(buscar) : '0'
    const t = turno_id || '0'
    const d = departamento_id || '0'
    
    // Esta URL se verá así: /api/Turno/Asignaciones/0/0/0/1/10
    const url = `/api/Turno/Asignaciones/${b}/${t}/${d}/${pagina}/${tamano_pagina}`
    
    return peticion(url, { method: 'GET' })
  },

  buscarTurno: async (q = '') => 
    peticion(`/api/Turno/Buscar/${encodeURIComponent(q)}`, { method: 'GET' }),

  crearTurno: async (data) => 
    peticion('/api/Turno/Crear', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  cambiarTurno: async (empleado_id, nuevo_turno_id) => 
    peticion('/api/Turno/CambiarTurno', {
      method: 'PUT',
      body: JSON.stringify({ empleado_id, nuevo_turno_id })
    }),

  eliminarTurno: async (id) => 
    peticion(`/api/Turno/Eliminar/${id}`, { method: 'DELETE' })
}