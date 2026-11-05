import { checkAuth } from "./auth.svelte.ts";

// Runs on every page (included in Layout.astro) so the app remembers the user is logged in between page loads.
checkAuth();
