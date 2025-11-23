import { useState, useEffect } from 'react';
import { getAmbulancia } from '../services/firebase';

export const useAmbulancia = () => {
  const [ambulanciaList, setAmbulanciaList] = useState([]);
  const [loadingAmbulancia, setLoadingAmbulancia] = useState(true);

  useEffect(() => {
    const unsubscribe = getAmbulancia((snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transformar objeto {key: val} a array [{id: key, ...val}]
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setAmbulanciaList(list);
      } else {
        setAmbulanciaList([]);
      }
      setLoadingAmbulancia(false);
    });

    return () => unsubscribe();
  }, []);

  return { ambulanciaList, loadingAmbulancia };
};