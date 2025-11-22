import React from 'react';
import AlertCard from './AlertCard';
import { AlertCircle } from 'lucide-react';

const AlertList = ({ emergencias, loading }) => {
  if (loading) {
    return <div className="loading-state">Cargando datos en tiempo real...</div>;
  }

  if (!emergencias || emergencias.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="#ccc" />
        <p>No hay emergencias en esta vista.</p>
      </div>
    );
  }

  return (
    <div className="alerts-grid">
      {emergencias.map((emergencia) => (
        <AlertCard key={emergencia.id} data={emergencia} />
      ))}
    </div>
  );
};

export default AlertList;