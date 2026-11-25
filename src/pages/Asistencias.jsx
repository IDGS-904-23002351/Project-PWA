import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, MenuItem, Drawer, Avatar, Alert, CircularProgress
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { obtenerAsistencias, corregirAsistencia } from '../api/asistenciaApi' 
import { departamentoApi } from '../api/departamentoApi'
import { useAuth } from '../context/AuthContext' 
import EncabezadoPagina from '../components/EncabezadoPagina'

export default function Asistencias() {
  const { sesion } = useAuth()
  const token = sesion?.token 

  const [asistencias, setAsistencias] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos')
  const [departamentos, setDepartamentos] = useState([])
  const hoyLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  const [filtroFecha, setFiltroFecha] = useState(hoyLocal)
  
  const [horaEntradaEdit, setHoraEntradaEdit] = useState('')
  const [estadoEdit, setEstadoEdit] = useState('')
  const [motivoCorreccion, setMotivoCorreccion] = useState('')
  const [aviso, setAviso] = useState('')
  const [errorPanel, setErrorPanel] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = async () => {
    if (!token) return; 
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerAsistencias(token) 
      setAsistencias(data || [])
    } catch (e) {
      setError(e.message || 'Error al obtener asistencias desde el servidor.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [token]) 

  const handleAbrirDrawer = (item) => {
    setSeleccionado(item)
    setHoraEntradaEdit(item.horaEntrada || item.entrada || '07:00')
    setEstadoEdit(item.estado || 'Puntual')
    setMotivoCorreccion('')
    setErrorPanel('')
  }

  const handleGuardarCorreccion = async () => {
    if (!motivoCorreccion.trim()) {
      setErrorPanel('Por favor, describe el motivo de la corrección.')
      return
    }
    try {
      setGuardando(true)
      setErrorPanel('')
      await corregirAsistencia(token, seleccionado.id, {
        horaEntrada: horaEntradaEdit,
        estado: estadoEdit,
        motivoCorreccion: motivoCorreccion
      })
      setAviso('Corrección guardada correctamente.')
      setSeleccionado(null)
      cargarDatos() 
    } catch (e) {
      setErrorPanel(e.message || 'No se pudo guardar la corrección.')
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
    const hora = (v) => (v ? v.split('T')[1]?.substring(0, 5) : '--')
    const headers = "Fecha,Empleado,Departamento,Entrada,Salida,Retardo,Método,Estado\n"
    const rows = asistenciasFiltradas.map(a => `"${String(a.fecha || '').split('T')[0]}","${a.empleadoNombre || a.nombre || 'Empleado'}","${a.departamento || ''}","${hora(a.horaEntrada)}","${hora(a.horaSalida)}","${a.retardo || '0 min'}","${a.metodo || ''}","${a.estado || ''}"`).join("\n")
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Asistencias.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (!token) return
    departamentoApi.listar(token)
      .then((lista) => setDepartamentos((Array.isArray(lista) ? lista : []).filter((d) => (d.estado || 'ACTIVO') === 'ACTIVO')))
      .catch(() => setDepartamentos([]))
  }, [token])

  const asistenciasFiltradas = asistencias.filter(item => {
    const est = item.estado || ''
    const matchEstado = filtroEstado === 'todos' || est.toLowerCase() === filtroEstado.toLowerCase()
    const matchFecha = !filtroFecha || String(item.fecha || '').startsWith(filtroFecha)
    const matchDepartamento = filtroDepartamento === 'todos' || String(item.departamentoId) === filtroDepartamento
    return matchEstado && matchFecha && matchDepartamento
  })

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <EncabezadoPagina
        titulo="Asistencias"
        descripcion="Registros en tiempo real cargados desde el servidor."
        acciones={
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportarExcel} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: 'white' }}>
            Exportar Excel
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          helperText={filtroFecha ? 'Borra la fecha para ver todas' : 'Todas las fechas'}
          sx={{ width: 190, bgcolor: 'white', borderRadius: 2 }}
        />
        <TextField select size="small" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} sx={{ width: 180, bgcolor: 'white', borderRadius: 2 }}>
          <MenuItem value="todos">Todos los estados</MenuItem>
          <MenuItem value="Puntual">Puntual</MenuItem>
          <MenuItem value="Retardo">Retardo</MenuItem>
          <MenuItem value="Falta">Falta</MenuItem>
          <MenuItem value="Incompleta">Incompleta</MenuItem>
          <MenuItem value="Justificada">Justificada</MenuItem>
        </TextField>
        <TextField select size="small" value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)} sx={{ width: 220, bgcolor: 'white', borderRadius: 2 }}>
          <MenuItem value="todos">Todos los departamentos</MenuItem>
          {departamentos.map((d) => (
            <MenuItem key={d.id} value={String(d.id)}>{d.nombre}</MenuItem>
          ))}
        </TextField>
      </Box>

      {cargando && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {aviso && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAviso('')}>{aviso}</Alert>}

      {!cargando && !error && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>EMPLEADO</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>FECHA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DEPARTAMENTO</TableCell>
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
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay registros con esos filtros.</TableCell>
                </TableRow>
              ) : (
                asistenciasFiltradas.map((item) => {
                  const nombre = item.empleadoNombre || item.nombre || item.empleado?.persona_id?.nombre || `Empleado #${item.empleadoId || item.id}`
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
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{String(item.fecha || '').split('T')[0].split('-').reverse().join('/')}</TableCell>
                      <TableCell>{item.departamento || '—'}</TableCell>
                      <TableCell>{item.horaEntrada ? item.horaEntrada.split('T')[1]?.substring(0,8) : '--'}</TableCell>
                      <TableCell>{item.horaSalida ? item.horaSalida.split('T')[1]?.substring(0,8) : '--'}</TableCell>
                      <TableCell>{item.retardo || '0 min'}</TableCell>
                      <TableCell>{item.metodo || 'GPS'}</TableCell>
                      <TableCell>
                        <Chip label={item.estado || 'Puntual'} size="small" sx={{ bgcolor: est.bg, color: est.color, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
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

      <Drawer anchor="right" open={Boolean(seleccionado)} onClose={() => setSeleccionado(null)}>
        <Box sx={{ width: 420, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DETALLE DE ASISTENCIA</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{seleccionado?.empleadoNombre || seleccionado?.nombre || `Empleado #${seleccionado?.id}`}</Typography>
            
            <Paper sx={{ p: 2, bgcolor: '#f1f5f9', mb: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}> Registrado con geocerca</Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Corregir registro</Typography>
            <TextField label="Hora de entrada" type="time" fullWidth size="small" value={horaEntradaEdit} onChange={(e) => setHoraEntradaEdit(e.target.value)} sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="Estado" fullWidth size="small" value={estadoEdit} onChange={(e) => setEstadoEdit(e.target.value)} sx={{ mb: 2 }}>
              <MenuItem value="Puntual">Puntual</MenuItem>
              <MenuItem value="Retardo">Retardo</MenuItem>
              <MenuItem value="Falta">Falta</MenuItem>
              <MenuItem value="Incompleta">Incompleta</MenuItem>
              <MenuItem value="Justificada">Justificada</MenuItem>
            </TextField>
            <TextField label="Motivo de corrección *" multiline rows={3} fullWidth size="small" value={motivoCorreccion} onChange={(e) => { setMotivoCorreccion(e.target.value); setErrorPanel('') }} sx={{ mb: 2 }} slotProps={{ htmlInput: { maxLength: 255 } }} helperText={`${motivoCorreccion.length}/255`} />
            {errorPanel && <Alert severity="error" sx={{ mb: 2 }}>{errorPanel}</Alert>}
          </Box>

          <Button variant="contained" fullWidth disabled={guardando} onClick={handleGuardarCorreccion} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' }, textTransform: 'none', py: 1.2 }}>
            {guardando ? 'Guardando...' : 'Guardar corrección'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  )
}