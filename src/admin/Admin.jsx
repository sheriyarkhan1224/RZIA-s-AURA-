import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Admin.css";

const API = {
  data: "/api/admin-data",
  upload: "/api/upload",
};

const MAIN_CATEGORIES = {
  Women: [
    "New Arrivals",
    "Dresses",
    "Suits",
    "Co-Ord Sets",
    "Tops",
    "Bottoms",
    "Abayas / Modest Wear",
    "Shawls & Dupattas",
    "Sale",
  ],
  Men: [
    "New Arrivals",
    "Kurta",
    "Shalwar Kameez",
    "Shirts",
    "T-Shirts",
    "Trousers",
    "Waistcoats",
    "Jackets",
    "Sale",
  ],
  Unisex: [
    "New Arrivals",
    "Clothing",
    "Accessories",
    "Sale",
  ],
};

const EMPTY_PRODUCT = {
  id: "",
  name: "",
  description: "",
  gender: "Women",
  category: "Dresses",
  collection: "",
  price_pkr: "",
  price_bdt: "",
  price_eur: "",
  sizes: "",
  colors: "",
  stock: 0,
  badge: "",
  new_arrival: false,
  featured: false,
  best_seller: false,
  sale: false,
  active: true,
  image_url: "",
  image_urls: [],
};

const EMPTY_COLLECTION = {
  id: "",
  name: "",
  description: "",
  image_url: "",
  active: true,
};

const EMPTY_HERO = {
  id: "",
  title: "",
  subtitle: "",
  button_text: "SHOP NOW",
  button_link: "/shop",
  image_url: "",
  active: true,
};

const EMPTY_ANNOUNCEMENT = {
  text: "",
  active: true,
};

const EMPTY_FAQ = {
  id: "",
  question: "",
  answer: "",
  active: true,
};

const DEFAULT_SETTINGS = {
  brand_name: "RZIA’S AURA",
  tagline: "Elegance in Every Thread",

  logo_url: "",
  brand_image_url: "",
  hero_image_url: "",

  announcement_text: "Discover the new era of elegance.",
  announcement_active: true,

  hero_heading: "ELEGANCE, REDEFINED",
  hero_text:
    "Discover refined fashion designed for those who believe true elegance never goes out of style.",
  hero_button_text: "SHOP COLLECTION",

  collection_heading: "SHOP BY COLLECTION",
  collection_text:
    "Explore our carefully curated collections created for timeless elegance.",

  story_heading: "OUR STORY",
  story_text:
    "RZIA’S AURA is a fashion house built around elegance, confidence and timeless style. Every piece is thoughtfully selected to bring sophistication into your everyday wardrobe.",

  footer_text:
    "RZIA’S AURA — Where elegance becomes a statement.",

  whatsapp: "",
  email: "",
  address: "",

  instagram: "",
  facebook: "",
  tiktok: "",

  shipping_text:
    "We deliver across Pakistan, Bangladesh and Europe. Delivery times may vary according to destination.",

  return_text:
    "Items may be eligible for return or exchange according to our return policy.",

  privacy_text:
    "Your personal information is handled securely and is never sold to third parties.",

  delivery_charges_pkr: 0,
  free_delivery_threshold_pkr: 0,
};

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

async function uploadImage(file) {
  if (!file) return "";

  const formData = new FormData();
  formData.append("file", file);

  const result = await request(API.upload, {
    method: "POST",
    body: formData,
  });

  return result.url || result.image_url || "";
}

function normaliseArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function numberValue(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : "";
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [announcements, setAnnouncements] = useState(
    EMPTY_ANNOUNCEMENT
  );
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingHero, setEditingHero] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  const productImageInput = useRef(null);
  const collectionImageInput = useRef(null);
  const heroImageInput = useRef(null);
  const logoInput = useRef(null);
  const brandImageInput = useRef(null);
  const siteHeroInput = useRef(null);

  async function loadEverything() {
    setLoading(true);
    setError("");

    try {
      const data = await request(API.data);

      setProducts(Array.isArray(data.products) ? data.products : []);
      setCollections(
        Array.isArray(data.collections) ? data.collections : []
      );
      setHeroes(Array.isArray(data.heroes) ? data.heroes : []);

      setAnnouncements(
        data.announcements || EMPTY_ANNOUNCEMENT
      );

      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data.settings || {}),
      });
    } catch (err) {
      setError(err.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEverything();
  }, []);

  async function saveAll(nextState = {}) {
    setSaving(true);
    setStatus("Saving...");
    setError("");

    try {
      const payload = {
        products:
          nextState.products !== undefined
            ? nextState.products
            : products,

        collections:
          nextState.collections !== undefined
            ? nextState.collections
            : collections,

        heroes:
          nextState.heroes !== undefined
            ? nextState.heroes
            : heroes,

        announcements:
          nextState.announcements !== undefined
            ? nextState.announcements
            : announcements,

        faqs:
          nextState.faqs !== undefined
            ? nextState.faqs
            : faqs,

        settings:
          nextState.settings !== undefined
            ? nextState.settings
            : settings,
      };

      const saved = await request(API.data, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (saved.products) setProducts(saved.products);
      if (saved.collections) setCollections(saved.collections);
      if (saved.heroes) setHeroes(saved.heroes);
      if (saved.announcements) {
        setAnnouncements(saved.announcements);
      }
      if (saved.faqs) setFaqs(saved.faqs);
      if (saved.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...saved.settings,
        });
      }

      setStatus("Saved ✓");

      setTimeout(() => {
        setStatus("");
      }, 2500);
    } catch (err) {
      setStatus("");
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProductImages(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length || !editingProduct) return;

    setStatus("Uploading product images...");
    setError("");

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const url = await uploadImage(file);

        if (url) {
          uploadedUrls.push(url);
        }
      }

      const currentUrls = normaliseArray(
        editingProduct.image_urls
      );

      const mergedUrls = [
        ...currentUrls,
        ...uploadedUrls,
      ];

      const updatedProduct = {
        ...editingProduct,
        image_urls: mergedUrls,
        image_url:
          editingProduct.image_url || mergedUrls[0] || "",
      };

      setEditingProduct(updatedProduct);
      setStatus("Images uploaded ✓");
    } catch (err) {
      setError(err.message || "Image upload failed.");
      setStatus("");
    }

    event.target.value = "";
  }

  async function handleSingleImageUpload(
    event,
    callback
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setStatus("Uploading image...");
    setError("");

    try {
      const url = await uploadImage(file);

      if (url) {
        callback(url);
        setStatus("Image uploaded ✓");
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
      setStatus("");
    }

    event.target.value = "";
  }

  function removeProductImage(index) {
    if (!editingProduct) return;

    const urls = normaliseArray(
      editingProduct.image_urls
    );

    const newUrls = urls.filter(
      (_, imageIndex) => imageIndex !== index
    );

    setEditingProduct({
      ...editingProduct,
      image_urls: newUrls,
      image_url:
        editingProduct.image_url === urls[index]
          ? newUrls[0] || ""
          : editingProduct.image_url,
    });
  }

  function startNewProduct() {
    setEditingProduct({
      ...EMPTY_PRODUCT,
      id: makeId("product"),
    });
  }

  function editProduct(product) {
    setEditingProduct({
      ...EMPTY_PRODUCT,
      ...product,
      image_urls: normaliseArray(product.image_urls),
    });

    setActiveTab("products");
  }

  async function saveProduct() {
    if (!editingProduct?.name?.trim()) {
      setError("Product name is required.");
      return;
    }

    const product = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      description: editingProduct.description || "",
      gender: editingProduct.gender || "Women",
      category: editingProduct.category || "Dresses",
      collection: editingProduct.collection || "",
      price_pkr: numberValue(editingProduct.price_pkr),
      price_bdt: numberValue(editingProduct.price_bdt),
      price_eur: numberValue(editingProduct.price_eur),
      sizes: normaliseArray(editingProduct.sizes),
      colors: normaliseArray(editingProduct.colors),
      stock: Number(editingProduct.stock) || 0,
      badge: editingProduct.badge || "",
      new_arrival: !!editingProduct.new_arrival,
      featured: !!editingProduct.featured,
      best_seller: !!editingProduct.best_seller,
      sale: !!editingProduct.sale,
      active: editingProduct.active !== false,
      image_urls: normaliseArray(
        editingProduct.image_urls
      ),
      image_url:
        editingProduct.image_url ||
        normaliseArray(editingProduct.image_urls)[0] ||
        "",
    };

    const exists = products.some(
      (item) => item.id === product.id
    );

    const nextProducts = exists
      ? products.map((item) =>
          item.id === product.id ? product : item
        )
      : [product, ...products];

    setProducts(nextProducts);
    setEditingProduct(null);

    await saveAll({
      products: nextProducts,
    });
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      "Delete this product permanently?"
    );

    if (!confirmed) return;

    const nextProducts = products.filter(
      (product) => product.id !== id
    );

    setProducts(nextProducts);

    await saveAll({
      products: nextProducts,
    });
  }

  async function toggleProduct(id) {
    const nextProducts = products.map((product) =>
      product.id === id
        ? {
            ...product,
            active: !product.active,
          }
        : product
    );

    setProducts(nextProducts);

    await saveAll({
      products: nextProducts,
    });
  }

  function startNewCollection() {
    setEditingCollection({
      ...EMPTY_COLLECTION,
      id: makeId("collection"),
    });
  }

  function editCollection(collection) {
    setEditingCollection({
      ...EMPTY_COLLECTION,
      ...collection,
    });

    setActiveTab("collections");
  }

  async function saveCollection() {
    if (!editingCollection?.name?.trim()) {
      setError("Collection name is required.");
      return;
    }

    const collection = {
      ...editingCollection,
      name: editingCollection.name.trim(),
      description: editingCollection.description || "",
      active: editingCollection.active !== false,
    };

    const exists = collections.some(
      (item) => item.id === collection.id
    );

    const nextCollections = exists
      ? collections.map((item) =>
          item.id === collection.id ? collection : item
        )
      : [collection, ...collections];

    setCollections(nextCollections);
    setEditingCollection(null);

    await saveAll({
      collections: nextCollections,
    });
  }

  async function deleteCollection(id) {
    const confirmed = window.confirm(
      "Delete this collection?"
    );

    if (!confirmed) return;

    const nextCollections = collections.filter(
      (collection) => collection.id !== id
    );

    setCollections(nextCollections);

    await saveAll({
      collections: nextCollections,
    });
  }

  function startNewHero() {
    setEditingHero({
      ...EMPTY_HERO,
      id: makeId("hero"),
    });
  }

  function editHero(hero) {
    setEditingHero({
      ...EMPTY_HERO,
      ...hero,
    });

    setActiveTab("hero");
  }

  async function saveHero() {
    if (!editingHero?.title?.trim()) {
      setError("Hero title is required.");
      return;
    }

    const hero = {
      ...editingHero,
      title: editingHero.title.trim(),
      subtitle: editingHero.subtitle || "",
      button_text:
        editingHero.button_text || "SHOP NOW",
      button_link:
        editingHero.button_link || "/shop",
      active: editingHero.active !== false,
    };

    const exists = heroes.some(
      (item) => item.id === hero.id
    );

    const nextHeroes = exists
      ? heroes.map((item) =>
          item.id === hero.id ? hero : item
        )
      : [hero, ...heroes];

    setHeroes(nextHeroes);
    setEditingHero(null);

    await saveAll({
      heroes: nextHeroes,
    });
  }

  async function deleteHero(id) {
    const confirmed = window.confirm(
      "Delete this hero/banner?"
    );

    if (!confirmed) return;

    const nextHeroes = heroes.filter(
      (hero) => hero.id !== id
    );

    setHeroes(nextHeroes);

    await saveAll({
      heroes: nextHeroes,
    });
  }

  function startNewFaq() {
    setEditingFaq({
      ...EMPTY_FAQ,
      id: makeId("faq"),
    });
  }

  function editFaq(faq) {
    setEditingFaq({
      ...EMPTY_FAQ,
      ...faq,
    });

    setActiveTab("faq");
  }

  async function saveFaq() {
    if (!editingFaq?.question?.trim()) {
      setError("FAQ question is required.");
      return;
    }

    const faq = {
      ...editingFaq,
      question: editingFaq.question.trim(),
      answer: editingFaq.answer || "",
      active: editingFaq.active !== false,
    };

    const exists = faqs.some(
      (item) => item.id === faq.id
    );

    const nextFaqs = exists
      ? faqs.map((item) =>
          item.id === faq.id ? faq : item
        )
      : [faq, ...faqs];

    setFaqs(nextFaqs);
    setEditingFaq(null);

    await saveAll({
      faqs: nextFaqs,
    });
  }

  async function deleteFaq(id) {
    const confirmed = window.confirm(
      "Delete this FAQ?"
    );

    if (!confirmed) return;

    const nextFaqs = faqs.filter(
      (faq) => faq.id !== id
    );

    setFaqs(nextFaqs);

    await saveAll({
      faqs: nextFaqs,
    });
  }

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        String(product.name || "")
          .toLowerCase()
          .includes(search) ||
        String(product.category || "")
          .toLowerCase()
          .includes(search) ||
        String(product.collection || "")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        productFilter === "all" ||
        (productFilter === "active" && product.active) ||
        (productFilter === "hidden" && !product.active) ||
        (productFilter === "new" && product.new_arrival) ||
        (productFilter === "featured" && product.featured) ||
        (productFilter === "sale" && product.sale) ||
        (productFilter === "soldout" &&
          Number(product.stock) <= 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, productSearch, productFilter]);

  const dashboardStats = {
    products: products.length,
    activeProducts: products.filter(
      (product) => product.active
    ).length,
    collections: collections.length,
    faqs: faqs.length,
    heroes: heroes.length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-card">
          <div className="admin-brand">
            RZIA’S AURA
          </div>

          <div className="admin-loading-text">
            Loading Luxury Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-admin">
      <aside className="admin-sidebar">
        <div className="admin-logo-area">
          <div className="admin-brand">
            RZIA’S AURA
          </div>

          <div className="admin-subtitle">
            Luxury Fashion Management
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={
              activeTab === "dashboard"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activeTab === "products"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("products")}
          >
            <span>◇</span>
            Products
          </button>

          <button
            className={
              activeTab === "collections"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("collections")}
          >
            <span>◈</span>
            Collections
          </button>

          <button
            className={
              activeTab === "hero"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("hero")}
          >
            <span>✦</span>
            Hero / Banners
          </button>

          <button
            className={
              activeTab === "announcement"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("announcement")}
          >
            <span>◌</span>
            Announcement
          </button>

          <button
            className={
              activeTab === "faq"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveTab("faq")}
          >
            <span>?</span>
            FAQ
          </button>

          <button
            className={
              activeTab === "settings"
                        ? "admin-nav-item active"
              : "admin-nav-item"
            }
            onClick={() => setActiveTab("settings")}
          >
            <span>⚙</span>
            Website Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-status-dot" />

          <div>
            <strong>Store Online</strong>
            <small>RZIA’S AURA</small>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>
              {activeTab === "dashboard" &&
                "Dashboard"}

              {activeTab === "products" &&
                "Product Management"}

              {activeTab === "collections" &&
                "Collections"}

              {activeTab === "hero" &&
                "Hero & Banners"}

              {activeTab === "announcement" &&
                "Announcement Bar"}

              {activeTab === "faq" &&
                "Frequently Asked Questions"}

              {activeTab === "settings" &&
                "Website Settings"}
            </h1>

            <p>
              Manage your RZIA’S AURA luxury fashion
              store.
            </p>
          </div>

          <div className="admin-top-actions">
            {saving && (
              <span className="save-status saving">
                Saving...
              </span>
            )}

            {!saving && status && (
              <span className="save-status saved">
                {status}
              </span>
            )}

            <button
              className="admin-refresh-btn"
              onClick={loadEverything}
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="admin-error">
            <strong>Error:</strong> {error}

            <button
              onClick={() => setError("")}
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === "dashboard" && (
          <Dashboard
            stats={dashboardStats}
            products={products}
            collections={collections}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "products" && (
          <ProductsSection
            products={filteredProducts}
            allProducts={products}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            productFilter={productFilter}
            setProductFilter={setProductFilter}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            startNewProduct={startNewProduct}
            editProduct={editProduct}
            saveProduct={saveProduct}
            deleteProduct={deleteProduct}
            toggleProduct={toggleProduct}
            productImageInput={productImageInput}
            handleProductImages={handleProductImages}
            removeProductImage={removeProductImage}
            collections={collections}
          />
        )}

        {activeTab === "collections" && (
          <CollectionsSection
            collections={collections}
            editingCollection={editingCollection}
            setEditingCollection={
              setEditingCollection
            }
            startNewCollection={
              startNewCollection
            }
            editCollection={editCollection}
            saveCollection={saveCollection}
            deleteCollection={deleteCollection}
            collectionImageInput={
              collectionImageInput
            }
            handleSingleImageUpload={
              handleSingleImageUpload
            }
          />
        )}

        {activeTab === "hero" && (
          <HeroSection
            heroes={heroes}
            editingHero={editingHero}
            setEditingHero={setEditingHero}
            startNewHero={startNewHero}
            editHero={editHero}
            saveHero={saveHero}
            deleteHero={deleteHero}
            heroImageInput={heroImageInput}
            handleSingleImageUpload={
              handleSingleImageUpload
            }
          />
        )}

        {activeTab === "announcement" && (
          <AnnouncementSection
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            saveAll={saveAll}
          />
        )}

        {activeTab === "faq" && (
          <FaqSection
            faqs={faqs}
            editingFaq={editingFaq}
            setEditingFaq={setEditingFaq}
            startNewFaq={startNewFaq}
            editFaq={editFaq}
            saveFaq={saveFaq}
            deleteFaq={deleteFaq}
          />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            settings={settings}
            setSettings={setSettings}
            saveAll={saveAll}
            logoInput={logoInput}
            brandImageInput={brandImageInput}
            siteHeroInput={siteHeroInput}
            handleSingleImageUpload={
              handleSingleImageUpload
            }
          />
        )}
      </main>
    </div>
  );
      }
function Dashboard({
  stats,
  products,
  collections,
  setActiveTab,
}) {
  const recentProducts = products.slice(0, 6);

  return (
    <section className="admin-content">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">RZIA’S AURA</span>
          <h2>Welcome to your Luxury Store</h2>
          <p>
            Manage products, collections, banners and
            all website content from one place.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setActiveTab("products")}
        >
          + Add Product
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={stats.products}
          icon="◇"
        />

        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon="✓"
        />

        <StatCard
          title="Collections"
          value={stats.collections}
          icon="◈"
        />

        <StatCard
          title="FAQs"
          value={stats.faqs}
          icon="?"
        />

        <StatCard
          title="Hero Banners"
          value={stats.heroes}
          icon="✦"
        />
      </div>

      <div className="dashboard-grid">
        <div className="admin-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">
                PRODUCT OVERVIEW
              </span>
              <h3>Recent Products</h3>
            </div>

            <button
              className="text-btn"
              onClick={() => setActiveTab("products")}
            >
              View All →
            </button>
          </div>

          {recentProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              text="Start adding your luxury fashion products."
              button="Add First Product"
              onClick={() =>
                setActiveTab("products")
              }
            />
          ) : (
            <div className="recent-products">
              {recentProducts.map((product) => {
                const image =
                  product.image_url ||
                  product.image_urls?.[0] ||
                  "";

                return (
                  <div
                    className="recent-product"
                    key={product.id}
                  >
                    <div className="recent-product-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                        />
                      ) : (
                        <span>RZIA</span>
                      )}
                    </div>

                    <div className="recent-product-info">
                      <strong>{product.name}</strong>
                      <small>
                        {product.category || "Fashion"}
                      </small>
                    </div>

                    <div className="recent-product-price">
                      {product.price_pkr
                        ? `PKR ${Number(
                            product.price_pkr
                          ).toLocaleString()}`
                        : "Price not set"}
                    </div>

                    <div
                      className={
                        product.active
                          ? "product-status active"
                          : "product-status hidden"
                      }
                    >
                      {product.active
                        ? "Active"
                        : "Hidden"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="admin-card quick-actions-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">
                QUICK ACTIONS
              </span>
              <h3>Store Management</h3>
            </div>
          </div>

          <div className="quick-actions">
            <button
              onClick={() => setActiveTab("products")}
            >
              <span>◇</span>
              <div>
                <strong>Manage Products</strong>
                <small>
                  Add, edit, hide or delete products
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setActiveTab("collections")
              }
            >
              <span>◈</span>
              <div>
                <strong>Collections</strong>
                <small>
                  Create and manage collections
                </small>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("hero")}
            >
              <span>✦</span>
              <div>
                <strong>Hero & Banners</strong>
                <small>
                  Update homepage visuals
                </small>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
            >
              <span>⚙</span>
              <div>
                <strong>Website Settings</strong>
                <small>
                  Edit contact, social and policies
                </small>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              STORE STRUCTURE
            </span>
            <h3>Categories</h3>
          </div>
        </div>

        <div className="category-overview">
          {Object.entries(MAIN_CATEGORIES).map(
            ([gender, categories]) => (
              <div
                className="category-group"
                key={gender}
              >
                <h4>{gender}</h4>

                <div className="category-pills">
                  {categories.map((category) => (
                    <span
                      className="category-pill"
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
  button,
  onClick,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◇</div>

      <h3>{title}</h3>
      <p>{text}</p>

      {button && onClick && (
        <button
          className="primary-btn"
          onClick={onClick}
        >
          {button}
        </button>
      )}
    </div>
  );
}

function ProductsSection({
  products,
  allProducts,
  productSearch,
  setProductSearch,
  productFilter,
  setProductFilter,
  editingProduct,
  setEditingProduct,
  startNewProduct,
  editProduct,
  saveProduct,
  deleteProduct,
  toggleProduct,
  productImageInput,
  handleProductImages,
  removeProductImage,
  collections,
}) {
  return (
    <section className="admin-content">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            PRODUCT MANAGEMENT
          </span>

          <h2>Products</h2>

          <p>
            Manage your complete fashion catalogue,
            images, pricing, stock and visibility.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={startNewProduct}
        >
          + Add Product
        </button>
      </div>

      {editingProduct ? (
        <ProductEditor
          product={editingProduct}
          setProduct={setEditingProduct}
          saveProduct={saveProduct}
          cancel={() =>
            setEditingProduct(null)
          }
          productImageInput={productImageInput}
          handleProductImages={
            handleProductImages
          }
          removeProductImage={
            removeProductImage
          }
          collections={collections}
        />
      ) : (
        <>
          <div className="admin-card product-toolbar">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(event) =>
                  setProductSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <select
              value={productFilter}
              onChange={(event) =>
                setProductFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Products
              </option>
              <option value="active">
                Active
              </option>
              <option value="hidden">
                Hidden
              </option>
              <option value="new">
                New Arrivals
              </option>
              <option value="featured">
                Featured
              </option>
              <option value="sale">
                Sale
              </option>
              <option value="soldout">
                Sold Out
              </option>
            </select>

            <div className="toolbar-count">
              Showing{" "}
              <strong>{products.length}</strong>{" "}
              of{" "}
              <strong>{allProducts.length}</strong>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="admin-card">
              <EmptyState
                title="No products found"
                text={
                  productSearch
                    ? "Try another search."
                    : "Add your first product to start your catalogue."
                }
                button={
                  productSearch
                    ? undefined
                    : "Add Product"
                }
                onClick={
                  productSearch
                    ? undefined
                    : startNewProduct
                }
              />
            </div>
          ) : (
            <div className="product-admin-grid">
              {products.map((product) => (
                <ProductAdminCard
                  key={product.id}
                  product={product}
                  editProduct={editProduct}
                  deleteProduct={deleteProduct}
                  toggleProduct={toggleProduct}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ProductAdminCard({
  product,
  editProduct,
  deleteProduct,
  toggleProduct,
}) {
  const image =
    product.image_url ||
    product.image_urls?.[0] ||
    "";

  const imageCount = Array.isArray(
    product.image_urls
  )
    ? product.image_urls.length
    : 0;

  return (
    <article className="product-admin-card">
      <div className="product-admin-image">
        {image ? (
          <img
            src={image}
            alt={product.name}
          />
        ) : (
          <div className="no-product-image">
            <span>RZIA’S AURA</span>
            <small>No Image</small>
          </div>
        )}

        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        {!product.active && (
          <span className="hidden-badge">
            HIDDEN
          </span>
        )}

        {imageCount > 1 && (
          <span className="image-count">
            {imageCount} Photos
          </span>
        )}
      </div>

      <div className="product-admin-body">
        <div className="product-admin-top">
          <div>
            <span className="product-gender">
              {product.gender}
            </span>

            <h3>
              {product.name ||
                "Untitled Product"}
            </h3>

            <p>
              {product.category || "No category"}
              {product.collection
                ? ` · ${product.collection}`
                : ""}
            </p>
          </div>
        </div>

        <div className="admin-price-row">
          <div>
            <small>PKR</small>
            <strong>
              {product.price_pkr
                ? Number(
                    product.price_pkr
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>

          <div>
            <small>BDT</small>
            <strong>
              {product.price_bdt
                ? Number(
                    product.price_bdt
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>

          <div>
            <small>EUR</small>
            <strong>
              {product.price_eur
                ? Number(
                    product.price_eur
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>
        </div>

        <div className="product-meta">
          <span>
            Stock:{" "}
            <strong>
              {Number(product.stock) || 0}
            </strong>
          </span>

          {product.new_arrival && (
            <span className="meta-tag">
              New
            </span>
          )}

          {product.featured && (
            <span className="meta-tag">
              Featured
            </span>
          )}

          {product.best_seller && (
            <span className="meta-tag">
              Bestseller
            </span>
          )}

          {product.sale && (
            <span className="meta-tag">
              Sale
            </span>
          )}
        </div>

        <div className="product-admin-actions">
          <button
            className="secondary-btn"
            onClick={() => editProduct(product)}
          >
            Edit
          </button>

          <button
            className={
              product.active
                ? "secondary-btn"
                : "success-btn"
            }
            onClick={() =>
              toggleProduct(product.id)
            }
          >
            {product.active
              ? "Hide"
              : "Show"}
          </button>

          <button
            className="danger-btn"
            onClick={() =>
              deleteProduct(product.id)
            }
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductEditor({
  product,
  setProduct,
  saveProduct,
  cancel,
  productImageInput,
  handleProductImages,
  removeProductImage,
  collections,
}) {
  const categories =
    MAIN_CATEGORIES[product.gender] ||
    MAIN_CATEGORIES.Women;

  const imageUrls = normaliseArray(
    product.image_urls
  );

  function update(field, value) {
    setProduct({
      ...product,
      [field]: value,
    });
  }

  return (
    <div className="admin-card editor-card">
      <div className="editor-header">
        <div>
          <span className="eyebrow">
            {product.name
              ? "EDIT PRODUCT"
              : "NEW PRODUCT"}
          </span>

          <h2>
            {product.name ||
              "Create New Product"}
          </h2>

          <p>
            Add complete product information,
            pricing, images and availability.
          </p>
        </div>

        <div className="editor-actions">
          <button
            className="secondary-btn"
            onClick={cancel}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            onClick={saveProduct}
          >
            Save Product
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>

              <div>
                <h3>Basic Information</h3>
                <p>
                  Product name and description
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field
                label="Product Name"
                required
                value={product.name}
                onChange={(value) =>
                  update("name", value)
                }
                placeholder="e.g. Royal Embroidered Suit"
              />

              <Select
                label="Gender"
                value={product.gender}
                onChange={(value) => {
                  const nextCategories =
                    MAIN_CATEGORIES[value] ||
                    MAIN_CATEGORIES.Women;

                  setProduct({
                    ...product,
                    gender: value,
                    category:
                      nextCategories[0],
                  });
                }}
                options={[
                  "Women",
                  "Men",
                  "Unisex",
                ]}
              />

              <Select
                label="Category"
                value={product.category}
                onChange={(value) =>
                  update("category", value)
                }
                options={categories}
              />

              <div className="field">
                <label>Collection</label>

                <select
                  value={
                    product.collection || ""
                  }
                  onChange={(event) =>
                    update(
                      "collection",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    No Collection
                  </option>

                  {collections.map(
                    (collection) => (
                      <option
                        key={collection.id}
                        value={collection.name}
                      >
                        {collection.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <Textarea
                label="Description"
                value={
                  product.description || ""
                }
                onChange={(value) =>
                  update(
                    "description",
                    value
                  )
                }
                placeholder="Write a detailed product description..."
                full
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>

              <div>
                <h3>Pricing</h3>
                <p>
                  Set prices in all supported
                  currencies
                </p>
              </div>
            </div>

            <div className="form-grid three">
              <Field
                label="Price — PKR"
                type="number"
                value={
                  product.price_pkr
                }
                onChange={(value) =>
                  update(
                    "price_pkr",
                    value
                  )
                }
                placeholder="25000"
              />
                            <Field
                label="Price — BDT"
                type="number"
                value={product.price_bdt}
                onChange={(value) =>
                  update("price_bdt", value)
                }
                placeholder="90000"
              />

              <Field
                label="Price — EUR"
                type="number"
                value={product.price_eur}
                onChange={(value) =>
                  update("price_eur", value)
                }
                placeholder="250"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>03</span>

              <div>
                <h3>Variants & Stock</h3>
                <p>
                  Sizes, colours and available
                  quantity
                </p>
              </div>
            </div>

            <div className="form-grid three">
              <Field
                label="Sizes"
                value={
                  Array.isArray(product.sizes)
                    ? product.sizes.join(", ")
                    : product.sizes || ""
                }
                onChange={(value) =>
                  update("sizes", value)
                }
                placeholder="S, M, L, XL"
              />

              <Field
                label="Colours"
                value={
                  Array.isArray(product.colors)
                    ? product.colors.join(", ")
                    : product.colors || ""
                }
                onChange={(value) =>
                  update("colors", value)
                }
                placeholder="Black, Gold, Ivory"
              />

              <Field
                label="Stock"
                type="number"
                value={product.stock ?? 0}
                onChange={(value) =>
                  update("stock", value)
                }
                placeholder="0"
              />
            </div>
          </div>
                    <div className="form-section">
            <div className="form-section-title">
              <span>04</span>

              <div>
                <h3>Product Status</h3>
                <p>
                  Control product labels and
                  visibility
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field
                label="Badge"
                value={product.badge || ""}
                onChange={(value) =>
                  update("badge", value)
                }
                placeholder="New / Bestseller / Limited"
              />
            </div>

            <div className="checkbox-grid">
              <Checkbox
                label="Active / Visible"
                description="Show this product on the public website"
                checked={product.active !== false}
                onChange={(checked) =>
                  update("active", checked)
                }
              />

              <Checkbox
                label="New Arrival"
                description="Display in the New Arrivals section"
                checked={!!product.new_arrival}
                onChange={(checked) =>
                  update("new_arrival", checked)
                }
              />
              <Checkbox
                label="Featured"
                description="Display as a featured product"
                checked={!!product.featured}
                onChange={(checked) =>
                  update("featured", checked)
                }
              />

              <Checkbox
                label="Best Seller"
                description="Mark this product as a bestseller"
                checked={!!product.best_seller}
                onChange={(checked) =>
                  update("best_seller", checked)
                }
              />

              <Checkbox
                label="Sale"
                description="Show this product as a sale item"
                checked={!!product.sale}
                onChange={(checked) =>
                  update("sale", checked)
                }
              />
                          </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>05</span>

              <div>
                <h3>Product Description</h3>
                <p>
                  Add detailed information for
                  customers
                </p>
              </div>
            </div>

            <Field
              label="Description"
              multiline
              value={product.description || ""}
              onChange={(value) =>
                update("description", value)
              }
              placeholder="Write a detailed description of this product..."
            />
          </div>
                    <div className="form-section">
            <div className="form-section-title">
              <span>06</span>

              <div>
                <h3>Product Images</h3>
                <p>
                  Upload multiple photos for
                  this product
                </p>
              </div>
            </div>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  handleImageSelect(event)
                }
              />

              <div className="upload-box-content">
                <strong>
                  Upload Product Images
                </strong>

                <span>
                  JPG, PNG or WEBP — multiple
                  images supported
                </span>
              </div>
            </div>
                                  <div className="image-preview-grid">
              {(product.images || []).map(
                (image, index) => (
                  <div
                    className="image-preview-card"
                    key={`${image}-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name || "Product"} ${
                        index + 1
                      }`}
                    />

                    <div className="image-preview-footer">
                      <span>
                        Image {index + 1}
                      </span>

                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          const updatedImages =
                            [...(product.images || [])];

                          updatedImages.splice(index, 1);

                          update(
                            "images",
                            updatedImages
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="image-help">
              <span>
                Tip
              </span>

              <p>
                Upload clear front, back and
                detail photos. The first image
                will be used as the main product
                image.
              </p>
            </div>
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : product.id
                ? "Save Changes"
                : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function CollectionsSection({
  collections,
  onAdd,
  onEdit,
  onDelete,
  onUpload
}) {
  const [editing, setEditing] = useState(null);

  const createNew = () => {
    setEditing({
      id: "",
      name: "",
      description: "",
      image: "",
      active: true
    });
  };

  const saveCollection = async () => {
    if (!editing?.name?.trim()) {
      alert("Collection name is required.");
      return;
    }

    await onEdit({
      ...editing,
      name: editing.name.trim()
    });

    setEditing(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            COLLECTION MANAGEMENT
          </span>

          <h2>Collections</h2>

          <p>
            Create and manage your luxury
            fashion collections.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={createNew}
        >
          + Add Collection
        </button>
      </div>

      {editing && (
        <div className="editor-panel">
          <div className="editor-panel-header">
            <div>
              <span className="eyebrow">
                COLLECTION EDITOR
              </span>

              <h3>
                {editing.id
                  ? "Edit Collection"
                  : "New Collection"}
              </h3>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              ×
            </button>
          </div>

          <div className="form-grid two">
            <Field
              label="Collection Name"
              value={editing.name || ""}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  name: value
                })
              }
              placeholder="Royal Evening"
            />

            <Field
              label="Collection Description"
              value={
                editing.description || ""
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  description: value
                })
              }
              placeholder="A refined collection..."
            />
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>

              <div>
                <h3>Collection Image</h3>
                <p>
                  Upload the main visual for
                  this collection.
                </p>
              </div>
            </div>

            {editing.image && (
              <div className="single-image-preview">
                <img
                  src={editing.image}
                  alt={editing.name}
                />
              </div>
            )}

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file =
                    event.target.files?.[0];

                  if (!file) return;

                  try {
                    const image =
                      await onUpload(file);

                    setEditing({
                      ...editing,
                      image
                    });
                  } catch (error) {
                    alert(
                      error?.message ||
                        "Image upload failed."
                    );
                  }

                  event.target.value = "";
                }}
              />

              <div className="upload-box-content">
                <strong>
                  Upload Collection Image
                </strong>

                <span>
                  JPG, PNG or WEBP
                </span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <Checkbox
              label="Active / Visible"
              description="Show this collection on the public website."
              checked={
                editing.active !== false
              }
              onChange={(checked) =>
                setEditing({
                  ...editing,
                  active: checked
                })
              }
            />
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={saveCollection}
            >
              Save Collection
            </button>
          </div>
        </div>
      )}

      <div className="collection-admin-grid">
        {collections.length === 0 ? (
          <EmptyState
            title="No collections yet"
            description="Create your first fashion collection."
          />
        ) : (
          collections.map((collection) => (
            <div
              className="collection-admin-card"
              key={collection.id}
            >
              <div className="collection-admin-image">
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={
                      collection.name ||
                      "Collection"
                    }
                  />
                ) : (
                  <div className="image-placeholder">
                    No Image
                  </div>
                )}
              </div>

              <div className="collection-admin-body">
                <div className="card-status-row">
                  <span className="card-label">
                    COLLECTION
                  </span>

                  <span
                    className={
                      collection.active === false
                      id="c7n42"
                      ? "status-badge inactive"
                      : "status-badge active"
                    }
                  >
                    {collection.active === false
                      ? "Hidden"
                      : "Visible"}
                  </span>
                </div>

                <h3>
                  {collection.name ||
                    "Untitled Collection"}
                </h3>

                <p>
                  {collection.description ||
                    "No description added."}
                </p>

                <div className="card-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setEditing({
                        ...collection
                      })
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => {
                      const confirmed =
                        window.confirm(
                          `Delete "${
                            collection.name ||
                            "this collection"
                          }"?`
                        );

                      if (confirmed) {
                        onDelete(collection.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HeroSection({
  heroes,
  onSave,
  onDelete,
  onUpload
}) {
  const emptyHero = {
    id: "",
    title: "",
    subtitle: "",
    button_text: "Shop Now",
    button_link: "/shop",
    image: "",
    active: true,
    sort_order: 0
  };

  const [editing, setEditing] =
    useState(null);

  const createHero = () => {
    setEditing({
      ...emptyHero,
      id: makeId("hero")
    });
  };

  const updateHero = (key, value) => {
    setEditing((current) => ({
      ...current,
      [key]: value
    }));
  };

  const saveHero = async () => {
    if (!editing?.title?.trim()) {
      alert("Hero title is required.");
      return;
    }

    await onSave({
      ...editing,
      title: editing.title.trim()
    });

    setEditing(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            HOMEPAGE MANAGEMENT
          </span>

          <h2>
            Hero / Banner Manager
          </h2>

          <p>
            Manage the main visual banners
            displayed on your website.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={createHero}
        >
          + Add Hero
        </button>
      </div>

      {editing && (
        <div className="editor-panel">
          <div className="editor-panel-header">
            <div>
              <span className="eyebrow">
                HERO EDITOR
              </span>

              <h3>
                {editing.id
                  ? "Edit Hero Banner"
                  : "New Hero Banner"}
              </h3>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              ×
            </button>
          </div>

          <div className="form-grid two">
            <Field
              label="Hero Heading"
              value={editing.title || ""}
              onChange={(value) =>
                updateHero("title", value)
              }
              placeholder="Elegance That Speaks"
            />

            <Field
              label="Hero Subtitle"
              value={
                editing.subtitle || ""
              }
              onChange={(value) =>
                updateHero(
                  "subtitle",
                  value
                )
              }
              placeholder="Discover the new collection"
            />
          </div>

          <div className="form-grid three">
            <Field
              label="Button Text"
              value={
                editing.button_text || ""
              }
              onChange={(value) =>
                updateHero(
                  "button_text",
                  value
                )
              }
              placeholder="Shop Now"
            />

            <Field
              label="Button Link"
              value={
                editing.button_link || ""
              }
              onChange={(value) =>
                updateHero(
                  "button_link",
                  value
                )
              }
              placeholder="/shop"
            />

            <Field
              label="Display Order"
              type="number"
              value={
                editing.sort_order ?? 0
              }
              onChange={(value) =>
                updateHero(
                  "sort_order",
                  value
                )
              }
              placeholder="0"
            />
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>

              <div>
                <h3>Hero Image</h3>
                <p>
                  Use a high-quality
                  landscape fashion image.
                </p>
              </div>
            </div>

            {editing.image && (
              <div className="hero-preview">
                <img
                  src={editing.image}
                  alt={
                    editing.title ||
                    "Hero banner"
                  }
                />
              </div>
            )}

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file =
                    event.target.files?.[0];

                  if (!file) return;

                  try {
                    const image =
                      await onUpload(file);

                    updateHero(
                      "image",
                      image
                    );
                  } catch (error) {
                    alert(
                      error?.message ||
                        "Hero image upload failed."
                    );
                  }

                  event.target.value = "";
                }}
              />

              <div className="upload-box-content">
                <strong>
                  Upload Hero Image
                </strong>

                <span>
                  Recommended: wide,
                  high-resolution image
                </span>
              </div>
            </div>
          </div>

          <Checkbox
            label="Active / Visible"
            description="Display this banner on the public homepage."
            checked={
              editing.active !== false
            }
            onChange={(checked) =>
              updateHero(
                "active",
                checked
              )
            }
          />

          <div className="editor-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={saveHero}
            >
              Save Hero
            </button>
          </div>
        </div>
      )}

      <div className="hero-admin-list">
        {heroes.length === 0 ? (
          <EmptyState
            title="No hero banners"
            description="Add a banner to make your homepage look complete."
          />
        ) : (
          heroes
            .slice()
            .sort(
              (a, b) =>
                Number(
                  a.sort_order || 0
                ) -
                Number(
                  b.sort_order || 0
                )
            )
            .map((hero) => (
              <div
                className="hero-admin-card"
                key={hero.id}
              >
                <div className="hero-admin-image">
                  {hero.image ? (
                    <img
                      src={hero.image}
                      alt={
                        hero.title ||
                        "Hero banner"
                      }
                    />
                  ) : (
                    <div className="image-placeholder">
                      No Image
                    </div>
                  )}
                </div>

                <div className="hero-admin-content">
                  <div className="card-status-row">
                    <span className="card-label">
                      ORDER{" "}
                      {hero.sort_order ?? 0}
                    </span>

                    <span
                      className={
                        hero.active === false
                          ? "status-badge inactive"
                          : "status-badge active"
                      }
                    >
                      {hero.active === false
                        ? "Hidden"
                        : "Visible"}
                    </span>
                  </div>

                  <h3>
                    {hero.title ||
                      "Untitled Hero"}
                  </h3>

                  <p>
                    {hero.subtitle ||
                      "No subtitle added."}
                  </p>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        setEditing({
                          ...hero
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this hero banner?"
                          )
                        ) {
                          onDelete(hero.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
     function AnnouncementSection({
  announcement,
  onSave
}) {
  const [form, setForm] = useState({
    text: "",
    active: true
  });

  useEffect(() => {
    setForm({
      text: announcement?.text || "",
      active: announcement?.active !== false
    });
  }, [announcement]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const save = async () => {
    await onSave({
      ...form,
      text: form.text.trim()
    });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            WEBSITE HEADER
          </span>

          <h2>Announcement Bar</h2>

          <p>
            Manage the promotional message
            shown at the top of your website.
          </p>
        </div>
      </div>

      <div className="editor-panel">
        <div className="form-section">
          <div className="form-section-title">
            <span>01</span>

            <div>
              <h3>Announcement Message</h3>

              <p>
                Keep customers informed about
                offers, shipping or new launches.
              </p>
            </div>
          </div>

          <Field
            label="Announcement Text"
            value={form.text}
            onChange={(value) =>
              update("text", value)
            }
            placeholder="Complimentary delivery on orders above PKR 15,000"
          />
        </div>

        <div className="form-section">
          <Checkbox
            label="Show Announcement Bar"
            description="Display this message on the public website."
            checked={form.active}
            onChange={(checked) =>
              update("active", checked)
            }
          />
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={save}
          >
            Save Announcement
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQSection({
  faqs,
  onSave,
  onDelete
}) {
  const emptyFAQ = {
    id: "",
    question: "",
    answer: "",
    active: true,
    sort_order: 0
  };

  const [editing, setEditing] =
    useState(null);

  const createFAQ = () => {
    setEditing({
      ...emptyFAQ,
      id: makeId("faq")
    });
  };

  const updateFAQ = (key, value) => {
    setEditing((current) => ({
      ...current,
      [key]: value
    }));
  };

  const saveFAQ = async () => {
    if (!editing?.question?.trim()) {
      alert("FAQ question is required.");
      return;
    }

    if (!editing?.answer?.trim()) {
      alert("FAQ answer is required.");
      return;
    }

    await onSave({
      ...editing,
      question:
        editing.question.trim(),
      answer:
        editing.answer.trim()
    });

    setEditing(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            CUSTOMER SUPPORT
          </span>

          <h2>Frequently Asked Questions</h2>

          <p>
            Add, edit and remove customer
            questions from your website.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={createFAQ}
        >
          + Add FAQ
        </button>
      </div>

      {editing && (
        <div className="editor-panel">
          <div className="editor-panel-header">
            <div>
              <span className="eyebrow">
                FAQ EDITOR
              </span>

              <h3>
                {editing.id
                  ? "Edit FAQ"
                  : "New FAQ"}
              </h3>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              ×
            </button>
          </div>

          <div className="form-grid two">
            <Field
              label="Question"
              value={
                editing.question || ""
              }
              onChange={(value) =>
                updateFAQ(
                  "question",
                  value
                )
              }
              placeholder="How long does delivery take?"
            />

            <Field
              label="Display Order"
              type="number"
              value={
                editing.sort_order ?? 0
              }
              onChange={(value) =>
                updateFAQ(
                  "sort_order",
                  value
                )
              }
              placeholder="0"
            />
          </div>

          <div className="form-section">
            <Field
              label="Answer"
              multiline
              value={
                editing.answer || ""
              }
              onChange={(value) =>
                updateFAQ(
                  "answer",
                  value
                )
              }
              placeholder="Write the answer customers should see..."
            />
          </div>

          <div className="form-section">
            <Checkbox
              label="Active / Visible"
              description="Show this FAQ on the public website."
              checked={
                editing.active !== false
              }
              onChange={(checked) =>
                updateFAQ(
                  "active",
                  checked
                )
              }
            />
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setEditing(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={saveFAQ}
            >
              Save FAQ
            </button>
          </div>
        </div>
      )}

      <div className="faq-admin-list">
        {faqs.length === 0 ? (
          <EmptyState
            title="No FAQs yet"
            description="Add common customer questions to build trust."
          />
        ) : (
          faqs
            .slice()
            .sort(
              (a, b) =>
                Number(
                  a.sort_order || 0
                ) -
                Number(
                  b.sort_order || 0
                )
            )
            .map((faq) => (
              <div
                className="faq-admin-card"
                key={faq.id}
              >
                <div className="faq-admin-number">
                  {String(
                    faq.sort_order ?? 0
                  ).padStart(2, "0")}
                </div>

                <div className="faq-admin-content">
                  <div className="card-status-row">
                    <span className="card-label">
                      FAQ
                    </span>

                    <span
                      className={
                        faq.active === false
                          ? "status-badge inactive"
                          : "status-badge active"
                      }
                    >
                      {faq.active === false
                        ? "Hidden"
                        : "Visible"}
                    </span>
                  </div>

                  <h3>
                    {faq.question ||
                      "Untitled question"}
                  </h3>

                  <p>
                    {faq.answer ||
                      "No answer added."}
                  </p>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        setEditing({
                          ...faq
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this FAQ?"
                          )
                        ) {
                          onDelete(faq.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}                 
   function SettingsSection({
  settings,
  onSave,
  onUpload
}) {
  const [form, setForm] = useState(
    DEFAULT_SETTINGS
  );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setForm({
      ...DEFAULT_SETTINGS,
      ...(settings || {})
    });
  }, [settings]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);

    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const uploadSettingImage = async (
    event,
    key
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const image =
        await onUpload(file);

      update(key, image);
    } catch (error) {
      alert(
        error?.message ||
          "Image upload failed."
      );
    }

    event.target.value = "";
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            WEBSITE CONTROL
          </span>

          <h2>Website Settings</h2>

          <p>
            Manage your brand identity,
            contact details, social links,
            delivery and policies.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save All Settings"}
        </button>
      </div>

      <div className="settings-panel">
        <div className="form-section">
          <div className="form-section-title">
            <span>01</span>

            <div>
              <h3>Brand Identity</h3>

              <p>
                Control the logo and main
                brand imagery.
              </p>
            </div>
          </div>

          <div className="form-grid two">
            <Field
              label="Brand Name"
              value={
                form.brand_name || ""
              }
              onChange={(value) =>
                update(
                  "brand_name",
                  value
                )
              }
              placeholder="RZIA’S AURA"
            />

            <Field
              label="Tagline"
              value={
                form.tagline || ""
              }
              onChange={(value) =>
                update(
                  "tagline",
                  value
                )
              }
              placeholder="Elegance in Every Detail"
            />
          </div>

          <div className="form-grid two">
            <div className="setting-upload">
              <label>
                Logo
              </label>

              {form.logo_url && (
                <div className="setting-image-preview">
                  <img
                    src={form.logo_url}
                    alt="Brand logo"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  uploadSettingImage(
                    event,
                    "logo_url"
                  )
                }
              />
            </div>

            <div className="setting-upload">
              <label>
                Brand / Profile Image
              </label>

              {form.brand_image && (
                <div className="setting-image-preview">
                  <img
                    src={form.brand_image}
                    alt="Brand"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  uploadSettingImage(
                    event,
                    "brand_image"
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>02</span>

            <div>
              <h3>Hero Content</h3>

              <p>
                Set the main homepage
                heading and introduction.
              </p>
            </div>
          </div>

          <div className="form-grid two">
            <Field
              label="Hero Heading"
              value={
                form.hero_heading || ""
              }
              onChange={(value) =>
                update(
                  "hero_heading",
                  value
                )
              }
              placeholder="Elegance That Speaks"
            />

            <Field
              label="Hero Text"
              value={
                form.hero_text || ""
              }
              onChange={(value) =>
                update(
                  "hero_text",
                  value
                )
              }
              placeholder="Discover timeless fashion..."
            />
          </div>

          <div className="setting-upload">
            <label>
              Main Hero Image
            </label>

            {form.hero_image && (
              <div className="large-setting-preview">
                <img
                  src={form.hero_image}
                  alt="Hero"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                uploadSettingImage(
                  event,
                  "hero_image"
                )
              }
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>03</span>

            <div>
              <h3>Our Story</h3>

              <p>
                Tell customers about your
                brand and its elegance.
              </p>
            </div>
          </div>

          <Field
            label="Our Story / About Text"
            multiline
            value={
              form.about_text || ""
            }
            onChange={(value) =>
              update(
                "about_text",
                value
              )
            }
            placeholder="Write your brand story here..."
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>04</span>

            <div>
              <h3>Contact Information</h3>

              <p>
                These details can be shown
                throughout the website.
              </p>
            </div>
          </div>

          <div className="form-grid two">
            <Field
              label="WhatsApp Number"
              value={
                form.whatsapp || ""
              }
              onChange={(value) =>
                update(
                  "whatsapp",
                  value
                )
              }
              placeholder="+92 300 1234567"
            />

            <Field
              label="Email Address"
              value={
                form.email || ""
              }
              onChange={(value) =>
                update(
                  "email",
                  value
                )
              }
              placeholder="hello@rziasaura.com"
            />
          </div>

          <Field
            label="Shop Address"
            multiline
            value={
              form.address || ""
            }
            onChange={(value) =>
              update(
                "address",
                value
              )
            }
            placeholder="Enter your complete shop address..."
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>05</span>

            <div>
              <h3>Social Media</h3>

              <p>
                Add your official social
                media profile links.
              </p>
            </div>
          </div>

          <div className="form-grid three">
            <Field
              label="Instagram"
              value={
                form.instagram || ""
              }
              onChange={(value) =>
                update(
                  "instagram",
                  value
                )
              }
              placeholder="https://instagram.com/..."
            />

            <Field
              label="Facebook"
              value={
                form.facebook || ""
              }
              onChange={(value) =>
                update(
                  "facebook",
                  value
                )
              }
              placeholder="https://facebook.com/..."
            />

            <Field
              label="TikTok"
              value={
                form.tiktok || ""
              }
              onChange={(value) =>
                update(
                  "tiktok",
                  value
                )
              }
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>06</span>

            <div>
              <h3>Shipping</h3>

              <p>
                Configure delivery charges
                and free delivery threshold.
              </p>
            </div>
          </div>

          <div className="form-grid two">
            <Field
              label="Delivery Charges — PKR"
              type="number"
              value={
                form.delivery_charge_pkr ??
                0
              }
              onChange={(value) =>
                update(
                  "delivery_charge_pkr",
                  value
                )
              }
              placeholder="300"
            />

            <Field
              label="Free Delivery Above — PKR"
              type="number"
              value={
                form.free_delivery_threshold_pkr ??
                0
              }
              onChange={(value) =>
                update(
                  "free_delivery_threshold_pkr",
                  value
                )
              }
              placeholder="15000"
            />
          </div>

          <Field
            label="Shipping Information"
            multiline
            value={
              form.shipping_text || ""
            }
            onChange={(value) =>
              update(
                "shipping_text",
                value
              )
            }
            placeholder="Write your delivery and shipping information..."
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>07</span>

            <div>
              <h3>Return & Exchange Policy</h3>

              <p>
                Keep your return and exchange
                terms clear for customers.
              </p>
            </div>
          </div>

          <Field
            label="Return / Exchange Policy"
            multiline
            value={
              form.return_policy || ""
            }
            onChange={(value) =>
              update(
                "return_policy",
                value
              )
            }
            placeholder="Write your return and exchange policy..."
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>08</span>

            <div>
              <h3>Privacy Policy</h3>

              <p>
                Add the privacy information
                displayed on your website.
              </p>
            </div>
          </div>

          <Field
            label="Privacy Policy"
            multiline
            value={
              form.privacy_policy || ""
            }
            onChange={(value) =>
              update(
                "privacy_policy",
                value
              )
            }
            placeholder="Write your privacy policy..."
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>09</span>

            <div>
              <h3>Footer</h3>

              <p>
                Customize the footer message
                shown at the bottom of the site.
              </p>
            </div>
          </div>

          <Field
            label="Footer Text"
            multiline
            value={
              form.footer_text || ""
            }
            onChange={(value) =>
              update(
                "footer_text",
                value
              )
            }
            placeholder="RZIA’S AURA — Elegance in Every Detail."
          />
        </div>

        <div className="settings-save-bar">
          <div>
            <strong>
              Website Settings
            </strong>

            <span>
              Save your changes to publish
              the updated information.
            </span>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
            }    
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  multiline = false
}) {
  return (
    <div className="field">
      <label>
        {label}
      </label>

      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          rows={6}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function Checkbox({
  label,
  description,
  checked,
  onChange
}) {
  return (
    <label className="checkbox-card">
      <div className="checkbox-main">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
        />

        <div>
          <strong>
            {label}
          </strong>

          {description && (
            <span>
              {description}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}

function EmptyState({
  title,
  description
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        ✦
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  description
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">
        {label}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      {description && (
        <span className="stat-description">
          {description}
        </span>
      )}
    </div>
  );
}

function Dashboard({
  products,
  collections,
  heroes,
  faqs
}) {
  const visibleProducts =
    products.filter(
      (product) =>
        product.active !== false
    );

  const hiddenProducts =
    products.filter(
      (product) =>
        product.active === false
    );

  const newArrivals =
    products.filter(
      (product) =>
        product.new_arrival
    );

  const featured =
    products.filter(
      (product) =>
        product.featured
    );

  const bestSellers =
    products.filter(
      (product) =>
        product.best_seller
    );

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">
            RZIA’S AURA
          </span>

          <h2>
            Dashboard
          </h2>

          <p>
            Overview of your luxury fashion
            store.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={products.length}
          description="All products"
        />

        <StatCard
          label="Visible Products"
          value={visibleProducts.length}
          description="Currently live"
        />

        <StatCard
          label="Hidden Products"
          value={hiddenProducts.length}
          description="Not shown publicly"
        />

        <StatCard
          label="Collections"
          value={collections.length}
          description="Fashion collections"
        />

        <StatCard
          label="New Arrivals"
          value={newArrivals.length}
          description="Marked new"
        />

        <StatCard
          label="Featured"
          value={featured.length}
          description="Featured products"
        />

        <StatCard
          label="Best Sellers"
          value={bestSellers.length}
          description="Best seller products"
        />

        <StatCard
          label="FAQs"
          value={faqs.length}
          description="Customer questions"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="eyebrow">
                STORE STATUS
              </span>

              <h3>
                Website Overview
              </h3>
            </div>
          </div>

          <div className="dashboard-list">
            <div className="dashboard-row">
              <span>
                Products
              </span>

              <strong>
                {products.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                Collections
              </span>

              <strong>
                {collections.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                Hero Banners
              </span>

              <strong>
                {heroes.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                FAQs
              </span>

              <strong>
                {faqs.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="eyebrow">
                PRODUCT STATUS
              </span>

              <h3>
                Visibility
              </h3>
            </div>
          </div>

          <div className="dashboard-list">
            <div className="dashboard-row">
              <span>
                Live Products
              </span>

              <strong>
                {visibleProducts.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                Hidden Products
              </span>

              <strong>
                {hiddenProducts.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                New Arrivals
              </span>

              <strong>
                {newArrivals.length}
              </strong>
            </div>

            <div className="dashboard-row">
              <span>
                Featured
              </span>

              <strong>
                {featured.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <span className="eyebrow">
              QUICK ACCESS
            </span>

            <h3>
              Store Management
            </h3>
          </div>
        </div>

        <div className="quick-actions">
          <div className="quick-action">
            <strong>
              Products
            </strong>

            <span>
              Add, edit, hide or remove
              products.
            </span>
          </div>

          <div className="quick-action">
            <strong>
              Collections
            </strong>

            <span>
              Organize your fashion
              collections.
            </span>
          </div>

          <div className="quick-action">
            <strong>
              Hero Banners
            </strong>

            <span>
              Keep the homepage visually
              premium.
            </span>
          </div>

          <div className="quick-action">
            <strong>
              Website Settings
            </strong>

            <span>
              Manage contact, shipping,
              policies and branding.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
      }
     function Admin() {
  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [products, setProducts] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [heroes, setHeroes] =
    useState([]);

  const [announcement, setAnnouncement] =
    useState(EMPTY_ANNOUNCEMENT);

  const [faqs, setFaqs] =
    useState([]);

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    setLoading(true);
    setError("");

    try {
      const data =
        await request(API.data);

      setProducts(
        normaliseArray(data?.products)
      );

      setCollections(
        normaliseArray(data?.collections)
      );

      setHeroes(
        normaliseArray(data?.heroes)
      );

      setAnnouncement({
        ...EMPTY_ANNOUNCEMENT,
        ...(data?.announcement || {})
      });

      setFaqs(
        normaliseArray(data?.faqs)
      );

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data?.settings || {})
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load admin data."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async (payload) => {
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      await request(API.data, {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify(payload)
      });

      setSaveMessage(
        "Changes saved successfully."
      );

      return true;
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save changes."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file) => {
    return uploadImage(file);
  };

  const saveProduct = async (
    product
  ) => {
    const nextProducts =
      products.some(
        (item) =>
          item.id === product.id
      )
        ? products.map((item) =>
            item.id === product.id
              ? product
              : item
          )
        : [
            ...products,
            {
              ...product,
              id:
                product.id ||
                makeId("product")
            }
          ];

    setProducts(nextProducts);

    return saveAll({
      products: nextProducts,
      collections,
      heroes,
      announcement,
      faqs,
      settings
    });
  };

  const deleteProduct = async (
    productId
  ) => {
    const nextProducts =
      products.filter(
        (item) =>
          item.id !== productId
      );

    setProducts(nextProducts);

    return saveAll({
      products: nextProducts,
      collections,
      heroes,
      announcement,
      faqs,
      settings
    });
  };

  const toggleProduct = async (
    product
  ) => {
    const nextProduct = {
      ...product,
      active:
        product.active === false
    };

    return saveProduct(nextProduct);
  };

  const saveCollection = async (
    collection
  ) => {
    const nextCollections =
      collections.some(
        (item) =>
          item.id === collection.id
      )
        ? collections.map((item) =>
            item.id === collection.id
              ? collection
              : item
          )
        : [
            ...collections,
            {
              ...collection,
              id:
                collection.id ||
                makeId("collection")
            }
          ];

    setCollections(
      nextCollections
    );

    return saveAll({
      products,
      collections: nextCollections,
      heroes,
      announcement,
      faqs,
      settings
    });
  };

  const deleteCollection = async (
    collectionId
  ) => {
    const nextCollections =
      collections.filter(
        (item) =>
          item.id !== collectionId
      );

    setCollections(
      nextCollections
    );

    return saveAll({
      products,
      collections: nextCollections,
      heroes,
      announcement,
      faqs,
      settings
    });
  };

  const saveHero = async (
    hero
  ) => {
    const nextHeroes =
      heroes.some(
        (item) =>
          item.id === hero.id
      )
        ? heroes.map((item) =>
            item.id === hero.id
              ? hero
              : item
          )
        : [
            ...heroes,
            {
              ...hero,
              id:
                hero.id ||
                makeId("hero")
            }
          ];

    setHeroes(nextHeroes);

    return saveAll({
      products,
      collections,
      heroes: nextHeroes,
      announcement,
      faqs,
      settings
    });
  };

  const deleteHero = async (
    heroId
  ) => {
    const nextHeroes =
      heroes.filter(
        (item) =>
          item.id !== heroId
      );

    setHeroes(nextHeroes);

    return saveAll({
      products,
      collections,
      heroes: nextHeroes,
      announcement,
      faqs,
      settings
    });
  };

  const saveAnnouncement =
    async (nextAnnouncement) => {
      setAnnouncement(
        nextAnnouncement
      );

      return saveAll({
        products,
        collections,
        heroes,
        announcement:
          nextAnnouncement,
        faqs,
        settings
      });
    };

  const saveFAQ = async (
    faq
  ) => {
    const nextFaqs =
      faqs.some(
        (item) =>
          item.id === faq.id
      )
        ? faqs.map((item) =>
            item.id === faq.id
              ? faq
              : item
          )
        : [
            ...faqs,
            {
              ...faq,
              id:
                faq.id ||
                makeId("faq")
            }
          ];

    setFaqs(nextFaqs);

    return saveAll({
      products,
      collections,
      heroes,
      announcement,
      faqs: nextFaqs,
      settings
    });
  };

  const deleteFAQ = async (
    faqId
  ) => {
    const nextFaqs =
      faqs.filter(
        (item) =>
          item.id !== faqId
      );

    setFaqs(nextFaqs);

    return saveAll({
      products,
      collections,
      heroes,
      announcement,
      faqs: nextFaqs,
      settings
    });
  };

  const saveSettings =
    async (nextSettings) => {
      setSettings(nextSettings);

      return saveAll({
        products,
        collections,
        heroes,
        announcement,
        faqs,
        settings: nextSettings
      });
    };         
          const tabs = [
    {
      id: "dashboard",
      label: "Dashboard"
    },
    {
      id: "products",
      label: "Products"
    },
    {
      id: "collections",
      label: "Collections"
    },
    {
      id: "hero",
      label: "Hero / Banners"
    },
    {
      id: "announcement",
      label: "Announcement"
    },
    {
      id: "faq",
      label: "FAQ"
    },
    {
      id: "settings",
      label: "Website Settings"
    }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner" />

        <h2>
          RZIA’S AURA
        </h2>

        <p>
          Loading your luxury fashion
          dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="pro-admin">
      <header className="admin-topbar">
        <div className="admin-brand-wrap">
          <div className="admin-brand">
            RZIA’S AURA
          </div>

          <div className="admin-subtitle">
            Luxury Fashion Management
          </div>
        </div>

        <div className="admin-top-actions">
          <span className="admin-live-status">
            <span className="status-dot" />
            Store Connected
          </span>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadEverything}
            disabled={saving}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-heading">
            MANAGEMENT
          </div>

          <nav className="admin-nav">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "admin-nav-item active"
                    : "admin-nav-item"
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                <span>
                  {tab.label}
                </span>

                {tab.id ===
                  "products" && (
                  <small>
                    {products.length}
                  </small>
                )}

                {tab.id ===
                  "collections" && (
                  <small>
                    {collections.length}
                  </small>
                )}

                {tab.id === "faq" && (
                  <small>
                    {faqs.length}
                  </small>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-title">
              RZIA’S AURA
            </div>

            <p>
              Elegance in every detail.
            </p>
          </div>
        </aside>

        <main className="admin-main">
          {saveMessage && (
            <div className="admin-alert success">
              <span>✓</span>

              <div>
                <strong>
                  Saved
                </strong>

                <p>
                  {saveMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSaveMessage("")
                }
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="admin-alert error">
              <span>!</span>

              <div>
                <strong>
                  Something went wrong
                </strong>

                <p>
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {saving && (
            <div className="saving-indicator">
              Saving changes...
            </div>
          )}

          {activeTab ===
            "dashboard" && (
            <Dashboard
              products={products}
              collections={collections}
              heroes={heroes}
              faqs={faqs}
            />
          )}

          {activeTab ===
            "products" && (
            <ProductsSection
              products={products}
              collections={collections}
              onSave={saveProduct}
              onDelete={deleteProduct}
              onToggle={toggleProduct}
              onUpload={upload}
            />
          )}

          {activeTab ===
            "collections" && (
            <CollectionsSection
              collections={collections}
              onAdd={() => {}}
              onEdit={saveCollection}
              onDelete={
                deleteCollection
              }
              onUpload={upload}
            />
          )}

          {activeTab === "hero" && (
            <HeroSection
              heroes={heroes}
              onSave={saveHero}
              onDelete={deleteHero}
              onUpload={upload}
            />
          )}

          {activeTab ===
            "announcement" && (
            <AnnouncementSection
              announcement={
                announcement
              }
              onSave={
                saveAnnouncement
              }
            />
          )}

          {activeTab === "faq" && (
            <FAQSection
              faqs={faqs}
              onSave={saveFAQ}
              onDelete={deleteFAQ}
            />
          )}

          {activeTab ===
            "settings" && (
            <SettingsSection
              settings={settings}
              onSave={saveSettings}
              onUpload={upload}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
