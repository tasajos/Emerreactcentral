import React, { useState, useMemo, useEffect, useRef } from 'react';
import AlertList from './components/AlertList';
import IncomingAlertModal from './components/IncomingAlertModal';
import ManageModal from './components/ManageModal';
import NewEmergencyModal from './components/NewEmergencyModal';
import EPRManagerModal from './components/EPRManagerModal';
import AmbulanciaManagerModal from './components/AmbulanciaManagerModal';
import Navbar from './components/Navbar';
import SituationMap from './components/SituationMap';

import { useEmergencias } from './hooks/useFirebase';
import { updateEmergencia, deleteEmergencia, createEmergencia, uploadImage } from './services/firebase';
import { Bell, Search, List, Activity, Clock, AlertTriangle } from 'lucide-react';
import './styles/App.css';

function App() {
  // --- ESTADOS DE NAVEGACIÓN Y VISTA ---
  const [isSituationMode, setIsSituationMode] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADOS DE MODALES ---
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [newAlertData, setNewAlertData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEPRModal, setShowEPRModal] = useState(false);
  const [showAmbulanciaModal, setShowAmbulanciaModal] = useState(false);
  
  // --- DATA FIREBASE ---
  const { emergencias, loading, error } = useEmergencias();
  const previousEmergenciasRef = useRef([]);
  const isFirstLoad = useRef(true);

  // --- EFECTO: DETECTAR MODO SITUACIÓN (URL) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'situacion') {
      setIsSituationMode(true);
    }
  }, []);

  // --- MANEJADORES DE ACCIONES ---
  
  // Abrir modal de gestión
  const handleManageClick = (emergencia) => {
    console.log("Abriendo gestión para:", emergencia);
    setSelectedEmergency(emergencia);
  };

  // Guardar cambios en una emergencia existente
  const handleSaveEmergency = async (id, updatedData) => {
    try {
      await updateEmergencia(id, updatedData);
      setSelectedEmergency(null);
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    }
  };

  // Eliminar una emergencia
  const handleDeleteEmergencia = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas ELIMINAR esta emergencia? Esta acción no se puede deshacer.")) {
      try {
        await deleteEmergencia(id);
        setSelectedEmergency(null); 
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  // Crear una nueva emergencia (con subida de imagen)
  const handleCreateEmergency = async (formData, imageFile) => {
    try {
      let imageUrl = "";
      // Si hay imagen, subirla a Storage primero
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Crear objeto final con la URL de la imagen
      const finalData = { ...formData, imagen: imageUrl };
      
      // Guardar en Realtime Database
      await createEmergencia(finalData);
      
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creando emergencia:", err);
      alert("Hubo un error al crear la emergencia.");
    }
  };

  // --- EFECTO: DETECCIÓN DE NUEVA ALERTA ENTRANTE ---
  useEffect(() => {
    if (loading) return;

    // Si es la primera carga, solo actualizamos la referencia
    if (isFirstLoad.current) {
      previousEmergenciasRef.current = emergencias;
      isFirstLoad.current = false;
      return;
    }

    // Si hay más emergencias que antes, es una nueva alerta
    if (emergencias.length > previousEmergenciasRef.current.length) {
      const prevIds = new Set(previousEmergenciasRef.current.map(e => e.id));
      const nuevas = emergencias.filter(e => !prevIds.has(e.id));
      
      if (nuevas.length > 0) {
        setNewAlertData(nuevas[0]); // Activa el modal rojo
      }
    }
    previousEmergenciasRef.current = emergencias;
  }, [emergencias, loading]);

  // --- LÓGICA DE FILTROS ---
  const datosProcesados = useMemo(() => {
    if (!emergencias) return { filtradas: [], stats: { total: 0, pendientes: 0, enProceso: 0, resueltas: 0 } };

    const stats = {
      total: emergencias.length,
      pendientes: emergencias.filter(e => e.estado === 'Pendiente').length,
      enProceso: emergencias.filter(e => e.estado === 'En proceso').length,
      resueltas: emergencias.filter(e => e.estado === 'Resuelto').length
    };

    let resultado = emergencias;
    
    // Filtro por pestaña
    if (vistaActiva === 'pendientes') resultado = resultado.filter(e => e.estado === 'Pendiente');
    else if (vistaActiva === 'en-proceso') resultado = resultado.filter(e => e.estado === 'En proceso');
    else if (vistaActiva === 'resueltas') resultado = resultado.filter(e => e.estado === 'Resuelto');

    // Filtro por buscador
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      resultado = resultado.filter(item => 
        item.titulo?.toLowerCase().includes(lowerSearch) ||
        item.descripcion?.toLowerCase().includes(lowerSearch) ||
        item.ciudad?.toLowerCase().includes(lowerSearch)
      );
    }
    return { filtradas: resultado, stats };
  }, [emergencias, vistaActiva, searchTerm]);

  return (
    <div className="app-container">
      
      {/* --- MODALES GLOBALES (Siempre disponibles) --- */}
      
      {/* Modal Rojo de Nueva Alerta Entrante */}
      {newAlertData && (
        <IncomingAlertModal 
          data={newAlertData} 
          onClose={() => setNewAlertData(null)} 
        />
      )}

      {/* Modal de Creación Manual */}
      {showCreateModal && (
        <NewEmergencyModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateEmergency} 
        />
      )}

      {/* Modales de Configuración */}
      {showEPRModal && <EPRManagerModal onClose={() => setShowEPRModal(false)} />}
      {showAmbulanciaModal && <AmbulanciaManagerModal onClose={() => setShowAmbulanciaModal(false)} />}

      {/* --- HEADER (Visible en ambas vistas) --- */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon"><Bell size={20} /></div>
            <div>
              <h1 className="header-title">Central de Emergencias</h1>
              <p className="header-subtitle">Monitoreo y despacho en tiempo real</p>
            </div>
          </div>

          {/* Navbar Centrado */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <Navbar 
              onNewEmergency={() => setShowCreateModal(true)}
              onOpenEPR={() => setShowEPRModal(true)} 
              onOpenAmbulancia={() => setShowAmbulanciaModal(true)}
            />
          </div>

          {/* Estadísticas Rápidas */}
          <div className="header-stats">
            <div className="stat-badge status-pendiente">
              <AlertTriangle size={14}/> {datosProcesados.stats.pendientes} Pendientes
            </div>
            <div className="stat-badge status-en-proceso">
              <Activity size={14}/> {datosProcesados.stats.enProceso} En Proceso
            </div>
            <div className="stat-badge status-resuelto">
              <Clock size={14}/> {datosProcesados.stats.resueltas} Resueltas
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* Ajustamos padding a 0 si es mapa para que sea pantalla completa */}
      <main className="main-container" style={{ padding: isSituationMode ? 0 : '2rem' }}>
        
        {/* CONDICIONAL: ¿Mostrar Mapa o Dashboard? */}
        {isSituationMode ? (
          
          /* VISTA 1: MAPA SITUACIONAL */
          <SituationMap emergencias={emergencias} />

        ) : (
          
          /* VISTA 2: DASHBOARD DE GESTIÓN */
          <div className="content-wrapper">
            
            {/* Modal de Gestión (Solo necesario aquí) */}
            {selectedEmergency && (
              <ManageModal 
                data={selectedEmergency}
                onClose={() => setSelectedEmergency(null)}
                onSave={handleSaveEmergency}
                onDelete={handleDeleteEmergencia}
              />
            )}

            {/* Barra de Filtros y Buscador */}
            <div className="filters-container">
              <div className="vista-buttons">
                <button onClick={() => setVistaActiva('todas')} className={`vista-btn ${vistaActiva === 'todas' ? 'active' : ''}`}>
                  <List size={16} /> Todas ({datosProcesados.stats.total})
                </button>
                <button onClick={() => setVistaActiva('pendientes')} className={`vista-btn ${vistaActiva === 'pendientes' ? 'active' : ''}`}>
                  Pendientes
                </button>
                <button onClick={() => setVistaActiva('en-proceso')} className={`vista-btn ${vistaActiva === 'en-proceso' ? 'active' : ''}`}>
                  En Proceso
                </button>
                <button onClick={() => setVistaActiva('resueltas')} className={`vista-btn ${vistaActiva === 'resueltas' ? 'active' : ''}`}>
                  Resueltas
                </button>
              </div>

              <div className="search-box">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar emergencia..." 
                  className="search-input" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && <div className="error-msg">Error: {error}</div>}

            {/* Lista de Tarjetas */}
            <AlertList 
              emergencias={datosProcesados.filtradas} 
              loading={loading} 
              onManage={handleManageClick} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;