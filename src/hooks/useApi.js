import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

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
