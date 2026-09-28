import { getStore } from "@netlify/blobs";

const store = getStore("rzias-aura-settings");

const defaultSettings = {
  announcement:
    "WELCOME TO RZIA’S AURA — ELEGANCE • ROYALTY • MODERN FASHION",

  hero_title: "Elegance Made Timeless",

  hero_text:
    "Discover refined fashion created for women who embrace elegance, confidence and individuality.",

  hero_image: "",

  story_text:
    "RZIA’S AURA is a modern fashion boutique inspired by elegance, femininity and timeless style.",

  email: "info@rziasaura.com",

  address: "Pakistan",

  instagram: "",
  facebook: "",
  tiktok: "",
  whatsapp: "",
};

export default async function handler(request) {
  try {
    if (request.method === "GET") {
      const saved = await store.get("settings", {
        type: "json",
      });

      return new Response(
        JSON.stringify({
          success: true,
          settings: {
            ...defaultSettings,
            ...(saved || {}),
          },
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

      const saved = await store.get("settings", {
        type: "json",
      });

      const settings = {
        ...defaultSettings,
        ...(saved || {}),
        ...(body || {}),
      };

      await store.setJSON("settings", settings);

      return new Response(
        JSON.stringify({
          success: true,
          settings,
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
    console.error("Settings function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message:
          error.message || "Settings error",
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
