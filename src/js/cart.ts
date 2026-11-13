import {
  getCart,
  setQuantity,
  removeFromCart,
  lineTotal,
  cartTotal,
  countItems,
  MAX_QUANTITY,
  type CartItem,
} from "./cartStore.svelte.ts";

const listEl = document.querySelector(".product-list");

function renderCartContents() {
  const cartItems = getCart();
  // Re-rendering replaces the buttons and inputs, so remember which control had focus
  // (e.g. the + button someone is clicking repeatedly) and put focus back afterwards.
  const focused = document.activeElement as HTMLElement | null;
  const focusKey = focused?.dataset.id ? { id: focused.dataset.id, action: focused.dataset.action } : null;

  if (listEl) listEl.innerHTML = cartItems.map(cartItemTemplate).join("");
  renderCartTotal(cartItems);

  if (focusKey && listEl) {
    const target = listEl.querySelector<HTMLElement>(
      `[data-id="${CSS.escape(focusKey.id)}"][data-action="${focusKey.action}"]`
    );
    // a − button that just became disabled (quantity hit 1) can't take focus, so fall back to the input
    if (target && !(target as HTMLButtonElement).disabled) {
      target.focus();
    } else {
      listEl.querySelector<HTMLElement>(`[data-id="${CSS.escape(focusKey.id)}"][data-action="set"]`)?.focus();
    }
  }
}

function renderCartTotal(cartItems: CartItem[]) {
  const footerEl = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");

  if (!footerEl || !totalEl) return;

  // If the cart is empty, hide the footer and reset the total
  if (cartItems.length === 0) {
    footerEl.classList.add("hide");
    totalEl.innerHTML = "Total: $0.00";
    return;
  }
  const count = countItems(cartItems);

  footerEl.classList.remove("hide");
  totalEl.innerHTML = `Total (${count} ${count === 1 ? "item" : "items"}): $${cartTotal(cartItems).toFixed(2)}`;
}

function cartItemTemplate(item: CartItem) {
  const atMin = item.quantity <= 1;
  const atMax = item.quantity >= MAX_QUANTITY;
  const newItem = `<li class="cart-card divider">
  <a href="/products/${item.id}/" class="cart-card__image">
    <img
      src="${item.images.primaryExtraLarge}"
      alt="${item.name}"
    />
  </a>
  <a href="/products/${item.id}/">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${item.colors[0]?.colorName ?? ""}</p>
  <div class="cart-card__quantity">
    <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}"
      aria-label="Decrease quantity of ${item.name}" ${atMin ? "disabled" : ""}>&minus;</button>
    <label class="visually-hidden" for="qty-${item.id}">Quantity of ${item.name}</label>
    <input id="qty-${item.id}" class="qty-input" type="number" inputmode="numeric"
      min="1" max="${MAX_QUANTITY}" step="1" value="${item.quantity}" data-action="set" data-id="${item.id}" />
    <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}"
      aria-label="Increase quantity of ${item.name}" ${atMax ? "disabled" : ""}>+</button>
  </div>
  <p class="cart-card__price">
    $${lineTotal(item).toFixed(2)}
    ${item.quantity > 1 ? `<small>$${item.finalPrice.toFixed(2)} each</small>` : ""}
  </p>
  <button class="cart-card_remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">X</button>
</li>`;

  return newItem;
}

renderCartContents();

// One listener on the list handles the −, + and X buttons for every item.
listEl?.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
  if (!button?.dataset.id) return;
  const id = button.dataset.id;
  const item = getCart().find((i) => i.id === id);
  if (!item) return;

  switch (button.dataset.action) {
    case "increase":
      setQuantity(id, item.quantity + 1);
      break;
    case "decrease":
      setQuantity(id, item.quantity - 1);
      break;
    case "remove":
      removeFromCart(id);
      break;
    default:
      return;
  }
  renderCartContents();
});

// Typed-in quantities. "change" fires when the shopper presses Enter, leaves the box, or uses the
// browser's arrow keys, so we don't re-render (and steal the cursor) while they are still typing.
// Anything invalid (blank, 0, 2.5, 500) is corrected by setQuantity to the nearest allowed value.
listEl?.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.action !== "set" || !input.dataset.id) return;
  const id = input.dataset.id;
  // A blank box (or text a number box can't read, which also comes through as "") means
  // "never mind", so put back the quantity they already had.
  const current = getCart().find((i) => i.id === id)?.quantity ?? 1;
  setQuantity(id, input.value.trim() === "" ? current : Number(input.value));
  renderCartContents();
});

// keep this tab's cart in sync if the cart is changed in another tab
window.addEventListener("storage", (event) => {
  if (event.key === "so-cart") renderCartContents();
});
