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

    // GET PRODUCTS
    if (method === "GET") {
      const products = await readProducts();

      return new Response(
        JSON.stringify({
          success: true,
          products,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // SAVE / UPDATE PRODUCT
    if (method === "POST") {
      const body = await request.json();

      if (!body || !body.name) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Product name required hai.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const products = await readProducts();

      const product = {
        ...body,
        id: body.id || crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = products.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        products[existingIndex] = product;
      } else {
        products.push(product);
      }

      await saveProducts(products);

      return new Response(
        JSON.stringify({
          success: true,
          product,
          products,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // DELETE PRODUCT
    if (method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Product ID required hai.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const products = await readProducts();

      const filteredProducts = products.filter(
        (item) => item.id !== id
      );

      await saveProducts(filteredProducts);

      return new Response(
        JSON.stringify({
          success: true,
          products: filteredProducts,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // OTHER METHODS
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method not allowed.",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Products function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Server error.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
