// src/pages/Departamentos.jsx
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, InputAdornment, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, IconButton, Chip, Alert, Dialog, 
    DialogTitle, DialogContent, DialogActions, Tooltip 
} from '@mui/material';
import { Search, Add, Edit, Delete } from '@mui/icons-material';
import { departamentoApi } from '../api/departamentoApi';

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Estados para el Modal (Crear / Editar)
    const [openModal, setOpenModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formDep, setFormDep] = useState({ id: 0, nombre: '', descripcion: '', estado: 'ACTIVO' });

    // Cargar departamentos
    const cargarDepartamentos = async () => {
        setLoading(true);
        try {
            const data = await departamentoApi.listar();
            setDepartamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la lista de departamentos.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDepartamentos(); }, []);

    // Abrir Modal para Crear
    const abrirNuevo = () => {
        setEditando(false);
        setFormDep({ id: 0, nombre: '', descripcion: '', estado: 'ACTIVO' });
        setOpenModal(true);
    };

    // Abrir Modal para Editar
    const abrirEditar = (dep) => {
        setEditando(true);
        setFormDep({ id: dep.id, nombre: dep.nombre || '', descripcion: dep.descripcion || '', estado: dep.estado || 'ACTIVO' });
        setOpenModal(true);
    };

    // Guardar o Actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });
        try {
            if (editando) {
                await departamentoApi.actualizar(formDep.id, formDep);
                setMensaje({ tipo: 'success', texto: 'Departamento actualizado correctamente.' });
            } else {
                await departamentoApi.guardar(formDep);
                setMensaje({ tipo: 'success', texto: 'Departamento registrado correctamente.' });
            }
            setOpenModal(false);
            cargarDepartamentos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al procesar la solicitud.' });
        }
    };

    // Eliminar Departamento
    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este departamento?')) return;
        setMensaje({ tipo: '', texto: '' });
        try {
            await departamentoApi.eliminar(id);
            setMensaje({ tipo: 'success', texto: 'Departamento eliminado correctamente.' });
            cargarDepartamentos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al eliminar el departamento.' });
        }
    };

    // Filtrar localmente
    const departamentosFiltrados = departamentos.filter((dep) => 
        dep.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
        dep.descripcion?.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Departamentos</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Administra la información de los {departamentos.length} departamentos de la organización.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={abrirNuevo}
                    sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2 }}
                >
                    Nuevo departamento
                </Button>
            </Box>

            {mensaje.texto && <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            {/* Barra de Búsqueda */}
            <Paper sx={{ p: 1, mb: 3, display: 'flex', gap: 2, borderRadius: 3 }} elevation={0}>
                <TextField
                    placeholder="Buscar por nombre o descripción..."
                    variant="outlined"
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
                        sx: { borderRadius: 2, bgcolor: '#fff' }
                    }}
                />
            </Paper>

            {/* Tabla de Departamentos */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#fff' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>NOMBRE</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>DESCRIPCIÓN</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>ESTATUS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>ACCIONES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departamentosFiltrados.map((dep) => (
                            <TableRow key={dep.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
                                        {dep.nombre}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="textSecondary">
                                        {dep.descripcion || 'Sin descripción'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={dep.estado || 'ACTIVO'} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: (dep.estado || 'ACTIVO') === 'ACTIVO' ? '#e0f2f1' : '#ffebee', 
                                            color: (dep.estado || 'ACTIVO') === 'ACTIVO' ? '#00796b' : '#c62828',
                                            fontWeight: 'bold'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar">
                                        <IconButton size="small" color="primary" onClick={() => abrirEditar(dep)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton size="small" color="error" onClick={() => handleEliminar(dep.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {departamentosFiltrados.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        No se encontraron departamentos.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Crear / Editar */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {editando ? 'Editar Departamento' : 'Registrar Nuevo Departamento'}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <TextField 
                                label="Nombre del Departamento" 
                                size="small" 
                                fullWidth 
                                required 
                                value={formDep.nombre} 
                                onChange={(e) => setFormDep({ ...formDep, nombre: e.target.value })} 
                            />
                            <TextField 
                                label="Descripción" 
                                size="small" 
                                fullWidth 
                                multiline 
                                rows={3} 
                                value={formDep.descripcion} 
                                onChange={(e) => setFormDep({ ...formDep, descripcion: e.target.value })} 
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModal(false)} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2 }}>
                            {editando ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}