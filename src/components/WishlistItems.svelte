<script lang="ts">
  import { onMount } from "svelte";
  import { getWishlistIds, removeFromWishlist } from "../js/wishlist";
  import { findProductById } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  // import { addToCart } from "../js/cart"; // use your real cart function (paste cart.ts and I'll wire it)

  let items: Product[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const results = await Promise.allSettled(getWishlistIds().map(findProductById));
    items = results
      .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
      .map((r) => r.value);
    loading = false;
  });

  function remove(id: string): void {
    removeFromWishlist(id);
    items = items.filter((p) => p.id !== id);
  }

  function moveToCart(item: Product): void {
    // addToCart(item);
    remove(item.id);
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if items.length === 0}
  <p>Your wish list is empty.</p>
{:else}
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