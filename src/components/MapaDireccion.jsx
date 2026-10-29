// src/components/MapaDireccion.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Box, CircularProgress, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Corregir icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Componente para controlar el mapa desde afuera (mover el centro)
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
  const [position, setPosition] = useState(null)
  const [center, setCenter] = useState([19.4326, -99.1332]) // CDMX por defecto
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Función para obtener la dirección a partir de coordenadas (Geocodificación Inversa)
  const obtenerDireccion = async (lat, lng) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await res.json()
      
      if (data && data.address) {
        const addr = data.address
        onDireccionSeleccionada({
          calle: `${addr.road || ''} ${addr.house_number || ''}`.trim(),
          colonia: addr.suburb || addr.neighbourhood || '',
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

  // Manejar el clic en el mapa
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setPosition([lat, lng])
    obtenerDireccion(lat, lng)
  }

  // Manejar la búsqueda por texto (Geocodificación Directa)
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
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
        obtenerDireccion(lat, lng) // Llenar los campos del formulario
      } else {
        alert('No se encontró la dirección. Intenta ser más específico.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error)
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
      {/* Buscador sobre el mapa */}
      <Box 
        component="form" 
        onSubmit={handleSearch} 
        sx={{ display: 'flex', gap: 1, mb: 1.5 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar dirección (Ej. Av. Reforma 222, CDMX)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Contenedor del mapa */}
      <Box sx={{ position: 'relative', height: 300, borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, bgcolor: 'white', p: 1, borderRadius: 1, boxShadow: 2 }}>
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