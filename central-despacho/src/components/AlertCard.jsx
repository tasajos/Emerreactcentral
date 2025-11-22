import React from 'react';
import { MapPin, Phone, Clock, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';

const AlertCard = ({ data }) => {
  if (!data) return null;

  const estadoRaw = data.estado || 'desconocido';
  // Creamos un string seguro para usar como clase CSS (ej: "En proceso" -> "en-proceso")
  const estadoClass = estadoRaw.trim().toLowerCase().replace(/\s+/g, '-');
  
  const tituloSeguro = data.titulo || 'Emergencia Sin Título';
  const tipoSeguro = data.tipo || 'General';

  return (
    // Agregamos la clase border-[estado] definida en CSS
    <div className={`alert-card border-${estadoClass}`}>
      
      <div className="card-header">
        <span className="alert-type">
          <AlertTriangle size={14} />
          {tipoSeguro}
        </span>
        <span className={`status-badge status-${estadoClass}`}>
          {estadoRaw}
        </span>
      </div>

      <h3 className="card-title">{tituloSeguro}</h3>
      <p className="card-desc">
        {data.descripcion ? 
          (data.descripcion.length > 80 ? data.descripcion.substring(0, 80) + '...' : data.descripcion) 
          : 'Sin descripción disponible para este reporte.'}
      </p>

      <div className="card-details">
        <div className="detail-row">
          <MapPin size={15} />
          <span>{data.ciudad || 'Ubicación no registrada'}</span>
        </div>
        
        <div className="detail-row">
          <Clock size={15} />
          <span>{data.fecha || '--/--/----'}</span>
        </div>
        
        {data.telefonoResponsable && (
           <div className="detail-row">
             <Phone size={15} />
             <span>{data.telefonoResponsable}</span>
           </div>
        )}
      </div>
      
      <div className="card-actions">
        <button className="action-btn btn-outline">
          <ExternalLink size={16} style={{display:'inline', marginRight:5}}/> Mapa
        </button>
        <button className="action-btn btn-primary">
          Gestionar <ArrowRight size={16} style={{display:'inline', marginLeft:5}}/>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;