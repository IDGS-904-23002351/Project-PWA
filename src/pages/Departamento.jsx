// src/pages/Departamento.jsx
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, InputAdornment, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, IconButton, Chip, Alert, Dialog, 
    DialogTitle, DialogContent, DialogActions, Tooltip, Stack 
} from '@mui/material';
import { Search, Add, Edit, Delete } from '@mui/icons-material';
import { departamentoApi } from '../api/departamentoApi';
import EncabezadoPagina from '../components/EncabezadoPagina';

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const [openModal, setOpenModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formDep, setFormDep] = useState({ id: 0, nombre: '', descripcion: '', estado: 'ACTIVO' });

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

    const departamentosFiltrados = departamentos.filter((dep) => 
        dep.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
        dep.descripcion?.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <Box>
            <EncabezadoPagina
                titulo="Departamentos"
                descripcion={`Administra la información de los ${departamentos.length} departamentos de la organización.`}
                acciones={
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={abrirNuevo}
                    >
                        Nuevo departamento
                    </Button>
                }
            />

            {mensaje.texto && <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
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

            <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>NOMBRE</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>DESCRIPCIÓN</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ESTATUS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ACCIONES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departamentosFiltrados.map((dep) => (
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
                                        color={(dep.estado || 'ACTIVO') === 'ACTIVO' ? 'success' : 'error'}
                                        variant="outlined"
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
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModal(false)} color="inherit">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editando ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}