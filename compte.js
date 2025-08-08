// Importation des modules Firebase
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Récupération de l'utilisateur courant
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) {
    window.location.href = "connexion.html";
    return;
  }

  // Sélecteurs HTML
  const profileForm = document.getElementById("profile-form");
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone-number");
  const addressInput = document.getElementById("address");
  const profilePicInput = document.getElementById("profile-pic");
  const profilePicPreview = document.getElementById("profile-pic-preview");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("email-error");

  let uploadedProfilePicURL = null;

  // Charger les données utilisateur depuis la table users
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found

    if (profile) {
      firstNameInput.value = profile.first_name || "";
      lastNameInput.value = profile.last_name || "";
      emailInput.value = profile.email || user.email || "";
      phoneInput.value = profile.phone || "";
      addressInput.value = profile.address || "";
      if (profile.profile_pic) {
        profilePicPreview.src = profile.profile_pic;
        uploadedProfilePicURL = profile.profile_pic;
      }
    }
  } catch (e) {
    console.error('Erreur chargement profil:', e);
  }

  // Prévisualisation de la photo de profil
  profilePicInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePicPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Enregistrement des modifications
  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const file = profilePicInput.files[0];

    try {
      let profilePicURL = uploadedProfilePicURL;

      if (file) {
        // Téléversement dans Supabase Storage (bucket: profile-pictures)
        const path = `${user.id}`; // un fichier par utilisateur
        const { error: uploadErr } = await supabase.storage.from('profile-pictures').upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type });
        if (uploadErr) throw uploadErr;
        const { data: publicData } = supabase.storage.from('profile-pictures').getPublicUrl(path);
        profilePicURL = publicData?.publicUrl || profilePicURL;
      }

      const { error: upsertErr } = await supabase.from('users').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        profile_pic: profilePicURL,
      });
      if (upsertErr) throw upsertErr;

      successMessage.style.display = "block";
      setTimeout(() => { successMessage.style.display = "none"; }, 3000);
    } catch (e) {
      console.error('Erreur lors de la mise à jour :', e);
      errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
      errorMessage.style.display = "block";
      setTimeout(() => { errorMessage.style.display = "none"; }, 3000);
    }
  });

  // Fonction pour annuler les modifications
  window.cancelChanges = () => {
    profileForm.reset();
    profilePicPreview.src = uploadedProfilePicURL || "default-avatar.png";
  };
});