import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Button, Paper, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Inicio() {
  const { sesion, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() // Para saber en qué ruta estamos

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* MENÚ LATERAL BÁSICO */}
      <Box sx={{ width: 250, bgcolor: '#0f172a', color: 'white', p: 2, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Nomi</Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/')}
              sx={{ bgcolor: location.pathname === '/' ? '#0d9488' : 'transparent', borderRadius: 1 }}
            >
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/empleados')}
              sx={{ bgcolor: location.pathname === '/empleados' ? '#0d9488' : 'transparent', borderRadius: 1 }}
            >
              <ListItemText primary="Empleados" />
            </ListItemButton>
          </ListItem>
        </List>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<LogoutIcon />} 
          onClick={() => cerrarSesion()}
          sx={{ mt: 4, width: '100%' }}
        >
          Salir
        </Button>
      </Box>

      {/* CONTENIDO DERECHO (Aquí se carga Empleados o la Bienvenida) */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: '#f5f7f9' }}>
        
        {/* Si estamos en la ruta principal "/", mostramos el saludo */}
        {location.pathname === '/' && (
          <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Hola, {sesion?.usuario?.nombre}
            </Typography>
            <Typography color="text.secondary">
              Rol: {sesion?.usuario?.rol}
            </Typography>
          </Paper>
        )}

        {/* AQUÍ SE RENDERIZA LA TABLA DE EMPLEADOS (La ruta hija) */}
        <Outlet />
      </Box>
    </Box>
  )
}