import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Admin.css";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price_pkr: "",
  price_bdt: "",
  price_eur: "",
  sizes: "",
  colors: "",
  stock: 0,
  badge: "",
  new_arrival: false,
  active: true,
  image_url: "",
  image_urls: [],
};

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    if (!supabase) {
      setError(
        "Supabase configuration missing. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error(loadError);
      setError(loadError.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setProduct(emptyProduct);
    setEditingId(null);
    setImages([]);
    setExistingImages([]);
    setMessage("");
    setError("");
  }

  function editProduct(item) {
    const urls = Array.isArray(item.image_urls)
      ? item.image_urls
      : item.image_url
      ? [item.image_url]
      : [];

    setProduct({
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      price_pkr: item.price_pkr ?? "",
      price_bdt: item.price_bdt ?? "",
      price_eur: item.price_eur ?? "",
      sizes: item.sizes || "",
      colors: item.colors || "",
      stock: item.stock ?? 0,
      badge: item.badge || "",
      new_arrival: !!item.new_arrival,
      active: item.active !== false,
      image_url: item.image_url || "",
      image_urls: urls,
    });

    setExistingImages(urls);
    setImages([]);
    setEditingId(item.id);
    setActiveTab("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageSelect(event) {
    const selected = Array.from(event.target.files || []);

    setImages((prev) => [...prev, ...selected]);

    event.target.value = "";
  }

  function removeNewImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages() {
    if (!supabase || images.length === 0) {
      return [];
    }

    const uploadedUrls = [];

    for (const file of images) {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const path = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase configuration missing.");
      return;
    }

    if (!product.name.trim()) {
      setError("Product name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const newUploadedImages = await uploadImages();

      const finalImages = [
        ...existingImages,
        ...newUploadedImages,
      ].filter(Boolean);

      const payload = {
        name: product.name.trim(),
        category: product.category.trim(),
        description: product.description.trim(),

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
        image_urls: finalImages,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("products")
          .insert([payload]);
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        editingId
          ? "✓ Product updated successfully"
          : "✓ Product added successfully"
      );

      await loadProducts();

      if (!editingId) {
        resetForm();
      } else {
        setProduct((prev) => ({
          ...prev,
          image_url: finalImages[0] || "",
          image_urls: finalImages,
        }));

        setExistingImages(finalImages);
        setImages([]);
      }
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError?.message ||
          "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    if (!supabase) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("✓ Product deleted successfully");

    if (editingId === id) {
      resetForm();
    }

    await loadProducts();
  }

  async function toggleProduct(id, currentStatus) {
    if (!supabase) return;

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("products")
      .update({
        active: !currentStatus,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      !currentStatus
        ? "✓ Product is now visible"
        : "✓ Product is now hidden"
    );

    await loadProducts();
  }

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((item) =>
        [
          item.name,
          item.category,
          item.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (filter === "active") {
      result = result.filter((item) => item.active);
    }

    if (filter === "hidden") {
      result = result.filter((item) => !item.active);
    }

    if (filter === "new") {
      result = result.filter((item) => item.new_arrival);
    }

    return result;
  }, [products, search, filter]);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    hidden: products.filter((p) => !p.active).length,
    newArrivals: products.filter((p) => p.new_arrival).length,
    lowStock: products.filter(
      (p) => Number(p.stock || 0) <= 5
    ).length,
  };

  return (
    <div className="pro-admin">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          RZIA’S AURA
        </div>

        <div className="admin-subtitle">
          Luxury Fashion Management
        </div>

        <nav className="admin-nav">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>
              {activeTab === "dashboard"
                ? "Dashboard"
                : "Product Management"}
            </h1>

            <p>
              RZIA’S AURA · Luxury Fashion Management
            </p>
          </div>

          <button
            className="admin-primary"
            onClick={() => {
              resetForm();
              setActiveTab("products");
            }}
          >
            + Add Product
          </button>
        </header>

        {message && (
          <div className="admin-success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {activeTab === "dashboard" && (
          <section className="admin-section">
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <span>Total Products</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="dashboard-card">
                <span>Active Products</span>
                <strong>{stats.active}</strong>
              </div>

              <div className="dashboard-card">
                <span>Hidden Products</span>
                <strong>{stats.hidden}</strong>
              </div>

              <div className="dashboard-card">
                <span>New Arrivals</span>
                <strong>{stats.newArrivals}</strong>
              </div>

              <div className="dashboard-card">
                <span>Low Stock</span>
                <strong>{stats.lowStock}</strong>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Recent Products</h2>
                  <p>
                    Manage your latest RZIA’S AURA products.
                  </p>
                </div>
              </div>

              <ProductTable
                products={products.slice(0, 8)}
                onEdit={editProduct}
                onDelete={deleteProduct}
                onToggle={toggleProduct}
              />
            </div>
          </section>
        )}

        {activeTab === "products" && (
          <section className="admin-section">
            <div className="admin-panel product-editor">
              <div className="admin-panel-header">
                <div>
                  <h2>
                    {editingId
                      ? "Edit Product"
                      : "Add New Product"}
                  </h2>

                  <p>
                    Add professional product information,
                    pricing and images.
                  </p>
                </div>

                {editingId && (
                  <button
                    className="admin-secondary"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={saveProduct}>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Product Name *</span>
                    <input
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="e.g. Ivory Luxe Co-Ord"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Category</span>
                    <input
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      placeholder="Women / Men / Unisex"
                    />
                  </label>

                  <label className="admin-field admin-full">
                    <span>Description</span>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Write the product description..."
                    />
                  </label>

                  <label className="admin-field">
                    <span>Price — PKR</span>
                    <input
                      type="number"
                      name="price_pkr"
                      value={product.price_pkr}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Price — BDT</span>
                    <input
                      type="number"
                      name="price_bdt"
                      value={product.price_bdt}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Price — EUR</span>
                    <input
                      type="number"
                      name="price_eur"
                      value={product.price_eur}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Stock</span>
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={product.stock}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="admin-field">
                    <span>Sizes</span>
                    <input
                      name="sizes"
                      value={product.sizes}
                      onChange={handleChange}
                      placeholder="XS, S, M, L, XL"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Colours</span>
                    <input
                      name="colors"
                      value={product.colors}
                      onChange={handleChange}
                      placeholder="Black, Ivory, Gold"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Badge</span>
                    <input
                      name="badge"
                      value={product.badge}
                      onChange={handleChange}
                      placeholder="New / Sale / Limited"
                    />
                  </label>
                </div>

                <div className="admin-toggle-row">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      name="new_arrival"
                      checked={product.new_arrival}
                      onChange={handleChange}
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="admin-check">
                    <input
                      type="checkbox"
                      name="active"
                      checked={product.active}
                      onChange={handleChange}
                    />
                    <span>Visible on Website</span>
                  </label>
                </div>

                <div className="image-upload-box">
                  <div className="image-upload-title">
                    <h3>Product Images</h3>
                    <p>
                      Upload multiple images. The first image
                      becomes the main product image.
                    </p>
                  </div>

                  <label className="upload-button">
                    + Choose Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                    />
                  </label>

                  {existingImages.length > 0 && (
                    <div className="image-preview-grid">
                      {existingImages.map((url, index) => (
                        <div
                          className="image-preview"
                          key={`${url}-${index}`}
                        >
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(index)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="image-preview-grid">
                      {images.map((file, index) => (
                        <div
                          className="image-preview"
                          key={`${file.name}-${index}`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNewImage(index)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-form-actions">
                  <button
                    type="submit"
                    className="admin-primary save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Save Product"}
                                      </button>

                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={resetForm}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>All Products</h2>
                  <p>
                    {products.length} products in your catalogue.
                  </p>
                </div>

                <div className="product-controls">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                  />

                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                    <option value="new">New Arrivals</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">
                  Loading products...
                </div>
              ) : (
                <ProductTable
                  products={filteredProducts}
                  onEdit={editProduct}
                  onDelete={deleteProduct}
                  onToggle={toggleProduct}
                />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (!products.length) {
    return (
      <div className="admin-empty">
        No products found.
      </div>
    );
  }

  return (
    <div className="admin-products">
      {products.map((item) => {
        const images = Array.isArray(item.image_urls)
          ? item.image_urls
          : item.image_url
          ? [item.image_url]
          : [];

        const image = images[0];

        return (
          <div
            className="admin-product-card"
            key={item.id}
          >
            <div className="admin-product-image">
              {image ? (
                <img
                  src={image}
                  alt={item.name || "Product"}
                />
              ) : (
                <div className="no-image">
                  No Image
                </div>
              )}
            </div>

            <div className="admin-product-info">
              <div className="product-title-row">
                <h3>{item.name}</h3>

                {!item.active && (
                  <span className="status-hidden">
                    Hidden
                  </span>
                )}
              </div>

              <p className="product-category">
                {item.category || "Uncategorised"}
              </p>

              <div className="product-price">
                PKR{" "}
                {Number(
                  item.price_pkr || 0
                ).toLocaleString()}
              </div>

              <div className="product-meta">
                <span>
                  Stock: {item.stock ?? 0}
                </span>

                {item.new_arrival && (
                  <span className="badge-new">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            <div className="admin-product-actions">
              <button
                className="admin-secondary"
                onClick={() => onEdit(item)}
              >
                Edit
              </button>

              <button
                className="admin-secondary"
                onClick={() =>
                  onToggle(
                    item.id,
                    item.active
                  )
                }
              >
                {item.active ? "Hide" : "Show"}
              </button>

              <button
                className="admin-danger"
                onClick={() =>
                  onDelete(item.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
              }
                
