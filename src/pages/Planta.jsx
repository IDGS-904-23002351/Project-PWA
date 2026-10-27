// src/pages/Planta.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Button, TextField, Paper, Grid, Divider, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, 
    FormControlLabel, Checkbox, IconButton 
} from '@mui/material';
import { LocationOn, Event, Save, Refresh, Add, Edit, Delete } from '@mui/icons-material';
import { plantaQrApi } from '../api/plantaQrApi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapViewUpdater({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        setTimeout(() => {
            map.invalidateSize();
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom(), { animate: true });
            }
        }, 250);
    }, [lat, lng, map]);
    return null;
}

export default function Planta() {
    const [ubicacion, setUbicacion] = useState({ id: 0, nombre: '', latitud: '', longitud: '', radioToleranciaMetros: 100, direccion: '', estado: 'ACTIVO' });
    const [qrVigente, setQrVigente] = useState(null);
    const [diasFestivos, setDiasFestivos] = useState([]);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [openModalFestivo, setOpenModalFestivo] = useState(false);
    const [nuevoFestivo, setNuevoFestivo] = useState({ id: 0, fecha: '', nombre: '', esOficial: true });

    const timeoutRef = useRef(null);
    const anioActual = new Date().getFullYear();

    const cargarDatos = async () => {
        try {
            const dataUbicacion = await plantaQrApi.obtenerUbicacion();
            if (dataUbicacion) {
                setUbicacion(dataUbicacion);
                setQrVigente(await plantaQrApi.obtenerQரையVigente(dataUbicacion.id).catch(() => null));
            }
            setDiasFestivos(await plantaQrApi.listarDiasFestivos(anioActual) || []);
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información de la planta.' });
        }
    };

    useEffect(() => { cargarDatos(); }, []);

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

    const actualizarUbicacionPorCoords = (lat, lng) => {
        const latStr = parseFloat(lat).toFixed(6);
        const lngStr = parseFloat(lng).toFixed(6);
        setUbicacion(prev => ({ ...prev, latitud: latStr, longitud: lngStr }));
        obtenerDireccionSegura(latStr, lngStr);
    };

    function MapClickHandler() {
        useMapEvents({ click(e) { actualizarUbicacionPorCoords(e.latlng.lat, e.latlng.lng); } });
        return null;
    }

    const handleGuardarUbicacion = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });
        try {
            await plantaQrApi.guardarUbicacion({
                ...ubicacion,
                latitud: parseFloat(ubicacion.latitud),
                longitud: parseFloat(ubicacion.longitud),
                radioToleranciaMetros: parseInt(ubicacion.radioToleranciaMetros)
            });
            setMensaje({ tipo: 'success', texto: 'Ubicación de planta guardada correctamente.' });
            cargarDatos();
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar ubicación.' });
        }
    };

    const handleRegenerarQR = async () => {
        if (!ubicacion.id) return setMensaje({ tipo: 'error', texto: 'Primero registra una ubicación.' });
        try {
            await plantaQrApi.regenerarQR({ ubicacionId: ubicacion.id, codigoQr: `QR-PLANTA-${ubicacion.id}-${Date.now()}` });
            setMensaje({ tipo: 'success', texto: 'Código QR regenerado exitosamente.' });
            setQrVigente(await plantaQrApi.obtenerQரையVigente(ubicacion.id));
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al regenerar QR.' });
        }
    };

    const handleGuardarFestivo = async (e) => {
        e.preventDefault();
        try {
            await plantaQrApi.guardarDiaFestivo({
                id: nuevoFestivo.id || 0,
                fecha: `${nuevoFestivo.fecha}T00:00:00`,
                nombre: nuevoFestivo.nombre,
                esOficial: nuevoFestivo.esOficial,
                aplicaEmpresaId: null
            });
            setMensaje({ tipo: 'success', texto: nuevoFestivo.id ? 'Día festivo actualizado correctamente.' : 'Día festivo registrado correctamente.' });
            setOpenModalFestivo(false);
            cargarDatos();
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar día festivo.' });
        }
    };

    const handleEliminarFestivo = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este día festivo?')) return;
        try {
            await plantaQrApi.eliminarDiaFestivo(id);
            setMensaje({ tipo: 'success', texto: 'Día festivo eliminado exitosamente.' });
            cargarDatos();
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'Error al eliminar el día festivo.' });
        }
    };

    const latDef = parseFloat(ubicacion.latitud) || 21.123456;
    const lngDef = parseFloat(ubicacion.longitud) || -101.683333;

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold" color="#1e293b">Planta y Geolocalización QR</Typography>
                <Typography variant="body2" color="textSecondary">Administra sede física, GPS y códigos QR.</Typography>
            </Box>

            {mensaje.texto && <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>{mensaje.texto}</Alert>}

            <Grid container spacing={3}>
                {/* 1. Configuración de Planta */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 5, my: 2, borderRadius: 3 }} elevation={0}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={3.5}>
                            <LocationOn sx={{ color: '#00897b' }} />
                            <Typography variant="h6" fontWeight="bold">Configuración de Planta</Typography>
                        </Box>
                        <Divider sx={{ mb: 4.5 }} />
                        <Box component="form" onSubmit={handleGuardarUbicacion} display="flex" flexDirection="column" gap={3}>
                            <TextField label="Nombre" size="small" fullWidth required value={ubicacion.nombre} onChange={(e) => setUbicacion({ ...ubicacion, nombre: e.target.value })} />
                            
                            <Grid container spacing={2.5} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <TextField label="Latitud" type="number" inputProps={{ step: "any" }} size="small" fullWidth required value={ubicacion.latitud} onChange={(e) => { const val = e.target.value; setUbicacion(prev => ({ ...prev, latitud: val })); if (val && !isNaN(val)) actualizarUbicacionPorCoords(val, ubicacion.longitud); }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Longitud" type="number" inputProps={{ step: "any" }} size="small" fullWidth required value={ubicacion.longitud} onChange={(e) => { const val = e.target.value; setUbicacion(prev => ({ ...prev, longitud: val })); if (val && !isNaN(val)) actualizarUbicacionPorCoords(ubicacion.latitud, val); }} />
                                </Grid>
                            </Grid>

                            <TextField label="Radio de Tolerancia (m)" type="number" size="small" fullWidth required value={ubicacion.radioToleranciaMetros} onChange={(e) => setUbicacion({ ...ubicacion, radioToleranciaMetros: e.target.value })} sx={{ mt: 1.5 }} />
                            
                            <Box display="flex" flexDirection="column" gap={1.5} sx={{ mt: 1.5 }}>
                                <TextField label="Dirección Física (Automática)" size="small" fullWidth value={ubicacion.direccion || ''} InputProps={{ readOnly: true }} placeholder="Haz clic en el mapa o ingresa coordenadas..." />
                                <Typography variant="caption" color="textSecondary">💡 Haz clic en cualquier parte del mapa o escribe la latitud/longitud para mover el pin y actualizar la dirección automáticamente.</Typography>
                                <Box sx={{ width: '100%', height: 280, borderRadius: 3, overflow: 'hidden', border: '1px solid #cbd5e1', mt: 1 }}>
                                    <MapContainer center={[latDef, lngDef]} zoom={15} style={{ width: '100%', height: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                        <MapClickHandler />
                                        <MapViewUpdater lat={ubicacion.latitud} lng={ubicacion.longitud} />
                                        {ubicacion.latitud && ubicacion.longitud && !isNaN(ubicacion.latitud) && !isNaN(ubicacion.longitud) && (
                                            <Marker position={[parseFloat(ubicacion.latitud), parseFloat(ubicacion.longitud)]} />
                                        )}
                                    </MapContainer>
                                </Box>
                            </Box>
                            
                            <Button type="submit" variant="contained" startIcon={<Save />} sx={{ mt: 2.5, bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2, py: 1.4 }}>Guardar Ubicación</Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* 2. Código QR (Botón arriba del QR) */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }} elevation={0}>
                        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRegenerarQR} sx={{ color: '#00897b', borderColor: '#00897b', '&:hover': { bgcolor: '#e0f2f1' }, textTransform: 'none', borderRadius: 2, width: '100%', mb: 2 }}>Regenerar Código QR</Button>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 1 }}>
                            {qrVigente ? (
                                <>
                                    <Box component="img" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=QR-Nomi-${qrVigente.codigoQr}-${qrVigente.vigenciaInicio}`} alt="QR" sx={{ width: 180, height: 180, p: 1, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                    <Typography variant="caption" color="textSecondary" align="center">Vigencia: {new Date(qrVigente.vigenciaInicio).toLocaleString()}</Typography>
                                </>
                            ) : (
                                <Typography variant="body2" color="textSecondary" align="center">Sin código QR activo.</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. Días Festivos (Lado a lado con el QR, con columna de Acción) */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} elevation={0}>
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Event sx={{ color: '#00897b' }} />
                                    <Typography variant="h6" fontWeight="bold">Días Festivos ({anioActual})</Typography>
                                </Box>
                                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setNuevoFestivo({ id: 0, fecha: '', nombre: '', esOficial: true }); setOpenModalFestivo(true); }} sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', borderRadius: 2 }}>Nuevo día festivo</Button>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <TableContainer sx={{ maxHeight: 250 }}>
                                <Table size="small" stickyHeader>
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
                                                <TableCell><Chip label={f.esOficial ? "Oficial" : "Personalizado"} size="small" sx={{ bgcolor: f.esOficial ? '#e0f2f1' : '#ede7f6', color: f.esOficial ? '#00796b' : '#5e35b1', fontWeight: 'bold' }} /></TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" color="primary" onClick={() => { setNuevoFestivo({ id: f.id, fecha: f.fecha ? f.fecha.split('T')[0] : '', nombre: f.nombre, esOficial: f.esOficial }); setOpenModalFestivo(true); }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleEliminarFestivo(f.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {diasFestivos.length === 0 && <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="textSecondary">No hay registros.</Typography></TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modal Nuevo / Editar Festivo */}
            <Dialog open={openModalFestivo} onClose={() => setOpenModalFestivo(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{nuevoFestivo.id ? 'Editar Día Festivo' : 'Registrar Nuevo Día Festivo'}</DialogTitle>
                <Box component="form" onSubmit={handleGuardarFestivo}>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField label="Fecha" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }} value={nuevoFestivo.fecha} onChange={(e) => setNuevoFestivo({ ...nuevoFestivo, fecha: e.target.value })} />
                            <TextField label="Nombre" size="small" fullWidth required placeholder="Ej. Navidad" value={nuevoFestivo.nombre} onChange={(e) => setNuevoFestivo({ ...nuevoFestivo, nombre: e.target.value })} />
                            <FormControlLabel control={<Checkbox checked={nuevoFestivo.esOficial} onChange={(e) => setNuevoFestivo({ ...nuevoFestivo, esOficial: e.target.checked })} sx={{ color: '#00897b', '&.Mui-checked': { color: '#00897b' } }} />} label="¿Es oficial?" />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModalFestivo(false)} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, borderRadius: 2 }}>{nuevoFestivo.id ? 'Actualizar Festivo' : 'Guardar Festivo'}</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}