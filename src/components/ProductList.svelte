<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts, searchProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import { getParam } from "../js/utils.mjs";
  import ProductSummary from "./ProductSummary.svelte";

  // declare these out here as state so we can us it in our template below
  let category = $state("");
  let searchTerm = $state("");
  let products: Product[] = $state([]);
  let loading = $state(true);
  let error = $state("");

  async function init() {
    searchTerm = (getParam("search") || "").trim();
    try {
      if (searchTerm) {
        const data = await searchProducts(searchTerm);
        products = data.results;
      } else {
        category = getParam("category") || "tents";
        const data = await getProducts(category);
        products = data.results;
      }
    } catch (err) {
      error = "We couldn't load products right now. Please try again.";
    } finally {
      loading = false;
    }
  }
  onMount(init);
</script>

{#if searchTerm}
  <h2>Search results for “{searchTerm}”</h2>
{:else}
  <h2>Top products: {category}</h2>
{/if}

{#if loading}
  <p>Loading…</p>
{:else if error}
  <p role="alert">{error}</p>
{:else if products.length === 0}
  <p>
    {searchTerm ? `No products found for “${searchTerm}”. Try a different search.` : "No products in this category."}
  </p>
{:else}
  <ul class="product-list">
    {#each products as product (product.id)}
      <ProductSummary {product} />
    {/each}
  </ul>
{/if}