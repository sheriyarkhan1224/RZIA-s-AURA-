import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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
  tiktok: "TikTok"
};

const STORAGE_PRODUCTS = "rzia_aura_products";
const STORAGE_COLLECTIONS = "rzia_aura_collections";
const STORAGE_SETTINGS = "rzia_aura_settings";

function money(value, currency) {
  const n = Number(value || 0);

  if (currency === "BDT") {
    return `৳${n.toLocaleString()}`;
  }

  if (currency === "EUR") {
    return `€${n.toLocaleString()}`;
  }

  return `Rs. ${n.toLocaleString()}`;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [products, setProducts] = useState(() =>
    readStorage(STORAGE_PRODUCTS, [])
  );

  const [collections, setCollections] = useState(() =>
    readStorage(STORAGE_COLLECTIONS, [])
  );

  const [settings, setSettings] = useState(() =>
    readStorage(STORAGE_SETTINGS, DEFAULT_SETTINGS)
  );

  const [currency, setCurrency] = useState("PKR");
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.visible !== false),
    [products]
  );

  const newArrivals = useMemo(
    () => visibleProducts.filter((product) => product.new_arrival),
    [visibleProducts]
  );

  const featured = useMemo(
    () => visibleProducts.filter((product) => product.featured),
    [visibleProducts]
  );

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price =
        Number(item.product[`price_${currency.toLowerCase()}`]) || 0;

      return sum + price * item.qty;
    }, 0);
  }, [cart, currency]);

  function openProduct(product) {
    setSelected(product);
    setPage("product");
    window.scrollTo(0, 0);
  }

  function addToBag(product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...current, { product, qty: 1 }];
    });

    setMessage("Added to your bag.");
    setTimeout(() => setMessage(""), 2000);
  }

  function removeFromBag(productId) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: Math.max(1, item.qty + amount) }
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
      const price =
        Number(item.product[`price_${currency.toLowerCase()}`]) || 0;

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
      const cleanPhone = String(phone).replace(/[^\d]/g, "");
      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`,
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
    settings.hero_image || DEFAULT_SETTINGS.hero_image;

  return (
    <div className="app">
      <div className="announce">
        {settings.announcement || DEFAULT_SETTINGS.announcement}
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
          <button onClick={() => setPage("shop")}>SHOP</button>

          <button onClick={() => setPage("collections")}>
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

          <button onClick={() => setPage("cart")}>
            BAG ({cart.reduce((sum, item) => sum + item.qty, 0)})
          </button>
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      {page === "home" && (
        <>
          <section className="hero">
            <img src={hero} alt="RZIA'S AURA" />

            <div className="heroContent">
              <p>RZIA’S AURA</p>

              <h1>
                {settings.hero_title ||
                  DEFAULT_SETTINGS.hero_title}
              </h1>

              <span>
                {settings.hero_text ||
                  DEFAULT_SETTINGS.hero_text}
              </span>

              <button onClick={() => setPage("shop")}>
                SHOP NOW
              </button>
            </div>
          </section>

          <section className="section">
            <h2>NEW ARRIVALS</h2>

            {newArrivals.length ? (
              <div className="grid">
                {newArrivals.slice(0, 8).map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    currency={currency}
                    onClick={() => openProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <Empty text="New arrivals coming soon." />
            )}
          </section>

          <section className="section">
            <h2>FEATURED</h2>

            {featured.length ? (
              <div className="grid">
                {featured.slice(0, 8).map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    currency={currency}
                    onClick={() => openProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <Empty text="Featured pieces coming soon." />
            )}
          </section>

          <Story settings={settings} />
        </>
      )}

      {(page === "shop" || page === "new") && (
        <section className="section">
          <h1>
            {page === "new" ? "NEW ARRIVALS" : "SHOP"}
          </h1>

          {(
            page === "new"
              ? newArrivals
              : visibleProducts
          ).length ? (
            <div className="grid">
              {(page === "new"
                ? newArrivals
                : visibleProducts
              ).map((product) => (
                <Card
                  key={product.id}
                  product={product}
                  currency={currency}
                  onClick={() => openProduct(product)}
                />
              ))}
            </div>
          ) : (
            <Empty text="No products available yet." />
          )}
        </section>
      )}

      {page === "collections" && (
        <section className="section">
          <h1>COLLECTIONS</h1>

          {collections.length ? (
            <div className="collectionGrid">
              {collections.map((collection) => (
                <div
                  className="collection"
                  key={collection.id}
                >
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                    />
                  ) : (
                    <div className="placeholder">
                      RZIA’S AURA
                    </div>
                  )}

                  <h2>{collection.name}</h2>

                  <p>{collection.description}</p>

                  <button
                    onClick={() => setPage("shop")}
                  >
                    EXPLORE
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Collections coming soon." />
          )}
        </section>
      )}

      {page === "product" && selected && (
        <Product
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

      <Footer settings={settings} />
    </div>
  );
}

function Card({ product, currency, onClick }) {
  const price =
    product[`price_${currency.toLowerCase()}`];

  return (
    <article className="card" onClick={onClick}>
      <div className="photo">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
          />
        ) : (
          <div className="placeholder">
            RZIA’S AURA
          </div>
        )}

        {product.badge && <b>{product.badge}</b>}
      </div>

      <h3>{product.name}</h3>

      <p>{money(price, currency)}</p>
    </article>
  );
}

function Product({
  product,
  currency,
  addToBag,
  back
}) {
  const images =
    product.images?.length
      ? product.images
      : [""];

  const price =
    product[`price_${currency.toLowerCase()}`];

  return (
    <section className="product">
      <button onClick={back}>← BACK</button>

      <div className="productWrap">
        <div className="gallery">
          {images.map((image, index) =>
            image ? (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
              />
            ) : (
              <div
                className="placeholder"
                key={index}
              >
                RZIA’S AURA
              </div>
            )
          )}
        </div>

        <div className="productInfo">
          <p>{product.category}</p>

          <h1>{product.name}</h1>

          <h2>{money(price, currency)}</h2>

          <p>{product.description}</p>

          <p>
            <b>Sizes:</b>{" "}
            {(product.sizes || []).join(" · ") ||
              "Available on request"}
          </p>

          <p>
            <b>Colours:</b>{" "}
            {(product.colours || []).join(" · ") || "—"}
          </p>

          <p>
            <b>Stock:</b>{" "}
            {product.stock ?? "Available"}
          </p>

          <button
            onClick={() => addToBag(product)}
          >
            ADD TO BAG
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
    <section className="section">
      <button onClick={back}>← CONTINUE SHOPPING</button>

      <h1>YOUR BAG</h1>

      {!cart.length ? (
        <Empty text="Your bag is empty." />
      ) : (
        <>
          <div className="cartList">
            {cart.map((item) => {
              const price =
                Number(
                  item.product[
                    `price_${currency.toLowerCase()}`
                  ]
                ) || 0;

              return (
                <div
                  className="cartitem"
                  key={item.product.id}
                >
                  <div>
                    <b>{item.product.name}</b>
                    <p>
                      {money(price, currency)}
                    </p>
                  </div>

                  <div className="quantity">
                    <button
                      onClick={() =>
                        changeQuantity(
                          item.product.id,
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
                          item.product.id,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      removeFromBag(item.product.id)
                    }
                  >
                    REMOVE
                  </button>
                </div>
              );
            })}
          </div>

          <h2>Total: {money(total, currency)}</h2>

          <button onClick={checkout}>
            CHECKOUT ON WHATSAPP
          </button>
        </>
      )}
    </section>
  );
}

function Story({ settings }) {
  return (
    <section className="section story">
      <h2>OUR STORY</h2>
      <p>
        {settings.story_text ||
          DEFAULT_SETTINGS.story_text}
      </p>
    </section>
  );
}

function Footer({ settings }) {
  return (
    <footer>
      <div>
        <b>RZIA’S AURA</b>
        <p>
          {settings.story_text ||
            DEFAULT_SETTINGS.story_text}
        </p>
      </div>

      <div>
        <b>CONTACT</b>
        <p>
          {settings.email ||
            DEFAULT_SETTINGS.email}
          <br />
          {settings.address ||
            DEFAULT_SETTINGS.address}
        </p>
      </div>

      <div>
        <b>POLICIES</b>
        <p>
          Shipping
          <br />
          Returns & Exchange
          <br />
          Privacy Policy
        </p>
      </div>

      <div>
        <b>FOLLOW</b>
        <p>
          {settings.instagram ||
            DEFAULT_SETTINGS.instagram}
          <br />
          {settings.facebook ||
            DEFAULT_SETTINGS.facebook}
          <br />
          {settings.tiktok ||
            DEFAULT_SETTINGS.tiktok}
        </p>
      </div>
    </footer>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      <p>{text}</p>
    </div>
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
        }
