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
    const params = new URLSearchParams();

    if (buscar) params.append('buscar', buscar);
    if (turno_id) params.append('turno_id', turno_id);
    if (departamento_id) params.append('departamento_id', departamento_id);
    params.append('pagina', pagina);
    params.append('tamano_pagina', tamano_pagina);
    
    const url = `/api/Turno/Asignaciones?${params.toString()}`
    
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