import React, { useState, useMemo, useEffect, useRef } from 'react';
import AlertList from './components/AlertList';
import IncomingAlertModal from './components/IncomingAlertModal';
import { useEmergencias } from './hooks/useFirebase';
import { Bell, Search, List, Activity, Clock, AlertTriangle } from 'lucide-react';
import ManageModal from './components/ManageModal';
import './styles/App.css';
import Navbar from './components/Navbar';
import NewEmergencyModal from './components/NewEmergencyModal';
import EPRManagerModal from './components/EPRManagerModal';
import { updateEmergencia,   deleteEmergencia,   createEmergencia, uploadImage } from './services/firebase';

function App() {
  const [vistaActiva, setVistaActiva] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [newAlertData, setNewAlertData] = useState(null);

  // 2. ESTADO PARA EL MODAL DE CREACIÓN
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEPRModal, setShowEPRModal] = useState(false);
  
  const { emergencias, loading, error } = useEmergencias();

  // Refs para control de nuevas alertas
  const previousEmergenciasRef = useRef([]);
  const isFirstLoad = useRef(true);

  // Función que se ejecuta al clickear "Gestionar"
  const handleManageClick = (emergencia) => {
    console.log("Abriendo gestión para:", emergencia); // Debug
    setSelectedEmergency(emergencia);
  };

  // Función para guardar cambios en Firebase
  const handleSaveEmergency = async (id, updatedData) => {
    try {
      await updateEmergencia(id, updatedData);
      setSelectedEmergency(null); // Cerrar modal
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    }
  };


  //  FUNCIÓN PARA ELIMINAR
  const handleDeleteEmergencia = async (id) => {
    // Confirmación simple del navegador para seguridad
    if (window.confirm("¿Estás seguro de que deseas ELIMINAR esta emergencia? Esta acción no se puede deshacer.")) {
      try {
        await deleteEmergencia(id);
        setSelectedEmergency(null); // Cerrar modal
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  // 3. FUNCIÓN PARA CREAR EMERGENCIA (Lógica de subida)
  const handleCreateEmergency = async (formData, imageFile) => {
    try {
      let imageUrl = "";
      
      // Si el usuario seleccionó una imagen, subirla primero
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Preparar el objeto final
      const finalData = {
        ...formData,
        imagen: imageUrl // Guardar la URL, no el archivo
      };

      // Guardar en Base de Datos
      await createEmergencia(finalData);

      // Cerrar modal y limpiar
      setShowCreateModal(false);
      // alert("Emergencia creada exitosamente"); // Opcional

    } catch (err) {
      console.error("Error creando emergencia:", err);
      alert("Hubo un error al crear la emergencia.");
    }
  };

  // --- LÓGICA DE DETECCIÓN DE NUEVA ALERTA ---
  useEffect(() => {
    if (loading) return;

    if (isFirstLoad.current) {
      previousEmergenciasRef.current = emergencias;
      isFirstLoad.current = false;
      return;
    }

    if (emergencias.length > previousEmergenciasRef.current.length) {
      const prevIds = new Set(previousEmergenciasRef.current.map(e => e.id));
      const nuevas = emergencias.filter(e => !prevIds.has(e.id));

      if (nuevas.length > 0) {
        setNewAlertData(nuevas[0]);
      }
    }
    previousEmergenciasRef.current = emergencias;
  }, [emergencias, loading]);

  // --- FILTROS Y BÚSQUEDA ---
  const datosProcesados = useMemo(() => {
    if (!emergencias) return { filtradas: [], stats: { total: 0, pendientes: 0, enProceso: 0, resueltas: 0 } };

    const stats = {
      total: emergencias.length,
      pendientes: emergencias.filter(e => e.estado === 'Pendiente').length,
      enProceso: emergencias.filter(e => e.estado === 'En proceso').length,
      resueltas: emergencias.filter(e => e.estado === 'Resuelto').length
    };

    let resultado = emergencias;
    
    // Filtro por Pestaña
    if (vistaActiva === 'pendientes') resultado = resultado.filter(e => e.estado === 'Pendiente');
    else if (vistaActiva === 'en-proceso') resultado = resultado.filter(e => e.estado === 'En proceso');
    else if (vistaActiva === 'resueltas') resultado = resultado.filter(e => e.estado === 'Resuelto');

    // Filtro por Buscador
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
      
      {/* 1. MODAL DE ALERTA ENTRANTE (ROJO) */}
      {newAlertData && (
        <IncomingAlertModal 
          data={newAlertData} 
          onClose={() => setNewAlertData(null)} 
        />
      )}



      {/* MODAL DE GESTIÓN (EL QUE FALTABA) */}
      {selectedEmergency && (
        <ManageModal 
          data={selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
          onSave={handleSaveEmergency}
        />
      )}

      {selectedEmergency && (
        <ManageModal 
          data={selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
          onSave={handleSaveEmergency}
          onDelete={handleDeleteEmergencia} // <--- PASAR LA FUNCIÓN AQUÍ
        />
      )}

 {/* 4. RENDERIZAR NUEVO MODAL DE CREACIÓN */}
      {showCreateModal && (
        <NewEmergencyModal 
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEmergency}
        />
      )}

{/* 3. RENDERIZAR MODAL DE EPR */}
      {showEPRModal && (
        <EPRManagerModal onClose={() => setShowEPRModal(false)} />
      )}


      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon"><Bell size={20} /></div>
            <div>
              <h1 className="header-title">Central de Emergencias</h1>
              <p className="header-subtitle">Monitoreo y despacho en tiempo real</p>
            </div>
          </div>

 {      /* AQUÍ ESTÁ EL MENÚ navbar */}
         <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <Navbar 
              onNewEmergency={() => setShowCreateModal(true)}
              onOpenEPR={() => setShowEPRModal(true)} 
            />
          </div>

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

      {/* Main Container */}
      <main className="main-container">
        <div className="content-wrapper">
          
          {/* Filtros */}
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

          {error && <div className="error-msg">Error: {error}</div>}

          {/* LISTA ÚNICA DE ALERTAS */}
          {/* Aquí pasamos onManage correctamente */}
          <AlertList 
            emergencias={datosProcesados.filtradas} 
            loading={loading} 
            onManage={handleManageClick} 
          />
          
        </div>
      </main>
    </div>
  );
}

export default App;