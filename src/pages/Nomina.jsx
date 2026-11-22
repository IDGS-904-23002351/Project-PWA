import React, { useState, useEffect } from 'react';
import {  
    Box, Typography, Button, TextField, InputAdornment,  
    Table, TableBody, TableCell, TableContainer, TableHead,  
    TableRow, Paper, IconButton, Chip, Alert, Dialog,  
    DialogTitle, DialogContent, DialogActions, Tooltip, Tabs, Tab, MenuItem,
    useMediaQuery, useTheme, Stack
} from '@mui/material';
import { Search, Add, Lock, ReceiptLong, Calculate } from '@mui/icons-material';
import { nominaApi } from '../api/nominaApi';
import { useAuth } from '../context/AuthContext';
import ConfirmarDialog from '../components/ConfirmarDialog';
import EncabezadoPagina from '../components/EncabezadoPagina';

export default function Nomina() {
    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
    const { sesion } = useAuth();
    const token = sesion?.token;

    const [tabActiva, setTabActiva] = useState(0);
    const [periodos, setPeriodos] = useState([]);
    const [buscarPeriodo, setBuscarPeriodo] = useState('');
    const [openModalPeriodo, setOpenModalPeriodo] = useState(false);
    // Los id son los de la tabla TipoPeriodo: 1 SEMANAL, 2 QUINCENAL, 3 MENSUAL
    const periodoVacio = { nombre: '', tipoPeriodoId: 2, fechaInicio: '', fechaFin: '', fechaPago: '' };
    const [formPeriodo, setFormPeriodo] = useState(periodoVacio);

    const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState('');
    const [listaNominasCalculadas, setListaNominasCalculadas] = useState([]);
    
    const [openModalDetalle, setOpenModalDetalle] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [detallesRecibo, setDetallesRecibo] = useState([]);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const cargarPeriodos = async () => {
        if (!token) return;
        try {
            const data = await nominaApi.listarPeriodos(token);
            const arr = Array.isArray(data) ? data : [];
            setPeriodos(arr);
            if (arr.length > 0 && !periodoSeleccionadoId) setPeriodoSeleccionadoId(arr[0].id);
        } catch (error) {
            console.error("Error al cargar periodos:", error);
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la lista de periodos.' });
        }
    };

    useEffect(() => { cargarPeriodos(); }, [token]);

    useEffect(() => {
        if (periodoSeleccionadoId && token) {
            cargarNominaPorPeriodo(periodoSeleccionadoId);
        }
    }, [periodoSeleccionadoId, token]);

    const cargarNominaPorPeriodo = async (idPeriodo) => {
        try {
            const data = await nominaApi.obtenerNominaPorPeriodo(token, idPeriodo);
            setListaNominasCalculadas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar nómina del periodo:", error);
            setMensaje({ tipo: 'error', texto: 'Error al consultar la nómina del periodo.' });
        }
    };

    // Errores por campo y error del servidor dentro de la ventana (antes: burbuja del navegador
    // y el error salía en la página, detrás de la ventana)
    const [erroresPeriodo, setErroresPeriodo] = useState({});
    const [errorPeriodo, setErrorPeriodo] = useState('');
    const [guardandoPeriodo, setGuardandoPeriodo] = useState(false);

    const abrirNuevoPeriodo = () => {
        setFormPeriodo(periodoVacio);
        setErroresPeriodo({});
        setErrorPeriodo('');
        setOpenModalPeriodo(true);
    };

    const cambiarPeriodo = (campo, valor) => {
        setFormPeriodo((p) => ({ ...p, [campo]: valor }));
        setErroresPeriodo((p) => ({ ...p, [campo]: '' }));
    };

    // Mismas reglas que sp_GenerarPeriodoNominaAutomatico
    const validarPeriodo = () => {
        const f = formPeriodo;
        const e = {};
        if (!f.nombre.trim()) e.nombre = 'Escribe el nombre del periodo.';
        if (!f.fechaInicio) e.fechaInicio = 'Elige la fecha de inicio.';
        if (!f.fechaFin) e.fechaFin = 'Elige la fecha de fin.';
        if (f.fechaInicio && f.fechaFin) {
            const dias = Math.round((new Date(f.fechaFin) - new Date(f.fechaInicio)) / 86400000) + 1;
            if (dias < 1) e.fechaFin = 'La fecha de fin no puede ser antes que la de inicio.';
            else if (f.tipoPeriodoId === 1 && dias !== 7) e.fechaFin = `Un periodo semanal dura 7 días (este tiene ${dias}).`;
            else if (f.tipoPeriodoId === 2 && (dias < 13 || dias > 16)) e.fechaFin = `Un periodo quincenal dura de 13 a 16 días (este tiene ${dias}).`;
            else if (f.tipoPeriodoId === 3 && (dias < 28 || dias > 31)) e.fechaFin = `Un periodo mensual dura de 28 a 31 días (este tiene ${dias}).`;
        }
        if (f.fechaPago && f.fechaFin && f.fechaPago < f.fechaFin) e.fechaPago = 'La fecha de pago no puede ser antes de que termine el periodo.';
        return e;
    };

    const handleSubmitPeriodo = async (e) => {
        e.preventDefault();
        setErrorPeriodo('');
        const errores = validarPeriodo();
        setErroresPeriodo(errores);
        if (Object.keys(errores).length > 0) return;

        setGuardandoPeriodo(true);
        try {
            // La fecha de pago es opcional: vacía se manda como null (un texto vacío
            // no se puede convertir a fecha y el servidor rechazaba todo el periodo).
            await nominaApi.guardarPeriodo(token, {
                ...formPeriodo,
                nombre: formPeriodo.nombre.trim(),
                fechaPago: formPeriodo.fechaPago || null,
            });
            setMensaje({ tipo: 'success', texto: 'Periodo generado correctamente.' });
            setOpenModalPeriodo(false);
            setFormPeriodo(periodoVacio);
            cargarPeriodos();
        } catch (error) {
            setErrorPeriodo(error.message || 'Error al procesar.');
        } finally {
            setGuardandoPeriodo(false);
        }
    };

    const [confirmar, setConfirmar] = useState(null);

    const handleCerrarPeriodo = (id) => {
        const periodo = periodos.find((p) => p.id === id);
        setConfirmar({
            titulo: 'Cerrar periodo',
            mensaje: `¿Cerrar "${periodo?.nombre || 'este periodo'}"? Ya no se podrá recalcular y los empleados verán su recibo en la app.`,
            textoBoton: 'Cerrar periodo',
            accion: () => cerrarPeriodo(id),
        });
    };

    const cerrarPeriodo = async (id) => {
        try {
            await nominaApi.cerrarPeriodo(token, id);
            setMensaje({ tipo: 'success', texto: 'Periodo cerrado correctamente. Los empleados ya pueden ver su recibo en la app.' });
            cargarPeriodos();
            if (periodoSeleccionadoId) cargarNominaPorPeriodo(periodoSeleccionadoId);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al cerrar.' });
        }
    };

    const periodoActual = periodos.find(p => p.id === periodoSeleccionadoId);
    const esPeriodoCerrado = periodoActual?.estado === 'CERRADO';

    const handleCalcularNominaPeriodo = async () => {
        if (!periodoSeleccionadoId) {
            setMensaje({ tipo: 'error', texto: 'Selecciona un periodo válido primero.' });
            return;
        }

        if (esPeriodoCerrado) {
            setMensaje({ tipo: 'error', texto: 'No se puede calcular la nómina de un periodo que ya está cerrado.' });
            return;
        }

        setMensaje({ tipo: '', texto: 'Calculando...' });
        try {
            const r = await nominaApi.calcularNominaPeriodo(token, periodoSeleccionadoId);
            setMensaje({ tipo: 'success', texto: r?.mensaje || 'Cálculo de nómina ejecutado exitosamente.' });
            cargarNominaPorPeriodo(periodoSeleccionadoId);
            cargarPeriodos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al calcular la nómina.' });
        }
    };

    const abrirDetalleRecibo = async (nom) => {
        setEmpleadoSeleccionado(nom);
        try {
            const data = await nominaApi.obtenerDetalleRecibo(token, nom.id);
            setDetallesRecibo(Array.isArray(data) ? data : []);
            setOpenModalDetalle(true);
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo obtener el detalle.' });
        }
    };

    const dinero = (v) => `$${Number(v ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const colorEstado = (estado) => estado === 'CERRADO'
        ? { bgcolor: '#ffebee', color: '#c62828' }
        : estado === 'CALCULADO'
            ? { bgcolor: '#e3f2fd', color: '#1565c0' }
            : { bgcolor: '#e0f2f1', color: '#00796b' };

    const periodosFiltrados = periodos.filter(p => p.nombre?.toLowerCase().includes(buscarPeriodo.toLowerCase()) || p.estado?.toLowerCase().includes(buscarPeriodo.toLowerCase()));

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
            <EncabezadoPagina
                titulo="Nómina"
                descripcion="Genera periodos, calcula la nómina y consulta los recibos del personal."
            />
            {mensaje.texto && <Alert severity={mensaje.tipo || 'info'} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={0}>
                <Tabs 
                    value={tabActiva} 
                    onChange={(e, val) => setTabActiva(val)} 
                    variant={isMdDown ? "fullWidth" : "standard"}
                    sx={{ px: 2 }}
                >
                    <Tab label="1. Gestión de Periodos" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                    <Tab label="2. Cálculo y Vista Previa" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                </Tabs>
            </Paper>

            {tabActiva === 0 && (
                <Box>
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2} 
                        mb={3} 
                        sx={{ width: '100%' }}
                    >
                        <TextField 
                            placeholder="Buscar periodo..." 
                            size="small" 
                            value={buscarPeriodo} 
                            onChange={(e) => setBuscarPeriodo(e.target.value)} 
                            sx={{ flexGrow: 1, bgcolor: '#fff', borderRadius: 2 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} 
                        />
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={abrirNuevoPeriodo} 
                            sx={{ 
                                bgcolor: '#00897b', 
                                textTransform: 'none', 
                                borderRadius: 2, 
                                whiteSpace: 'nowrap',
                                px: 4,
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Generar periodo
                        </Button>
                    </Stack>
                    
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>NOMBRE</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TIPO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>INICIO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>FIN</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>PAGO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ESTATUS</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {periodosFiltrados.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell><Typography variant="subtitle2" fontWeight="bold">{p.nombre}</Typography></TableCell>
                                        <TableCell>{p.tipoPeriodoNombre}</TableCell>
                                        <TableCell>{p.fechaInicio?.split('T')[0]}</TableCell>
                                        <TableCell>{p.fechaFin?.split('T')[0]}</TableCell>
                                        <TableCell>{p.fechaPago?.split('T')[0] || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={p.estado} size="small" sx={{ ...colorEstado(p.estado), fontWeight: 'bold' }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Cerrar Periodo">
                                                <span>
                                                    <IconButton size="small" color="error" disabled={p.estado === 'CERRADO'} onClick={() => handleCerrarPeriodo(p.id)}>
                                                        <Lock fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {tabActiva === 1 && (
                <Box>
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 3, width: '100%' }} elevation={0}>
                        <Stack 
                            direction={{ xs: 'column', md: 'row' }} 
                            alignItems={{ xs: 'stretch', md: 'center' }} 
                            spacing={2}
                            sx={{ width: '100%' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                                Seleccionar Periodo:
                            </Typography>
                            
                            <TextField
                                select
                                size="small"
                                value={periodoSeleccionadoId}
                                onChange={(e) => setPeriodoSeleccionadoId(e.target.value)}
                                sx={{ flexGrow: 1, bgcolor: '#fff' }} 
                            >
                                {periodos.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.nombre} ({p.estado})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="contained"
                                disabled={esPeriodoCerrado}
                                startIcon={<Calculate />}
                                onClick={handleCalcularNominaPeriodo}
                                sx={{ 
                                    bgcolor: esPeriodoCerrado ? undefined : 'primary.main', 
                                    '&:hover': { bgcolor: '#1e40af' }, 
                                    textTransform: 'none', 
                                    borderRadius: 1,
                                    whiteSpace: 'nowrap',
                                    height: '40px',
                                    width: { xs: '100%', md: 'auto' }
                                }}
                            >
                                {esPeriodoCerrado ? 'Periodo Cerrado' : 'Calcular Nómina'}
                            </Button>
                        </Stack>
                    </Paper>

                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>EMPLEADO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>RFC</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>DÍAS PAGADOS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>FALTAS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>RETARDOS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>PERCEPCIONES</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>DEDUCCIONES</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>NETO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>RECIBO</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listaNominasCalculadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No hay cálculos de nómina para este periodo. Presiona "Calcular Nómina".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listaNominasCalculadas.map((nom) => (
                                        <TableRow key={nom.id} hover>
                                            <TableCell><Typography variant="subtitle2" fontWeight="bold">{nom.nombre} {nom.apellidoPaterno}</Typography></TableCell>
                                            <TableCell>{nom.rfc || 'N/A'}</TableCell>
                                            <TableCell>{nom.diasPagados}</TableCell>
                                            <TableCell>{nom.faltasTotales}</TableCell>
                                            <TableCell>{nom.retardosTotales}</TableCell>
                                            <TableCell sx={{ color: '#2e7d32', fontWeight: 'bold' }}>{dinero(nom.totalPercepciones)}</TableCell>
                                            <TableCell sx={{ color: '#c62828', fontWeight: 'bold' }}>{dinero(nom.totalDeducciones)}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{dinero(nom.sueldoNeto)}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Ver Recibo">
                                                    <IconButton size="small" color="info" onClick={() => abrirDetalleRecibo(nom)}><ReceiptLong fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            <Dialog open={openModalPeriodo} onClose={() => setOpenModalPeriodo(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Generar Periodo</DialogTitle>
                <Box component="form" onSubmit={handleSubmitPeriodo} noValidate>
                    <DialogContent dividers sx={{ py: 3 }}>
                        <Stack spacing={3}>
                            {errorPeriodo && <Alert severity="error">{errorPeriodo}</Alert>}
                            <TextField 
                                label="Nombre del Periodo *" 
                                size="medium" 
                                fullWidth 
                                value={formPeriodo.nombre} 
                                onChange={(e) => cambiarPeriodo('nombre', e.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }}
                                error={!!erroresPeriodo.nombre} helperText={erroresPeriodo.nombre}
                            />
                            
                            <TextField 
                                select
                                label="Tipo de Periodo *" 
                                size="medium" 
                                fullWidth 
                                value={formPeriodo.tipoPeriodoId} 
                                onChange={(e) => { cambiarPeriodo('tipoPeriodoId', parseInt(e.target.value)); setErroresPeriodo((p) => ({ ...p, fechaFin: '' })); }}
                                helperText="Semanal: 7 días · Quincenal: 13 a 16 días · Mensual: 28 a 31 días"
                            >
                                <MenuItem value={1}>Semanal</MenuItem>
                                <MenuItem value={2}>Quincenal</MenuItem>
                                <MenuItem value={3}>Mensual</MenuItem>
                            </TextField>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField label="Fecha Inicio *" type="date" size="medium" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formPeriodo.fechaInicio} onChange={(e) => cambiarPeriodo('fechaInicio', e.target.value)} error={!!erroresPeriodo.fechaInicio} helperText={erroresPeriodo.fechaInicio} />
                                <TextField label="Fecha Fin *" type="date" size="medium" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formPeriodo.fechaFin} onChange={(e) => cambiarPeriodo('fechaFin', e.target.value)} error={!!erroresPeriodo.fechaFin} helperText={erroresPeriodo.fechaFin} />
                            </Stack>
                            
                            <TextField label="Fecha de Pago" type="date" size="medium" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formPeriodo.fechaPago} onChange={(e) => cambiarPeriodo('fechaPago', e.target.value)} error={!!erroresPeriodo.fechaPago} helperText={erroresPeriodo.fechaPago} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, px: 3 }}>
                        <Button onClick={() => setOpenModalPeriodo(false)} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={guardandoPeriodo} sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, px: 3 }}>{guardandoPeriodo ? 'Guardando...' : 'Guardar Periodo'}</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={openModalDetalle} onClose={() => setOpenModalDetalle(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>
                    Desglose de Recibo
                    {empleadoSeleccionado && (
                        <Typography variant="body2" color="text.secondary">
                            {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellidoPaterno} · {periodoActual?.nombre} · {empleadoSeleccionado.diasPagados} días pagados
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 500 }}>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CONCEPTO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TIPO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CÁLCULO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detallesRecibo.map((det) => (
                                    <TableRow key={det.id} hover>
                                        <TableCell>{det.codigo}</TableCell>
                                        <TableCell>{det.conceptoNombre}</TableCell>
                                        <TableCell>
                                            <Chip label={det.tipoConcepto} size="small" color={det.tipoConcepto === 'PERCEPCION' ? 'success' : 'error'} sx={{ fontWeight: 'bold' }} />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{det.formulaAplicada}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: det.tipoConcepto === 'PERCEPCION' ? undefined : '#c62828' }}>
                                            {det.tipoConcepto === 'PERCEPCION' ? '' : '- '}{dinero(det.montoTotal)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {detallesRecibo.length > 0 && empleadoSeleccionado && (
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={4} align="right">Total percepciones</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{dinero(empleadoSeleccionado.totalPercepciones)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={4} align="right">Total deducciones</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#c62828' }}>- {dinero(empleadoSeleccionado.totalDeducciones)}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>Neto a pagar</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 16 }}>{dinero(empleadoSeleccionado.sueldoNeto)}</TableCell>
                                        </TableRow>
                                    </>
                                )}
                                {detallesRecibo.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No hay conceptos registrados en este recibo.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenModalDetalle(false)} variant="contained" sx={{ bgcolor: '#0f766e' }}>Cerrar</Button></DialogActions>
            </Dialog>

            <ConfirmarDialog datos={confirmar} onCerrar={() => setConfirmar(null)} />
        </Box>
    );
}