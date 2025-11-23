import React, { useState, useMemo, useEffect, useRef } from 'react';
import AlertList from './components/AlertList';
import IncomingAlertModal from './components/IncomingAlertModal';
import { useEmergencias } from './hooks/useFirebase';
import { Bell, Search, List, Activity, Clock, AlertTriangle } from 'lucide-react';
import ManageModal from './components/ManageModal';
import { updateEmergencia } from './services/firebase';
import './styles/App.css';

function App() {
  const [vistaActiva, setVistaActiva] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal de Gestión (Popup)
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  
  // Estado para el modal de Nueva Alerta (Alarma)
  const [newAlertData, setNewAlertData] = useState(null);
  
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

      {/* 2. MODAL DE GESTIÓN (EL QUE FALTABA) */}
      {selectedEmergency && (
        <ManageModal 
          data={selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
          onSave={handleSaveEmergency}
        />
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