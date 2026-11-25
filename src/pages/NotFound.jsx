import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { Box, Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { sesion } = useAuth()

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: sesion ? '70vh' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 4 },
        boxSizing: 'border-box',
      }}
    >
      {!sesion && (
        <Box component="img" src="/logo-nomi.png" alt="Nomi" sx={{ height: 48, mb: 3 }} />
      )}

      <Paper
        variant="outlined"
        sx={{
          maxWidth: 460,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3,
          bgcolor: 'white',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: '#ccfbf1',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 30 }} />
        </Box>

        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.5, color: '#0f766e' }}>
          ERROR 404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5, mb: 1 }}>
          Página no encontrada
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          La ruta que intentas visitar no existe o fue movida.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#cbd5e1',
              color: '#334155',
              px: 2.5,
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Regresar
          </Button>

          <Button
            variant="contained"
            startIcon={<HomeOutlinedIcon />}
            onClick={() => navigate(sesion ? '/' : '/login')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: '#0f766e',
              px: 2.5,
              '&:hover': { bgcolor: '#115e59' },
            }}
          >
            {sesion ? 'Ir al inicio' : 'Ir al login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}