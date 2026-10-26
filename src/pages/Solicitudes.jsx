import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Tabs, Tab, Button, TextField, Chip, Avatar, CircularProgress, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { obtenerSolicitudes } from '../api/solicitudApi'

export default function Solicitudes() {
  const [tabValue, setTabValue] = useState(0)
  const [solicitudes, setSolicitudes] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargarSolicitudes = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerSolicitudes()
      setSolicitudes(data || [])
      if (data && data.length > 0) {
        setSeleccionado(data[0])
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con la API de solicitudes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!seleccionado) return
    try {
      setProcesando(true)
      await solicitudApi.actualizarEstado(seleccionado.id, {
        estado: nuevoEstado,
        comentarioRespuesta: comentario
      })
      alert(`Solicitud ${nuevoEstado.toLowerCase()} exitosamente en el servidor.`)
      setComentario('')
      cargarSolicitudes()
    } catch (err) {
      alert('Error al actualizar en el servidor: ' + err.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1300, margin: '0 auto', pb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>Solicitudes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Revisa y responde las solicitudes enviadas al sistema.</Typography>

      <Paper sx={{ mb: 3, borderRadius: 2, display: 'inline-flex', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="primary">
          <Tab label={`Pendientes (${solicitudes.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Historial" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!cargando && !error && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: 3 }}>
          {/* Columna Izquierda */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {solicitudes.length === 0 ? (
              <Typography color="text.secondary">No hay solicitudes registradas en la base de datos.</Typography>
            ) : (
              solicitudes.map((item) => {
                const esSeleccionado = seleccionado?.id === item.id
                const nombre = item.empleadoNombre || item.nombre || `Empleado #${item.empleadoId || item.id}`
                const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                return (
                  <Paper
                    key={item.id}
                    onClick={() => setSeleccionado(item)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: esSeleccionado ? '2px solid #0f766e' : '1px solid #e2e8f0',
                      bgcolor: 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      '&:hover': { bgcolor: '#f8fafc' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                        {iniciales}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.tipo || 'Permiso'} - {item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString() : 'Fecha N/A'}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#0f766e', fontWeight: 700, fontSize: '1.2rem' }}>&gt;</Typography>
                    </Box>
                  </Paper>
                )
              })
            )}
          </Box>

          {/* Columna Derecha: Detalle */}
          {seleccionado && (
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: 'fit-content' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Chip label={seleccionado.tipo || 'Permiso'} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, mb: 1.5 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {seleccionado.empleadoNombre || seleccionado.nombre || `Empleado ID: ${seleccionado.empleadoId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {seleccionado.puesto || 'Personal Operativo'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 4, bgcolor: '#f8fafc', p: 2.5, borderRadius: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>FECHA SOLICITADA</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {seleccionado.fechaSolicitud ? new Date(seleccionado.fechaSolicitud).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>DURACIÓN</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {seleccionado.duracion || '1 día'}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Motivo</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {seleccionado.motivo || 'Sin motivo especificado en el registro.'}
              </Typography>

              <TextField
                label="Comentario para el empleado (opcional)"
                placeholder="Escribe un comentario..."
                multiline
                rows={3}
                fullWidth
                size="small"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                sx={{ mb: 3, bgcolor: 'white' }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="error" startIcon={<CancelIcon />} disabled={procesando} onClick={() => handleCambiarEstado('Rechazada')} sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}>
                  Rechazar
                </Button>
                <Button variant="contained" startIcon={<CheckCircleIcon />} disabled={procesando} onClick={() => handleCambiarEstado('Autorizada')} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' }, textTransform: 'none', px: 3, borderRadius: 2, fontWeight: 600 }}>
                  Autorizar solicitud
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  )
}