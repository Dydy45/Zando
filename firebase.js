// Importez les modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgtgPCLP4-i6Hz3osBdh-Rko2vJwczl18",
    authDomain: "la-bonne.firebaseapp.com",
    projectId: "la-bonne",
    storageBucket: "la-bonne.firebasestorage.app",
    messagingSenderId: "298552559651",
    appId: "1:298552559651:web:16b60e001fe325043e8996"
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Authentification
export const db = getFirestore(app); // Base de données Firestore