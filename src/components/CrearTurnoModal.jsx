// src/components/CrearTurnoModal.jsx
import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, CircularProgress, Alert
} from '@mui/material'
import { turnoApi } from '../api/turnoApi'

const initialState = {
  nombre: '',
  hora_inicio: '',
  hora_fin: '',
  minutos_tolerancia: 10
}

export default function CrearTurnoModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.nombre.trim() || !form.hora_inicio || !form.hora_fin) {
      setError('El nombre, hora de inicio y hora de fin son obligatorios.')
      return
    }

    setLoading(true)
    try {
      await turnoApi.crearTurno({
        nombre: form.nombre.trim(),
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        minutos_tolerancia: Number(form.minutos_tolerancia)
      })
      onSaved?.()
      onClose()
      setForm(initialState)
    } catch (err) {
      setError(err.mensaje || err.detalle || 'Error al crear el turno')
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
              fullWidth
              label="Nombre del turno *"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Matutino"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hora de inicio *"
              name="hora_inicio"
              type="time"
              value={form.hora_inicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hora de fin *"
              name="hora_fin"
              type="time"
              value={form.hora_fin}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Minutos de tolerancia"
              name="minutos_tolerancia"
              type="number"
              value={form.minutos_tolerancia}
              onChange={handleChange}
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