import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, ArrowLeft, Globe, Phone, MapPin, UploadCloud, Loader } from 'lucide-react';
import { useEPR } from '../hooks/useEPR';
import { createEPR, updateEPR, deleteEPR, uploadImage } from '../services/firebase';
import LocationMap from './LocationMap'; // Reutilizamos el mapa
import '../styles/EPRModal.css';

const EPRManagerModal = ({ onClose }) => {
  const { eprList, loadingEPR } = useEPR();
  const [view, setView] = useState('list'); // 'list' o 'form'
  const [editingId, setEditingId] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  // Estado del Formulario
  const initialForm = {
    nombre: '', ciudad: 'Cochabamba', telefono: '', whatsapp: '',
    web: '', facebook: '', imagen: '', 
    latitude: -17.3938, longitude: -66.1569,
    mapa: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- MANEJADORES DE VISTA ---
  const handleAddNew = () => {
    setFormData(initialForm);
    setImagePreview(null);
    setImageFile(null);
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (epr) => {
    setFormData({
      nombre: epr.nombre || '',
      ciudad: epr.ciudad || 'Cochabamba',
      telefono: epr.telefono || '',
      whatsapp: epr.whatsapp || '',
      web: epr.web || '',
      facebook: epr.facebook || '',
      imagen: epr.imagen || '',
      latitude: epr.latitude || -17.3938,
      longitude: epr.longitude || -66.1569,
      mapa: epr.mapa || ''
    });
    setImagePreview(epr.imagen || null);
    setImageFile(null);
    setEditingId(epr.id);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta unidad EPR?")) {
      await deleteEPR(id);
    }
  };

  // --- MANEJADORES DEL FORMULARIO ---
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

  const handleLocationSelect = (link) => {
    // El componente LocationMap devuelve un link, pero aquí necesitamos parsear las coordenadas
    // El link es formato: http://maps.google.com/maps?q=LAT,LNG
    try {
      const coords = link.split('?q=')[1].split(',');
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1]),
        mapa: link
      }));
    } catch (e) {
      console.error("Error parseando mapa", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      let imgUrl = formData.imagen;
      if (imageFile) {
        imgUrl = await uploadImage(imageFile);
      }

      const finalData = { ...formData, imagen: imgUrl };

      if (editingId) {
        await updateEPR(editingId, finalData);
      } else {
        await createEPR(finalData);
      }
      setView('list');
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
    setLoadingSave(false);
  };

  return (
    <div className="epr-overlay">
      <div className="epr-container">
        
        {/* HEADER */}
        <div className="epr-header">
          <h2>
            {view === 'list' ? 'Gestión de Unidades EPR' : (editingId ? 'Editar Unidad' : 'Nueva Unidad')}
          </h2>
          <button onClick={onClose} className="close-icon"><X size={24}/></button>
        </div>

        {/* --- VISTA LISTA (TABLA) --- */}
        {view === 'list' && (
          <div className="epr-body">
            <div className="epr-toolbar">
              <button className="btn-add-epr" onClick={handleAddNew}>
                <Plus size={18}/> Agregar Nueva Unidad
              </button>
            </div>

            <div className="table-responsive">
              <table className="epr-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Nombre</th>
                    <th>Ciudad</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEPR ? (
                    <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                  ) : eprList.map(epr => (
                    <tr key={epr.id}>
                      <td>
                        <img src={epr.imagen || 'https://via.placeholder.com/40'} alt="logo" className="epr-mini-logo"/>
                      </td>
                      <td className="fw-bold">{epr.nombre}</td>
                      <td><span className={`badge-city city-${epr.ciudad?.toLowerCase()}`}>{epr.ciudad}</span></td>
                      <td className="small-text">
                        <div><Phone size={12}/> {epr.telefono}</div>
                        {epr.web && <a href={epr.web} target="_blank" rel="noreferrer" className="link-icon"><Globe size={12}/> Web</a>}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(epr)} className="btn-icon-edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(epr.id)} className="btn-icon-delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VISTA FORMULARIO --- */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="epr-form-body">
            <div className="form-grid-epr">
              
              {/* Columna Izquierda */}
              <div className="col-left">
                <div className="form-group">
                  <label>Nombre de la Unidad / Bomberos</label>
                  <input required name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" placeholder="Ej: SAR Bolivia"/>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ciudad Base</label>
                    <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="form-select">
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Teléfono (Emergencias)</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" placeholder="12345678"/>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                     <label>WhatsApp (Coord.)</label>
                     <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="form-input"/>
                  </div>
                  <div className="form-group">
                     <label>Sitio Web</label>
                     <input name="web" value={formData.web} onChange={handleChange} className="form-input" placeholder="https://..."/>
                  </div>
                </div>

                <div className="form-group">
                    <label>Enlace Facebook</label>
                    <input name="facebook" value={formData.facebook} onChange={handleChange} className="form-input"/>
                </div>

                <div className="form-group">
                  <label>Logo de la Unidad</label>
                  <div className="image-upload-compact">
                     <input type="file" id="epr-logo" accept="image/*" onChange={handleImageChange} hidden />
                     <label htmlFor="epr-logo" className="upload-btn">
                        <UploadCloud size={20}/> Subir Logo
                     </label>
                     {imagePreview && <img src={imagePreview} alt="Preview" className="preview-mini"/>}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Mapa */}
              <div className="col-right">
                <label><MapPin size={16}/> Ubicación de la Base</label>
                <div className="map-wrapper-epr">
                   {/* Pasamos key para forzar re-render si cambia editingId y resetear posición */}
                   <LocationMap key={editingId || 'new'} onLocationSelect={handleLocationSelect} />
                </div>
                <div className="coords-display">
                   <small>Lat: {formData.latitude}</small>
                   <small>Lng: {formData.longitude}</small>
                </div>
              </div>
            </div>

            <div className="epr-footer">
              <button type="button" onClick={() => setView('list')} className="btn-back">
                <ArrowLeft size={18}/> Volver
              </button>
              <button type="submit" className="btn-save-epr" disabled={loadingSave}>
                {loadingSave ? <Loader className="spin" size={18}/> : <Save size={18}/>}
                {editingId ? 'Actualizar Unidad' : 'Registrar Unidad'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default EPRManagerModal;