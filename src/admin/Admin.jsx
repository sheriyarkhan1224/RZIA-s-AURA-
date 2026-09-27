import React, { useEffect, useState } from "react";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch("/.netlify/functions/products");

      if (!response.ok) {
        throw new Error("Products API unavailable");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error(error);
      setMessage("Products load nahi ho rahe.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(field, value) {
    setProduct((old) => ({
      ...old,
      [field]: value,
    }));
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function newProduct() {
    setProduct({
      ...emptyProduct,
      id: crypto.randomUUID(),
    });
  }

  async function saveProduct(event) {
    event.preventDefault();

    try {
      setMessage("Saving...");

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
      };

      const response = await fetch("/.netlify/functions/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setMessage("✅ Product successfully save ho gaya!");
      await loadProducts();

      setProduct(emptyProduct);
    } catch (error) {
      console.error(error);
      setMessage("❌ Save nahi hua. Backend abhi setup nahi hua.");
    }
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Kya aap ye product delete karna chahte hain?"
    );

    if (!confirmDelete) return;

    try {
      setMessage("Deleting...");

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

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <p className="admin-kicker">RZIA’S AURA</p>
            <h1>Admin Dashboard</h1>
            <p>Products manage karein aur changes save karein.</p>
          </div>

          <button type="button" onClick={newProduct}>
            + New Product
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}

        <form className="admin-form" onSubmit={saveProduct}>
          <h2>{product.id ? "Product Details" : "Add Product"}</h2>

          <div className="admin-grid">
            <label>
              Product Name
              <input
                value={product.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Product name"
                required
              />
            </label>

            <label>
              Category
              <input
                value={product.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g. Luxury Pret"
              />
            </label>

            <label>
              PKR Price
              <input
                type="number"
                value={product.pricePKR}
                onChange={(e) => updateField("pricePKR", e.target.value)}
                placeholder="0"
              />
            </label>

            <label>
              BDT Price
              <input
                type="number"
                value={product.priceBDT}
                onChange={(e) => updateField("priceBDT", e.target.value)}
                placeholder="0"
              />
            </label>

            <label>
              EUR Price
              <input
                type="number"
                value={product.priceEUR}
                onChange={(e) => updateField("priceEUR", e.target.value)}
                placeholder="0"
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                value={product.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                placeholder="0"
              />
            </label>

            <label>
              Sizes
              <input
                value={product.sizes}
                onChange={(e) => updateField("sizes", e.target.value)}
                placeholder="S, M, L, XL"
              />
            </label>

            <label>
              Colours
              <input
                value={product.colours}
                onChange={(e) => updateField("colours", e.target.value)}
                placeholder="Black, White, Beige"
              />
            </label>

            <label>
              Badge
              <input
                value={product.badge}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="New / Sale / Bestseller"
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              rows="6"
              value={product.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Product ki complete description..."
            />
          </label>

          <div className="admin-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={product.newArrival}
                onChange={(e) =>
                  updateField("newArrival", e.target.checked)
                }
              />
              New Arrival
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(e) =>
                  updateField("featured", e.target.checked)
                }
              />
              Featured
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={product.visible}
                onChange={(e) =>
                  updateField("visible", e.target.checked)
                }
              />
              Visible on Website
            </label>
          </div>

          <div className="admin-actions">
            <button type="submit" className="save-button">
              💾 Save Product
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setProduct(emptyProduct)}
            >
              Cancel
            </button>
          </div>
        </form>

        <section className="products-admin">
          <div className="section-heading">
            <h2>Products</h2>
            <button type="button" onClick={loadProducts}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <p>Products loading...</p>
          ) : products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            <div className="admin-products-list">
              {products.map((item) => (
                <div className="admin-product-row" key={item.id}>
                  <div>
                    <strong>{item.name || "Unnamed Product"}</strong>
                    <span>
                      {item.category || "No category"} · PKR{" "}
                      {item.pricePKR || 0}
                    </span>
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
      </div>
    </div>
  );
        }
