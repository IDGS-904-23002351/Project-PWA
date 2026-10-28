import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { listarBitacora, obtenerFiltrosBitacora } from '../api/adminApi'
import EncabezadoPagina from '../components/EncabezadoPagina'
import useApi from '../hooks/useApi'
import { colorAccion, etiquetaAccion } from '../utils/bitacora'
import { fechaHora } from '../utils/formato'

const FILTROS_VACIOS = { buscar: '', usuarioId: '', accion: '', desde: '', hasta: '' }

// Resumen de lo que cambió: "antes → después" (solo si la acción guardó esos datos)
function Cambio({ antes, despues }) {
  if (!antes && !despues) return <Typography color="text.secondary">—</Typography>
  const texto = antes && despues ? `${antes} → ${despues}` : antes || despues
  return (
    <Tooltip title={texto}>
      <Typography noWrap sx={{ maxWidth: 260, fontSize: 14 }}>
        {texto}
      </Typography>
    </Tooltip>
  )
}

export default function Bitacora() {
  const llamar = useApi()
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [buscarAplicado, setBuscarAplicado] = useState('')
  const [pagina, setPagina] = useState(0) // MUI cuenta desde 0, el servidor desde 1
  const [tamano, setTamano] = useState(20)
  const [datos, setDatos] = useState({ registros: [], total: 0 })
  const [opciones, setOpciones] = useState({ acciones: [], usuarios: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Las opciones de los filtros se piden una sola vez
  useEffect(() => {
    llamar(obtenerFiltrosBitacora)
      .then(setOpciones)
      .catch(() => {}) // si fallan, los filtros quedan vacíos pero la tabla sigue funcionando
  }, [llamar])

  // El texto de búsqueda se aplica medio segundo después de dejar de escribir
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscarAplicado(filtros.buscar)
      setPagina(0)
    }, 500)
    return () => clearTimeout(temporizador)
  }, [filtros.buscar])

  const cargar = useCallback(() => {
    setCargando(true)
    setError(null)
    llamar(listarBitacora, {
      buscar: buscarAplicado,
      usuarioId: filtros.usuarioId,
      accion: filtros.accion,
      desde: filtros.desde,
      hasta: filtros.hasta,
      pagina: pagina + 1,
      tamano,
    })
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [llamar, buscarAplicado, filtros.usuarioId, filtros.accion, filtros.desde, filtros.hasta, pagina, tamano])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Cambia un filtro y regresa a la primera página
  const cambiar = (campo) => (e) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: e.target.value }))
    setPagina(0)
  }

  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <>
      <EncabezadoPagina
        titulo="Bitácora"
        descripcion="Registro de las acciones realizadas en el sistema."
      />

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1.5fr 1.5fr 1fr 1fr' }, mb: 2.5 }}>
          <TextField
            size="small"
            placeholder="Buscar…"
            value={filtros.buscar}
            onChange={cambiar('buscar')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select size="small" label="Usuario" value={filtros.usuarioId} onChange={cambiar('usuarioId')}>
            <MenuItem value="">Todos</MenuItem>
            {opciones.usuarios.map((u) => (
              <MenuItem key={u.usuarioId} value={u.usuarioId}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Acción" value={filtros.accion} onChange={cambiar('accion')}>
            <MenuItem value="">Todas</MenuItem>
            {opciones.acciones.map((a) => (
              <MenuItem key={a} value={a}>
                {etiquetaAccion(a)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={filtros.desde}
            onChange={cambiar('desde')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={filtros.hasta}
            onChange={cambiar('hasta')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        {hayFiltros && (
          <Button size="small" onClick={() => { setFiltros(FILTROS_VACIOS); setBuscarAplicado(''); setPagina(0) }} sx={{ mb: 2 }}>
            Limpiar filtros
          </Button>
        )}

        {error && (
          <Alert severity="error" action={<Button onClick={cargar}>Reintentar</Button>} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 13 } }}>
                <TableCell>Fecha y hora</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Cambio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}

              {!cargando &&
                datos.registros.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaHora(r.fechaHora)}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.usuario}</Typography>
                      {r.nombreUsuario && (
                        <Typography sx={{ fontSize: 12 }} color="text.secondary">
                          {r.nombreUsuario}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={etiquetaAccion(r.accion)} color={colorAccion(r.accion)} variant="outlined" />
                    </TableCell>
                    <TableCell>{r.tablaAfectada ? `${r.tablaAfectada}${r.registroId ? ` #${r.registroId}` : ''}` : '—'}</TableCell>
                    <TableCell>
                      <Cambio antes={r.datosAntes} despues={r.datosDespues} />
                    </TableCell>
                  </TableRow>
                ))}

              {!cargando && !error && datos.registros.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No hay registros con esos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={datos.total}
          page={pagina}
          onPageChange={(_, nueva) => setPagina(nueva)}
          rowsPerPage={tamano}
          onRowsPerPageChange={(e) => {
            setTamano(Number(e.target.value))
            setPagina(0)
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>
    </>
  )
}
