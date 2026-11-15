import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from '../components/RutaProtegida'
import Layout from '../components/Layout'
import Inicio from '../pages/Inicio'
import Login from '../pages/Login'
import Departamentos from '../pages/Departamento'
import Planta from '../pages/Planta'
import Empleados from '../pages/Empleados'
import Asistencias from '../pages/Asistencias'   
import Solicitudes from '../pages/Solicitudes'
import Perfil from '../pages/Perfil'
import Bitacora from '../pages/Bitacora'
import Configuracion from '../pages/Configuracion'
import RutaPorRol from '../components/RutaPorRol'
import Turno from '../pages/TurnosPage'
import Nomina from '../pages/Nomina'
import Reportes from '../pages/Reportes'

// Los empleados consultan su asistencia, recibos y solicitudes en la app móvil.
// En la web, las pantallas con datos de todo el personal son solo para ADMIN y RRHH.
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="planta-qr" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Planta /></RutaPorRol>} />
          <Route path="departamentos" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Departamentos /></RutaPorRol>} />
          <Route path="turnos" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Turno /></RutaPorRol>} />
          <Route path="empleados" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Empleados /></RutaPorRol>} />
          <Route path="asistencias" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Asistencias /></RutaPorRol>} />
          <Route path="solicitudes" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Solicitudes /></RutaPorRol>} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="nomina" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Nomina /></RutaPorRol>} />
          <Route path="reportes" element={<RutaPorRol roles={['ADMIN', 'RRHH']}><Reportes /></RutaPorRol>} />
          <Route path="bitacora" element={<RutaPorRol roles={['ADMIN']}><Bitacora /></RutaPorRol>} />
          <Route path="configuracion" element={<RutaPorRol roles={['ADMIN']}><Configuracion /></RutaPorRol>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}