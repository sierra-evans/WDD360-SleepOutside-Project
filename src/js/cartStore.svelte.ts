import { getLocalStorage, setLocalStorage } from "./utils.mts";
import type { Product } from "./types.mts";

const CART_KEY = "so-cart";
export const MAX_QUANTITY = 99;

// A product in the cart, plus how many of it the shopper wants.
export type CartItem = Product & { quantity: number };

// Shared, reactive cart state. Svelte components that read cartState.count (like the Header)
// update automatically whenever it changes. count is the total number of units, so 2 tents + 1 bag = 3.
export const cartState = $state({ count: 0 });

// Turns anything (a typed-in string, NaN, 3.7, -2) into a whole number from 1 to MAX_QUANTITY.
export function clampQuantity(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_QUANTITY);
}

// One entry per product, each with a valid quantity.
// Carts saved before quantities existed have one entry per click and no quantity field,
// so this also merges those duplicates: two separate "Ajax Tent" entries become one with quantity 2.
function normalizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, CartItem>();
  for (const item of raw) {
    if (!item?.id) continue;
    const quantity = clampQuantity(item.quantity ?? 1);
    const existing = byId.get(item.id);
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + quantity);
    } else {
      byId.set(item.id, { ...item, quantity });
    }
  }
  return [...byId.values()];
}

export function getCart(): CartItem[] {
  return normalizeCart(getLocalStorage(CART_KEY));
}

export function countItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Totals are added up in cents so floating point doesn't produce totals like 399.97999999.
export function lineTotal(item: CartItem): number {
  return (Math.round(item.finalPrice * 100) * item.quantity) / 100;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((cents, item) => cents + Math.round(item.finalPrice * 100) * item.quantity, 0) / 100;
}

// Always save the cart through this function so the count in the header stays in sync.
export function saveCart(items: CartItem[]) {
  setLocalStorage(CART_KEY, items);
  cartState.count = countItems(items);
}

// Adding a product that's already in the cart bumps its quantity instead of adding a second entry.
export function addToCart(product: Product) {
  const items = getCart();
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + 1);
  } else {
    items.push({ ...product, quantity: 1 });
  }
  saveCart(items);
}

export function setQuantity(id: string, quantity: number) {
  const items = getCart();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  item.quantity = clampQuantity(quantity);
  saveCart(items);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((item) => item.id !== id));
}

// Re-read the count from local storage (on page load, or when another tab changes the cart).
export function refreshCartCount() {
  cartState.count = countItems(getCart());
}
