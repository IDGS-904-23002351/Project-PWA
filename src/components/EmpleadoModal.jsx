// src/components/EmpleadoModal.jsx
import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, CircularProgress, Alert,
  Typography, Divider,
} from '@mui/material'
import { empleadoApi } from '../api/empleadoApi'

const EMPRESAS = [{ Id: 1, Nombre: 'Empresa Demo' }]
const SEDES = [{ Id: 1, Nombre: 'Sede Central' }]
const DEPARTAMENTOS = [
  { Id: 1, Nombre: 'Recursos Humanos' },
  { Id: 2, Nombre: 'Sistemas' },
]
const TURNOS = [
  { Id: 1, Nombre: 'Matutino' },
  { Id: 2, Nombre: 'Vespertino' },
]
const ROLES = [
  { Id: 1, Nombre: 'Administrador' },
  { Id: 2, Nombre: 'Empleado' },
]
const DIRECCIONES = [{ Id: 1, Nombre: 'Dirección Principal' }]

const initialState = {
  Nombre: '',
  Apellido_Paterno: '',
  Apellido_Materno: '',
  correo: '',
  telefono: '',
  rfc: '',
  curp: '',
  nss: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  empresa_id: 1,
  sede_id: 1,
  departamento_id: 1,
  turno_id: 1,
  direccion_id: 1,
  estado: 'ACTIVO',
  rol_id: 2,
  nombre_usuario: '',
  contrasena: '',
}

export default function EmpleadoModal({ open, onClose, empleado, onSaved }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})

  const esEdicion = Boolean(empleado?.id)

  useEffect(() => {
    if (!open) return
    if (esEdicion) {
      setForm({
        Nombre: empleado.persona_id?.Nombre || '',
        Apellido_Paterno: empleado.persona_id?.Apellido_Paterno || '',
        Apellido_Materno: empleado.persona_id?.Apellido_Materno || '',
        correo: empleado.persona_id?.correo || '',
        telefono: empleado.persona_id?.telefono || '',
        rfc: empleado.rfc || '',
        curp: empleado.curp || '',
        nss: empleado.nss || '',
        fecha_ingreso: empleado.fecha_ingreso
          ? new Date(empleado.fecha_ingreso).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        empresa_id: empleado.empresa_id?.Id ?? 1,
        sede_id: empleado.sede_id?.Id ?? 1,
        departamento_id: empleado.departamento_id?.Id ?? 1,
        turno_id: empleado.turno_id?.Id ?? 1,
        direccion_id: empleado.persona_id?.direccion_id?.Id ?? 1,
        estado: empleado.estado || 'ACTIVO',
        rol_id: empleado.usuarios_id?.rol_id?.Id ?? 2,
        nombre_usuario: empleado.usuarios_id?.nombre_usuario || '',
        contrasena: '',
      })
    } else {
      setForm(initialState)
    }
    setError('')
    setErroresCampo({})
  }, [open, empleado, esEdicion])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toInt = (v) => {
    const n = Number(v)
    return Number.isInteger(n) && n > 0 ? n : null
  }

  const construirPayload = () => {
    const persona = {
      Nombre: form.Nombre?.trim() || '',
      Apellido_Paterno: form.Apellido_Paterno?.trim() || '',
      Apellido_Materno: form.Apellido_Materno?.trim() || '',
      correo: form.correo?.trim() || '',
      telefono: form.telefono?.trim() || '',
      direccion_id: { Id: toInt(form.direccion_id) },
    }

    const base = {
      persona_id: persona,
      empresa_id: { Id: toInt(form.empresa_id) },
      departamento_id: { Id: toInt(form.departamento_id) },
      turno_id: { Id: toInt(form.turno_id) },
      sede_id: { Id: toInt(form.sede_id) },
      rfc: form.rfc?.trim()?.toUpperCase() || '',
      curp: form.curp?.trim()?.toUpperCase() || '',
      nss: form.nss?.trim() || '',
      fecha_ingreso: form.fecha_ingreso,
    }

    if (esEdicion) {
      return {
        ...base,
        Id: empleado.id,
        persona_id: { ...persona, Id: empleado?.persona_id?.Id ?? 0 },
        usuarios_id: empleado?.usuarios_id ?? undefined,
        estado: form.estado || 'ACTIVO',
      }
    }

    return {
      ...base,
      usuarios_id: {
        rol_id: { Id: toInt(form.rol_id) },
        nombre_usuario: form.nombre_usuario?.trim() || '',
        contrasena: form.contrasena || '',
      },
    }
  }

  const handleSubmit = async () => {
    setError('')
    setErroresCampo({})

    const faltantes = []
    if (!toInt(form.empresa_id)) faltantes.push('Empresa')
    if (!toInt(form.sede_id)) faltantes.push('Sede')
    if (!toInt(form.departamento_id)) faltantes.push('Departamento')
    if (!toInt(form.turno_id)) faltantes.push('Turno')
    if (!toInt(form.direccion_id)) faltantes.push('Dirección')
    if (!form.Nombre?.trim()) faltantes.push('Nombre')
    if (!form.Apellido_Paterno?.trim()) faltantes.push('Apellido paterno')
    if (!form.rfc?.trim()) faltantes.push('RFC')
    if (!form.curp?.trim()) faltantes.push('CURP')

    if (!esEdicion) {
      if (!toInt(form.rol_id)) faltantes.push('Rol')
      if (!form.nombre_usuario?.trim()) faltantes.push('Nombre de usuario')
      if (!form.contrasena?.trim()) faltantes.push('Contraseña')
    }

    if (faltantes.length) {
      setError(`Completa los campos obligatorios: ${faltantes.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const payload = construirPayload()
      console.log('Payload a enviar:', JSON.stringify(payload, null, 2))

      if (esEdicion) {
        await empleadoApi.actualizar(empleado.id, payload)
      } else {
        await empleadoApi.crear(payload)
      }

      onSaved?.()
      onClose()
    } catch (err) {
      if (err.detalle?.errors) {
        setErroresCampo(err.detalle.errors)
        const mensajes = Object.entries(err.detalle.errors)
          .map(([campo, msgs]) => `${campo}: ${msgs.join(', ')}`)
          .join(' | ')
        setError(mensajes)
      } else {
        setError(err.message || 'Error al guardar el empleado')
      }
    } finally {
      setLoading(false)
    }
  }

  const helper = (campo) => erroresCampo[campo]?.[0] ?? ''

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar empleado' : 'Nuevo empleado'}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="overline" color="textSecondary">Datos personales</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Nombre *" name="Nombre"
              value={form.Nombre} onChange={handleChange}
              error={!!helper('persona_id.Nombre')}
              helperText={helper('persona_id.Nombre')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Apellido paterno *" name="Apellido_Paterno"
              value={form.Apellido_Paterno} onChange={handleChange}
              error={!!helper('persona_id.Apellido_Paterno')}
              helperText={helper('persona_id.Apellido_Paterno')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Apellido materno" name="Apellido_Materno"
              value={form.Apellido_Materno} onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Correo" name="correo" type="email"
              value={form.correo} onChange={handleChange}
              error={!!helper('persona_id.correo')}
              helperText={helper('persona_id.correo')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Teléfono" name="telefono"
              value={form.telefono} onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select fullWidth label="Dirección *" name="direccion_id"
              value={form.direccion_id} onChange={handleChange}
              error={!!helper('persona_id.direccion_id')}
              helperText={helper('persona_id.direccion_id')}
            >
              {DIRECCIONES.map((d) => (
                <MenuItem key={d.Id} value={d.Id}>{d.Nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" color="textSecondary">Datos laborales</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="RFC *" name="rfc"
              value={form.rfc} onChange={handleChange}
              error={!!helper('rfc')} helperText={helper('rfc')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="CURP *" name="curp"
              value={form.curp} onChange={handleChange}
              error={!!helper('curp')} helperText={helper('curp')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="NSS" name="nss"
              value={form.nss} onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Fecha de ingreso" name="fecha_ingreso" type="date"
              value={form.fecha_ingreso} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!helper('fecha_ingreso')} helperText={helper('fecha_ingreso')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth label="Empresa *" name="empresa_id"
              value={form.empresa_id} onChange={handleChange}
              error={!!helper('empresa_id')} helperText={helper('empresa_id')}
            >
              {EMPRESAS.map((e) => (
                <MenuItem key={e.Id} value={e.Id}>{e.Nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth label="Sede *" name="sede_id"
              value={form.sede_id} onChange={handleChange}
              error={!!helper('sede_id')} helperText={helper('sede_id')}
            >
              {SEDES.map((s) => (
                <MenuItem key={s.Id} value={s.Id}>{s.Nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth label="Departamento *" name="departamento_id"
              value={form.departamento_id} onChange={handleChange}
              error={!!helper('departamento_id')} helperText={helper('departamento_id')}
            >
              {DEPARTAMENTOS.map((d) => (
                <MenuItem key={d.Id} value={d.Id}>{d.Nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth label="Turno *" name="turno_id"
              value={form.turno_id} onChange={handleChange}
              error={!!helper('turno_id')} helperText={helper('turno_id')}
            >
              {TURNOS.map((t) => (
                <MenuItem key={t.Id} value={t.Id}>{t.Nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          {esEdicion && (
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Estado" name="estado"
                value={form.estado} onChange={handleChange}
              >
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="INACTIVO">Inactivo</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>

        {!esEdicion && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="textSecondary">
              Cuenta de usuario (acceso al sistema)
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select fullWidth label="Rol *" name="rol_id"
                  value={form.rol_id} onChange={handleChange}
                  error={!!helper('usuarios_id.rol_id')}
                  helperText={helper('usuarios_id.rol_id')}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r.Id} value={r.Id}>{r.Nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Nombre de usuario *" name="nombre_usuario"
                  value={form.nombre_usuario} onChange={handleChange}
                  error={!!helper('usuarios_id.nombre_usuario')}
                  helperText={helper('usuarios_id.nombre_usuario')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Contraseña *" name="contrasena" type="password"
                  value={form.contrasena} onChange={handleChange}
                  error={!!helper('usuarios_id.contrasena')}
                  helperText={helper('usuarios_id.contrasena')}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' } }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}