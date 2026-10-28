// Iniciales para el avatar: "Ana Martínez" -> "AM"
export function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}

// Nombre del rol como se muestra al usuario
export function etiquetaRol(rol) {
  const roles = { ADMIN: 'Administrador', RRHH: 'Recursos Humanos', EMPLEADO: 'Empleado' }
  return roles[rol] ?? rol
}

// "2024-03-15" -> "15/03/2024"
export function fechaCorta(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

// "2026-10-23T14:16:45" -> "23/10/2026, 14:16:45"
export function fechaHora(texto) {
  if (!texto) return '—'
  return new Date(texto).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium', hour12: false })
}
