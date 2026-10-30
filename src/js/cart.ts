import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import type { Product } from "./types.mjs";

function renderCartContents() {
  const cartItems: Product[] = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map((item: Product) => cartItemTemplate(item));
  const listEl = document.querySelector(".product-list");
  if (listEl) listEl.innerHTML = htmlItems.join("");
  renderCartTotal(cartItems);
}

function renderCartTotal(cartItems: Product[]) {
  if (cartItems.length === 0) return;

  const footerEl = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");
  if (!footerEl || !totalEl) return;

  const total = cartItems.reduce((sum, item) => sum + item.finalPrice, 0);
  footerEl.classList.remove("hide");
  totalEl.innerHTML = `Total: $${total.toFixed(2)}`;
}

// REMOVE FROM CART FEATURE
function removeItem(id: string) {
  // Get current cart from local storage and create new cart without the clicked on item
  const cartItems: Product[] = getLocalStorage("so-cart") || [];
  const updatedCart = cartItems.filter((item: Product) => item.id !== id);
  // Save updated cart to local storage and update the displayed cart
  setLocalStorage("so-cart", updatedCart);
  renderCartContents();
}

function cartItemTemplate(item: Product) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.images.primaryExtraLarge}"
      alt="${item.name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${item.colors[0].colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.finalPrice}</p>
  <button class="cart-card_remove" data-id="${item.id}">X</button>
</li>`;

  return newItem;
}

renderCartContents();

// REMOVE FROM CART FEATURE
const listEl = document.querySelector(".product-list");

// Listen for clicks on product list
listEl?.addEventListener("click", (event) => {
  // Grab element that was clicked and find remove button
  const target = event.target as HTMLElement;
  const button = target.closest(".cart-card_remove");
  // Stop if the click wasn't on the remove button
  if (!button) return;
  // Get the product id from the button and call removeItem function
  const id = button.getAttribute("data-id");
  if (id) removeItem(id);
})