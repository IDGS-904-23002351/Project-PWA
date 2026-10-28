import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

// Devuelve una función `llamar(funcionApi, ...argumentos)` que le pone el token a la petición.
// Si el servidor responde 401 (sesión vencida), cierra la sesión y manda al login.
export default function useApi() {
  const { sesion, cerrarSesion } = useAuth()

  return useCallback(
    async (funcionApi, ...argumentos) => {
      try {
        return await funcionApi(sesion.token, ...argumentos)
      } catch (error) {
        if (error.status === 401) cerrarSesion('Tu sesión expiró. Inicia sesión de nuevo.')
        throw error
      }
    },
    [sesion, cerrarSesion],
  )
}
