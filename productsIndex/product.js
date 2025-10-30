const SUPABASE_URL = 'https://wqlxqsuxzydsnvrifksu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbHhxc3V4enlkc252cmlma3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NTYwNjgsImV4cCI6MjA2MTMzMjA2OH0.xLCjspi1YMi01wMfgDx2QIN7aM19tq4Vk-txskxNVH0'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let currentPage = 0;
const pageSize = 15;
let allProducts = [];

async function loadAllProducts() {
    const { data: products, error } = await supabaseClient
        .from('product')
        .select('name, price, img_url, stock');
    if (error) throw error;
    allProducts = products;
    renderPage();
}

function renderPage() {
    const container = document.getElementById('products-container');
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const visibleProducts = allProducts.slice(start, end);
    const html = visibleProducts.map(p => `
        <div data-product class="w-full bg-gray-200 p-3 flex flex-col gap-1 rounded-xl">
        <div class="aspect-square rounded-xl bg-gray-700 overflow-hidden">
            <img src="${p.img_url || 'https://via.placeholder.com/300x200?text=No+Image'}" loading="lazy" decoding="async" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col gap-4">
            <div class="flex flex-row justify-between items-start">
            <div class="flex flex-col flex-1">
                <span class="text-lg font-bold block overflow-hidden text-ellipsis whitespace-nowrap" title="${p.name}">
                ${p.name}
                </span>
                <p class="text-xs ${p.stock === 0 ? 'text-red-600 font-bold' : 'text-gray-700'}">Stock: ${p.stock}</p>
            </div>
            <span class="font-bold text-red-600">₱${p.price}</span>
            </div>
            <button 
                class="${p.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'} text-white py-2 rounded-md transition-colors"
                ${p.stock === 0 ? 'disabled' : ''}
                data-stock="${p.stock}"
            >
                ${p.stock === 0 ? 'Out of Stock' : 'Add to cart'}
            </button>
        </div>
        </div>
    `).join('');

    if (currentPage === 0) container.innerHTML = html;
    else container.insertAdjacentHTML('beforeend', html);

    if ((currentPage + 1) * pageSize >= allProducts.length)
        document.getElementById('load-more').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCartBadge();
    loadAllProducts();
    document.getElementById('load-more').addEventListener('click', () => {
        currentPage++;
        renderPage();
    });
});

async function searchProducts(query) {
    const resultsContainer = document.getElementById('searchResults')

    if (!query) {
        resultsContainer.classList.add('hidden')
        resultsContainer.innerHTML = ''
        return
    }

    console.log("Searching for:", query)

    try {
        let supabaseQuery = supabaseClient
        .from('product') 
        .select('name, price, img_url, stock, type')

        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,type.ilike.%${query}%`)

        const { data: product, error } = await supabaseQuery
        console.log("Supabase returned:", product, error)

        if (error) throw error

        resultsContainer.classList.remove('hidden')

        if (!product || product.length === 0) {
            resultsContainer.innerHTML =
                '<div class="p-4"><p class="text-gray-600 text-sm text-center">No matching products found.</p></div>'
            return
        }

        resultsContainer.innerHTML = `
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-1 gap-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                ${product.map(product => `
                    <div data-product class="-mx-2 mt-4 h-auto w-auto bg-gray-300 p-2 flex items-start gap-4 rounded-xl">
                        <div class="size-24 bg-red-100 rounded-xl overflow-hidden">
                            <img src="${product.img_url || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${product.name}" class="object-cover w-full h-full rounded-xl">
                        </div>
                        <div class="flex flex-col gap-2 flex-1">
                            <div class="flex flex-row justify-between items-start">
                                <div class="flex flex-col flex-1">
                                    <span class="text-lg font-bold line-clamp-2 h-9 w-full">${product.name}</span>
                                    <p class="text-xs ${product.stock === 0 ? 'text-red-600 font-bold' : 'text-gray-700'}">Stock: ${product.stock}</p>
                                </div>
                                <span class="font-bold text-red-600 pr-2">₱${product.price}</span>
                            </div>
                            <button 
                                class="${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'} text-white py-1 rounded-md transition-colors"
                                ${product.stock === 0 ? 'disabled' : ''}
                                data-stock="${product.stock}"
                            >
                                ${product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `

    } catch (error) {
        console.error('Error searching products:', error)
        resultsContainer.innerHTML =
            `<div class="p-4"><p class="text-red-600 text-sm text-center">Error: ${error.message}</p></div>`
        resultsContainer.classList.remove('hidden')
    }
}

loadAllProducts();

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim()
            console.log("User typed:", query)
            searchProducts(query)
        });
    }
});

let cart = [];

document.getElementById("cart-toggle").addEventListener("click", () => {
    const cartPopup = document.getElementById("cart-popup");
    cartPopup.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (e.target && e.target.textContent.trim() === "Add to cart") {
        const card = e.target.closest("[data-product]");
        const name = card.querySelector("span.text-lg")?.textContent.trim();
        const price = card.querySelector("span.font-bold.text-red-600")?.textContent.trim();
        const img = card.querySelector("img")?.getAttribute("src");
        const stock = parseInt(e.target.getAttribute('data-stock'));
        
        if (stock === 0) {
            alert('This product is out of stock and cannot be added to cart.');
            return;
        }
        
        console.log("Adding to cart:", { name, price, img, stock });
        
        addToCart({ name, price, img_url: img, stock });
    }
});

function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (totalItems > 0) {
        cartBadge.classList.remove('hidden');
        cartBadge.textContent = totalItems > 99 ? '99+' : totalItems.toString();
        // Add pulse animation
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 500);
    } else {
        cartBadge.classList.add('hidden');
    }
}

// Update the addToCart function to include badge update
function addToCart(item) {
    // Additional check for stock
    if (item.stock === 0) {
        alert('This product is out of stock and cannot be added to cart.');
        return;
    }

    const existing = cart.find(i => i.name === item.name);
    if (existing) {
        // Check if adding more than available stock
        if (existing.quantity + 1 > item.stock) {
            alert(`Cannot add more items. Only ${item.stock} available in stock.`);
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    renderCart();
    updateCartBadge(); // Add this line
}

function renderCart() {
    const cartList = document.getElementById("cart-items");
    const checkoutBtn = document.getElementById("checkout-btn");
    
    cartList.innerHTML = "";
    cart.forEach(item => {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center mb-2 p-2 bg-gray-50 rounded";
        li.innerHTML = `
            <div class="flex items-center gap-2">
                <div>
                    <span class="font-medium">${item.name}</span>
                    <p class="text-xs text-gray-600">Qty: ${item.quantity}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="font-bold">${item.price}</span>
                <p class="text-xs text-gray-600">Total: ₱${(parseFloat(item.price.replace(/[₱,]/g, '')) * item.quantity).toFixed(2)}</p>
            </div>
        `;
        cartList.appendChild(li);
    });

    if (cart.length > 0) checkoutBtn.classList.remove("hidden");
    else checkoutBtn.classList.add("hidden");

    localStorage.setItem("cartItems", JSON.stringify(cart));
    updateCartBadge(); // Add this line
}

document.getElementById("checkout-btn").addEventListener("click", () => {
    window.location.href = "checkout.html";
});