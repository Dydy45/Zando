// Importation des modules Firebase nécessaires
import { supabase } from '../supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      alert("Déconnexion réussie !");
      window.location.href = "connexion.html";
    } catch (e) {
      console.error("Erreur lors de la déconnexion :", e.message || e);
      alert("Une erreur est survenue lors de la déconnexion.");
    }
  });
});