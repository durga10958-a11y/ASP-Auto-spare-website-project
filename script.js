
/* =====================================
   A.S.P. AUTO SPARE PARTS
   JAVASCRIPT FUNCTIONALITY
===================================== */

// STORAGE KEYS
const PRODUCT_KEY = "asp_products";
const ORDER_KEY = "asp_orders";
const REVIEW_KEY = "asp_reviews";

// DEMO OWNER LOGIN
const OWNER_USERNAME = "admin";
const OWNER_PASSWORD = "asp1987";

// IMAGE PATHS
const IMAGE_FOLDER = "images/";

const DEFAULT_IMAGE = IMAGE_FOLDER + "product-1.jpg";

// DEFAULT PRODUCTS
const defaultProducts = [
    {
        id: 1,
        name: "EUROGRIP TVS Two Wheeler Tyre",
        category: "Tyres",
        brand: "EUROGRIP",
        price: 1200,
        description: "Quality two-wheeler tyre for reliable performance.",
        image: IMAGE_FOLDER + "product-1.jpg"
    },
    {
        id: 2,
        name: "SHELL ADVANCE Engine Oil",
        category: "Engine Oil",
        brand: "SHELL",
        price: 450,
        description: "Two-wheeler engine oil for smooth performance.",
        image: IMAGE_FOLDER + "product-2.jpg"
    },
    {
        id: 3,
        name: "Two Wheeler Battery",
        category: "Batteries",
        brand: "Two Wheeler",
        price: 950,
        description: "Battery products for two-wheelers.",
        image: IMAGE_FOLDER + "product-3.jpg"
    },
    {
        id: 4,
        name: "HERO HONDA Spare Parts",
        category: "Spare Parts",
        brand: "HERO HONDA",
        price: 250,
        description: "Two-wheeler spare parts and accessories.",
        image: IMAGE_FOLDER + "product-4.jpg"
    }
];

// =====================================
// GENERAL HELPERS
// =====================================

function readStorage(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Storage reading error:", error);
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        alert("Storage is full or unavailable. Try using a smaller image.");
        return false;
    }
}

function getProducts() {
    return readStorage(PRODUCT_KEY, defaultProducts);
}

function getOrders() {
    return readStorage(ORDER_KEY, []);
}

function getReviews() {
    return readStorage(REVIEW_KEY, []);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

// =====================================
// IMAGE ERROR HANDLER
// =====================================

function handleImageError(image) {
    if (image.dataset.fallbackUsed === "true") {
        image.style.display = "none";
        return;
    }

    image.dataset.fallbackUsed = "true";
    image.src = DEFAULT_IMAGE;
}

// =====================================
// INITIALIZE WEBSITE
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    // Load default products for a new browser
    if (localStorage.getItem(PRODUCT_KEY) === null) {
        saveStorage(PRODUCT_KEY, defaultProducts);
    }

    // Footer year
    document.getElementById("year").textContent =
        new Date().getFullYear();

    displayProducts();
    displayReviews();
    updateDashboard();

    // MOBILE NAVIGATION
    document.getElementById("menuToggle")
        .addEventListener("click", function () {
            document.getElementById("navbar")
                .classList.toggle("show");
        });

    document.querySelectorAll("#navbar a").forEach(link => {
        link.addEventListener("click", function () {
            document.getElementById("navbar")
                .classList.remove("show");
        });
    });

    // SEARCH
    document.getElementById("searchInput")
        .addEventListener("input", displayProducts);

    // CATEGORY FILTER
    document.getElementById("categoryFilter")
        .addEventListener("change", displayProducts);

    // CATEGORY CARDS
    document.querySelectorAll(".category-card")
        .forEach(card => {
            card.addEventListener("click", function () {

                document.getElementById("categoryFilter").value =
                    this.dataset.category;

                displayProducts();
            });
        });

    // LOGIN
    document.getElementById("loginForm")
        .addEventListener("submit", ownerLogin);

    // LOGOUT
    document.getElementById("logoutButton")
        .addEventListener("click", logoutOwner);

    // PRODUCT FORM
    document.getElementById("productForm")
        .addEventListener("submit", saveProduct);

    // CANCEL EDIT
    document.getElementById("cancelEdit")
        .addEventListener("click", resetProductForm);

    // IMAGE PREVIEW
    document.getElementById("productImage")
        .addEventListener("change", previewImage);

    // REVIEWS
    document.getElementById("reviewForm")
        .addEventListener("submit", submitReview);

    // CLEAR ORDERS
    document.getElementById("clearOrders")
        .addEventListener("click", clearOrders);

    // HASH NAVIGATION
    window.addEventListener("hashchange", handlePageNavigation);

    handlePageNavigation();
});

// =====================================
// CUSTOMER PRODUCT DISPLAY
// =====================================

function displayProducts() {

    const products = getProducts();

    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const category = document.getElementById("categoryFilter")
        .value;

    const filtered = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            String(product.brand || "").toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || product.category === category;

        return matchesSearch && matchesCategory;
    });

    const grid = document.getElementById("productGrid");

    document.getElementById("noProducts").hidden =
        filtered.length !== 0;

    grid.innerHTML = filtered.map(product => `
        <article class="product-card">

            <img
                src="${escapeHTML(product.image || DEFAULT_IMAGE)}"
                alt="${escapeHTML(product.name)}"
                onerror="handleImageError(this)">

            <div class="product-info">

                <span class="category-label">
                    ${escapeHTML(product.category)}
                </span>

                <h3>${escapeHTML(product.name)}</h3>

                <p>${escapeHTML(product.description)}</p>

                <div class="product-price">
                    ${money(product.price)}
                </div>

                <div class="product-actions">

                    <button
                        class="btn primary"
                        onclick="orderProduct(${Number(product.id)})">
                        ENQUIRE
                    </button>

                </div>

            </div>
        </article>
    `).join("");
}

// =====================================
// CUSTOMER ORDER / ENQUIRY
// =====================================

function orderProduct(productId) {

    const products = getProducts();

    const product = products.find(
        item => Number(item.id) === Number(productId)
    );

    if (!product) {
        alert("Product is no longer available.");
        return;
    }

    const customerName = prompt("Enter your name:");

    if (!customerName || !customerName.trim()) {
        return;
    }

    const phone = prompt("Enter your mobile number:");

    if (!phone || !phone.trim()) {
        return;
    }

    const order = {
        id: Date.now(),
        customer: customerName.trim(),
        phone: phone.trim(),
        product: product.name,
        price: product.price,
        date: new Date().toLocaleString()
    };

    const orders = getOrders();

    orders.push(order);

    if (!saveStorage(ORDER_KEY, orders)) {
        return;
    }

    updateDashboard();

    const message =
        "Hello A.S.P. Auto Spare Parts.%0A" +
        "I would like to enquire about:%0A" +
        "Product: " + encodeURIComponent(product.name) + "%0A" +
        "Price: " + encodeURIComponent(money(product.price)) + "%0A" +
        "Customer: " + encodeURIComponent(customerName) + "%0A" +
        "Phone: " + encodeURIComponent(phone);

    alert("Your enquiry has been saved. WhatsApp will open next.");

    window.open(
        "https://wa.me/919443139088?text=" + message,
        "_blank"
    );
}

// =====================================
// OWNER LOGIN
// =====================================

function ownerLogin(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const error =
        document.getElementById("loginError");

    if (
        username === OWNER_USERNAME &&
        password === OWNER_PASSWORD
    ) {

        sessionStorage.setItem("aspOwnerLoggedIn", "true");

        error.textContent = "";

        showDashboard();

    } else {

        error.textContent =
            "Incorrect username or password. Please try again.";
    }
}

// =====================================
// DASHBOARD NAVIGATION
// =====================================

function handlePageNavigation() {

    const adminPage = document.getElementById("admin");

    const isAdmin = location.hash === "#admin";

    adminPage.hidden = !isAdmin;

    document.querySelector("main").hidden = isAdmin;
    document.querySelector(".footer").hidden = isAdmin;
    document.querySelector(".whatsapp").hidden = isAdmin;

    if (isAdmin) {

        if (sessionStorage.getItem("aspOwnerLoggedIn") === "true") {
            showDashboard();
        } else {
            showLogin();
        }
    }
}

function showLogin() {

    document.getElementById("loginContainer").hidden = false;
    document.getElementById("dashboard").hidden = true;

    document.getElementById("loginForm").reset();
    document.getElementById("loginError").textContent = "";
}

function showDashboard() {

    document.getElementById("loginContainer").hidden = true;
    document.getElementById("dashboard").hidden = false;

    updateDashboard();
    displayAdminProducts();
    displayOrders();
}

function logoutOwner() {

    sessionStorage.removeItem("aspOwnerLoggedIn");

    location.hash = "home";

    showLogin();
}

// =====================================
// ADD / EDIT PRODUCTS
// =====================================

let selectedImage = "";

function previewImage(event) {

    const file = event.target.files[0];

    if (!file) {
        selectedImage = "";
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        event.target.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {
        alert("Please choose an image smaller than 1 MB.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        selectedImage = e.target.result;

        const preview =
            document.getElementById("imagePreview");

        preview.src = selectedImage;
        preview.hidden = false;
    };

    reader.readAsDataURL(file);
}

function saveProduct(event) {

    event.preventDefault();

    if (sessionStorage.getItem("aspOwnerLoggedIn") !== "true") {
        alert("Please login first.");
        return;
    }

    const products = getProducts();

    const editId =
        document.getElementById("editProductId").value;

    const name =
        document.getElementById("productName").value.trim();

    const category =
        document.getElementById("productCategory").value;

    const brand =
        document.getElementById("productBrand").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const description =
        document.getElementById("productDescription").value.trim();

    if (!name || !Number.isFinite(price) || price < 0) {
        alert("Enter a valid product name and price.");
        return;
    }

    const existingProduct = editId
        ? products.find(p => String(p.id) === editId)
        : null;

    const product = {
        id: editId ? Number(editId) : Date.now(),
        name: name,
        category: category,
        brand: brand,
        price: price,
        description: description,
        image: selectedImage ||
            (existingProduct ? existingProduct.image : DEFAULT_IMAGE)
    };

    if (editId) {

        const index = products.findIndex(
            p => String(p.id) === editId
        );

        if (index === -1) {
            alert("Product not found.");
            return;
        }

        products[index] = product;

    } else {

        products.push(product);
    }

    if (!saveStorage(PRODUCT_KEY, products)) {
        return;
    }

    document.getElementById("productMessage").textContent =
        editId ? "Product updated successfully!" :
        "Product added successfully!";

    resetProductForm();
    displayProducts();
    displayAdminProducts();
    updateDashboard();
}

// =====================================
// DISPLAY ADMIN PRODUCTS
// =====================================

function displayAdminProducts() {

    const products = getProducts();

    const tbody =
        document.getElementById("adminProductList");

    tbody.innerHTML = products.map(product => `
        <tr>

            <td>
                <img
                    src="${escapeHTML(product.image || DEFAULT_IMAGE)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="handleImageError(this)">
            </td>

            <td>${escapeHTML(product.name)}</td>

            <td>${money(product.price)}</td>

            <td>

                <button class="small-btn edit-btn"
                    onclick="editProduct(${Number(product.id)})">
                    EDIT
                </button>

                <button class="small-btn delete-btn"
                    onclick="deleteProduct(${Number(product.id)})">
                    DELETE
                </button>

            </td>

        </tr>
    `).join("");
}

// =====================================
// EDIT PRODUCT
// =====================================

function editProduct(id) {

    if (sessionStorage.getItem("aspOwnerLoggedIn") !== "true") {
        return;
    }

    const product = getProducts().find(
        p => Number(p.id) === Number(id)
    );

    if (!product) return;

    document.getElementById("editProductId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productBrand").value = product.brand || "";
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value =
        product.description || "";

    selectedImage = product.image || "";

    const preview = document.getElementById("imagePreview");

    preview.src = selectedImage || DEFAULT_IMAGE;
    preview.hidden = false;

    document.getElementById("productMessage").textContent =
        "Editing product: " + product.name;

    document.getElementById("productForm")
        .scrollIntoView({ behavior: "smooth" });
}

// =====================================
// DELETE PRODUCT
// =====================================

function deleteProduct(id) {

    if (sessionStorage.getItem("aspOwnerLoggedIn") !== "true") {
        return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const products = getProducts().filter(
        p => Number(p.id) !== Number(id)
    );

    if (!saveStorage(PRODUCT_KEY, products)) {
        return;
    }

    resetProductForm();
    displayProducts();
    displayAdminProducts();
    updateDashboard();

    alert("Product deleted successfully.");
}

// =====================================
// RESET PRODUCT FORM
// =====================================

function resetProductForm() {

    document.getElementById("productForm").reset();

    document.getElementById("editProductId").value = "";

    selectedImage = "";

    document.getElementById("imagePreview").hidden = true;

    document.getElementById("imagePreview").removeAttribute("src");

    document.getElementById("productImage").value = "";
}

// =====================================
// CUSTOMER ORDERS
// =====================================

function displayOrders() {

    const orders = getOrders();

    const container =
        document.getElementById("orderList");

    if (orders.length === 0) {

        container.innerHTML =
            "<p>No customer orders or enquiries available.</p>";

        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">

            <h4>ORDER #${Number(order.id)}</h4>

            <p><strong>Customer:</strong>
                ${escapeHTML(order.customer)}</p>

            <p><strong>Phone:</strong>
                ${escapeHTML(order.phone)}</p>

            <p><strong>Product:</strong>
                ${escapeHTML(order.product)}</p>

            <p><strong>Price:</strong>
                ${money(order.price)}</p>

            <p><strong>Date:</strong>
                ${escapeHTML(order.date)}</p>

            <a class="btn primary"
               href="https://wa.me/${encodeURIComponent(order.phone.replace(/\D/g, ""))}"
               target="_blank"
               rel="noopener noreferrer">
                CONTACT CUSTOMER
            </a>

        </div>
    `).join("");
}

function clearOrders() {

    if (sessionStorage.getItem("aspOwnerLoggedIn") !== "true") {
        return;
    }

    if (!confirm("Delete all customer enquiries?")) {
        return;
    }

    if (!saveStorage(ORDER_KEY, [])) {
        return;
    }

    displayOrders();
    updateDashboard();

    alert("All enquiries have been cleared.");
}

// =====================================
// DASHBOARD STATISTICS
// =====================================

function updateDashboard() {

    document.getElementById("totalProducts").textContent =
        getProducts().length;

    document.getElementById("totalOrders").textContent =
        getOrders().length;
}

// =====================================
// CUSTOMER REVIEWS
// =====================================

function submitReview(event) {

    event.preventDefault();

    const name =
        document.getElementById("reviewName").value.trim();

    const rating =
        Number(document.getElementById("reviewRating").value);

    const message =
        document.getElementById("reviewMessage").value.trim();

    if (!name || !message || rating < 1 || rating > 5) {
        alert("Please complete all review details.");
        return;
    }

    const reviews = getReviews();

    reviews.unshift({
        id: Date.now(),
        name: name,
        rating: rating,
        message: message
    });

    if (!saveStorage(REVIEW_KEY, reviews)) {
        return;
    }

    displayReviews();

    document.getElementById("reviewForm").reset();

    alert("Thank you for your review!");
}

function displayReviews() {

    const reviews = getReviews();

    const container = document.getElementById("reviewList");

    const defaultReviews = `
        <div class="review-card">
            <div class="stars">★★★★★</div>
            <p>Good collection of two-wheeler spare parts.</p>
            <h4>Customer</h4>
        </div>

        <div class="review-card">
            <div class="stars">★★★★★</div>
            <p>Helpful service and affordable prices.</p>
            <h4>Customer</h4>
        </div>
    `;

    const savedHTML = reviews.map(review => `
        <div class="review-card">

            <div class="stars">
                ${"★".repeat(Number(review.rating))}
                ${"☆".repeat(5 - Number(review.rating))}
            </div>

            <p>${escapeHTML(review.message)}</p>

            <h4>${escapeHTML(review.name)}</h4>

        </div>
    `).join("");

    container.innerHTML = savedHTML + defaultReviews;
}
