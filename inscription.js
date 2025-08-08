// Importation des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgtgPCLP4-i6Hz3osBdh-Rko2vJwczl18",
  authDomain: "la-bonne.firebaseapp.com",
  projectId: "la-bonne",
  storageBucket: "la-bonne.firebasestorage.app",
  messagingSenderId: "298552559651",
  appId: "1:298552559651:web:16b60e001fe325043e8996"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialisation de Firestore

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

  // Configurer le reCAPTCHA invisible de Firebase
  window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: (response) => {
      console.log("reCAPTCHA vérifié :", response);
    },
    'expired-callback': () => {
      console.error("reCAPTCHA expiré. Veuillez réessayer.");
    }
  }, auth);

  // Bascule entre email et téléphone
  toggleIcon.addEventListener("click", () => {
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
  togglePasswordIcon.addEventListener("click", () => {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    togglePasswordIcon.textContent = isPasswordVisible ? "visibility_off" : "visibility";
  });

  toggleConfirmPasswordIcon.addEventListener("click", () => {
    const isConfirmPasswordVisible = confirmPasswordInput.type === "text";
    confirmPasswordInput.type = isConfirmPasswordVisible ? "password" : "text";
    toggleConfirmPasswordIcon.textContent = isConfirmPasswordVisible ? "visibility_off" : "visibility";
  });

  // Validation et soumission du formulaire
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("name").value.trim();
    const emailOrPhone = emailPhoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Séparer le prénom et le nom
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    if (!firstName || !lastName || !emailOrPhone || !password || !confirmPassword) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    if (!termsCheckbox.checked) {
      showError("Vous devez accepter les Conditions d'utilisation.");
      return;
    }

    if (isEmailMode) {
      // Mode Email
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

      try {
        // Créer un utilisateur avec email/mot de passe
        const userCredential = await createUserWithEmailAndPassword(auth, emailOrPhone, password);
        const user = userCredential.user;

        // Enregistrer les informations dans Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email: emailOrPhone,
          phone: null // Pas de téléphone en mode email
        });

        alert("Inscription réussie !");
        console.log("Utilisateur enregistré :", user);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Erreur Firebase :", error.message);
        showError("Une erreur est survenue lors de l'inscription.");
      }
    } else {
      // Mode Téléphone
      if (!validatePhone(emailOrPhone)) {
        showError("Veuillez entrer un numéro de téléphone valide commençant par +243.");
        return;
      }

      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, emailOrPhone, appVerifier);
        console.log("Code envoyé :", confirmationResult);

        const smsCode = prompt("Entrez le code SMS que vous avez reçu :");
        if (smsCode) {
          const userCredential = await confirmationResult.confirm(smsCode);
          const user = userCredential.user;

          // Enregistrer les informations dans Firestore
          await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email: null, // Pas d'email en mode téléphone
            phone: emailOrPhone
          });

          alert("Inscription réussie !");
          console.log("Utilisateur enregistré :", user);
          window.location.href = "index.html";
        }
      } catch (error) {
        console.error("Erreur Firebase :", error.message);
        showError("Une erreur est survenue lors de l'inscription.");
      }
    }
  });

  // Fonction pour afficher une erreur
  function showError(message) {
    const errorDiv = document.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  }

  // Fonction pour valider un email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Fonction pour valider un numéro de téléphone
  function validatePhone(phone) {
    return phone.startsWith("+243") && phone.length >= 12;
  }

  // Fonction pour valider un mot de passe
  function validatePassword(password) {
    return password.length >= 8;
  }
});