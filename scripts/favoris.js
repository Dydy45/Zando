document.addEventListener('DOMContentLoaded', () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const wishlistContainer = document.querySelector(".carousel-container");

  if (wishlistContainer) {
    // Si la liste est vide
    if (favorites.length === 0) {
      wishlistContainer.innerHTML = "<p style='text-align: center; font-size: 1.2em; color: #333;'>Pas de produit aimé.</p>";
    } else {
      // Ajouter les produits dynamiquement avec une icône de corbeille
      favorites.forEach((product) => {
        if (product && product.id && product.name && product.image) {
          const productCard = document.createElement("div");
          productCard.classList.add("product-card");

          productCard.innerHTML = `
            <div class="delete-icon" data-product-id="${product.id}">
              <span class="material-icons" style="color: red; cursor: pointer;">delete</span>
            </div>
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <p class="rating">⭐⭐⭐⭐⭐</p>
            <button class="add-to-cart" data-product-id="${product.id}">Ajouter au panier</button>
          `;

          wishlistContainer.appendChild(productCard);
        }
      });
    }

    // Gestion de la suppression d'un produit
    wishlistContainer.addEventListener('click', (e) => {
      if (e.target.closest('.delete-icon')) {
        const productId = e.target.closest('.delete-icon').dataset.productId;

        // Supprime le produit des favoris
        const updatedFavorites = favorites.filter((product) => product.id !== productId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

        // Recharge la page pour mettre à jour la liste
        location.reload();
      }
    });
  }
});