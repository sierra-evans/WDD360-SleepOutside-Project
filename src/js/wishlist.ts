function getKey(): string {
  const userId = localStorage.getItem("so-user-id"); // swap in wherever your login stores the user
  return userId ? `so-wishlist-${userId}` : "so-wishlist-guest";
}

export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(getKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]): void {
  localStorage.setItem(getKey(), JSON.stringify(ids));
}

export function isWished(id: string): boolean {
  return getWishlistIds().includes(id);
}

export function addToWishlist(id: string): void {
  const ids = getWishlistIds();
  if (!ids.includes(id)) save([...ids, id]);
}

export function removeFromWishlist(id: string): void {
  save(getWishlistIds().filter((i) => i !== id));
}