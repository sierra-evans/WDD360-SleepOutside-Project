<script>
    let name = '';
    let email = '';
    let password = '';
  
    let errors = {};
    let serverError = '';
    let loading = false;
    let success = false;
  
    function validate() {
      const e = {};
      if (!name.trim()) e.name = 'Enter your name.';
      if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address.';
      if (password.length < 8) e.password = 'Password must be at least 8 characters.';
      return e;
    }
  
    async function handleSubmit() {
      serverError = '';
      errors = validate();
      if (Object.keys(errors).length) return;
  
      loading = true;
      try {
        const res = await fetch('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
        });
  
        if (res.status === 409) {
          errors = { email: 'An account with this email already exists.' };
        } else if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          serverError = body.message || 'Something went wrong. Please try again.';
        } else {
          success = true;
          password = '';
        }
      } catch (err) {
        serverError = 'Could not reach the server. Check your connection and try again.';
      } finally {
        loading = false;
      }
    }
  </script>
  
  {#if success}
    <div class="signup" role="status">
      <h1>Account created</h1>
      <p>Thanks, {name}. You can now log in.</p>
    </div>
  {:else}
    <form class="signup" on:submit|preventDefault={handleSubmit} novalidate>
      <h1>Create your account</h1>
  
      {#if serverError}
        <p class="error" role="alert">{serverError}</p>
      {/if}
  
      <label for="name">Name</label>
      <input
        id="name"
        type="text"
        autocomplete="name"
        bind:value={name}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      {#if errors.name}<p class="error" id="name-error">{errors.name}</p>{/if}
  
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        autocomplete="email"
        bind:value={email}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {#if errors.email}<p class="error" id="email-error">{errors.email}</p>{/if}
  
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        autocomplete="new-password"
        bind:value={password}
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? 'password-error' : undefined}
      />
      {#if errors.password}<p class="error" id="password-error">{errors.password}</p>{/if}
  
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  {/if}
  
  <style>
    .signup {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-width: 22rem;
      margin: 2rem auto;
      padding: 0 1rem;
    }
  
    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
    }
  
    label {
      margin-top: 0.6rem;
      font-weight: 600;
    }
  
    input {
      padding: 0.6rem 0.7rem;
      font: inherit;
      border: 1px solid #888;
      border-radius: 4px;
    }
  
    input[aria-invalid='true'] {
      border-color: #b00020;
    }
  
    input:focus-visible,
    button:focus-visible {
      outline: 2px solid #1a56db;
      outline-offset: 2px;
    }
  
    button {
      margin-top: 1rem;
      padding: 0.7rem;
      font: inherit;
      font-weight: 600;
      color: #fff;
      background: #1a56db;
      border: 0;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  
    .error {
      margin: 0;
      color: #b00020;
      font-size: 0.875rem;
    }
  </style>