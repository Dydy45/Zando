document.addEventListener("DOMContentLoaded", () => {
    const productId = new URLSearchParams(window.location.search).get("id");
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Utilisateur connecté
    const product = products.find((p) => p.id == productId);
    const productContainer = document.getElementById("product");
    const ratingsContainer = document.getElementById("ratings");
    const commentsContainer = document.getElementById("comments");
    const commentForm = document.getElementById("comment-form");

    if (!product) {
        productContainer.innerHTML = "<p>Produit non trouvé.</p>";
        return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
        commentForm.style.display = "none";
        commentsContainer.insertAdjacentHTML("beforebegin", "<p>Veuillez vous connecter pour commenter et noter ce produit.</p>");
    }

    // Afficher les détails du produit
    productContainer.innerHTML = `
        <h1>${product.name}</h1>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 400px; object-fit: cover;">
        <p><strong>Prix :</strong> ${product.price.toLocaleString()} USD</p>
        <p><strong>Catégorie :</strong> ${product.category}</p>
        <p><strong>Description :</strong> ${product.description}</p>
        <button class="add-to-cart" data-id="${product.id}">Ajouter au panier</button>
    `;

    // Ajouter au panier
    document.querySelector(".add-to-cart").addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Produit ajouté au panier !");
    });

    // Système de notation
    function renderStars(rating) {
        ratingsContainer.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.className = "star";
            star.textContent = "★";
            star.style.color = i <= rating ? "#ffc107" : "#ccc";
            star.dataset.value = i;
            ratingsContainer.appendChild(star);
        }
    }

    let currentRating = product.rating || 0;
    renderStars(currentRating);

    if (currentUser) {
        ratingsContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("star")) {
                currentRating = Number(event.target.dataset.value);
                product.rating = currentRating; // Mettez à jour la note du produit
                localStorage.setItem("products", JSON.stringify(products));
                renderStars(currentRating);
                alert(`Vous avez noté ce produit à ${currentRating} étoile(s).`);
            }
        });
    }

    // Système de commentaires
    function renderComments() {
        const comments = product.comments || [];
        commentsContainer.innerHTML = comments.length
            ? comments.map((comment) => `
                <div class="comment">
                    <img src="${comment.avatar}" alt="${comment.author}" class="avatar">
                    <div class="content">
                        <strong>${comment.author}</strong>
                        <p>${comment.text}</p>
                    </div>
                </div>
            `).join("")
            : "<p>Aucun commentaire pour ce produit.</p>";
    }

    renderComments();

    if (currentUser) {
        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const text = document.getElementById("comment-text").value.trim();

            if (!text) {
                alert("Veuillez écrire un commentaire.");
                return;
            }

            const comment = { 
                author: currentUser.name, 
                avatar: currentUser.avatar || "default-avatar.png", 
                text 
            };
            product.comments = product.comments || [];
            product.comments.push(comment);
            localStorage.setItem("products", JSON.stringify(products));
            renderComments();
            commentForm.reset();
        });
    }
});