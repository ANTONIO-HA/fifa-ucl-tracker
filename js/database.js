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
        const partidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(partidos);
    });
};

// NUEVA FUNCIÓN: Borrar todos los partidos de la colección
export const reiniciarTemporada = async () => {
    try {
        const snapshot = await getDocs(collection(db, "partidos"));
        // Borramos cada documento encontrado uno por uno
        const promesasBorrado = snapshot.docs.map(documento => deleteDoc(doc(db, "partidos", documento.id)));
        await Promise.all(promesasBorrado);
    } catch (error) {
        console.error("Error al reiniciar la temporada:", error);
    }
};