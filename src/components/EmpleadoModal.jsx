// src/components/EmpleadoModal.jsx
import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, CircularProgress, Alert,
  Typography, Divider, Box,
} from '@mui/material'
import { empleadoApi } from '../api/empleadoApi'
import MapaDireccion from './MapaDireccion'

const initialState = {
  nombre: '',
  apellido_Paterno: '',
  apellido_Materno: '',
  correo: '',
  telefono: '',
  rfc: '',
  curp: '',
  nss: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  empresa_id: '',
  sede_id: '',
  departamento_id: '',
  turno_id: '',
  direccion_id: '',
  estado: 'ACTIVO',
  rol_id: '',
  nombre_usuario: '',
  contrasena: '',
  // Dirección
  modo_direccion: 'nueva', 
  dir_calle: '',
  dir_colonia: '',
  dir_ciudad: '',
  dir_estado: '',
  dir_pais: 'México',
  dir_cp: '',
}

const selectProps = {
  displayEmpty: true,
}

export default function EmpleadoModal({ open, onClose, empleado, onSaved }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})

  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [turnos, setTurnos] = useState([])
  const [roles, setRoles] = useState([])
  const [direcciones, setDirecciones] = useState([])

  const esEdicion = Boolean(empleado?.id)

  useEffect(() => {
    if (!open) return
    const cargarCatalogos = async () => {
      try {
        const [rEmp, rSede, rDep, rTur, rRol, rDir] = await Promise.all([
          empleadoApi.obtenerEmpresas(),
          empleadoApi.obtenerSedes(),
          empleadoApi.obtenerDepartamentos(),
          empleadoApi.obtenerTurnos(),
          empleadoApi.obtenerRoles(),
          empleadoApi.obtenerDirecciones(),
        ])
        setEmpresas(rEmp || [])
        setSedes(rSede || [])
        setDepartamentos(rDep || [])
        setTurnos(rTur || [])
        setRoles(rRol || [])
        setDirecciones(rDir || [])
      } catch (err) {
        console.error("Error cargando catálogos", err)
      }
    }
    cargarCatalogos()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (esEdicion) {
      const p = empleado.persona_id || {}
      const d = p.direccion_id || {}

      setForm({
        nombre: p.nombre || '',
        apellido_Paterno: p.apellido_Paterno || '',
        apellido_Materno: p.apellido_Materno || '',
        correo: p.correo || '',
        telefono: p.telefono ? String(p.telefono) : '',
        rfc: empleado.rfc || '',
        curp: empleado.curp || '',
        nss: empleado.nss ? String(empleado.nss) : '',
        fecha_ingreso: empleado.fecha_ingreso
          ? new Date(empleado.fecha_ingreso).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        empresa_id: empleado.empresa_id?.id || '',
        sede_id: empleado.sede_id?.id || '',
        departamento_id: empleado.departamento_id?.id || '',
        turno_id: empleado.turno_id?.id || '',
        estado: empleado.estado || 'ACTIVO',
        rol_id: empleado.usuarios_id?.rol_id?.id || '',
        nombre_usuario: empleado.usuarios_id?.nombre_usuario || '',
        contrasena: '',
        modo_direccion: 'existente',
        direccion_id: d.id || '',
        dir_calle: d.calle || '',
        dir_colonia: d.colonia || '',
        dir_ciudad: d.ciudad || d.cuidad || '',
        dir_estado: d.estado || '',
        dir_pais: d.pais || 'México',
        dir_cp: d.codigo_postal ? String(d.codigo_postal) : '',
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

  const handleDireccionDesdeMapa = (datos) => {
    setForm((prev) => ({
      ...prev,
      dir_calle: datos.calle || '',
      dir_colonia: datos.colonia || '',
      dir_ciudad: datos.ciudad || '',
      dir_estado: datos.estado || '',
      dir_cp: datos.cp || '',
      dir_pais: datos.pais || 'México',
    }))
  }

  const toInt = (v) => {
    const n = Number(v)
    return Number.isInteger(n) && n > 0 ? n : null
  }

  const construirPayload = () => {
    let direccion
    if (form.modo_direccion === 'nueva') {
      direccion = {
        calle: form.dir_calle?.trim() || '',
        colonia: form.dir_colonia?.trim() || '',
        cuidad: form.dir_ciudad?.trim() || '',
        estado: form.dir_estado?.trim() || '',
        pais: form.dir_pais?.trim() || 'México',
        codigo_postal: form.dir_cp?.trim() || '',
      }
    } else {
      direccion = { id: toInt(form.direccion_id) }
    }

    const persona = {
      nombre: form.nombre?.trim() || '',
      apellido_Paterno: form.apellido_Paterno?.trim() || '',
      apellido_Materno: form.apellido_Materno?.trim() || '',
      correo: form.correo?.trim() || '',
      telefono: form.telefono?.trim() || '',
      direccion_id: direccion,
    }

    const base = {
      persona_id: persona,
      empresa_id: { id: toInt(form.empresa_id) },
      departamento_id: { id: toInt(form.departamento_id) },
      turno_id: { id: toInt(form.turno_id) },
      sede_id: { id: toInt(form.sede_id) },
      rfc: form.rfc?.trim()?.toUpperCase() || '',
      curp: form.curp?.trim()?.toUpperCase() || '',
      nss: form.nss?.trim() || '',
      fecha_ingreso: form.fecha_ingreso,
    }

    if (esEdicion) {
      return {
        ...base,
        id: empleado.id,
        persona_id: { ...persona, id: empleado?.persona_id?.id ?? 0 },
        usuarios_id: { rol_id: { id: toInt(form.rol_id) } },
        estado: form.estado || 'ACTIVO',
      }
    }

    return {
      ...base,
      usuarios_id: {
        rol_id: { id: toInt(form.rol_id) },
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
    if (!form.nombre?.trim()) faltantes.push('Nombre')
    if (!form.apellido_Paterno?.trim()) faltantes.push('Apellido paterno')
    if (!form.rfc?.trim()) faltantes.push('RFC')
    if (!form.curp?.trim()) faltantes.push('CURP')

    if (form.modo_direccion === 'existente' && !toInt(form.direccion_id)) {
      faltantes.push('Dirección')
    }
    if (form.modo_direccion === 'nueva' && !form.dir_calle?.trim()) {
      faltantes.push('Calle de la nueva dirección')
    }

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
        const mensajes = Object.entries(err.detalle.errors).map(([campo, msgs]) => `${campo}: ${msgs.join(', ')}`).join(' | ')
        setError(mensajes)
      } else {
        setError(err.message || 'Error al guardar el empleado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar empleado' : 'Nuevo empleado'}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="overline" color="textSecondary">Datos personales</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Apellido paterno *" name="apellido_Paterno" value={form.apellido_Paterno} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Apellido materno" name="apellido_Materno" value={form.apellido_Materno} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          </Grid>

          {/* Dirección */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
              Dirección
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Button size="small" variant={form.modo_direccion === 'existente' ? 'contained' : 'outlined'} onClick={() => setForm({ ...form, modo_direccion: 'existente' })} sx={{ textTransform: 'none' }}>
                Usar existente
              </Button>
              <Button size="small" variant={form.modo_direccion === 'nueva' ? 'contained' : 'outlined'} onClick={() => setForm({ ...form, modo_direccion: 'nueva' })} sx={{ textTransform: 'none' }}>
                Nueva dirección
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* SEPARAMOS EL MAPA DE LOS INPUTS */}
        {form.modo_direccion === 'existente' ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                label="Dirección *" 
                name="direccion_id" 
                value={form.direccion_id} 
                onChange={handleChange}
                SelectProps={selectProps}
                sx={{ minWidth: 200 }}
              >
                {direcciones.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        ) : (
          <>
            {/* EL MAPA TIENE SU PROPIO CONTENEDOR Y OCUPA EL 100% */}
            <Box sx={{ mb: 3 }}>
              <MapaDireccion onDireccionSeleccionada={handleDireccionDesdeMapa} />
            </Box>

            {/* LOS INPUTS DE DIRECCIÓN ESTÁN EN OTRO CONTENEDOR DEBAJO DEL MAPA */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Calle" name="dir_calle" value={form.dir_calle} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Colonia" name="dir_colonia" value={form.dir_colonia} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Ciudad" name="dir_ciudad" value={form.dir_ciudad} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Estado" name="dir_estado" value={form.dir_estado} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Código postal" name="dir_cp" value={form.dir_cp} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="País" name="dir_pais" value={form.dir_pais} onChange={handleChange} />
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" color="textSecondary">Datos laborales</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
          <Grid item xs={12} sm={4}><TextField fullWidth label="RFC *" name="rfc" value={form.rfc} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="CURP *" name="curp" value={form.curp} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="NSS" name="nss" value={form.nss} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Fecha de ingreso" name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField 
              select 
              fullWidth 
              label="Empresa *" 
              name="empresa_id" 
              value={form.empresa_id} 
              onChange={handleChange}
              SelectProps={selectProps}
              sx={{ minWidth: 140 }}
            >
              {empresas.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              select 
              fullWidth 
              label="Sede *" 
              name="sede_id" 
              value={form.sede_id} 
              onChange={handleChange}
              SelectProps={selectProps}
              sx={{ minWidth: 140 }}
            >
              {sedes.map((s) => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              select 
              fullWidth 
              label="Departamento *" 
              name="departamento_id" 
              value={form.departamento_id} 
              onChange={handleChange}
              SelectProps={selectProps}
              sx={{ minWidth: 160 }}
            >
              {departamentos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              select 
              fullWidth 
              label="Turno *" 
              name="turno_id" 
              value={form.turno_id} 
              onChange={handleChange}
              SelectProps={selectProps}
              sx={{ minWidth: 140 }}
            >
              {turnos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
            </TextField>
          </Grid>

          {esEdicion && (
            <Grid item xs={12} sm={4}>
              <TextField 
                select 
                fullWidth 
                label="Estado" 
                name="estado" 
                value={form.estado} 
                onChange={handleChange}
                SelectProps={selectProps}
                sx={{ minWidth: 140 }}
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
            <Typography variant="overline" color="textSecondary">Cuenta de usuario</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select 
                  fullWidth 
                  label="Rol *" 
                  name="rol_id" 
                  value={form.rol_id} 
                  onChange={handleChange}
                  SelectProps={selectProps}
                  sx={{ minWidth: 140 }}
                >
                  {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Nombre de usuario *" name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Contraseña *" name="contrasena" type="password" value={form.contrasena} onChange={handleChange} /></Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' } }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}