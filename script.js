document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartModal = document.querySelector('.cart-modal');
    const cartContent = document.querySelector('.cart-content');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const productosContainer = document.getElementById('productos-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    const searchInput = document.getElementById('search-input');
    
    // Base de datos de productos
    const productos = [
        {
            id: 1,
            nombre: "Clásica Delight",
            descripcion: "Hamburguesa clásica con carne 100% res, lechuga, tomate, cebolla y salsa especial",
            precio: 8.99,
            imagen: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            categoria: "clasicas",
            rating: 4.5
        },
        {
            id: 2,
            nombre: "Doble Queso",
            descripcion: "Doble carne, doble queso cheddar, cebolla caramelizada y salsa BBQ",
            precio: 10.99,
            imagen: "https://images.unsplash.com/photo-1561758033-48d52648ae8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            categoria: "especiales",
            rating: 4.8
        },
        {
            id: 3,
            nombre: "Vegetariana",
            descripcion: "Hamburguesa de garbanzos y quinoa con aguacate, espinaca y salsa de yogur",
            precio: 9.49,
            imagen: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            categoria: "vegetarianas",
            rating: 4.3
        },
        {
            id: 4,
            nombre: "Pollo Crispy",
            descripcion: "Pechuga de pollo empanizada, lechuga, tomate y mayonesa de ajo",
            precio: 9.99,
            imagen: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            categoria: "pollo",
            rating: 4.2
        },
        {
            id: 5,
            nombre: "Bacon Monster",
            descripcion: "Doble carne, triple bacon, queso americano, aros de cebolla y salsa picante",
            precio: 12.99,
            imagen: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            categoria: "especiales",
            rating: 4.9
        },
        {
            id: 6,
            nombre: "Mexicana",
            descripcion: "Carne de res, guacamole, jalapeños, queso pepper jack y pico de gallo",
            precio: 11.49,
            imagen: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            categoria: "especiales",
            rating: 4.6
        }
    ];

    // Función para generar estrellas de valoración
    function generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // Mostrar productos
    function displayProductos(filter = 'todos', searchTerm = '') {
        productosContainer.innerHTML = '';
        
        let filteredProductos = filter === 'todos' 
            ? productos 
            : productos.filter(producto => producto.categoria === filter);
        
        // Aplicar búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProductos = filteredProductos.filter(producto => 
                producto.nombre.toLowerCase().includes(term) || 
                producto.descripcion.toLowerCase().includes(term)
            );
        }
        
        filteredProductos.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.classList.add('product-card');
            productoElement.dataset.category = producto.categoria;
            
            productoElement.innerHTML = `
                <div class="product-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </div>
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <div class="product-rating">
                        ${generateStarRating(producto.rating)}
                        <span>${producto.rating}</span>
                    </div>
                    <div class="product-price">
                        <span class="price">$${producto.precio.toFixed(2)}</span>
                        <button class="add-to-cart" data-id="${producto.id}">
                            <i class="fas fa-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            `;
            
            productosContainer.appendChild(productoElement);
        });
        
        // Agregar event listeners a los botones de añadir al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }
    
    // Filtrar productos
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayProductos(button.dataset.filter, searchInput.value);
        });
    });
    
    // Búsqueda de productos
    searchInput.addEventListener('input', function() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        displayProductos(activeFilter, this.value);
    });
    
    // Añadir al carrito
    function addToCart(e) {
        const productId = parseInt(e.target.dataset.id);
        const producto = productos.find(p => p.id === productId);
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...producto,
                quantity: 1
            });
        }
        
        updateCart();
        showCartNotification();
    }
    
    // Mostrar notificación de producto añadido
    function showCartNotification() {
        const notification = document.createElement('div');
        notification.classList.add('cart-notification');
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Producto añadido al carrito';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    // Actualizar carrito
    function updateCart() {
        saveCart();
        updateCartCount();
        updateCartModal();
    }
    
    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Actualizar modal del carrito
    function updateCartModal() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center">Tu carrito está vacío</p>';
            cartTotal.textContent = '$0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            
            const itemTotal = item.precio * item.quantity;
            total += itemTotal;
            
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                    <p class="cart-item-remove" data-id="${item.id}">Eliminar</p>
                    <div class="cart-item-quantity">
                        <button class="decrement" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increment" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Agregar event listeners a los botones de eliminar, incrementar y decrementar
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });
        
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', incrementQuantity);
        });
        
        document.querySelectorAll('.decrement').forEach(button => {
            button.addEventListener('click', decrementQuantity);
        });
    }
    
    // Eliminar del carrito
    function removeFromCart(e) {
        const productId = parseInt(e.target.dataset.id);
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
    
    // Incrementar cantidad
    function incrementQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        item.quantity += 1;
        updateCart();
    }
    
    // Decrementar cantidad
    function decrementQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
        
        updateCart();
    }
    
    // Abrir carrito
    function openCart() {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Cerrar carrito
    function closeCart() {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Vaciar carrito
    function clearCart() {
        cart = [];
        updateCart();
    }
    
    // Finalizar compra
    function checkout() {
        if (cart.length === 0) {
            // Crear notificación de carrito vacío
            const emptyCartNotification = document.createElement('div');
            emptyCartNotification.classList.add('empty-cart-notification');
            
            emptyCartNotification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Por favor, agrega al menos un producto al carrito antes de finalizar tu compra</p>
                </div>
            `;
            
            document.body.appendChild(emptyCartNotification);
            
            // Mostrar notificación
            setTimeout(() => {
                emptyCartNotification.classList.add('show');
            }, 10);
            
            // Ocultar y eliminar notificación después de 3 segundos
            setTimeout(() => {
                emptyCartNotification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(emptyCartNotification);
                }, 300);
            }, 3000);
            
            return;
        }
        
        // Si hay productos en el carrito, proceder con la compra
        alert('¡Gracias por tu compra! Total: $' + 
              cart.reduce((total, item) => total + (item.precio * item.quantity), 0).toFixed(2));
        clearCart();
        closeCart();
    }
    
    // Toggle menú móvil
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
    }
    
    // Contador de oferta
    function updateOfferTimer() {
        const countDownDate = new Date();
        countDownDate.setDate(countDownDate.getDate() + 3); // 3 días en el futuro
        
        const timer = setInterval(function() {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            
            if (distance < 0) {
                clearInterval(timer);
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
            document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
            document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
            document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
        }, 1000);
    }
    
    // Event listeners
    document.querySelector('.cart-icon').addEventListener('click', openCart);
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    document.querySelector('.clear-cart').addEventListener('click', clearCart);
    document.querySelector('.checkout-btn').addEventListener('click', checkout);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Cerrar carrito al hacer clic fuera
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCart();
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Enviar formulario de contacto
    document.querySelector('.contact-form form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te responderemos lo antes posible.');
        this.reset();
    });
    
    // Enviar formulario de newsletter
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        alert(`¡Gracias por suscribirte con ${email}! Pronto recibirás nuestras ofertas.`);
        this.reset();
    });
    
    // Inicializar la aplicación
    function init() {
        displayProductos();
        updateCartCount();
        updateOfferTimer();
        
        // Cerrar menú al hacer scroll
        window.addEventListener('scroll', () => {
            navMenu.classList.remove('active');
            
            // Cambiar estilo del header al hacer scroll
            if (window.scrollY > 50) {
                document.querySelector('header').classList.add('scrolled');
            } else {
                document.querySelector('header').classList.remove('scrolled');
            }
        });
        
        // Animación al hacer scroll
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.menu-section, .about-section, .contact-section, .testimonial-section');
            
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (elementPosition < screenPosition) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };
        
        // Configurar animaciones iniciales
        document.querySelectorAll('.menu-section, .about-section, .contact-section, .testimonial-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // Ejecutar una vez al cargar
    }
    
    // Iniciar la aplicación
    init();
});