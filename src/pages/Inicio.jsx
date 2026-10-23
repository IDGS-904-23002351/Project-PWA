import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Button, Paper, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'

// Pantalla temporal para comprobar que el login funciona.
// Aquí después irá el layout con menú (bitácora, configuración, etc.).
export default function Inicio() {
  const { sesion, cerrarSesion } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <Box component="img" src="/logo-nomi.png" alt="Nomi" sx={{ height: 64, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Hola, {sesion.usuario.nombre}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Rol: {sesion.usuario.rol}
        </Typography>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={() => cerrarSesion()}>
          Cerrar sesión
        </Button>
      </Paper>
    </Box>
  )
}
