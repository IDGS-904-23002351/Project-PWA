import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Empleados from './pages/Empleados';
import Asistencias from './pages/Asistencias'   
import Solicitudes from './pages/Solicitudes'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="solicitudes" element={<Solicitudes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}