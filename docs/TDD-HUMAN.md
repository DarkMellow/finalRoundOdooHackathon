# Developer Navigation & Technical Design Document (TDD-HUMAN)

A high-density navigation blueprint and technical layout for developers working on the dual-surface (Client Portal + Admin Backend) Rental Management System.

---

## 1. Executive Overview & Tech Stack

*   **System Goal**: A dual-surface application (Client Portal & Admin Backend) managing the rental cycle: catalog browsing, checkout (delivery/pickup), payment, pickup scheduling, condition checklists, returns, and deposit settles.
*   **Frontend Stack**: React 19 (TypeScript SPA), Vite, Tailwind CSS v4, Radix UI, TanStack Query, Zustand, and React Router v6.
*   **Backend Stack**: Python 3.11+, FastAPI, SQLModel (SQLAlchemy 2.0 ORM + Pydantic v2 validation), Alembic, Uvicorn, and a MySQL/MariaDB database.
*   **Security & Auth**: Stateless JWT authentication stored in secure, HttpOnly, SameSite=Strict cookies; CORS whitelisting; separate cookies for Clients (`client_session`) and Admins (`admin_session`).

---

## 2. Codebase Directory Map

```
Rental Management System/
├── backend/                        # Python FastAPI Web API Server
│   ├── app/                        # Main application source directory
│   │   ├── core/                   # Shared configurations & handlers
│   │   │   ├── config.py           # Environmental variables loader (BaseSettings)
│   │   │   ├── database.py         # SQLAlchemy engine setup & dependency session injector
│   │   │   └── security.py         # Password bcrypt hashes & JWT cookie handlers
│   │   └── features/               # Vertical slice modules
│   │       ├── auth/               # Credentials registration & token signing
│   │       ├── catalog/            # Products, variants, pricelists, periods CRUD
│   │       ├── quotations/         # Walk-in quotation templates & creator
│   │       ├── orders/             # Cart checkouts, client order history, invoices
│   │       └── operations/         # Pickups, returns, late-fee math, dashboard widgets
│   ├── migrations/                 # Alembic auto-generated schema history scripts
│   ├── alembic.ini                 # Alembic configurations
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # API container file
├── docs/                           # Specifications & guidelines
│   ├── DESIGN.md                   # Notion-inspired styling rules
│   ├── FLOW.md                     # Page-by-page specs, forms, & modals
│   ├── PLAN.md                     # Phase breakdowns and assignments
│   ├── PRD.md                      # Product MVP boundaries
│   ├── SCHEMA.md                   # ERD and DDL MySQL mappings
│   ├── TDD.md                      # Comprehensive architecture design
│   ├── TDD-HUMAN.md                # Developer blueprints
│   └── TRD.md                      # Technical specifications
└── frontend/                       # React SPA client application
    ├── public/                     # Static assets
    ├── src/                        # Main React source folder
    │   ├── assets/                 # SVGs, branding items
    │   ├── components/             # Reusable UI components
    │   │   └── ui/                 # Radix primitives (Button, Input, Table)
    │   ├── features/               # Encapsulated client feature folders
    │   │   ├── auth/               # Login & Registration panels
    │   │   ├── catalog/            # Browse grids, variant selectors, period pickers
    │   │   ├── orders/             # Shopping cart, checkouts, user order histories
    │   │   ├── quotations/         # Quotation creators & tables
    │   │   └── operations/         # Pickups, returns, checklists, rules settings
    │   ├── layouts/                # Portal & Backend layouts
    │   ├── pages/                  # Route level container components
    │   ├── services/               # Axios clients & interceptors
    │   ├── store/                  # Zustand stores
    │   ├── utils/                  # Currency & date format utilities
    │   ├── App.tsx                 # Main root app layout & routing definitions
    │   ├── index.css               # Core styling tokens & variables
    │   └── main.tsx
    ├── package.json                # Frontend packages
    └── vite.config.ts              # Vite configurations & proxies
```

---

## 3. Component & Module Directory

| Component / Module | File Location | Key Responsibility | Dependencies |
| :--- | :--- | :--- | :--- |
| **Auth Feature** | `backend/app/features/auth` | Signups, logins, JWT cookie delivery, role verification | `sqlmodel`, `passlib[argon2]`, `pyjwt` |
| **Catalog Feature** | `backend/app/features/catalog` | Product variants, pricelists, custom rental periods CRUD | `sqlmodel` |
| **Orders Feature** | `backend/app/features/orders` | Checkout reservation transactions, user orders list, invoices | `sqlmodel` |
| **Operations Feature** | `backend/app/features/operations` | Confirming pickups/returns, late fee calculations, ledger updates | `sqlmodel`, pessimistic locking |
| **Database Pool** | `backend/app/core/database.py` | Create SQLAlchemy engine, session generator dependency | `sqlmodel`, `pymysql` |
| **LoginForm UI** | `frontend/src/features/auth/components/LoginForm.tsx` | Secure login form card, password view toggle, field validations | `react`, `tailwind` |
| **ProductCard** | `frontend/src/features/catalog/components/ProductCard.tsx` | Render single catalog item preview, title, price, CTA | `tailwind` |
| **PeriodPicker** | `frontend/src/features/catalog/components/PeriodPicker.tsx` | Date picker validating dates, shows duration & rate previews | `date-fns` |
| **CartList** | `frontend/src/features/orders/components/CartList.tsx` | Cart selections list, line modifications, checkout CTAs | `zustand` |
| **FulfillmentForm** | `frontend/src/features/orders/components/FulfillmentForm.tsx` | Selection form between delivery (address details) and store pick | `react` |
| **PaymentForm** | `frontend/src/features/orders/components/PaymentForm.tsx` | Secure card details submission form displaying final totals | `react` |
| **StatCard** | `frontend/src/features/dashboard/components/StatCard.tsx` | Render dashboard summary widget, support active filter triggers | `lucide-react` |
| **ReturnChecklistModal**| `frontend/src/features/operations/components/ReturnChecklistModal.tsx` | Process return checkboxes, inspections logs, dynamic late calculation | `date-fns`, `ui/dialog` |
| **ClientLayout** | `frontend/src/layouts/ClientLayout.tsx` | Header bar, profile dropdown, cart item counts | `react-router-dom` |
| **AdminLayout** | `frontend/src/layouts/AdminLayout.tsx` | Left side navigation menu, admin details, logout indicators | `react-router-dom` |

---

## 4. Core Feature & Workflow Traces

### Workflow 1: Client Signup & Profile Creation
```
[Client Input] ──> SignupForm.tsx (Submit)
                      │
                      ▼
                  Signup API call ──> backend/app/features/auth/router.py::register()
                                           │
                                           ▼
                                       crud.py::create_user() ──> [DB Insert users table]
                                           │
                                           ▼
                                       Client registration success ──> Redirects client to Browse
```

### Workflow 2: Client Cart Checkout (Order Reservation)
```
[Client Action] ──> PaymentForm.tsx (Submit Order)
                      │
                      ▼
                  api.post('/orders') ──> backend/app/features/orders/router.py::create_order()
                                               │
                                               ▼
                                           crud.py::execute_checkout()
                                               │
                                               ├─> Start DB Transaction
                                               ├─> Lock product/variant inventories (SELECT FOR UPDATE)
                                               ├─> Assert available quantity > 0
                                               ├─> Decrement product/variant availability counters
                                               ├─> Insert Order, OrderItems, Invoice, & Ledger entries
                                               └─> Commit Transaction (Release Lock)
                                               │
                                               ▼
                                           Returns HTTP 201 Created, redirects to /checkout/success/:id
```

### Workflow 3: Admin walk-in quotation confirmation
```
[Admin Action] ──> QuotationDetail.tsx (Confirm Quotation)
                      │
                      ▼
                  api.post('/quotations/{id}/confirm') ──> backend/app/features/quotations/router.py::confirm()
                                                               │
                                                               ▼
                                                           crud.py::execute_quotation_confirm()
                                                               │
                                                               ├─> Lock inventories (SELECT FOR UPDATE)
                                                               ├─> Create Order from Quoted items
                                                               ├─> Create Invoice & collect payment details
                                                               ├─> Set Quotation status CONFIRMED
                                                               └─> Commit Transaction
                                                               │
                                                               ▼
                                                           Returns HTTP 200 OK, redirects to /orders/:id
```

### Workflow 4: Settle return and dynamic late calculations
```
[Admin Action] ──> ReturnChecklistModal.tsx (Confirm Return)
                      │
                      ▼
                  api.post('/orders/{id}/return') ──> backend/app/features/operations/router.py::return_order()
                                                           │
                                                           ▼
                                                       crud.py::execute_order_return()
                                                           │
                                                           ├─> Start Transaction & lock OrderItem / Product rows
                                                           ├─> Calculate duration late vs. grace period days
                                                           ├─> Compute late fee per late-unit rate (hourly/daily)
                                                           ├─> Deduct penalty from deposit amount
                                                           ├─> Settle refund cash (or create penalty invoice)
                                                           ├─> Increment inventory count (+1)
                                                           └─> Commit Transaction
                                                           │
                                                           ▼
                                                       Returns HTTP 200 OK, details updated in UI
```

---

## 5. State & Data Flow Cheatsheet

### 5.1 Client Stores (Zustand)
*   `useAuthStore`: Holds active logins `isAuthenticated`, `currentUser` profiles (email, name, role), and auth checks from `/api/auth/me`.
*   `useCartStore`: Holds array of selected cart items (products, variants, rental periods, date ranges, computed rates, and deposit totals).

### 5.2 Server Stores (TanStack Query)
Data queries mapped by keys:
*   `['dashboard_stats']`: Dashboard counter metrics.
*   `['products']` & `['product_variants']`: Active products, stock numbers, configurations.
*   `['orders']` & `['order', id]`: Rental orders details, pickup/return checklists, payment status.
*   `['quotations']`: In-store walk-in files.

---

## 6. Developer Quick-Start & Key Configs

### 6.1 Essential Scripts

#### Backend
*   **Install dependencies**: `pip install -r requirements.txt`
*   **Execute schema migrations**: `alembic upgrade head`
*   **Launch development hot-reloads API server**: `uvicorn app.main:app --reload --port 8000`

#### Frontend
*   **Install dependencies**: `npm install`
*   **Start local development server**: `npm run dev`
*   **Compile TypeScript and build production assets**: `npm run build`
*   **Run linter checking**: `npm run lint`
*   **Apply automatic prettier formatting**: `npm run format`

### 6.2 Key Configurations

*   `backend/alembic.ini`: Setup for Alembic database connection strings and migration locations.
*   `backend/app/core/config.py`: Configuration variables loaded from `.env` (DATABASE_URL configures connection to MySQL/MariaDB database).
*   `frontend/vite.config.ts`: Handles compilation plugins (Tailwind v4) and proxies `/api/*` traffic to API port `8000`.
