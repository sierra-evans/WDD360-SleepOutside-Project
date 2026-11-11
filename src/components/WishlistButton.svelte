<script lang="ts">
  import { onMount } from "svelte";
  import { isWished, addToWishlist, removeFromWishlist, isAuthError } from "../js/wishlist";

  let { productId }: { productId: string } = $props();
  let wished = $state(false);
  let message = $state("");

  onMount(async () => {
    try {
      wished = await isWished(productId);
    } catch {
      wished = false; // not logged in or server unreachable: just show the empty heart
    }
  });

  async function toggle(): Promise<void> {
    const previous = wished;
    wished = !previous; // update the heart right away
    message = "";
    try {
      if (previous) await removeFromWishlist(productId);
      else await addToWishlist(productId);
    } catch (err) {
      wished = previous; // undo, since the server didn't accept it
      message = isAuthError(err)
        ? "Please log in to use your wish list."
        : "Something went wrong. Please try again.";
    }
  }
</script>

<button class="wishlist-btn" onclick={toggle} aria-pressed={wished}>
  {wished ? "♥ On your wish list" : "♡ Add to wish list"}
</button>
{#if message}
  <p role="alert">{message}</p>
{/if}