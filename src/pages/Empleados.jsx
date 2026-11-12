import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress, Tooltip, Stack,
} from '@mui/material'
import { Search, Add, Edit, Delete, RestoreFromTrash } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { empleadoApi } from '../api/empleadoApi'
import EmpleadoModal from '../components/EmpleadoModal'
import EmpleadoDetalleModal from '../components/EmpleadoDetalleModal'
import EncabezadoPagina from '../components/EncabezadoPagina'

export default function Empleados() {
  const { sesion } = useAuth()
  const [empleados, setEmpleados] = useState([])
  const [buscar, setBuscar] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('ACTIVO')
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  const [detalleOpen, setDetalleOpen] = useState(false)
  const [empleadoDetalleId, setEmpleadoDetalleId] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const cargarEmpleados = useCallback(async () => {
    if (!sesion?.token) return
    setLoading(true)
    try {
      const data = await empleadoApi.listar(sesion.token)
      const lista = data?.empleados || (Array.isArray(data) ? data : [])
      setEmpleados(lista)
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al cargar empleados', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [sesion?.token])

  useEffect(() => {
    cargarEmpleados()
  }, [cargarEmpleados])

  const getInitials = (nombre, paterno) =>
    `${nombre?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase() || 'E'

  const abrirNuevo = () => {
    setEmpleadoSeleccionado(null)
    setModalOpen(true)
  }

  const abrirEditar = async (e, emp) => {
    e.stopPropagation()
    if (!emp?.id || !sesion?.token) return

    setLoading(true)
    try {
      const data = await empleadoApi.obtener(sesion.token, emp.id)
      const completo = data?.empleado ?? data ?? emp
      setEmpleadoSeleccionado(completo)
      setModalOpen(true)
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalle = (emp) => {
    setEmpleadoDetalleId(emp.id)
    setDetalleOpen(true)
  }

  const abrirEliminar = (e, emp) => {
    e.stopPropagation()
    setConfirmDelete(emp)
    setMotivo('')
  }

  const handleEliminar = async () => {
    if (!confirmDelete || !sesion?.token) return
    setDeleting(true)
    try {
      await empleadoApi.eliminar(sesion.token, confirmDelete.id, motivo || 'No especificado')
      setSnackbar({ open: true, message: 'Empleado eliminado correctamente', severity: 'success' })
      setConfirmDelete(null)
      cargarEmpleados()
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleReactivar = async (e, emp) => {
    e.stopPropagation()
    if (!sesion?.token) return
    try {
      await empleadoApi.reactivar(sesion.token, emp.id)
      setSnackbar({ open: true, message: 'Empleado reactivado correctamente', severity: 'success' })
      cargarEmpleados()
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    }
  }

  const handleSaved = () => {
    setSnackbar({ open: true, message: 'Empleado guardado correctamente', severity: 'success' })
    cargarEmpleados()
  }

  const empleadosFiltrados = empleados.filter((emp) => {
    const coincideEstado = filtroEstado === 'todos' || emp.estado === filtroEstado
    const nombreCompleto = `${emp.persona_id?.nombre || ''} ${emp.persona_id?.apellido_Paterno || ''}`.toLowerCase()
    const coincideTexto = !buscar.trim() || nombreCompleto.includes(buscar.toLowerCase()) || (emp.rfc || '').toLowerCase().includes(buscar.toLowerCase())
    return coincideEstado && coincideTexto
  })

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <EncabezadoPagina
        titulo="Empleados"
        descripcion={`Administra la información de los ${empleadosFiltrados.length} colaboradores.`}
        acciones={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={abrirNuevo}
            sx={{
              bgcolor: '#0f766e',
              '&:hover': { bgcolor: '#115e59' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Nuevo empleado
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por nombre o RFC..."
            size="small"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Select size="small" defaultValue="todos" sx={{ minWidth: 180 }}>
            <MenuItem value="todos">Todos los departamentos</MenuItem>
          </Select>
          <Select size="small" defaultValue="todos" sx={{ minWidth: 150 }}>
            <MenuItem value="todos">Todos los tipos</MenuItem>
            <MenuItem value="operativo">Operativo</MenuItem>
          </Select>
          <Select
            size="small"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ACTIVO">Activos</MenuItem>
            <MenuItem value="INACTIVO">Inactivos</MenuItem>
            <MenuItem value="todos">Todos</MenuItem>
          </Select>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, bgcolor: 'white', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              {['EMPLEADO', 'PUESTO', 'DEPARTAMENTO', 'TIPO', 'TURNO', 'ESTATUS', 'ACCIONES'].map((h, i) => (
                <TableCell
                  key={h}
                  align={i === 6 ? 'right' : 'left'}
                  sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem',textAlign:'center' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} sx={{ color: '#0f766e' }} />
                </TableCell>
              </TableRow>
            ) : empleadosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No hay empleados para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              empleadosFiltrados.map((emp) => (
                <Tooltip key={emp.id} title="Doble click para ver el detalle" placement="top" arrow>
                  <TableRow hover onDoubleClick={() => abrirDetalle(emp)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                          {getInitials(emp.persona_id?.nombre, emp.persona_id?.apellido_Paterno)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" color="text.primary" noWrap>
                            {`${emp.persona_id?.nombre || ''} ${emp.persona_id?.apellido_Paterno || ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {emp.rfc || 'SIN RFC'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">Colaborador</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.departamento_id?.nombre || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.turno_id?.nombre === 'Matutino' ? 'Operativo' : 'Administrativo'}
                        size="small"
                        sx={{
                          bgcolor: emp.turno_id?.nombre === 'Matutino' ? '#ccfbf1' : '#e0f2fe',
                          color: emp.turno_id?.nombre === 'Matutino' ? '#0f766e' : '#0369a1',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.turno_id?.nombre || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: emp.estado === 'ACTIVO' ? '#0f766e' : 'text.disabled',
                          }}
                        />
                        <Typography variant="body2" sx={{ color: emp.estado === 'ACTIVO' ? '#0f766e' : 'text.secondary', fontWeight: 600 }}>
                          {emp.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" onDoubleClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Modificar empleado">
                          <IconButton
                            size="small"
                            onClick={(e) => abrirEditar(e, emp)}
                            sx={{ color: '#0f766e', '&:hover': { bgcolor: '#ccfbf1' } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {emp.estado === 'INACTIVO' ? (
                          <Tooltip title="Reactivar empleado">
                            <IconButton
                              size="small"
                              onClick={(e) => handleReactivar(e, emp)}
                              sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
                            >
                              <RestoreFromTrash fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Eliminar empleado">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => abrirEliminar(e, emp)}
                              sx={{ '&:hover': { bgcolor: '#fee2e2' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EmpleadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        empleado={empleadoSeleccionado}
        onSaved={handleSaved}
      />

      <EmpleadoDetalleModal
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        empleadoId={empleadoDetalleId}
      />

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar empleado</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Seguro que deseas eliminar a{' '}
            <strong>
              {confirmDelete?.persona_id?.nombre} {confirmDelete?.persona_id?.apellido_Paterno}
            </strong>?
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            label="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting} color="inherit" sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={deleting} sx={{ textTransform: 'none' }}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}