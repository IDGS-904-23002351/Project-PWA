import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header' // Importamos el Header arriba

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Menú Lateral Fijo */}
      <Sidebar />

      {/* Área Principal con Header y Contenido */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}