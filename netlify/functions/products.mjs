import { getStore } from "@netlify/blobs";

const STORE_NAME = "rzias-aura-data";

function getProductsStore() {
  return getStore({
    name: STORE_NAME,
  });
}

async function readProducts() {
  const store = getProductsStore();
  const products = await store.get("products", {
    type: "json",
  });

  return Array.isArray(products) ? products : [];
}

async function saveProducts(products) {
  const store = getProductsStore();

  await store.setJSON("products", products);

  return products;
}

export default async function handler(request) {
  try {
    const method = request.method.toUpperCase();

    // GET — website/admin ke products load karne ke liye
    if (method === "GET") {
      const products = await readProducts();

      return new Response(
        JSON.stringify({
          success: true,
          products,
        }),
        {
          status:
