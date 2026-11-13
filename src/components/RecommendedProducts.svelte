<script lang="ts">
  import { onMount } from "svelte";
  import { getRecommendedProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import ProductSummary from "./ProductSummary.svelte";

  let { productId }: { productId: string } = $props();

  let products: Product[] = $state([]);
  let status = $state<"loading" | "loaded" | "failed">("loading");

  // Fetched in the browser (not when the page is built) because the server picks
  // recommendations at random, so each visit can show something different.
  onMount(async () => {
    try {
      products = await getRecommendedProducts(productId);
      // nothing to recommend: hide the section rather than show an empty heading
      status = products.length ? "loaded" : "failed";
    } catch (err) {
      // Recommendations are a bonus. If the API is down, quietly leave them off the page.
      console.error("Could not load recommended products:", err);
      status = "failed";
    }
  });
</script>

<!-- The section is rendered on the server while loading. That matters for client:visible:
     Astro decides when to load this component by watching the elements it rendered, so if it
     rendered nothing the component would never load. -->
{#if status !== "failed"}
  <section class="recommended" aria-labelledby="recommended-heading" aria-busy={status === "loading"}>
    <h2 id="recommended-heading">You might also like</h2>
    {#if status === "loading"}
      <p class="recommended__loading">Loading recommendations...</p>
    {:else}
      <ul class="product-list">
        {#each products as product (product.id)}
          <ProductSummary {product} />
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style>
  .recommended {
    max-width: 900px;
    margin: 2em auto;
    padding: 1em 0.5em 0;
    border-top: 1px solid var(--light-grey);
  }
  h2 {
    text-align: center;
    margin-top: 0;
  }
  .recommended__loading {
    text-align: center;
    color: var(--dark-grey);
    /* roughly the height of a row of cards, so the page doesn't jump when they arrive */
    min-height: 20em;
  }
</style>
