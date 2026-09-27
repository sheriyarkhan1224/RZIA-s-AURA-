import { getStore } from "@netlify/blobs";

const store = getStore("rzias-aura-images");

export default async function handler(request) {
  try {
    if (request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file.arrayBuffer !== "function") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Image file required hai.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const extension =
        file.name?.split(".").pop()?.toLowerCase() || "jpg";

      const key = `products/${crypto.randomUUID()}.${extension}`;

      const buffer = await file.arrayBuffer();

      await store.set(key, buffer, {
        metadata: {
          contentType: file.type || "image/jpeg",
        },
      });

      const url =
        `/.netlify/functions/upload?key=` +
        encodeURIComponent(key);

      return new Response(
        JSON.stringify({
          success: true,
          url,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response("Image key required", {
          status: 400,
        });
      }

      const image = await store.get(key, {
        type: "arrayBuffer",
      });

      if (!image) {
        return new Response("Image not found", {
          status: 404,
        });
      }

      return new Response(image, {
        status: 200,
        headers: {
          "Content-Type": "image/*",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new Response("Method not allowed", {
      status: 405,
    });
  } catch (error) {
    console.error("Upload function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Upload failed",
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
