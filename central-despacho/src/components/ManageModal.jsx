import React, { useState, useEffect } from 'react';
import { X, Save, Shield, MapPin, AlertTriangle, Radio } from 'lucide-react';
import { useEPR } from '../hooks/useEPR';
import '../styles/ManageModal.css'; // Crearemos este CSS abajo

const ManageModal = ({ data, onClose, onSave }) => {
  const { eprList } = useEPR(); // Obtenemos todas las unidades
  
  // Estado local del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    ciudad: '',
    estado: 'Pendiente',
    tipo: 'General',
    asignadoA: '' // ID o Nombre del EPR asignado
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (data) {
      setFormData({
        titulo: data.titulo || '',
        ciudad: data.ciudad || '',
        estado: data.estado || 'Pendiente',
        tipo: data.tipo || 'General',
        asignadoA: data.asignadoA || ''
      });
    }
  }, [data]);

  // Filtrar EPRs por ciudad seleccionada
  const eprDisponibles = eprList.filter(unit => 
    unit.ciudad?.toLowerCase() === formData.ciudad?.toLowerCase()
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data.id, formData);
  };

  return (
    <div className="manage-overlay">
      <div className="manage-container">
        <div className="manage-header">
          <h2><Shield size={24}/> Gestionar Emergencia</h2>
          <button onClick={onClose} className="close-icon"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="manage-body">
          
          {/* Fila 1: Título */}
          <div className="form-group">
            <label>Título del Evento</label>
            <input 
              type="text" 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>

          {/* Fila 2: Ciudad y Estado */}
          <div className="form-row">
            <div className="form-group">
              <label><MapPin size={14}/> Ciudad</label>
              <input 
                type="text" 
                name="ciudad" 
                value={formData.ciudad} 
                onChange={handleChange} 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label><Radio size={14}/> Estado Actual</label>
              <select 
                name="estado" 
                value={formData.estado} 
                onChange={handleChange} 
                className={`form-select status-${formData.estado.toLowerCase().replace(' ', '-')}`}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En Proceso</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Tipo de Incidente */}
          <div className="form-group">
            <label><AlertTriangle size={14}/> Tipo de Incidente</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-select">
              <option value="Rescate">Rescate</option>
              <option value="Incendio">Incendio</option>
              <option value="Rescate Animal">Rescate Animal</option>
              <option value="Atencion Medica">Atención Médica</option>
              <option value="Inundacion">Inundación</option>
              <option value="Policial">Policial</option>
              <option value="General">General / Otro</option>
            </select>
          </div>

          {/* Fila 4: Asignación de EPR (Dinámico) */}
          <div className="form-group highlight-group">
            <label>Asignar EPR Vigente ({formData.ciudad})</label>
            <select 
              name="asignadoA" 
              value={formData.asignadoA} 
              onChange={handleChange} 
              className="form-select"
            >
              <option value="">-- Seleccionar Unidad --</option>
              {eprDisponibles.length > 0 ? (
                eprDisponibles.map(epr => (
                  <option key={epr.id} value={epr.nombre || epr.id}>
                    {epr.nombre} {epr.estado ? `(${epr.estado})` : ''}
                  </option>
                ))
              ) : (
                <option disabled>No hay unidades registradas en {formData.ciudad}</option>
              )}
            </select>
            <small className="help-text">
                {eprDisponibles.length} unidades encontradas en esta zona.
            </small>
          </div>

          <div className="manage-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save"><Save size={18}/> Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageModal;