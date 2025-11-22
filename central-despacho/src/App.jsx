import React, { useState, useMemo, useEffect, useRef } from 'react';
import AlertList from './components/AlertList';
import IncomingAlertModal from './components/IncomingAlertModal'; // <--- IMPORTAR
import { useEmergencias } from './hooks/useFirebase';
import { Bell, Search, List, Activity, Clock, AlertTriangle } from 'lucide-react';
import './styles/App.css';

function App() {
  const [vistaActiva, setVistaActiva] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal de Alerta
  const [newAlertData, setNewAlertData] = useState(null);
  
  const { emergencias, loading, error } = useEmergencias();

  // Refs para control de nuevas alertas
  const previousEmergenciasRef = useRef([]);
  const isFirstLoad = useRef(true);

  // --- LÓGICA DE DETECCIÓN DE NUEVA ALERTA ---
  useEffect(() => {
    if (loading) return;

    // 1. Si es la primera carga, solo guardamos los datos y marcamos como cargado
    if (isFirstLoad.current) {
      previousEmergenciasRef.current = emergencias;
      isFirstLoad.current = false;
      return;
    }

    // 2. Si hay más emergencias ahora que antes, buscamos la nueva
    if (emergencias.length > previousEmergenciasRef.current.length) {
      
      // Encontrar el ID que NO está en la lista anterior
      // Creamos un Set con los IDs viejos para buscar rápido
      const prevIds = new Set(previousEmergenciasRef.current.map(e => e.id));
      
      // Filtramos las nuevas (las que no tienen su ID en el Set viejo)
      const nuevas = emergencias.filter(e => !prevIds.has(e.id));

      if (nuevas.length > 0) {
        // Tomamos la última que llegó (o la primera del filtro)
        const alertaEntrante = nuevas[0];
        console.log("¡Nueva alerta detectada!", alertaEntrante);
        setNewAlertData(alertaEntrante); // <--- ESTO ABRE EL MODAL
      }
    }

    // 3. Actualizamos la referencia para la próxima comparación
    previousEmergenciasRef.current = emergencias;

  }, [emergencias, loading]); // Se ejecuta cada vez que cambia 'emergencias'


  // --- Resto de tu código (Filtros, search, etc) ---
  const datosProcesados = useMemo(() => {
    // ... (tu código existente de useMemo)
    if (!emergencias) return { filtradas: [], stats: { total: 0, pendientes: 0, enProceso: 0, resueltas: 0 } };

    const stats = {
      total: emergencias.length,
      pendientes: emergencias.filter(e => e.estado === 'Pendiente').length,
      enProceso: emergencias.filter(e => e.estado === 'En proceso').length,
      resueltas: emergencias.filter(e => e.estado === 'Resuelto').length
    };

    let resultado = emergencias;
    if (vistaActiva === 'pendientes') resultado = resultado.filter(e => e.estado === 'Pendiente');
    else if (vistaActiva === 'en-proceso') resultado = resultado.filter(e => e.estado === 'En proceso');
    else if (vistaActiva === 'resueltas') resultado = resultado.filter(e => e.estado === 'Resuelto');

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
      
      {/* --- MODAL DE ALERTA ENTRANTE --- */}
      {newAlertData && (
        <IncomingAlertModal 
          data={newAlertData} 
          onClose={() => setNewAlertData(null)} 
        />
      )}

      {/* Header Fijo */}
      <header className="header">
         {/* ... (tu código de header existente) ... */}
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
          {/* ... (Tus filtros y lista de alertas existentes) ... */}
          <div className="filters-container">
             {/* ... (botones de filtro y buscador) ... */}
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

          <AlertList emergencias={datosProcesados.filtradas} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default App;