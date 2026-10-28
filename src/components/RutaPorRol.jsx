import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Solo deja ver la página a los roles indicados (ej. roles={['ADMIN']}).
// El servidor vuelve a validar el rol en cada petición; esto solo evita mostrar pantallas que no le tocan.
export default function RutaPorRol({ roles, children }) {
  const { sesion } = useAuth()
  return roles.includes(sesion.usuario.rol) ? children : <Navigate to="/inicio" replace />
}
