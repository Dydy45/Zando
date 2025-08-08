import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.querySelector(".error-message");
  const emailPhoneInput = document.getElementById("email");
  const toggleIcon = document.getElementById("toggle-icon");
  const passwordInput = document.getElementById("password");
  const togglePasswordIcon = document.getElementById("toggle-password");

  let isEmailMode = true; // Par défaut, mode email

  // Bascule email/téléphone
  toggleIcon?.addEventListener("click", () => {
    if (isEmailMode) {
      emailPhoneInput.placeholder = "Numéro de téléphone (+243)";
      emailPhoneInput.value = "";
      toggleIcon.textContent = "email";
      toggleIcon.title = "Passer à l'adresse email";
    } else {
      emailPhoneInput.placeholder = "Adresse email";
      emailPhoneInput.value = "";
      toggleIcon.textContent = "phone";
      toggleIcon.title = "Passer au numéro de téléphone";
    }
    isEmailMode = !isEmailMode;
  });

  // Bascule visibilité mot de passe
  togglePasswordIcon?.addEventListener("click", () => {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    togglePasswordIcon.textContent = isPasswordVisible ? "visibility_off" : "visibility";
  });

  // Soumission du formulaire
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailOrPhone = emailPhoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!emailOrPhone) {
      displayError("Veuillez entrer votre adresse email ou votre numéro de téléphone.");
      return;
    }

    try {
      if (isEmailMode) {
        if (!password) {
          displayError("Veuillez entrer votre mot de passe.");
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailOrPhone, password });
        if (error) throw error;
        alert("Connexion réussie !");
        window.location.href = "index.html";
      } else {
        const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: emailOrPhone });
        if (otpErr) throw otpErr;

        const smsCode = prompt("Entrez le code SMS reçu :");
        if (smsCode) {
          const { error: verifyErr } = await supabase.auth.verifyOtp({ phone: emailOrPhone, token: smsCode, type: 'sms' });
          if (verifyErr) throw verifyErr;
          alert("Connexion réussie !");
          window.location.href = "index.html";
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error.message || error);
      displayError("Connexion échouée : " + (error.message || error));
    }
  });

  function displayError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});