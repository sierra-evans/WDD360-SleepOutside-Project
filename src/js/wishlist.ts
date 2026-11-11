import { userStore, checkAuth, logout, SessionExpiredError } from "./auth.svelte.ts";

const baseURL = import.meta.env.PUBLIC_SERVER_URL;

// Thrown when there is no logged-in user at all (as opposed to an expired session)
export class NotLoggedInError extends Error {
  constructor(message = "Please log in to use your wish list.") {
    super(message);
    this.name = "NotLoggedInError";
  }
}

// True for either "never logged in" or "session expired", so components can show a login prompt
export function isAuthError(err: unknown): boolean {
  return err instanceof NotLoggedInError || err instanceof SessionExpiredError;
}

async function request(path: string, options: RequestInit = {}): Promise<string[]> {
  // userStore is only filled from localStorage when checkAuth() runs, so make sure it has
  if (!userStore.token) checkAuth();
  const token = userStore.token;
  if (!token) throw new NotLoggedInError();

  const res = await fetch(baseURL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // authorize() answers 401 (no token) or 403 (bad/expired token)
  if (res.status === 401 || res.status === 403) {
    logout();
    throw new SessionExpiredError();
  }
  if (!res.ok) throw new Error(`Bad Response: ${res.status} ${res.url}`);
  return res.json();
}

// The list is fetched once and shared, so 20 buttons on a product list make 1 request, not 20.
// (Your server rate-limits /api to 100 requests per hour per IP.)
// The cache is tied to the token, so logging out or switching users forces a fresh fetch.
let cache: Promise<string[]> | null = null;
let cacheToken = "";

function load(path: string, options?: RequestInit): Promise<string[]> {
  const promise = request(path, options);
  cache = promise;
  cacheToken = userStore.token;
  promise.catch(() => {
    if (cache === promise) cache = null; // never cache a failure
  });
  return promise;
}

export function getWishlistIds(): Promise<string[]> {
  if (!userStore.token) checkAuth();
  if (cache && cacheToken === userStore.token) return cache;
  return load("wishlist");
}

export async function isWished(id: string): Promise<boolean> {
  return (await getWishlistIds()).includes(id);
}

// POST and DELETE return the updated list, which becomes the new cache
export async function addToWishlist(id: string): Promise<void> {
  await load("wishlist", { method: "POST", body: JSON.stringify({ productId: id }) });
}

export async function removeFromWishlist(id: string): Promise<void> {
  await load(`wishlist/${encodeURIComponent(id)}`, { method: "DELETE" });
}