import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { guardarParametro, obtenerConfiguracion } from '../api/adminApi'
import EncabezadoPagina from '../components/EncabezadoPagina'
import useApi from '../hooks/useApi'
import { fechaHora } from '../utils/formato'

// Parámetros que se pueden editar y cómo se muestran.
// EMPRESA_ACTIVA_ID no se edita desde aquí: cambiarla afecta todo el sistema.
const EDITABLES = {
  TOLERANCIA_RETARDO_MIN: {
    titulo: 'Tolerancia de retardo',
    ayuda: 'Minutos después de la hora de entrada antes de marcar retardo (0 a 120).',
    unidad: 'min',
  },
  MINUTOS_SESION: {
    titulo: 'Duración de la sesión',
    ayuda: 'Minutos que dura una sesión abierta (5 a 1440). Aplica a los próximos inicios de sesión.',
    unidad: 'min',
  },
}

function Seccion({ icono, titulo, descripcion, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 2, bgcolor: '#E6F4F1', color: '#0F7C86' }}>
          {icono}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{titulo}</Typography>
          <Typography sx={{ fontSize: 13 }} color="text.secondary">
            {descripcion}
          </Typography>
        </Box>
      </Box>
      {children}
    </Paper>
  )
}

// Un parámetro editable con su botón Guardar
function FilaParametro({ parametro, alGuardar }) {
  const info = EDITABLES[parametro.clave]
  const [valor, setValor] = useState(parametro.valor)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const cambio = valor.trim() !== parametro.valor

  const guardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      await alGuardar(parametro.clave, valor.trim())
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <TextField
        label={info.titulo}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        error={Boolean(error)}
        helperText={error ?? `${info.ayuda} Última actualización: ${fechaHora(parametro.actualizadoEn)}`}
        slotProps={{ htmlInput: { inputMode: 'numeric' }, input: { endAdornment: <Typography color="text.secondary">{info.unidad}</Typography> } }}
        sx={{ flex: 1, minWidth: 260 }}
      />
      <Button variant="contained" onClick={guardar} disabled={!cambio || guardando} sx={{ mt: 0.5 }}>
        {guardando ? 'Guardando…' : 'Guardar'}
      </Button>
    </Box>
  )
}

export default function Configuracion() {
  const llamar = useApi()
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)

  const cargar = useCallback(() => {
    setError(null)
    llamar(obtenerConfiguracion)
      .then(setConfig)
      .catch((e) => setError(e.message))
  }, [llamar])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Guarda un parámetro, vuelve a cargar y avisa. Si falla, la excepción llega a la fila.
  const guardar = async (clave, valor) => {
    const respuesta = await llamar(guardarParametro, clave, valor)
    setAviso(respuesta.mensaje)
    const nueva = await llamar(obtenerConfiguracion)
    setConfig(nueva)
  }

  const empresa = config?.empresa

  return (
    <>
      <EncabezadoPagina titulo="Configuración" descripcion="Datos de la empresa y parámetros del sistema." />

      {!config && !error && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" action={<Button onClick={cargar}>Reintentar</Button>} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {config && (
        <Box sx={{ display: 'grid', gap: 2.5, maxWidth: 860 }}>
          <Seccion icono={<ApartmentOutlinedIcon />} titulo="Datos de la empresa" descripcion="Empresa activa del sistema. Solo lectura.">
            {empresa ? (
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                <TextField label="Razón social" value={empresa.razonSocial} disabled />
                <TextField label="Nombre comercial" value={empresa.nombreComercial ?? ''} disabled />
                <TextField label="RFC" value={empresa.rfc} disabled />
                <TextField label="Registro patronal" value={empresa.registroPatronal ?? ''} disabled />
              </Box>
            ) : (
              <Alert severity="warning">No hay una empresa activa configurada.</Alert>
            )}
          </Seccion>

          <Seccion icono={<TuneOutlinedIcon />} titulo="Parámetros del sistema" descripcion="Cada cambio queda registrado en la bitácora.">
            <Box sx={{ display: 'grid', gap: 3 }}>
              {config.parametros
                .filter((p) => EDITABLES[p.clave])
                .map((p) => (
                  <FilaParametro key={`${p.clave}-${p.valor}`} parametro={p} alGuardar={guardar} />
                ))}
            </Box>
          </Seccion>
        </Box>
      )}

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        message={aviso}
      />
    </>
  )
}
