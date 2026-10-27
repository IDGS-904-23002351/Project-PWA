const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7219'

async function peticion(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...opciones,
    })
  } catch (error) {
    console.error("Error de red detectado:", error);
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión o el certificado SSL.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || 'Ocurrió un error al procesar la solicitud.')
    error.status = respuesta.status
    throw error
  }
  return datos
}

export const departamentoApi = {
    listar: async () => {
        return peticion(`/api/Departamento`, { method: 'GET' });
    },
    obtener: async (id) => {
        return peticion(`/api/Departamento/${id}`, { method: 'GET' });
    },
    guardar: async (departamento) => {
        return peticion(`/api/Departamento`, {
            method: 'POST',
            body: JSON.stringify(departamento)
        });
    },
    actualizar: async (id, departamento) => {
        return peticion(`/api/Departamento`, {
            method: 'POST',
            body: JSON.stringify({ ...departamento, id })
        });
    },
    eliminar: async (id) => {
        return peticion(`/api/Departamento/${id}`, {
            method: 'DELETE'
        });
    }
};