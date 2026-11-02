# 🛒 ShopEase — Modern Full-Stack E-Commerce Platform

A complete, production-quality e-commerce website built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Node.js**, **Express**, and **MongoDB**.

![ShopEase](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop)

---

## ✨ Features

### 🛍️ Storefront
- **Homepage** — Hero banner, category grid, featured & trending products, newsletter
- **Product Catalog** — Full-text search, category filter, sort (price, rating, newest), pagination
- **Product Detail** — Image gallery, rating, stock status, quantity selector, related products
- **Shopping Cart** — Persistent, real-time totals, free-shipping progress bar
- **Wishlist** — Save & manage favorite products
- **Checkout** — Multi-step: Shipping → Payment → Review → Order Confirmation
- **Responsive** — Mobile-first, works on all screen sizes

### 🔐 Authentication
- JWT-based login & registration
- Protected routes (profile, checkout)
- Admin role guard
- Persistent sessions via localStorage

### 🛠️ Admin Dashboard
- Dashboard statistics (revenue, orders, products, users)
- Product management (create, edit, delete)
- Order management with status updates
- Customer listing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**

### 1. Clone & Setup

```bash
git clone <your-repo>
cd ecommerce
```

### 2. Frontend Setup

```bash
cd my-next-app
npm install
cp .env.local.example .env.local    # Edit NEXT_PUBLIC_API_URL if needed
npm run dev                          # → http://localhost:3000
```

### 3. Backend Setup

```bash
cd ../backend
npm install
cp .env.example .env                 # Edit MONGODB_URI & JWT_SECRET
npm run dev                          # → http://localhost:5001
```

> **Note:** The default port is **5001** because macOS Monterey+ reserves port 5000 for
> AirPlay Receiver (`ControlCenter`). If you change it, update `PORT` in `backend/.env`
> and `NEXT_PUBLIC_API_URL` in `my-next-app/.env.local` to match.

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **6 categories** (Electronics, Fashion, Home & Kitchen, Books, Sports, Beauty)
- **24 products** with real images, ratings, and pricing
- **Admin account**: `admin@shopease.com` / `admin123`
- **User account**: `user@shopease.com` / `user123`

---

## 📁 Project Structure

```
ecommerce/
├── my-next-app/              # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/           # Login, Register pages
│   │   ├── (shop)/           # Homepage, Products, Cart, Wishlist, Checkout
│   │   ├── admin/            # Admin Dashboard, Products, Orders
│   │   └── profile/          # User profile page
│   ├── components/           # Shared UI components
│   ├── contexts/             # React Context (Auth, Cart, Wishlist)
│   ├── lib/                  # API client, services, utils, constants
│   └── types/                # TypeScript interfaces
│
└── backend/                  # Express REST API
    └── src/
        ├── controllers/      # Business logic
        ├── middleware/        # Auth guard, error handler
        ├── models/           # MongoDB schemas
        ├── routes/           # Express routers
        ├── utils/            # JWT helper
        ├── app.ts            # Express app
        ├── server.ts         # Entry point
        └── seed.ts           # DB seed script
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/products` | — | List products (search/filter/sort/page) |
| GET | `/api/products/featured` | — | Featured products |
| GET | `/api/products/trending` | — | Trending products |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | All categories with product counts |
| POST | `/api/orders` | JWT | Place order |
| GET | `/api/orders/my` | JWT | My orders |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/users/profile` | JWT | Update profile |

---

## 🎨 Design System

- **Colors**: Clean white + vibrant green (`#16a34a`) accent
- **Typography**: Inter (Google Fonts)
- **Components**: Cards with hover lift, glassmorphism navbar, skeleton loaders
- **Animations**: Fade-in-up, shimmer skeletons, smooth transitions

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Toasts | React Hot Toast |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| State Management | React Context API |
| Persistence | localStorage (Cart, Wishlist, Auth) |

---

## 📦 Environment Variables

### Frontend (`my-next-app/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=ShopEase
```

### Backend (`backend/.env`)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/shopease
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🚢 Running in Production

### Frontend
```bash
cd my-next-app
npm run build
npm start
```

### Backend
```bash
cd backend
npm run build
npm start
```

---

## 📝 Notes

- The frontend works **without the backend** — all UI is functional, and gracefully falls back with empty states when the API is unavailable.
- Cart and Wishlist are persisted to `localStorage` — they survive page refreshes.
- The admin panel redirects to login if you're not authenticated as an admin.
