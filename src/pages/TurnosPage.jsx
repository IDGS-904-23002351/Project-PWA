import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField,
  InputAdornment, Avatar, Chip, MenuItem, IconButton, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { turnoApi } from '../api/turnoApi'
import { useAuth } from '../context/AuthContext'
import CrearTurnoModal from '../components/CrearTurnoModal'
import CambiarTurnoModal from '../components/CambiarTurnoModal'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ConfirmarDialog from '../components/ConfirmarDialog'

const COLORS = {
  primary: '#0f766e',
  primaryHover: '#115e59',
  textMain: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0',
  chipOperativo: { bg: '#e8f5e9', text: '#2e7d32' },
  chipAdministrativo: { bg: '#e3f2fd', text: '#1565c0' }
}

const getInitials = (fullName) => {
  if (!fullName || fullName === 'Sin nombre') return '??'
  const parts = fullName.trim().split(' ')
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  return fullName.substring(0, 2).toUpperCase()
}

const stringToColor = (string) => {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) hash = string.charCodeAt(i) + ((hash << 5) - hash)
  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

export default function TurnosPage() {
  const { sesion } = useAuth()
  const token = sesion?.token

  const [resumen, setResumen] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [buscar, setBuscar] = useState('')
  const [turnoFiltro, setTurnoFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)

  const [modalCrearOpen, setModalCrearOpen] = useState(false)
  const [modalCambiarOpen, setModalCambiarOpen] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  const cargarDatos = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [resResumen, resAsignaciones] = await Promise.all([
        turnoApi.obtenerResumen(token).catch(() => []),
        turnoApi.listarAsignaciones(token, buscar, turnoFiltro, '', pagina, 10).catch(() => null)
      ])
      
      setResumen(Array.isArray(resResumen) ? resResumen : [])

      if (resAsignaciones?.asignaciones) {
        setAsignaciones(resAsignaciones.asignaciones)
        setTotal(resAsignaciones.total || 0)
      } else if (Array.isArray(resAsignaciones)) {
        setAsignaciones(resAsignaciones)
        setTotal(resAsignaciones.length)
      } else {
        setAsignaciones([])
        setTotal(0)
      }
      
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err.message || 'Error al conectar con la API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [token, pagina, turnoFiltro])

  const handleBuscarKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPagina(1)
      cargarDatos()
    }
  }

  const [confirmar, setConfirmar] = useState(null)
  const [aviso, setAviso] = useState({ tipo: '', texto: '' })

  // Antes: window.confirm y alert (ventanas grises del navegador)
  const handleEliminarTurno = (turnoId) => {
    setConfirmar({
      titulo: 'Eliminar turno',
      mensaje: '¿Seguro que deseas eliminar este turno? Los empleados que lo tengan deben cambiarse antes.',
      textoBoton: 'Eliminar',
      accion: async () => {
        setAviso({ tipo: '', texto: '' })
        try {
          const r = await turnoApi.eliminarTurno(token, turnoId)
          setAviso({ tipo: 'success', texto: r?.mensaje || 'Turno desactivado correctamente.' })
          cargarDatos()
        } catch (err) {
          setAviso({ tipo: 'error', texto: err.message || 'Error al eliminar el turno' })
        }
      },
    })
  }

  const abrirModalCambiar = (asig) => {
    setEmpleadoSeleccionado({
      id: asig.empleado?.id || asig.empleado_id,
      turno_id: asig.empleado?.turno_id || asig.turno_id
    })
    setModalCambiarOpen(true)
  }

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <EncabezadoPagina
        titulo="Turnos"
        descripcion="Gestiona horarios y asignaciones del personal."
        acciones={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalCrearOpen(true)} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryHover }, textTransform: 'none', borderRadius: 2, px: 2.5, fontWeight: 600 }}>
            Nuevo turno
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {aviso.texto && <Alert severity={aviso.tipo} sx={{ mb: 3 }} onClose={() => setAviso({ tipo: '', texto: '' })}>{aviso.texto}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
        {loading ? (
           <Box width="100%" display="flex" justifyContent="center" py={3}>
             <CircularProgress size={28} sx={{ color: COLORS.primary }} />
           </Box>
        ) : resumen.length === 0 ? (
          <Typography color="textSecondary">No hay turnos activos.</Typography>
        ) : resumen.map((turno) => {
          const isAdmin = turno.nombre.toLowerCase().includes('admin')
          return (
            <Box key={turno.turno_id} sx={{ flex: '1 1 300px', minWidth: '280px', maxWidth: { xs: '100%', lg: 'calc(33.333% - 16px)' } }}>
              <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none', borderColor: COLORS.border, height: '100%', display: 'flex', alignItems: 'center' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, width: '100%', '&:last-child': { pb: 2.5 } }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ p: 1.2, borderRadius: '50%', bgcolor: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AccessTimeIcon sx={{ color: COLORS.primary, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color={COLORS.textMain} sx={{ lineHeight: 1.2 }}>{turno.nombre}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>{isAdmin ? 'Lunes a viernes' : 'Lunes a sábado'}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight="bold" color={COLORS.textMain}>{turno.horario}</Typography>
                    <Chip label={`${turno.empleados_asignados} empleados`} size="small" sx={{ bgcolor: isAdmin ? COLORS.chipAdministrativo.bg : COLORS.chipOperativo.bg, color: isAdmin ? COLORS.chipAdministrativo.text : COLORS.chipOperativo.text, fontWeight: 600, borderRadius: 1, height: 24, fontSize: '0.75rem' }} />
                    <Tooltip title="Eliminar turno">
                      <IconButton size="small" onClick={() => handleEliminarTurno(turno.turno_id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )
        })}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: COLORS.border, width: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight="bold" color={COLORS.textMain}>Asignación por empleado</Typography>
          
          <Box display="flex" gap={2}>
            <TextField
              select
              size="small"
              value={turnoFiltro}
              onChange={(e) => { setTurnoFiltro(e.target.value); setPagina(1); }}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8f9fa' } }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Todos los turnos</MenuItem>
              {resumen.map(t => <MenuItem key={t.turno_id} value={t.turno_id}>{t.nombre}</MenuItem>)}
            </TextField>

            <TextField
              placeholder="Buscar (Enter)"
              size="small"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              onKeyDown={handleBuscarKeyPress}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>) }}
              sx={{ width: 250, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: COLORS.border }, '&.Mui-focused fieldset': { borderColor: COLORS.primary } } }}
            />
          </Box>
        </Box>

        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ width: '100%' }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>EMPLEADO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>DEPARTAMENTO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>TURNO ASIGNADO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>VIGENTE DESDE</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>ACCIÓN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} sx={{ color: COLORS.primary }} /></TableCell></TableRow>
              ) : asignaciones.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><Typography color="textSecondary">No hay asignaciones registradas.</Typography></TableCell></TableRow>
              ) : (
                asignaciones.map((asig, idx) => {
                  const fullName = asig.empleado?.persona_id?.nombre || asig.nombre_empleado || 'Sin nombre'
                  const nombreTurno = asig.turno_nombre || asig.nombre_turno || 'Turno'
                  const isAdmin = nombreTurno.toLowerCase().includes('admin')

                  return (
                    <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', bgcolor: stringToColor(fullName), color: '#fff', fontWeight: 600 }}>{getInitials(fullName)}</Avatar>
                          <Typography variant="body2" fontWeight={500} color={COLORS.textMain}>{fullName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="#4a5568">{asig.departamento}</Typography></TableCell>
                      <TableCell>
                        <Chip label={`${nombreTurno} · ${asig.horario}`} size="small" sx={{ bgcolor: isAdmin ? COLORS.chipAdministrativo.bg : COLORS.chipOperativo.bg, color: isAdmin ? COLORS.chipAdministrativo.text : COLORS.chipOperativo.text, fontWeight: 600, borderRadius: 1, height: 24, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell><Typography variant="body2" color="#4a5568">{asig.vigente_desde ? new Date(asig.vigente_desde).toLocaleDateString('es-ES') : '-'}</Typography></TableCell>
                      
                      <TableCell align="center">
                        <Tooltip title="Cambiar turno">
                          <IconButton 
                            size="small" 
                            onClick={() => abrirModalCambiar(asig)}
                            sx={{ color: COLORS.primary, bgcolor: '#e0f2f1', '&:hover': { bgcolor: '#b2dfdb' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">Total: {total}</Typography>
        <Button size="small" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} sx={{ color: COLORS.primary, textTransform: 'none' }}>Anterior</Button>
        <Typography variant="body2" fontWeight="bold">Página {pagina}</Typography>
        <Button size="small" disabled={pagina * 10 >= total} onClick={() => setPagina(pagina + 1)} sx={{ color: COLORS.primary, textTransform: 'none' }}>Siguiente</Button>
      </Box>

      <CrearTurnoModal 
        open={modalCrearOpen} 
        onClose={() => setModalCrearOpen(false)} 
        onSaved={() => cargarDatos()} 
        token={token} 
      />
      
      <CambiarTurnoModal 
        open={modalCambiarOpen} 
        onClose={() => setModalCambiarOpen(false)} 
        onSaved={() => cargarDatos()} 
        empleado={empleadoSeleccionado}
        turnos={resumen}
        token={token} 
      />

      <ConfirmarDialog datos={confirmar} onCerrar={() => setConfirmar(null)} />
    </Box>
  )
}