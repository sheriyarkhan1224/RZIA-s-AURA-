import { getStore } from "@netlify/blobs";

const STORE_NAME = "rzias-aura-data";
const DATA_KEY = "website-data";

const EMPTY_DATA = {
  products: [],
  collections: [],
  heroes: [],
  announcement: {
    text: "",
    active: true
  },
  faqs: [],
  settings: {
    brand_name: "RZIA’S AURA",
    tagline: "Elegance in Every Thread",
    logo_url: "",
    brand_image: "",
    hero_heading: "Elegance, Redefined.",
    hero_text:
      "Discover timeless fashion crafted for modern elegance.",
    hero_image: "",
    about_text: "",
    whatsapp: "",
    email: "",
    address: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    delivery_charges_pkr: 0,
    free_delivery_above_pkr: 0,
    shipping_information: "",
    return_policy: "",
    privacy_policy: "",
    footer_text: ""
  }
};

function mergeData(data = {}) {
  return {
    ...EMPTY_DATA,
    ...data,

    products: Array.isArray(data.products)
      ? data.products
      : [],

    collections: Array.isArray(data.collections)
      ? data.collections
      : [],

    heroes: Array.isArray(data.heroes)
      ? data.heroes
      : [],

    faqs: Array.isArray(data.faqs)
      ? data.faqs
      : [],

    announcement: {
      ...EMPTY_DATA.announcement,
      ...(data.announcement || {})
    },

    settings: {
      ...EMPTY_DATA.settings,
      ...(data.settings || {})
    }
  };
}

export default async function handler(req) {
  const store = getStore(STORE_NAME);

  try {
    if (req.method === "GET") {
      const saved = await store.get(DATA_KEY, {
        type: "json",
        consistency: "strong"
      });

      return Response.json(
        mergeData(saved || EMPTY_DATA),
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate"
          }
        }
      );
    }

    if (req.method === "PUT") {
      const body = await req.json();

      const nextData = mergeData(body);

      await store.setJSON(
        DATA_KEY,
        nextData
      );

      return Response.json({
        success: true,
        message:
          "RZIA’S AURA data saved successfully.",
        data: nextData
      });
    }

    return Response.json(
      {
        success: false,
        message: "Method not allowed."
      },
      {
        status: 405,
        headers: {
          Allow: "GET, PUT"
        }
      }
    );
  } catch (error) {
    console.error(
      "ADMIN DATA ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to process admin data."
      },
      {
        status: 500
      }
    );
  }
  
