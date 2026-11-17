import { createTheme } from '@mui/material/styles'

export const colores = {
  primario: '#0F766E',
  primarioOscuro: '#115E59', 
  primarioClaro: '#CCFBF1', 
  secundario: '#0284C7', 
  exito: '#10B981', 
  error: '#EF4444',
  fondo: '#F8FAFC',
  texto: '#0F172A',
  textoSuave: '#64748B',
}

const theme = createTheme({
  palette: {
    primary: { main: colores.primario, dark: colores.primarioOscuro, light: colores.primarioClaro },
    secondary: { main: colores.secundario },
    success: { main: colores.exito },
    error: { main: colores.error },
    background: { default: colores.fondo, paper: '#FFFFFF' },
    text: { primary: colores.texto, secondary: colores.textoSuave },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, padding: '10px 20px' } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
  },
})

export default theme
