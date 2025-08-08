import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    setPersistence,
    browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.querySelector(".error-message");
    const emailPhoneInput = document.getElementById("email");
    const toggleIcon = document.getElementById("toggle-icon");
    const passwordInput = document.getElementById("password");
    const togglePasswordIcon = document.getElementById("toggle-password");
    const recaptchaContainer = document.createElement("div");
    recaptchaContainer.id = "recaptcha-container";
    loginForm.appendChild(recaptchaContainer);

    let isEmailMode = true; // Par défaut, mode email

    // Configurer le reCAPTCHA Firebase pour téléphone
    window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: (response) => {
            console.log("reCAPTCHA vérifié :", response);
        },
    }, auth);

    // Activer la persistance de session
    setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("Persistance activée : l'utilisateur restera connecté."))
        .catch((error) => console.error("Erreur de persistance :", error));

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

    // Soumission du formulaire
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailOrPhone = emailPhoneInput.value.trim();
        const password = passwordInput.value.trim();

        if (!emailOrPhone) {
            displayError("Veuillez entrer votre adresse email ou votre numéro de téléphone.");
            return;
        }

        if (!password && isEmailMode) {
            displayError("Veuillez entrer votre mot de passe.");
            return;
        }

        try {
            if (isEmailMode) {
                // Connexion par email/mot de passe
                const userCredential = await signInWithEmailAndPassword(auth, emailOrPhone, password);
                const user = userCredential.user;

                console.log("Utilisateur connecté (Email) :", user);
                alert("Connexion réussie !");
                window.location.href = "index.html"; // Redirection après connexion
            } else {
                // Connexion par téléphone
                const appVerifier = window.recaptchaVerifier;
                const confirmationResult = await signInWithPhoneNumber(auth, emailOrPhone, appVerifier);
                console.log("Code envoyé :", confirmationResult);

                const smsCode = prompt("Entrez le code SMS reçu :");
                if (smsCode) {
                    const userCredential = await confirmationResult.confirm(smsCode);
                    const user = userCredential.user;

                    console.log("Utilisateur connecté (Téléphone) :", user);
                    alert("Connexion réussie !");
                    window.location.href = "index.html"; // Redirection après connexion
                }
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error.message);
            displayError("Connexion échouée : " + error.message);
        }
    });

    // Fonction pour afficher une erreur
    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
});