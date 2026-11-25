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
  modo_direccion: 'nueva',
  dir_calle: '',
  dir_colonia: '',
  dir_ciudad: '',
  dir_estado: '',
  dir_pais: 'México',
  dir_cp: '',
  salario_diario: '',
  tipo_contrato_id: 1,
}

const fechaMaximaIngreso = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const SALARIO_MINIMO = 315.04

const selectProps = { displayEmpty: true }

export default function EmpleadoModal({ open, onClose, empleado, onSaved, token }) {
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
  const [tiposContrato, setTiposContrato] = useState([])
  
  const esEdicion = Boolean(empleado?.id || empleado?.Id)

  useEffect(() => {
    if (!open || !token) return
    const cargarCatalogos = async () => {
      try {
        const [rEmp, rSede, rDep, rTur, rRol, rDir, rTip] = await Promise.all([
          empleadoApi.obtenerEmpresas(token),
          empleadoApi.obtenerSedes(token),
          empleadoApi.obtenerDepartamentos(token),
          empleadoApi.obtenerTurnos(token),
          empleadoApi.obtenerRoles(token),
          empleadoApi.obtenerDirecciones(token),
          empleadoApi.obtenerTiposContrato(token).catch(() => []),
        ])
        setEmpresas(rEmp || [])
        setSedes(rSede || [])
        setDepartamentos(rDep || [])
        setTurnos(rTur || [])
        setRoles(rRol || [])
        setDirecciones(rDir || [])
        setTiposContrato(rTip || [])
      } catch (err) {
        console.error('Error cargando catálogos', err)
      }
    }
    cargarCatalogos()
  }, [open, token])

  useEffect(() => {
    if (!open) return
    if (esEdicion) {
      const p = empleado.persona_id || {}
      const d = p.direccion_id || empleado.persona_id?.direccion_id || {}

      setForm({
        nombre: p.Nombre || p.nombre || '',
        apellido_Paterno: p.Apellido_Paterno || p.apellido_Paterno || '',
        apellido_Materno: p.Apellido_Materno || p.apellido_Materno || '',
        correo: p.correo || p.Correo || '',
        telefono: p.telefono ? String(p.telefono) : '',
        rfc: empleado.rfc || empleado.Rfc || '',
        curp: empleado.curp || empleado.Curp || '',
        nss: empleado.nss ? String(empleado.nss) : '',
        fecha_ingreso: (empleado.fecha_ingreso || empleado.FechaIngreso)
          ? new Date(empleado.fecha_ingreso || empleado.FechaIngreso).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        empresa_id: empleado.empresa_id?.Id ?? empleado.empresa_id?.id ?? '',
        sede_id: empleado.sede_id?.Id ?? empleado.sede_id?.id ?? '',
        departamento_id: empleado.departamento_id?.Id ?? empleado.departamento_id?.id ?? '',
        turno_id: empleado.turno_id?.Id ?? empleado.turno_id?.id ?? '',
        estado: empleado.estado || 'ACTIVO',
        rol_id: empleado.usuarios_id?.rol_id?.Id ?? empleado.usuarios_id?.rol_id?.id ?? '',
        nombre_usuario: empleado.usuarios_id?.nombre_usuario || '',
        contrasena: '',
        modo_direccion: 'existente',
        direccion_id: d.Id ?? d.id ?? '',
        dir_calle: d.calle || d.Calle || '',
        dir_colonia: d.colonia || d.Colonia || '',
        dir_ciudad: d.cuidad || d.Cuidad || d.ciudad || d.Ciudad || '',
        dir_estado: d.estado || d.Estado || '',
        dir_pais: d.pais || d.Pais || 'México',
        dir_cp: d.codigo_postal ? String(d.codigo_postal) : '',
        salario_diario: empleado.salario_diario != null ? String(empleado.salario_diario) : '',
        tipo_contrato_id: empleado.tipo_contrato_id ?? 1,
      })
    } else {
      setForm(initialState)
    }
    setError('')
    setErroresCampo({})
  }, [open, empleado, esEdicion])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (erroresCampo[name]) {
      setErroresCampo({ ...erroresCampo, [name]: '' })
    }
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

  const limpiarVacios = (obj) => {
    const nuevo = {};
    Object.keys(obj).forEach((key) => {
      const valor = obj[key];
      if (typeof valor === 'string' && valor.trim() === '') return;
      if (valor === null || valor === undefined) return;
      
      if (typeof valor === 'object' && !Array.isArray(valor)) {
        const objetoLimpio = limpiarVacios(valor);
        if (Object.keys(objetoLimpio).length > 0) {
          nuevo[key] = objetoLimpio;
        }
      } else {
        nuevo[key] = valor;
      }
    });
    return nuevo;
  };

  const construirPayload = () => {
    let direccion = { Id: 0 };
    
    if (form.modo_direccion === 'nueva' && form.dir_calle?.trim()) {
      direccion = {
        Id: 0,
        calle: form.dir_calle?.trim(),
        colonia: form.dir_colonia?.trim(),
        cuidad: form.dir_ciudad?.trim(),
        estado: form.dir_estado?.trim(),
        pais: form.dir_pais?.trim(),
        codigo_postal: form.dir_cp?.trim(),
      };
    } else if (form.modo_direccion === 'existente') {
      direccion = { Id: toInt(form.direccion_id) || 0 };
    }

    const persona = {
      Nombre: form.nombre?.trim(),
      Apellido_Paterno: form.apellido_Paterno?.trim(),
      Apellido_Materno: form.apellido_Materno?.trim(),
      correo: form.correo?.trim(),
      telefono: form.telefono?.trim(),
      direccion_id: direccion,
    };

    const base = {
      persona_id: persona,
      empresa_id: { Id: toInt(form.empresa_id) },
      departamento_id: { Id: toInt(form.departamento_id) },
      turno_id: { Id: toInt(form.turno_id) },
      sede_id: { Id: toInt(form.sede_id) },
      rfc: form.rfc?.trim()?.toUpperCase(),
      curp: form.curp?.trim()?.toUpperCase(),
      nss: form.nss?.trim(),
      fecha_ingreso: form.fecha_ingreso ? `${form.fecha_ingreso}T00:00:00` : null,
      salario_diario: form.salario_diario !== '' ? Number(form.salario_diario) : null,
      tipo_contrato_id: toInt(form.tipo_contrato_id),
    };

    let payloadFinal;

    if (esEdicion) {
      payloadFinal = {
        ...base,
        Id: empleado.id || empleado.Id,
        persona_id: {
          ...persona,
          Id: empleado?.persona_id?.Id ?? empleado?.persona_id?.id ?? 0,
        },
        usuarios_id: {
          rol_id: { Id: toInt(form.rol_id) },
          nombre_usuario: form.nombre_usuario?.trim(),
        },
        estado: form.estado || 'ACTIVO',
      };
    } else {
      payloadFinal = {
        ...base,
        usuarios_id: {
          rol_id: { Id: toInt(form.rol_id) },
          nombre_usuario: form.nombre_usuario?.trim(),
          contrasena: form.contrasena,
        },
      };
    }

    return limpiarVacios(payloadFinal);
  }

  const handleSubmit = async () => {
    setError('')
    const nuevosErrores = {}

    if (!toInt(form.empresa_id)) nuevosErrores.empresa_id = 'La empresa es obligatoria.'
    if (!toInt(form.sede_id)) nuevosErrores.sede_id = 'La sede es obligatoria.'
    if (!toInt(form.departamento_id)) nuevosErrores.departamento_id = 'El departamento es obligatorio.'
    if (!toInt(form.turno_id)) nuevosErrores.turno_id = 'El turno es obligatorio.'

    if (!form.nombre?.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
    if (!form.apellido_Paterno?.trim()) nuevosErrores.apellido_Paterno = 'El apellido paterno es obligatorio.'

    if (!form.rfc?.trim()) {
      nuevosErrores.rfc = 'El RFC es obligatorio.'
    } else if (form.rfc.trim().length !== 13) {
      nuevosErrores.rfc = 'El RFC debe tener exactamente 13 caracteres.'
    } else if (!/^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/i.test(form.rfc.trim())) {
      nuevosErrores.rfc = 'El RFC no tiene un formato válido (ej. GOMA850101AB1).'
    }

    if (!form.curp?.trim()) {
      nuevosErrores.curp = 'La CURP es obligatoria.'
    } else if (form.curp.trim().length !== 18) {
      nuevosErrores.curp = 'La CURP debe tener 18 caracteres.'
    } else if (!/^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/i.test(form.curp.trim())) {
      nuevosErrores.curp = 'La CURP no tiene un formato válido.'
    }

    if (!form.nss?.trim()) {
      nuevosErrores.nss = 'El NSS es obligatorio.'
    } else if (!/^\d{11}$/.test(form.nss.trim())) {
      nuevosErrores.nss = 'El NSS debe tener 11 dígitos.'
    }

    if (!form.correo?.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      nuevosErrores.correo = 'El formato del correo no es válido.'
    }

    if (form.telefono?.trim() && !/^\d{10}$/.test(form.telefono.trim())) {
      nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos (solo números).'
    }

    if (form.modo_direccion !== 'existente' && form.dir_cp?.trim() && !/^\d{5}$/.test(form.dir_cp.trim())) {
      nuevosErrores.dir_cp = 'El código postal debe tener 5 dígitos.'
    }

    if (form.fecha_ingreso && form.fecha_ingreso > fechaMaximaIngreso()) {
      nuevosErrores.fecha_ingreso = 'La fecha de ingreso no puede ser de más de 30 días en el futuro.'
    }

    const salarioTexto = String(form.salario_diario ?? '').trim()
    if (!salarioTexto) {
      nuevosErrores.salario_diario = 'El salario diario es obligatorio.'
    } else if (!/^\d{1,5}(\.\d{1,2})?$/.test(salarioTexto)) {
      nuevosErrores.salario_diario = 'Escribe un importe válido, por ejemplo 450 o 450.50.'
    } else if (Number(salarioTexto) < SALARIO_MINIMO) {
      nuevosErrores.salario_diario = `No puede ser menor al salario mínimo ($${SALARIO_MINIMO.toFixed(2)}).`
    } else if (Number(salarioTexto) > 50000) {
      nuevosErrores.salario_diario = 'El salario diario no puede ser mayor a $50,000.'
    }

    if (!toInt(form.tipo_contrato_id)) nuevosErrores.tipo_contrato_id = 'El tipo de contrato es obligatorio.'

    if (form.modo_direccion === 'existente' && !toInt(form.direccion_id)) {
      nuevosErrores.direccion_id = 'Debes seleccionar una dirección existente.'
    }
    if (form.modo_direccion === 'nueva' && !form.dir_calle?.trim()) {
      nuevosErrores.dir_calle = 'La calle de la nueva dirección es obligatoria.'
    }

    if (!esEdicion) {
      if (!toInt(form.rol_id)) nuevosErrores.rol_id = 'El rol es obligatorio.'
      if (!form.nombre_usuario?.trim()) nuevosErrores.nombre_usuario = 'El nombre de usuario es obligatorio.'
      if (!form.contrasena || form.contrasena.length < 6) {
        nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresCampo(nuevosErrores)
      setError('Por favor, corrige los errores marcados en rojo.')
      return
    }

    if (!token) {
      setError('Sesión inválida. Vuelve a iniciar sesión.')
      return
    }

    setLoading(true)
    try {
      const payload = construirPayload()
      
      if (esEdicion) {
        await empleadoApi.actualizar(token, empleado.id || empleado.Id, payload)
      } else {
        await empleadoApi.crear(token, payload)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      let msg = 'Error al guardar el empleado'
      if (err?.response?.data?.inner) msg = err.response.data.inner
      else if (err?.response?.data?.detalle) msg = err.response.data.detalle
      else if (err?.response?.data?.mensaje) msg = err.response.data.mensaje
      else if (err?.message) msg = err.message
      
      setError(msg)
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
            <TextField fullWidth label="Nombre *" name="nombre" slotProps={{ htmlInput: { maxLength: 80 } }} value={form.nombre} onChange={handleChange} error={!!erroresCampo.nombre} helperText={erroresCampo.nombre} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Apellido paterno *" name="apellido_Paterno" slotProps={{ htmlInput: { maxLength: 80 } }} value={form.apellido_Paterno} onChange={handleChange} error={!!erroresCampo.apellido_Paterno} helperText={erroresCampo.apellido_Paterno} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Apellido materno" name="apellido_Materno" slotProps={{ htmlInput: { maxLength: 80 } }} value={form.apellido_Materno} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Correo *" name="correo" slotProps={{ htmlInput: { maxLength: 150 } }} type="email" value={form.correo} onChange={handleChange} error={!!erroresCampo.correo} helperText={erroresCampo.correo} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Teléfono" name="telefono" slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric' } }} value={form.telefono} onChange={handleChange} error={!!erroresCampo.telefono} helperText={erroresCampo.telefono} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" color="textSecondary" sx={{ display: 'block', mb: 1 }}>Dirección</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Button size="small" variant={form.modo_direccion === 'existente' ? 'contained' : 'outlined'} onClick={() => setForm({ ...form, modo_direccion: 'existente' })} sx={{ textTransform: 'none' }}>Usar existente</Button>
              <Button size="small" variant={form.modo_direccion === 'nueva' ? 'contained' : 'outlined'} onClick={() => setForm({ ...form, modo_direccion: 'nueva' })} sx={{ textTransform: 'none' }}>Nueva dirección</Button>
            </Box>
          </Grid>
        </Grid>

        {form.modo_direccion === 'existente' ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Dirección *" name="direccion_id" value={form.direccion_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 200 }} error={!!erroresCampo.direccion_id} helperText={erroresCampo.direccion_id}>
                {direcciones.map((d) => {
                  const val = d.Id ?? d.id
                  const nom = d.nombre || d.Nombre || d.calle || `Dirección ${val}`
                  return <MenuItem key={val} value={val}>{nom}</MenuItem>
                })}
              </TextField>
            </Grid>
          </Grid>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <MapaDireccion onDireccionSeleccionada={handleDireccionDesdeMapa} />
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Calle" name="dir_calle" slotProps={{ htmlInput: { maxLength: 150 } }} value={form.dir_calle} onChange={handleChange} error={!!erroresCampo.dir_calle} helperText={erroresCampo.dir_calle} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Colonia" name="dir_colonia" slotProps={{ htmlInput: { maxLength: 100 } }} value={form.dir_colonia} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Ciudad" name="dir_ciudad" slotProps={{ htmlInput: { maxLength: 100 } }} value={form.dir_ciudad} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Estado" name="dir_estado" slotProps={{ htmlInput: { maxLength: 100 } }} value={form.dir_estado} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Código postal" name="dir_cp" slotProps={{ htmlInput: { maxLength: 5, inputMode: 'numeric' } }} value={form.dir_cp} onChange={handleChange} error={!!erroresCampo.dir_cp} helperText={erroresCampo.dir_cp} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="País" name="dir_pais" slotProps={{ htmlInput: { maxLength: 80 } }} value={form.dir_pais} onChange={handleChange} />
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" color="textSecondary">Datos laborales</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="RFC *" name="rfc" slotProps={{ htmlInput: { maxLength: 13 } }} value={form.rfc} onChange={handleChange} error={!!erroresCampo.rfc} helperText={erroresCampo.rfc} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="CURP *" name="curp" slotProps={{ htmlInput: { maxLength: 18 } }} value={form.curp} onChange={handleChange} error={!!erroresCampo.curp} helperText={erroresCampo.curp} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="NSS *" name="nss" slotProps={{ htmlInput: { maxLength: 11, inputMode: 'numeric' } }} value={form.nss} onChange={handleChange} error={!!erroresCampo.nss} helperText={erroresCampo.nss} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Fecha de ingreso" name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: fechaMaximaIngreso() } }} error={!!erroresCampo.fecha_ingreso} helperText={erroresCampo.fecha_ingreso} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Empresa *" name="empresa_id" value={form.empresa_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 140 }} error={!!erroresCampo.empresa_id} helperText={erroresCampo.empresa_id}>
              {empresas.map((e) => {
                const val = e.Id ?? e.id
                return <MenuItem key={val} value={val}>{e.nombre || e.Nombre || e.razon_social}</MenuItem>
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Sede *" name="sede_id" value={form.sede_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 140 }} error={!!erroresCampo.sede_id} helperText={erroresCampo.sede_id}>
              {sedes.map((s) => {
                const val = s.Id ?? s.id
                return <MenuItem key={val} value={val}>{s.nombre || s.Nombre}</MenuItem>
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Departamento *" name="departamento_id" value={form.departamento_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 160 }} error={!!erroresCampo.departamento_id} helperText={erroresCampo.departamento_id}>
              {departamentos.map((d) => {
                const val = d.Id ?? d.id
                return <MenuItem key={val} value={val}>{d.nombre || d.Nombre}</MenuItem>
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Turno *" name="turno_id" value={form.turno_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 140 }} error={!!erroresCampo.turno_id} helperText={erroresCampo.turno_id}>
              {turnos.map((t) => {
                const val = t.Id ?? t.id
                return <MenuItem key={val} value={val}>{t.nombre || t.Nombre}</MenuItem>
              })}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Salario diario *"
              name="salario_diario"
              value={form.salario_diario}
              onChange={handleChange}
              error={!!erroresCampo.salario_diario}
              helperText={erroresCampo.salario_diario || `Mínimo $${SALARIO_MINIMO.toFixed(2)}. La nómina usa este salario.`} slotProps={{ htmlInput: { inputMode: 'decimal' }, input: { startAdornment: <Typography color="textSecondary" sx={{ mr: 0.5 }}>$</Typography> } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Tipo de contrato *" name="tipo_contrato_id" value={form.tipo_contrato_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 160 }} error={!!erroresCampo.tipo_contrato_id} helperText={erroresCampo.tipo_contrato_id}>
              {(tiposContrato.length ? tiposContrato : [{ id: 1, nombre: 'INDEFINIDO' }, { id: 2, nombre: 'TEMPORAL' }]).map((t) => {
                const val = t.Id ?? t.id
                const nom = t.nombre || t.Nombre || ''
                return <MenuItem key={val} value={val}>{nom.charAt(0) + nom.slice(1).toLowerCase()}</MenuItem>
              })}
            </TextField>
          </Grid>

          {esEdicion && (
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Estado" name="estado" value={form.estado} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 140 }}>
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
                <TextField select fullWidth label="Rol *" name="rol_id" value={form.rol_id} onChange={handleChange} slotProps={{ select: selectProps }} sx={{ minWidth: 140 }} error={!!erroresCampo.rol_id} helperText={erroresCampo.rol_id}>
                  {roles.map((r) => {
                    const val = r.Id ?? r.id
                    return <MenuItem key={val} value={val}>{r.nombre || r.Nombre}</MenuItem>
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Nombre de usuario *" name="nombre_usuario" slotProps={{ htmlInput: { maxLength: 50 } }} value={form.nombre_usuario} onChange={handleChange} error={!!erroresCampo.nombre_usuario} helperText={erroresCampo.nombre_usuario} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Contraseña *" name="contrasena" slotProps={{ htmlInput: { maxLength: 50 } }} type="password" value={form.contrasena} onChange={handleChange} error={!!erroresCampo.contrasena} helperText={erroresCampo.contrasena} />
              </Grid>
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