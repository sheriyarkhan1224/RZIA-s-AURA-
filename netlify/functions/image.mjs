import { getStore } from "@netlify/blobs";

const STORE_NAME =
  "rzias-aura-images";

export default async function handler(
  req,
  context
) {
  try {
    const key =
      context.params?.key;

    if (!key) {
      return new Response(
        "Image key is required.",
        {
          status: 400
        }
      );
    }

    const store =
      getStore(STORE_NAME);

    const result =
      await store.getWithMetadata(
        key,
        {
          type: "blob",
          consistency: "strong"
        }
      );

    if (!result) {
      return new Response(
        "Image not found.",
        {
          status: 404
        }
      );
    }

    const {
      data,
      metadata
    } = result;

    const contentType =
      metadata?.contentType ||
      "image/jpeg";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type":
          contentType,

        "Cache-Control":
          "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error(
      "IMAGE ERROR:",
      error
    );

    return new Response(
      "Unable to load image.",
      {
        status: 500
      }
    );
  }
}
