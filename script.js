const foods = [
  {
    id: 1, name: "Margherita Pizza", category: "Pizza", price: 199,
    description: "Classic pizza with cheese and tomato.",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600"
  },
  {
    id: 2, name: "Cheese Burger", category: "Burger", price: 149,
    description: "Juicy burger layered with cheese.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
  },
  {
    id: 3, name: "Veg Hakka Noodles", category: "Chinese", price: 129,
    description: "Stir-fried noodles with fresh vegetables.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"
  },
  {
    id: 4, name: "French Fries", category: "Burger", price: 99,
    description: "Golden, crispy and lightly salted fries.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"
  },
  {
    id: 5, name: "Cold Coffee", category: "Drinks", price: 89,
    description: "Chilled coffee for a refreshing break.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"
  },
  {
    id: 6, name: "Chocolate Cake", category: "Dessert", price: 119,
    description: "Rich chocolate cake for dessert lovers.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600"
  },
  {
    id: 7, name: "Farmhouse Pizza", category: "Pizza", price: 249,
    description: "Pizza topped with colourful vegetables.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"
  }
];

// Use a safe fallback if browser storage is unavailable or contains invalid data.
let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem("foodieCart") || "[]");
  if (Array.isArray(savedCart)) cart = savedCart;
} catch (error) {
  cart = [];
}

// Remove any saved cart entries that do not match the current menu.
cart = cart.filter(item =>
  foods.some(food => food.id === item.id) &&
  Number.isInteger(item.quantity) && item.quantity > 0
);

const foodContainer = document.getElementById("food-container");
const cartContainer = document.getElementById("cart-items");

function displayFoods(category = "All") {
  const visibleFoods = category === "All"
    ? foods
    : foods.filter(food => food.category === category);

  foodContainer.innerHTML = visibleFoods.map(food => `
    <article class="food-card">
      <img src="${food.image}" alt="${food.name}"
           onerror="this.src='https://placehold.co/600x400?text=Food'">
      <div class="food-info">
        <h3>${food.name}</h3>
        <p class="description">${food.description}</p>
        <div class="food-bottom">
          <span class="food-price">₹${food.price}</span>
          <button class="add-btn" data-add="${food.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const food = foods.find(item => item.id === id);
  if (!food) return;

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: food.id, quantity: 1 });
  }
  updateCart();
}

function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function updateCart() {
  let subtotal = 0;
  let totalItems = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<p class="empty-cart">Your cart is empty. Add something tasty!</p>';
  } else {
    cartContainer.innerHTML = cart.map(item => {
      const food = foods.find(entry => entry.id === item.id);
      if (!food) return "";

      const lineTotal = food.price * item.quantity;
      subtotal += lineTotal;
      totalItems += item.quantity;

      return `
        <div class="cart-item">
          <div>
            <strong>${food.name}</strong>
            <small>₹${food.price} each</small>
          </div>
          <div class="quantity">
            <button data-change="-1" data-id="${food.id}" aria-label="Decrease ${food.name}">−</button>
            <span>${item.quantity}</span>
            <button data-change="1" data-id="${food.id}" aria-label="Increase ${food.name}">+</button>
          </div>
          <strong class="line-total">₹${lineTotal.toFixed(2)}</strong>
          <button class="remove-btn" data-remove="${food.id}">Remove</button>
        </div>
      `;
    }).join("");
  }

  const tax = subtotal * 0.05;
  const delivery = subtotal > 0 ? 30 : 0;
  const grandTotal = subtotal + tax + delivery;

  document.getElementById("cart-count").textContent = totalItems;
  document.getElementById("subtotal").textContent = formatRupees(subtotal);
  document.getElementById("tax").textContent = formatRupees(tax);
  document.getElementById("delivery").textContent = formatRupees(delivery);
  document.getElementById("total").textContent = formatRupees(grandTotal);

  localStorage.setItem("foodieCart", JSON.stringify(cart));
}

function formatRupees(amount) {
  return "₹" + amount.toFixed(2);
}

// Event delegation keeps the menu and cart buttons working after re-rendering.
foodContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

cartContainer.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(Number(quantityButton.dataset.id), Number(quantityButton.dataset.change));
  } else if (removeButton) {
    removeItem(Number(removeButton.dataset.remove));
  }
});

document.querySelector(".categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");
  displayFoods(button.dataset.category);
});

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add food items first.");
    return;
  }

  const total = document.getElementById("total").textContent;
  alert(`Demo order placed successfully!\nYour total bill is ${total}.`);
  cart = [];
  updateCart();
});

displayFoods();
updateCart();
