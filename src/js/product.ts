import type { Product } from "./types.mts";
import { findProductById } from "./productData.mts";
import { addToCart } from "./cartStore.svelte.ts";

function addProductToCart(product: Product) {
  // addToCart bumps the quantity if the product is already in the cart,
  // and also updates the item count shown on the backpack icon
  addToCart(product);
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
