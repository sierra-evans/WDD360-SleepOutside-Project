import type { ProductComment } from "./types.mts";

const STORAGE_KEY = "so-comments";

function readAll(): ProductComment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

// Newest first. Async so it can be swapped for a real fetch() later.
export async function getComments(productId: string): Promise<ProductComment[]> {
  return readAll()
    .filter((c) => c.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addComment(
  productId: string,
  name: string,
  text: string,
): Promise<ProductComment> {
  const comment: ProductComment = {
    id: crypto.randomUUID(),
    productId,
    name: name.trim(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...readAll(), comment]));
  return comment;
}