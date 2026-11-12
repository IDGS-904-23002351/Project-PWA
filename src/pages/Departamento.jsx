// src/pages/Departamento.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, Button, TextField, InputAdornment, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, IconButton, Chip, Alert, Dialog, 
    DialogTitle, DialogContent, DialogActions, Tooltip, Stack, CircularProgress 
} from '@mui/material';
import { Search, Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { departamentoApi } from '../api/departamentoApi';
import EncabezadoPagina from '../components/EncabezadoPagina';

export default function Departamentos() {
    const { sesion } = useAuth();
    const [departamentos, setDepartamentos] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const [openModal, setOpenModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formDep, setFormDep] = useState({ id: 0, nombre: '', descripcion: '', estado: 'ACTIVO' });

    const cargarDepartamentos = useCallback(async () => {
        if (!sesion?.token) return;
        setLoading(true);
        try {
            const data = await departamentoApi.listar(sesion.token);
            setDepartamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la lista de departamentos.' });
        } finally {
            setLoading(false);
        }
    }, [sesion?.token]);

    useEffect(() => { 
        cargarDepartamentos(); 
    }, [cargarDepartamentos]);

    const abrirNuevo = () => {
        setEditando(false);
        setFormDep({ id: 0, nombre: '', descripcion: '', estado: 'ACTIVO' });
        setOpenModal(true);
    };

    const abrirEditar = (dep) => {
        setEditando(true);
        setFormDep({ id: dep.id, nombre: dep.nombre || '', descripcion: dep.descripcion || '', estado: dep.estado || 'ACTIVO' });
        setOpenModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sesion?.token) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            if (editando) {
                await departamentoApi.actualizar(sesion.token, formDep.id, formDep);
                setMensaje({ tipo: 'success', texto: 'Departamento actualizado correctamente.' });
            } else {
                await departamentoApi.guardar(sesion.token, formDep);
                setMensaje({ tipo: 'success', texto: 'Departamento registrado correctamente.' });
            }
            setOpenModal(false);
            cargarDepartamentos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al procesar la solicitud.' });
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este departamento?') || !sesion?.token) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            await departamentoApi.eliminar(sesion.token, id);
            setMensaje({ tipo: 'success', texto: 'Departamento eliminado correctamente.' });
            cargarDepartamentos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al eliminar el departamento.' });
        }
    };

    const departamentosFiltrados = departamentos.filter((dep) => 
        dep.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
        dep.descripcion?.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
            <EncabezadoPagina
                titulo="Departamentos"
                descripcion={`Administra la información de los ${departamentos.length} departamentos de la organización.`}
                acciones={
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={abrirNuevo}
                        sx={{
                            bgcolor: '#0f766e',
                            '&:hover': { bgcolor: '#115e59' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 2.5,
                        }}
                    >
                        Nuevo departamento
                    </Button>
                }
            />

            {mensaje.texto && <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
                <TextField
                    placeholder="Buscar por nombre o descripción..."
                    size="small"
                    fullWidth
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, bgcolor: 'white', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>NOMBRE</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>DESCRIPCIÓN</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ESTATUS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem',textAlign:'center' }}>ACCIONES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} sx={{ color: '#0f766e' }} />
                                </TableCell>
                            </TableRow>
                        ) : departamentosFiltrados.map((dep) => (
                            <TableRow key={dep.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                        {dep.nombre}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {dep.descripcion || 'Sin descripción'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={dep.estado || 'ACTIVO'} 
                                        size="small" 
                                        sx={{
                                            bgcolor: (dep.estado || 'ACTIVO') === 'ACTIVO' ? '#ccfbf1' : '#fee2e2',
                                            color: (dep.estado || 'ACTIVO') === 'ACTIVO' ? '#0f766e' : '#991b1b',
                                            fontWeight: 600,
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => abrirEditar(dep)}
                                                sx={{ color: '#0f766e', '&:hover': { bgcolor: '#ccfbf1' } }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleEliminar(dep.id)}
                                                sx={{ '&:hover': { bgcolor: '#fee2e2' } }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {departamentosFiltrados.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No se encontraron departamentos.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editando ? 'Editar Departamento' : 'Registrar Nuevo Departamento'}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={2.5}>
                            <TextField 
                                label="Nombre del Departamento" 
                                size="small" 
                                required 
                                value={formDep.nombre} 
                                onChange={(e) => setFormDep({ ...formDep, nombre: e.target.value })} 
                            />
                            <TextField 
                                label="Descripción" 
                                size="small" 
                                multiline 
                                rows={3} 
                                value={formDep.descripcion} 
                                onChange={(e) => setFormDep({ ...formDep, descripcion: e.target.value })} 
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpenModal(false)} color="inherit" sx={{ textTransform: 'none' }}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{
                                bgcolor: '#0f766e',
                                '&:hover': { bgcolor: '#115e59' },
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                            }}
                        >
                            {editando ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}