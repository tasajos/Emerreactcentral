import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, MapPin, Clock, Info } from 'lucide-react';

// --- Configuración de Iconos Leaflet en React ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Icono Rojo para Emergencias ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SituationMap = ({ emergencias }) => {
  // Centro de Bolivia
  const centerBolivia = [-16.2902, -63.5887];

  // 1. Filtrar solo "En proceso"
  const emergenciasActivas = useMemo(() => {
    if (!emergencias) return [];
    return emergencias.filter(e => 
      e.estado && e.estado.toLowerCase() === 'en proceso'
    );
  }, [emergencias]);

  // 2. Extraer coordenadas (lat,lng) del link de Google Maps
  const getCoords = (ubicacion) => {
    if (!ubicacion) return null;
    try {
      // Soporta formato: "http://maps.google.com/maps?q=-17.39,-66.15"
      if (ubicacion.includes('?q=')) {
        const split = ubicacion.split('?q=')[1];
        if (split) {
          const [lat, lng] = split.split(',');
          if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            return [parseFloat(lat), parseFloat(lng)];
          }
        }
      }
      return null;
    } catch (e) {
      console.error("Error coordenadas:", e);
      return null;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#e2e8f0' }}>
      
      {/* Panel Flotante */}
      <div style={{
        position: 'absolute', top: 20, right: 20, zIndex: 1000,
        background: 'white', padding: '15px 20px', borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderLeft: '5px solid #dc2626'
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle color="#dc2626" size={20} /> Sala de Situación
        </h3>
        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
           Mostrando <b>{emergenciasActivas.length}</b> emergencias activas en Bolivia.
        </span>
      </div>

      <MapContainer 
        center={centerBolivia} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {emergenciasActivas.map(emergencia => {
          const position = getCoords(emergencia.ubicacion);
          
          if (!position) return null;

          return (
            <Marker key={emergencia.id} position={position} icon={redIcon}>
              <Popup>
                <div style={{ minWidth: '220px', fontFamily: 'sans-serif' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#b91c1c', fontSize: '1rem' }}>
                    {emergencia.titulo}
                  </h4>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      background: '#fee2e2', color: '#991b1b', 
                      padding: '3px 8px', borderRadius: '10px', 
                      fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                      {emergencia.tipo}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    {emergencia.descripcion}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <MapPin size={14}/> <b>Ciudad:</b> {emergencia.ciudad}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14}/> <b>Hora:</b> {emergencia.hora}
                    </div>
                  </div>

                  {emergencia.imagen && (
                    <div style={{ marginTop: '10px', width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={emergencia.imagen} alt="evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
};

export default SituationMap;