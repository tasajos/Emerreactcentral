import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para el icono por defecto de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente para manejar el click en el mapa
function DraggableMarker({ position, setPosition, onLocationSelect }) {
  const markerRef = useRef(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          // Generar link de Google Maps
          const link = `http://maps.google.com/maps?q=${newPos.lat},${newPos.lng}`;
          onLocationSelect(link);
        }
      },
    }),
    [onLocationSelect, setPosition],
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span>¡Arrastrame para ajustar!</span>
      </Popup>
    </Marker>
  )
}

const LocationMap = ({ onLocationSelect }) => {
  // Centro inicial: Cochabamba
  const center = { lat: -17.3938, lng: -66.1569 };
  const [position, setPosition] = useState(center);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <MapContainer center={center} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker 
            position={position} 
            setPosition={setPosition}
            onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </div>
  );
};

export default LocationMap;