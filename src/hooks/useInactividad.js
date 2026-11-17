import { useEffect, useRef } from 'react'

const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

export default function useInactividad(milisegundos, alExpirar, activo) {
  const temporizador = useRef(null)
  const callback = useRef(alExpirar)

  useEffect(() => {
    callback.current = alExpirar
  }, [alExpirar])

  useEffect(() => {
    if (!activo) return undefined

    const reiniciar = () => {
      clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => callback.current(), milisegundos)
    }

    reiniciar()
    EVENTOS.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }))

    return () => {
      clearTimeout(temporizador.current)
      EVENTOS.forEach((e) => window.removeEventListener(e, reiniciar))
    }
  }, [milisegundos, activo])
}
