document.addEventListener("DOMContentLoaded", () => {
    const recentProductsContainer = document.querySelector(".produits-recents .products");
    const categoryContainers = {
        electronics: document.querySelector(".categorie-électronique .products"),
        "mode-homme": document.querySelector(".categorie-mode-homme .products"),
        "mode-femme": document.querySelector(".categorie-mode-femme .products"),
        maison: document.querySelector(".categorie-maison .products"),
        sport: document.querySelector(".categorie-sport .products"),
        bebe: document.querySelector(".categorie-bébé .products"),
        alimentation: document.querySelector(".categorie-alimentation .products"),
        sante: document.querySelector(".categorie-santé .products"),
    };

    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Normaliser les catégories des produits existants (ASCII)
    const normalizeCategory = (category) => {
        if (!category) return category;
        const map = {
            "électronique": "electronics",
            "electronique": "electronics",
            "mode-homme": "mode-homme",
            "mode-femme": "mode-femme",
            "maison": "maison",
            "sport": "sport",
            "bébé": "bebe",
            "bebe": "bebe",
            "alimentation": "alimentation",
            "santé": "sante",
            "sante": "sante",
        };
        const key = category.toLowerCase();
        return map[key] || category;
    };

    products.forEach(p => { p.category = normalizeCategory(p.category); });
    const now = Date.now();
    const twoDaysInMilliseconds = 48 * 60 * 60 * 1000;

    // Fonction pour créer une carte produit
    function createProductCard(product) {
        const productCard = document.createElement("div");
        productCard.className = "product-card";

        productCard.innerHTML = `
            <a href="products.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
            </a>
            <div class="details">
                <h3>${product.name}</h3>
                <div class="price"><span>${product.price.toLocaleString()} USD</span></div>
                <button class="add-to-cart" data-product-id="${product.id}">Ajouter au panier</button>
            </div>
        `;

        return productCard;
    }

    // Fonction pour afficher un message si la section est vide
    function displayEmptyMessage(container) {
        if (container.children.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "Aucun produit disponible";
            container.appendChild(emptyMessage);
        }
    }

    // Ajouter les produits récents
    products.forEach((product) => {
        const productTimestamp = new Date(product.timestamp).getTime();

        if (now - productTimestamp <= twoDaysInMilliseconds) {
            const productCard = createProductCard(product);
            recentProductsContainer.appendChild(productCard);
        }
    });

    displayEmptyMessage(recentProductsContainer);

    // Ajouter les produits par catégorie
    Object.keys(categoryContainers).forEach((category) => {
        const container = categoryContainers[category];
        const categoryProducts = products.filter((product) => product.category === category);

        categoryProducts.forEach((product) => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });

        // Afficher le message si la catégorie est vide
        displayEmptyMessage(container);
    });

    // Gérer les carrousels pour chaque catégorie
    const carousels = document.querySelectorAll(".carousel");
    carousels.forEach((carousel) => {
        const productsContainer = carousel.querySelector(".products");
        const prevButton = carousel.querySelector(".prev");
        const nextButton = carousel.querySelector(".next");

        const scrollAmount = 220; // Ajustez selon la taille des cartes

        prevButton.addEventListener("click", () => {
            productsContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });

        nextButton.addEventListener("click", () => {
            productsContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    });

    // Gérer le bouton "Ajouter au panier"
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart")) {
            const productId = event.target.getAttribute("data-product-id");
            const product = products.find((p) => p.id == productId);

            if (product) {
                if (!cart.some(p => p.id == productId)) {
                    cart.push({ ...product, quantity: 1 });
                    localStorage.setItem("cart", JSON.stringify(cart));
                    alert("Produit ajouté au panier !");
                }
            }
        }
    });
});