import { peticion } from './http'

export const reportesApi = {
  getAsistencia: async (token, filtros) => 
    peticion('/api/reportes/asistencia', { method: 'POST', token, body: JSON.stringify(filtros) }),
  getFaltasRetardos: async (token, filtros) => 
    peticion('/api/reportes/faltas-retardos', { method: 'POST', token, body: JSON.stringify(filtros) }),
  getHorasExtra: async (token, filtros) => 
    peticion('/api/reportes/horas-extra', { method: 'POST', token, body: JSON.stringify(filtros) }),
  getNominaResumen: async (token, filtros) => 
    peticion('/api/reportes/nomina', { method: 'POST', token, body: JSON.stringify(filtros) }),
};