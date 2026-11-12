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
import Turno from './pages/TurnosPage';
import Reportes from './pages/Reportes';

// Roles que pueden abrir cada grupo de pantallas.
// Coinciden con la tabla RolMenu: el menú ya las oculta, y esto impide abrirlas escribiendo la URL.
const GESTION = ['ADMIN', 'RRHH']
const SOLO_ADMIN = ['ADMIN']

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          {/* Cualquier usuario con sesión */}
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="perfil" element={<Perfil />} />

          {/* Administración y Recursos Humanos */}
          <Route path="planta" element={<RutaPorRol roles={GESTION}><Planta /></RutaPorRol>} />
          <Route path="departamentos" element={<RutaPorRol roles={GESTION}><Departamentos /></RutaPorRol>} />
          <Route path="Turnos" element={<RutaPorRol roles={GESTION}><Turno /></RutaPorRol>} />
          <Route path="empleados" element={<RutaPorRol roles={GESTION}><Empleados /></RutaPorRol>} />
          <Route path="/reportes" element={<RutaPorRol roles={GESTION}><Reportes /></RutaPorRol>} />

          {/* Solo administrador */}
          <Route path="bitacora" element={<RutaPorRol roles={SOLO_ADMIN}><Bitacora /></RutaPorRol>} />
          <Route path="configuracion" element={<RutaPorRol roles={SOLO_ADMIN}><Configuracion /></RutaPorRol>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}