import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, CircularProgress, Alert
} from '@mui/material'
import { turnoApi } from '../api/turnoApi'

const initialState = { nombre: '', hora_inicio: '', hora_fin: '', minutos_tolerancia: 10 }

export default function CrearTurnoModal({ open, onClose, onSaved, token }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 👈 NUEVO: Estado para errores por campo
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initialState)
      setError('')
      setErrores({})
    }
  }, [open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Limpiar el error del campo al escribir
    if (errores[name]) setErrores({ ...errores, [name]: '' })
  }

  const handleSubmit = async () => {
    setError('')
    const nuevosErrores = {}

    // Validaciones
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
    if (!form.hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria.'
    if (!form.hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria.'
    
    if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
      nuevosErrores.hora_fin = 'La hora de fin debe ser mayor a la de inicio.'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    if (!token) {
      setError('Sesión inválida. Vuelve a iniciar sesión.')
      return
    }

    setLoading(true)
    try {
      const formatearHora = (hora) => (!hora ? '00:00:00' : hora.length === 5 ? `${hora}:00` : hora)
      const payload = {
        nombre: form.nombre.trim(),
        hora_inicio: formatearHora(form.hora_inicio),
        hora_fin: formatearHora(form.hora_fin),
        minutos_tolerancia: Number(form.minutos_tolerancia) || 10
      }

      await turnoApi.crearTurno(token, payload)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.mensaje || err.message || 'Error al crear el turno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Turno</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Nombre del turno *" name="nombre"
              value={form.nombre} onChange={handleChange}
              placeholder="Ej. Matutino"
              error={!!errores.nombre} helperText={errores.nombre}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Hora de inicio *" name="hora_inicio" type="time"
              value={form.hora_inicio} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errores.hora_inicio} helperText={errores.hora_inicio}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Hora de fin *" name="hora_fin" type="time"
              value={form.hora_fin} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errores.hora_fin} helperText={errores.hora_fin}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Minutos de tolerancia" name="minutos_tolerancia" type="number"
              value={form.minutos_tolerancia} onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' } }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Guardar Turno'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}