import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, CircularProgress, Grid, Card, CardContent,
  Snackbar, Alert
} from '@mui/material';
import { Download, CheckCircle, AccessTime, History, Description } from '@mui/icons-material';
import { reportesApi } from '../api/reportesApi';
import { departamentoApi } from '../api/departamentoApi';
import { useAuth } from '../context/AuthContext';
import EncabezadoPagina from '../components/EncabezadoPagina';

// Fecha local en formato yyyy-mm-dd (toISOString usa UTC y en la noche da el día siguiente)
const aTexto = (fecha) => new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().split('T')[0];

// Por defecto: del lunes de esta semana a hoy
const lunesDeEstaSemana = () => {
  const d = new Date();
  const dia = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (dia - 1));
  return d;
};

export default function Reportes() {
  const { sesion } = useAuth();
  const token = sesion?.token;
  const [fechaInicio, setFechaInicio] = useState(aTexto(lunesDeEstaSemana()));
  const [fechaFin, setFechaFin] = useState(aTexto(new Date()));
  const [departamentoId, setDepartamentoId] = useState('todos');
  const [departamentos, setDepartamentos] = useState([]);
  
  const [activeTab, setActiveTab] = useState('asistencia'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  // Departamentos activos para el filtro
  useEffect(() => {
    if (!token) return;
    departamentoApi.listar(token)
      .then((lista) => setDepartamentos((Array.isArray(lista) ? lista : []).filter((d) => (d.estado || 'ACTIVO') === 'ACTIVO')))
      .catch(() => setDepartamentos([]));
  }, [token]);

  const handleAplicarFiltros = async () => {
    if (!token) return;
    if (!fechaInicio || !fechaFin) {
      setSnackbar({ open: true, message: 'Elige la fecha de inicio y la de fin.', severity: 'warning' });
      return;
    }
    if (fechaFin < fechaInicio) {
      setSnackbar({ open: true, message: 'La fecha de fin no puede ser antes que la de inicio.', severity: 'warning' });
      return;
    }
    setLoading(true);
  
    const filtros = {
      fechaInicio,
      fechaFin,
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

    if (activeTab === 'faltas') {
      return data.map((item, index) => (
        <TableRow key={index} hover>
          <TableCell>
            <Typography variant="subtitle2" fontWeight="bold">{item.nombreEmpleado || 'Sin nombre'}</Typography>
            <Typography variant="caption" color="textSecondary">{item.departamento || 'N/A'}</Typography>
          </TableCell>
          <TableCell>{item.totalAsistencias ?? 0}</TableCell>
          <TableCell>{item.totalRetardos ?? 0}</TableCell>
          <TableCell>{item.minutosRetardo ?? 0} min</TableCell>
          <TableCell>
            <Typography color="error.main" fontWeight="bold">{item.totalFaltas ?? 0}</Typography>
          </TableCell>
        </TableRow>
      ));
    }

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

  // Filas del reporte actual como texto, en el mismo orden que las columnas
  const filasParaExportar = () => {
    const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
    return data.map((item) => {
      switch (activeTab) {
        case 'asistencia': return [item.nombreEmpleado, item.diasLaborados ?? 0, item.totalRetardos ?? 0, item.totalFaltas ?? 0, `${item.totalHorasExtra ?? 0} h`];
        case 'faltas': return [`${item.nombreEmpleado} (${item.departamento || 'N/A'})`, item.totalAsistencias ?? 0, item.totalRetardos ?? 0, `${item.minutosRetardo ?? 0} min`, item.totalFaltas ?? 0];
        case 'horas': return [`${item.nombreEmpleado} (${item.departamento || 'N/A'})`, `${item.totalHoras ?? 0} h`, `${item.horasPendientes ?? 0} h`, `${item.horasAutorizadas ?? 0} h`];
        case 'nomina': return [`${item.nombreEmpleado} (${item.periodo || 'N/A'})`, dinero(item.percepciones), dinero(item.deducciones), dinero(item.netoAPagar)];
        default: return [];
      }
    });
  };

  const nombreReporte = () => `${tarjetas.find((t) => t.id === activeTab)?.title || 'Reporte'} ${fechaInicio} a ${fechaFin}`;

  // Excel: CSV con \uFEFF para que Excel lea bien los acentos
  const exportarExcel = () => {
    if (data.length === 0) {
      setSnackbar({ open: true, message: 'No hay datos para exportar.', severity: 'warning' });
      return;
    }
    const columnas = getColumnas().filter(Boolean);
    const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [columnas, ...filasParaExportar()].map((fila) => fila.map(celda).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreReporte()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF: abre una ventana con la tabla y el diálogo de impresión ("Guardar como PDF")
  const exportarPdf = () => {
    if (data.length === 0) {
      setSnackbar({ open: true, message: 'No hay datos para exportar.', severity: 'warning' });
      return;
    }
    const escapar = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const columnas = getColumnas().filter(Boolean);
    const filas = filasParaExportar().map((f) => `<tr>${f.map((c) => `<td>${escapar(c)}</td>`).join('')}</tr>`).join('');
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setSnackbar({ open: true, message: 'Permite las ventanas emergentes para exportar a PDF.', severity: 'warning' });
      return;
    }
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapar(nombreReporte())}</title>
      <style>body{font-family:Arial,sans-serif;margin:24px;color:#102a43}h1{font-size:18px;margin:0}p{color:#5b6b7b;margin:4px 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #e5eaf0;padding:6px 8px;text-align:left}th{background:#e5f4f3}</style>
      </head><body><h1>Nomi · ${escapar(tarjetas.find((t) => t.id === activeTab)?.title)}</h1>
      <p>Calzado Alba · del ${escapar(fechaInicio)} al ${escapar(fechaFin)} · ${data.length} registros</p>
      <table><thead><tr>${columnas.map((c) => `<th>${escapar(c)}</th>`).join('')}</tr></thead><tbody>${filas}</tbody></table>
      </body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
      <EncabezadoPagina
        titulo="Reportes"
        descripcion="Consulta y exporta información de tu operación."
        acciones={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={exportarPdf} sx={{ textTransform: 'none', borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<Download />} onClick={exportarExcel} sx={{ textTransform: 'none', borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}>
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
          {departamentos.map((d) => (
            <MenuItem key={d.id} value={String(d.id)}>{d.nombre}</MenuItem>
          ))}
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