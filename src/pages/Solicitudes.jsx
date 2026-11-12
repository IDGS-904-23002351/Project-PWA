import React, { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Paper, Tabs, Tab, Button, TextField, Chip, Avatar, CircularProgress, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useAuth } from '../context/AuthContext'
import { obtenerSolicitudes, actualizarEstadoSolicitud } from '../api/solicitudApi'

export default function Solicitudes() {
  const { sesion } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [solicitudes, setSolicitudes] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargarSolicitudes = useCallback(async () => {
    if (!sesion?.token) return
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerSolicitudes(sesion.token)
      const lista = Array.isArray(data) ? data : []
      setSolicitudes(lista)
      setSeleccionado(lista.length > 0 ? lista[0] : null)
    } catch (err) {
      setError(err.message || 'Error al conectar con la API de solicitudes.')
    } finally {
      setCargando(false)
    }
  }, [sesion?.token])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  const solicitudesFiltradas = solicitudes.filter((item) => {
    const estado = (item.estado || 'Pendiente').toLowerCase()
    return tabValue === 0 ? estado === 'pendiente' : estado !== 'pendiente'
  })

  useEffect(() => {
    setSeleccionado(solicitudesFiltradas.length > 0 ? solicitudesFiltradas[0] : null)
  }, [tabValue, solicitudes])

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!seleccionado || !sesion?.token) return
    try {
      setProcesando(true)
      await actualizarEstadoSolicitud(sesion.token, seleccionado.id, {
        estado: nuevoEstado,
        comentarioRespuesta: comentario,
      })
      setComentario('')
      await cargarSolicitudes()
    } catch (err) {
      setError('Error al actualizar en el servidor: ' + err.message)
    } finally {
      setProcesando(false)
    }
  }

  const pendientesCount = solicitudes.filter((s) => (s.estado || 'Pendiente').toLowerCase() === 'pendiente').length

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.5rem', md: '2rem' } }}>
          Solicitudes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revisa y responde las solicitudes enviadas al sistema.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2.5, display: 'inline-flex', bgcolor: 'white', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: '#0f766e' },
            '& .MuiTab-root.Mui-selected': { color: '#0f766e' },
          }}
        >
          <Tab label={`Pendientes (${pendientesCount})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Historial" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4, color: '#0f766e' }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!cargando && !error && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, 420px) 1fr' },
            gap: 3,
            width: '100%',
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {solicitudesFiltradas.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
                <Typography color="text.secondary" variant="body2">
                  No hay solicitudes en esta sección.
                </Typography>
              </Paper>
            ) : (
              solicitudesFiltradas.map((item) => {
                const esSeleccionado = seleccionado?.id === item.id
                const nombre = item.empleadoNombre || item.nombre || `Empleado #${item.empleadoId || item.id}`
                const iniciales = nombre.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                return (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    onClick={() => setSeleccionado(item)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      borderWidth: esSeleccionado ? 2 : 1,
                      borderColor: esSeleccionado ? '#0f766e' : '#e2e8f0',
                      bgcolor: 'white',
                      transition: '0.15s',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#0f766e' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 42, height: 42, bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                        {iniciales}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          {item.tipo || 'Permiso'} · {item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString() : 'Fecha N/A'}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#0f766e', fontWeight: 700, fontSize: '1.2rem' }}>&gt;</Typography>
                    </Box>
                  </Paper>
                )
              })
            )}
          </Box>

          {seleccionado ? (
            <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, bgcolor: 'white', width: '100%', boxSizing: 'border-box' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                  <Chip label={seleccionado.tipo || 'Permiso'} size="small" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, mb: 1.5 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {seleccionado.empleadoNombre || seleccionado.nombre || `Empleado ID: ${seleccionado.empleadoId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {seleccionado.puesto || 'Personal Operativo'}
                  </Typography>
                </Box>
                {seleccionado.estado && (
                  <Chip
                    label={seleccionado.estado}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: seleccionado.estado === 'Autorizada' ? '#dcfce7' : seleccionado.estado === 'Rechazada' ? '#fee2e2' : '#fef3c7',
                      color: seleccionado.estado === 'Autorizada' ? '#166534' : seleccionado.estado === 'Rechazada' ? '#991b1b' : '#92400e',
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                  bgcolor: '#f8fafc',
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FECHA SOLICITADA</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: '#1e293b' }}>
                    {seleccionado.fechaSolicitud ? new Date(seleccionado.fechaSolicitud).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DURACIÓN</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: '#1e293b' }}>
                    {seleccionado.duracion || '1 día'}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Motivo</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {seleccionado.motivo || 'Sin motivo especificado en el registro.'}
              </Typography>

              {tabValue === 0 && (
                <>
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

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={procesando}
                      onClick={() => handleCambiarEstado('Rechazada')}
                      sx={{ textTransform: 'none', px: 3, borderRadius: 2, fontWeight: 600 }}
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      disabled={procesando}
                      onClick={() => handleCambiarEstado('Autorizada')}
                      sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' }, textTransform: 'none', px: 3, borderRadius: 2, fontWeight: 600 }}
                    >
                      Autorizar solicitud
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: 'white', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Selecciona una solicitud de la lista para ver su detalle.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  )
}