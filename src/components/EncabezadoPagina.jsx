import { Box, Typography } from '@mui/material'

// Título y subtítulo que llevan todas las pantallas (como en el Figma)
export default function EncabezadoPagina({ titulo, descripcion, acciones }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: 26, md: 32 } }}>
          {titulo}
        </Typography>
        {descripcion && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {descripcion}
          </Typography>
        )}
      </Box>
      {acciones}
    </Box>
  )
}
