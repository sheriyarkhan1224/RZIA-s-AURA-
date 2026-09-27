import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import Admin from "./admin/Admin.jsx";

const DEFAULT_SETTINGS = {
  announcement: "ELEGANCE, REIMAGINED",
  hero_title: "The Art of Elegance",
  hero_text:
    "Modern silhouettes, graceful detail and timeless confidence.",
  hero_image:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85",
  story_text: "Elegance, royalty and modern fashion.",
  email: "hello@rziasaura.com",
  address: "Pakistan",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: ""
};

function money(value, currency) {
  const n = Number(value || 0);

  if (currency === "BDT") return `৳${n.toLocaleString()}`;
  if (currency === "EUR") return `€${n.toLocaleString()}`;

  return `Rs. ${n.toLocaleString()}`;
}

function getPrice(product, currency) {
  if (currency === "PKR") {
    return Number(
      product.pricePKR ??
        product.price_pkr ??
        product.pricePkr ??
        0
    );
  }

  if (currency === "BDT") {
    return Number(
      product.priceBDT ??
        product.price_bdt ??
        product.priceBdt ??
        0
    );
  }

  return Number(
    product.priceEUR ??
      product.price_eur ??
      product.priceEur ??
      0
  );
}

function getSizes(product) {
  if (Array.isArray(product.sizes)) return product.sizes;

  if (typeof product.sizes === "string") {
    return product.sizes
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
}

function getColours(product) {
  if (Array.isArray(product.colours)) return product.colours;

  if (typeof product.colours === "string") {
    return product.colours
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
}

function isNewArrival(product) {
  return Boolean(
    product.newArrival ??
      product.new_arrival ??
      false
  );
}

async function getProducts() {
  try {
    const response = await fetch(
      "/.netlify/functions/products",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("Products API failed");
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data
      : data.products || [];
  } catch (error) {
    console.error("Products loading error:", error);
    return [];
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [settings] = useState(DEFAULT_SETTINGS);

  const [currency, setCurrency] = useState("PKR");
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);

    const data = await getProducts();

    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) => product.visible !== false
      ),
    [products]
  );

  const newArrivals = useMemo(
    () =>
      visibleProducts.filter((product) =>
        isNewArrival(product)
      ),
    [visibleProducts]
  );

  const featured = useMemo(
    () =>
      visibleProducts.filter(
        (product) => product.featured === true
      ),
    [visibleProducts]
  );

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      return (
        sum +
        getPrice(item.product, currency) * item.qty
      );
    }, 0);
  }, [cart, currency]);

  function openProduct(product) {
    setSelected(product);
    setPage("product");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function addToBag(product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        );
      }

      return [
        ...current,
        {
          product,
          qty: 1
        }
      ];
    });

    setMessage("Added to your bag.");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function removeFromBag(productId) {
    setCart((current) =>
      current.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                qty: Math.max(
                  1,
                  item.qty + amount
                )
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function checkout() {
    if (!cart.length) {
      setMessage("Your bag is empty.");
      return;
    }

    const phone =
      settings.whatsapp ||
      settings.whatsapp_number ||
      settings.phone ||
      "";

    const lines = cart.map((item) => {
      const price = getPrice(
        item.product,
        currency
      );

      return `${item.product.name} x${item.qty} - ${money(
        price * item.qty,
        currency
      )}`;
    });

    const text = [
      "Hello RZIA'S AURA, I would like to place an order:",
      "",
      ...lines,
      "",
      `Total: ${money(total, currency)}`
    ].join("\n");

    if (phone) {
      const cleanPhone = String(phone).replace(
        /[^\d]/g,
        ""
      );

      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          text
        )}`,
        "_blank"
      );
    } else {
      navigator.clipboard?.writeText(text);

      setMessage(
        "Order details copied. Please contact us on WhatsApp."
      );
    }
  }

  const hero =
    settings.hero_image ||
    DEFAULT_SETTINGS.hero_image;

  return (
    <div className="app">
      <div className="announce">
        {settings.announcement}
      </div>

      <header>
        <button
          className="icon"
          onClick={() => setPage("home")}
          aria-label="Home"
        >
          ☰
        </button>

        <button
          className="logo"
          onClick={() => setPage("home")}
        >
          RZIA’S AURA
        </button>

        <nav>
          <button onClick={() => setPage("shop")}>
            SHOP
          </button>

          <button
            onClick={() =>
              setPage("collections")
            }
          >
            COLLECTIONS
          </button>

          <button onClick={() => setPage("new")}>
            NEW ARRIVALS
          </button>
        </nav>

        <div className="actions">
          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
          >
            <option value="PKR">PKR</option>
            <option value="BDT">BDT</option>
            <option value="EUR">EUR</option>
          </select>

          <button
            onClick={() => setPage("admin")}
          >
            ADMIN
          </button>

          <button onClick={() => setPage("cart")}>
            BAG (
            {cart.reduce(
              (sum, item) => sum + item.qty,
              0
            )}
            )
          </button>
        </div>
      </header>

      {message && (
        <div className="toast">
          {message}
        </div>
      )}

      {page === "home" && (
        <>
          <section
            className="hero"
            style={{
              backgroundImage: `url("${hero}")`
            }}
          >
            <div className="hero-overlay">
              <p className="eyebrow">
                RZIA’S AURA
              </p>

              <h1>
                {settings.hero_title}
              </h1>

              <p>
                {settings.hero_text}
              </p>

              <button
                className="primary-button"
                onClick={() => setPage("shop")}
              >
                SHOP COLLECTION
              </button>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  CURATED FOR YOU
                </p>
                <h2>Featured</h2>
              </div>

              <button
                onClick={() => setPage("shop")}
              >
                VIEW ALL
              </button>
            </div>

            {loading ? (
              <p>Products loading...</p>
            ) : featured.length === 0 ? (
              <p>
                No featured products available yet.
              </p>
            ) : (
              <ProductGrid
                products={featured}
                currency={currency}
                openProduct={openProduct}
                addToBag={addToBag}
              />
            )}
          </section>

          <section className="story section">
            <p className="eyebrow">
              OUR STORY
            </p>

            <h2>
              Elegance, Royalty & Modern Fashion
            </h2>

            <p>
              {settings.story_text}
            </p>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  JUST ARRIVED
                </p>
                <h2>New Arrivals</h2>
              </div>
            </div>

            {newArrivals.length === 0 ? (
              <p>
                No new arrivals available yet.
              </p>
            ) : (
              <ProductGrid
                products={newArrivals}
                currency={currency}
                openProduct={openProduct}
                addToBag={addToBag}
              />
            )}
          </section>
        </>
      )}

      {page === "shop" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                RZIA’S AURA
              </p>
              <h1>Shop</h1>
            </div>
          </div>

          {loading ? (
            <p>Products loading...</p>
          ) : visibleProducts.length === 0 ? (
            <p>No products available yet.</p>
          ) : (
            <ProductGrid
              products={visibleProducts}
              currency={currency}
              openProduct={openProduct}
              addToBag={addToBag}
            />
          )}
        </section>
      )}

      {page === "new" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                LATEST EDIT
              </p>
              <h1>New Arrivals</h1>
            </div>
          </div>

          {newArrivals.length === 0 ? (
            <p>No new arrivals available yet.</p>
          ) : (
            <ProductGrid
              products={newArrivals}
              currency={currency}
              openProduct={openProduct}
              addToBag={addToBag}
            />
          )}
        </section>
      )}

      {page === "collections" && (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                DISCOVER
              </p>
              <h1>Collections</h1>
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="empty-state">
              <h2>Our Collections</h2>
              <p>
                Curated collections are coming soon.
              </p>
            </div>
          ) : (
            <div className="collection-grid">
              {collections.map((collection) => (
                <div
                  className="collection-card"
                  key={collection.id}
                >
                  {collection.image && (
                    <img
                      src={collection.image}
                      alt={
                        collection.name ||
                        "Collection"
                      }
                    />
                  )}

                  <h3>
                    {collection.name}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {page === "product" && selected && (
        <ProductDetails
          product={selected}
          currency={currency}
          addToBag={addToBag}
          back={() => setPage("shop")}
        />
      )}

      {page === "cart" && (
        <Cart
          cart={cart}
          currency={currency}
          total={total}
          removeFromBag={removeFromBag}
          changeQuantity={changeQuantity}
          checkout={checkout}
          back={() => setPage("shop")}
        />
      )}

      {page === "admin" && <Admin />}

      <Footer settings={settings} />
    </div>
  );
}

function ProductGrid({
  products,
  currency,
  openProduct,
  addToBag
}) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          openProduct={openProduct}
          addToBag={addToBag}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  currency,
  openProduct,
  addToBag
}) {
  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const image =
    images[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="product-card">
      <button
        className="product-image-button"
        onClick={() => openProduct(product)}
      >
        <div className="product-image-wrap">
          <img
            src={image}
            alt={product.name || "Product"}
          />

          {product.badge && (
            <span className="product-badge">
              {product.badge}
            </span>
          )}
        </div>
      </button>

      <div className="product-info">
        <p className="product-category">
          {product.category || "RZIA’S AURA"}
        </p>

        <h3>
          {product.name || "Unnamed Product"}
        </h3>

        <p className="product-price">
          {money(
            getPrice(product, currency),
            currency
          )}
        </p>

        <button
          className="add-button"
          onClick={() => addToBag(product)}
        >
          ADD TO BAG
        </button>
      </div>
    </article>
  );
}

function ProductDetails({
  product,
  currency,
  addToBag,
  back
}) {
  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const image =
    images[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80";

  const sizes = getSizes(product);
  const colours = getColours(product);

  return (
    <section className="product-detail section">
      <button
        className="back-button"
        onClick={back}
      >
        ← Back to Shop
      </button>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          <img
            src={image}
            alt={product.name}
          />
        </div>

        <div className="product-detail-info">
          {product.badge && (
            <span className="product-badge">
              {product.badge}
            </span>
          )}

          <p className="eyebrow">
            {product.category ||
              "RZIA’S AURA"}
          </p>

          <h1>{product.name}</h1>

          <h2>
            {money(
              getPrice(product, currency),
              currency
            )}
          </h2>

          {product.description && (
            <p className="description">
              {product.description}
            </p>
          )}

          {sizes.length > 0 && (
            <div className="detail-meta">
              <strong>Sizes</strong>
              <p>{sizes.join(" • ")}</p>
            </div>
          )}

          {colours.length > 0 && (
            <div className="detail-meta">
              <strong>Colours</strong>
              <p>{colours.join(" • ")}</p>
            </div>
          )}

          <div className="detail-meta">
            <strong>Stock</strong>
            <p>
              {Number(product.stock || 0) > 0
                ? `${product.stock} available`
                : "Currently unavailable"}
            </p>
          </div>

          <button
            className="primary-button"
            disabled={
              Number(product.stock || 0) <= 0
            }
            onClick={() => addToBag(product)}
          >
            {Number(product.stock || 0) > 0
              ? "ADD TO BAG"
              : "OUT OF STOCK"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Cart({
  cart,
  currency,
  total,
  removeFromBag,
  changeQuantity,
  checkout,
  back
}) {
  return (
    <section className="section cart-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            YOUR SELECTION
          </p>
          <h1>Your Bag</h1>
        </div>
      </div>

      {!cart.length ? (
        <div className="empty-state">
          <h2>Your bag is empty.</h2>

          <button
            className="primary-button"
            onClick={back}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => {
              const product = item.product;

              const images = Array.isArray(
                product.images
              )
                ? product.images
                : [];

              const image =
                images[0] ||
                product.image ||
                "";

              return (
                <div
                  className="cart-item"
                  key={product.id}
                >
                  {image && (
                    <img
                      src={image}
                      alt={product.name}
                    />
                  )}

                  <div className="cart-item-info">
                    <h3>{product.name}</h3>

                    <p>
                      {money(
                        getPrice(
                          product,
                          currency
                        ),
                        currency
                      )}
                    </p>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          changeQuantity(
                            product.id,
                            -1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          changeQuantity(
                            product.id,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
    
