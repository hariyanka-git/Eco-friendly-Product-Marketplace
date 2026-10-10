// ---------- Data Management (localStorage) ----------
const STORAGE_KEYS = {
    USERS: 'eco_users',
    CURRENT_USER: 'eco_current_user',
    PRODUCTS: 'eco_products',
    CARTS: 'eco_carts'
};

// Initialize default data if empty
function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        // Sample product
        const sampleProduct = {
            id: Date.now(),
            name: 'Bamboo Toothbrush',
            description: 'Biodegradable bamboo handle, soft bristles.',
            price: 4.99,
            seller_email: 'eco@example.com',
            cod_available: true,
            date_added: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([sampleProduct]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARTS)) {
        localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify({}));
    }
}

// Helper: get/set current user
function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || null;
}

function setCurrentUser(username) {
    if (username) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

// Users
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Products
function getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// Carts (object with username as key)
function getCarts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS));
}

function saveCarts(carts) {
    localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(carts));
}

function getUserCart(username) {
    const carts = getCarts();
    return carts[username] || [];
}

function saveUserCart(username, cart) {
    const carts = getCarts();
    carts[username] = cart;
    saveCarts(carts);
}

// ---------- Global State ----------
let currentPage = 'home';
let flashMessage = null;
let paymentData = null; // { items, total } for payment page

// Quotes
const quotes = [
    "The greatest threat to our planet is the belief that someone else will save it.",
    "We do not inherit the earth from our ancestors; we borrow it from our children.",
    "Reduce, reuse, recycle.",
    "The environment is where we all meet; where we all have a mutual interest.",
    "Going green doesn't start with doing green acts — it starts with a shift in consciousness."
];

// ---------- Render Functions ----------
function render() {
    updateUserLinks();
    const main = document.getElementById('mainContent');
    main.innerHTML = '';

    if (flashMessage) {
        const flashDiv = document.createElement('div');
        flashDiv.className = 'flash-message';
        flashDiv.textContent = flashMessage;
        main.appendChild(flashDiv);
        flashMessage = null; // clear after display
    }

    switch (currentPage) {
        case 'home':
            renderHome(main);
            break;
        case 'products':
            renderProducts(main);
            break;
        case 'sell':
            renderSell(main);
            break;
        case 'cart':
            renderCart(main);
            break;
        case 'payment':
            renderPayment(main);
            break;
        case 'faq':
            renderFaq(main);
            break;
        case 'login':
            renderLogin(main);
            break;
        case 'signup':
            renderSignup(main);
            break;
        default:
            renderHome(main);
    }
}

function updateUserLinks() {
    const userLinks = document.getElementById('userLinks');
    const currentUser = getCurrentUser();
    if (currentUser) {
        userLinks.innerHTML = `
            <span>👤 ${currentUser}</span>
            <a href="#" data-page="logout">Logout</a>
        `;
    } else {
        userLinks.innerHTML = `
            <a href="#" data-page="login">Login</a>
            <a href="#" data-page="signup">Sign Up</a>
        `;
    }
    // Re-attach navigation listeners
    attachNavListeners();
}

// Home page
function renderHome(container) {
    const h1 = document.createElement('h1');
    h1.style.color = 'var(--dark-green)';
    h1.textContent = 'Welcome to EcoMarket';
    container.appendChild(h1);

    const quoteBox = document.createElement('div');
    quoteBox.className = 'quote-box';
    quoteBox.id = 'quote';
    quoteBox.textContent = 'Loading quote...';
    container.appendChild(quoteBox);

    const p = document.createElement('p');
    p.style.fontSize = '1.2rem';
    p.style.textAlign = 'center';
    p.textContent = 'Your one-stop shop for eco-friendly products. Buy and sell sustainably!';
    container.appendChild(p);

    const btnDiv = document.createElement('div');
    btnDiv.style.display = 'flex';
    btnDiv.style.gap = '2rem';
    btnDiv.style.justifyContent = 'center';
    btnDiv.style.marginTop = '2rem';
    btnDiv.innerHTML = `
        <a href="#" data-page="products" class="btn">Browse Products</a>
        <a href="#" data-page="sell" class="btn btn-outline">Start Selling</a>
    `;
    container.appendChild(btnDiv);

    // Rotating quotes
    let index = 0;
    function showNextQuote() {
        const q = document.getElementById('quote');
        if (q) {
            q.textContent = quotes[index];
            index = (index + 1) % quotes.length;
        }
    }
    showNextQuote();
    setInterval(showNextQuote, 5000);
}

// Products page
function renderProducts(container) {
    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'All Products';
    container.appendChild(h2);

    const quote = document.createElement('div');
    quote.className = 'quote-box';
    quote.textContent = '✨ Every purchase makes a difference. Choose eco-friendly!';
    container.appendChild(quote);

    const products = getProducts().sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
    if (products.length === 0) {
        const p = document.createElement('p');
        p.style.textAlign = 'center';
        p.style.fontSize = '1.2rem';
        p.innerHTML = 'No products listed yet. <a href="#" data-page="sell">Be the first to sell!</a>';
        container.appendChild(p);
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>COD</th>
                <th>Seller Email</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="product-table-body">
        </tbody>
    `;
    container.appendChild(table);
    const tbody = document.getElementById('product-table-body');

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHTML(product.name)}</strong></td>
            <td>${escapeHTML(product.description.substring(0, 50))}...</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.cod_available ? '✅ Yes' : '❌ No'}</td>
            <td>${escapeHTML(product.seller_email)}</td>
            <td>
                ${getCurrentUser() ?
                    `<a href="#" data-product-id="${product.id}" class="btn add-to-cart" style="padding:0.5rem 1rem;">Add to Cart</a>` :
                    `<a href="#" data-page="login" class="btn-outline" style="padding:0.5rem 1rem;">Login to buy</a>`}
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach add-to-cart listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.productId);
            addToCart(productId);
        });
    });
}

// Sell page
function renderSell(container) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        flashMessage = 'Please log in to sell products.';
        currentPage = 'login';
        render();
        return;
    }

    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'List a Product for Sale';
    container.appendChild(h2);

    const form = document.createElement('form');
    form.className = 'form-container';
    form.innerHTML = `
        <div class="form-group">
            <label>Product Name:</label>
            <input type="text" id="product-name" required placeholder="e.g., Bamboo Toothbrush">
        </div>
        <div class="form-group">
            <label>Description:</label>
            <textarea id="product-desc" required placeholder="Describe your eco-friendly product..." rows="4"></textarea>
        </div>
        <div class="form-group">
            <label>Price ($):</label>
            <input type="number" step="0.01" id="product-price" required placeholder="9.99">
        </div>
        <div class="form-group">
            <label>Your Email (for COD contact):</label>
            <input type="email" id="seller-email" required placeholder="seller@green.com">
        </div>
        <div class="form-group checkbox-group">
            <input type="checkbox" id="cod-available" checked>
            <label for="cod-available">Cash on Delivery available</label>
        </div>
        <button type="submit">Add Product</button>
    `;
    container.appendChild(form);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const desc = document.getElementById('product-desc').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const sellerEmail = document.getElementById('seller-email').value.trim();
        const cod = document.getElementById('cod-available').checked;

        if (!name || !desc || isNaN(price) || price <= 0 || !sellerEmail) {
            flashMessage = 'Please fill all fields correctly.';
            render();
            return;
        }

        const newProduct = {
            id: Date.now(),
            name,
            description: desc,
            price,
            seller_email: sellerEmail,
            cod_available: cod,
            date_added: new Date().toISOString()
        };
        const products = getProducts();
        products.push(newProduct);
        saveProducts(products);
        flashMessage = 'Product added successfully!';
        currentPage = 'products';
        render();
    });
}

// Cart page
function renderCart(container) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        flashMessage = 'Please log in to view your cart.';
        currentPage = 'login';
        render();
        return;
    }

    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'Your Shopping Cart';
    container.appendChild(h2);

    const cart = getUserCart(currentUser);
    const products = getProducts();
    // Build cart items with product details
    const cartItems = [];
    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            cartItems.push({
                ...item,
                product
            });
            total += product.price * item.quantity;
        }
    });

    if (cartItems.length === 0) {
        const p = document.createElement('p');
        p.style.textAlign = 'center';
        p.style.fontSize = '1.2rem';
        p.innerHTML = 'Your cart is empty. <a href="#" data-page="products">Browse products</a>.';
        container.appendChild(p);
        return;
    }

    cartItems.forEach(item => {
        const cartDiv = document.createElement('div');
        cartDiv.className = 'cart-item';
        cartDiv.innerHTML = `
            <div>
                <strong>${escapeHTML(item.product.name)}</strong> <br>
                <span>Price: $${item.product.price.toFixed(2)} | Qty: ${item.quantity}</span>
            </div>
            <div>
                <span style="font-weight: bold; margin-right: 1rem;">$${(item.product.price * item.quantity).toFixed(2)}</span>
                <a href="#" data-cart-item="${item.productId}" data-action="increase" class="btn cart-action" style="padding:0.3rem 1rem;">+</a>
                <a href="#" data-cart-item="${item.productId}" data-action="decrease" class="btn cart-action" style="padding:0.3rem 1rem;">-</a>
                <a href="#" data-cart-item="${item.productId}" data-action="remove" class="btn cart-action" style="background-color:#b34a4a; padding:0.3rem 1rem;">Remove</a>
            </div>
        `;
        container.appendChild(cartDiv);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
    container.appendChild(totalDiv);

    const checkoutBtn = document.createElement('a');
    checkoutBtn.href = '#';
    checkoutBtn.className = 'btn';
    checkoutBtn.style.fontSize = '1.2rem';
    checkoutBtn.textContent = 'Proceed to Payment';
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Store order summary in paymentData
        paymentData = {
            items: cartItems.map(item => ({
                name: item.product.name,
                qty: item.quantity,
                price: item.product.price
            })),
            total: total
        };
        currentPage = 'payment';
        render();
    });
    container.appendChild(checkoutBtn);

    // Attach cart action listeners
    document.querySelectorAll('.cart-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.cartItem);
            const action = btn.dataset.action;
            updateCart(productId, action);
        });
    });
}

// Payment page
function renderPayment(container) {
    if (!paymentData) {
        currentPage = 'cart';
        render();
        return;
    }

    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'Checkout';
    container.appendChild(h2);

    const quote = document.createElement('div');
    quote.className = 'quote-box';
    quote.textContent = '🌟 Thank you for choosing eco-friendly!';
    container.appendChild(quote);

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'payment-summary';
    summaryDiv.innerHTML = '<h3>Order Summary</h3>';

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    paymentData.items.forEach(item => {
        const li = document.createElement('li');
        li.style.padding = '0.5rem 0';
        li.style.borderBottom = '1px dashed var(--dark-green)';
        li.innerHTML = `${escapeHTML(item.name)} x ${item.qty} - <strong>$${(item.price * item.qty).toFixed(2)}</strong>`;
        ul.appendChild(li);
    });
    summaryDiv.appendChild(ul);

    const totalP = document.createElement('p');
    totalP.style.fontSize = '1.5rem';
    totalP.style.fontWeight = 'bold';
    totalP.textContent = `Total: $${paymentData.total.toFixed(2)}`;
    summaryDiv.appendChild(totalP);

    const paymentP = document.createElement('p');
    paymentP.innerHTML = '💚 Payment method: <strong>Cash on Delivery (COD)</strong>';
    summaryDiv.appendChild(paymentP);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Clear cart
        const currentUser = getCurrentUser();
        saveUserCart(currentUser, []);
        paymentData = null;
        flashMessage = 'Order placed successfully! (COD)';
        currentPage = 'products';
        render();
    });
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'submit';
    confirmBtn.style.fontSize = '1.2rem';
    confirmBtn.textContent = 'Confirm Order';
    form.appendChild(confirmBtn);
    summaryDiv.appendChild(form);

    container.appendChild(summaryDiv);
}

// FAQ page
function renderFaq(container) {
    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'Frequently Asked Questions';
    container.appendChild(h2);

    const quote = document.createElement('div');
    quote.className = 'quote-box';
    quote.textContent = '🌱 Knowledge is the first step to sustainability.';
    container.appendChild(quote);

    const faqs = [
        { q: 'How do I sell a product?', a: 'Log in, click on "Sell" in the navigation, fill out the form with product details, and your product will be listed immediately.' },
        { q: 'What payment methods are accepted?', a: 'We currently support Cash on Delivery (COD) for all products. Sellers provide their email for contact and delivery arrangement.' },
        { q: 'How do I contact a seller?', a: 'Each product listing includes the seller\'s email address. You can reach out directly to arrange delivery or ask questions.' },
        { q: 'Is there a return policy?', a: 'Returns are handled between buyer and seller. Please contact the seller for any issues. We encourage eco-friendly resolutions!' },
        { q: 'How can I contribute to the eco-friendly mission?', a: 'By buying and selling sustainable products, you\'re already helping! Share the platform with friends and spread the word.' }
    ];

    faqs.forEach(faq => {
        const div = document.createElement('div');
        div.className = 'faq-item';
        div.innerHTML = `
            <div class="faq-question">${faq.q}</div>
            <p>${faq.a}</p>
        `;
        container.appendChild(div);
    });
}

// Login page
function renderLogin(container) {
    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'Login to your account';
    container.appendChild(h2);

    const form = document.createElement('form');
    form.className = 'form-container';
    form.innerHTML = `
        <div class="form-group">
            <label>Username:</label>
            <input type="text" id="login-username" required placeholder="e.g., eco_warrior">
        </div>
        <div class="form-group">
            <label>Password:</label>
            <input type="password" id="login-password" required placeholder="••••••••">
        </div>
        <button type="submit">Log In</button>
    `;
    container.appendChild(form);

    const p = document.createElement('p');
    p.style.marginTop = '1.5rem';
    p.innerHTML = 'Don\'t have an account? <a href="#" data-page="signup" style="color: var(--dark-green); font-weight: bold;">Sign up here</a>.';
    container.appendChild(p);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password); // plain for demo
        if (user) {
            setCurrentUser(username);
            flashMessage = `Welcome back, ${username}!`;
            currentPage = 'products';
        } else {
            flashMessage = 'Invalid username or password.';
        }
        render();
    });
}

// Signup page
function renderSignup(container) {
    const h2 = document.createElement('h2');
    h2.style.color = 'var(--dark-green)';
    h2.textContent = 'Create an account';
    container.appendChild(h2);

    const form = document.createElement('form');
    form.className = 'form-container';
    form.innerHTML = `
        <div class="form-group">
            <label>Username:</label>
            <input type="text" id="signup-username" required placeholder="Choose a username">
        </div>
        <div class="form-group">
            <label>Email:</label>
            <input type="email" id="signup-email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
            <label>Password:</label>
            <input type="password" id="signup-password" required placeholder="At least 6 characters">
        </div>
        <button type="submit">Sign Up</button>
    `;
    container.appendChild(form);

    const p = document.createElement('p');
    p.style.marginTop = '1.5rem';
    p.innerHTML = 'Already have an account? <a href="#" data-page="login" style="color: var(--dark-green); font-weight: bold;">Log in</a>.';
    container.appendChild(p);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        if (!username || !email || !password) {
            flashMessage = 'All fields are required.';
            render();
            return;
        }

        const users = getUsers();
        if (users.find(u => u.username === username || u.email === email)) {
            flashMessage = 'Username or email already taken.';
            render();
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password // plain for demo
        };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(username);
        // Initialize empty cart for user
        const carts = getCarts();
        carts[username] = [];
        saveCarts(carts);
        flashMessage = 'Account created! Welcome!';
        currentPage = 'products';
        render();
    });
}

// ---------- Cart Actions ----------
function addToCart(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        flashMessage = 'Please log in to add items to cart.';
        currentPage = 'login';
        render();
        return;
    }
    const cart = getUserCart(currentUser);
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    saveUserCart(currentUser, cart);
    flashMessage = 'Product added to cart.';
    render(); // re-render current page (likely products)
}

function updateCart(productId, action) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    let cart = getUserCart(currentUser);
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return;

    if (action === 'increase') {
        cart[index].quantity += 1;
    } else if (action === 'decrease') {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    } else if (action === 'remove') {
        cart.splice(index, 1);
    }
    saveUserCart(currentUser, cart);
    flashMessage = 'Cart updated.';
    render(); // re-render cart
}

// ---------- Navigation ----------
function attachNavListeners() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page === 'logout') {
                setCurrentUser(null);
                flashMessage = 'Logged out.';
                currentPage = 'home';
            } else {
                currentPage = page;
            }
            render();
        });
    });
}

// Utility: escape HTML
function escapeHTML(str) {
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// ---------- Initialization ----------
initData();
render();
attachNavListeners();