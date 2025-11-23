import React, { useState } from 'react';
import { X, Save, AlertOctagon, MapPin, Image as ImageIcon, Loader, UploadCloud } from 'lucide-react';
import LocationMap from './LocationMap';
import '../styles/NewEmergencyModal.css';

const NewEmergencyModal = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fecha y Hora actuales por defecto
  const now = new Date();
  const defaultDate = now.toLocaleDateString('es-GB'); // DD/MM/YYYY
  const defaultTime = now.toLocaleTimeString('es-GB', { hour: '2-digit', minute: '2-digit' });

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'General',
    ciudad: 'Cochabamba',
    descripcion: '',
    telefonoResponsable: '',
    ubicacion: `http://maps.google.com/maps?q=-17.3938,-66.1569`, // Default Cochabamba
    fecha: defaultDate,
    hora: defaultTime,
    estado: 'Pendiente'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (googleMapsLink) => {
    setFormData(prev => ({ ...prev, ubicacion: googleMapsLink }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir los datos al componente padre (App.jsx) que manejará la lógica de Firebase
      await onSave(formData, imageFile);
    } catch (error) {
      console.error(error);
      alert("Error en el formulario");
      setLoading(false);
    }
  };

  return (
    <div className="new-alert-overlay">
      <div className="new-alert-container">
        
        {/* Header Rojo */}
        <div className="new-alert-header">
          <h2><AlertOctagon size={24}/> NUEVA EMERGENCIA</h2>
          <button onClick={onClose} className="close-btn-white"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="new-alert-body">
          <div className="form-grid">
            
            {/* Columna Izquierda: Datos Básicos */}
            <div className="form-column">
              <div className="form-group">
                <label>Título de la Emergencia</label>
                <input required type="text" name="titulo" placeholder="Ej: Incendio en fábrica..." value={formData.titulo} onChange={handleChange} className="form-input"/>
              </div>

              <div className="form-row">
                 <div className="form-group">
                  <label>Tipo</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-select">
                    <option value="Incendio">Incendio</option>
                    <option value="Rescate">Rescate</option>
                    <option value="Policial">Policial</option>
                    <option value="Accidente">Accidente</option>
                    <option value="Medico">Médico</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="form-select">
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción Detallada</label>
                <textarea required name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} className="form-textarea" placeholder="Describa la situación..."></textarea>
              </div>

              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input type="tel" name="telefonoResponsable" value={formData.telefonoResponsable} onChange={handleChange} className="form-input" placeholder="Celular / Teléfono"/>
              </div>

               {/* Carga de Imagen */}
               <div className="form-group">
                <label>Evidencia (Imagen)</label>
                <div className="image-upload-box">
                  <input type="file" id="file-upload" accept="image/*" onChange={handleImageChange} hidden />
                  <label htmlFor="file-upload" className="upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="img-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <UploadCloud size={32} />
                        <span>Click para subir foto</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mapa y Ubicación */}
            <div className="form-column">
               <div className="form-group">
                 <label><MapPin size={16}/> Ubicación (Arrastra el marcador)</label>
                 <LocationMap onLocationSelect={handleLocationSelect} />
                 <input type="text" readOnly value={formData.ubicacion} className="form-input map-link-input" />
               </div>

               <div className="form-info-box">
                 <p><strong>Fecha:</strong> {formData.fecha}</p>
                 <p><strong>Hora:</strong> {formData.hora}</p>
                 <p><strong>Estado:</strong> <span className="status-badge-form">{formData.estado}</span></p>
               </div>
            </div>

          </div>

          <div className="new-alert-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-submit-alert" disabled={loading}>
              {loading ? <><Loader size={18} className="spin"/> Guardando...</> : <><Save size={18}/> Registrar Emergencia</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEmergencyModal;