import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createRoot } from "react-dom/client";

import "./styles.css";

const HERO_BANNER = "/assets/hero-banner.jpg";

import Admin from "./admin/Admin";

const DEFAULT_SETTINGS = {
  announcement:
    "WELCOME TO RZIA’S AURA — ELEGANCE • ROYALTY • MODERN FASHION",

  hero_title:
    "Elegance Made Timeless",

  hero_text:
    "Discover refined fashion created for women who embrace elegance, confidence and individuality.",

  hero_image:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85",

  story_text:
    "RZIA’S AURA is a modern fashion boutique inspired by elegance, femininity and timeless style. Every piece is thoughtfully selected to bring together sophisticated design, graceful details and contemporary fashion.",

  email:
    "info@rziasaura.com",

  address:
    "Pakistan",

  instagram:
    "",

  facebook:
    "",

  tiktok:
    "",

  whatsapp:
    "",
};

function money(value, currency) {
  const amount = Number(value || 0);

  const symbols = {
    PKR: "PKR",
    BDT: "BDT",
    EUR: "€",
  };

  const symbol = symbols[currency] || currency;

  if (currency === "EUR") {
    return `${symbol} ${amount.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  return `${symbol} ${amount.toLocaleString(
    "en-US"
  )}`;
}

function getPrice(product, currency) {
  if (!product) return 0;

  if (currency === "BDT") {
    return Number(
      product.priceBDT ??
        product.price_bdt ??
        product.price ??
        0
    );
  }

  if (currency === "EUR") {
    return Number(
      product.priceEUR ??
        product.price_eur ??
        0
    );
  }

  return Number(
    product.pricePKR ??
      product.price_pkr ??
      product.price ??
      0
  );
}

function getSizes(product) {
  if (!product) return [];

  if (Array.isArray(product.sizes)) {
    return product.sizes;
  }

  if (typeof product.sizes === "string") {
    return product.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getColours(product) {
  if (!product) return [];

  if (Array.isArray(product.colours)) {
    return product.colours;
  }

  if (Array.isArray(product.colors)) {
    return product.colors;
  }

  if (typeof product.colours === "string") {
    return product.colours
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof product.colors === "string") {
    return product.colors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isNewArrival(product) {
  return (
    product?.newArrival === true ||
    product?.new_arrival === true
  );
}

async function getProducts() {
  try {
    const response = await fetch(
      "/.netlify/functions/products",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Products request failed: ${response.status}`
      );
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data
      : Array.isArray(data.products)
      ? data.products
      : [];
  } catch (error) {
    console.error(
      "Products loading error:",
      error
    );

    return [];
  }
}

function App() {
  const [products, setProducts] = useState([]);

  const [collections, setCollections] =
    useState([]);

  const [settings] =
    useState(DEFAULT_SETTINGS);

  const [currency, setCurrency] =
    useState("PKR");

  const [cart, setCart] = useState([]);

  const [page, setPage] =
    useState("home");

  const [selected, setSelected] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function loadProducts() {
    setLoading(true);

    const data = await getProducts();

    setProducts(data);

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.visible !== false
    );
  }, [products]);

  const newArrivals = useMemo(() => {
    return visibleProducts.filter(
      (product) =>
        isNewArrival(product)
    );
  }, [visibleProducts]);

  const featured = useMemo(() => {
    return visibleProducts.filter(
      (product) =>
        product.featured === true
    );
  }, [visibleProducts]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => {
        return (
          sum +
          getPrice(
            item.product,
            currency
          ) *
            item.qty
        );
      },
      0
    );
  }, [cart, currency]);

  function openProduct(product) {
    setSelected(product);
    setPage("product");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function addToBag(product) {
    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.product.id ===
            product.id
        );

      if (existing) {
        return current.map(
          (item) =>
            item.product.id ===
            product.id
              ? {
                  ...item,
                  qty:
                    item.qty + 1,
                }
              : item
        );
      }

      return [
        ...current,
        {
          product,
          qty: 1,
        },
      ];
    });

    setMessage(
      "Added to your bag."
    );

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function removeFromBag(productId) {
    setCart((current) =>
      current.filter(
        (item) =>
          item.product.id !==
          productId
      )
    );
  }

  function changeQuantity(
    productId,
    amount
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id ===
          productId
            ? {
                ...item,
                qty: Math.max(
                  1,
                  item.qty + amount
                ),
              }
            : item
        )
        .filter(
          (item) =>
            item.qty > 0
        )
    );
  }

  function checkout() {
    if (!cart.length) {
      setMessage(
        "Your bag is empty."
      );

      return;
    }

    const phone =
      settings.whatsapp ||
      settings.whatsapp_number ||
      settings.phone ||
      "";

    const lines = cart.map(
      (item) => {
        const price = getPrice(
          item.product,
          currency
        );

        return `${
          item.product.name ||
          "Product"
        } x${item.qty} - ${money(
          price * item.qty,
          currency
        )}`;
      }
    );

    const text = [
      "Hello RZIA'S AURA, I would like to place an order:",
      "",
      ...lines,
      "",
      `Total: ${money(
        total,
        currency
      )}`,
    ].join("\n");

    if (phone) {
      const cleanPhone =
        String(phone).replace(
          /[^\d]/g,
          ""
        );

      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          text
        )}`,
        "_blank"
      );

      return;
    }

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      navigator.clipboard.writeText(
        text
      );
    }

    setMessage(
      "Order details copied. Please contact us on WhatsApp."
    );
  }

  function goTo(pageName) {
    setPage(pageName);
    setSelected(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
          onClick={() =>
            goTo("home")
          }
          aria-label="Home"
        >
          ☰
        </button>

        <button
          className="logo"
          onClick={() =>
            goTo("home")
          }
        >
          RZIA’S AURA
        </button>

        <nav>

          <button
            onClick={() =>
              goTo("shop")
            }
          >
            SHOP
          </button>

          <button
            onClick={() =>
              goTo(
                "collections"
              )
            }
          >
            COLLECTIONS
          </button>

          <button
            onClick={() =>
              goTo("new")
            }
          >
            NEW ARRIVALS
          </button>

        </nav>

        <div className="actions">

          <select
            value={currency}
            onChange={(event) =>
              setCurrency(
                event.target.value
              )
            }
            aria-label="Currency"
          >
            <option value="PKR">
              PKR
            </option>

            <option value="BDT">
              BDT
            </option>

            <option value="EUR">
              EUR
            </option>
          </select>

          <button
            onClick={() =>
              goTo("admin")
            }
          >
            ADMIN
          </button>

          <button
            onClick={() =>
              goTo("cart")
            }
          >
            BAG (
            {cart.reduce(
              (sum, item) =>
                sum + item.qty,
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
              backgroundImage: `url("${HERO_BANNER}")`,
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
                onClick={() =>
                  goTo("shop")
                }
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

                <h2>
                  Featured
                </h2>

              </div>

              <button
                onClick={() =>
                  goTo("shop")
                }
              >
                VIEW ALL
              </button>

            </div>

            {loading ? (
              <p>
                Products loading...
              </p>
            ) : featured.length ===
              0 ? (
              <p>
                No featured products
                available yet.
              </p>
            ) : (
              <ProductGrid
                products={
                  featured
                }
                currency={
                  currency
                }
                openProduct={
                  openProduct
                }
                addToBag={
                  addToBag
                }
              />
            )}

          </section>

          <section className="story section">

            <p className="eyebrow">
              OUR STORY
            </p>

            <h2>
              Elegance, Royalty &
              Modern Fashion
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

                <h2>
                  New Arrivals
                </h2>

              </div>

            </div>

            {newArrivals.length ===
            0 ? (
              <p>
                No new arrivals
                available yet.
              </p>
            ) : (
              <ProductGrid
                products={
                  newArrivals
                }
                currency={
                  currency
                }
                openProduct={
                  openProduct
                }
                addToBag={
                  addToBag
                }
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

              <h1>
                Shop
              </h1>

            </div>

          </div>

          {loading ? (
            <p>
              Products loading...
            </p>
          ) : visibleProducts.length ===
            0 ? (
            <p>
              No products available
              yet.
            </p>
          ) : (
            <ProductGrid
              products={
                visibleProducts
              }
              currency={
                currency
              }
              openProduct={
                openProduct
              }
              addToBag={
                addToBag
              }
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

              <h1>
                New Arrivals
              </h1>

            </div>

          </div>

          {newArrivals.length ===
          0 ? (
            <p>
              No new arrivals
              available yet.
            </p>
          ) : (
            <ProductGrid
              products={
                newArrivals
              }
              currency={
                currency
              }
              openProduct={
                openProduct
              }
              addToBag={
                addToBag
              }
            />
          )}

        </section>
      )}

      {page ===
        "collections" && (
        <section className="section">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                DISCOVER
              </p>

              <h1>
                Collections
              </h1>

            </div>

          </div>

          {collections.length ===
          0 ? (
            <div className="empty-state">

              <h2>
                Our Collections
              </h2>

              <p>
                Curated collections
                are coming soon.
              </p>

            </div>
          ) : (
            <div className="collection-grid">

              {collections.map(
                (collection) => (
                  <div
                    className="collection-card"
                    key={
                      collection.id
                    }
                  >

                    {collection.image && (
                      <img
                        src={
                          collection.image
                        }
                        alt={
                          collection.name ||
                          "Collection"
                        }
                      />
                    )}

                    <h3>
                      {
                        collection.name
                      }
                    </h3>

                  </div>
                )
              )}

            </div>
          )}

        </section>
      )}

      {page === "product" &&
        selected && (
          <ProductDetails
            product={selected}
            currency={currency}
            addToBag={addToBag}
            back={() =>
              goTo("shop")
            }
          />
        )}

      {page === "cart" && (
        <Cart
          cart={cart}
          currency={currency}
          total={total}
          removeFromBag={
            removeFromBag
          }
          changeQuantity={
            changeQuantity
          }
          checkout={checkout}
          back={() =>
            goTo("shop")
          }
        />
      )}

      {page === "admin" && (
        <Admin />
      )}

      <Footer
        settings={settings}
      />

    </div>
  );
}

function ProductGrid({
  products,
  currency,
  openProduct,
  addToBag,
}) {
  return (
    <div className="product-grid">

      {products.map(
        (product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            openProduct={
              openProduct
            }
            addToBag={addToBag}
          />
        )
      )}

    </div>
  );
}

function ProductCard({
  product,
  currency,
  openProduct,
  addToBag,
}) {
  const images =
    Array.isArray(
      product.images
    )
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
        onClick={() =>
          openProduct(product)
        }
      >

        <div className="product-image-wrap">

          <img
            src={image}
            alt={
              product.name ||
              "Product"
            }
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
          {product.category ||
            "RZIA’S AURA"}
        </p>

        <h3>
          {product.name ||
            "Unnamed Product"}
        </h3>

        <p className="product-price">
          {money(
            getPrice(
              product,
              currency
            ),
            currency
          )}
        </p>

        <button
          className="add-button"
          onClick={() =>
            addToBag(product)
          }
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
  back,
}) {
  const images =
    Array.isArray(
      product.images
    )
      ? product.images
      : [];

  const image =
    images[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80";

  const sizes =
    getSizes(product);

  const colours =
    getColours(product);

  const stock =
    Number(product.stock || 0);

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
            alt={
              product.name ||
              "Product"
            }
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

          <h1>
                      {product.name ||
              "Unnamed Product"}
          </h1>

          <h2>
            {money(
              getPrice(
                product,
                currency
              ),
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
              <p>
                {sizes.join(" • ")}
              </p>
            </div>
          )}

          {colours.length > 0 && (
            <div className="detail-meta">
              <strong>Colours</strong>
              <p>
                {colours.join(" • ")}
              </p>
            </div>
          )}

          <div className="detail-meta">
            <strong>Stock</strong>
            <p>
              {stock > 0
                ? `${stock} available`
                : "Currently unavailable"}
            </p>
          </div>

          <button
            className="primary-button"
            disabled={stock <= 0}
            onClick={() =>
              addToBag(product)
            }
          >
            {stock > 0
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
  back,
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

          <h2>
            Your bag is empty.
          </h2>

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

              const product =
                item.product;

              const images =
                Array.isArray(
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
                      alt={
                        product.name ||
                        "Product"
                      }
                    />
                  )}

                  <div className="cart-item-info">

                    <h3>
                      {product.name ||
                        "Product"}
                    </h3>

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
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            product.id,
                            -1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.qty}
                      </span>

                      <button
                        type="button"
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
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      removeFromBag(
                        product.id
                      )
                    }
                  >
                    REMOVE
                  </button>

                </div>
              );

            })}

          </div>

          <div className="cart-summary">

            <div>
              <span>Total</span>

              <strong>
                {money(
                  total,
                  currency
                )}
              </strong>
            </div>

            <button
              className="primary-button"
              onClick={checkout}
            >
              CHECKOUT ON WHATSAPP
            </button>

          </div>

        </>

      )}

    </section>
  );
}

function Footer({ settings }) {
  return (
    <footer className="footer">

      <div className="footer-inner">

        <div className="footer-brand">

          <p className="eyebrow">
            RZIA’S AURA
          </p>

          <h2>
            Elegance. Royalty.
            Modern Fashion.
          </h2>

          <p>
            {settings.story_text ||
              "A luxury fashion destination created for timeless elegance and modern style."}
          </p>

        </div>

        <div className="footer-column">

          <h3>CONTACT</h3>

          {settings.address && (
            <p>
              {settings.address}
            </p>
          )}

          {settings.email && (
            <p>
              {settings.email}
            </p>
          )}

          {settings.whatsapp && (
            <p>
              {settings.whatsapp}
            </p>
          )}

        </div>

        <div className="footer-column">

          <h3>FOLLOW US</h3>

          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          )}

          {settings.facebook && (
            <a
              href={settings.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          )}

          {settings.tiktok && (
            <a
              href={settings.tiktok}
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          )}

        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} RZIA’S AURA.
          All rights reserved.
        </p>

      </div>

    </footer>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
