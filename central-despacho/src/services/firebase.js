import { initializeApp } from 'firebase/app';
import {   getDatabase,   ref,   onValue,   query,   orderByChild,   equalTo ,update} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBUgMwsBl7aogNEVLOPzCfTBU2qky9e924",
  authDomain: "fir-login2-c7a59.firebaseapp.com",
  databaseURL: "https://fir-login2-c7a59-default-rtdb.firebaseio.com",
  projectId: "fir-login2-c7a59",
  storageBucket: "fir-login2-c7a59.appspot.com",
  messagingSenderId: "306570664024",
  appId: "1:306570664024:web:9f86c375218af6c41a522d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Inicializar Realtime Database
export const db = getDatabase(app);

// Función para obtener todas las emergencias
export const getEmergencias = (callback) => {
  const emergenciasRef = ref(db, 'ultimasEmergencias');
  // Escuchar cambios en tiempo real
  return onValue(emergenciasRef, callback);
};



// Función para obtener lista de EPR
export const getEPR = (callback) => {
  const eprRef = ref(db, 'epr');
  return onValue(eprRef, callback);
};

// Función para actualizar una emergencia
export const updateEmergencia = async (id, data) => {
  const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);
  try {
    // Aquí se usa la función 'update' que importamos arriba
    await update(emergenciaRef, data);
    console.log("Emergencia actualizada correctamente");
    return true;
  } catch (error) {
    console.error("Error al actualizar emergencia:", error);
    throw error;
  }
};

// Función para obtener emergencias por estado (Filtrado)
export const getEmergenciasPorEstado = (estado, callback) => {
  const emergenciasRef = ref(db, 'ultimasEmergencias');
  // Consulta filtrada por el hijo 'estado'
  const estadoQuery = query(emergenciasRef, orderByChild('estado'), equalTo(estado));
  
  return onValue(estadoQuery, callback);
};