import React, { useState } from 'react'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header' 

export default function Layout() {
  const theme = useTheme()
  const esPantallaChica = useMediaQuery(theme.breakpoints.down('md'))
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {esPantallaChica ? (
        <Drawer
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          ModalProps={{ keepMounted: true }}
          slotProps={{ paper: { sx: { bgcolor: '#0b132b', border: 'none' } } }}
        >
          <Sidebar enCajon onNavegar={() => setMenuAbierto(false)} />
        </Drawer>
      ) : (
        <Sidebar />
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header onAbrirMenu={esPantallaChica ? () => setMenuAbierto(true) : undefined} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
