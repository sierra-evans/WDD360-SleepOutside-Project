import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders"; // Not available with legacy API

// we can also create collections that load from markdown files in a directory...this is an example of how to do that.
// const posts = defineCollection({
//   loader: glob({ pattern: "**/*.md", base: "./src/content/blog" })
// });

// load our product info from the tents.json file
const products = defineCollection({
  loader: async () => {
    const base = import.meta.env.PUBLIC_SERVER_URL ?? process.env.PUBLIC_SERVER_URL;
    if (!base) throw new Error("PUBLIC_SERVER_URL is not set");

    const url = new URL("products?limit=200", base.endsWith("/") ? base : base + "/");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Products fetch failed: ${response.status} ${url}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.results)) {
      throw new Error(`No results array from ${url}: ${JSON.stringify(data).slice(0, 300)}`);
    }

    // Each entry needs an id. Use the existing field if it's named differently, e.g. _id.
    return data.results.map((p) => ({ ...p, id: String(p.id ?? p._id) }));
  },
});

export const collections = { products };