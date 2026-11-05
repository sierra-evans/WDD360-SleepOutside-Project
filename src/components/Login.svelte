<script lang="ts">
  import { onMount } from "svelte";
  import { login } from "../js/auth.svelte";
  import { getParam } from "../js/utils.mts";

  interface Props {
    onSuccess?: (path: string) => void;
  }

  // Optional callback for a successful login. If none is passed in, redirect the user to redirectPath.
  let {
    onSuccess = (path: string) => {
      window.location.href = path;
    },
  }: Props = $props();

  let email = $state("");
  let password = $state("");
  let errors = $state<string[]>([]);
  let submitted = $state(false);
  let redirectPath = "/";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): string[] {
    const problems: string[] = [];
    if (!emailPattern.test(email.trim())) {
      problems.push("Enter a valid email address, like name@example.com.");
    }
    if (password.length < 6) {
      problems.push("Password must be at least 6 characters long.");
    }
    return problems;
  }

  async function loginHandler(e: SubmitEvent) {
    e.preventDefault();
    submitted = true;
    errors = validate();
    if (errors.length) return;

    try {
      await login(email.trim(), password);
      onSuccess(redirectPath);
    } catch (error: any) {
      console.log(error);
      errors = [error.message];
    }
  }

  onMount(() => {
    const param = getParam("redirect");
    if (param) {
      // if the redirect param exists use that
      redirectPath = param;
    } else if (document.referrer && document.referrer !== window.location.href) {
      // otherwise send back to the referring page if set
      redirectPath = document.referrer;
    }
    // otherwise redirectPath stays "/" (send home)
  });
</script>

<!-- novalidate turns off the browser's built-in popups so our own messages show instead -->
<form class="login" onsubmit={loginHandler} novalidate>
  <h2>Log In</h2>

  <label for="login-email">Email</label>
  <input
    id="login-email"
    type="email"
    autocomplete="email"
    bind:value={email}
    aria-invalid={submitted && !emailPattern.test(email.trim())}
    aria-describedby="login-errors"
  />

  <label for="login-password">Password</label>
  <input
    id="login-password"
    type="password"
    autocomplete="current-password"
    bind:value={password}
    aria-invalid={submitted && password.length < 6}
    aria-describedby="login-errors"
  />

  <button type="submit">Log In</button>

  <!-- role="alert" makes screen readers announce the errors as soon as they appear -->
  <ul id="login-errors" class="errors" role="alert">
    {#each errors as error}
      <li>{error}</li>
    {/each}
  </ul>
</form>

<style>
  .login {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 22rem;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid var(--light-grey);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  h2 {
    margin-top: 0;
  }
  label {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--dark-grey);
  }
  input {
    font: inherit;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--light-grey);
    border-radius: 4px;
    background: white;
    color: var(--dark-grey);
  }
  input[aria-invalid="true"] {
    border-color: #c0392b;
  }
  input:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--secondary-color);
    outline-offset: 2px;
  }
  button {
    font: inherit;
    margin-top: 0.5rem;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: var(--primary-color);
    color: var(--dark-grey);
    cursor: pointer;
  }
  button:hover {
    opacity: 0.85;
  }
  .errors {
    margin: 0;
    padding-left: 1.2rem;
    color: #c0392b;
    font-size: 0.85rem;
  }
</style>
