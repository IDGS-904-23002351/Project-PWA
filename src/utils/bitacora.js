// Textos amigables para los códigos de acción que guarda la tabla Auditoria
const ETIQUETAS = {
  LOGIN_EXITOSO: 'Inicio de sesión',
  LOGIN_FALLIDO: 'Inicio de sesión fallido',
  LOGOUT: 'Cierre de sesión',
  LOGOUT_FALLIDO: 'Cierre de sesión fallido',
  CAMBIO_PASS_OK: 'Cambio de contraseña',
  CAMBIO_PASS_FALLIDO: 'Cambio de contraseña fallido',
  CONFIG_ACTUALIZADA: 'Configuración actualizada',
}

export function etiquetaAccion(codigo) {
  if (ETIQUETAS[codigo]) return ETIQUETAS[codigo]
  const texto = codigo.toLowerCase().replaceAll('_', ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Color de la etiqueta: verde si salió bien, rojo si falló, azul para lo demás
export function colorAccion(codigo) {
  if (codigo.includes('FALLIDO')) return 'error'
  if (codigo.includes('EXITOSO') || codigo.endsWith('_OK')) return 'success'
  return 'info'
}
