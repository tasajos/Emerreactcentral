import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, X, Siren } from 'lucide-react';
import '../styles/IncomingModal.css'; // Crearemos este archivo después

const IncomingAlertModal = ({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setIsVisible(true);
    
    // Reproducir sonido de alerta (opcional)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Sonido beep genérico
    audio.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
    
  }, []);

  if (!data) return null;

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="modal-container">
        
        {/* Encabezado de Alarma */}
        <div className="modal-header">
          <div className="pulsing-icon">
            <Siren size={32} color="white" />
          </div>
          <div className="header-text">
            <h2>¡NUEVA EMERGENCIA!</h2>
            <span>Atención requerida inmediata</span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo con datos gigantes */}
        <div className="modal-body">
          <div className="emergency-type-badge">
            {data.tipo || 'GENERAL'}
          </div>

          <h1 className="modal-title">{data.titulo || 'Emergencia Sin Título'}</h1>
          
          <div className="modal-highlight-box">
            <p className="modal-desc">
              {data.descripcion || 'Sin descripción detallada.'}
            </p>
          </div>

          <div className="modal-grid">
            <div className="modal-info-item">
              <label>Ubicación</label>
              <div className="info-content">
                <MapPin size={20} />
                {data.ciudad || 'Desconocida'}
              </div>
            </div>
            <div className="modal-info-item">
              <label>Fecha / Hora</label>
              <div className="info-content">
                {data.fecha} - {data.hora}
              </div>
            </div>
            <div className="modal-info-item">
              <label>Contacto</label>
              <div className="info-content">
                {data.telefonoResponsable || 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Mostrar imagen si existe en el modal */}
          {data.imagen && (
            <div className="modal-image-preview">
                <img src={data.imagen} alt="Evidencia" />
            </div>
          )}

        </div>

        {/* Footer con acciones */}
        <div className="modal-footer">
          <button className="modal-btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="modal-btn btn-danger" onClick={() => {
            // Aquí podrías navegar a la vista de detalle o abrir mapa
            window.open(data.ubicacion, '_blank');
            onClose();
          }}>
            <MapPin size={18} />
            Ver Ubicación y Atender
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingAlertModal;