import { getLocalStorage, setLocalStorage } from "./utils.mts";
import type { Product } from "./types.mts";

const CART_KEY = "so-cart";

// Shared, reactive cart state. Svelte components that read cartState.count (like the Header)
// update automatically whenever it changes.
export const cartState = $state({ count: 0 });

export function getCart(): Product[] {
  return getLocalStorage(CART_KEY) || [];
}

// Always save the cart through this function so the count in the header stays in sync.
export function saveCart(items: Product[]) {
  setLocalStorage(CART_KEY, items);
  cartState.count = items.length;
}

// Re-read the count from local storage (on page load, or when another tab changes the cart).
export function refreshCartCount() {
  cartState.count = getCart().length;
}
