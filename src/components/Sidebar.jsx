import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import QrCodeIcon from '@mui/icons-material/QrCode'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssignmentIcon from '@mui/icons-material/Assignment'
import DescriptionIcon from '@mui/icons-material/Description'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import { useAuth } from '../context/AuthContext'
import { obtenerMenuUsuario } from '../api/inicioApi.js'

const ICONOS_MAP = {
  Inicio: <HomeIcon />,
  Empleados: <PeopleIcon />,
  'Departamentos y cargos': <BusinessIcon />,
  'Planta y QR': <QrCodeIcon />,
  Turnos: <ScheduleIcon />,
  Asistencias: <CheckCircleIcon />,
  Solicitudes: <AssignmentIcon />,
  Nómina: <DescriptionIcon />,
  Reportes: <BarChartIcon />,
  Configuración: <SettingsIcon />,
  Bitácora: <HistoryIcon />,
}

const MENU_COMPLETO_FALLBACK = [
  { id: 1, nombre: 'Inicio', ruta: '/inicio' },
  { id: 2, nombre: 'Empleados', ruta: '/empleados' },
  { id: 3, nombre: 'Departamentos y cargos', ruta: '/departamentos' },
  { id: 4, nombre: 'Planta y QR', ruta: '/planta-qr' },
  { id: 5, nombre: 'Turnos', ruta: '/turnos' },
  { id: 6, nombre: 'Asistencias', ruta: '/asistencias' },
  { id: 7, nombre: 'Solicitudes', ruta: '/solicitudes' },
  { id: 8, nombre: 'Nómina', ruta: '/nomina' },
  { id: 9, nombre: 'Reportes', ruta: '/reportes' },
  { id: 10, nombre: 'Bitácora', ruta: '/bitacora' },
  { id: 11, nombre: 'Configuración', ruta: '/configuracion' },
]

export default function Sidebar() {
  const { sesion } = useAuth()
  const location = useLocation()
  const [opcionesMenu, setOpcionesMenu] = useState([])

  useEffect(() => {
    async function cargarMenu() {
      if (sesion?.usuario?.id && sesion?.token) {
        try {
          const menuData = await obtenerMenuUsuario(sesion.token, sesion.usuario.id)
          setOpcionesMenu(Array.isArray(menuData) && menuData.length > 0 ? menuData : MENU_COMPLETO_FALLBACK)
        } catch (error) {
          console.error('Error al obtener menú dinámico:', error)
          setOpcionesMenu(MENU_COMPLETO_FALLBACK)
        }
      }
    }
    cargarMenu()
  }, [sesion])

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: '#0b132b',
        color: 'white',
        position: 'sticky',
        top: 0,
        height: '100vh',
        alignSelf: 'flex-start',
        boxSizing: 'border-box',
        p: 2,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Box>
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#0284c7',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.2rem',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            N
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: 0.5 }}>
              Nomi
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
              CALZADO ALBA
            </Typography>
          </Box>
        </Box>

        <List component="nav" sx={{ mt: 1 }}>
          {opcionesMenu.map((item) => {
            const rutaLimpia = item.ruta?.startsWith('/') ? item.ruta : `/${item.ruta || ''}`
            const estaActivo = location.pathname === rutaLimpia || (item.nombre === 'Inicio' && location.pathname === '/')
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={rutaLimpia || '/inicio'}
                  selected={estaActivo}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: '#0f766e',
                      color: 'white',
                      '&:hover': { bgcolor: '#115e59' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                    {ICONOS_MAP[item.nombre] || <HomeIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.nombre} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Box>
  )
}