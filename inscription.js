// Importation des modules Firebase
import { supabase } from './supabaseClient.js';

// DOMContentLoaded pour exécuter le script après le chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector(".account-form");
  const emailPhoneInput = document.getElementById("email");
  const toggleIcon = document.getElementById("toggle-icon");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const togglePasswordIcon = document.getElementById("toggle-password");
  const toggleConfirmPasswordIcon = document.getElementById("toggle-confirm-password");
  const termsCheckbox = document.querySelector(".con input[type='checkbox']");
  let isEmailMode = true; // Par défaut, mode email

  // Bascule entre email et téléphone
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

  // Bascule de visibilité du mot de passe
  togglePasswordIcon?.addEventListener("click", () => {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    togglePasswordIcon.textContent = isPasswordVisible ? "visibility_off" : "visibility";
  });

  toggleConfirmPasswordIcon?.addEventListener("click", () => {
    const isConfirmPasswordVisible = confirmPasswordInput.type === "text";
    confirmPasswordInput.type = isConfirmPasswordVisible ? "password" : "text";
    toggleConfirmPasswordIcon.textContent = isConfirmPasswordVisible ? "visibility_off" : "visibility";
  });

  // Validation et soumission du formulaire
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("name").value.trim();
    const emailOrPhone = emailPhoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    if (!firstName || !lastName || !emailOrPhone || (!password && isEmailMode) || (!confirmPassword && isEmailMode)) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    if (!termsCheckbox.checked) {
      showError("Vous devez accepter les Conditions d'utilisation.");
      return;
    }

    try {
      if (isEmailMode) {
        if (!validateEmail(emailOrPhone)) {
          showError("Veuillez entrer une adresse email valide.");
          return;
        }
        if (!validatePassword(password)) {
          showError("Le mot de passe doit contenir au moins 8 caractères.");
          return;
        }
        if (password !== confirmPassword) {
          showError("Les mots de passe ne correspondent pas.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailOrPhone,
          password,
          options: {
            data: { firstName, lastName }
          }
        });
        if (error) throw error;
        const userId = data.user?.id;

        if (userId) {
          const { error: upsertErr } = await supabase.from('users').upsert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: emailOrPhone,
            phone: null
          });
          if (upsertErr) throw upsertErr;
        }

        alert("Inscription réussie ! Veuillez vérifier votre email si la confirmation est requise.");
        window.location.href = "index.html";
      } else {
        if (!validatePhone(emailOrPhone)) {
          showError("Veuillez entrer un numéro de téléphone valide commençant par +243.");
          return;
        }

        const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: emailOrPhone });
        if (otpErr) throw otpErr;

        const smsCode = prompt("Entrez le code SMS que vous avez reçu :");
        if (smsCode) {
          const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
            phone: emailOrPhone,
            token: smsCode,
            type: 'sms'
          });
          if (verifyErr) throw verifyErr;

          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id;
          if (userId) {
            await supabase.from('users').upsert({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              email: null,
              phone: emailOrPhone
            });
          }

          alert("Inscription réussie !");
          window.location.href = "index.html";
        }
      }
    } catch (error) {
      console.error("Erreur Supabase :", error.message || error);
      showError("Une erreur est survenue lors de l'inscription.");
    }
  });

  function showError(message) {
    const errorDiv = document.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  }
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  function validatePhone(phone) {
    return phone.startsWith("+243") && phone.length >= 12;
  }
  function validatePassword(password) {
    return password.length >= 8;
  }
});