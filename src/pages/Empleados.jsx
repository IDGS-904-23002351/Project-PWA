// src/pages/Empleados.jsx
import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, IconButton,
  Menu, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress, Tooltip,
} from '@mui/material'
import { Search, Add, MoreVert } from '@mui/icons-material'
import { empleadoApi } from '../api/empleadoApi'
import EmpleadoModal from '../components/EmpleadoModal'
import EmpleadoDetalleModal from '../components/EmpleadoDetalleModal'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [buscar, setBuscar] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('ACTIVO')
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  // Detalle (doble click)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const abrirEditar = () => {
    setEmpleadoSeleccionado(empleadoMenu)
    setModalOpen(true)
    cerrarMenu()
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
    <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b">Empleados</Typography>
          <Typography variant="body2" color="textSecondary">
            Administra la información de los {empleados.length} colaboradores.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={abrirNuevo}
          sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2 }}
        >
          Nuevo empleado
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 1, mb: 3, display: 'flex', gap: 2, borderRadius: 3 }} elevation={0}>
        <TextField
          placeholder="Buscar por nombre o número..."
          variant="outlined"
          size="small"
          fullWidth
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#fff' },
          }}
        />
        <Select size="small" defaultValue="todos" sx={{ minWidth: 180, borderRadius: 2 }}>
          <MenuItem value="todos">Todos los departamentos</MenuItem>
        </Select>
        <Select size="small" defaultValue="todos" sx={{ minWidth: 150, borderRadius: 2 }}>
          <MenuItem value="todos">Todos los tipos</MenuItem>
          <MenuItem value="operativo">Operativo</MenuItem>
        </Select>
        <Select
          size="small"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          sx={{ minWidth: 120, borderRadius: 2 }}
        >
          <MenuItem value="ACTIVO">Activos</MenuItem>
          <MenuItem value="INACTIVO">Inactivos</MenuItem>
          <MenuItem value="todos">Todos</MenuItem>
        </Select>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#fff' }}>
            <TableRow>
              {['EMPLEADO', 'PUESTO', 'DEPARTAMENTO', 'TIPO', 'TURNO', 'ESTATUS'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>
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
                <Tooltip
                  key={emp.id}
                  title="Doble click para ver el detalle"
                  placement="right"
                  arrow
                >
                  <TableRow
                    hover
                    onDoubleClick={() => abrirDetalle(emp)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 'bold' }}>
                          {getInitials(emp.persona_id?.Nombre, emp.persona_id?.Apellido_Paterno)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
                            {`${emp.persona_id?.Nombre || ''} ${emp.persona_id?.Apellido_Paterno || ''}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {emp.rfc || 'SIN RFC'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">Colaborador</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {emp.departamento_id?.Nombre || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.turno_id?.Nombre === 'Matutino' ? 'Operativo' : 'Administrativo'}
                        size="small"
                        sx={{
                          bgcolor: emp.turno_id?.Nombre === 'Matutino' ? '#e0f2f1' : '#ede7f6',
                          color: emp.turno_id?.Nombre === 'Matutino' ? '#00796b' : '#5e35b1',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.turno_id?.Nombre || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: emp.estado === 'ACTIVO' ? '#4caf50' : '#9e9e9e',
                          }}
                        />
                        <Typography
                          variant="body2"
                          color={emp.estado === 'ACTIVO' ? '#4caf50' : '#757575'}
                        >
                          {emp.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, emp)}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
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

      {/* Menú acciones */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={cerrarMenu}>
        <MenuItem onClick={abrirEditar}>Editar</MenuItem>
        {empleadoMenu?.estado === 'INACTIVO' ? (
          <MenuItem onClick={() => handleReactivar(empleadoMenu)}>Reactivar</MenuItem>
        ) : (
          <MenuItem onClick={abrirEliminar} sx={{ color: '#d32f2f' }}>
            Eliminar
          </MenuItem>
        )}
      </Menu>

      {/* Modal Crear/Editar */}
      <EmpleadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        empleado={empleadoSeleccionado}
        onSaved={handleSaved}
      />

      {/* Modal Detalle (doble click) */}
      <EmpleadoDetalleModal
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        empleadoId={empleadoDetalleId}
      />

      {/* Confirmar eliminación */}
      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar empleado</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Seguro que deseas eliminar a{' '}
            <strong>
              {confirmDelete?.persona_id?.Nombre} {confirmDelete?.persona_id?.Apellido_Paterno}
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
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}