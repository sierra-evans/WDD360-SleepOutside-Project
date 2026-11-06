import { getLocalStorage, setLocalStorage } from "./utils.mts";

const baseURL = import.meta.env.PUBLIC_SERVER_URL;

interface UserStore {
  isLoggedIn: boolean;
  user?: {
    name: string;
    email: string;
    _id: string;
  };
  token: string;
}

// Shared, reactive auth state. Any component that reads userStore will update automatically when it changes.
export const userStore = $state({ isLoggedIn: false, user: {}, token: "" }) as UserStore;

export async function login(email: string, password: string) {
  const res = await fetch(`${baseURL}users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    userStore.user = data.user;
    userStore.isLoggedIn = true;
    userStore.token = data.token;
    setLocalStorage("so-user", userStore);
    return data;
  } else {
    throw new Error(data.error?.message || data.message || "Login failed");
  }
}

// Thrown when the server rejects our token (missing/expired/invalid), so callers can tell
// "log in again" apart from ordinary errors like a wrong current password.
export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await fetch(`${baseURL}users/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userStore.token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  // the authorize middleware answers 401 (no token) or 403 (bad/expired token)
  if (res.status === 401 || res.status === 403) {
    logout();
    throw new SessionExpiredError();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || "Could not change password");
  }
  // Changing the password revokes the token we just used, so switch to the new one the server sent.
  if (data.token) {
    userStore.token = data.token;
    setLocalStorage("so-user", userStore);
  }
  return data;
}

export function logout() {
  userStore.user = undefined;
  userStore.token = "";
  userStore.isLoggedIn = false;
  setLocalStorage("so-user", null);
}

export function checkAuth() {
  // We are just initializing the store from local storage here. We aren't checking that the token is still valid;
  // that happens the next time we use it. If the server rejects it, we log out.
  const userData = getLocalStorage("so-user");
  if (userData?.token) {
    // Only keep the fields we use. Older versions of the server sent back the whole user record
    // (including the password hash), so this also cleans that out of anyone's existing local storage.
    const { _id, email, name } = userData.user || {};
    userStore.user = { _id, email, name };
    userStore.token = userData.token;
    userStore.isLoggedIn = true;
    setLocalStorage("so-user", userStore);
  } else {
    userStore.isLoggedIn = false;
    userStore.user = undefined;
    userStore.token = "";
  }
  return !!userData?.token;
}
