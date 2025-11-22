import React, { useState, useMemo } from 'react';
import AlertList from './components/AlertList';
import { useEmergencias } from './hooks/useFirebase';
// import DebugInfo from './components/DebugInfo';  <-- ELIMINADO
import { Bell, Search, List, Activity, Clock, AlertTriangle } from 'lucide-react';
import './styles/App.css';

function App() {
  const [vistaActiva, setVistaActiva] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Solo los datos necesarios, quitamos el state de mostrarDebug
  const { emergencias, loading, error } = useEmergencias();

  const datosProcesados = useMemo(() => {
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
      {/* Header Fijo */}
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

      {/* Main con Scroll independiente */}
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
                placeholder="Buscar emergencia, ciudad..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && <div style={{padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem'}}>Error: {error}</div>}

          {/* Grid de Alertas */}
          <AlertList emergencias={datosProcesados.filtradas} loading={loading} />
        
        </div>
      </main>
    </div>
  );
}

export default App;