import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Departamentos from './pages/Departamento';
import Planta from './pages/Planta';
import Empleados from './pages/Empleados';
import Asistencias from './pages/Asistencias'   
import Solicitudes from './pages/Solicitudes'
import Perfil from './pages/Perfil'
import Bitacora from './pages/Bitacora'
import Configuracion from './pages/Configuracion'
import RutaPorRol from './components/RutaPorRol'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="planta" element={<Planta />} />
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="perfil" element={<Perfil />} />
          <Route
            path="bitacora"
            element={
              <RutaPorRol roles={['ADMIN']}>
                <Bitacora />
              </RutaPorRol>
            }
          />
          <Route
            path="configuracion"
            element={
              <RutaPorRol roles={['ADMIN']}>
                <Configuracion />
              </RutaPorRol>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}