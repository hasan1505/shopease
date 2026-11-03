# 🛒 ShopEase — Full-Stack E-Commerce (Next.js Only + MongoDB)

A complete e-commerce platform built **entirely with Next.js** — the storefront, the admin panel, **and the API** (Next.js App Router API routes) live in one app at the repository root. **No separate backend server.** Data is stored in MongoDB.

![ShopEase](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop)

---

## ✨ Features

### 🛍️ Storefront
- **Homepage** — Hero banner, category grid, featured & trending products, newsletter
- **Product Catalog** — Full-text search, category filter, sort (price, rating, newest), pagination
- **Product Detail** — Image gallery, rating, stock status, quantity selector, related products
- **Shopping Cart** — Persistent (survives reload), real-time totals, free-shipping progress
- **Wishlist** — Save & manage favorite products
- **Checkout** — Multi-step: Shipping → Payment → Review → Order Confirmation
- **My Orders** — Order history with status timeline

### 🔐 Authentication
- JWT-based login & registration (Bearer tokens)
- Protected routes (profile, checkout, orders) and admin role guard

### 🛠️ Admin Dashboard (`/admin`)
- Statistics: revenue, orders, products, customers + recent orders
- Product management: create, edit, delete (with confirm)
- Order management: status updates (stock auto-restored on cancellation)
- Customer listing

### ⚙️ API (Next.js Route Handlers — `app/api/**`)
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | user |
| PUT | `/api/users/profile` | user |
| GET | `/api/products` | public (search, category, sort, page, limit, minPrice, maxPrice) |
| GET | `/api/products/featured` · `/api/products/trending` | public |
| GET/PUT/DELETE | `/api/products/:id` | public / admin / admin |
| POST | `/api/products` | admin |
| GET | `/api/categories` | public |
| POST | `/api/categories` · DELETE `/api/categories/:id` | admin |
| POST | `/api/orders` | user (validates & decrements stock) |
| GET | `/api/orders/my` | user |
| GET | `/api/orders` | admin |
| PUT | `/api/orders/:id/status` | admin |
| GET | `/api/admin/stats` · `/api/admin/users` | admin |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** — local ([Community Server](https://www.mongodb.com/try/download/community)) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Install & configure

```bash
npm install
cp .env.local.example .env.local   # then edit MONGODB_URI + JWT_SECRET
```

### 2. Seed demo data (6 categories, 24 products, 2 accounts)

```bash
npm run seed
```

- **Admin**: `admin@shopease.com` / `admin123`
- **Customer**: `user@shopease.com` / `user123`

### 3. Run

```bash
npm run dev        # → http://localhost:3000
```

The API is served by the same app at `http://localhost:3000/api/...` — nothing else to start.

---

## 📁 Project Structure

```
shopease/                    (repository root — the whole Next.js app)
├── app/
│   ├── (auth)/              # Login, Register
│   ├── (shop)/              # Home, Products, Cart, Wishlist, Checkout, Orders
│   ├── admin/               # Dashboard, Products, Orders, Customers
│   └── api/                 # ← The whole backend lives here
│       ├── auth/            # register, login, me
│       ├── products/        # list/create, [id], featured, trending
│       ├── categories/      # list/create, [id]
│       ├── orders/          # create, my, [id]/status
│       └── admin/           # stats, users
├── lib/
│   ├── models/              # Mongoose models (User, Product, Category, Order)
│   ├── mongodb.ts           # Cached DB connection (serverless-friendly)
│   ├── auth-utils.ts        # JWT sign/verify + request auth helper
│   └── api.ts, services.ts
├── contexts/                # Auth, Cart, Wishlist (localStorage-persisted)
├── components/              # Navbar, Footer, ProductCard, …
├── scripts/seed.mjs         # Demo data seeder
└── public/
```

---

## 📦 Environment Variables (`.env.local`)

```env
MONGODB_URI=mongodb://localhost:27017/shopease
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_NAME=ShopEase
```

---

## 🚢 Deploying to Vercel

1. Push this repo to GitHub
2. In Vercel: **Import Project** — the app is at the repo root, so **no Root Directory setting is needed**
3. Add environment variables (Settings → Environment Variables):
   - `MONGODB_URI` = your **MongoDB Atlas** connection string (free tier works)
   - `JWT_SECRET` = a long random string
   - `JWT_EXPIRES_IN` = `7d`
4. Deploy — `next build` runs automatically; API routes deploy as serverless functions (Node.js runtime)
5. Seed your Atlas database once from your machine:
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run seed
   ```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, lucide-react |
| API | Next.js Route Handlers |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| State | React Context (Auth/Cart/Wishlist persisted to localStorage) |
