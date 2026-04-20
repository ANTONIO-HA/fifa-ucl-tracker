import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZqhdERknRC1fxko8jNFqsbayZU0-LlMw",
    authDomain: "fifa-ucl-tracker.firebaseapp.com",
    projectId: "fifa-ucl-tracker",
    storageBucket: "fifa-ucl-tracker.firebasestorage.app",
    messagingSenderId: "286746223454",
    appId: "1:286746223454:web:b69e180cb6e8e7d47965cf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);