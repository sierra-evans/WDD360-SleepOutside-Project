<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import { getParam } from "../js/utils.mjs";
  import ProductSummary from "./ProductSummary.svelte";

// declare these out here as state so we can us it in our template below
  let category = $state(""); 
  let products:Product[] = $state([]);

  async function init() {
  category = getParam("category") || "tents";
  const data = await getProducts(category);
  console.log("data:", data);
  products = data.results;
  console.log("products:", products);
}
  onMount(init);
</script>


<h2>Top products: {category}</h2>
<p>Category: {category}</p>
<ul class="product-list">
  {#each products as product (product.id)}
      <ProductSummary {product} />
  {/each}

</ul>