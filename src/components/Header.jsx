import React, { useState } from 'react'
import { Box, InputBase, Avatar, Typography, IconButton, Badge, Menu, MenuItem } from '@mui/material'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { sesion, cerrarSesion } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const nombreUsuario = sesion?.usuario?.nombre || 'Usuario'
  const rolUsuario = sesion?.usuario?.rol || 'Recursos Humanos'
  
  const iniciales = nombreUsuario
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Buscador Global Dinámico */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#f8fafc',
          px: 2,
          py: 0.8,
          borderRadius: 2.5,
          border: '1px solid #e2e8f0',
          width: 320,
        }}
      >
        <SearchOutlinedIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />
        <InputBase
          placeholder="Buscar empleados, reportes..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ fontSize: '0.875rem', width: '100%', color: '#334155' }}
        />
        <Box
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 1,
            px: 0.8,
            py: 0.2,
            fontSize: '0.7rem',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          ⌘ K
        </Box>
      </Box>

      {/* Notificaciones y Perfil de Usuario */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton size="small" sx={{ color: '#64748b' }}>
          <Badge badgeContent={1} color="error" variant="dot">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>

        <Box
          onClick={handleOpenMenu}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            p: 0.5,
            borderRadius: 2,
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#ccfbf1',
              color: '#0f766e',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {iniciales}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1e293b' }}>
              {nombreUsuario}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              {rolUsuario}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ color: '#64748b', fontSize: 18 }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{ sx: { borderRadius: 2, mt: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
        >
          <MenuItem onClick={() => { handleCloseMenu(); cerrarSesion(); }}>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}