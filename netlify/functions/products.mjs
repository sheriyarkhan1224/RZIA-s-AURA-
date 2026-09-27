import { getStore } from "@netlify/blobs";

const store = getStore("rzias-aura-data");

export default async function handler(request) {
  try {
    if (request.method === "GET") {
      const products = await store.get("products", {
        type: "json",
      });

      return new Response(
        JSON.stringify({
          success: true,
          products: Array.isArray(products) ? products : [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (request.method === "POST") {
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

      const existing = await store.get("products", {
        type: "json",
      });

      const products = Array.isArray(existing)
        ? existing
        : [];

      const product = {
        ...body,
        id: body.id || crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
      };

      const index = products.findIndex(
        (item) => item.id === product.id
      );

      if (index >= 0) {
        products[index] = product;
      } else {
        products.push(product);
      }

      await store.setJSON("products", products);

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

    if (request.method === "DELETE") {
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

      const existing = await store.get("products", {
        type: "json",
      });

      const products = Array.isArray(existing)
        ? existing
        : [];

      const filtered = products.filter(
        (item) => item.id !== id
      );

      await store.setJSON("products", filtered);

      return new Response(
        JSON.stringify({
          success: true,
          products: filtered,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
        message: error.message || "Server error",
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
