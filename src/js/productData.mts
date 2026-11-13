import type { Product } from "./types.mts";
const baseURL = import.meta.env.PUBLIC_SERVER_URL;

function convertToJson(res: Response) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Bad Response:  ${res.status} ${res.url}`);
  }
}

export function getProducts(category = "tents") {
  return fetch(`${baseURL}products?category=${category}`)
    .then(convertToJson)
    .then((data) => data);
}

export async function findProductById(id: string) {
  const response = await fetch(baseURL + `products/${id}`);
  const product = await convertToJson(response) as Product;
  console.log(product)
  return product;
}

export async function getRecommendedProducts(id: string): Promise<Product[]> {
  const response = await fetch(`${baseURL}products/recommended?id=${encodeURIComponent(id)}`);
  const data = await convertToJson(response);
  return data.results;
}
