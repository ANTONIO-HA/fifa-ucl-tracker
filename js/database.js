import { db } from './config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Guardar un nuevo partido
export const registrarPartido = async (datos) => {
    try {
        await addDoc(collection(db, "partidos"), {
            ...datos,
            fecha: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al guardar partido:", error);
    }
};

// Escuchar cambios en tiempo real
export const escucharCambios = (callback) => {
    const q = query(collection(db, "partidos"), orderBy("fecha", "asc"));
    onSnapshot(q, (snapshot) => {
        // Mapeamos el ID del documento para poder borrarlo después
        const partidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(partidos);
    });
};

// Borrar todos los partidos (Nueva Temporada)
export const reiniciarTemporada = async () => {
    try {
        const snapshot = await getDocs(collection(db, "partidos"));
        const promesasBorrado = snapshot.docs.map(documento => deleteDoc(doc(db, "partidos", documento.id)));
        await Promise.all(promesasBorrado);
    } catch (error) {
        console.error("Error al reiniciar la temporada:", error);
    }
};

// NUEVA FUNCIÓN: Eliminar un partido específico por ID
export const eliminarPartido = async (id) => {
    try {
        await deleteDoc(doc(db, "partidos", id));
    } catch (error) {
        console.error("Error al eliminar partido:", error);
    }
};