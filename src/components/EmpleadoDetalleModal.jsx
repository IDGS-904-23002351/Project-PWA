// src/components/EmpleadoDetalleModal.jsx
import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, Typography, Divider, CircularProgress, Alert, Chip, Box,
} from '@mui/material'
import { empleadoApi } from '../api/empleadoApi'

const Campo = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="caption" color="textSecondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} color="#1e293b">
      {value || '—'}
    </Typography>
  </Grid>
)

const Seccion = ({ titulo, children }) => (
  <>
    <Typography variant="overline" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
      {titulo}
    </Typography>
    <Divider sx={{ mb: 1.5 }} />
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {children}
    </Grid>
  </>
)

const fmtFecha = (v) => {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return v
  }
}

const fmtDireccion = (d) => {
  if (!d) return '—'
  const partes = [d.calle, d.colonia, d.ciudad || d.cuidad, d.estado, d.pais, d.codigo_postal]
    .filter((x) => x && String(x).trim())
  if (partes.length) return partes.join(', ')
  return d.id ? `ID: ${d.id}` : '—'
}

export default function EmpleadoDetalleModal({ open, onClose, empleadoId }) {
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !empleadoId) return
    let cancelado = false

    const cargar = async () => {
      setLoading(true)
      setError('')
      setDetalle(null)
      try {
        const data = await empleadoApi.obtener(empleadoId)
        if (!cancelado) setDetalle(data?.empleado ?? data ?? null)
      } catch (err) {
        if (!cancelado) setError(err.message || 'No se pudo cargar el detalle')
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [open, empleadoId])

  const p = detalle?.persona_id || {}
  const d = p.direccion_id || {}
  const u = detalle?.usuarios_id || {}

  const nombreCompleto = [p.nombre, p.apellido_Paterno, p.apellido_Materno]
    .filter(Boolean).join(' ')

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalle del empleado
        {detalle && (
          <Box component="span" sx={{ ml: 1 }}>
            <Chip
              label={detalle.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
              size="small"
              sx={{
                bgcolor: detalle.estado === 'ACTIVO' ? '#e0f2f1' : '#eeeeee',
                color: detalle.estado === 'ACTIVO' ? '#00796b' : '#616161',
                fontWeight: 'bold',
              }}
            />
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && detalle && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                {nombreCompleto || 'Sin nombre'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                RFC: {detalle.rfc || '—'} · ID: {detalle.id || '—'}
              </Typography>
            </Box>

            <Seccion titulo="Datos personales">
              <Campo label="Nombre" value={p.nombre} />
              <Campo label="Apellido paterno" value={p.apellido_Paterno} />
              <Campo label="Apellido materno" value={p.apellido_Materno} />
              <Campo label="Correo" value={p.correo} />
              <Campo label="Teléfono" value={p.telefono} />
              <Campo label="Dirección" value={fmtDireccion(d)} />
            </Seccion>

            <Seccion titulo="Datos laborales">
              <Campo label="RFC" value={detalle.rfc} />
              <Campo label="CURP" value={detalle.curp} />
              <Campo label="NSS" value={detalle.nss} />
              <Campo label="Fecha de ingreso" value={fmtFecha(detalle.fecha_ingreso)} />
              <Campo label="Empresa" value={detalle.empresa_id?.razon_social || detalle.empresa_id?.id} />
              <Campo label="Sede" value={detalle.sede_id?.nombre || detalle.sede_id?.id} />
              <Campo label="Departamento" value={detalle.departamento_id?.nombre || detalle.departamento_id?.id} />
              <Campo label="Turno" value={detalle.turno_id?.nombre || detalle.turno_id?.id} />
              <Campo label="Estado" value={detalle.estado} />
            </Seccion>

            {u && Object.keys(u).length > 0 && (
              <Seccion titulo="Cuenta de usuario">
                <Campo label="Usuario" value={u.nombre_usuario} />
                <Campo label="Rol" value={u.rol_id?.nombre || u.rol_id?.id} />
                <Campo label="Estado usuario" value={u.estado} />
              </Seccion>
            )}

            <Seccion titulo="Registro">
              <Campo label="Creado el" value={fmtFecha(detalle.creado_en)} />
              <Campo label="Actualizado el" value={fmtFecha(detalle.actualizado_en)} />
            </Seccion>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}