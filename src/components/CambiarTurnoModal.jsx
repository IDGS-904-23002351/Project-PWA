import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, TextField, CircularProgress, Alert
} from '@mui/material'
import { turnoApi } from '../api/turnoApi'

// 👈 Recibimos el token como prop
export default function CambiarTurnoModal({ open, onClose, onSaved, empleado, turnos, token }) {
  const [nuevoTurno, setNuevoTurno] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && empleado) {
      // 👈 Asignamos el turno actual del empleado (que viene como número plano)
      setNuevoTurno(empleado.turno_id || '')
      setError('')
    }
  }, [open, empleado])

  const handleSubmit = async () => {
    setError('')

    if (!empleado?.id) {
      setError('No se encontró el ID del empleado.')
      return
    }

    if (!nuevoTurno) {
      setError('Selecciona un turno.')
      return
    }

    if (!token) {
      setError('Sesión inválida. Vuelve a iniciar sesión.')
      return
    }

    setLoading(true)
    try {
      // 👈 Armamos el payload EXACTO que espera el C#
      const payload = {
        empleado_id: parseInt(empleado.id, 10),
        nuevo_turno_id: parseInt(nuevoTurno, 10)
      }

      // 👈 Enviamos el token y el payload
      await turnoApi.cambiarTurno(token, payload)
      
      onSaved()
      onClose()
    } catch (err) {
      // Capturamos el mensaje exacto del backend
      const mensajeError = err?.response?.data?.mensaje || err?.message || 'Error al cambiar el turno'
      setError(mensajeError)
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