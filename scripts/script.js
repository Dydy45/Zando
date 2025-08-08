document.addEventListener('DOMContentLoaded', () => {
  /** SECTION 1 : Gestion du carrousel **/
  const carousel = document.querySelector('.carrousel');
  if (carousel) {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.arrow.prev');
    const nextButton = document.querySelector('.arrow.next');

    let currentIndex = 0;
    const slideCount = slides.length;
    const slideDuration = 3000; // Temps entre chaque slide (3 secondes)
    let autoSlideInterval;

    // Fonction pour mettre à jour la position du carrousel
    const updateCarousel = () => {
      const offset = -currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
    };

    // Aller au slide suivant
    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateCarousel();
    };

    // Aller au slide précédent
    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateCarousel();
    };

    // Activer le défilement automatique
    const startAutoSlide = () => {
      stopAutoSlide();
      autoSlideInterval = setInterval(nextSlide, slideDuration);
    };

    // Arrêter le défilement automatique
    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };

    // Gestion des clics sur les flèches
    prevButton.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      setTimeout(startAutoSlide, slideDuration);
    });

    nextButton.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      setTimeout(startAutoSlide, slideDuration);
    });

    // Gestion du glissement tactile pour mobile
    let startX;
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      stopAutoSlide();
    });

    carousel.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (diffX > 50) nextSlide(); // Glissement vers la gauche
      else if (diffX < -50) prevSlide(); // Glissement vers la droite

      startAutoSlide();
    });

    // Lancer le carrousel automatiquement
    startAutoSlide();
  }

  /** SECTION 2 : Gestion des liens actifs dans la navigation **/
  const links = document.querySelectorAll('.navigation a');
  const currentUrl = window.location.pathname;

  links.forEach((link) => {
    if (link.getAttribute('href') === currentUrl) {
      link.classList.add('active'); // Ajoute la classe "active" pour le lien correspondant
    }
  });
  
  document.querySelectorAll(".publish-button, .floating-publish-button").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        const href = button.getAttribute("href");

        // Exemple : Afficher une confirmation avant de rediriger
        if (confirm("Voulez-vous accéder à la page Publier ?")) {
            window.location.href = href;
        }
    });
});

  /** SECTION 3 : Gestion du panier **/
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartBadge = document.getElementById('cart-badge');

  // Met à jour le badge du panier
  const updateCartBadge = () => {
    cartBadge.textContent = cart.length;
    cartBadge.classList.toggle('visible', cart.length > 0);
  };

  // Ajoute un produit au panier
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    const productCard = document.querySelector(`[data-product-id="${product.id}"]`).closest('.product-card');
    const messageContainer = productCard.querySelector('.message');

    if (existingProduct) {
      // Si le produit est déjà ajouté
      messageContainer.textContent = 'Produit déjà ajouté au panier !';
      messageContainer.style.display = 'block';
      setTimeout(() => {
        messageContainer.style.display = 'none';
      }, 3000);
    } else {
      // Ajouter au panier et mettre à jour le stockage
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
    }
  };

  // Gestion des clics sur les boutons "Ajouter au panier"
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productCard = button.closest('.product-card');
      const product = {
        id: button.dataset.productId,
        name: productCard.querySelector('h3').textContent,
        price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '').trim()),
        image: productCard.querySelector('img').src,
        quantity: 1,
      };

      addToCart(product);
    });
  });

  // Met à jour le badge au chargement
  updateCartBadge();

  /** SECTION 4 : Gestion des favoris **/
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  document.querySelectorAll('.favorite-icon').forEach((icon) => {
    const productId = icon.dataset.productId;

    // Marquer comme actif si déjà dans les favoris
    if (favorites.some((item) => item.id === productId)) {
      icon.classList.add('active');
      icon.querySelector('span').textContent = 'favorite';
    }

    // Gestion des clics sur les icônes de cœur
    icon.addEventListener('click', () => {
      const productCard = icon.closest('.product-card');
      const product = {
        id: productId,
        name: productCard.querySelector('h3').textContent,
        price: productCard.querySelector('.price').textContent.trim(),
        image: productCard.querySelector('img').src,
      };

      if (icon.classList.contains('active')) {
        // Supprimer des favoris
        icon.classList.remove('active');
        icon.querySelector('span').textContent = 'favorite_border';
        const index = favorites.findIndex((item) => item.id === productId);
        if (index > -1) favorites.splice(index, 1);
      } else {
        // Ajouter aux favoris
        icon.classList.add('active');
        icon.querySelector('span').textContent = 'favorite';
        favorites.push(product);
      }

      // Mettre à jour le stockage des favoris
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
  });
});