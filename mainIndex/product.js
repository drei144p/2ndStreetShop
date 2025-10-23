const SUPABASE_URL = 'https://wqlxqsuxzydsnvrifksu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbHhxc3V4enlkc252cmlma3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NTYwNjgsImV4cCI6MjA2MTMzMjA2OH0.xLCjspi1YMi01wMfgDx2QIN7aM19tq4Vk-txskxNVH0'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function loadRandomProducts() {
    try {
        const { data: product, error } = await supabaseClient
        .from('product')
        .select('name, price, img_url, stock');

        console.log("Supabase data:", product)
        console.log("Supabase error:", error)

        if (error) throw error;
        if (!product || product.length === 0) {
            document.getElementById('products-container').innerHTML = 
            '<p class="text-gray-600 col-span-full text-center">No products available.</p>';
            return;
        }

        const shuffled = product.sort(() => 0.5 - Math.random());
        const randomProducts = shuffled.slice(0, 4);

        displayProducts(randomProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            document.getElementById('products-container').innerHTML = 
            `<p class="text-red-600 col-span-full text-center">Error loading products: ${error.message}</p>`;
        }
}

function displayProducts(product) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    product.forEach(product => {
    const card = `
        <div class="w-full bg-gray-200 p-3 flex flex-col gap-1 rounded-xl">
            <div class="aspect-square rounded-xl bg-gray-700 overflow-hidden">
                <img src="${product.img_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex flex-col gap-4">
                <div class="flex flex-row justify-between items-start">
                    <div class="flex flex-col flex-1">
                        <span class="text-lg font-bold">${product.name}</span>
                        <p class="text-xs text-gray-700">Stock: ${product.stock}</p>
                    </div>
                    <span class="font-bold text-red-600">${product.price}</span>
                </div>
                <button class="bg-red-500 hover:bg-red-700 text-white py-2 rounded-md">
                Add to cart
                </button>
            </div>
        </div>
        `;
        container.innerHTML += card;
    });
}

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
                    <div class="-mx-2 mt-4 h-auto w-auto bg-gray-300 p-2 flex items-start gap-4 rounded-xl">
                        <div class="size-24 bg-red-100 rounded-xl overflow-hidden">
                            <img src="${product.img_url || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${product.name}" class="object-cover w-full h-full rounded-xl">
                        </div>
                        <div class="flex flex-col gap-2 flex-1">
                            <div class="flex flex-row justify-between items-start">
                                <div class="flex flex-col flex-1">
                                    <span class="text-lg font-bold overflow-x-hidden">${product.name}</span>
                                    <p class="text-xs text-gray-700">Stock: ${product.stock}</p>
                                </div>
                                <span class="font-bold text-red-600 pr-2">${product.price}</span>
                            </div>
                            <button class="bg-red-500 hover:bg-red-700 text-white py-1 rounded-md">
                            Add to cart
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

// Initialize the page
loadRandomProducts();

// Attach search listener when DOM is ready
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