import { getStore } from "@netlify/blobs";

const STORE_NAME = "rzias-aura-images";

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return Response.json(
        {
          success: false,
          message: "Method not allowed."
        },
        {
          status: 405,
          headers: {
            Allow: "POST"
          }
        }
      );
    }

    const contentType =
      req.headers.get("content-type") || "";

    let file;
    let filename = "image";
    let mimeType = "application/octet-stream";

    /*
      Preferred method:
      Admin sends multipart/form-data.
    */
    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const form = await req.formData();

      file = form.get("file");

      if (
        !file ||
        typeof file.arrayBuffer !==
          "function"
      ) {
        return Response.json(
          {
            success: false,
            message:
              "No image file received."
          },
          {
            status: 400
          }
        );
      }

      filename =
        file.name || filename;

      mimeType =
        file.type || mimeType;
    } else {
      return Response.json(
        {
          success: false,
          message:
            "Please upload an image file."
        },
        {
          status: 400
        }
      );
    }

    if (
      !mimeType.startsWith("image/")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Only image files are allowed."
        },
        {
          status: 400
        }
      );
    }

    /*
      Keep individual uploads reasonably small.
      Netlify's buffered function payload limit is
      6 MB, and binary payloads have Base64 overhead.
    */
    const MAX_SIZE =
      4 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return Response.json(
        {
          success: false,
          message:
            "Image is too large. Please use an image under 4 MB."
        },
        {
          status: 413
        }
      );
    }

    const extension =
      filename.includes(".")
        ? filename
            .split(".")
            .pop()
            .toLowerCase()
        : "jpg";

    const safeExtension =
      /^[a-z0-9]+$/.test(extension)
        ? extension
        : "jpg";

    const key =
      `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

    const store =
      getStore(STORE_NAME);

    await store.set(
      key,
      file,
      {
        metadata: {
          contentType: mimeType,
          originalName: filename
        }
      }
    );

    const imageUrl =
      `/api/image/${encodeURIComponent(
        key
      )}`;

    return Response.json({
      success: true,
      key,
      url: imageUrl,
      filename,
      contentType: mimeType
    });
  } catch (error) {
    console.error(
      "UPLOAD ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Image upload failed."
      },
      {
        status: 500
      }
    );
  }
}
