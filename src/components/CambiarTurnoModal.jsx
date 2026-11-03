import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, TextField, CircularProgress, Alert
} from '@mui/material'
import { turnoApi } from '../api/turnoApi'

export default function CambiarTurnoModal({ open, onClose, onSaved, empleado, turnos }) {
  const [nuevoTurno, setNuevoTurno] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && empleado) {
      setNuevoTurno(empleado.turno_id?.id || '')
      setError('')
    }
  }, [open, empleado])

  const handleSubmit = async () => {
    if (!nuevoTurno) {
      setError('Selecciona un turno.')
      return
    }
    setLoading(true)
    try {
      await turnoApi.cambiarTurno(empleado.id, nuevoTurno)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Error al cambiar el turno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cambiar Turno de Empleado</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          select
          fullWidth
          label="Nuevo Turno"
          value={nuevoTurno}
          onChange={(e) => setNuevoTurno(e.target.value)}
          sx={{ mt: 1 }}
        >
          {turnos.map((t) => (
            <MenuItem key={t.turno_id} value={t.turno_id}>
              {t.nombre} ({t.horario})
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' } }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambio'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}