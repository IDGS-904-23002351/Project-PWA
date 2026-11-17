// src/pages/Reportes.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, CircularProgress, Grid, Card, CardContent,
  Snackbar, Alert
} from '@mui/material';
import { Download, CheckCircle, AccessTime, History, Description } from '@mui/icons-material';
import { reportesApi } from '../api/reportesApi';
import { useAuth } from '../context/AuthContext';
import EncabezadoPagina from '../components/EncabezadoPagina';

export default function Reportes() {
  const { sesion } = useAuth();
  const token = sesion?.token;

  // Estados de los filtros
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-07');
  const [departamentoId, setDepartamentoId] = useState('todos');
  
  // Estados de la UI y Datos
  const [activeTab, setActiveTab] = useState('asistencia'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para notificaciones (Snackbar)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Función para cargar los datos desde el Backend
  const handleAplicarFiltros = async () => {
    if (!token) return;
    setLoading(true);
    
    // 👈 FORMATEAMOS LAS FECHAS PARA EVITAR ERRORES EN C#
    const filtros = {
      fechaInicio: fechaInicio ? new Date(fechaInicio + 'T12:00:00').toISOString() : null,
      fechaFin: fechaFin ? new Date(fechaFin + 'T12:00:00').toISOString() : null,
      departamentoId: departamentoId !== 'todos' ? parseInt(departamentoId) : null
    };

    try {
      let resultado = [];
      switch (activeTab) {
        case 'asistencia': resultado = await reportesApi.getAsistencia(token, filtros); break;
        case 'faltas': resultado = await reportesApi.getFaltasRetardos(token, filtros); break;
        case 'horas': resultado = await reportesApi.getHorasExtra(token, filtros); break;
        case 'nomina': resultado = await reportesApi.getNominaResumen(token, filtros); break;
        default: break;
      }
      setData(Array.isArray(resultado) ? resultado : []);
    } catch (error) {
      console.error("Error al cargar reporte:", error);
      setSnackbar({ open: true, message: error.message || 'Error al cargar datos', severity: 'error' });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleAplicarFiltros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const getInitials = (nombre) => {
    if (!nombre) return 'NN';
    return nombre.substring(0, 2).toUpperCase();
  };

  const tarjetas = [
    { id: 'asistencia', title: 'Asistencia', desc: 'Entradas, salidas y registros incompletos', icon: <CheckCircle />, bg: '#e0f2fe', color: '#0284c7' },
    { id: 'faltas', title: 'Faltas y retardos', desc: 'Incidencias por empleado y departamento', icon: <AccessTime />, bg: '#fef3c7', color: '#d97706' },
    { id: 'horas', title: 'Horas extra', desc: 'Horas autorizadas y pendientes', icon: <History />, bg: '#e0e7ff', color: '#4338ca' },
    { id: 'nomina', title: 'Resumen de nómina', desc: 'Percepciones, deducciones y netos', icon: <Description />, bg: '#f3e8ff', color: '#7e22ce' },
  ];

  const renderTabla = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
            No hay datos para mostrar en este periodo.
          </TableCell>
        </TableRow>
      );
    }

    // --- VISTA: ASISTENCIA ---
    if (activeTab === 'asistencia') {
      return data.map((item, index) => (
        <TableRow key={index} hover>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 'bold' }}>
                {getInitials(item.nombreEmpleado)}
              </Avatar>
              <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
                {item.nombreEmpleado || 'Sin nombre'}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>{item.diasLaborados ?? 0}</TableCell>
          <TableCell>{item.totalRetardos ?? 0}</TableCell>
          <TableCell>{item.totalFaltas ?? 0}</TableCell>
          <TableCell>
            <Chip 
              label={`${item.totalHorasExtra ?? 0} h`} 
              size="small" 
              sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 'bold' }} 
            />
          </TableCell>
        </TableRow>
      ));
    }

    // --- VISTA: FALTAS Y RETARDOS ---
    if (activeTab === 'faltas') {
      return data.map((item, index) => (
        <TableRow key={index} hover>
          <TableCell>
            <Typography variant="subtitle2" fontWeight="bold">{item.nombreEmpleado || 'Sin nombre'}</Typography>
            <Typography variant="caption" color="textSecondary">{item.departamento || 'N/A'}</Typography>
          </TableCell>
          <TableCell>{item.totalAsistencias ?? 0}</TableCell>
          <TableCell>{item.totalRetardos ?? 0}</TableCell>
          {/* 👈 AQUÍ USAMOS ?? PARA QUE SI VIENE NULL LO VUELVA 0 */}
          <TableCell>{item.minutosRetardo ?? 0} min</TableCell>
          <TableCell>
            <Typography color="error.main" fontWeight="bold">{item.totalFaltas ?? 0}</Typography>
          </TableCell>
        </TableRow>
      ));
    }

    // --- VISTA: HORAS EXTRA ---
    if (activeTab === 'horas') {
      return data.map((item, index) => (
        <TableRow key={index} hover>
          <TableCell>
            <Typography variant="subtitle2" fontWeight="bold">{item.nombreEmpleado || 'Sin nombre'}</Typography>
            <Typography variant="caption" color="textSecondary">{item.departamento || 'N/A'}</Typography>
          </TableCell>
          <TableCell>{item.totalHoras ?? 0} h</TableCell>
          <TableCell>
            <Chip label={`${item.horasPendientes ?? 0} h`} size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706' }} />
          </TableCell>
          <TableCell>
            <Chip label={`${item.horasAutorizadas ?? 0} h`} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534' }} />
          </TableCell>
        </TableRow>
      ));
    }

    // --- VISTA: NÓMINA ---
    if (activeTab === 'nomina') {
      return data.map((item, index) => (
        <TableRow key={index} hover>
          <TableCell>
            <Typography variant="subtitle2" fontWeight="bold">{item.nombreEmpleado || 'Sin nombre'}</Typography>
            <Typography variant="caption" color="textSecondary">{item.periodo || 'N/A'}</Typography>
          </TableCell>
          <TableCell sx={{ color: 'success.main' }}>${(item.percepciones ?? 0).toFixed(2)}</TableCell>
          <TableCell sx={{ color: 'error.main' }}>${(item.deducciones ?? 0).toFixed(2)}</TableCell>
          <TableCell>
            <Typography fontWeight="bold">${(item.netoAPagar ?? 0).toFixed(2)}</Typography>
          </TableCell>
        </TableRow>
      ));
    }

    return null;
  };

  const getColumnas = () => {
    switch (activeTab) {
      case 'asistencia': return ['EMPLEADO', 'DÍAS LABORADOS', 'RETARDOS', 'FALTAS', 'HORAS EXTRA'];
      case 'faltas': return ['EMPLEADO', 'ASISTENCIAS', 'RETARDOS', 'MIN. RETARDO', 'FALTAS'];
      case 'horas': return ['EMPLEADO', 'TOTAL HORAS', 'PENDIENTES', 'AUTORIZADAS', ''];
      case 'nomina': return ['EMPLEADO', 'PERCEPCIONES', 'DEDUCCIONES', 'NETO A PAGAR', ''];
      default: return [];
    }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <EncabezadoPagina
        titulo="Reportes"
        descripcion="Consulta y exporta información de tu operación."
        acciones={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download />} sx={{ textTransform: 'none', borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<Download />} sx={{ textTransform: 'none', borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}>
              Excel
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2} mb={3}>
        {tarjetas.map((tab) => (
          <Grid item xs={12} sm={6} md={3} key={tab.id}>
            <Card 
              elevation={0}
              onClick={() => setActiveTab(tab.id)}
              sx={{ 
                cursor: 'pointer',
                border: activeTab === tab.id ? '2px solid #00897b' : '1px solid #e2e8f0',
                bgcolor: activeTab === tab.id ? '#fff' : '#f8fafc',
                borderRadius: 3,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 1 }
              }}
            >
              <CardContent>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: tab.bg, color: tab.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {tab.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" color="#1e293b" gutterBottom>{tab.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: 40, fontSize: '0.85rem' }}>{tab.desc}</Typography>
                <Typography variant="body2" sx={{ color: '#00897b', fontWeight: 600 }}>Generar reporte →</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 3, flexWrap: 'wrap' }} elevation={0}>
        <TextField
          label="Inicio"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          sx={{ bgcolor: '#fff', borderRadius: 2 }}
        />
        <TextField
          label="Fin"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          sx={{ bgcolor: '#fff', borderRadius: 2 }}
        />
        <Select 
          size="small" 
          value={departamentoId} 
          onChange={(e) => setDepartamentoId(e.target.value)} 
          sx={{ minWidth: 180, borderRadius: 2, bgcolor: '#fff' }}
        >
          <MenuItem value="todos">Todos los departamentos</MenuItem>
        </Select>

        <Button
          variant="contained"
          onClick={handleAplicarFiltros}
          disabled={loading}
          sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2, px: 4 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Aplicar filtros'}
        </Button>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" color="#1e293b">
          Vista previa · {tarjetas.find(t => t.id === activeTab)?.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">{data.length} resultados</Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#fff' }}>
            <TableRow>
              {getColumnas().map((h, i) => (
                <TableCell key={i} sx={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTabla()}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}