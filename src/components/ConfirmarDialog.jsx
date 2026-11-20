import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, CircularProgress,
} from '@mui/material'

// Ventana para confirmar una acción con el mismo estilo que el resto de la web
// (antes se usaba window.confirm, que muestra la ventana gris del navegador).
//
// Uso:
//   const [confirmar, setConfirmar] = useState(null)
//   setConfirmar({ titulo, mensaje, textoBoton, accion: async () => { ... } })
//   <ConfirmarDialog datos={confirmar} onCerrar={() => setConfirmar(null)} />
export default function ConfirmarDialog({ datos, onCerrar }) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await datos?.accion?.()
    } finally {
      setProcesando(false)
      onCerrar()
    }
  }

  return (
    <Dialog open={Boolean(datos)} onClose={procesando ? undefined : onCerrar} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{datos?.titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{datos?.mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCerrar} disabled={procesando} color="inherit" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={confirmar}
          disabled={procesando}
          variant="contained"
          color={datos?.color || 'error'}
          sx={{ textTransform: 'none', minWidth: 110 }}
        >
          {procesando ? <CircularProgress size={20} color="inherit" /> : (datos?.textoBoton || 'Confirmar')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
