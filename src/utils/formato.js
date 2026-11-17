export function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}

export function etiquetaRol(rol) {
  const roles = { ADMIN: 'Administrador', RRHH: 'Recursos Humanos', EMPLEADO: 'Empleado' }
  return roles[rol] ?? rol
}

export function fechaCorta(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

export function fechaHora(texto) {
  if (!texto) return '—'
  return new Date(texto).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium', hour12: false })
}
