import React from 'react';
import { MapPin, Phone, Clock, AlertTriangle, ExternalLink, ArrowRight, Calendar } from 'lucide-react';

const AlertCard = ({ data,onManage }) => {
  if (!data) return null;

  // 1. Lógica de Colores según el TIPO de emergencia
  const getTypeStyle = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('incendio')) return 'type-fire';
    if (t.includes('policial') || t.includes('robo')) return 'type-police';
    if (t.includes('vehicular') || t.includes('choque') || t.includes('accidente')) return 'type-traffic';
    if (t.includes('rescate')) return 'type-rescue';
    if (t.includes('medico') || t.includes('salud')) return 'type-health';
    return 'type-general'; // Por defecto
  };

  const typeClass = getTypeStyle(data.tipo);

  // 2. Función para abrir el mapa
  const handleOpenMap = () => {
    if (data.ubicacion) {
      window.open(data.ubicacion, '_blank');
    } else {
      alert("No hay coordenadas registradas para esta emergencia.");
    }
  };

  return (
    <div className={`alert-card ${typeClass}`}>
      {/* Header con Color Característico */}
      <div className="card-top-bar">
        <div className="card-type-label">
          <AlertTriangle size={14} strokeWidth={3} />
          {data.tipo || 'GENERAL'}
        </div>
        {/* Usamos subestado o estado para la etiqueta derecha (ej: VENCIDO, ATENDIDO) */}
        <div className="card-status-label">
          {data.subestado || data.estado || 'PENDIENTE'}
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{data.titulo || 'Emergencia Sin Título'}</h3>
        <p className="card-desc">
            {data.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* 3. Mostrar Imagen si existe */}
        {data.imagen && (
          <div className="card-image-container">
            <img src={data.imagen} alt="Evidencia" className="card-img" />
          </div>
        )}

        <div className="card-details">
          <div className="detail-row">
            <MapPin size={15} />
            <span className="text-truncate">{data.ciudad || 'Ubicación desconocida'}</span>
          </div>
          
          <div className="detail-row">
            <Calendar size={15} />
            <span>{data.fecha} - {data.hora}</span>
          </div>
          
          {data.telefonoResponsable && (
            <div className="detail-row">
              <Phone size={15} />
              <span>{data.telefonoResponsable}</span>
            </div>
          )}
        </div>
        
        <div className="card-actions">
          <button onClick={handleOpenMap} className="action-btn btn-outline">
            <ExternalLink size={16} /> Mapa
          </button>
          {/* Botón Gestionar activado */}
          <button 
            className="action-btn btn-primary"
            onClick={() => onManage(data)} // <--- Acción al clickear
          >
            Gestionar <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;