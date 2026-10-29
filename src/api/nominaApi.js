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

export const nominaApi = {
    // --- PERIODOS ---

    // Obtener periodos (admite filtros opcionales por id y/o estado, ej: /api/Nomina/periodos?estado=ABIERTO)
    listarPeriodos: async (id = null, estado = null) => {
        const params = new URLSearchParams();
        if (id) params.append('id', id);
        if (estado) params.append('estado', estado);
        const query = params.toString() ? `?${params.toString()}` : '';
        return peticion(`/api/Nomina/periodos${query}`, { method: 'GET' });
    },

    // Crear un nuevo periodo de nómina automático
    guardarPeriodo: async (periodo) => {
        return peticion(`/api/Nomina/periodos`, {
            method: 'POST',
            body: JSON.stringify(periodo)
        });
    },

    // Cerrar y pagar un periodo de nómina específico
    cerrarPeriodo: async (periodoId) => {
        return peticion(`/api/Nomina/periodos/cerrar/${periodoId}`, {
            method: 'POST'
        });
    },

    // --- CÁLCULO Y VISTA PREVIA DE NÓMINA ---

    // Consultar el listado de nóminas calculadas para un periodo
    obtenerNominaPorPeriodo: async (periodoId) => {
        return peticion(`/api/Nomina/periodo/${periodoId}`, { method: 'GET' });
    },

    // Guardar el cálculo general de la nómina de un empleado
    guardarNominaCalculada: async (nomina) => {
        return peticion(`/api/Nomina/calcular`, {
            method: 'POST',
            body: JSON.stringify(nomina)
        });
    },

    // Ejecutar el cálculo masivo de la nómina para todo el periodo
    calcularNominaPeriodo: async (periodoId) => {
        return peticion(`/api/Nomina/calcular-periodo/${periodoId}`, {
            method: 'POST'
        });
    },

    // --- DETALLE DE NÓMINA (CONCEPTOS) ---

    // Registrar un concepto o detalle individual dentro de un recibo de nómina
    guardarDetalleNomina: async (detalle) => {
        return peticion(`/api/Nomina/detalle`, {
            method: 'POST',
            body: JSON.stringify(detalle)
        });
    },

    // Consultar los conceptos (percepciones y deducciones) de un recibo de nómina específico
    obtenerDetalleRecibo: async (nominaId) => {
        return peticion(`/api/Nomina/detalle/${nominaId}`, { method: 'GET' });
    }
};