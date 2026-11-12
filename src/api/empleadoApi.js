import { peticion } from './http'

export const empleadoApi = {
  listar: async (token) => peticion('/api/Empleado/Listar', { method: 'GET', token }),
  obtener: async (token, id) => peticion(`/api/Empleado/Obtener/${id}`, { method: 'GET', token }),
  crear: async (token, empleado) => peticion('/api/Empleado/Crear', { method: 'POST', token, body: JSON.stringify(empleado) }),
  actualizar: async (token, id, empleado) => peticion(`/api/Empleado/Actualizar/${id}`, { method: 'PUT', token, body: JSON.stringify(empleado) }),
  eliminar: async (token, id, motivo = 'No especificado') => peticion(`/api/Empleado/Eliminar/${id}?motivo=${encodeURIComponent(motivo)}`, { method: 'DELETE', token }),
  reactivar: async (token, id) => peticion(`/api/Empleado/Reactivar/${id}`, { method: 'PATCH', token }),
  obtenerEmpresas: async (token) => peticion('/api/Empleado/Empresas', { method: 'GET', token }),
  obtenerSedes: async (token) => peticion('/api/Empleado/Sedes', { method: 'GET', token }),
  obtenerDepartamentos: async (token) => peticion('/api/Empleado/Departamentos', { method: 'GET', token }),
  obtenerTurnos: async (token) => peticion('/api/Empleado/Turnos', { method: 'GET', token }),
  obtenerRoles: async (token) => peticion('/api/Empleado/Roles', { method: 'GET', token }),
  obtenerDirecciones: async (token) => peticion('/api/Empleado/Direcciones', { method: 'GET', token }),
}