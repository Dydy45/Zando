import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

// Fonction pour l'inscription
export function inscrire(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => console.log("Utilisateur inscrit :", userCredential.user))
        .catch(error => console.error("Erreur :", error));
}

// Fonction pour la connexion
export function connecter(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => console.log("Utilisateur connecté :", userCredential.user))
        .catch(error => console.error("Erreur :", error));
}