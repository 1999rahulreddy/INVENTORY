const app = document.getElementById("app");
const today = document.getElementById("today");
const progress = document.getElementById("progress");

today.textContent = new Date().toLocaleDateString();

let currentCategory = 0;

const STORAGE_KEY = "inventory-counts";

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getEntry(key) {
    return state[key] || { count: "", updated: null };
}

function setCount(key, value) {
    state[key] = { count: value, updated: new Date().toISOString() };
    saveState();
}

function renderHome() {

    progress.textContent = "";

    app.innerHTML = "";

    inventory.forEach((category, index) => {

        const card = document.createElement("div");

        card.className = "card category";

        card.innerHTML = `
            <h2>${category.category}</h2>
            <p>${category.items.length} Items</p>
        `;

        card.onclick = () => {
            currentCategory = index;
            renderCategory(index);
        };

        app.appendChild(card);

    });

    const reviewButton = document.createElement("button");

    reviewButton.textContent = "Review Inventory";

    reviewButton.onclick = renderReview;

    app.appendChild(reviewButton);

}

function renderCategory(index) {

    const category = inventory[index];

    progress.textContent =
        `Category ${index + 1} of ${inventory.length}`;

    app.innerHTML = "";

    createTopNavigation();

    category.items.forEach(item => {

        const entry = getEntry(item.description);

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <div class="item-title">
                ${item.description}
            </div>

            <label class="field-label">Count
                <input
                    type="number"
                    min="0"
                    value="${entry.count}"
                    placeholder="Count"
                    data-key="${item.description}">
            </label>
        `;

        const countInput = card.querySelector("input");

        countInput.addEventListener("input", e => {
            setCount(item.description, e.target.value);
        });

        app.appendChild(card);

    });

    createBottomNavigation();

}

function renderReview() {

    progress.textContent = "Review";

    app.innerHTML = "";

    createTopNavigation();

    inventory.forEach(category => {

        const heading = document.createElement("h2");

        heading.style.marginTop = "20px";

        heading.textContent = category.category;

        app.appendChild(heading);

        category.items.forEach(item => {

            const entry = getEntry(item.description);

            const row = document.createElement("div");

            row.className = "review-row";

            row.innerHTML = `
                <span>${item.description}</span>
                <strong>${entry.count || 0}</strong>
            `;

            app.appendChild(row);

        });

    });

    const orderButton = document.createElement("button");

    orderButton.textContent = "Generate Order";

    orderButton.onclick = renderOrder;

    app.appendChild(orderButton);

    const home = document.createElement("button");

    home.textContent = "Home";

    home.onclick = renderHome;

    app.appendChild(home);

}

function renderOrder() {

    progress.textContent = "Order";

    app.innerHTML = "";

    createTopNavigation();

    const title = document.createElement("h2");

    title.textContent = "Items To Order";

    app.appendChild(title);

    let anyOrders = false;

    inventory.forEach(category => {

        const rows = category.items
            .map(item => {
                const entry = getEntry(item.description);
                const count = Number(entry.count) || 0;
                const par = Number(item.par) || 0;
                const order = Math.max(par - count, 0);
                return { item, count, par, order };
            })
            .filter(row => row.order > 0);

        if (rows.length === 0) {
            return;
        }

        anyOrders = true;

        const heading = document.createElement("h2");

        heading.style.marginTop = "20px";

        heading.textContent = category.category;

        app.appendChild(heading);

        rows.forEach(row => {

            const card = document.createElement("div");

            card.className = "card order-row";

            card.innerHTML = `
                <div class="item-title">${row.item.description}</div>
                <div>Current: ${row.count} &nbsp; Par: ${row.par}</div>
                <div><strong>Order: ${row.order} ${row.item.unit}</strong></div>
            `;

            app.appendChild(card);

        });

    });

    if (!anyOrders) {

        const empty = document.createElement("p");

        empty.textContent = "Nothing needs ordering — every item is at or above par.";

        app.appendChild(empty);

    }

    const home = document.createElement("button");

    home.textContent = "Home";

    home.onclick = renderHome;

    app.appendChild(home);

}

function createTopNavigation() {

    const row = document.createElement("div");

    row.className = "button-row";

    const home = document.createElement("button");

    home.textContent = "Home";

    home.onclick = renderHome;

    row.appendChild(home);

    app.appendChild(row);

}

function createBottomNavigation() {

    const row = document.createElement("div");

    row.className = "button-row";

    const previous = document.createElement("button");

    previous.textContent = "Previous";

    previous.disabled = currentCategory === 0;

    previous.onclick = () => {

        if (currentCategory > 0) {

            currentCategory--;

            renderCategory(currentCategory);

        }

    };

    const home = document.createElement("button");

    home.textContent = "Home";

    home.onclick = renderHome;

    const next = document.createElement("button");

    if (currentCategory === inventory.length - 1) {

        next.textContent = "Review";

        next.onclick = renderReview;

    } else {

        next.textContent = "Next";

        next.onclick = () => {

            currentCategory++;

            renderCategory(currentCategory);

        };

    }

    row.appendChild(previous);
    row.appendChild(home);
    row.appendChild(next);

    app.appendChild(row);

}

renderHome();

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("sw.js");

    });

}