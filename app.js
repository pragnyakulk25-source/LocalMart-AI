const API_BASE = "http://127.0.0.1:8000/api";

function switchRole(role) {
    if(role === 'buyer') {
        document.getElementById('buyerPortal').classList.remove('hidden');
        document.getElementById('sellerPortal').classList.add('hidden');
        document.getElementById('buyerBtn').className = "px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white transition";
        document.getElementById('sellerBtn').className = "px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 transition";
        loadProducts();
    } else {
        document.getElementById('buyerPortal').classList.add('hidden');
        document.getElementById('sellerPortal').classList.remove('hidden');
        document.getElementById('buyerBtn').className = "px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 transition";
        document.getElementById('sellerBtn').className = "px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white transition";
        loadAnalytics();
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        renderProductCards(data);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function searchAI() {
    const query = document.getElementById('aiQuery').value;
    try {
        const res = await fetch(`${API_BASE}/ai/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_query: query })
        });
        const data = await res.json();
        document.getElementById('aiInsight').innerText = data.ai_explanation;
        renderProductCards(data.recommendations);
    } catch (error) {
        console.error("Error running AI search:", error);
    }
}

function renderProductCards(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = "";
    if(!products || products.length === 0) {
        grid.innerHTML = `<p class="text-slate-400 col-span-3">No matching local products available.</p>`;
        return;
    }
    products.forEach(p => {
        grid.innerHTML += `
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                    <span class="text-xs uppercase font-bold text-indigo-500">${p.category}</span>
                    <h3 class="font-bold text-lg text-slate-800 mt-1">${p.name}</h3>
                    <p class="text-xs text-slate-500 mt-1">Store: <strong class="text-slate-700">${p.seller_name}</strong></p>
                    <p class="text-xs text-slate-400 mt-2">In Stock: ${p.stock} units</p>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span class="text-xl font-black text-slate-900">$${p.price}</span>
                    <button onclick="buyProduct(${p.id})" class="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition">Buy Local</button>
                </div>
            </div>
        `;
    });
}

async function buyProduct(id) {
    try {
        const res = await fetch(`${API_BASE}/orders/place`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: id, quantity: 1, buyer_name: "Hackathon Customer" })
        });
        if(res.ok) {
            alert("Order successfully placed with the local merchant!");
            loadProducts();
        } else {
            alert("Failed to place order. Check product stock.");
        }
    } catch (error) {
        console.error("Error placing order:", error);
    }
}

async function addSellerProduct() {
    const payload = {
        seller_id: 101,
        name: document.getElementById('pName').value,
        price: parseFloat(document.getElementById('pPrice').value),
        stock: parseInt(document.getElementById('pStock').value),
        category: document.getElementById('pCat').value,
        tags: document.getElementById('pTags').value.split(',').map(t => t.trim())
    };
    try {
        const res = await fetch(`${API_BASE}/seller/add-product`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            alert("New inventory item successfully created for City Electronics!");
            loadAnalytics();
        }
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

async function loadAnalytics() {
    try {
        const res = await fetch(`${API_BASE}/seller/101/analytics`);
        const data = await res.json();
        document.getElementById('statRevenue').innerText = `$${data.total_revenue.toFixed(2)}`;
        document.getElementById('statOrders').innerText = data.total_orders;
        
        const list = document.getElementById('orderList');
        list.innerHTML = "";
        if(data.recent_orders.length === 0) {
            list.innerHTML = `<p class="text-xs text-slate-400">No orders processed yet.</p>`;
            return;
        }
        data.recent_orders.forEach(o => {
            list.innerHTML += `
                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between">
                    <span><strong>#${o.order_id}</strong> - ${o.product_name} (x${o.quantity})</span>
                    <span class="font-bold text-slate-800">$${o.total_price.toFixed(2)}</span>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading analytics:", error);
    }
}

// Initial Load
loadProducts();
