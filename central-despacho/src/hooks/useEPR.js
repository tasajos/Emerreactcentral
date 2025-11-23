import { useState, useEffect } from 'react';
import { getEPR } from '../services/firebase';

export const useEPR = () => {
  const [eprList, setEprList] = useState([]);
  // CORRECCIÓN AQUÍ: Cambiamos 'setLoading' por 'setLoadingEPR'
  const [loadingEPR, setLoadingEPR] = useState(true);

  useEffect(() => {
    const unsubscribe = getEPR((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setEprList(list);
      } else {
        setEprList([]);
      }
      // Ahora sí existe esta función
      setLoadingEPR(false);
    });

    return () => unsubscribe();
  }, []);

  return { eprList, loadingEPR };
};