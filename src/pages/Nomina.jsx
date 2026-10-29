// src/pages/Nomina.jsx
import React, { useState, useEffect } from 'react';
import {  
    Box, Typography, Button, TextField, InputAdornment,  
    Table, TableBody, TableCell, TableContainer, TableHead,  
    TableRow, Paper, IconButton, Chip, Alert, Dialog,  
    DialogTitle, DialogContent, DialogActions, Tooltip, Tabs, Tab, MenuItem
} from '@mui/material';
import { Search, Add, Lock, ReceiptLong, Calculate } from '@mui/icons-material';
import { nominaApi } from '../api/nominaApi';

export default function Nomina() {
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
        try {
            const data = await nominaApi.listarPeriodos();
            const arr = Array.isArray(data) ? data : [];
            setPeriodos(arr);
            if (arr.length > 0 && !periodoSeleccionadoId) setPeriodoSeleccionadoId(arr[0].id);
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la lista de periodos.' });
        }
    };

    useEffect(() => { cargarPeriodos(); }, []);

    useEffect(() => {
        if (periodoSeleccionadoId) {
            cargarNominaPorPeriodo(periodoSeleccionadoId);
        }
    }, [periodoSeleccionadoId]);

    const cargarNominaPorPeriodo = async (idPeriodo) => {
        try {
            const data = await nominaApi.obtenerNominaPorPeriodo(idPeriodo);
            setListaNominasCalculadas(Array.isArray(data) ? data : []);
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al consultar la nómina del periodo.' });
        }
    };

    const handleSubmitPeriodo = async (e) => {
        e.preventDefault();
        try {
            await nominaApi.guardarPeriodo(formPeriodo);
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
            await nominaApi.cerrarPeriodo(id);
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

        setMensaje({ tipo: '', texto: '' });
        try {
            await nominaApi.calcularNominaPeriodo(periodoSeleccionadoId);
            setMensaje({ tipo: 'success', texto: 'Cálculo de nómina ejecutado exitosamente.' });
            cargarNominaPorPeriodo(periodoSeleccionadoId);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al calcular la nómina.' });
        }
    };

    const abrirDetalleRecibo = async (nom) => {
        setEmpleadoSeleccionado(nom);
        try {
            const data = await nominaApi.obtenerDetalleRecibo(nom.id);
            setDetallesRecibo(Array.isArray(data) ? data : []);
            setOpenModalDetalle(true);
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo obtener el detalle.' });
        }
    };

    const periodosFiltrados = periodos.filter(p => p.nombre?.toLowerCase().includes(buscarPeriodo.toLowerCase()) || p.estado?.toLowerCase().includes(buscarPeriodo.toLowerCase()));

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight="bold" color="#1e293b" mb={1}>Módulo de Nómina</Typography>
            {mensaje.texto && <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={0}>
                <Tabs value={tabActiva} onChange={(e, val) => setTabActiva(val)} sx={{ px: 2 }}>
                    <Tab label="1. Gestión de Periodos" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                    <Tab label="2. Cálculo y Vista Previa" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                </Tabs>
            </Paper>

            {tabActiva === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <TextField placeholder="Buscar periodo..." size="small" value={buscarPeriodo} onChange={(e) => setBuscarPeriodo(e.target.value)} sx={{ width: '400px', bgcolor: '#fff', borderRadius: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModalPeriodo(true)} sx={{ bgcolor: '#00897b', textTransform: 'none', borderRadius: 2 }}>Generar periodo</Button>
                    </Box>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#fff' }}>
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
                                        <TableCell><Chip label={p.estado} size="small" sx={{ bgcolor: p.estado === 'CERRADO' ? '#ffebee' : '#e0f2f1', color: p.estado === 'CERRADO' ? '#c62828' : '#00796b', fontWeight: 'bold' }} /></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Cerrar Periodo">
                                                <span><IconButton size="small" color="error" disabled={p.estado === 'CERRADO'} onClick={() => handleCerrarPeriodo(p.id)}><Lock fontSize="small" /></IconButton></span>
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
                    <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }} elevation={0}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="subtitle1" fontWeight="bold">Seleccionar Periodo:</Typography>
                            <TextField
                                select
                                size="small"
                                value={periodoSeleccionadoId}
                                onChange={(e) => setPeriodoSeleccionadoId(e.target.value)}
                                sx={{ width: '300px', bgcolor: '#fff' }}
                            >
                                {periodos.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.nombre} ({p.estado})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        
                        <Button
                            variant="contained"
                            disabled={esPeriodoCerrado}
                            startIcon={<Calculate />}
                            onClick={handleCalcularNominaPeriodo}
                            sx={{ 
                                bgcolor: esPeriodoCerrado ? undefined : '#1e3a8a', 
                                '&:hover': { bgcolor: '#1e40af' }, 
                                textTransform: 'none', 
                                borderRadius: 2 
                            }}
                        >
                            {esPeriodoCerrado ? 'Periodo Cerrado' : 'Calcular Nómina del Periodo'}
                        </Button>
                    </Paper>

                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#fff' }}>
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
                                {listaNominasCalculadas.map((nom) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Modal para Generar Periodo actualizado con el Selector de Tipo de Periodo */}
            <Dialog open={openModalPeriodo} onClose={() => setOpenModalPeriodo(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Generar Periodo</DialogTitle>
                <Box component="form" onSubmit={handleSubmitPeriodo}>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField 
                                label="Nombre del Periodo" 
                                size="small" 
                                fullWidth 
                                required 
                                value={formPeriodo.nombre} 
                                onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })} 
                            />
                            
                            {/* Selector de Tipo de Periodo (Quincenal o Semanal) */}
                            <TextField 
                                select
                                label="Tipo de Periodo" 
                                size="small" 
                                fullWidth 
                                required 
                                value={formPeriodo.tipoPeriodoId} 
                                onChange={(e) => setFormPeriodo({ ...formPeriodo, tipoPeriodoId: parseInt(e.target.value) })}
                            >
                                <MenuItem value={1}>Quincenal</MenuItem>
                                <MenuItem value={2}>Semanal</MenuItem>
                            </TextField>

                            <TextField label="Inicio" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }} value={formPeriodo.fechaInicio} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })} />
                            <TextField label="Fin" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }} value={formPeriodo.fechaFin} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })} />
                            <TextField label="Pago" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formPeriodo.fechaPago} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaPago: e.target.value })} />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModalPeriodo(false)}>Cancelar</Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: '#00897b' }}>Guardar</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={openModalDetalle} onClose={() => setOpenModalDetalle(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Desglose de Recibo</DialogTitle>
                <DialogContent dividers>
                    <Table size="small">
                        <TableHead><TableRow><TableCell>CÓDIGO</TableCell><TableCell>CONCEPTO</TableCell><TableCell>TIPO</TableCell><TableCell>TOTAL</TableCell></TableRow></TableHead>
                        <TableBody>
                            {detallesRecibo.map((det) => (
                                <TableRow key={det.id}>
                                    <TableCell>{det.codigo}</TableCell>
                                    <TableCell>{det.conceptoNombre}</TableCell>
                                    <TableCell><Chip label={det.tipoConcepto} size="small" color={det.tipoConcepto === 'PERCEPCION' ? 'success' : 'error'} /></TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>${det.montoTotal?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenModalDetalle(false)} variant="contained">Cerrar</Button></DialogActions>
            </Dialog>
        </Box>
    );
}