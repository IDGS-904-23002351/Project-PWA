import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, MenuItem, Drawer, Avatar, Alert, CircularProgress
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { obtenerAsistencias, corregirAsistencia } from '../api/authApi'

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroDepto, setFiltroDepto] = useState('todos')
  
  const [horaEntradaEdit, setHoraEntradaEdit] = useState('')
  const [estadoEdit, setEstadoEdit] = useState('')
  const [motivoCorreccion, setMotivoCorreccion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerAsistencias()
      setAsistencias(data || [])
    } catch (e) {
      setError(e.message || 'Error al obtener asistencias desde el servidor.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleAbrirDrawer = (item) => {
    setSeleccionado(item)
    setHoraEntradaEdit(item.horaEntrada || item.entrada || '07:00')
    setEstadoEdit(item.estado || 'Puntual')
    setMotivoCorreccion('')
  }

  const handleGuardarCorreccion = async () => {
    if (!motivoCorreccion.trim()) {
      alert("Por favor, describe el motivo de la corrección.")
      return
    }
    try {
      setGuardando(true)
      await corregirAsistencia(seleccionado.id, {
        horaEntrada: horaEntradaEdit,
        estado: estadoEdit,
        motivoCorreccion: motivoCorreccion
      })
      alert(`Corrección guardada con éxito en el servidor.`)
      setSeleccionado(null)
      cargarDatos() // Recargar datos frescos del backend
    } catch (e) {
      alert("Error al guardar la corrección en el backend: " + e.message)
    } finally {
      setGuardando(false)
    }
  }

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Puntual': case 'PUNTUAL': return { bg: '#e6f4ea', color: '#137333' }
      case 'Retardo': case 'RETARDO': return { bg: '#fef7e0', color: '#b06000' }
      case 'Falta': case 'FALTA': return { bg: '#fce8e6', color: '#c5221f' }
      case 'Incompleta': case 'INCOMPLETA': return { bg: '#f1f3f4', color: '#5f6368' }
      case 'Justificada': case 'JUSTIFICADA': return { bg: '#e8f0fe', color: '#1967d2' }
      default: return { bg: '#f1f3f4', color: '#3c4043' }
    }
  }

  const handleExportarExcel = () => {
    const headers = "Empleado,Entrada,Salida,Retardo,Método,Estado\n"
    const rows = asistencias.map(a => `"${a.empleadoNombre || a.nombre || 'Empleado'}","${a.horaEntrada || '--'}","${a.horaSalida || '--'}","${a.retardo || '0 min'}","${a.metodo || 'GPS'}","${a.estado || 'Puntual'}"`).join("\n")
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Asistencias.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const asistenciasFiltradas = asistencias.filter(item => {
    const est = item.estado || ''
    const matchEstado = filtroEstado === 'todos' || est.toLowerCase() === filtroEstado.toLowerCase()
    return matchEstado
  })

  return (
    <Box sx={{ maxWidth: 1300, margin: '0 auto', pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>Asistencias</Typography>
          <Typography variant="body2" color="text.secondary">Registros en tiempo real cargados desde el servidor.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportarExcel} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: 'white' }}>
          Exportar Excel
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField size="small" type="date" defaultValue={new Date().toISOString().split('T')[0]} sx={{ width: 170, bgcolor: 'white', borderRadius: 2 }} />
        <TextField select size="small" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} sx={{ width: 180, bgcolor: 'white', borderRadius: 2 }}>
          <MenuItem value="todos">Todos los estados</MenuItem>
          <MenuItem value="Puntual">Puntual</MenuItem>
          <MenuItem value="Retardo">Retardo</MenuItem>
          <MenuItem value="Falta">Falta</MenuItem>
          <MenuItem value="Incompleta">Incompleta</MenuItem>
          <MenuItem value="Justificada">Justificada</MenuItem>
        </TextField>
      </Box>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!cargando && !error && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>EMPLEADO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ENTRADA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SALIDA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>RETARDO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>MÉTODO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ESTADO</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistenciasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay registros de asistencias disponibles.</TableCell>
                </TableRow>
              ) : (
                asistenciasFiltradas.map((item) => {
                  const nombre = item.empleadoNombre || item.nombre || `Empleado #${item.empleadoId || item.id}`
                  const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
                  const est = getColorEstado(item.estado)
                  return (
                    <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleAbrirDrawer(item)}>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: '0.75rem' }}>
                          {iniciales}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.horaEntrada || '--'}</TableCell>
                      <TableCell>{item.horaSalida || '--'}</TableCell>
                      <TableCell>{item.retardo || '0 min'}</TableCell>
                      <TableCell>{item.metodo || 'GPS'}</TableCell>
                      <TableCell>
                        <Chip label={item.estado || 'Puntual'} size="small" sx={{ bgcolor: est.bg, color: est.color, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                          Corregir
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer de Corrección */}
      <Drawer anchor="right" open={Boolean(seleccionado)} onClose={() => setSeleccionado(null)}>
        <Box sx={{ width: 420, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DETALLE DE ASISTENCIA</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{seleccionado?.empleadoNombre || seleccionado?.nombre || `Empleado #${seleccionado?.id}`}</Typography>
            
            <Paper sx={{ p: 2, bgcolor: '#f1f5f9', mb: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>📍 Registrado con geocerca</Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Corregir registro</Typography>
            <TextField label="Hora de entrada" fullWidth size="small" value={horaEntradaEdit} onChange={(e) => setHoraEntradaEdit(e.target.value)} sx={{ mb: 2 }} />
            <TextField select label="Estado" fullWidth size="small" value={estadoEdit} onChange={(e) => setEstadoEdit(e.target.value)} sx={{ mb: 2 }}>
              <MenuItem value="Puntual">Puntual</MenuItem>
              <MenuItem value="Retardo">Retardo</MenuItem>
              <MenuItem value="Falta">Falta</MenuItem>
              <MenuItem value="Incompleta">Incompleta</MenuItem>
              <MenuItem value="Justificada">Justificada</MenuItem>
            </TextField>
            <TextField label="Motivo de corrección *" multiline rows={3} fullWidth size="small" value={motivoCorreccion} onChange={(e) => setMotivoCorreccion(e.target.value)} sx={{ mb: 3 }} />
          </Box>

          <Button variant="contained" fullWidth disabled={guardando} onClick={handleGuardarCorreccion} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' }, textTransform: 'none', py: 1.2 }}>
            {guardando ? 'Guardando...' : 'Guardar corrección'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  )
}