import React, { useEffect, useState } from 'react'
import { Box, Button, Paper, Typography, CircularProgress, Alert } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerMetricasDashboard } from '../api/inicioApi'

export default function Inicio() {
  const { sesion } = useAuth()
  const navigate = useNavigate()

  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const hoy = new Date()
  const fechaFormateada = hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  useEffect(() => {
    async function cargarMetricas() {
      try {
        setCargando(true)
        setError(null)
        const datos = await obtenerMetricasDashboard(sesion?.token)
        setMetricas(datos)
      } catch (err) {
        setError(err.message || 'Error al conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    }
    if (sesion?.token) {
      cargarMetricas()
    }
  }, [sesion?.token])

  const handleDescargarReporte = () => {
    if (!metricas) return
    const contenidoCsv = `Métrica,Valor
Empleados Activos,${metricas.empleadosActivos ?? 0}
Asistencias Hoy,${metricas.asistenciasHoy ?? 0}
Retardos Hoy,${metricas.retardosHoy ?? 0}
Faltas Hoy,${metricas.faltasHoy ?? 0}
Solicitudes Pendientes,${metricas.solicitudesPendientes ?? 0}`

    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Nomina_${hoy.toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
          width: '100%',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Buenos días, {sesion?.usuario?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí tienes el resumen de Calzado Alba para hoy, <span style={{ textTransform: 'capitalize' }}>{fechaFormateada}</span>.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDescargarReporte}
          disabled={!metricas}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            borderColor: '#cbd5e1',
            color: '#334155',
            bgcolor: 'white',
            flexShrink: 0,
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
          }}
        >
          Descargar reporte
        </Button>
      </Box>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4, color: '#0f766e' }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!cargando && !error && metricas && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: 2.5,
              mb: 3,
              width: '100%',
            }}
          >
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>EMPLEADOS ACTIVOS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#1e293b' }}>{metricas.empleadosActivos ?? 0}</Typography>
              <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 600, mt: 1, display: 'block' }}>En plantilla activa</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ASISTENCIA HOY</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#0f766e' }}>{metricas.asistenciasHoy ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Registros procesados</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>RETARDOS HOY</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#d97706' }}>{metricas.retardosHoy ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Registros fuera de hora</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FALTAS HOY</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#dc2626' }}>{metricas.faltasHoy ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Sin justificación</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SOLICITUDES</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#0284c7' }}>{metricas.solicitudesPendientes ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Pendientes de revisión</Typography>
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '7fr 5fr',
              },
              gap: 3,
              width: '100%',
            }}
          >
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Asistencia últimos 7 días</Typography>
                  <Typography variant="caption" color="text.secondary">Porcentaje de empleados con registro completo</Typography>
                </Box>
                <Typography variant="caption" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 700 }}>Promedio 90%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, pt: 3, px: { xs: 0.5, sm: 3 } }}>
                {['Jue', 'Vie', 'Sáb', 'Lun', 'Mar', 'Mié', 'Hoy'].map((dia, idx) => (
                  <Box key={dia} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{idx === 6 ? '92%' : '88%'}</Typography>
                    <Box sx={{ width: { xs: 24, sm: 36 }, height: 100, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'flex-end' }}>
                      <Box sx={{ width: '100%', height: idx === 6 ? '92%' : '88%', bgcolor: '#0f766e', borderRadius: 2 }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>{dia}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Pendientes</Typography>
                  <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/solicitudes')}>
                    Ver todas
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper
                    variant="outlined"
                    onClick={() => navigate('/solicitudes')}
                    sx={{ p: 2, borderRadius: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.15s', '&:hover': { bgcolor: '#f8fafc', borderColor: '#0f766e' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{metricas.solicitudesPendientes ?? 0} solicitudes</Typography>
                      <Typography variant="caption" color="text.secondary">Por resolver</Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: '#64748b' }} />
                  </Paper>
                  <Paper
                    variant="outlined"
                    onClick={() => navigate('/asistencias')}
                    sx={{ p: 2, borderRadius: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.15s', '&:hover': { bgcolor: '#f8fafc', borderColor: '#0f766e' } }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{metricas.retardosHoy ?? 0} asistencias</Typography>
                      <Typography variant="caption" color="text.secondary">Requieren revisión hoy</Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: '#64748b' }} />
                  </Paper>
                </Box>
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  )
}