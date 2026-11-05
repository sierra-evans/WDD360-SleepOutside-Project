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
    userStore.user = userData.user;
    userStore.token = userData.token;
    userStore.isLoggedIn = true;
  } else {
    userStore.isLoggedIn = false;
    userStore.user = undefined;
    userStore.token = "";
  }
  return !!userData?.token;
}
