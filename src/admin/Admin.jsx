import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Admin.css";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  "";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  "";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const MAIN_CATEGORIES = {
  Women: [
    "New Arrivals", "Dresses", "Suits", "Co-Ord Sets", "Tops",
    "Bottoms", "Abayas / Modest Wear", "Shawls & Dupattas", "Sale"
  ],
  Men: [
    "New Arrivals", "Kurta", "Shalwar Kameez", "Shirts", "T-Shirts",
    "Trousers", "Waistcoats", "Jackets", "Sale"
  ],
  Unisex: ["New Arrivals", "Clothing", "Accessories", "Sale"]
};

const EMPTY_PRODUCT = {
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
  image_urls: []
};

const EMPTY_COLLECTION = {
  name: "",
  description: "",
  image_url: "",
  featured: false,
  active: true
};

const EMPTY_HERO = {
  title: "",
  subtitle: "",
  button_text: "Shop Now",
  button_link: "/shop",
  image_url: "",
  mobile_image_url: "",
  active: true,
  sort_order: 0
};

const EMPTY_ANNOUNCEMENT = {
  text: "",
  active: true,
  sort_order: 0
};

const EMPTY_FAQ = {
  question: "",
  answer: "",
  active: true,
  sort_order: 0
};

const DEFAULT_SETTINGS = {
  logo_url: "",
  brand_image_url: "",
  story_title: "THE AURA OF ELEGANCE",
  story_text: "",
  footer_text: "RZIA’S AURA — Where elegance becomes an attitude.",
  whatsapp: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  shipping_text: "",
  return_text: "",
  privacy_text: "",
  terms_text: "",
  delivery_charge_pkr: "",
  free_delivery_threshold_pkr: ""
};

function csvToArray(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToCsv(value) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value || "");
}

function imageList(item) {
  if (Array.isArray(item?.image_urls) && item.image_urls.length) {
    return item.image_urls.filter(Boolean);
  }
  return item?.image_url ? [item.image_url] : [];
}

async function uploadFile(file, folder = "products") {
  if (!supabase || !file) return "";
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

function Status({ message, error }) {
  if (error) return <div className="admin-alert error">{error}</div>;
  if (message) return <div className="admin-alert success">{message}</div>;
  return null;
}

function SectionHeader({ title, text, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [collection, setCollection] = useState(EMPTY_COLLECTION);
  const [hero, setHero] = useState(EMPTY_HERO);
  const [announcement, setAnnouncement] = useState(EMPTY_ANNOUNCEMENT);
  const [faq, setFaq] = useState(EMPTY_FAQ);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingHero, setEditingHero] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  const [productImages, setProductImages] = useState([]);
  const [savedProductImages, setSavedProductImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    setLoading(true);
    setError("");
    try {
      if (!supabase) throw new Error("Supabase environment variables are missing.");

      const [
        productsRes,
        collectionsRes,
        heroesRes,
        announcementsRes,
        faqsRes
      ] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("collections").select("*").order("created_at", { ascending: false }),
        supabase.from("hero_slides").select("*").order("sort_order", { ascending: true }),
        supabase.from("announcements").select("*").order("sort_order", { ascending: true }),
        supabase.from("faqs").select("*").order("sort_order", { ascending: true })
      ]);

      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data || []);

      if (!collectionsRes.error) setCollections(collectionsRes.data || []);
      if (!heroesRes.error) setHeroes(heroesRes.data || []);
      if (!announcementsRes.error) setAnnouncements(announcementsRes.data || []);
      if (!faqsRes.error) setFaqs(faqsRes.data || []);

      const stored = localStorage.getItem("rzias_aura_settings");
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch (e) {
      console.error(e);
      setError(e.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  function notify(text) {
    setMessage(text);
    setError("");
    window.setTimeout(() => setMessage(""), 3500);
  }

  function fail(e) {
    console.error(e);
    setError(e?.message || "Unable to save. Please try again.");
    setMessage("");
  }

  function resetAllForms() {
    setProduct(EMPTY_PRODUCT);
    setCollection(EMPTY_COLLECTION);
    setHero(EMPTY_HERO);
    setAnnouncement(EMPTY_ANNOUNCEMENT);
    setFaq(EMPTY_FAQ);
    setEditingProduct(null);
    setEditingCollection(null);
    setEditingHero(null);
    setEditingAnnouncement(null);
    setEditingFaq(null);
    setProductImages([]);
    setSavedProductImages([]);
  }

  function updateProduct(name, value) {
    setProduct((p) => ({ ...p, [name]: value }));
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!supabase) return fail(new Error("Supabase is not configured."));
    if (!product.name.trim()) return fail(new Error("Product name is required."));

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const uploaded = [];
      for (const file of productImages) uploaded.push(await uploadFile(file, "products"));

      const finalImages = [...savedProductImages, ...uploaded].filter(Boolean);

      const payload = {
        name: product.name.trim(),
        description: product.description.trim(),
        category: product.category,
        price_pkr: Number(product.price_pkr) || 0,
        price_bdt: Number(product.price_bdt) || 0,
        price_eur: Number(product.price_eur) || 0,
        sizes: product.sizes,
        colors: product.colors,
        stock: Number(product.stock) || 0,
        badge: product.badge.trim(),
        new_arrival: !!product.new_arrival,
        active: !!product.active,
        image_url: finalImages[0] || "",
        image_urls: finalImages
      };

      /* These optional fields are sent only when the existing table supports them.
         If your current products table does not have them, the error will tell you
         exactly which database column needs to be added. */
      payload.gender = product.gender;
      payload.collection = product.collection;
      payload.featured = !!product.featured;
      payload.best_seller = !!product.best_seller;
      payload.sale = !!product.sale;

      const query = editingProduct
        ? supabase.from("products").update(payload).eq("id", editingProduct)
        : supabase.from("products").insert([payload]);

      const { error: saveError } = await query;
      if (saveError) throw saveError;

      await loadEverything();
      notify(editingProduct ? "✓ Product saved successfully" : "✓ Product added successfully");
      setProduct(EMPTY_PRODUCT);
      setEditingProduct(null);
      setProductImages([]);
      setSavedProductImages([]);
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  function editProduct(item) {
    setProduct({
      ...EMPTY_PRODUCT,
      ...item,
      gender: item.gender || "Women",
      category: item.category || "Dresses",
      collection: item.collection || "",
      sizes: arrayToCsv(item.sizes),
      colors: arrayToCsv(item.colors)
    });
    setSavedProductImages(imageList(item));
    setProductImages([]);
    setEditingProduct(item.id);
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const { error: e } = await supabase.from("products").delete().eq("id", id);
      if (e) throw e;
      if (editingProduct === id) resetAllForms();
      await loadEverything();
      notify("✓ Product deleted");
    } catch (e) {
      fail(e);
    }
  }

  async function toggleProduct(item) {
    try {
      const { error: e } = await supabase
        .from("products")
        .update({ active: !item.active })
        .eq("id", item.id);
      if (e) throw e;
      await loadEverything();
      notify(item.active ? "✓ Product hidden" : "✓ Product visible");
    } catch (e) {
      fail(e);
    }
  }

  async function saveCollection(e) {
    e.preventDefault();
    if (!supabase || !collection.name.trim()) return;

    setSaving(true);
    try {
      const payload = { ...collection };
      const q = editingCollection
        ? supabase.from("collections").update(payload).eq("id", editingCollection)
        : supabase.from("collections").insert([payload]);

      const { error: e2 } = await q;
      if (e2) throw e2;
      await loadEverything();
      setCollection(EMPTY_COLLECTION);
      setEditingCollection(null);
      notify("✓ Collection saved");
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCollection(id) {
    if (!window.confirm("Delete this collection?")) return;
    try {
      const { error: e } = await supabase.from("collections").delete().eq("id", id);
      if (e) throw e;
      await loadEverything();
      notify("✓ Collection deleted");
    } catch (e) {
      fail(e);
    }
  }

  async function saveHero(e) {
    e.preventDefault();
    if (!supabase || !hero.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...hero };
      const q = editingHero
        ? supabase.from("hero_slides").update(payload).eq("id", editingHero)
        : supabase.from("hero_slides").insert([payload]);
      const { error: e2 } = await q;
      if (e2) throw e2;
      await loadEverything();
      setHero(EMPTY_HERO);
      setEditingHero(null);
      notify("✓ Hero slide saved");
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteHero(id) {
    if (!window.confirm("Delete this hero slide?")) return;
    try {
      const { error: e } = await supabase.from("hero_slides").delete().eq("id", id);
      if (e) throw e;
      await loadEverything();
      notify("✓ Hero slide deleted");
    } catch (e) {
      fail(e);
    }
  }

  async function saveAnnouncement(e) {
    e.preventDefault();
    if (!supabase || !announcement.text.trim()) return;
    setSaving(true);
    try {
      const q = editingAnnouncement
        ? supabase.from("announcements").update(announcement).eq("id", editingAnnouncement)
        : supabase.from("announcements").insert([announcement]);
      const { error: e2 } = await q;
      if (e2) throw e2;
      await loadEverything();
      setAnnouncement(EMPTY_ANNOUNCEMENT);
      setEditingAnnouncement(null);
      notify("✓ Announcement saved");
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const { error: e } = await supabase.from("announcements").delete().eq("id", id);
      if (e) throw e;
      await loadEverything();
      notify("✓ Announcement deleted");
    } catch (e) {
      fail(e);
    }
  }

  async function saveFaq(e) {
    e.preventDefault();
    if (!supabase || !faq.question.trim()) return;
    setSaving(true);
    try {
      const q = editingFaq
        ? supabase.from("faqs").update(faq).eq("id", editingFaq)
        : supabase.from("faqs").insert([faq]);
      const { error: e2 } = await q;
      if (e2) throw e2;
      await loadEverything();
      setFaq(EMPTY_FAQ);
      setEditingFaq(null);
      notify("✓ FAQ saved");
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id) {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      const { error: e } = await supabase.from("faqs").delete().eq("id", id);
      if (e) throw e;
      await loadEverything();
      notify("✓ FAQ deleted");
    } catch (e) {
      fail(e);
    }
  }

  function updateSetting(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function saveSettings(e) {
    e.preventDefault();
    try {
      localStorage.setItem("rzias_aura_settings", JSON.stringify(settings));
      notify("✓ Website settings saved");
    } catch (e) {
      fail(e);
    }
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        [p.name, p.category, p.description, p.collection]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && p.active) ||
        (filter === "hidden" && !p.active) ||
        (filter === "new" && p.new_arrival) ||
        (filter === "featured" && p.featured) ||
        (filter === "best" && p.best_seller);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    hidden: products.filter((p) => !p.active).length,
    newArrivals: products.filter((p) => p.new_arrival).length,
    featured: products.filter((p) => p.featured).length,
    best: products.filter((p) => p.best_seller).length,
    low: products.filter((p) => Number(p.stock || 0) <= 5).length
  };

  const nav = [
    ["dashboard", "Dashboard"],
    ["products", "Products"],
    ["categories", "Categories"],
    ["collections", "Collections"],
    ["hero", "Hero / Banner"],
    ["announcement", "Announcement"],
    ["faq", "FAQ"],
    ["settings", "Website Settings"]
  ];

  return (
    <div className="rz-admin">
      <button
        className="mobile-admin-toggle"
        onClick={() => setMobileMenu((v) => !v)}
        aria-label="Open admin menu"
      >
        ☰
      </button>

      <aside className={`admin-sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="admin-logo">RZIA’S AURA</div>
        <div className="admin-kicker">LUXURY FASHION MANAGEMENT</div>

        <div className="admin-nav">
          {nav.map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setMobileMenu(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-side-note">
          Royal • Elegant • Editorial
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-eyebrow">RZIA’S AURA</div>
            <h1>{nav.find((x) => x[0] === tab)?.[1] || "Dashboard"}</h1>
          </div>

          <div className="top-actions">
            {tab === "products" && (
              <button
                className="gold-btn"
                onClick={() => {
                  setProduct(EMPTY_PRODUCT);
                  setEditingProduct(null);
                  setSavedProductImages([]);
                  setProductImages([]);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                + Add Product
              </button>
            )}
          </div>
        </header>

        <Status message={message} error={error} />

        {loading ? (
          <div className="admin-loading">Loading RZIA’S AURA...</div>
        ) : (
          <>
            {tab === "dashboard" && (
              <section>
                <SectionHeader
                  title="At a glance"
                  text="Manage the store from one luxury workspace."
                />

                <div className="stat-grid">
                  <Stat label="Total Products" value={stats.total} />
                  <Stat label="Active Products" value={stats.active} />
                  <Stat label="Hidden Products" value={stats.hidden} />
                  <Stat label="New Arrivals" value={stats.newArrivals} />
                  <Stat label="Featured" value={stats.featured} />
                  <Stat label="Best Sellers" value={stats.best} />
                  <Stat label="Low Stock" value={stats.low} />
                  <Stat label="Collections" value={collections.length} />
                </div>

                <div className="admin-card">
                  <SectionHeader
                    title="Recent products"
                    text="Your latest catalogue items."
                    action={
                      <button className="text-btn" onClick={() => setTab("products")}>
                        View all →
                      </button>
                    }
                  />
                  <ProductList
                    products={products.slice(0, 6)}
                    onEdit={editProduct}
                    onDelete={deleteProduct}
                    onToggle={toggleProduct}
                  />
                </div>
              </section>
            )}

            {tab === "products" && (
              <section>
                <div className="admin-card">
                  <SectionHeader
                    title={editingProduct ? "Edit Product" : "Add Product"}
                    text="Multiple photos, currencies, stock, category and merchandising controls."
                    action={
                      editingProduct && (
                        <button className="text-btn" onClick={resetAllForms}>
                          Cancel edit
                        </button>
                      )
                    }
                  />

                  <form onSubmit={saveProduct}>
                    <div className="form-grid">
                      <Field label="Product Name *" className="wide">
                        <input
                          value={product.name}
                          onChange={(e) => updateProduct("name", e.target.value)}
                          placeholder="e.g. Ivory Luxe Co-Ord"
                          required
                        />
                      </Field>

                      <Field label="Gender">
                        <select
                          value={product.gender}
                          onChange={(e) => {
                            const gender = e.target.value;
                            updateProduct("gender", gender);
                            updateProduct("category", MAIN_CATEGORIES[gender]?.[0] || "");
                          }}
                        >
                          <option>Women</option>
                          <option>Men</option>
                          <option>Unisex</option>
                        </select>
                      </Field>

                      <Field label="Main Category">
                        <select
                          value={product.category}
                          onChange={(e) => updateProduct("category", e.target.value)}
                        >
                          {(MAIN_CATEGORIES[product.gender] || []).map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Collection">
                        <select
                          value={product.collection}
                          onChange={(e) => updateProduct("collection", e.target.value)}
                        >
                          <option value="">No Collection</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Description" className="wide">
                        <textarea
                          rows="5"
                          value={product.description}
                          onChange={(e) => updateProduct("description", e.target.value)}
                          placeholder="Describe fabric, silhouette, fit and details..."
                        />
                      </Field>

                      <Field label="PKR">
                        <input type="number" value={product.price_pkr} onChange={(e) => updateProduct("price_pkr", e.target.value)} />
                      </Field>
                      <Field label="BDT">
                        <input type="number" value={product.price_bdt} onChange={(e) => updateProduct("price_bdt", e.target.value)} />
                      </Field>
                      <Field label="EUR">
                        <input type="number" value={product.price_eur} onChange={(e) => updateProduct("price_eur", e.target.value)} />
                      </Field>
                      <Field label="Stock">
                        <input type="number" min="0" value={product.stock} onChange={(e) => updateProduct("stock", e.target.value)} />
                      </Field>
                      <Field label="Sizes">
                        <input value={product.sizes} onChange={(e) => updateProduct("sizes", e.target.value)} placeholder="XS, S, M, L, XL" />
                      </Field>
                      <Field label="Colours">
                        <input value={product.colors} onChange={(e) => updateProduct("colors", e.target.value)} placeholder="Black, Ivory, Gold" />
                      </Field>
                      <Field label="Badge">
                        <input value={product.badge} onChange={(e) => updateProduct("badge", e.target.value)} placeholder="New / Limited / Sale" />
                      </Field>
                    </div>

                    <div className="check-grid">
                      <Check label="New Arrival" checked={product.new_arrival} onChange={(v) => updateProduct("new_arrival", v)} />
                      <Check label="Featured" checked={product.featured} onChange={(v) => updateProduct("featured", v)} />
                      <Check label="Best Seller" checked={product.best_seller} onChange={(v) => updateProduct("best_seller", v)} />
                      <Check label="Sale" checked={product.sale} onChange={(v) => updateProduct("sale", v)} />
                      <Check label="Visible on website" checked={product.active} onChange={(v) => updateProduct("active", v)} />
                    </div>

                    <div className="upload-panel">
                      <div>
                        <h3>Product Gallery</h3>
                        <p>Upload as many photos as needed. Previews stay inside fixed professional boxes.</p>
                      </div>

                      <label className="upload-btn">
                        + Choose Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            setProductImages((old) => [...old, ...Array.from(e.target.files || [])]);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {(savedProductImages.length > 0 || productImages.length > 0) && (
                        <div className="gallery-grid">
                          {savedProductImages.map((url, i) => (
                            <div className="gallery-item" key={`${url}-${i}`}>
                              <img src={url} alt="" />
                              <button
                                type="button"
                                onClick={() => setSavedProductImages((old) => old.filter((_, n) => n !== i))}
                              >
                                ×
                              </button>
                              {i === 0 && <span>Main</span>}
                            </div>
                          ))}

                          {productImages.map((file, i) => (
                            <div className="gallery-item" key={`${file.name}-${i}`}>
                              <img src={URL.createObjectURL(file)} alt="" />
                              <button type="button" onClick={() => setProductImages((old) => old.filter((_, n) => n !== i))}>
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button className="gold-btn" disabled={saving}>
                        {saving ? "Saving..." : editingProduct ? "Save Changes" : "Save Product"}
                      </button>
                      <button type="button" className="outline-btn" onClick={resetAllForms}>
                        Clear
                      </button>
                    </div>
                  </form>
                </div>

                <div className="admin-card">
                  <SectionHeader
                    title="Product catalogue"
                    text={`${products.length} products`}
                    action={
                      <div className="toolbar">
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                          <option value="all">All</option>
                          <option value="active">Active</option>
                          <option value="hidden">Hidden</option>
                          <option value="new">New Arrivals</option>
                          <option value="featured">Featured</option>
                          <option value="best">Best Sellers</option>
                        </select>
                      </div>
                    }
                  />
                  <ProductList products={filteredProducts} onEdit={editProduct} onDelete={deleteProduct} onToggle={toggleProduct} />
                </div>
              </section>
            )}

            {tab === "categories" && (
              <section className="admin-card">
                <SectionHeader title="Categories" text="Your customer-facing category structure." />
                <div className="category-columns">
                  {Object.entries(MAIN_CATEGORIES).map(([gender, cats]) => (
                    <div className="category-box" key={gender}>
                      <div className="category-title">{gender}</div>
                      {cats.map((cat) => (
                        <div className="category-row" key={cat}>
                          <span>{cat}</span>
                          <small>{products.filter((p) => p.category === cat).length}</small>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="info-box">
                  Customer navigation: <strong>WOMEN | MEN | UNISEX | NEW ARRIVALS | COLLECTIONS | SALE</strong>.
                  The category structure is ready for the storefront to use without hard-coding products into pages.
                </div>
              </section>
            )}

            {tab === "collections" && (
              <section>
                <div className="admin-card">
                  <SectionHeader title={editingCollection ? "Edit Collection" : "Create Collection"} text="Editorial collections with image, description and visibility." />
                  <form onSubmit={saveCollection}>
                    <div className="form-grid">
                      <Field label="Collection Name">
                        <input value={collection.name} onChange={(e) => setCollection({ ...collection, name: e.target.value })} required />
                      </Field>
                      <Field label="Collection Image URL">
                        <input value={collection.image_url} onChange={(e) => setCollection({ ...collection, image_url: e.target.value })} placeholder="https://..." />
                      </Field>
                      <Field label="Description" className="wide">
                        <textarea rows="4" value={collection.description} onChange={(e) => setCollection({ ...collection, description: e.target.value })} />
                      </Field>
                    </div>
                    <div className="check-grid">
                      <Check label="Featured" checked={collection.featured} onChange={(v) => setCollection({ ...collection, featured: v })} />
                      <Check label="Visible" checked={collection.active} onChange={(v) => setCollection({ ...collection, active: v })} />
                    </div>
                    <button className="gold-btn" disabled={saving}>{saving ? "Saving..." : "Save Collection"}</button>
                  </form>
                </div>

                <div className="collection-grid">
                  {collections.map((c) => (
                    <div className="collection-card" key={c.id}>
                      <div className="collection-image">
                        {c.image_url ? <img src={c.image_url} alt="" /> : <span>No image</span>}
                      </div>
                      <div className="collection-content">
                        <h3>{c.name}</h3>
                        <p>{c.description}</p>
                        <div className="card-actions">
                          <button className="outline-btn" onClick={() => { setCollection({ ...EMPTY_COLLECTION, ...c }); setEditingCollection(c.id); }}>Edit</button>
                          <button className="danger-btn" onClick={() => deleteCollection(c.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "hero" && (
              <section>
                <div className="admin-card">
                  <SectionHeader title={editingHero ? "Edit Hero Slide" : "Hero / Banner Manager"} text="Desktop/mobile hero, heading, CTA and slide order." />
                  <form onSubmit={saveHero}>
                    <div className="form-grid">
                      <Field label="Heading">
                        <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} required />
                      </Field>
                      <Field label="Subheading">
                        <input value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
                      </Field>
                      <Field label="Button Text">
                        <input value={hero.button_text} onChange={(e) => setHero({ ...hero, button_text: e.target.value })} />
                      </Field>
                      <Field label="Button Link">
                        <input value={hero.button_link} onChange={(e) => setHero({ ...hero, button_link: e.target.value })} />
                      </Field>
                      <Field label="Desktop Image URL">
                        <input value={hero.image_url} onChange={(e) => setHero({ ...hero, image_url: e.target.value })} />
                      </Field>
                      <Field label="Mobile Image URL">
                        <input value={hero.mobile_image_url} onChange={(e) => setHero({ ...hero, mobile_image_url: e.target.value })} />
                      </Field>
                      <Field label="Order">
                        <input type="number" value={hero.sort_order} onChange={(e) => setHero({ ...hero, sort_order: Number(e.target.value) })} />
                      </Field>
                    </div>
                    <div className="check-grid">
                      <Check label="Visible" checked={hero.active} onChange={(v) => setHero({ ...hero, active: v })} />
                    </div>
                    <button className="gold-btn" disabled={saving}>{saving ? "Saving..." : "Save Hero Slide"}</button>
                  </form>
                </div>

                <div className="hero-list">
                  {heroes.map((h) => (
                    <div className="hero-row" key={h.id}>
                      <div className="hero-thumb">{h.image_url ? <img src={h.image_url} alt="" /> : null}</div>
                      <div>
                        <strong>{h.title}</strong>
                        <p>{h.subtitle}</p>
                      </div>
                      <div className="card-actions">
                        <button className="outline-btn" onClick={() => { setHero({ ...EMPTY_HERO, ...h }); setEditingHero(h.id); }}>Edit</button>
                        <button className="danger-btn" onClick={() => deleteHero(h.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "announcement" && (
              <section>
                <div className="admin-card">
                  <SectionHeader title="Announcement Bar" text="Shipping, launches, seasonal campaigns and offers." />
                  <form onSubmit={saveAnnouncement}>
                    <div className="form-grid">
                      <Field label="Announcement" className="wide">
                        <input value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} required />
                      </Field>
                      <Field label="Order">
                        <input type="number" value={announcement.sort_order} onChange={(e) => setAnnouncement({ ...announcement, sort_order: Number(e.target.value) })} />
                      </Field>
                    </div>
                    <Check label="Enabled" checked={announcement.active} onChange={(v) => setAnnouncement({ ...announcement, active: v })} />
                    <br />
                    <button className="gold-btn" disabled={saving}>{saving ? "Saving..." : "Save Announcement"}</button>
                  </form>
                </div>

                <div className="admin-card">
                  {announcements.map((a) => (
                    <div className="simple-row" key={a.id}>
                      <span>{a.text}</span>
                      <div className="card-actions">
                        <button className="outline-btn" onClick={() => { setAnnouncement({ ...EMPTY_ANNOUNCEMENT, ...a }); setEditingAnnouncement(a.id); }}>Edit</button>
                        <button className="danger-btn" onClick={() => deleteAnnouncement(a.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "faq" && (
              <section>
                <div className="admin-card">
                  <SectionHeader title="FAQ Manager" text="Add, edit, reorder and show/hide customer questions." />
                  <form onSubmit={saveFaq}>
                    <div className="form-grid">
                      <Field label="Question" className="wide">
                        <input value={faq.question} onChange={(e) => setFaq({ ...faq, question: e.target.value })} required />
                      </Field>
                      <Field label="Answer" className="wide">
                        <textarea rows="5" value={faq.answer} onChange={(e) => setFaq({ ...faq, answer: e.target.value })} />
                      </Field>
                      <Field label="Order">
                        <input type="number" value={faq.sort_order} onChange={(e) => setFaq({ ...faq, sort_order: Number(e.target.value) })} />
                      </Field>
                    </div>
                    <Check label="Visible" checked={faq.active} onChange={(v) => setFaq({ ...faq, active: v })} />
                    <br />
                    <button className="gold-btn" disabled={saving}>{saving ? "Saving..." : "Save FAQ"}</button>
                  </form>
                </div>

                <div className="faq-list">
                  {faqs.map((f) => (
                    <div className="faq-row" key={f.id}>
                      <div>
                        <strong>{f.question}</strong>
                        <p>{f.answer}</p>
                      </div>
                      <div className="card-actions">
                        <button className="outline-btn" onClick={() => { setFaq({ ...EMPTY_FAQ, ...f }); setEditingFaq(f.id); }}>Edit</button>
                        <button className="danger-btn" onClick={() => deleteFaq(f.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "settings" && (
              <section className="admin-card">
                <SectionHeader title="Website Content & Contact" text="Central editable information for the RZIA’S AURA storefront." />
                <form onSubmit={saveSettings}>
                  <div className="form-grid">
                    <Field label="Logo URL"><input value={settings.logo_url} onChange={(e) => updateSetting("logo_url", e.target.value)} /></Field>
                    <Field label="Brand / Profile Image URL"><input value={settings.brand_image_url} onChange={(e) => updateSetting("brand_image_url", e.target.value)} /></Field>
                    <Field label="Story Heading"><input value={settings.story_title} onChange={(e) => updateSetting("story_title", e.target.value)} /></Field>
                    <Field label="WhatsApp"><input value={settings.whatsapp} onChange={(e) => updateSetting("whatsapp", e.target.value)} /></Field>
                    <Field label="Email"><input value={settings.email} onChange={(e) => updateSetting("email", e.target.value)} /></Field>
                    <Field label="Address"><input value={settings.address} onChange={(e) => updateSetting("address", e.target.value)} /></Field>
                    <Field label="Instagram"><input value={settings.instagram} onChange={(e) => updateSetting("instagram", e.target.value)} /></Field>
                    <Field label="Facebook"><input value={settings.facebook} onChange={(e) => updateSetting("facebook", e.target.value)} /></Field>
                    <Field label="TikTok"><input value={settings.tiktok} onChange={(e) => updateSetting("tiktok", e.target.value)} /></Field>
                    <Field label="Delivery Charge — PKR"><input type="number" value={settings.delivery_charge_pkr} onChange={(e) => updateSetting("delivery_charge_pkr", e.target.value)} /></Field>
                    <Field label="Free Delivery Threshold — PKR"><input type="number" value={settings.free_delivery_threshold_pkr} onChange={(e) => updateSetting("free_delivery_threshold_pkr", e.target.value)} /></Field>
                    <Field label="Footer Text" className="wide"><textarea rows="3" value={settings.footer_text} onChange={(e) => updateSetting("footer_text", e.target.value)} /></Field>
                    <Field label="Our Story / Elegance" className="wide"><textarea rows="6" value={settings.story_text} onChange={(e) => updateSetting("story_text", e.target.value)} /></Field>
                    <Field label="Shipping Information" className="wide"><textarea rows="5" value={settings.shipping_text} onChange={(e) => updateSetting("shipping_text", e.target.value)} /></Field>
                    <Field label="Return & Exchange" className="wide"><textarea rows="5" value={settings.return_text} onChange={(e) => updateSetting("return_text", e.target.value)} /></Field>
                    <Field label="Privacy Policy" className="wide"><textarea rows="5" value={settings.privacy_text} onChange={(e) => updateSetting("privacy_text", e.target.value)} /></Field>
                    <Field label="Terms & Conditions" className="wide"><textarea rows="5" value={settings.terms_text} onChange={(e) => updateSetting("terms_text", e.target.value)} /></Field>
                  </div>

                  <button className="gold-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Website Settings"}
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="check-card">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function ProductList({ products, onEdit, onDelete, onToggle }) {
  if (!products.length) {
    return <div className="empty-state">No products found.</div>;
  }

  return (
    <div className="product-list">
      {products.map((p) => {
        const img = imageList(p)[0];
        return (
          <div className="product-row" key={p.id}>
            <div className="product-thumb">
              {img ? <img src={img} alt="" /> : <span>No image</span>}
            </div>

            <div className="product-row-info">
              <h3>{p.name}</h3>
              <p>{p.gender || ""} {p.category ? `• ${p.category}` : ""}</p>
              <div className="mini-tags">
                {p.new_arrival && <span>NEW</span>}
                {p.featured && <span>FEATURED</span>}
                {p.best_seller && <span>BEST SELLER</span>}
                {!p.active && <span>HIDDEN</span>}
              </div>
            </div>

            <div className="product-price">
              PKR {Number(p.price_pkr || 0).toLocaleString()}
            </div>

            <div className="product-stock">
              Stock: {p.stock ?? 0}
            </div>

            <div className="row-actions">
              <button className="outline-btn" onClick={() => onEdit(p)}>Edit</button>
              <button className="outline-btn" onClick={() => onToggle(p)}>
                {p.active ? "Hide" : "Show"}
              </button>
              <button className="danger-btn" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
