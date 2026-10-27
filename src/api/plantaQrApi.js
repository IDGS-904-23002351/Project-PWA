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

export const plantaQrApi = {
    // Ubicación de Planta
    obtenerUbicacion: async () => {
        return peticion(`/api/Ubicacion`, { method: 'GET' });
    },
    guardarUbicacion: async (ubicacion) => {
        return peticion(`/api/Ubicacion`, {
            method: 'POST',
            body: JSON.stringify(ubicacion)
        });
    },

    // Dispositivo QR
    obtenerQரையVigente: async (ubicacionId) => {
        return peticion(`/api/DispositivoQR/${ubicacionId}`, { method: 'GET' });
    },
    regenerarQR: async (dispositivoQR) => {
        return peticion(`/api/DispositivoQR`, {
            method: 'POST',
            body: JSON.stringify(dispositivoQR)
        });
    },

    // Días Festivos
    listarDiasFestivos: async (anio) => {
        return peticion(`/api/DiaFestivo/${anio}`, { method: 'GET' });
    },
    guardarDiaFestivo: async (diaFestivo) => {
        return peticion(`/api/DiaFestivo`, {
            method: 'POST',
            body: JSON.stringify(diaFestivo)
        });
    },
    actualizarDiaFestivo: async (id, diaFestivo) => {
        return peticion(`/api/DiaFestivo`, {
            method: 'POST',
            body: JSON.stringify({ ...diaFestivo, id })
        });
    },
    eliminarDiaFestivo: async (id) => {
        return peticion(`/api/DiaFestivo/${id}`, {
            method: 'DELETE'
        });
    }
};