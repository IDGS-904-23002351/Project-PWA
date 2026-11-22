import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Button, TextField, Paper, Divider, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, 
    FormControlLabel, Checkbox, IconButton, CircularProgress, Stack,
    useMediaQuery, useTheme
} from '@mui/material';
import { LocationOn, Event, Save, Refresh, Add, Edit, Delete, QrCode2, MyLocation, Print } from '@mui/icons-material';
import { plantaQrApi } from '../api/plantaQrApi';
import EncabezadoPagina from '../components/EncabezadoPagina';
import ConfirmarDialog from '../components/ConfirmarDialog';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// El QR lleva SOLO el código guardado en la base (codigo_qr), que es lo que la app manda
// y lo que sp_Movil_RegistrarAsistencia compara. Antes la imagen llevaba
// "QR-Nomi-<código>-<fecha>", así que ningún escaneo coincidía.
const urlImagenQr = (codigo, tamano) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${tamano}x${tamano}&margin=10&data=${encodeURIComponent(codigo)}`;

function MapViewUpdater({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        const t = setTimeout(() => {
            map.invalidateSize();
            const la = parseFloat(lat);
            const ln = parseFloat(lng);
            if (!isNaN(la) && !isNaN(ln)) {
                map.setView([la, ln], map.getZoom(), { animate: true });
            }
        }, 250);
        return () => clearTimeout(t);
    }, [lat, lng, map]);
    return null;
}

export default function Planta() {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
    const { sesion } = useAuth();
    const token = sesion?.token;

    const [ubicacion, setUbicacion] = useState({ 
        id: 0, nombre: '', latitud: '', longitud: '', radioToleranciaMetros: 100, direccion: '', estado: 'ACTIVO' 
    });
    const [qrVigente, setQrVigente] = useState(null);
    const [diasFestivos, setDiasFestivos] = useState([]);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    
    const [loading, setLoading] = useState(false);
    const [savingUbicacion, setSavingUbicacion] = useState(false);
    const [loadingQr, setLoadingQr] = useState(false);
    const [savingFestivo, setSavingFestivo] = useState(false);

    const [openModalFestivo, setOpenModalFestivo] = useState(false);
    const [nuevoFestivo, setNuevoFestivo] = useState({ id: 0, fecha: '', nombre: '', esOficial: true });

    const [confirmar, setConfirmar] = useState(null);
    // Errores debajo de cada campo (antes solo salía un mensaje general o la burbuja del navegador)
    const [erroresUbicacion, setErroresUbicacion] = useState({});
    const [erroresFestivo, setErroresFestivo] = useState({});
    const [errorFestivo, setErrorFestivo] = useState('');
    const [buscandoGps, setBuscandoGps] = useState(false);
    const timeoutRef = useRef(null);
    const anioActual = new Date().getFullYear();

    useEffect(() => {
        if (!mensaje.texto) return;
        const t = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
        return () => clearTimeout(t);
    }, [mensaje]);

    const cargarDatos = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const dataUbicacion = await plantaQrApi.obtenerUbicacion(token).catch(() => null);
            if (dataUbicacion) {
                setUbicacion({
                    id: dataUbicacion.id ?? 0,
                    nombre: dataUbicacion.nombre ?? '',
                    latitud: dataUbicacion.latitud ?? '',
                    longitud: dataUbicacion.longitud ?? '',
                    radioToleranciaMetros: dataUbicacion.radioToleranciaMetros ?? 100,
                    direccion: dataUbicacion.direccion ?? '',
                    estado: dataUbicacion.estado ?? 'ACTIVO',
                });
                if (dataUbicacion.id) {
                    const qr = await plantaQrApi.obtenerQrVigente(token, dataUbicacion.id).catch(() => null);
                    setQrVigente(qr);
                }
            }
            // Este año y el siguiente, para poder registrar los de enero desde diciembre
            const [esteAnio, siguiente] = await Promise.all([
                plantaQrApi.listarDiasFestivos(token, anioActual).catch(() => []),
                plantaQrApi.listarDiasFestivos(token, anioActual + 1).catch(() => []),
            ]);
            setDiasFestivos([
                ...(Array.isArray(esteAnio) ? esteAnio : []),
                ...(Array.isArray(siguiente) ? siguiente : []),
            ]);
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información de la planta.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        cargarDatos(); 
    }, [token]);

    const obtenerDireccionSegura = (lat, lng) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUbicacion(prev => ({ ...prev, direccion: data?.display_name || `Ubicación GPS: ${lat}, ${lng}` }));
            } catch {
                setUbicacion(prev => ({ ...prev, direccion: `Lat: ${lat}, Lon: ${lng}` }));
            }
        }, 400);
    };

    // Solo para el clic en el mapa y el GPS: ahí sí se redondea a 6 decimales (~10 cm).
    // Antes también se usaba al escribir, y al teclear "2" el campo se volvía "2.000000".
    const actualizarUbicacionPorCoords = (lat, lng) => {
        // wrap(): si se hace clic en una "copia" del mapa (después de desplazarlo mucho),
        // Leaflet da longitudes como -461.58; wrap() las regresa al rango -180 a 180
        const punto = L.latLng(Number(lat), Number(lng)).wrap();
        const latStr = punto.lat.toFixed(6);
        const lngStr = punto.lng.toFixed(6);
        setUbicacion(prev => ({ ...prev, latitud: latStr, longitud: lngStr }));
        setErroresUbicacion(prev => ({ ...prev, latitud: '', longitud: '' }));
        obtenerDireccionSegura(latStr, lngStr);
    };

    // Al terminar de escribir una coordenada válida, se busca la dirección
    const alSalirDeCoordenada = () => {
        const la = Number(ubicacion.latitud);
        const ln = Number(ubicacion.longitud);
        if (String(ubicacion.latitud).trim() !== '' && String(ubicacion.longitud).trim() !== ''
            && !isNaN(la) && !isNaN(ln) && la >= -90 && la <= 90 && ln >= -180 && ln <= 180) {
            obtenerDireccionSegura(ubicacion.latitud, ubicacion.longitud);
        }
    };

    // Toma la ubicación de la computadora o el celular (sirve para poner la planta donde estás y probar la app)
    const usarMiUbicacion = () => {
        if (!navigator.geolocation) {
            return setMensaje({ tipo: 'error', texto: 'Este navegador no puede obtener tu ubicación.' });
        }
        setBuscandoGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                actualizarUbicacionPorCoords(pos.coords.latitude, pos.coords.longitude);
                setMensaje({ tipo: 'success', texto: `Ubicación tomada (precisión ±${Math.round(pos.coords.accuracy)} m). Revisa el pin y guarda.` });
                setBuscandoGps(false);
            },
            () => {
                setMensaje({ tipo: 'error', texto: 'No se pudo obtener tu ubicación. Revisa que el navegador tenga permiso de ubicación.' });
                setBuscandoGps(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    function MapClickHandler() {
        useMapEvents({ click(e) { actualizarUbicacionPorCoords(e.latlng.lat, e.latlng.lng); } });
        return null;
    }

    // ---------- GUARDAR UBICACIÓN ----------
    const handleGuardarUbicacion = async (e) => {
        if (e) e.preventDefault();
        if (!token) return;
        setMensaje({ tipo: '', texto: '' });

        // Antes un radio de 0 se cambiaba por 100 y una latitud vacía por 0 sin avisar
        const latitud = Number(ubicacion.latitud);
        const longitud = Number(ubicacion.longitud);
        const radioTexto = String(ubicacion.radioToleranciaMetros ?? '').trim();
        const radio = Number(radioTexto);
        const errores = {};
        if (!String(ubicacion.nombre || '').trim()) errores.nombre = 'Escribe el nombre de la planta.';
        if (String(ubicacion.latitud).trim() === '' || isNaN(latitud) || latitud < -90 || latitud > 90)
            errores.latitud = 'La latitud debe estar entre -90 y 90.';
        if (String(ubicacion.longitud).trim() === '' || isNaN(longitud) || longitud < -180 || longitud > 180)
            errores.longitud = 'La longitud debe estar entre -180 y 180.';
        if (radioTexto === '' || !Number.isInteger(radio) || radio < 10 || radio > 2000)
            errores.radio = 'El radio debe estar entre 10 y 2000 metros.';
        setErroresUbicacion(errores);
        if (Object.keys(errores).length > 0) return;

        setSavingUbicacion(true);
        try {
            await plantaQrApi.guardarUbicacion(token, {
                ...ubicacion,
                latitud,
                longitud,
                radioToleranciaMetros: radio
            });
            setMensaje({ tipo: 'success', texto: 'Ubicación de planta guardada correctamente.' });
            await cargarDatos();
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar ubicación.' });
        } finally {
            setSavingUbicacion(false);
        }
    };
    const handleRegenerarQR = async () => {
        if (!token) return;
        if (!ubicacion.id) {
            return setMensaje({ tipo: 'error', texto: 'Primero registra una ubicación.' });
        }
        setLoadingQr(true);
        try {
            // El código nuevo lo genera el servidor al azar (sp_RegenerarDispositivoQR)
            await plantaQrApi.regenerarQR(token, { 
                ubicacionId: ubicacion.id, 
                codigoQr: 'GENERADO-EN-SERVIDOR' 
            });
            setQrVigente(await plantaQrApi.obtenerQrVigente(token, ubicacion.id));
            setMensaje({ tipo: 'success', texto: 'Código QR regenerado exitosamente.' });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al regenerar QR.' });
        } finally {
            setLoadingQr(false);
        }
    };

    const handleGuardarFestivo = async (e) => {
        e.preventDefault();
        if (!token) return;
        setErrorFestivo('');

        const errores = {};
        if (!nuevoFestivo.fecha) errores.fecha = 'Debes seleccionar una fecha.';
        if (!nuevoFestivo.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
        setErroresFestivo(errores);
        if (Object.keys(errores).length > 0) return;

        setSavingFestivo(true);
        try {
            const fechaLimpia = nuevoFestivo.fecha.includes('T') ? nuevoFestivo.fecha : `${nuevoFestivo.fecha}T00:00:00`;

            const payload = {
                Id: nuevoFestivo.id || 0,
                Fecha: fechaLimpia,
                Nombre: nuevoFestivo.nombre.trim(),
                EsOficial: Boolean(nuevoFestivo.esOficial),
                AplicaEmpresaId: null
            };

            await plantaQrApi.guardarDiaFestivo(token, payload);
            
            setMensaje({ tipo: 'success', texto: nuevoFestivo.id ? 'Día festivo actualizado.' : 'Día festivo registrado.' });
            setOpenModalFestivo(false);
            await cargarDatos();
        } catch (err) {
            let errorMsg = 'Error al guardar día festivo.';
            if (err?.response?.data?.error) errorMsg = err.response.data.error;
            else if (err?.response?.data?.mensaje) errorMsg = err.response.data.mensaje;
            else if (err?.message) errorMsg = err.message;
            // Dentro de la ventana, que se queda abierta para corregir
            setErrorFestivo(errorMsg);
        } finally {
            setSavingFestivo(false);
        }
    };

    const handleEliminarFestivo = async (id, confirmarHecho = false) => {
        if (!token) return;
        if (!confirmarHecho) {
            const festivo = diasFestivos.find((f) => f.id === id);
            setConfirmar({
                titulo: 'Eliminar día festivo',
                mensaje: `¿Seguro que deseas eliminar "${festivo?.nombre || 'este día festivo'}"?`,
                textoBoton: 'Eliminar',
                accion: () => handleEliminarFestivo(id, true),
            });
            return;
        }
        try {
            await plantaQrApi.eliminarDiaFestivo(token, id);
            setMensaje({ tipo: 'success', texto: 'Día festivo eliminado.' });
            await cargarDatos();
        } catch (err) {
            let errorMsg = err?.response?.data?.mensaje || err.message || 'Error al eliminar.';
            setMensaje({ tipo: 'error', texto: errorMsg });
        }
    };

    const latDef = parseFloat(ubicacion.latitud) || 21.123456;
    const lngDef = parseFloat(ubicacion.longitud) || -101.683333;

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', pb: 4 }}>
            <EncabezadoPagina
                titulo="Planta y Geolocalización QR"
                descripcion="Administra sede física, GPS y códigos QR."
            />

            {mensaje.texto && (
                <Alert severity={mensaje.tipo || 'info'} onClose={() => setMensaje({ tipo: '', texto: '' })} sx={{ mb: 3 }}>
                    {mensaje.texto}
                </Alert>
            )}

            <Stack spacing={3}>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'stretch', width: '100%' }}>
                    
                    <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 28%' } }}>
                        <Paper sx={{ 
                            p: { xs: 2, sm: 3 }, 
                            borderRadius: 3, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }} elevation={0}>
                            
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <QrCode2 sx={{ color: '#00897b', fontSize: 28 }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ m: 0, p: 0 }}>Código QR</Typography>
                            </Stack>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Button variant="outlined" 
                                startIcon={loadingQr ? <CircularProgress size={18} /> : <Refresh />} 
                                onClick={handleRegenerarQR}
                                disabled={loadingQr || !ubicacion.id}
                                sx={{ color: '#00897b', borderColor: '#00897b', '&:hover': { bgcolor: '#e0f2f1' }, textTransform: 'none', borderRadius: 2, width: '100%', mb: 2 }}>
                                {loadingQr ? 'Regenerando...' : 'Regenerar Código QR'}
                            </Button>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, flex: 1 }}>
                                {qrVigente ? (
                                    <>
                                        <Box component="img" 
                                            src={urlImagenQr(qrVigente.codigoQr, 250)} 
                                            alt={`QR ${qrVigente.codigoQr}`} 
                                            sx={{ width: '100%', maxWidth: 220, height: 'auto', aspectRatio: '1/1', p: 1, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                                        />
                                        <Typography variant="caption" align="center" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                                            {qrVigente.codigoQr}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" align="center">
                                            Vigente desde: {new Date(qrVigente.vigenciaInicio).toLocaleString('es-MX')}<br />
                                            No vence: sirve hasta que lo regeneres.
                                        </Typography>
                                        <Button size="small" startIcon={<Print />} href={urlImagenQr(qrVigente.codigoQr, 600)} target="_blank" rel="noopener"
                                            sx={{ color: '#00897b', textTransform: 'none' }}>
                                            Abrir para imprimir
                                        </Button>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary" align="center">Sin código QR activo.</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ flex: 1, width: '100%' }}>
                        <Paper sx={{ 
                            p: { xs: 2, sm: 3 }, 
                            borderRadius: 3, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }} elevation={0}>
                            
                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                                width="100%" 
                                mb={2}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Event sx={{ color: '#00897b', fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight="bold" sx={{ m: 0, p: 0 }}>Días Festivos ({anioActual}–{anioActual + 1})</Typography>
                                </Stack>
                                <Button variant="contained" size="small" startIcon={<Add />} 
                                    onClick={() => { setNuevoFestivo({ id: 0, fecha: '', nombre: '', esOficial: true }); setErroresFestivo({}); setErrorFestivo(''); setOpenModalFestivo(true); }} 
                                    sx={{ 
                                        bgcolor: '#00897b', 
                                        '&:hover': { bgcolor: '#00695c' }, 
                                        textTransform: 'none', 
                                        borderRadius: 2, 
                                        whiteSpace: 'nowrap', 
                                        ml: { xs: 0, sm: 'auto' },
                                        mt: { xs: 1.5, sm: 0 } 
                                    }}>
                                    Nuevo día festivo
                                </Button>
                            </Stack><br/>
                            <Divider sx={{ mb: 2 }} />
                            
                            <TableContainer sx={{ flex: 1, width: '100%', maxHeight: { xs: 340, md: 450 } }}>
                                <Table size="small" stickyHeader sx={{ width: '100%' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>FECHA</TableCell>
                                            <TableCell>NOMBRE</TableCell>
                                            <TableCell>TIPO</TableCell>
                                            <TableCell align="center">ACCIÓN</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {diasFestivos.map((f) => (
                                            <TableRow key={f.id} hover>
                                                <TableCell><Typography variant="body2" fontWeight="bold">{new Date(f.fecha).toLocaleDateString()}</Typography></TableCell>
                                                <TableCell><Typography variant="body2">{f.nombre}</Typography></TableCell>
                                                <TableCell>
                                                    <Chip label={f.esOficial ? "Oficial" : "Personalizado"} size="small" 
                                                        sx={{ bgcolor: f.esOficial ? '#e0f2f1' : '#ede7f6', color: f.esOficial ? '#00796b' : '#5e35b1', fontWeight: 'bold' }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" color="primary" onClick={() => { 
                                                        setNuevoFestivo({ id: f.id, fecha: f.fecha ? f.fecha.split('T')[0] : '', nombre: f.nombre, esOficial: f.esOficial }); 
                                                        setErroresFestivo({}); setErrorFestivo(''); setOpenModalFestivo(true); 
                                                    }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleEliminarFestivo(f.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {diasFestivos.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    <Typography variant="body2" color="textSecondary" py={3}>No hay registros.</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, width: '100%', overflow: 'hidden' }} elevation={0}>
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} width="100%" spacing={2} mb={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LocationOn sx={{ color: '#00897b', fontSize: 28 }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ m: 0, p: 0 }}>Configuración de Planta</Typography>
                            </Stack>
                            <Button 
                                type="button" 
                                onClick={handleGuardarUbicacion}
                                variant="contained" 
                                startIcon={savingUbicacion ? <CircularProgress size={18} color="inherit" /> : <Save />}
                                disabled={savingUbicacion || loading}
                                sx={{ 
                                    bgcolor: '#00897b', 
                                    '&:hover': { bgcolor: '#00695c' }, 
                                    textTransform: 'none', 
                                    borderRadius: 2, 
                                    px: 3, 
                                    py: 1,
                                    ml: { xs: 0, sm: 90 } 
                                }}
                            >
                                {savingUbicacion ? 'Guardando...' : 'Guardar Ubicación'}
                            </Button>
                        </Stack><br/>
                        <Divider sx={{ mb: 3 }} />

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: '#00897b' }} />
                            </Box>
                        ) : (
                            <Box component="form" onSubmit={handleGuardarUbicacion} display="flex" flexDirection="column" gap={3}>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                                    <Box sx={{ flex: '1 1 250px' }}>
                                        <TextField label="Nombre de la planta *" size="small" fullWidth slotProps={{ htmlInput: { maxLength: 120 } }}
                                            value={ubicacion.nombre} onChange={(e) => { setUbicacion({ ...ubicacion, nombre: e.target.value }); setErroresUbicacion(p => ({ ...p, nombre: '' })); }}
                                            error={!!erroresUbicacion.nombre} helperText={erroresUbicacion.nombre} />
                                    </Box>
                                    <Box sx={{ flex: '1 1 120px' }}>
                                        <TextField label="Latitud *" size="small" fullWidth slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 } }}
                                            placeholder="21.063820"
                                            value={ubicacion.latitud} onChange={(e) => {
                                                setUbicacion(prev => ({ ...prev, latitud: e.target.value }));
                                                setErroresUbicacion(p => ({ ...p, latitud: '' }));
                                            }} onBlur={alSalirDeCoordenada}
                                            error={!!erroresUbicacion.latitud} helperText={erroresUbicacion.latitud} />
                                    </Box>
                                    <Box sx={{ flex: '1 1 120px' }}>
                                        <TextField label="Longitud *" size="small" fullWidth slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 } }}
                                            placeholder="-101.582680"
                                            value={ubicacion.longitud} onChange={(e) => {
                                                setUbicacion(prev => ({ ...prev, longitud: e.target.value }));
                                                setErroresUbicacion(p => ({ ...p, longitud: '' }));
                                            }} onBlur={alSalirDeCoordenada}
                                            error={!!erroresUbicacion.longitud} helperText={erroresUbicacion.longitud} />
                                    </Box>
                                    <Box sx={{ flex: '1 1 150px' }}>
                                        <TextField label="Radio de Tolerancia (m) *" type="number" size="small" fullWidth slotProps={{ htmlInput: { min: 10, max: 2000 } }}
                                            value={ubicacion.radioToleranciaMetros} onChange={(e) => { setUbicacion({ ...ubicacion, radioToleranciaMetros: e.target.value }); setErroresUbicacion(p => ({ ...p, radio: '' })); }}
                                            error={!!erroresUbicacion.radio} helperText={erroresUbicacion.radio || 'De 10 a 2000 metros.'} />
                                    </Box>
                                    <Box sx={{ flex: '2 1 300px' }}>
                                        <TextField label="Dirección Física (Automática)" size="small" fullWidth 
                                            value={ubicacion.direccion || ''} slotProps={{ input: { readOnly: true } }} placeholder="Haz clic en el mapa..." />
                                    </Box>
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                                    <Typography variant="caption" color="textSecondary">
                                        Haz clic en el mapa, escribe la latitud y longitud, o usa tu ubicación actual.
                                    </Typography>
                                    <Button size="small" variant="outlined" onClick={usarMiUbicacion} disabled={buscandoGps}
                                        startIcon={buscandoGps ? <CircularProgress size={16} /> : <MyLocation />}
                                        sx={{ color: '#00897b', borderColor: '#00897b', textTransform: 'none', borderRadius: 2, flexShrink: 0 }}>
                                        {buscandoGps ? 'Buscando...' : 'Usar mi ubicación actual'}
                                    </Button>
                                </Stack>

                                <Box sx={{ width: '100%', height: isMdUp ? 350 : 250, borderRadius: 3, overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                                    <MapContainer center={[latDef, lngDef]} zoom={15} worldCopyJump style={{ width: '100%', height: '100%', zIndex: 1 }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                        <MapClickHandler />
                                        <MapViewUpdater lat={ubicacion.latitud} lng={ubicacion.longitud} />
                                        {ubicacion.latitud && ubicacion.longitud && !isNaN(ubicacion.latitud) && !isNaN(ubicacion.longitud) && (
                                            <Marker position={[parseFloat(ubicacion.latitud), parseFloat(ubicacion.longitud)]} />
                                        )}
                                    </MapContainer>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Stack>

            <Dialog open={openModalFestivo} onClose={() => !savingFestivo && setOpenModalFestivo(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{nuevoFestivo.id ? 'Editar Día Festivo' : 'Registrar Nuevo Día Festivo'}</DialogTitle>
                <Box component="form" onSubmit={handleGuardarFestivo} noValidate>
                    <DialogContent dividers sx={{ py: 3 }}>
                        <Stack spacing={3}>
                            {errorFestivo && <Alert severity="error">{errorFestivo}</Alert>}
                            <TextField 
                                label="Fecha del día festivo *" 
                                type="date" 
                                size="medium" 
                                fullWidth slotProps={{ inputLabel: { shrink: true } }} 
                                value={nuevoFestivo.fecha} 
                                onChange={(e) => { setNuevoFestivo({ ...nuevoFestivo, fecha: e.target.value }); setErroresFestivo(p => ({ ...p, fecha: '' })); }} 
                                error={!!erroresFestivo.fecha} helperText={erroresFestivo.fecha}
                            />
                            <TextField 
                                label="Nombre o Descripción *" 
                                size="medium" 
                                fullWidth 
                                placeholder="Ej. Día de la Independencia" 
                                value={nuevoFestivo.nombre} 
                                onChange={(e) => { setNuevoFestivo({ ...nuevoFestivo, nombre: e.target.value }); setErroresFestivo(p => ({ ...p, nombre: '' })); }} slotProps={{ htmlInput: { maxLength: 120 } }}
                                error={!!erroresFestivo.nombre} helperText={erroresFestivo.nombre}
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={nuevoFestivo.esOficial} onChange={(e) => setNuevoFestivo({ ...nuevoFestivo, esOficial: e.target.checked })} sx={{ color: '#00897b', '&.Mui-checked': { color: '#00897b' } }} />} 
                                label="Este día festivo es oficial" 
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, px: 3 }}>
                        <Button onClick={() => setOpenModalFestivo(false)} color="inherit" disabled={savingFestivo}>Cancelar</Button>
                        <Button type="submit" variant="contained" 
                            disabled={savingFestivo}
                            startIcon={savingFestivo ? <CircularProgress size={18} color="inherit" /> : null}
                            sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, borderRadius: 2, px: 3 }}>
                            {savingFestivo ? 'Guardando...' : nuevoFestivo.id ? 'Actualizar Festivo' : 'Guardar Festivo'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <ConfirmarDialog datos={confirmar} onCerrar={() => setConfirmar(null)} />
        </Box>
    );
}