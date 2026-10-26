import React, { useEffect, useState } from 'react'
import { Box, Button, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material'
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
        const datos = await obtenerMetricasDashboard()       
        setMetricas(datos)
      } catch (err) {
        setError(err.message || 'Error al conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    }
    cargarMetricas()
  }, [])

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
    <Box sx={{ maxWidth: 1300, margin: '0 auto', pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Buenos días, {sesion?.usuario?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            Aquí tienes el resumen de Calzado Alba para hoy, {fechaFormateada}.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDescargarReporte}
          disabled={!metricas}
          sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#cbd5e1', color: '#334155' }}
        >
          Descargar reporte
        </Button>
      </Box>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!cargando && !error && metricas && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>EMPLEADOS ACTIVOS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#1e293b' }}>{metricas.empleadosActivos ?? 0}</Typography>
                <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 600, mt: 1, display: 'block' }}>En plantilla activa</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>ASISTENCIA HOY</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#0f766e' }}>{metricas.asistenciasHoy ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Registros procesados</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>RETARDOS HOY</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#d97706' }}>{metricas.retardosHoy ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Registros fuera de hora</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>FALTAS HOY</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#dc2626' }}>{metricas.faltasHoy ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Sin justificación</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SOLICITUDES</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#0284c7' }}>{metricas.solicitudesPendientes ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Pendientes de revisión</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={7.5}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Asistencia últimos 7 días</Typography>
                    <Typography variant="caption" color="text.secondary">Porcentaje de empleados con registro completo</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ bgcolor: '#e6f4ea', color: '#137333', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600 }}>Promedio 90%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 140, pt: 3, px: 2 }}>
                  {['Jue', 'Vie', 'Sáb', 'Lun', 'Mar', 'Mié', 'Hoy'].map((dia, idx) => (
                    <Box key={dia} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748b' }}>{idx === 6 ? '92%' : '88%'}</Typography>
                      <Box sx={{ width: 32, height: 90, bgcolor: '#f1f5f9', borderRadius: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                        <Box sx={{ width: '100%', height: idx === 6 ? '92%' : '88%', bgcolor: '#0f766e', borderRadius: 1.5 }} />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>{dia}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4.5}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Pendientes</Typography>
                    <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/solicitudes')}>Ver todas</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper variant="outlined" onClick={() => navigate('/solicitudes')} sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{metricas.solicitudesPendientes ?? 0} solicitudes</Typography>
                        <Typography variant="caption" color="text.secondary">Por resolver</Typography>
                      </Box>
                      <ChevronRightIcon color="action" />
                    </Paper>
                    <Paper variant="outlined" onClick={() => navigate('/asistencias')} sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{metricas.retardosHoy ?? 0} asistencias</Typography>
                        <Typography variant="caption" color="text.secondary">Requieren revisión hoy</Typography>
                      </Box>
                      <ChevronRightIcon color="action" />
                    </Paper>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}