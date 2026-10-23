import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import * as authApi from '../api/authApi'
import useInactividad from '../hooks/useInactividad'

const CLAVE = 'nomi_sesion'
const MINUTOS_INACTIVIDAD = 15

const AuthContext = createContext(null)

// Lee la sesión guardada (si existe y no ha expirado)
function leerSesion() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE))
    if (guardada && new Date(guardada.expiracion) > new Date()) return guardada
  } catch {
    /* sin sesión guardada */
  }
  return null
}

const estadoInicial = { sesion: leerSesion(), cargando: false, error: null, aviso: null }

function reducer(estado, accion) {
  switch (accion.type) {
    case 'LOGIN_INICIO':
      return { ...estado, cargando: true, error: null, aviso: null }
    case 'LOGIN_OK':
      return { sesion: accion.sesion, cargando: false, error: null, aviso: null }
    case 'LOGIN_ERROR':
      return { ...estado, cargando: false, error: accion.mensaje }
    case 'LOGOUT':
      return { sesion: null, cargando: false, error: null, aviso: accion.aviso ?? null }
    default:
      return estado
  }
}

export function AuthProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)

  // Guarda o borra la sesión del navegador cada vez que cambia
  useEffect(() => {
    if (estado.sesion) sessionStorage.setItem(CLAVE, JSON.stringify(estado.sesion))
    else sessionStorage.removeItem(CLAVE)
  }, [estado.sesion])

  const iniciarSesion = useCallback(async (credenciales) => {
    dispatch({ type: 'LOGIN_INICIO' })
    try {
      const respuesta = await authApi.login(credenciales)
      dispatch({ type: 'LOGIN_OK', sesion: respuesta })
    } catch (e) {
      dispatch({ type: 'LOGIN_ERROR', mensaje: e.message })
    }
  }, [])

  const cerrarSesion = useCallback(
    async (aviso) => {
      const token = estado.sesion?.token
      dispatch({ type: 'LOGOUT', aviso })
      if (token) authApi.logout(token).catch(() => {}) // si falla, la sesión local ya se cerró
    },
    [estado.sesion],
  )

  // Cierra la sesión tras 15 minutos sin actividad (solo si hay sesión)
  useInactividad(
    MINUTOS_INACTIVIDAD * 60 * 1000,
    () => cerrarSesion('Tu sesión se cerró por inactividad.'),
    Boolean(estado.sesion),
  )

  const valor = useMemo(
    () => ({ ...estado, iniciarSesion, cerrarSesion }),
    [estado, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// Hook para usar la sesión en cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
