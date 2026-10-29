// src/pages/TurnosPage.jsx
import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField,
  MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { turnoApi } from '../api/turnoApi'
import CrearTurnoModal from '../components/CrearTurnoModal'

export default function TurnosPage() {
  const [resumen, setResumen] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtros y paginación
  const [buscar, setBuscar] = useState('')
  const [turnoFiltro, setTurnoFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const [resResumen, resAsignaciones] = await Promise.all([
        turnoApi.obtenerResumen(),
        turnoApi.listarAsignaciones(buscar, turnoFiltro, '', pagina, 10)
      ])
      setResumen(resResumen || [])
      setAsignaciones(resAsignaciones.asignaciones || [])
      setTotal(resAsignaciones.total || 0)
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [pagina, turnoFiltro]) // Recargar al cambiar página o filtro

  const handleBuscarKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPagina(1)
      cargarDatos()
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Gestión de Turnos</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setModalOpen(true)}
          sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' } }}
        >
          Nuevo Turno
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Resumen de turnos */}
      <Typography variant="h6" sx={{ mb: 1 }}>Resumen de Turnos</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {resumen.map((turno) => (
          <Grid item xs={12} sm={6} md={3} key={turno.turno_id}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{turno.nombre}</Typography>
                <Typography variant="h5" component="div">{turno.empleados_asignados} empleados</Typography>
                <Typography variant="body2" color="textSecondary">{turno.horario}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtros y Lista de Asignaciones */}
      <Typography variant="h6" sx={{ mb: 1 }}>Asignaciones</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField 
          label="Buscar empleado" 
          size="small" 
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          onKeyDown={handleBuscarKeyPress}
          placeholder="Presiona Enter para buscar"
        />
        <TextField 
          select
          label="Filtrar por turno" 
          size="small"
          value={turnoFiltro}
          onChange={(e) => { setTurnoFiltro(e.target.value); setPagina(1); }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos los turnos</MenuItem>
          {resumen.map((t) => (
            <MenuItem key={t.turno_id} value={t.turno_id}>{t.nombre}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Empleado</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Vigente desde</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : asignaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No hay asignaciones registradas.
                </TableCell>
              </TableRow>
            ) : (
              asignaciones.map((asig, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {asig.empleado?.persona_id?.Nombre} {asig.empleado?.persona_id?.Apellido_Paterno}
                  </TableCell>
                  <TableCell>{asig.departamento}</TableCell>
                  <TableCell>{asig.turno_nombre}</TableCell>
                  <TableCell>{asig.horario}</TableCell>
                  <TableCell>
                    {asig.vigente_desde ? new Date(asig.vigente_desde).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación simple */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1, alignItems: 'center' }}>
        <Typography variant="body2">Total: {total}</Typography>
        <Button size="small" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>Anterior</Button>
        <Typography variant="body2">Página {pagina}</Typography>
        <Button size="small" disabled={pagina * 10 >= total} onClick={() => setPagina(pagina + 1)}>Siguiente</Button>
      </Box>

      <CrearTurnoModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSaved={() => {
          cargarDatos()
          // Opcional: mostrar un toast de éxito
        }} 
      />
    </Box>
  )
}