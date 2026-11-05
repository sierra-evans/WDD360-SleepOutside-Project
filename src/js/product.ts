import type { Product } from "./types.mts";
import { findProductById } from "./productData.mts";
import { getCart, saveCart } from "./cartStore.svelte.ts";

function addProductToCart(product: Product) {
  const cartItems = getCart();
  cartItems.push(product);
  // saveCart also updates the item count shown on the backpack icon
  saveCart(cartItems);
  // Let the Header (a Svelte component) know so it can animate the cart icon.
  window.dispatchEvent(new CustomEvent("cart:item-added", { detail: product }));
}
// add to cart button event handler
async function addToCartHandler(e: Event) {
  const target = e.target as HTMLButtonElement;
  if (target.dataset.id) {
    const product = await findProductById(target.dataset.id);
    addProductToCart(product);
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
