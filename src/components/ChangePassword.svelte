<script lang="ts">
  import { changePassword, SessionExpiredError } from "../js/auth.svelte";

  const MIN_LENGTH = 6;
  const MAX_LENGTH = 100;

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let errors = $state<string[]>([]);
  let success = $state("");
  let submitted = $state(false);
  let saving = $state(false);

  // per-field checks, used for both the error list and aria-invalid
  const currentInvalid = $derived(currentPassword.length === 0);
  const newInvalid = $derived(
    newPassword.length < MIN_LENGTH ||
      newPassword.length > MAX_LENGTH ||
      newPassword === currentPassword
  );
  const confirmInvalid = $derived(confirmPassword !== newPassword);

  function validate(): string[] {
    const problems: string[] = [];
    if (currentInvalid) {
      problems.push("Enter your current password.");
    }
    if (newPassword.length < MIN_LENGTH || newPassword.length > MAX_LENGTH) {
      problems.push(`New password must be ${MIN_LENGTH}-${MAX_LENGTH} characters long.`);
    } else if (newPassword === currentPassword) {
      problems.push("New password must be different from your current password.");
    }
    if (confirmInvalid) {
      problems.push("New passwords do not match.");
    }
    return problems;
  }

  async function submitHandler(e: SubmitEvent) {
    e.preventDefault();
    success = "";
    submitted = true;
    errors = validate();
    if (errors.length) return;

    saving = true;
    try {
      await changePassword(currentPassword, newPassword);
      success = "Your password has been changed.";
      // reset the form so the passwords aren't left sitting in the inputs
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      submitted = false;
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        window.location.href = `/login/?redirect=${window.location.pathname}`;
        return;
      }
      errors = [error.message];
    } finally {
      saving = false;
    }
  }
</script>

<!-- novalidate turns off the browser's built-in popups so our own messages show instead -->
<form class="change-password" onsubmit={submitHandler} novalidate>
  <h2>Change Password</h2>

  <label for="cp-current">Current password</label>
  <input
    id="cp-current"
    type="password"
    autocomplete="current-password"
    bind:value={currentPassword}
    aria-invalid={submitted && currentInvalid}
    aria-describedby="cp-errors"
  />

  <label for="cp-new">New password</label>
  <input
    id="cp-new"
    type="password"
    autocomplete="new-password"
    bind:value={newPassword}
    aria-invalid={submitted && newInvalid}
    aria-describedby="cp-hint cp-errors"
  />
  <small id="cp-hint">At least {MIN_LENGTH} characters.</small>

  <label for="cp-confirm">Confirm new password</label>
  <input
    id="cp-confirm"
    type="password"
    autocomplete="new-password"
    bind:value={confirmPassword}
    aria-invalid={submitted && confirmInvalid}
    aria-describedby="cp-errors"
  />

  <button type="submit" disabled={saving}>
    {saving ? "Saving..." : "Change Password"}
  </button>

  <!-- role="alert" makes screen readers announce the errors as soon as they appear -->
  <ul id="cp-errors" class="errors" role="alert">
    {#each errors as error}
      <li>{error}</li>
    {/each}
  </ul>
  <p class="success" role="status">{success}</p>
</form>

<style>
  .change-password {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 22rem;
    margin: 2rem 0;
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
  small {
    font-size: 0.75rem;
    color: var(--dark-grey);
    margin-top: -0.25rem;
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
  button:hover:not(:disabled) {
    opacity: 0.85;
  }
  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .errors {
    margin: 0;
    padding-left: 1.2rem;
    color: #c0392b;
    font-size: 0.85rem;
  }
  .errors:empty,
  .success:empty {
    display: none;
  }
  .success {
    margin: 0;
    color: #1e7e34;
    font-size: 0.9rem;
    font-weight: bold;
  }
</style>
