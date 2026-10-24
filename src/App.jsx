import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Empleados from './pages/Empleados';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<Inicio />}> 
          <Route path="empleados" element={<Empleados />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}