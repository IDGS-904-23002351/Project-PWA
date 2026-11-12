import { peticion } from './http'

export const turnoApi = {
  obtenerResumen: async (token) => 
    peticion('/api/Turno/Resumen', { method: 'GET', token }),
  listarAsignaciones: async (token, buscar = '', turno_id = '', departamento_id = '', pagina = 1, tamano_pagina = 10) => {
    const params = new URLSearchParams();
    if (buscar) params.append('buscar', buscar);
    if (turno_id) params.append('turno_id', turno_id);
    if (departamento_id) params.append('departamento_id', departamento_id);
    params.append('pagina', pagina);
    params.append('tamano_pagina', tamano_pagina);
    return peticion(`/api/Turno/Asignaciones?${params.toString()}`, { method: 'GET', token })
  },
  buscarTurno: async (token, q = '') => 
    peticion(`/api/Turno/Buscar/${encodeURIComponent(q)}`, { method: 'GET', token }),
  crearTurno: async (token, data) => 
    peticion('/api/Turno/Crear', { method: 'POST', token, body: JSON.stringify(data) }),
  cambiarTurno: async (token, empleado_id, nuevo_turno_id) => 
    peticion('/api/Turno/CambiarTurno', { method: 'PUT', token, body: JSON.stringify({ empleado_id, nuevo_turno_id }) }),
  eliminarTurno: async (token, id) => 
    peticion(`/api/Turno/Eliminar/${id}`, { method: 'DELETE', token })
}