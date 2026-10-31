<script lang="ts">
  import { onMount } from "svelte";
  import { isWished, addToWishlist, removeFromWishlist } from "../js/wishlist";

  let { productId }: { productId: string } = $props();
  let wished = $state(false);

  onMount(() => {
    wished = isWished(productId);
  });

  function toggle(): void {
    if (wished) removeFromWishlist(productId);
    else addToWishlist(productId);
    wished = !wished;
  }
</script>

<button class="wishlist-btn" onclick={toggle} aria-pressed={wished}>
  {wished ? "♥ On your wish list" : "♡ Add to wish list"}
</button>