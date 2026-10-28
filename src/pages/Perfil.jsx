import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { cambiarContrasena, obtenerPerfil } from '../api/authApi'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import { etiquetaRol, fechaCorta, iniciales } from '../utils/formato'
import { colores } from '../theme'

// Renglón "etiqueta / valor" de una tarjeta
function Dato({ etiqueta, valor }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{etiqueta}</Typography>
      <Typography sx={{ mt: 0.25 }}>{valor || '—'}</Typography>
    </Box>
  )
}

function Tarjeta({ titulo, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, mb: 2 }}>{titulo}</Typography>
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
        {children}
      </Box>
    </Paper>
  )
}

// Ventana para cambiar la contraseña. Al lograrlo el servidor cierra todas las sesiones,
// así que se manda al usuario a iniciar sesión otra vez.
function DialogoContrasena({ abierto, alCerrar }) {
  const llamar = useApi()
  const { cerrarSesion } = useAuth()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cerrar = () => {
    setActual('')
    setNueva('')
    setConfirmar('')
    setError(null)
    alCerrar()
  }

  const guardar = async () => {
    if (!actual || !nueva || !confirmar) return setError('Completa todos los campos')
    if (nueva.length < 6) return setError('La contraseña nueva debe tener al menos 6 caracteres')
    if (nueva !== confirmar) return setError('La confirmación no coincide con la contraseña nueva')

    setGuardando(true)
    setError(null)
    try {
      await llamar(cambiarContrasena, actual, nueva)
      cerrarSesion('Contraseña actualizada. Inicia sesión con la nueva.')
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : cerrar} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>Cambiar contraseña</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <TextField
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          helperText="Mínimo 6 caracteres"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <TextField
          label="Confirmar contraseña nueva"
          type="password"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        <Typography sx={{ fontSize: 13 }} color="text.secondary">
          Al guardar se cerrarán tus sesiones y tendrás que iniciar sesión de nuevo.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={cerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function Perfil() {
  const llamar = useApi()
  const [perfil, setPerfil] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [dialogo, setDialogo] = useState(false)

  const cargar = useCallback(() => {
    setCargando(true)
    setError(null)
    llamar(obtenerPerfil)
      .then(setPerfil)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [llamar])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" descripcion="Tus datos personales y de trabajo." />

      {cargando && !perfil && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" action={<Button onClick={cargar}>Reintentar</Button>} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {perfil && (
        <Box sx={{ display: 'grid', gap: 2.5, maxWidth: 860 }}>
          <Paper variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: colores.primario, fontSize: 26, fontWeight: 700 }}>
              {iniciales(perfil.nombreCompleto)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {perfil.nombreCompleto}
              </Typography>
              <Chip label={etiquetaRol(perfil.rol)} size="small" color="primary" variant="outlined" sx={{ mt: 0.75 }} />
            </Box>
            <Button variant="outlined" startIcon={<LockOutlinedIcon />} onClick={() => setDialogo(true)}>
              Cambiar contraseña
            </Button>
          </Paper>

          {perfil.empleadoId === null && (
            <Alert severity="info">Esta cuenta no tiene un empleado asociado, por eso no hay datos de trabajo.</Alert>
          )}

          <Tarjeta titulo="Datos personales">
            <Dato etiqueta="Número de empleado" valor={perfil.empleadoId} />
            <Dato etiqueta="Usuario" valor={perfil.nombreUsuario} />
            <Dato etiqueta="RFC" valor={perfil.rfc} />
            <Dato etiqueta="CURP" valor={perfil.curp} />
            <Dato etiqueta="NSS" valor={perfil.nss} />
          </Tarjeta>

          <Tarjeta titulo="Trabajo">
            <Dato etiqueta="Empresa" valor={perfil.empresa} />
            <Dato etiqueta="Departamento" valor={perfil.departamento} />
            <Dato etiqueta="Turno" valor={perfil.turno} />
            <Dato etiqueta="Sede" valor={perfil.sede} />
            <Dato etiqueta="Fecha de ingreso" valor={perfil.fechaIngreso ? fechaCorta(perfil.fechaIngreso) : null} />
          </Tarjeta>

          <Tarjeta titulo="Contacto">
            <Dato etiqueta="Teléfono" valor={perfil.telefono} />
            <Dato etiqueta="Correo" valor={perfil.correo} />
          </Tarjeta>
        </Box>
      )}

      <DialogoContrasena abierto={dialogo} alCerrar={() => setDialogo(false)} />
    </>
  )
}
