// src/pages/Empleados.jsx
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, MenuItem, Select, 
    InputAdornment, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Avatar, Chip, IconButton 
} from '@mui/material';
import { Search, Add, MoreVert } from '@mui/icons-material';
import { empleadoApi } from '../api/empleadoApi';

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('ACTIVO');
    const [loading, setLoading] = useState(false);

    // Función para cargar datos
    const cargarEmpleados = async () => {
        setLoading(true);
        try {
            const data = await empleadoApi.listar({ 
                buscar: buscar || 'null', 
                estado: filtroEstado || 'null' 
            });
            setEmpleados(data.empleados || []); // Asegúrate de que tu backend devuelva esta propiedad
        } catch (error) {
            console.error("Error al cargar empleados", error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar al inicio y cuando cambien los filtros
    useEffect(() => {
        cargarEmpleados();
    }, [filtroEstado]);

    // Manejar búsqueda con Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') cargarEmpleados();
    };

    // Generar iniciales para el Avatar
    const getInitials = (nombre, paterno) => {
        return `${nombre?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Empleados</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Administra la información de los {empleados.length} colaboradores.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2 }}
                >
                    Nuevo empleado
                </Button>
            </Box>

            {/* Barra de Filtros */}
            <Paper sx={{ p: 1, mb: 3, display: 'flex', gap: 2, borderRadius: 3 }} elevation={0}>
                <TextField
                    placeholder="Buscar por nombre o número..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2, bgcolor: '#fff' }
                    }}
                />
                
                <Select size="small" defaultValue="todos" sx={{ minWidth: 180, borderRadius: 2 }}>
                    <MenuItem value="todos">Todos los departamentos</MenuItem>
                    {/* Aquí mapearías tus departamentos reales */}
                </Select>

                <Select size="small" defaultValue="todos" sx={{ minWidth: 150, borderRadius: 2 }}>
                    <MenuItem value="todos">Todos los tipos</MenuItem>
                    <MenuItem value="operativo">Operativo</MenuItem>
                </Select>

                <Select 
                    size="small" 
                    value={filtroEstado} 
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    sx={{ minWidth: 120, borderRadius: 2 }}
                >
                    <MenuItem value="ACTIVO">Activos</MenuItem>
                    <MenuItem value="INACTIVO">Inactivos</MenuItem>
                    <MenuItem value="null">Todos</MenuItem>
                </Select>
            </Paper>

            {/* Tabla de Empleados */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#fff' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>EMPLEADO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>PUESTO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>DEPARTAMENTO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>TIPO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>TURNO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>ESTATUS</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {empleados.map((emp) => (
                            <TableRow key={emp.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 'bold' }}>
                                            {getInitials(emp.persona_id?.nombre, emp.persona_id?.apellido_paterno)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
                                                {`${emp.persona_id?.nombre} ${emp.persona_id?.apellido_paterno}`}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {emp.rfc || 'SIN RFC'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">Colaborador</Typography> {/* Aquí iría el puesto real */}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{emp.departamento_id?.nombre || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    {/* Simulando el Chip de Operativo/Administrativo */}
                                    <Chip 
                                        label={emp.turno_id?.nombre === 'Matutino' ? 'Operativo' : 'Administrativo'} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: emp.turno_id?.nombre === 'Matutino' ? '#e0f2f1' : '#ede7f6', 
                                            color: emp.turno_id?.nombre === 'Matutino' ? '#00796b' : '#5e35b1',
                                            fontWeight: 'bold'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {emp.turno_id?.nombre === 'Matutino' ? '07:00-15:00' : '09:00-18:00'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: emp.estado === 'ACTIVO' ? '#4caf50' : '#9e9e9e' }} />
                                        <Typography variant="body2" color={emp.estado === 'ACTIVO' ? '#4caf50' : '#757575'}>
                                            {emp.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small">
                                        <MoreVert />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}