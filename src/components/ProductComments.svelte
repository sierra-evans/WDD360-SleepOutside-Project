<script lang="ts">
  import { onMount } from "svelte";
  import { getComments, addComment } from "../js/comments.mts";
  import type { ProductComment } from "../js/types.mts";

  let { productId }: { productId: string } = $props();

  let comments: ProductComment[] = $state([]);
  let loading = $state(true);
  let name = $state("");
  let text = $state("");
  let error = $state("");
  let submitting = $state(false);

  onMount(async () => {
    comments = await getComments(productId);
    loading = false;
  });

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      error = "Please enter your name and a comment.";
      return;
    }
    error = "";
    submitting = true;
    try {
      const created = await addComment(productId, name, text);
      comments = [created, ...comments];
      text = "";
    } catch {
      error = "Could not post your comment. Please try again.";
    } finally {
      submitting = false;
    }
  }
</script>

<h2>Customer Comments</h2>

<form class="comment-form" onsubmit={submit}>
  <label for="comment-name">Name</label>
  <input id="comment-name" type="text" maxlength="50" bind:value={name} required />

  <label for="comment-text">Comment</label>
  <textarea id="comment-text" rows="4" maxlength="500" bind:value={text} required></textarea>

  {#if error}
    <p class="comment-form__error" role="alert">{error}</p>
  {/if}

  <button type="submit" disabled={submitting}>
    {submitting ? "Posting..." : "Post comment"}
  </button>
</form>

{#if loading}
  <p>Loading comments...</p>
{:else if comments.length === 0}
  <p>No comments yet. Be the first to share your thoughts!</p>
{:else}
  <ul class="comment-list">
    {#each comments as comment (comment.id)}
      <li class="comment">
        <p class="comment__meta">
          <strong>{comment.name}</strong>
          <time datetime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </time>
        </p>
        <p class="comment__text">{comment.text}</p>
      </li>
    {/each}
  </ul>
{/if}