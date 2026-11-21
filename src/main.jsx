import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import 'leaflet/dist/leaflet.css';
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import theme from './theme.js'

// Edge (y a veces otros navegadores) guarda una "foto" de la página al salir de ella y la
// muestra tal cual al presionar Atrás, aunque ya se haya cerrado la sesión. Si la página
// viene de esa foto, se recarga para que la app revise la sesión de nuevo.
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
