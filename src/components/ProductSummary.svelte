<script lang="ts">
  import type { Product } from "../js/types.mts";
  import WishlistButton from "./WishlistButton.svelte";
  let { product }: { product: Product } = $props();
</script>

<li class="product-card">
  <a href="/products/{product.id}/">
    <picture>
      <source media="(min-width: 1000px)" srcset={product.images.primaryExtraLarge} />
      <source media="(min-width: 600px)" srcset={product.images.primaryLarge} />
      <img src={product.images.primaryMedium} alt={product.name} />
    </picture>
    <h3 class="card__brand">{product.brand.name}</h3>
    <h2 class="card__name">{product.nameWithoutBrand}</h2>
    <p class="product-card__price">${product.finalPrice}</p></a
  >
   <WishlistButton productId={product.id} />
</li>