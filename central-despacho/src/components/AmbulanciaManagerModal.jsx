import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Save, ArrowLeft, Globe, Phone, MapPin, UploadCloud, Loader, Ambulance } from 'lucide-react';
import { useAmbulancia } from '../hooks/useAmbulancia';
import { createAmbulancia, updateAmbulancia, deleteAmbulancia, uploadImage } from '../services/firebase';
import LocationMap from './LocationMap';
import '../styles/EPRModal.css'; // Reutilizamos los mismos estilos de EPR

const AmbulanciaManagerModal = ({ onClose }) => {
  const { ambulanciaList, loadingAmbulancia } = useAmbulancia();
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

  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre || '',
      ciudad: item.ciudad || 'Cochabamba',
      telefono: item.telefono || '',
      whatsapp: item.whatsapp || '',
      web: item.web || '',
      facebook: item.facebook || '',
      imagen: item.imagen || '',
      latitude: item.latitude || -17.3938,
      longitude: item.longitude || -66.1569,
      mapa: item.mapa || ''
    });
    setImagePreview(item.imagen || null);
    setImageFile(null);
    setEditingId(item.id);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta unidad de Ambulancia?")) {
      await deleteAmbulancia(id);
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
        await updateAmbulancia(editingId, finalData);
      } else {
        await createAmbulancia(finalData);
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
        <div className="epr-header" style={{ background: '#0f172a' }}> {/* Fondo ligeramente diferente si deseas */}
          <h2>
            {view === 'list' ? 'Gestión de Ambulancias' : (editingId ? 'Editar Ambulancia' : 'Nueva Ambulancia')}
          </h2>
          <button onClick={onClose} className="close-icon"><X size={24}/></button>
        </div>

        {/* --- VISTA LISTA (TABLA) --- */}
        {view === 'list' && (
          <div className="epr-body">
            <div className="epr-toolbar">
              <button className="btn-add-epr" onClick={handleAddNew}>
                <Plus size={18}/> Agregar Nueva Ambulancia
              </button>
            </div>

            <div className="table-responsive">
              <table className="epr-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Nombre Unidad</th>
                    <th>Ciudad</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAmbulancia ? (
                    <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                  ) : ambulanciaList.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.imagen || 'https://via.placeholder.com/40'} alt="logo" className="epr-mini-logo"/>
                      </td>
                      <td className="fw-bold">{item.nombre}</td>
                      <td><span className={`badge-city city-${item.ciudad?.toLowerCase()}`}>{item.ciudad}</span></td>
                      <td className="small-text">
                        <div><Phone size={12}/> {item.telefono}</div>
                        {item.web && <a href={item.web} target="_blank" rel="noreferrer" className="link-icon"><Globe size={12}/> Web</a>}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(item)} className="btn-icon-edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(item.id)} className="btn-icon-delete"><Trash2 size={16}/></button>
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
              
              <div className="col-left">
                <div className="form-group">
                  <label>Nombre de la Unidad / Servicio</label>
                  <input required name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" placeholder="Ej: Ambulancias Cruz Roja"/>
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
                    <label>Teléfono (Urgencias)</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" placeholder="168"/>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                     <label>WhatsApp</label>
                     <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="form-input"/>
                  </div>
                  <div className="form-group">
                     <label>Sitio Web</label>
                     <input name="web" value={formData.web} onChange={handleChange} className="form-input"/>
                  </div>
                </div>

                <div className="form-group">
                    <label>Enlace Facebook</label>
                    <input name="facebook" value={formData.facebook} onChange={handleChange} className="form-input"/>
                </div>

                <div className="form-group">
                  <label>Logo de la Unidad</label>
                  <div className="image-upload-compact">
                     <input type="file" id="amb-logo" accept="image/*" onChange={handleImageChange} hidden />
                     <label htmlFor="amb-logo" className="upload-btn">
                        <UploadCloud size={20}/> Subir Logo
                     </label>
                     {imagePreview && <img src={imagePreview} alt="Preview" className="preview-mini"/>}
                  </div>
                </div>
              </div>

              <div className="col-right">
                <label><MapPin size={16}/> Ubicación de la Base</label>
                <div className="map-wrapper-epr">
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
                {editingId ? 'Actualizar Ambulancia' : 'Registrar Ambulancia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AmbulanciaManagerModal;