// Importation des modules Firebase
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();

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

    let uploadedProfilePicURL = null; // URL de la photo de profil

    // Vérification si l'utilisateur est connecté
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Utilisateur connecté :", user.uid);

            try {
                // Charger les données utilisateur depuis Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();

                    // Pré-remplir les champs du formulaire
                    firstNameInput.value = userData.firstName || "";
                    lastNameInput.value = userData.lastName || "";
                    emailInput.value = userData.email || user.email || "";
                    phoneInput.value = userData.phone || "";
                    addressInput.value = userData.address || "";

                    // Charger la photo de profil
                    if (userData.profilePic) {
                        profilePicPreview.src = userData.profilePic;
                        uploadedProfilePicURL = userData.profilePic;
                    }
                } else {
                    console.error("Aucune donnée utilisateur trouvée.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        } else {
            console.log("Aucun utilisateur connecté.");
            window.location.href = "connexion.html"; // Redirige vers la page de connexion si non connecté
        }
    });

    // Prévisualisation de la photo de profil lors du changement
    profilePicInput.addEventListener("change", (event) => {
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
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            console.error("Aucun utilisateur connecté.");
            return;
        }

        // Récupérer les valeurs du formulaire
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();
        const file = profilePicInput.files[0];

        try {
            let profilePicURL = uploadedProfilePicURL;

            // Téléverser la photo de profil dans Firebase Storage
            if (file) {
                const storageRef = ref(storage, `profile-pictures/${user.uid}`);
                await uploadBytes(storageRef, file);
                profilePicURL = await getDownloadURL(storageRef);
            }

            // Mettre à jour les données utilisateur dans Firestore
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                firstName,
                lastName,
                email,
                phone,
                address,
                profilePic: profilePicURL,
            });

            // Afficher un message de succès
            successMessage.style.display = "block";
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);

            console.log("Profil mis à jour avec succès.");
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
            errorMessage.style.display = "block";
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 3000);
        }
    });

    // Fonction pour annuler les modifications
    window.cancelChanges = () => {
        profileForm.reset();
        profilePicPreview.src = uploadedProfilePicURL || "default-avatar.png";
    };
});