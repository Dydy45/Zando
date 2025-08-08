// Importation des modules Firebase nécessaires
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const auth = getAuth();
    const logoutLink = document.getElementById("logout-link");

    // Gestion de la déconnexion
    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault(); // Empêche le comportement par défaut du lien

            try {
                await signOut(auth); // Déconnecte l'utilisateur
                alert("Déconnexion réussie !");
                window.location.href = "connexion.html"; // Redirige vers la page de connexion
            } catch (error) {
                console.error("Erreur lors de la déconnexion :", error.message);
                alert("Une erreur est survenue lors de la déconnexion.");
            }
        });
    }
});