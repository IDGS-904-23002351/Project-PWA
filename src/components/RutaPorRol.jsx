import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaPorRol({ roles, children }) {
  const { sesion } = useAuth()
  const rolUsuario = sesion?.usuario?.rol?.toUpperCase() || ''
  const rolesPermitidos = roles.map((r) => r.toUpperCase())

  return rolesPermitidos.includes(rolUsuario) ? children : <Navigate to="/inicio" replace />
}