<script lang="ts">
  import { userStore, logout, checkAuth } from "../js/auth.svelte";
  import { onMount } from "svelte";
  import ChangePassword from "./ChangePassword.svelte";
  const baseURL = import.meta.env.PUBLIC_SERVER_URL;
  let profile = $state<{ message: string } | null>(null);

  function redirectToLogin() {
    window.location.href = `/login/?redirect=${window.location.pathname}`;
  }

  async function getProfile() {
    const res = await fetch(`${baseURL}users/protected`, {
      method: "GET",
      headers: {
        // This is how we pass our token to the server for protected routes.
        Authorization: `Bearer ${userStore.token}`,
      },
    });
    if (res.ok) {
      return res.json();
    } else {
      // if we get an error back...it means there is something wrong with our token and we should log the user out.
      logout();
      redirectToLogin();
      return null;
    }
  }

  async function init() {
    // main.ts also calls checkAuth, but we can't guarantee it ran before this component mounted,
    // so make sure the store is loaded from local storage before deciding the user isn't logged in.
    checkAuth();
    if (!userStore.isLoggedIn) {
      redirectToLogin();
      return;
    }
    profile = await getProfile();
  }
  onMount(init);
</script>

{#if userStore.isLoggedIn}
  {#if profile}
    <p>{profile.message}</p>
    <ChangePassword />
  {:else}
    <p>Loading...</p>
  {/if}
{:else}
  <p>You must <a href="/login/?redirect=/profile/">login</a> to see this page</p>
{/if}
