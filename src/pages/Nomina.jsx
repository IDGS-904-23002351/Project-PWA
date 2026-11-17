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
    const [formPeriodo, setFormPeriodo] = useState({ nombre: '', tipoPeriodoId: 1, fechaInicio: '', fechaFin: '', fechaPago: '' });

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

    const handleSubmitPeriodo = async (e) => {
        e.preventDefault();
        try {
            await nominaApi.guardarPeriodo(token, formPeriodo);
            setMensaje({ tipo: 'success', texto: 'Periodo generado correctamente.' });
            setOpenModalPeriodo(false);
            cargarPeriodos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al procesar.' });
        }
    };

    const handleCerrarPeriodo = async (id) => {
        if (!window.confirm('¿Cerrar y pagar este periodo?')) return;
        try {
            await nominaApi.cerrarPeriodo(token, id);
            setMensaje({ tipo: 'success', texto: 'Periodo cerrado correctamente.' });
            cargarPeriodos();
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
            await nominaApi.calcularNominaPeriodo(token, periodoSeleccionadoId);
            setMensaje({ tipo: 'success', texto: 'Cálculo de nómina ejecutado exitosamente.' });
            cargarNominaPorPeriodo(periodoSeleccionadoId);
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
                            sx={{ flexGrow: 1, bgcolor: '#fff', borderRadius: 2 }} 
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} 
                        />
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={() => setOpenModalPeriodo(true)} 
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
                                        <TableCell>{p.fechaInicio?.split('T')[0]}</TableCell>
                                        <TableCell>{p.fechaFin?.split('T')[0]}</TableCell>
                                        <TableCell>{p.fechaPago?.split('T')[0] || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={p.estado} size="small" sx={{ bgcolor: p.estado === 'CERRADO' ? '#ffebee' : '#e0f2f1', color: p.estado === 'CERRADO' ? '#c62828' : '#00796b', fontWeight: 'bold' }} />
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>DÍAS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>PERCEPCIONES</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>DEDUCCIONES</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>NETO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>RECIBO</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listaNominasCalculadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No hay cálculos de nómina para este periodo. Presiona "Calcular Nómina".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listaNominasCalculadas.map((nom) => (
                                        <TableRow key={nom.id} hover>
                                            <TableCell><Typography variant="subtitle2" fontWeight="bold">{nom.nombre} {nom.apellidoPaterno}</Typography></TableCell>
                                            <TableCell>{nom.rfc || 'N/A'}</TableCell>
                                            <TableCell>{nom.diasTrabajados}</TableCell>
                                            <TableCell sx={{ color: '#2e7d32', fontWeight: 'bold' }}>${nom.totalPercepciones?.toFixed(2)}</TableCell>
                                            <TableCell sx={{ color: '#c62828', fontWeight: 'bold' }}>${nom.totalDeducciones?.toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>${nom.sueldoNeto?.toFixed(2)}</TableCell>
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
                <Box component="form" onSubmit={handleSubmitPeriodo}>
                    <DialogContent dividers sx={{ py: 3 }}>
                        <Stack spacing={3}>
                            <TextField 
                                label="Nombre del Periodo" 
                                size="medium" 
                                fullWidth 
                                required 
                                value={formPeriodo.nombre} 
                                onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })} 
                            />
                            
                            <TextField 
                                select
                                label="Tipo de Periodo" 
                                size="medium" 
                                fullWidth 
                                required 
                                value={formPeriodo.tipoPeriodoId} 
                                onChange={(e) => setFormPeriodo({ ...formPeriodo, tipoPeriodoId: parseInt(e.target.value) })}
                            >
                                <MenuItem value={1}>Quincenal</MenuItem>
                                <MenuItem value={2}>Semanal</MenuItem>
                            </TextField>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField label="Fecha Inicio" type="date" size="medium" fullWidth required InputLabelProps={{ shrink: true }} value={formPeriodo.fechaInicio} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })} />
                                <TextField label="Fecha Fin" type="date" size="medium" fullWidth required InputLabelProps={{ shrink: true }} value={formPeriodo.fechaFin} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })} />
                            </Stack>
                            
                            <TextField label="Fecha de Pago" type="date" size="medium" fullWidth InputLabelProps={{ shrink: true }} value={formPeriodo.fechaPago} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaPago: e.target.value })} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, px: 3 }}>
                        <Button onClick={() => setOpenModalPeriodo(false)} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, px: 3 }}>Guardar Periodo</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={openModalDetalle} onClose={() => setOpenModalDetalle(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Desglose de Recibo</DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 500 }}>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CONCEPTO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TIPO</TableCell>
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
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>${det.montoTotal?.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                {detallesRecibo.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
        </Box>
    );
}