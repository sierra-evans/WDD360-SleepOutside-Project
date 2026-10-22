<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import { getParam } from "../js/utils.mjs";

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
  {#each products as product}
      <li class="product-card">
        <a href="products/880RR/">
          <img
            src="images/tents/marmot-ajax-tent-3-person-3-season-in-pale-pumpkin-terracotta~p~880rr_01~320.jpg"
            alt="Marmot Ajax tent"
          />
          <h3 class="card__brand">Marmot</h3>
          <h2 class="card__name">Ajax Tent - 3-Person, 3-Season</h2>
          <p class="product-card__price">$199.99</p></a
        >
      </li>
  {/each}
</ul>