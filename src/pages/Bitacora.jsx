import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

// Si el texto es JSON, se muestra con un renglón por dato; si no, tal cual
function TextoCambio({ valor }) {
  if (!valor) return <Typography color="text.secondary">—</Typography>
  let mostrar = valor
  try {
    const objeto = JSON.parse(valor)
    if (objeto && typeof objeto === 'object') {
      mostrar = Object.entries(objeto).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n')
    }
  } catch {
    // no es JSON
  }
  return (
    <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
      {mostrar}
    </Box>
  )
}

export default function Bitacora() {
  const llamar = useApi()
  // Movimiento abierto en la ventana de detalle (clic en un renglón)
  const [detalle, setDetalle] = useState(null)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [buscarAplicado, setBuscarAplicado] = useState('')
  const [pagina, setPagina] = useState(0) 
  const [tamano, setTamano] = useState(20)
  const [datos, setDatos] = useState({ registros: [], total: 0 })
  const [opciones, setOpciones] = useState({ acciones: [], usuarios: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    llamar(obtenerFiltrosBitacora)
      .then(setOpciones)
      .catch(() => {}) 
  }, [llamar])

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
                  <TableRow key={r.id} hover onClick={() => setDetalle(r)} sx={{ cursor: 'pointer' }}>
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

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pt: 1 }}>
          Haz clic en un renglón para ver el detalle del cambio.
        </Typography>

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

      <Dialog open={Boolean(detalle)} onClose={() => setDetalle(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {detalle && etiquetaAccion(detalle.accion)}
          <Typography variant="body2" color="text.secondary">
            {detalle && fechaHora(detalle.fechaHora)} · {detalle?.usuario}{detalle?.nombreUsuario ? ` (${detalle.nombreUsuario})` : ''}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Entidad</Typography>
          <Typography sx={{ mb: 2 }}>
            {detalle?.tablaAfectada ? `${detalle.tablaAfectada}${detalle.registroId ? ` #${detalle.registroId}` : ''}` : '—'}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Antes</Typography>
          <TextoCambio valor={detalle?.datosAntes} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>Después</Typography>
          <TextoCambio valor={detalle?.datosDespues} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetalle(null)} sx={{ textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
