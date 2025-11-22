import { useState, useEffect } from 'react';
import { getEmergencias, getEmergenciasPorEstado } from '../services/firebase';

export const useEmergencias = (estado = null) => {
  const [emergencias, setEmergencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      let unsubscribe;

      // Callback para procesar los datos que llegan de Firebase
      const handleData = (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          // Transformar Objeto {id: {datos}} a Array [{id, ...datos}]
          const emergenciasList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          
          // Opcional: Ordenar por fecha (más reciente primero) si tienes un campo timestamp
          // emergenciasList.sort((a, b) => b.timestamp - a.timestamp);

          setEmergencias(emergenciasList);
        } else {
          setEmergencias([]);
        }
        setLoading(false);
      };

      if (estado) {
        unsubscribe = getEmergenciasPorEstado(estado, handleData);
      } else {
        unsubscribe = getEmergencias(handleData);
      }

      // onValue devuelve la función de unsubscribe directamente o se maneja diferente
      // En la v9 modular, onValue retorna un unsubscribe.
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };

    } catch (err) {
      console.error('Error en useEmergencias:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [estado]);

  return { emergencias, loading, error };
};