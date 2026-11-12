import { peticion } from './http'

export const departamentoApi = {
    listar: async (token) => {
        return peticion('/api/Departamento', { method: 'GET', token });
    },
    obtener: async (token, id) => {
        return peticion(`/api/Departamento/${id}`, { method: 'GET', token });
    },
    guardar: async (token, departamento) => {
        return peticion('/api/Departamento', {
            method: 'POST',
            token,
            body: JSON.stringify(departamento)
        });
    },
    actualizar: async (token, id, departamento) => {
        return peticion('/api/Departamento', {
            method: 'POST',
            token,
            body: JSON.stringify({ ...departamento, id })
        });
    },
    eliminar: async (token, id) => {
        return peticion(`/api/Departamento/${id}`, {
            method: 'DELETE',
            token
        });
    }
};