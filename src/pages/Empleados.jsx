// src/pages/Empleados.jsx
import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  Menu, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress, Tooltip, Stack,
} from '@mui/material'
import { Search, Add, MoreVert } from '@mui/icons-material'
import { empleadoApi } from '../api/empleadoApi'
import EmpleadoModal from '../components/EmpleadoModal'
import EmpleadoDetalleModal from '../components/EmpleadoDetalleModal'
import EncabezadoPagina from '../components/EncabezadoPagina'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [buscar, setBuscar] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('ACTIVO')
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  const [detalleOpen, setDetalleOpen] = useState(false)
  const [empleadoDetalleId, setEmpleadoDetalleId] = useState(null)

  const [anchorEl, setAnchorEl] = useState(null)
  const [empleadoMenu, setEmpleadoMenu] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const cargarEmpleados = async () => {
    setLoading(true)
    try {
      const data = await empleadoApi.listar()
      setEmpleados(data.empleados || [])
    } catch (error) {
      console.error('Error al cargar empleados', error)
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [filtroEstado])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') cargarEmpleados()
  }

  const getInitials = (nombre, paterno) =>
    `${nombre?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase()

  const abrirNuevo = () => {
    setEmpleadoSeleccionado(null)
    setModalOpen(true)
  }

  const abrirEditar = async () => {
    const id = empleadoMenu?.id
    cerrarMenu()
    if (!id) return

    setLoading(true)
    try {
      const data = await empleadoApi.obtener(id)
      const completo = data?.empleado ?? data ?? null
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

  const abrirEliminar = () => {
    setConfirmDelete(empleadoMenu)
    setMotivo('')
    cerrarMenu()
  }

  const cerrarMenu = () => {
    setAnchorEl(null)
    setEmpleadoMenu(null)
  }

  const handleMenuOpen = (e, empleado) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setEmpleadoMenu(empleado)
  }

  const handleEliminar = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await empleadoApi.eliminar(confirmDelete.id, motivo || 'No especificado')
      setSnackbar({ open: true, message: 'Empleado eliminado correctamente', severity: 'success' })
      setConfirmDelete(null)
      cargarEmpleados()
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleReactivar = async (emp) => {
    try {
      await empleadoApi.reactivar(emp.id)
      setSnackbar({ open: true, message: 'Empleado reactivado', severity: 'success' })
      cerrarMenu()
      cargarEmpleados()
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    }
  }

  const handleSaved = () => {
    setSnackbar({ open: true, message: 'Empleado guardado correctamente', severity: 'success' })
    cargarEmpleados()
  }

  return (
    <Box>
      <EncabezadoPagina
        titulo="Empleados"
        descripcion={`Administra la información de los ${empleados.length} colaboradores.`}
        acciones={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={abrirNuevo}
            color="primary"
          >
            Nuevo empleado
          </Button>
        }
      />

      {/* Barra de Filtros Responsiva */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por nombre o número..."
            size="small"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            onKeyDown={handleKeyPress}
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

      {/* Tabla de Empleados */}
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              {['EMPLEADO', 'PUESTO', 'DEPARTAMENTO', 'TIPO', 'TURNO', 'ESTATUS'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                  {h}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No hay empleados para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              empleados.map((emp) => (
                <Tooltip key={emp.id} title="Doble click para ver el detalle" placement="right" arrow>
                  <TableRow hover onDoubleClick={() => abrirDetalle(emp)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>
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
                        color={emp.turno_id?.nombre === 'Matutino' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.turno_id?.nombre || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          bgcolor: emp.estado === 'ACTIVO' ? 'success.main' : 'text.disabled',
                        }} />
                        <Typography variant="body2" color={emp.estado === 'ACTIVO' ? 'success.main' : 'text.secondary'}>
                          {emp.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, emp)} onDoubleClick={(e) => e.stopPropagation()}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menú de acciones */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={cerrarMenu}>
        <MenuItem onClick={abrirEditar}>Editar</MenuItem>
        {empleadoMenu?.estado === 'INACTIVO' ? (
          <MenuItem onClick={() => handleReactivar(empleadoMenu)}>Reactivar</MenuItem>
        ) : (
          <MenuItem onClick={abrirEliminar} sx={{ color: 'error.main' }}>
            Eliminar
          </MenuItem>
        )}
      </Menu>

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

      {/* Modal de confirmación de eliminación */}
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
            fullWidth size="small" label="Motivo (opcional)"
            value={motivo} onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting} color="inherit">Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={deleting}>
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