# EasyRental - Equipment & Goods Rental Marketplace Platform

A modern, full-stack rental marketplace platform that connects equipment & goods vendors with customers. Built with **React 19**, **Vite**, **TypeScript**, **TailwindCSS**, **FastAPI**, **SQLAlchemy**, and **MySQL**.

---

## 🌟 Features

### 🛍️ Customer Portal
- **Interactive Catalog**: Real-time search, category filtering, and tag classification (`Computers`, `Gaming`, `Electronics`, `Furniture`, `Audio`, `Photography`, `Tools & Equipment`, etc.).
- **Product Expansion View**: High-resolution image galleries, variant tier selections, specifications, tags, and feature tokens.
- **Cart & Checkout**: Multi-item cart management, hourly/daily rental rate calculations, delivery address management, and order placement.
- **Wishlist & Orders**: Wishlist item persistence and full customer rental order history.

### 🏢 Vendor Console
- **Product Management**: Full CRUD for equipment listings, variant management, hourly/daily rate setting, and stock tracking.
- **Pricelist & Discount Rules**: Product-specific and store-global campaign discounts with start/end date ranges.
- **Promo Codes**: Create and track vendor promotional discount codes (`max_uses`, active status, usage counters).
- **Store Analytics & Targets**: Monthly revenue targets, sales performance metrics, and order fulfillment management.

### 🛡️ Admin Dashboard
- **System Metrics**: High-level platform statistics, active vendor counts, total customer orders, and catalog volume.
- **Vendor Verification**: Verify vendor profiles and monitor active listings.

### 🎲 Database Seeder
- **Deterministic Dummy Data**: `seed_data.py` script to generate realistic admin, vendor, customer, product, pricelist, promo code, and order records.
- **Enhanced Image Variety**: Category-aware Lorem Picsum seed URLs generating multi-image gallery sets and variant-specific assets.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) + Lucide Icons |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) |
| **Database ORM** | [SQLAlchemy](https://www.sqlalchemy.org/) + [Alembic](https://alembic.sqlalchemy.org/) |
| **Database Engine** | MySQL (via `pymysql`) |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) |

---

## 📁 Directory Structure

```
Rental/
├── backend/
│   ├── alembic/                # Database migrations
│   ├── auth_utils.py           # Password hashing & authentication helpers
│   ├── config.py               # Application settings & environment variables
│   ├── database.py             # SQLAlchemy engine & session setup
│   ├── main.py                 # FastAPI application routes & endpoints
│   ├── models.py               # SQLAlchemy ORM models
│   ├── requirements.txt        # Python backend dependencies
│   ├── schemas.py              # Pydantic request/response schemas
│   └── seed_data.py            # Local MySQL database seeder script
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components & navigation
│   │   ├── hooks/              # Custom React hooks (debounce, prefetch, etc.)
│   │   ├── lib/                # API client modules & helpers
│   │   ├── pages/              # Page views (Catalog, Vendor Dashboard, Admin, etc.)
│   │   ├── App.tsx             # Application router & routes
│   │   └── main.tsx            # Entry point
│   ├── package.json            # Node.js dependencies & scripts
│   └── vite.config.ts          # Vite configuration
└── docs/                       # Project documentation & design system
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher) & **pnpm** (or `npm`)
- **Python** (v3.10 or higher) & `pip`
- **MySQL Server** (running locally on port 3306)

---

### 1️⃣ Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   pip install faker pymysql
   ```

4. Configure Environment Variables (or create a `.env` file in `backend/`):
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=easy-rental
   ```

5. Seed the Database:
   ```bash
   python seed_data.py --wipe
   ```

6. Start the FastAPI Development Server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *FastAPI Interactive Docs will be available at: `http://127.0.0.1:8000/docs`*

---

### 2️⃣ Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the Vite Development Server:
   ```bash
   pnpm dev
   ```
   *Frontend application will be running at: `http://localhost:5173`*

---

## 🔑 Default Test Credentials

After running `python seed_data.py --wipe`, use the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@easyrental.com` | `Admin@EasyRental2026` |
| **Vendor** | `vendor1@comcast.net` *(or any vendorN@ email)* | `Vendor@123` |
| **Customer** | `customer1@gmail.com` *(or any customerN@ email)* | `Customer@123` |

---

## 📊 Database Seeder Options

Customize seed data volume using flags:

```bash
# Seed 500 products, 200 customers, and 40 vendors
python seed_data.py --products 500 --customers 200 --vendors 40

# Reproducible dataset with a fixed seed
python seed_data.py --seed 42
```

---

## 📄 License

Distributed under the MIT License.
