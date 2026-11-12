import { peticion } from './http'

export const plantaQrApi = {
    obtenerUbicacion: async (token) => {
        return peticion('/api/Ubicacion', { method: 'GET', token });
    },
    guardarUbicacion: async (token, ubicacion) => {
        return peticion('/api/Ubicacion', {
            method: 'POST',
            token,
            body: JSON.stringify(ubicacion)
        });
    },
    obtenerQரையVigente: async (token, ubicacionId) => {
        return peticion(`/api/DispositivoQR/${ubicacionId}`, { method: 'GET', token });
    },
    regenerarQR: async (token, dispositivoQR) => {
        return peticion('/api/DispositivoQR', {
            method: 'POST',
            token,
            body: JSON.stringify(dispositivoQR)
        });
    },
    listarDiasFestivos: async (token, anio) => {
        return peticion(`/api/DiaFestivo/${anio}`, { method: 'GET', token });
    },
    guardarDiaFestivo: async (token, diaFestivo) => {
        return peticion('/api/DiaFestivo', {
            method: 'POST',
            token,
            body: JSON.stringify(diaFestivo)
        });
    },
    actualizarDiaFestivo: async (token, id, diaFestivo) => {
        return peticion('/api/DiaFestivo', {
            method: 'POST',
            token,
            body: JSON.stringify({ ...diaFestivo, id })
        });
    },
    eliminarDiaFestivo: async (token, id) => {
        return peticion(`/api/DiaFestivo/${id}`, {
            method: 'DELETE',
            token
        });
    }
};