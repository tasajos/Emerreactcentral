import React from 'react';

const DebugInfo = ({ emergencias, loading, error }) => {
  if (loading) return <div style={{padding: '1rem', background: '#f3f4f6'}}>Cargando datos de debug...</div>;
  if (error) return <div style={{padding: '1rem', background: '#fef2f2', color: '#dc2626'}}>Error: {error}</div>;

  return (
    <div style={{padding: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: '1rem'}}>
      <h3 style={{marginBottom: '0.5rem'}}>Debug Info:</h3>
      <p>Total de emergencias: {emergencias.length}</p>
      {emergencias.length > 0 && (
        <div style={{marginTop: '0.5rem'}}>
          <strong>Primera emergencia:</strong>
          <pre style={{background: 'white', padding: '0.5rem', fontSize: '12px', overflow: 'auto'}}>
            {JSON.stringify(emergencias[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;