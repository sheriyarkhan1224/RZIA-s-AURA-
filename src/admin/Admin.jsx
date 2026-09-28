import React, { useEffect, useRef, useState } from "react";

const emptyProduct = {
  id: "",
  name: "",
  category: "",
  description: "",
  pricePKR: "",
  priceBDT: "",
  priceEUR: "",
  sizes: "",
  colours: "",
  stock: "",
  badge: "",
  newArrival: false,
  featured: false,
  visible: true,
  images: [],
};

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [newImages, setNewImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [settings, setSettings] = useState({
  hero_image: "",
  hero_title: "Elegance Made Timeless",
  hero_text:
    "Discover refined fashion created for women who embrace elegance, confidence and individuality.",
});

const [heroFile, setHeroFile] = useState(null);
const [heroPreview, setHeroPreview] = useState("");
const [savingHero, setSavingHero] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch("/.netlify/functions/products");

      if (!response.ok) throw new Error("Products API unavailable");

      const data = await response.json();

      setProducts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (error) {
      console.error(error);
      setMessage("❌ Products load nahi ho rahe.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadProducts();
  loadSettings();
}, []);
async function loadSettings() {
  try {
    const response = await fetch(
      "/.netlify/functions/settings"
    );

    if (!response.ok) {
      throw new Error("Settings load failed");
    }

    const data = await response.json();

    if (data.success && data.settings) {
      setSettings(data.settings);

      if (data.settings.hero_image) {
        setHeroPreview(data.settings.hero_image);
      }
    }
  } catch (error) {
    console.error("Settings loading error:", error);
  }
}

  function updateField(field, value) {
    setProduct((old) => ({
      ...old,
      [field]: value,
    }));
  }

  function startNewProduct() {
    setProduct({
      ...emptyProduct,
      id: crypto.randomUUID(),
    });
    setNewImages([]);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editProduct(item) {
    setProduct({
      ...emptyProduct,
      ...item,
      sizes: Array.isArray(item.sizes)
        ? item.sizes.join(", ")
        : item.sizes || "",
      colours: Array.isArray(item.colours)
        ? item.colours.join(", ")
        : item.colours || "",
      images: Array.isArray(item.images) ? item.images : [],
    });

    setNewImages([]);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleImageSelect(event) {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!validFiles.length) {
      setMessage("⚠️ Please image files select karein.");
      return;
    }

    const previews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    setNewImages((old) => [...old, ...previews]);

    event.target.value = "";
  }

  function removeNewImage(id) {
    setNewImages((old) => {
      const image = old.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return old.filter((item) => item.id !== id);
    });
  }

  function removeExistingImage(index) {
    setProduct((old) => ({
      ...old,
      images: old.images.filter((_, i) => i !== index),
    }));
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/.netlify/functions/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.message || "Image upload failed");
    }

    return data.url;
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!product.name.trim()) {
      setMessage("⚠️ Product name required hai.");
      return;
    }

    try {
      setSaving(true);
      setMessage("⏳ Product save ho raha hai...");

      let uploadedUrls = [];

      if (newImages.length > 0) {
        setMessage("📸 Product photos upload ho rahi hain...");

        for (const image of newImages) {
          const url = await uploadImage(image.file);
          uploadedUrls.push(url);
        }
      }

      const payload = {
        ...product,

        id: product.id || crypto.randomUUID(),

        pricePKR: Number(product.pricePKR) || 0,
        priceBDT: Number(product.priceBDT) || 0,
        priceEUR: Number(product.priceEUR) || 0,

        stock: Number(product.stock) || 0,

        sizes: product.sizes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        colours: product.colours
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        images: [...(product.images || []), ...uploadedUrls],
      };

      setMessage("💾 Product details save ho rahi hain...");

      const response = await fetch("/.netlify/functions/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Product save failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Product save failed");
      }

      setMessage("✅ Product successfully save ho gaya!");

      setNewImages([]);

      await loadProducts();

      setProduct(emptyProduct);
    } catch (error) {
      console.error(error);
      setMessage(`❌ ${error.message || "Product save nahi hua."}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      "Kya aap ye product permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      setMessage("⏳ Product delete ho raha hai...");

      const response = await fetch(
        `/.netlify/functions/products?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("✅ Product delete ho gaya.");

      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage("❌ Product delete nahi hua.");
    }
  }

  const totalImages =
    (product.images?.length || 0) + newImages.length;

  return (
    <div className="pro-admin">
      <section className="admin-card">
  <div className="card-heading">
    <div>
      <h2>Hero Banner</h2>
      <p>Homepage ki main banner image yahan se change karein.</p>
    </div>
  </div>

  <div className="hero-admin-upload">
    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setHeroFile(file);
        setHeroPreview(URL.createObjectURL(file));
      }}
    />

    {heroPreview && (
      <img
        src={heroPreview}
        alt="Hero Banner Preview"
        className="hero-admin-preview"
      />
    )}

    <button
      type="button"
      onClick={saveHero}
      disabled={savingHero}
      className="primary-button"
    >
      {savingHero ? "Saving Hero..." : "Save Hero Banner"}
        </button>
  </div>
</section>
      <div className="admin-topbar">
        <div>
          <div className="admin-brand">RZIA’S AURA</div>
          <div className="admin-subtitle">
            Luxury Fashion Management
          </div>
        </div>

        <button
          type="button"
          className="new-product-btn"
          onClick={startNewProduct}
        >
          <span>＋</span>
          New Product
        </button>
      </div>

      <main className="admin-main">
        <div className="admin-title-area">
          <div>
            <span className="admin-eyebrow">
              COLLECTION MANAGEMENT
            </span>

            <h1>Product Studio</h1>

            <p>
              Apni fashion collection ko professionally manage karein.
            </p>
          </div>

          <div className="admin-stat">
            <strong>{products.length}</strong>
            <span>Total Products</span>
          </div>
        </div>

        {message && (
          <div
            className={`admin-alert ${
              message.startsWith("❌")
                ? "error"
                : message.startsWith("⚠️")
                ? "warning"
                : "success"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={saveProduct}>
          <section className="admin-card">
            <div className="card-heading">
              <div>
                <span>01</span>
                <div>
                  <h2>Product Information</h2>
                  <p>Basic details of your product</p>
                </div>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="field field-large">
                <span>Product Name</span>

                <input
                  value={product.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="e.g. Royal Embroidered Lawn Suit"
                  required
                />
              </label>

              <label className="field">
                <span>Category</span>

                <input
                  value={product.category}
                  onChange={(e) =>
                    updateField("category", e.target.value)
                  }
                  placeholder="Luxury Pret"
                />
              </label>

              <label className="field">
                <span>Badge</span>

                <input
                  value={product.badge}
                  onChange={(e) =>
                    updateField("badge", e.target.value)
                  }
                  placeholder="New / Bestseller / Sale"
                />
              </label>
            </div>

            <label className="field">
              <span>Description</span>

              <textarea
                rows="7"
                value={product.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Write a detailed description about fabric, embroidery, style, fit and care..."
              />
            </label>
          </section>

          <section className="admin-card">
            <div className="card-heading">
              <div>
                <span>02</span>
                <div>
                  <h2>Product Gallery</h2>
                  <p>
                    Upload multiple high-quality product photographs
                  </p>
                </div>
              </div>

              <div className="image-count">
                {totalImages} Photos
              </div>
            </div>

            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">＋</div>

              <h3>Upload Product Photos</h3>

              <p>
                Click to browse or choose multiple images
              </p>

              <small>
                JPG, PNG or WEBP · Multiple photos supported
              </small>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageSelect}
              />
            </div>

            {totalImages > 0 && (
              <div className="image-gallery">
                {product.images?.map((image, index) => (
                  <div className="image-item" key={`${image}-${index}`}>
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                    />

                    {index === 0 && (
                      <span className="main-image-label">
                        Main Photo
                      </span>
                    )}

                    <button
                      type="button"
                      className="remove-image"
                      onClick={() =>
                        removeExistingImage(index)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}

                {newImages.map((image) => (
                  <div className="image-item" key={image.id}>
                    <img
                      src={image.preview}
                      alt="New product"
                    />

                    <span className="new-image-label">
                      New
                    </span>

                    <button
                      type="button"
                      className="remove-image"
                      onClick={() =>
                        removeNewImage(image.id)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-card">
            <div className="card-heading">
              <div>
                <span>03</span>
                <div>
                  <h2>Pricing & Inventory</h2>
                  <p>
                    Set prices for Pakistan, Bangladesh and Europe
                  </p>
                </div>
              </div>
            </div>

            <div className="price-grid">
              <label className="price-box">
                <span>🇵🇰 Pakistan</span>
                <strong>PKR</strong>

                <input
                  type="number"
                  min="0"
                  value={product.pricePKR}
                  onChange={(e) =>
                    updateField("pricePKR", e.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="price-box">
                <span>🇧🇩 Bangladesh</span>
                <strong>BDT</strong>

                <input
                  type="number"
                  min="0"
                  value={product.priceBDT}
                  onChange={(e) =>
                    updateField("priceBDT", e.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="price-box">
                <span>🇪🇺 Europe</span>
                <strong>EUR</strong>

                <input
                  type="number"
                  min="0"
                  value={product.priceEUR}
                  onChange={(e) =>
                    updateField("priceEUR", e.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="price-box inventory">
                <span>Inventory</span>
                <strong>STOCK</strong>

                <input
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) =>
                    updateField("stock", e.target.value)
                  }
                  placeholder="0"
                />
              </label>
            </div>
          </section>

          <section className="admin-card">
            <div className="card-heading">
              <div>
                <span>04</span>
                <div>
                  <h2>Style & Availability</h2>
                  <p>Configure sizes, colours and product visibility</p>
                </div>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="field">
                <span>Available Sizes</span>

                <input
                  value={product.sizes}
                  onChange={(e) =>
                    updateField("sizes", e.target.value)
                  }
                  placeholder="S, M, L, XL"
                />

                <small>Separate sizes with commas</small>
              </label>

              <label className="field">
                <span>Available Colours</span>

                <input
                  value={product.colours}
                  onChange={(e) =>
                    updateField("colours", e.target.value)
                  }
                  placeholder="Black, Ivory, Beige"
                />

                <small>Separate colours with commas</small>
              </label>
            </div>

            <div className="toggle-grid">
              <label className="toggle-card">
                <input
                  type="checkbox"
                  checked={product.newArrival}
                  onChange={(e) =>
                    updateField("newArrival", e.target.checked)
                  }
                />

                <div>
                  <strong>New Arrival</strong>
                  <span>Show in New Arrivals</span>
                </div>

                <i />
              </label>

              <label className="toggle-card">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) =>
                    updateField("featured", e.target.checked)
                  }
                />

                <div>
                  <strong>Featured</strong>
                  <span>Highlight on homepage</span>
                </div>

                <i />
              </label>

              <label className="toggle-card">
                <input
                  type="checkbox"
                  checked={product.visible}
                  onChange={(e) =>
                    updateField("visible", e.target.checked)
                  }
                />

                <div>
                  <strong>Visible on Website</strong>
                  <span>Customers can see this product</span>
                </div>

                <i />
              </label>
            </div>
          </section>

          <div className="save-area">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setProduct(emptyProduct);
                setNewImages([]);
                setMessage("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-product-btn"
              disabled={saving}
            >
              {saving ? "Saving Product..." : "Save Product"}
              {!saving && <span>→</span>}
            </button>
          </div>
        </form>

        <section className="admin-card product-list-card">
          <div className="card-heading">
            <div>
              <span>05</span>
              <div>
                <h2>Your Products</h2>
                <p>Edit or remove products from your collection</p>
              </div>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={loadProducts}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div>◇</div>
              <h3>No products yet</h3>
              <p>Add your first product above.</p>
            </div>
          ) : (
            <div className="product-admin-list">
              {products.map((item) => (
                <div
                  className="product-admin-row"
                  key={item.id}
                >
                  <div className="product-row-image">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                      />
                    ) : (
                      <span>R</span>
                    )}
                  </div>

                  <div className="product-row-info">
                    <strong>
                      {item.name || "Unnamed Product"}
                    </strong>

                    <span>
                      {item.category || "Uncategorized"}
                    </span>
                  </div>

                  <div className="product-row-price">
                    PKR {Number(item.pricePKR || 0).toLocaleString()}
                  </div>

                  <div
                    className={`visibility ${
                      item.visible === false
                        ? "hidden-product"
                        : ""
                    }`}
                  >
                            {item.visible === false
                        ? "Hidden"
                        : "Live"}
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      onClick={() => editProduct(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteProduct(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
      }
