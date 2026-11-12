import { peticion } from './http'

export const nominaApi = {
    listarPeriodos: async (token, id = null, estado = null) => {
        const params = new URLSearchParams();
        if (id) params.append('id', id);
        if (estado) params.append('estado', estado);
        const query = params.toString() ? `?${params.toString()}` : '';
        return peticion(`/api/Nomina/periodos${query}`, { method: 'GET', token });
    },
    guardarPeriodo: async (token, periodo) => {
        return peticion('/api/Nomina/periodos', {
            method: 'POST',
            token,
            body: JSON.stringify(periodo)
        });
    },
    cerrarPeriodo: async (token, periodoId) => {
        return peticion(`/api/Nomina/periodos/cerrar/${periodoId}`, {
            method: 'POST',
            token
        });
    },
    obtenerNominaPorPeriodo: async (token, periodoId) => {
        return peticion(`/api/Nomina/periodo/${periodoId}`, { method: 'GET', token });
    },
    guardarNominaCalculada: async (token, nomina) => {
        return peticion('/api/Nomina/calcular', {
            method: 'POST',
            token,
            body: JSON.stringify(nomina)
        });
    },
    calcularNominaPeriodo: async (token, periodoId) => {
        return peticion(`/api/Nomina/calcular-periodo/${periodoId}`, {
            method: 'POST',
            token
        });
    },
    guardarDetalleNomina: async (token, detalle) => {
        return peticion('/api/Nomina/detalle', {
            method: 'POST',
            token,
            body: JSON.stringify(detalle)
        });
    },
    obtenerDetalleRecibo: async (token, nominaId) => {
        return peticion(`/api/Nomina/detalle/${nominaId}`, { method: 'GET', token });
    }
};