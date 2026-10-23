import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { sesion, cargando, error, aviso, iniciarSesion } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [errores, setErrores] = useState({})

  // Si ya hay sesión no tiene caso ver el login
  if (sesion) return <Navigate to="/" replace />

  const validar = () => {
    const nuevos = {}
    if (!usuario.trim()) nuevos.usuario = 'Escribe tu número de empleado o correo'
    if (!contrasena) nuevos.contrasena = 'Escribe tu contraseña'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const enviar = (evento) => {
    evento.preventDefault()
    if (validar()) iniciarSesion({ usuario: usuario.trim(), contrasena })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
      {/* Panel izquierdo: marca (solo en pantallas medianas o grandes) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          p: 6,
          background: 'linear-gradient(145deg, #1E3A8A 0%, #1E5FA8 55%, #0EA5E9 100%)',
        }}
      >
        <Box component="img" src="/logo-nomi-blanco.png" alt="Nomi" sx={{ width: 260, maxWidth: '70%', mb: 4 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, maxWidth: 420 }}>
          Asistencia y nómina sin complicaciones
        </Typography>
        <Typography sx={{ mt: 2, opacity: 0.85, maxWidth: 380 }}>
          Registra asistencia, consulta tus recibos y mantén todo en un solo lugar.
        </Typography>
      </Box>

      {/* Panel derecho: formulario */}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 3, sm: 6 }, bgcolor: 'background.paper' }}>
        <Box component="form" onSubmit={enviar} noValidate sx={{ width: '100%', maxWidth: 400 }}>
          {/* En celular no se ve el panel azul, así que mostramos el logo aquí */}
          <Box component="img" src="/logo-nomi.png" alt="Nomi" sx={{ display: { xs: 'block', md: 'none' }, height: 56, mb: 3 }} />

          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
            Calzado Alba, S.A. de C.V.
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5 }}>
            Inicia sesión
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Ingresa con tu cuenta de Nomi
          </Typography>

          {aviso && <Alert severity="info" sx={{ mb: 2 }}>{aviso}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Número de empleado o correo"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            error={Boolean(errores.usuario)}
            helperText={errores.usuario}
            autoComplete="username"
            autoFocus
            disabled={cargando}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Contraseña"
            type={verContrasena ? 'text' : 'password'}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            error={Boolean(errores.contrasena)}
            helperText={errores.contrasena}
            autoComplete="current-password"
            disabled={cargando}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setVerContrasena((v) => !v)}
                      edge="end"
                    >
                      {verContrasena ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={cargando} sx={{ mt: 3, py: 1.4 }}>
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            ¿Olvidaste tu contraseña? Contacta a RH
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 5, color: 'text.secondary' }}>
            <LockOutlinedIcon fontSize="small" />
            <Typography variant="caption">Conexión segura y datos protegidos</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
