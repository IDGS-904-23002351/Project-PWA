import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Si no hay sesión, manda al login. Si la hay, muestra la página pedida.
export default function RutaProtegida() {
  const { sesion } = useAuth()
  return sesion ? <Outlet /> : <Navigate to="/login" replace />
}
