<script lang="ts">
  import { getWishlistIds, removeFromWishlist, isAuthError } from "../js/wishlist";
  import { onMount } from "svelte";
  import { findProductById } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";

  let items: Product[] = $state([]);
  let loading = $state(true);

let message = $state("");

onMount(async () => {
  try {
    const ids = await getWishlistIds();
    const results = await Promise.allSettled(ids.map(findProductById));
    items = results
      .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
      .map((r) => r.value);
  } catch (err) {
    message = isAuthError(err)
      ? "Please log in to see your wish list."
      : "Could not load your wish list. Please try again.";
  }
  loading = false;
});

async function remove(id: string): Promise<void> {
  const previous = items;
  items = items.filter((p) => p.id !== id);
  try {
    await removeFromWishlist(id);
  } catch {
    items = previous; // put it back if the server rejected the change
    message = "Could not remove that item. Please try again.";
  }
}

function moveToCart(item: Product): void {
  // addToCart(item);
  void remove(item.id);
}
</script>

{#if loading}
  <p>Loading...</p>
{:else if items.length === 0}
  <p>{message || "Your wish list is empty."}</p>
{:else}
  {#if message}
    <p role="alert">{message}</p>
  {/if}
  <ul class="product-list">
    {#each items as item (item.id)}
      <li class="product-card">
        <a href="/products/{item.id}/">
          <img src={item.images.primaryLarge} alt={item.name} />
          <h3 class="card__brand">{item.brand.name}</h3>
          <h2 class="card__name">{item.nameWithoutBrand}</h2>
          <p class="product-card__price">${item.finalPrice}</p>
        </a>
        <button onclick={() => moveToCart(item)}>Move to cart</button>
        <button onclick={() => remove(item.id)}>Remove</button>
      </li>
    {/each}
  </ul>
{/if}