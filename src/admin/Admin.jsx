<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>RZIA’S AURA — Admin Panel</title>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="supabase-config.js"></script>

  <style>
    :root {
      --royal: #241914;
      --royal-2: #32231c;
      --royal-3: #453127;
      --gold: #c9a86a;
      --gold-light: #e4ca96;
      --cream: #f7f1e7;
      --cream-2: #eee5d7;
      --white: #ffffff;
      --text: #2b211c;
      --muted: #81766d;
      --border: #ddd2c4;
      --danger: #a94442;
      --success: #367454;
      --shadow: 0 15px 45px rgba(36,25,20,.10);
      --radius: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: Inter, Arial, Helvetica, sans-serif;
      background: var(--cream);
      color: var(--text);
      min-height: 100vh;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    img {
      max-width: 100%;
    }

    .hidden {
      display: none !important;
    }

    /* =========================
       LOGIN
    ========================= */

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(
          circle at top left,
          rgba(201,168,106,.20),
          transparent 35%
        ),
        linear-gradient(135deg,#1d1410,#34241c);
    }

    .login-card {
      width: min(430px,100%);
      background: rgba(255,255,255,.98);
      border-radius: 24px;
      padding: 42px 34px;
      box-shadow: 0 30px 90px rgba(0,0,0,.28);
    }

    .login-logo {
      text-align: center;
      color: var(--royal);
      font-family: Georgia,serif;
      font-size: 30px;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }

    .login-subtitle {
      text-align: center;
      color: var(--muted);
      margin-bottom: 30px;
      font-size: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .field {
      margin-bottom: 18px;
    }

    .field label,
    .form-group label {
      display: block;
      margin-bottom: 7px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: #5d5148;
    }

    .field input,
    .field textarea,
    .field select,
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 10px;
      padding: 12px 13px;
      color: var(--text);
      outline: none;
      transition: .2s ease;
    }

    .field input:focus,
    .field textarea:focus,
    .field select:focus,
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(201,168,106,.13);
    }

    .login-btn {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 14px;
      color: #fff;
      background: var(--royal);
      font-weight: 700;
      letter-spacing: .5px;
      margin-top: 5px;
    }

    .login-btn:hover {
      background: #3a2820;
    }

    .login-error {
      min-height: 18px;
      margin-top: 13px;
      color: var(--danger);
      font-size: 12px;
      text-align: center;
    }

    /* =========================
       APP
    ========================= */

    .admin-app {
      min-height: 100vh;
      display: flex;
    }

    .sidebar {
      width: 260px;
      min-height: 100vh;
      flex: 0 0 260px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
      color: #fff;
      background:
        linear-gradient(
          180deg,
          #211611 0%,
          #2d1f18 55%,
          #1c130f 100%
        );
      border-right: 1px solid rgba(201,168,106,.25);
    }

    .sidebar-brand {
      padding: 28px 21px 23px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .sidebar-brand h1 {
      font-family: Georgia,serif;
      font-weight: 500;
      font-size: 22px;
      letter-spacing: 2.5px;
      color: var(--gold-light);
    }

    .sidebar-brand p {
      margin-top: 7px;
      color: #b8aaa0;
      font-size: 10px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    .nav {
      padding: 17px 11px;
    }

    .nav-label {
      color: #817169;
      font-size: 9px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      padding: 12px 12px 7px;
    }

    .nav-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 11px;
      border: 1px solid transparent;
      background: transparent;
      color: #d8cec7;
      text-align: left;
      padding: 11px 12px;
      border-radius: 10px;
      margin-bottom: 4px;
      transition: .2s ease;
    }

    .nav-btn:hover {
      background: rgba(255,255,255,.07);
      color: #fff;
    }

    .nav-btn.active {
      background: linear-gradient(
        90deg,
        rgba(201,168,106,.22),
        rgba(201,168,106,.06)
      );
      border-color: rgba(201,168,106,.18);
      color: var(--gold-light);
    }

    .nav-icon {
      width: 22px;
      text-align: center;
      font-size: 15px;
    }

    .sidebar-bottom {
      padding: 15px 19px 24px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .view-store {
      width: 100%;
      border: 1px solid rgba(201,168,106,.35);
      background: transparent;
      color: var(--gold-light);
      border-radius: 9px;
      padding: 10px;
      font-size: 11px;
    }

    /* =========================
       MAIN / TOPBAR
    ========================= */

    .main {
      flex: 1;
      min-width: 0;
    }

    .topbar {
      height: 72px;
      background: rgba(255,255,255,.96);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 27px;
      position: sticky;
      top: 0;
      z-index: 900;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 13px;
    }

    .mobile-menu {
      display: none;
      border: 0;
      background: transparent;
      color: var(--royal);
      font-size: 23px;
    }

    .page-title {
      font-family: Georgia,serif;
      font-size: 22px;
      color: var(--royal);
    }

    .page-subtitle {
      color: var(--muted);
      font-size: 10px;
      margin-top: 3px;
    }

    .admin-user {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-dot {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: var(--gold-light);
      background: var(--royal);
      font-size: 11px;
      font-weight: 700;
    }

    .logout-btn {
      border: 1px solid var(--border);
      background: #fff;
      color: var(--royal);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 11px;
    }

    .content {
      width: 100%;
      max-width: 1600px;
      margin: auto;
      padding: 27px;
    }

    /* =========================
       DASHBOARD
    ========================= */

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4,minmax(0,1fr));
      gap: 15px;
      margin-bottom: 22px;
    }

    .stat-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 19px;
      box-shadow: 0 7px 24px rgba(36,25,20,.045);
    }

    .stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-label {
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      background: var(--cream);
      color: var(--royal);
    }

    .stat-number {
      margin-top: 11px;
      font-family: Georgia,serif;
      font-size: 28px;
      color: var(--royal);
    }

    /* =========================
       SECTIONS
    ========================= */

    .section {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 7px 24px rgba(36,25,20,.045);
      overflow: hidden;
      margin-bottom: 21px;
    }

    .section-head {
      padding: 18px 21px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .section-head h2 {
      font-family: Georgia,serif;
      font-size: 20px;
      font-weight: 500;
      color: var(--royal);
    }

    .section-head p {
      color: var(--muted);
      font-size: 11px;
      margin-top: 3px;
    }

    .section-body {
      padding: 21px;
    }

    /* =========================
       BUTTONS
    ========================= */

    .btn {
      border: 0;
      border-radius: 9px;
      padding: 10px 15px;
      font-size: 11px;
      font-weight: 700;
      transition: .2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-primary {
      background: var(--royal);
      color: #fff;
    }

    .btn-primary:hover {
      background: #3a2820;
    }

    .btn-gold {
      background: var(--gold);
      color: #251a14;
    }

    .btn-light {
      background: var(--cream);
      color: var(--royal);
      border: 1px solid var(--border);
    }

    .btn-danger {
      background: #fff0ef;
      color: var(--danger);
      border: 1px solid #edcecb;
    }

    .btn-success {
      background: #edf7f0;
      color: var(--success);
      border: 1px solid #cde5d5;
    }

    .btn:disabled {
      opacity: .55;
      cursor: not-allowed;
      transform: none;
    }

    /* =========================
       TOOLBAR
    ========================= */

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-bottom: 17px;
    }

    .search-box {
      flex: 1 1 250px;
    }

    .search-box input,
    .filter-select {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: #fff;
      padding: 10px 12px;
      outline: none;
      color: var(--text);
    }

    .filter-select {
      width: auto;
      min-width: 140px;
    }

    /* =========================
       PRODUCT GRID
    ========================= */

    .products-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 15px;
    }

    .product-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 13px;
      overflow: hidden;
      transition: .2s ease;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow);
    }

    .product-image-wrap {
      width: 100%;
      height: 230px;
      background: #eee6db;
      overflow: hidden;
      position: relative;
    }

    .product-image-wrap img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .product-status {
      position: absolute;
      left: 9px;
      top: 9px;
      background: rgba(36,25,20,.9);
      color: var(--gold-light);
      border-radius: 5px;
      padding: 5px 7px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: .7px;
    }

    .product-info {
      padding: 14px;
    }

    .product-name {
      font-family: Georgia,serif;
      color: var(--royal);
      font-size: 16px;
      margin-bottom: 5px;
    }

    .product-meta {
      color: var(--muted);
      font-size: 10px;
      line-height: 1.65;
    }

    .product-price {
      color: var(--royal);
      font-size: 12px;
      font-weight: 700;
      margin-top: 8px;
    }

    .product-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }

    .product-actions .btn {
      flex: 1;
      min-width: 65px;
      padding: 8px 6px;
      font-size: 9px;
    }

    /* =========================
       EDITOR
    ========================= */

    .editor-grid {
      display: grid;
      grid-template-columns: 1.15fr .85fr;
      gap: 22px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 14px;
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-group.full {
      grid-column: 1/-1;
    }

    .form-group textarea {
      min-height: 125px;
      resize: vertical;
    }

    .helper {
      color: var(--muted);
      font-size: 9px;
      margin-top: 5px;
    }

    /* =========================
       CHECKBOXES
    ========================= */

    .toggle-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 8px;
      margin-top: 4px;
    }

    .check-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fffdf9;
      font-size: 10px;
    }

    .check-card input {
      accent-color: var(--royal);
    }

    /* =========================
       UPLOAD AREA
    ========================= */

    .upload-box {
      border: 1.5px dashed #cbbda9;
      background: #fbf7f0;
      border-radius: 13px;
      padding: 19px;
      text-align: center;
    }

    .upload-icon {
      font-size: 27px;
      margin-bottom: 6px;
    }

    .upload-box h3 {
      font-family: Georgia,serif;
      color: var(--royal);
      font-size: 17px;
      font-weight: 500;
    }

    .upload-box p {
      color: var(--muted);
      font-size: 10px;
      margin: 5px 0 12px;
    }

    .upload-input {
      display: none;
    }

    .upload-label {
      display: inline-block;
      background: var(--royal);
      color: #fff;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    .image-preview-grid {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 8px;
      margin-top: 14px;
    }

    .image-preview {
      height: 115px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #eee7dc;
      overflow: hidden;
      position: relative;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 50%;
      background: rgba(30,20,15,.84);
      color: #fff;
      font-size: 12px;
    }

    .save-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 19px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .save-status {
      margin-right: auto;
      font-size: 11px;
    }

    .save-status.success {
      color: var(--success);
    }

    .save-status.error {
      color: var(--danger);
    }

    /* =========================
       CONTENT FORMS
    ========================= */

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 15px;
    }

    .content-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 17px;
      background: #fff;
    }

    .content-card h3 {
      font-family: Georgia,serif;
      font-size: 17px;
      font-weight: 500;
      color: var(--royal);
      margin-bottom: 13px;
    }

    /* =========================
       EMPTY
    ========================= */

    .empty {
      text-align: center;
      padding: 50px 20px;
      color: var(--muted);
    }

    .empty-icon {
      font-size: 36px;
      opacity: .55;
      margin-bottom: 9px;
    }

    .empty h3 {
      font-family: Georgia,serif;
      color: var(--royal);
      font-size: 19px;
      margin-bottom: 5px;
    }

    .empty p {
      font-size: 11px;
    }

    /* =========================
       TOAST
    ========================= */

    .toast {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 5000;
      min-width: 240px;
      max-width: 380px;
      padding: 13px 15px;
      border-radius: 10px;
      background: var(--royal);
      color: #fff;
      box-shadow: 0 15px 45px rgba(0,0,0,.25);
      font-size: 11px;
      transform: translateY(100px);
      opacity: 0;
      pointer-events: none;
      transition: .3s ease;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    .toast.success {
      border-left: 4px solid #6eb78d;
    }

    .toast.error {
      border-left: 4px solid #d66a66;
    }

    /* =========================
       MOBILE
    ========================= */

    @media(max-width:1100px) {

      .dashboard-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
      }

      .products-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
      }

      .editor-grid {
        grid-template-columns: 1fr;
      }
    }

    @media(max-width:800px) {

      .sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        transition: .25s ease;
        box-shadow: 20px 0 50px rgba(0,0,0,.25);
      }

      .sidebar.open {
        left: 0;
      }

      .mobile-menu {
        display: block;
      }

      .topbar {
        padding: 0 15px;
      }

      .admin-user .logout-btn {
        display: none;
      }

      .content {
        padding: 15px;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }

    @media(max-width:560px) {

      .dashboard-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 9px;
      }

      .stat-card {
        padding: 14px;
      }

      .stat-number {
        font-size: 23px;
      }

      .form-grid,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full {
        grid-column: auto;
      }

      .toggle-grid {
        grid-template-columns: 1fr;
      }

      .image-preview-grid {
        grid-template-columns: repeat(2,1fr);
      }

      .section-body {
        padding: 15px;
      }

      .section-head {
        padding: 15px;
      }

      .section-head {
        align-items: flex-start;
        flex-direction: column;
      }

      .page-title {
        font-size: 19px;
      }
    }
  </style>
</head>
<body>

  <!-- =========================
       LOGIN
  ========================= -->

  <div id="loginPage" class="login-page">

    <div class="login-card">

      <div class="login-logo">
        RZIA’S AURA
      </div>

      <div class="login-subtitle">
        Luxury Fashion Management
      </div>

      <div class="field">
        <label>Email</label>
        <input
          id="loginEmail"
          type="email"
          placeholder="Admin email"
          autocomplete="username"
        >
      </div>

      <div class="field">
        <label>Password</label>
        <input
          id="loginPassword"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
        >
      </div>

      <button
        id="loginBtn"
        class="login-btn"
      >
        Sign In
      </button>

      <div
        id="loginError"
        class="login-error"
      ></div>

    </div>

  </div>


  <!-- =========================
       ADMIN APP
  ========================= -->

  <div
    id="adminApp"
    class="admin-app hidden"
  >

    <!-- SIDEBAR -->

    <aside
      id="sidebar"
      class="sidebar"
    >

      <div class="sidebar-brand">

        <h1>RZIA’S AURA</h1>

        <p>
          Luxury Fashion Management
        </p>

      </div>


      <nav class="nav">

        <div class="nav-label">
          Main
        </div>

        <button
          class="nav-btn active"
          data-section="dashboardSection"
          data-title="Dashboard"
        >
          <span class="nav-icon">⌂</span>
          Dashboard
        </button>

        <button
          class="nav-btn"
          data-section="productsSection"
          data-title="Products"
        >
          <span class="nav-icon">◇</span>
          Products
        </button>

        <button
          class="nav-btn"
          data-section="collectionsSection"
          data-title="Collections"
        >
          <span class="nav-icon">▦</span>
          Collections
        </button>


        <div class="nav-label">
          Website
        </div>

        <button
          class="nav-btn"
          data-section="heroSection"
          data-title="Hero & Banners"
        >
          <span class="nav-icon">◈</span>
          Hero & Banners
        </button>

        <button
          class="nav-btn"
          data-section="contentSection"
          data-title="Website Content"
        >
          <span class="nav-icon">✦</span>
          Website Content
        </button>

        <button
          class="nav-btn"
          data-section="faqSection"
          data-title="FAQ"
        >
          <span class="nav-icon">?</span>
          FAQ
        </button>

        <button
          class="nav-btn"
          data-section="settingsSection"
          data-title="Store Settings"
        >
          <span class="nav-icon">⚙</span>
          Store Settings
        </button>

      </nav>


      <div class="sidebar-bottom">

        <button
          id="viewStoreBtn"
          class="view-store"
        >
          ↗ View Store
        </button>

      </div>

    </aside>


    <!-- MAIN -->

    <main class="main">

      <header class="topbar">

        <div class="topbar-left">

          <button
            id="mobileMenuBtn"
            class="mobile-menu"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>

            <div
              id="pageTitle"
              class="page-title"
            >
              Dashboard
            </div>

            <div class="page-subtitle">
              Manage your RZIA’S AURA store
            </div>

          </div>

        </div>


        <div class="admin-user">

          <div class="user-dot">
            RA
          </div>

          <button
            id="logoutBtn"
            class="logout-btn"
          >
            Logout
          </button>

        </div>

      </header>


      <div class="content">


        <!-- =========================
             DASHBOARD
        ========================= -->

        <section
          id="dashboardSection"
          class="page-section"
        >

          <div class="dashboard-grid">

            <div class="stat-card">

              <div class="stat-top">

                <div class="stat-label">
                  Total Products
                </div>

                <div class="stat-icon">
                  ◇
                </div>

              </div>

              <div
                id="statTotal"
                class="stat-number"
              >
                0
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-top">

                <div class="stat-label">
                  Active Products
                </div>

                <div class="stat-icon">
                  ✓
                </div>

              </div>

              <div
                id="statActive"
                class="stat-number"
              >
                0
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-top">

                <div class="stat-label">
                  New Arrivals
                </div>

                <div class="stat-icon">
                  ✦
                </div>

              </div>

              <div
                id="statNew"
                class="stat-number"
              >
                0
              </div>

            </div>


            <div class="stat-card">

              <div class="stat-top">

                <div class="stat-label">
                  Low Stock
                </div>

                <div class="stat-icon">
                  !
                </div>

              </div>

              <div
                id="statLow"
                class="stat-number"
              >
                0
              </div>

            </div>

          </div>


          <div class="section">

            <div class="section-head">

              <div>

                <h2>
                  Welcome to RZIA’S AURA
                </h2>

                <p>
                  Curate your luxury fashion store from one place.
                </p>

              </div>

              <button
                id="dashboardAddBtn"
                class="btn btn-primary"
              >
                + Add Product
              </button>

            </div>

            <div class="section-body">

              <div class="empty">

                <div class="empty-icon">
                  ✦
                </div>

                <h3>
                  Your Luxury Collection
                </h3>

                <p>
                  Add and manage products, collections and storefront content.
                </p>

              </div>

            </div>

          </div>

        </section>


        <!-- =========================
             PRODUCTS
        ========================= -->

        <section
          id="productsSection"
          class="page-section hidden"
        >

          <div class="section">

            <div class="section-head">

              <div>

                <h2>
                  Product Management
                </h2>

                <p>
                  Add, edit, hide, show and remove products.
                </p>

              </div>

              <button
                id="addProductBtn"
                class="btn btn-gold"
              >
                + Add Product
              </button>

            </div>


            <div class="section-body">

              <div class="toolbar">

                <div class="search-box">

                  <input
                    id="productSearch"
                    type="search"
                    placeholder="Search products..."
                  >

                </div>


                <select
                  id="genderFilter"
                  class="filter-select"
                >

                  <option value="">
                    All Gender
                  </option>

                  <option value="Women">
                    Women
                  </option>

                  <option value="Men">
                    Men
                  </option>

                  <option value="Unisex">
                    Unisex
                  </option>

                </select>


                <select
                  id="visibilityFilter"
                  class="filter-select"
                >

                  <option value="">
                    All Visibility
                  </option>

                  <option value="active">
                    Visible
                  </option>

                  <option value="hidden">
                    Hidden
                  </option>

                </select>


                <select
                  id="arrivalFilter"
                  class="filter-select"
                >

                  <option value="">
                    All Products
                  </option>

                  <option value="new">
                    New Arrivals
                  </option>

                  <option value="featured">
                    Featured
                  </option>

                </select>

              </div>


              <div
                id="productsGrid"
                class="products-grid"
              >

                <div class="empty">

                  <div class="empty-icon">
                    ◇
                  </div>

                  <h3>
                    Loading Products...
                  </h3>

                  <p>
                    Please wait.
                  </p>

                </div>

              </div>

            </div>

          </div>


          <!-- PRODUCT EDITOR -->

          <div
            id="productEditor"
            class="section hidden"
          >

            <div class="section-head">

              <div>

                <h2 id="editorTitle">
                  Add New Product
                </h2>

                <p>
                  Create a refined product listing.
                </p>

              </div>

              <button
                id="closeEditorBtn"
                class="btn btn-light"
              >
                Close
              </button>

            </div>


            <div class="section-body">

              <div class="editor-grid">


                <!-- FORM -->

                <div>

                  <div class="form-grid">


                    <div class="form-group full">

                      <label>
                        Product Name
                      </label>

                      <input
                        id="pName"
                        type="text"
                        placeholder="e.g. Royal Silk Ensemble"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Gender
                      </label>

                      <select id="pGender">

                        <option value="Women">
                          Women
                        </option>

                        <option value="Men">
                          Men
                        </option>

                        <option value="Unisex">
                          Unisex
                        </option>

                      </select>

                    </div>


                    <div class="form-group">

                      <label>
                        Main Category
                      </label>

                      <select id="pCategory">

                        <option value="">
                          Select Category
                        </option>

                        <option value="Dresses">
                          Dresses
                        </option>

                        <option value="Suits">
                          Suits
                        </option>

                        <option value="Co-Ord Sets">
                          Co-Ord Sets
                        </option>

                        <option value="Tops">
                          Tops
                        </option>

                        <option value="Bottoms">
                          Bottoms
                        </option>

                        <option value="Abayas / Modest Wear">
                          Abayas / Modest Wear
                        </option>

                        <option value="Shawls & Dupattas">
                          Shawls & Dupattas
                        </option>

                        <option value="Kurta">
                          Kurta
                        </option>

                        <option value="Shalwar Kameez">
                          Shalwar Kameez
                        </option>

                        <option value="Shirts">
                          Shirts
                        </option>

                        <option value="T-Shirts">
                          T-Shirts
                        </option>

                        <option value="Trousers">
                          Trousers
                        </option>

                        <option value="Waistcoats">
                          Waistcoats
                        </option>

                        <option value="Jackets">
                          Jackets
                        </option>

                        <option value="Clothing">
                          Clothing
                        </option>

                        <option value="Accessories">
                          Accessories
                        </option>

                      </select>

                    </div>


                    <div class="form-group">

                      <label>
                        Subcategory
                      </label>

                      <input
                        id="pSubcategory"
                        type="text"
                        placeholder="e.g. Evening Wear"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Collection
                      </label>

                      <input
                        id="pCollection"
                        type="text"
                        placeholder="e.g. The Aura Edit"
                      >

                    </div>


                    <div class="form-group full">

                      <label>
                        Description
                      </label>

                      <textarea
                        id="pDescription"
                        placeholder="Write a refined product description..."
                      ></textarea>

                    </div>


                    <div class="form-group">

                      <label>
                        Price — PKR
                      </label>

                      <input
                        id="pPricePKR"
                        type="number"
                        min="0"
                        placeholder="0"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Price — BDT
                      </label>

                      <input
                        id="pPriceBDT"
                        type="number"
                        min="0"
                        placeholder="0"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Price — EUR
                      </label>

                      <input
                        id="pPriceEUR"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Stock
                      </label>

                      <input
                        id="pStock"
                        type="number"
                        min="0"
                        placeholder="0"
                      >

                    </div>


                    <div class="form-group">

                      <label>
                        Sizes
                      </label>

                      <input
                        id="pSizes"
                        type="text"
                        placeholder="XS, S, M, L, XL"
                      >

                      <div class="helper">
                        Separate sizes with commas.
                      </div>

                    </div>


                    <div class="form-group">

                      <label>
                        Colours
                      </label>

                      <input
                        id="pColors"
                        type="text"
                        placeholder="Black, Ivory, Burgundy"
                      >

                      <div class="helper">
                        Separate colours with commas.
                      </div>

                    </div>


                    <div class="form-group">

                      <label>
                        Badge
                      </label>

                      <select id="pBadge">

                        <option value="">
                          No Badge
                        </option>

                        <option value="New">
                          New
                        </option>

                        <option value="Featured">
                          Featured
                        </option>

                        <option value="Best Seller">
                          Best Seller
                        </option>

                        <option value="Limited">
                          Limited
                        </option>

                        <option value="Sale">
                          Sale
                        </option>

                        <option value="Sold Out">
                          Sold Out
                        </option>

                      </select>

                    </div>

                  </div>


                  <div class="form-group">

                    <label>
                      Product Labels
                    </label>

                    <div class="toggle-grid">

                      <label class="check-card">

                        <input
                          id="pActive"
                          type="checkbox"
                          checked
                        >

                        Visible on Store

                      </label>


                      <label class="check-card">

                        <input
                          id="pNewArrival"
                          type="checkbox"
                        >

                        New Arrival

                      </label>


                      <label class="check-card">

                        <input
                          id="pFeatured"
                          type="checkbox"
                        >

                        Featured

                      </label>


                      <label class="check-card">

                        <input
                          id="pBestSeller"
                          type="checkbox"
                        >

                        Best Seller

                      </label>


                                            </label>

                    </div>
                  </div>

                  <!-- PRODUCT IMAGES -->
                  <div class="admin-section">
                    <div class="section-heading">
                      <div>
                        <h3>Product Images</h3>
                        <p>Upload multiple product images. The first image will be the main image.</p>
                      </div>
                    </div>

                    <div class="image-upload-box">
                      <label class="upload-button">
                        <input
                          id="productImages"
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                        >
                        + Upload Product Images
                      </label>

                      <div id="imageUploadStatus" class="upload-status"></div>

                      <div
                        id="imagePreviewGrid"
                        class="image-preview-grid"
                      ></div>
                    </div>
                  </div>

                  <!-- PRODUCT PREVIEW -->
                  <div class="admin-section">
                    <div class="section-heading">
                      <div>
                        <h3>Product Preview</h3>
                        <p>Preview how this product will appear on the store.</p>
                      </div>
                    </div>

                    <div id="productPreview" class="product-preview-card">
                      <div class="preview-image-wrap">
                        <img
                          id="previewProductImage"
                          src=""
                          alt="Product preview"
                        >
                      </div>

                      <div class="preview-content">
                        <div id="previewBadge" class="preview-badge"></div>

                        <h3 id="previewProductName">
                          Product Name
                        </h3>

                        <p id="previewProductDescription">
                          Product description will appear here.
                        </p>

                        <div class="preview-price">
                          <span id="previewPKR">PKR 0</span>
                          <span id="previewBDT">BDT 0</span>
                          <span id="previewEUR">EUR 0</span>
                        </div>

                        <div class="preview-meta">
                          <span id="previewCategory">Category</span>
                          <span id="previewStock">Stock: 0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SAVE ACTIONS -->
                  <div class="editor-actions">

                    <button
                      type="button"
                      class="admin-secondary"
                      id="cancelProductBtn"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      class="admin-save"
                      id="saveProductBtn"
                    >
                      Save Product
                    </button>

                  </div>

                  <div
                    id="productMessage"
                    class="admin-message hidden"
                  ></div>

                </div>
              </section>

              <!-- COLLECTIONS -->
              <section
                id="collectionsSection"
                class="admin-section-page hidden"
              >

                <div class="admin-page-title">
                  <div>
                    <h1>Collections</h1>
                    <p>Create and manage your fashion collections.</p>
                  </div>

                  <button
                    type="button"
                    class="admin-save"
                    id="addCollectionBtn"
                  >
                    + Add Collection
                  </button>
                </div>

                <div
                  id="collectionsGrid"
                  class="collection-admin-grid"
                ></div>

              </section>

              <!-- WEBSITE CONTENT -->
              <section
                id="contentSection"
                class="admin-section-page hidden"
              >

                <div class="admin-page-title">
                  <div>
                    <h1>Website Content</h1>
                    <p>Manage your brand information and storefront content.</p>
                  </div>
                </div>

                <div class="admin-section">

                  <div class="admin-grid">

                    <div class="admin-field">
                      <label>Brand Name</label>
                      <input
                        id="siteBrandName"
                        type="text"
                        value="RZIA’S AURA"
                      >
                    </div>

                    <div class="admin-field">
                      <label>Announcement Bar</label>
                      <input
                        id="siteAnnouncement"
                        type="text"
                        placeholder="Free shipping on orders above..."
                      >
                    </div>

                    <div class="admin-field full">
                      <label>Hero Heading</label>
                      <input
                        id="siteHeroHeading"
                        type="text"
                        placeholder="THE AURA OF ELEGANCE"
                      >
                    </div>

                    <div class="admin-field full">
                      <label>Hero Description</label>
                      <textarea
                        id="siteHeroDescription"
                        rows="4"
                        placeholder="Write your hero section description..."
                      ></textarea>
                    </div>

                    <div class="admin-field full">
                      <label>Our Story / Elegance</label>
                      <textarea
                        id="siteStory"
                        rows="7"
                        placeholder="Tell customers about RZIA’S AURA..."
                      ></textarea>
                    </div>

                    <div class="admin-field">
                      <label>WhatsApp Number</label>
                      <input
                        id="siteWhatsapp"
                        type="text"
                        placeholder="+92..."
                      >
                    </div>

                    <div class="admin-field">
                      <label>Email</label>
                      <input
                        id="siteEmail"
                        type="email"
                        placeholder="hello@example.com"
                      >
                    </div>

                    <div class="admin-field full">
                      <label>Address</label>
                      <textarea
                        id="siteAddress"
                        rows="3"
                        placeholder="Your shop address"
                      ></textarea>
                    </div>

                    <div class="admin-field">
                      <label>Instagram</label>
                      <input
                        id="siteInstagram"
                        type="text"
                        placeholder="Instagram URL"
                      >
                    </div>

                    <div class="admin-field">
                      <label>Facebook</label>
                      <input
                        id="siteFacebook"
                        type="text"
                        placeholder="Facebook URL"
                      >
                    </div>

                    <div class="admin-field">
                      <label>TikTok</label>
                      <input
                        id="siteTikTok"
                        type="text"
                        placeholder="TikTok URL"
                      >
                    </div>

                    <div class="admin-field">
                      <label>Delivery Charges (PKR)</label>
                      <input
                        id="deliveryCharges"
                        type="number"
                        min="0"
                        value="0"
                      >
                    </div>

                    <div class="admin-field">
                      <label>Free Delivery Above (PKR)</label>
                      <input
                        id="freeDeliveryThreshold"
                        type="number"
                        min="0"
                        value="0"
                      >
                    </div>

                  </div>

                  <div class="editor-actions">
                    <button
                      type="button"
                      class="admin-save"
                      id="saveContentBtn"
                    >
                      Save Website Content
                    </button>
                  </div>

                  <div
                    id="contentMessage"
                    class="admin-message hidden"
                  ></div>

                </div>

              </section>

              <!-- FAQ -->
              <section
                id="faqSection"
                class="admin-section-page hidden"
              >

                <div class="admin-page-title">
                  <div>
                    <h1>FAQ</h1>
                    <p>Manage frequently asked questions.</p>
                  </div>

                  <button
                    type="button"
                    class="admin-save"
                    id="addFaqBtn"
                  >
                    + Add FAQ
                  </button>
                </div>

                <div
                  id="faqList"
                  class="faq-admin-list"
                ></div>

              </section>

              <!-- POLICIES -->
              <section
                id="policiesSection"
                class="admin-section-page hidden"
              >

                <div class="admin-page-title">
                  <div>
                    <h1>Policies</h1>
                    <p>Manage shipping, returns, privacy and terms.</p>
                  </div>
                </div>

                <div class="admin-section">

                  <div class="admin-field">
                    <label>Shipping Policy</label>
                    <textarea
                      id="shippingPolicy"
                      rows="8"
                    ></textarea>
                  </div>

                  <div class="admin-field">
                    <label>Return & Exchange Policy</label>
                    <textarea
                      id="returnPolicy"
                      rows="8"
                    ></textarea>
                  </div>

                  <div class="admin-field">
                    <label>Privacy Policy</label>
                    <textarea
                      id="privacyPolicy"
                      rows="8"
                    ></textarea>
                  </div>

                  <div class="admin-field">
                    <label>Terms & Conditions</label>
                    <textarea
                      id="termsPolicy"
                      rows="8"
                    ></textarea>
                  </div>

                  <div class="editor-actions">
                    <button
                      type="button"
                      class="admin-save"
                      id="savePoliciesBtn"
                    >
                      Save Policies
                    </button>
                  </div>

                </div>

              </section>

            </main>

          </div>
        </div>

        <!-- COLLECTION MODAL -->
        <div
          id="collectionModal"
          class="modal-overlay hidden"
        >

          <div class="admin-modal">

            <div class="modal-header">
              <div>
                <h2 id="collectionModalTitle">
                  Add Collection
                </h2>
                <p>Create a new collection.</p>
              </div>

              <button
                type="button"
                class="modal-close"
                id="closeCollectionModal"
              >
                ×
              </button>
            </div>

            <div class="admin-grid">

              <div class="admin-field">
                <label>Collection Name</label>
                <input
                  id="collectionName"
                  type="text"
                  placeholder="Summer Elegance"
                >
              </div>

              <div class="admin-field">
                <label>Collection Image URL</label>
                <input
                  id="collectionImage"
                  type="text"
                  placeholder="Image URL"
                >
              </div>

              <div class="admin-field full">
                <label>Description</label>
                <textarea
                  id="collectionDescription"
                  rows="5"
                  placeholder="Collection description..."
                ></textarea>
              </div>

            </div>

            <div class="editor-actions">

              <button
                type="button"
                class="admin-secondary"
                id="cancelCollectionBtn"
              >
                Cancel
              </button>

              <button
                type="button"
                class="admin-save"
                id="saveCollectionBtn"
              >
                Save Collection
              </button>

            </div>

          </div>

        </div>

        <!-- TOAST -->
        <div
          id="adminToast"
          class="admin-toast hidden"
        ></div>

      </div>

      <script>

        /* =====================================================
           RZIA’S AURA — ADMIN JAVASCRIPT
        ===================================================== */

        const $ = (id) => document.getElementById(id);

        let products = [];
        let collections = [];
        let currentProductId = null;
        let currentCollectionId = null;
        let selectedImages = [];

        /* -------------------------------
           SUPABASE
        -------------------------------- */

        let sb = null;

        try {
          if (
            typeof supabase !== "undefined" &&
            typeof RZIA_SUPABASE_URL !== "undefined" &&
            typeof RZIA_SUPABASE_ANON_KEY !== "undefined"
          ) {
            sb = supabase.createClient(
              RZIA_SUPABASE_URL,
              RZIA_SUPABASE_ANON_KEY
            );
          }
        } catch (error) {
          console.error("Supabase initialization error:", error);
        }

        /* -------------------------------
           HELPERS
        -------------------------------- */

        function escapeHtml(value) {
          return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }

        function money(value, currency) {
          const number = Number(value || 0);

          return `${currency} ${number.toLocaleString()}`;
        }

        function showToast(message, type = "success") {
          const toast = $("adminToast");

          if (!toast) return;

          toast.textContent = message;
          toast.className = `admin-toast ${type}`;

          clearTimeout(window.__toastTimer);

          window.__toastTimer = setTimeout(() => {
            toast.classList.add("hidden");
          }, 3500);
        }

        function setMessage(id, message, type = "success") {
          const el = $(id);

          if (!el) return;

          el.textContent = message;
          el.className = `admin-message ${type}`;

          if (!message) {
            el.classList.add("hidden");
          }
        }

        function parseList(value) {
          return String(value || "")
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
        }

        /* -------------------------------
           NAVIGATION
        -------------------------------- */

        function showPage(page) {

          document
            .querySelectorAll(".admin-section-page")
            .forEach(section => {
              section.classList.add("hidden");
            });

          const target = $(`${page}Section`);

          if (target) {
            target.classList.remove("hidden");
          }

          document
            .querySelectorAll(".sidebar-link")
            .forEach(link => {
              link.classList.toggle(
                "active",
                link.dataset.page === page
              );
            });

          const titles = {
            dashboard: "Dashboard",
            products: "Products",
            collections: "Collections",
            content: "Website Content",
            faq: "FAQ",
            policies: "Policies"
          };

          const title = $("pageTitle");

          if (title) {
            title.textContent =
              titles[page] || "RZIA’S AURA";
          }

          const sidebar =
            document.querySelector(".admin-sidebar");

          if (
            window.innerWidth <= 900 &&
            sidebar
          ) {
            sidebar.classList.remove("open");
          }
        }

        document
          .querySelectorAll(".sidebar-link")
          .forEach(link => {

            link.addEventListener("click", () => {
              showPage(link.dataset.page);
            });

          });

        const menuBtn = $("mobileMenuBtn");

        if (menuBtn) {
          menuBtn.addEventListener("click", () => {

            const sidebar =
              document.querySelector(".admin-sidebar");

            if (sidebar) {
              sidebar.classList.toggle("open");
            }

          });
        }

        /* -------------------------------
           DASHBOARD
        -------------------------------- */

        function updateDashboard() {

          const total = products.length;

          const active =
            products.filter(p => p.active !== false).length;

          const hidden =
            products.filter(p => p.active === false).length;

          const newArrivals =
            products.filter(p => p.new_arrival === true).length;

          const featured =
            products.filter(p => p.featured === true).length;

          const lowStock =
            products.filter(p => {
              const stock = Number(p.stock || 0);
              return stock > 0 && stock <= 5;
            }).length;

          const values = {
            totalProducts: total,
            activeProducts: active,
            hiddenProducts: hidden,
            newArrivals: newArrivals,
            featuredProducts: featured,
            collections: collections.length,
            lowStock: lowStock
          };

          Object.entries(values).forEach(([id, value]) => {

            const element = $(id);

            if (element) {
              element.textContent = value;
            }

          });
        }

        /* -------------------------------
           LOAD PRODUCTS
        -------------------------------- */

        async function loadProducts() {

          if (!sb) {
            showToast(
              "Supabase configuration not found.",
              "error"
            );
            return;
          }

          try {

            const result = await sb
              .from("products")
              .select("*")
              .order("created_at", {
                ascending: false
              });

            if (result.error) {
              throw result.error;
            }

            products = result.data || [];

            renderProducts();
            updateDashboard();

          } catch (error) {

            console.error(error);

            showToast(
              error.message ||
              "Unable to load products.",
              "error"
            );

          }
        }

        /* -------------------------------
           RENDER PRODUCTS
        -------------------------------- */

        function renderProducts() {

          const container =
            $("productsList");

          if (!container) return;

          if (!products.length) {

            container.innerHTML = `
              <div class="empty-state">
                <h3>No products yet</h3>
                <p>Add your first RZIA’S AURA product.</p>
              </div>
            `;

            return;
          }

          container.innerHTML =
            products.map(product => {

              const images =
                Array.isArray(product.image_urls)
                  ? product.image_urls
                  : [];

              const image =
                images[0] ||
                product.image_url ||
                "";

              const visibility =
                product.active === false
                  ? "Hidden"
                  : "Visible";

              return `
                <article class="admin-product-card">

                  <div class="admin-product-image">

                    ${
                      image
                        ? `<img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(product.name)}"
                          >`
                        : `<div class="no-image">No Image</div>`
                    }

                  </div>

                  <div class="admin-product-info">

                    <div class="product-card-top">

                      <div>

                        ${
                          product.badge
                            ? `<span class="product-badge">
                                ${escapeHtml(product.badge)}
                              </span>`
                            : ""
                        }

                        <h3>
                          ${escapeHtml(product.name)}
                        </h3>

                        <p>
                          ${escapeHtml(product.category || "Uncategorized")}
                        </p>

                      </div>

                      <span class="${
                        product.active === false
                          ? "status-hidden"
                          : "status-visible"
                      }">
                        ${visibility}
                      </span>

                    </div>

                    <div class="product-card-price">
                      ${money(product.price_pkr, "PKR")}
                    </div>

                    <div class="product-card-meta">

                      <span>
                        Stock:
                        ${Number(product.stock || 0)}
                      </span>

                      ${
                        product.new_arrival
                          ? "<span>New Arrival</span>"
                          : ""
                      }

                      ${
                        product.featured
                          ? "<span>Featured</span>"
                          : ""
                      }

                    </div>

                    <div class="admin-product-actions">

                      <button
                        type="button"
                        class="admin-secondary"
                        onclick="editProduct('${product.id}')"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        class="admin-secondary"
                        onclick="toggleProduct('${product.id}')"
                      >
                        ${
                          product.active === false
                            ? "Show"
                            : "Hide"
                        }
                      </button>

                      <button
                        type="button"
                        class="admin-danger"
                        onclick="deleteProduct('${product.id}')"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>
              `;

            }).join("");
        }

        /* -------------------------------
           NEW PRODUCT
        -------------------------------- */

        function resetProductForm() {

          currentProductId = null;
          selectedImages = [];

          [
            "pName",
            "pDescription",
            "pPricePKR",
            "pPriceBDT",
            "pPriceEUR",
            "pStock",
            "pBadge"
          ].forEach(id => {

            const field = $(id);

            if (field) {
              field.value = "";
            }

          });

          [
            "pNewArrival",
            "pFeatured",
            "pBestSeller"
          ].forEach(id => {

            const field = $(id);

            if (field) {
              field.checked = false;
            }

          });

          const active = $("pActive");

          if (active) {
            active.checked = true;
          }

          const preview =
            $("imagePreviewGrid");

          if (preview) {
            preview.innerHTML = "";
          }

          const title =
            $("productEditorTitle");

          if (title) {
            title.textContent = "Add Product";
          }

          setMessage(
            "productMessage",
            ""
          );

          showPage("productEditor");
        }

        const addProductBtn =
          $("addProductBtn");

        if (addProductBtn) {
          addProductBtn.addEventListener(
            "click",
            resetProductForm
          );
        }

        /* -------------------------------
           EDIT PRODUCT
        -------------------------------- */

        window.editProduct = function(id) {

          const product =
            products.find(
              item => String(item.id) === String(id)
            );

          if (!product) return;

          currentProductId = product.id;

          $("pName").value =
            product.name || "";

          $("pDescription").value =
            product.description || "";

          $("pPricePKR").value =
            product.price_pkr || "";

          $("pPriceBDT").value =
            product.price_bdt || "";

          $("pPriceEUR").value =
            product.price_eur || "";

          $("pStock").value =
            product.stock || "";

          $("pBadge").value =
            product.badge || "";

          if ($("pCategory")) {
            $("pCategory").value =
              product.category || "";
          }

          if ($("pSizes")) {
            $("pSizes").value =
              Array.isArray(product.sizes)
                ? product.sizes.join(", ")
                : product.sizes || "";
          }

          if ($("pColors")) {
            $("pColors").value =
              Array.isArray(product.colors)
                ? product.colors.join(", ")
                : product.colors || "";
          }

          $("pNewArrival").checked =
            product.new_arrival === true;

          $("pFeatured").checked =
            product.featured === true;

          $("pBestSeller").checked =
            product.best_seller === true;

          $("pActive").checked =
            product.active !== false;

          selectedImages =
            Array.isArray(product.image_urls)
              ? [...product.image_urls]
              : (
                  product.image_url
                    ? [product.image_url]
                    : []
                );

          renderImagePreviews();

          const title =
            $("productEditorTitle");

          if (title) {
            title.textContent = "Edit Product";
          }

          showPage("productEditor");
        };

        /* -------------------------------
           IMAGE UPLOAD
        -------------------------------- */

        const imageInput =
          $("productImages");

        if (imageInput) {

          imageInput.addEventListener(
            "change",
            async event => {

              const files =
                Array.from(
                  event.target.files || []
                );

              if (!files.length) return;

              if (!sb) {
                showToast(
                  "Supabase is not configured.",
                  "error"
                );
                return;
              }

              const status =
                $("imageUploadStatus");

              if (status) {
                status.textContent =
                  "Uploading images...";
              }

              try {

                for (const file of files) {

                  const extension =
                    file.name
                      .split(".")
                      .pop()
                      .toLowerCase();

                  const fileName =
                    `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}.${extension}`;

                  const path =
                    `products/${fileName}`;

                  const upload =
                    await sb.storage
                      .from("product-images")
                      .upload(
                        path,
                        file,
                        {
                          cacheControl: "3600",
                          upsert: false,
                          contentType: file.type
                        }
                      );

                  if (upload.error) {
                    throw upload.error;
                  }

                  const publicUrl =
                    sb.storage
                      .from("product-images")
                      .getPublicUrl(path)
                      .data
                      .publicUrl;

                  selectedImages.push(
                    publicUrl
                  );
                }

                renderImagePreviews();

                if (status) {
                  status.textContent =
                    "✓ Images uploaded successfully";
                }

              } catch (error) {

                console.error(error);

                if (status) {
                  status.textContent =
                    "Unable to upload image.";
                }

                showToast(
                  error.message ||
                  "Image upload failed.",
                  "error"
                );

              }

              event.target.value = "";

            }
          );
        }

        function renderImagePreviews() {

          const grid =
            $("imagePreviewGrid");

          if (!grid) return;

          if (!selectedImages.length) {

            grid.innerHTML = `
              <div class="empty-image-preview">
                No images uploaded yet.
              </div>
            `;

            return;
          }

          grid.innerHTML =
            selectedImages.map(
              (url, index) => `
                <div class="image-preview">

                  <img
                    src="${escapeHtml(url)}"
                    alt="Product image ${index + 1}"
                  >

                  <div class="image-preview-footer">

                    <span>
                      ${
                        index === 0
                          ? "Main Image"
                          : `Image ${index + 1}`
                      }
                    </span>

                    <button
                      type="button"
                      onclick="removeProductImage(${index})"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              `
            ).join("");
        }

        window.removeProductImage =
          function(index) {

            selectedImages.splice(
              index,
              1
            );

            renderImagePreviews();
          };

        /* -------------------------------
           PRODUCT SAVE
        -------------------------------- */

        const saveProductBtn =
          $("saveProductBtn");

        if (saveProductBtn) {

          saveProductBtn.addEventListener(
            "click",
            saveProduct
          );

        }

        async function saveProduct() {

          if (!sb) {

            showToast(
              "Supabase configuration not found.",
              "error"
            );

            return;
          }

          if (
            saveProductBtn.disabled
          ) {
            return;
          }

          const name =
            $("pName").value.trim();

          if (!name) {

            showToast(
              "Product name is required.",
              "error"
            );

            $("pName").focus();

            return;
          }

          saveProductBtn.disabled = true;
          saveProductBtn.textContent =
            "Saving...";

          try {

            const payload = {

              name,

              description:
                $("pDescription").value.trim(),

              category:
                $("pCategory")
                  ? $("pCategory").value
                  : "",

              price_pkr:
                Number(
                  $("pPricePKR").value || 0
                ),

              price_bdt:
                Number(
                  $("pPriceBDT").value || 0
                ),

              price_eur:
                Number(
                  $("pPriceEUR").value || 0
                ),

              sizes:
                parseList(
                  $("pSizes")
                    ? $("pSizes").value
                    : ""
                ),

              colors:
                parseList(
                  $("pColors")
                    ? $("pColors").value
                    : ""
                ),

              stock:
                Number(
                  $("pStock").value || 0
                ),

              badge:
                $("pBadge").value.trim(),

              new_arrival:
                $("pNewArrival").checked,

              active:
                $("pActive").checked,

              image_url:
                selectedImages[0] || null,

              image_urls:
                selectedImages

            };

            if (
              $("pFeatured")
            ) {
              payload.featured =
                $("pFeatured").checked;
            }

            if (
              $("pBestSeller")
            ) {
              payload.best_seller =
                $("pBestSeller").checked;
            }

            let result;

            if (currentProductId) {

              result =
                await sb
                  .from("products")
                  .update(payload)
                  .eq(
                    "id",
                    currentProductId
                  );

            } else {

              result =
                await sb
                  .from("products")
                  .insert(payload);

            }

            if (result.error) {
              throw result.error;
            }

            showToast(
              currentProductId
                ? "✓ Product updated successfully"
                : "✓ Product added successfully"
            );

            await loadProducts();

            setTimeout(() => {
              showPage("products");
            }, 500);

          } catch (error) {

            console.error(
              "Save product error:",
              error
            );

            showToast(
              error.message ||
              "Unable to save product.",
              "error"
            );

          } finally {

            saveProductBtn.disabled =
              false;

            saveProductBtn.textContent =
              "Save Product";

          }
        }

        /* -------------------------------
           TOGGLE PRODUCT
        -------------------------------- */

        window.toggleProduct =
          async function(id) {

            if (!sb) return;

            const product =
              products.find(
                item =>
                  String(item.id) === String(id)
              );

            if (!product) return;

            try {

              const result =
                await sb
                  .from("products")
                  .update({
                    active:
                      product.active === false
                        ? true
                        : false
                  })
                  .eq(
                    "id",
                    id
                  );

              if (result.error) {
                throw result.error;
              }

              showToast(
                product.active === false
                  ? "Product is now visible."
                  : "Product hidden."
              );

              await loadProducts();

            } catch (error) {

              console.error(error);

              showToast(
                error.message ||
                "Unable to update product.",
                "error"
              );

            }
          };

        /* -------------------------------
           DELETE PRODUCT
        -------------------------------- */

        window.deleteProduct =
          async function(id) {

            if (!sb) return;

            const product =
              products.find(
                item =>
                  String(item.id) === String(id)
              );

            if (!product) return;

            const confirmed =
              confirm(
                `Delete "${product.name}" permanently?`
              );

            if (!confirmed) return;

            try {

              const result =
                await sb
                  .from("products")
                  .delete()
                  .eq(
                    "id",
                    id
                  );

              if (result.error) {
                throw result.error;
              }

              showToast(
                "Product deleted successfully."
              );

              await loadProducts();

            } catch (error) {

              console.error(error);

              showToast(
                error.message ||
                "Unable to delete product.",
                "error"
              );

            }
          };

        /* -------------------------------
           LIVE PRODUCT PREVIEW
        -------------------------------- */

        const previewFields = [
          "pName",
          "pDescription",
          "pPricePKR",
          "pPriceBDT",
          "pPriceEUR",
          "pStock",
          "pBadge"
        ];

        previewFields.forEach(id => {

          const field = $(id);

          if (field) {
            field.addEventListener(
              "input",
              updateProductPreview
            );
          }

        });

        function updateProductPreview() {

          if ($("previewProductName")) {

            $("previewProductName")
              .textContent =
              $("pName").value ||
              "Product Name";

          }

          if ($("previewProductDescription")) {

            $("previewProductDescription")
              .textContent =
              $("pDescription").value ||
              "Product description will appear here.";

          }

          if ($("previewPKR")) {

            $("previewPKR")
              .textContent =
              money(
                $("pPricePKR").value,
                "PKR"
              );

          }

          if ($("previewBDT")) {

            $("previewBDT")
              .textContent =
              money(
                $("pPriceBDT").value,
                "BDT"
              );

          }

          if ($("previewEUR")) {

            $("previewEUR")
              .textContent =
              money(
                $("pPriceEUR").value,
                "EUR"
              );

          }

          if ($("previewStock")) {

            $("previewStock")
              .textContent =
              `Stock: ${
                $("pStock").value || 0
              }`;

          }

          if ($("previewBadge")) {

            $("previewBadge")
              .textContent =
              $("pBadge").value || "";

          }

          if ($("previewCategory")) {

            $("previewCategory")
              .textContent =
              $("pCategory")
                ? (
                    $("pCategory").value ||
                    "Category"
                  )
                : "Category";

          }

          if (
            $("previewProductImage") &&
            selectedImages[0]
          ) {

            $("previewProductImage").src =
              selectedImages[0];

          }

        }

        /* -------------------------------
           CANCEL PRODUCT
        -------------------------------- */

        const cancelProductBtn =
          $("cancelProductBtn");

        if (cancelProductBtn) {

          cancelProductBtn.addEventListener(
            "click",
            () => showPage("products")
          );

        }

        /* -------------------------------
           COLLECTIONS
        -------------------------------- */

        function loadCollections() {

          try {

            collections =
              JSON.parse(
                localStorage.getItem(
                  "rzia_collections"
                ) || "[]"
              );

          } catch {
            collections = [];
          }

          renderCollections();
          updateDashboard();
        }

        function saveCollections() {

          localStorage.setItem(
            "rzia_collections",
            JSON.stringify(collections)
          );

          renderCollections();
          updateDashboard();
        }

        function renderCollections() {

          const grid =
            $("collectionsGrid");

          if (!grid) return;

          if (!collections.length) {

            grid.innerHTML = `
              <div class="empty-state">
                <h3>No collections yet</h3>
                <p>Create your first collection.</p>
              </div>
            `;

            return;
          }

          grid.innerHTML =
            collections.map(collection => `

              <div class="collection-admin-card">

                ${
                  collection.image
                    ? `<img
                        src="${escapeHtml(collection.image)}"
                        alt="${escapeHtml(collection.name)}"
                      >`
                    : ""
                }

                <div class="collection-admin-content">

                  <h3>
                    ${escapeHtml(collection.name)}
                  </h3>

                  <p>
                    ${escapeHtml(
                      collection.description || ""
                    )}
                  </p>

                  <div class="admin-product-actions">

                    <button
                      type="button"
                      class="admin-secondary"
                      onclick="editCollection('${collection.id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="admin-danger"
                      onclick="deleteCollection('${collection.id}')"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            `).join("");
        }

        function openCollectionModal(
          collection = null
        ) {

          currentCollectionId =
            collection
              ? collection.id
              : null;

          $("collectionName").value =
            collection?.name || "";

          $("collectionImage").value =
            collection?.image || "";

          $("collectionDescription").value =
            collection?.description || "";

          $("collectionModalTitle")
            .textContent =
              collection
                ? "Edit Collection"
                : "Add Collection";

          $("collectionModal")
            .classList.remove("hidden");
        }

        function closeCollectionModal() {

          $("collectionModal")
            .classList.add("hidden");

          currentCollectionId = null;
        }

        const addCollectionBtn =
          $("addCollectionBtn");

        if (addCollectionBtn) {

          addCollectionBtn.addEventListener(
            "click",
            () => openCollectionModal()
          );

        }

        $("closeCollectionModal")
          ?.addEventListener(
            "click",
            closeCollectionModal
          );

        $("cancelCollectionBtn")
          ?.addEventListener(
            "click",
            closeCollectionModal
          );

        $("saveCollectionBtn")
          ?.addEventListener(
            "click",
            () => {

              const name =
                $("collectionName")
                  .value.trim();

              if (!name) {

                showToast(
                  "Collection name is required.",
                  "error"
                );

                return;
              }

              const item = {

                id:
                  currentCollectionId ||
                  `collection-${Date.now()}`,

                name,

                image:
                  $("collectionImage")
                    .value.trim(),

                description:
                  $("collectionDescription")
                    .value.trim()

              };

              if (currentCollectionId) {

                collections =
                  collections.map(
                    collection =>
                      collection.id ===
                      currentCollectionId
                        ? item
                        : collection
                  );

              } else {

                collections.push(item);

              }

              saveCollections();
              closeCollectionModal();

              showToast(
                "Collection saved successfully."
              );

            }
          );

        window.editCollection =
          function(id) {

            const collection =
              collections.find(
                item =>
                  String(item.id) === String(id)
              );

            if (collection) {
              openCollectionModal(collection);
            }

          };

        window.deleteCollection =
          function(id) {

            const collection =
              collections.find(
                item =>
                  String(item.id) === String(id)
              );

            if (!collection) return;

            if (
              !confirm(
                `Delete "${collection.name}"?`
              )
            ) {
              return;
            }

            collections =
              collections.filter(
                item =>
                  String(item.id) !== String(id)
              );

            saveCollections();

            showToast(
              "Collection deleted."
            );

          };

        /* -------------------------------
           WEBSITE CONTENT
        -------------------------------- */

        const CONTENT_KEY =
          "rzia_website_content";

        function loadContent() {

          let content = {};

          try {

            content =
              JSON.parse(
                localStorage.getItem(
                  CONTENT_KEY
                ) || "{}"
              );

          } catch {
            content = {};
          }

          const fields = {

            siteBrandName:
              "brand",

            siteAnnouncement:
              "announcement",

            siteHeroHeading:
              "heroHeading",

            siteHeroDescription:
              "heroDescription",

            siteStory:
              "story",

            siteWhatsapp:
              "whatsapp",

            siteEmail:
              "email",

            siteAddress:
              "address",

            siteInstagram:
              "instagram",

            siteFacebook:
              "facebook",

            siteTikTok:
              "tiktok",

            deliveryCharges:
              "deliveryCharges",

            freeDeliveryThreshold:
              "freeDeliveryThreshold"

          };

          Object.entries(fields)
            .forEach(([id, key]) => {

              const field = $(id);

              if (
                field &&
                content[key] !== undefined
              ) {

                field.value =
                  content[key];

              }

            });

        }

        $("saveContentBtn")
          ?.addEventListener(
            "click",
            () => {

              const content = {

                brand:
                  $("siteBrandName").value,

                announcement:
                  $("siteAnnouncement").value,

                heroHeading:
                  $("siteHeroHeading").value,

                heroDescription:
                  $("siteHeroDescription").value,

                story:
                  $("siteStory").value,

                whatsapp:
                  $("siteWhatsapp").value,

                email:
                  $("siteEmail").value,

                address:
                  $("siteAddress").value,

                instagram:
                  $("siteInstagram").value,

                facebook:
                  $("siteFacebook").value,

                tiktok:
                  $("siteTikTok").value,

                deliveryCharges:
                  $("deliveryCharges").value,

                freeDeliveryThreshold:
                  $("freeDeliveryThreshold").value

              };

              localStorage.setItem(
                CONTENT_KEY,
                JSON.stringify(content)
              );

              setMessage(
                "contentMessage",
                "✓ Website content saved successfully."
              );

              showToast(
                "Website content saved."
              );

            }
          );

        /* -------------------------------
           FAQ
        -------------------------------- */

        const FAQ_KEY =
          "rzia_faq";

        let faqs = [];

        function loadFaqs() {

          try {

            faqs =
              JSON.parse(
                localStorage.getItem(
                  FAQ_KEY
                ) || "[]"
              );

          } catch {
            faqs = [];
          }

          renderFaqs();
        }

        function saveFaqs() {

          localStorage.setItem(
            FAQ_KEY,
            JSON.stringify(faqs)
          );

          renderFaqs();
        }

        function renderFaqs() {

          const list =
            $("faqList");

          if (!list) return;

          if (!faqs.length) {

            list.innerHTML = `
              <div class="empty-state">
                <h3>No FAQs yet</h3>
                <p>Add your first frequently asked question.</p>
              </div>
            `;

            return;
          }

          list.innerHTML =
            faqs.map(
              (faq, index) => `

                <div class="faq-admin-item">

                  <div class="faq-admin-number">
                    ${index + 1}
                  </div>

                  <div class="faq-admin-content">

                    <input
                      type="text"
                      value="${escapeHtml(faq.question)}"
                      onchange="updateFaq(${index}, 'question', this.value)"
                      placeholder="Question"
                    >

                    <textarea
                      rows="4"
                      onchange="updateFaq(${index}, 'answer', this.value)"
                      placeholder="Answer"
                    >${escapeHtml(faq.answer)}</textarea>

                  </div>

                  <div class="faq-admin-actions">

                    <button
                      type="button"
                      class="admin-danger"
                      onclick="deleteFaq(${index})"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              `
            ).join("");
        }

        window.updateFaq =
          function(index, key, value) {

            if (!faqs[index]) return;

            faqs[index][key] = value;

            saveFaqs();
          };

        window.deleteFaq =
          function(index) {

            if (
              !confirm(
                "Delete this FAQ?"
              )
            ) {
              return;
            }

            faqs.splice(index, 1);

            saveFaqs();

            showToast(
              "FAQ deleted."
            );

          };

        $("addFaqBtn")
          ?.addEventListener(
            "click",
            () => {

              faqs.push({

                question:
                  "New Question",

                answer:
                  "Write the answer here."

              });

              saveFaqs();

              showToast(
                "FAQ added."
              );

            }
          );

        /* -------------------------------
           POLICIES
        -------------------------------- */

        const POLICY_KEY =
          "rzia_policies";

        function loadPolicies() {

          let policies = {};

          try {

            policies =
              JSON.parse(
                localStorage.getItem(
                  POLICY_KEY
                ) || "{}"
              );

          } catch {
            policies = {};
          }

          if ($("shippingPolicy"))
            $("shippingPolicy").value =
              policies.shipping || "";

          if ($("returnPolicy"))
            $("returnPolicy").value =
              policies.returns || "";

          if ($("privacyPolicy"))
            $("privacyPolicy").value =
              policies.privacy || "";

          if ($("termsPolicy"))
            $("termsPolicy").value =
              policies.terms || "";
        }

        $("savePoliciesBtn")
          ?.addEventListener(
            "click",
            () => {

              const policies = {

                shipping:
                  $("shippingPolicy").value,

                returns:
                  $("returnPolicy").value,

                privacy:
                  $("privacyPolicy").value,

                terms:
                  $("termsPolicy").value

              };

              localStorage.setItem(
                POLICY_KEY,
                JSON.stringify(policies)
              );

              showToast(
                "Policies saved successfully."
              );

            }
          );

        /* -------------------------------
           SEARCH PRODUCTS
        -------------------------------- */

        const productSearch =
          $("productSearch");

        if (productSearch) {

          productSearch.addEventListener(
            "input",
            () => {

              const query =
                productSearch.value
                  .trim()
                  .toLowerCase();

              document
                .querySelectorAll(
                  ".admin-product-card"
                )
                .forEach(card => {

                  card.style.display =
                    card.textContent
                      .toLowerCase()
                      .includes(query)
                        ? ""
                        : "none";

                });

            }
          );

        }

        /* -------------------------------
           LOGOUT
        -------------------------------- */

        $("logoutBtn")
          ?.addEventListener(
            "click",
            async () => {

              if (sb) {
                try {
                  await sb.auth.signOut();
                } catch (error) {
                  console.error(error);
                }
              }

              location.reload();

            }
          );

        /* -------------------------------
           AUTH CHECK
        -------------------------------- */

        async function checkAuth() {

          if (!sb) {

            console.warn(
              "Supabase client not available."
            );

            return;
          }

          try {

            const result =
              await sb.auth.getSession();

            if (
              result.error
            ) {
              console.error(
                result.error
              );
            }

          } catch (error) {

            console.error(
              "Auth check error:",
              error
            );

          }

        }

        /* -------------------------------
           INITIALIZE
        -------------------------------- */

        async function initAdmin() {

          loadCollections();
          loadContent();
          loadFaqs();
          loadPolicies();

          updateProductPreview();

          await checkAuth();
          await loadProducts();

          showPage("dashboard");
        }

                document.addEventListener(
          "DOMContentLoaded",
          initAdmin
        );

      </script>

    </body>
</html>
