import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Box, CircularProgress, TextField, InputAdornment, useMediaQuery, useTheme, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 16)
    }
  }, [center, map])
  return null
}

export default function MapaDireccion({ onDireccionSeleccionada }) {
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))

  const [position, setPosition] = useState(null)
  const [center, setCenter] = useState([19.4326, -99.1332])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aviso, setAviso] = useState('')

  const obtenerDireccion = async (lat, lng) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await res.json()

      if (data && data.address) {
        const addr = data.address
        onDireccionSeleccionada?.({
          calle: `${addr.road || ''} ${addr.house_number || ''}`.trim(),
          // En México OpenStreetMap guarda la colonia con distintos nombres; si no la tiene, se escribe a mano
          colonia: addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.city_district || addr.hamlet || '',
          ciudad: addr.city || addr.town || addr.village || '',
          estado: addr.state || '',
          pais: addr.country || 'México',
          cp: addr.postcode || '',
        })
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setPosition([lat, lng])
    obtenerDireccion(lat, lng)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setAviso('')
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setCenter([lat, lng])
        setPosition([lat, lng])
        obtenerDireccion(lat, lng)
      } else {
        setAviso('No se encontró la dirección. Intenta ser más específico.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error)
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar dirección (Ej. Av. Reforma 222, CDMX)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          } }}
        />
      </Box>
      {aviso && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: -1, mb: 1 }}>{aviso}</Typography>
      )}

      <Box
        sx={{
          position: 'relative',
          height: isSmUp ? 320 : 240, 
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1000,
              bgcolor: 'white',
              p: 1,
              borderRadius: 1,
              boxShadow: 2,
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}

        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} />
          {position && <Marker position={position} />}
        </MapContainer>
      </Box>
      <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary', textAlign: 'right' }}>
        Haz clic en el mapa para seleccionar la ubicación exacta.
      </Box>
    </Box>
  )
}