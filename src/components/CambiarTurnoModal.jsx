import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, TextField, CircularProgress, Alert
} from '@mui/material'
import { turnoApi } from '../api/turnoApi'

export default function CambiarTurnoModal({ open, onClose, onSaved, empleado, turnos, token }) {
  const [nuevoTurno, setNuevoTurno] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')

  useEffect(() => {
    if (open && empleado) {
      setNuevoTurno(empleado.turno_id ? String(empleado.turno_id) : '')
      setError('')
      setErrorCampo('')
    }
  }, [open, empleado])

  const handleSubmit = async () => {
    setError('')
    setErrorCampo('')

    if (!empleado?.id) return setError('No se encontró el ID del empleado.')
    if (!nuevoTurno) return setErrorCampo('Debes seleccionar un nuevo turno.')
    if (String(empleado.turno_id) === String(nuevoTurno)) return setErrorCampo('El empleado ya tiene este turno asignado.')
    if (!token) return setError('Sesión inválida.')

    setLoading(true)
    try {
      const payload = {
        empleado_id: parseInt(empleado.id, 10),
        nuevo_turno_id: parseInt(nuevoTurno, 10)
      }

      await turnoApi.cambiarTurno(token, payload)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.mensaje || err.message || 'Error al cambiar el turno')
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
          select fullWidth label="Nuevo Turno" value={nuevoTurno}
          onChange={(e) => { setNuevoTurno(e.target.value); setErrorCampo(''); }}
          sx={{ mt: 1 }}
          error={!!errorCampo} helperText={errorCampo}
        >
          {turnos.map((t) => (
            <MenuItem key={t.turno_id} value={String(t.turno_id)}>
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