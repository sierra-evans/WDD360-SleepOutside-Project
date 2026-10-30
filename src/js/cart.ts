import { getLocalStorage } from "./utils.mjs";
import type { Product } from "./types.mjs";

function renderCartContents() {
  const cartItems: Product[] = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map((item: Product) => cartItemTemplate(item));
  const listEl = document.querySelector(".product-list");
  if (listEl) listEl.innerHTML = htmlItems.join("");
  renderCartTotal(cartItems);
}

function renderCartTotal(cartItems: Product[]) {
  const footerEl = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");

  if (!footerEl || !totalEl) return;

  // If the cart is empty, hide the footer and reset the total
  if (cartItems.length === 0) {
    footerEl.classList.add("hide");
    totalEl.innerHTML = "Total: $0.00";
    return;
  }
  const total = cartItems.reduce((sum, item) => sum + item.finalPrice, 0);

  footerEl.classList.remove("hide");
  totalEl.innerHTML = `Total: $${total.toFixed(2)}`;
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
</li>`;

  return newItem;
}

renderCartContents();
