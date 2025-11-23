import { initializeApp } from 'firebase/app';
import {   getDatabase,   ref,   onValue,   query,   orderByChild,   equalTo ,update,remove,push, set} from 'firebase/database';
import {   getStorage,   ref as storageRef,   uploadBytes,   getDownloadURL } from 'firebase/storage'; // <--- 3. Importaciones de Storage


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
export const storage = getStorage(app);

// Función para obtener todas las emergencias
export const getEmergencias = (callback) => {
  const emergenciasRef = ref(db, 'ultimasEmergencias');
  // Escuchar cambios en tiempo real
  return onValue(emergenciasRef, callback);
};


//FUNCIÓN PARA ELIMINAR
export const deleteEmergencia = async (id) => {
  const emergenciaRef = ref(db, `ultimasEmergencias/${id}`);
  try {
    await remove(emergenciaRef);
    console.log("Emergencia eliminada correctamente");
    return true;
  } catch (error) {
    console.error("Error al eliminar emergencia:", error);
    throw error;
  }
};


// Función para obtener lista de EPR
export const getEPR = (callback) => {
  const eprRef = ref(db, 'epr');
  return onValue(eprRef, callback);
};

// Subir Imagen a Firebase Storage
export const uploadImage = async (file) => {
  if (!file) return null;
  // Crear referencia: carpeta "emergencias" / nombre_unico_archivo
  const fileRef = storageRef(storage, `emergencias/${Date.now()}_${file.name}`);
  
  try {
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};

// Crear Nueva Emergencia en Realtime Database
export const createEmergencia = async (data) => {
  try {
    const emergenciasRef = ref(db, 'ultimasEmergencias');
    const newEmergenciaRef = push(emergenciasRef); // Genera ID único automáticamente
    await set(newEmergenciaRef, data);
    return newEmergenciaRef.key;
  } catch (error) {
    console.error("Error al crear emergencia:", error);
    throw error;
  }
};

// Crear nuevo EPR
export const createEPR = async (data) => {
  const eprRef = push(ref(db, 'epr'));
  await set(eprRef, data);
  return eprRef.key;
};

// Actualizar EPR existente
export const updateEPR = async (id, data) => {
  const eprRef = ref(db, `epr/${id}`);
  await update(eprRef, data);
};

// Eliminar EPR
export const deleteEPR = async (id) => {
  const eprRef = ref(db, `epr/${id}`);
  await remove(eprRef);
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