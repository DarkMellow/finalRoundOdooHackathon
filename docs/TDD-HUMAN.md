# Developer Navigation & Technical Design Document (TDD)

A high-density navigation blueprint and technical layout for developers working on the Rental Management System MVP.

---

## 1. Executive Overview & Tech Stack

*   **System Goal**: A single-role admin tool designed to prove the core loop: **rent → track → return → settle deposit** within an operational dashboard, with zero customer self-service.
*   **Frontend Stack**: React 19 (TypeScript SPA), Vite (compiler/bundler), Tailwind CSS v4 (inline styling system), Radix UI (accessible primitive foundations), TanStack Query (caching server-state), Zustand (client UI filter stores), and React Router v6.
*   **Backend Stack**: Python 3.11+, FastAPI (REST endpoints & OpenAPI auto-doc), SQLModel (combines SQLAlchemy 2.0 ORM with Pydantic v2 schemas), Alembic (schema migrations), Uvicorn (ASGI runner), and a MySQL/MariaDB relational database.
*   **Security & Auth**: Stateless JWT authentication stored in secure, HttpOnly, SameSite=Strict cookies; CORS origins explicitly whitelisted.

---

## 2. Codebase Directory Map

```
Rental Management System/
├── backend/                        # Python FastAPI Web API Server
│   ├── app/                        # Main application source directory
│   │   ├── core/                   # Engine setup, configs, database session pools, and security handlers
│   │   │   ├── config.py           # Environmental variables loader (via Pydantic Settings)
│   │   │   ├── database.py         # SQLAlchemy engine setup and Db Session generator dependency
│   │   │   └── security.py         # Passlib password hasher and PyJWT session cookie helpers
│   │   └── features/               # Domain-specific modules grouped as vertical feature slices
│   │       ├── auth/               # Login, JWT parsing, and active credentials validation logic
│   │       ├── products/           # Catalog management, rate listings, and inventory tracking logic
│   │       └── rentals/            # Rental bookings, date tracking, return calculations, and dashboard data
│   ├── migrations/                 # Alembic auto-generated database migration history scripts
│   ├── alembic.ini                 # Alembic configuration variables file
│   ├── requirements.txt            # Python production and development dependencies list
│   └── Dockerfile                  # Base Python runner container configuration
├── docs/                           # Central repository specifications, workflows, plans, and technical designs
│   ├── DESIGN.md                   # Visual styling, Notion-inspired colors, and typography guidelines
│   ├── FLOW.md                     # Page-by-page flow, forms, constraints, and modal requirements
│   ├── PLAN.md                     # Parallel development phases, schedule, and team assignments
│   ├── PRD.md                      # Product requirement parameters and MVP scope boundaries
│   ├── SCHEMA.md                   # ERD charts, table columns, indices, and DDL syntax guides
│   ├── TDD.md                      # Comprehensive system architecture design layout
│   └── TRD.md                      # Stack overviews, late-fee formulas, and Docker blueprints
└── frontend/                       # React SPA client application
    ├── public/                     # Static assets served directly (e.g. favicon)
    ├── src/                        # Main React application source folder
    │   ├── assets/                 # SVGs, branding items, and static resources
    │   ├── components/             # Reusable UI components
    │   │   ├── ui/                 # RADIX primitives imported via Shadcn (e.g. Button, Dialog)
    │   │   └── theme-provider.tsx  # Dark-mode context injector
    │   ├── features/               # Encapsulated client feature folders (components, hooks, services) [Planned]
    │   │   ├── auth/               # Login components, auth state mutations
    │   │   ├── dashboard/          # Metric card grids, dashboard table lists
    │   │   ├── products/           # Product tables, catalog add/edit modals
    │   │   └── rentals/            # New rental creation form, detailed rental views, returns modal
    │   ├── pages/                  # Router-mapped container page components [Planned]
    │   ├── services/               # Axios client instance configurations and error interceptors [Planned]
    │   ├── context/                # Sidebar, layout contexts, and temporary UI states [Planned]
    │   ├── lib/                    # Standard styling utilities (clsx/tailwind-merge wrapper)
    │   ├── utils/                  # Pure utility functions (currency/date formatters) [Planned]
    │   ├── App.tsx                 # Main root app layout and routing hook mount
    │   ├── index.css               # CSS file containing Tailwind imports, custom font variables, and design tokens
    │   └── main.tsx                # Mounts React DOM tree to index.html
    ├── package.json                # Front-end packages, scripts, and build definitions
    └── vite.config.ts              # Vite server settings, plugins, and backend API proxies
```

---

## 3. Component & Module Directory

| Component / Module | File Location | Key Responsibility | Dependencies |
| :--- | :--- | :--- | :--- |
| **Auth Feature** | `backend/app/features/auth` | User login verification, JWT token sign/verify, cookie session | `sqlmodel`, `passlib[argon2]`, `pyjwt` |
| **Products Catalog** | `backend/app/features/products` | Manage product catalog entries, quantities, rates, and deposits | `sqlmodel` |
| **Rentals Operations** | `backend/app/features/rentals` | Book rentals, process returns, calculate late fees, update stock | `sqlmodel`, pessimistic locking |
| **Database Pool** | `backend/app/core/database.py` | Create SQLAlchemy engine, session maker, session dependency injection | `sqlmodel`, `pymysql` |
| **Security Helpers** | `backend/app/core/security.py` | Hash passwords (Argon2), sign/decode JWT cookie payloads | `passlib`, `pyjwt` |
| **Main Server Route** | `backend/app/main.py` | Root FastAPI instance setup, global CORS settings, router wiring | `fastapi`, `CORSMiddleware` |
| **LoginForm UI** | `frontend/src/features/auth/components/LoginForm.tsx` | Capture and validate username/password, display local validation errors | `react-hook-form`, `zod` [Planned] |
| **StatCard** | `frontend/src/features/dashboard/components/StatCard.tsx` | Render metric KPI containers with clean mouse hover and active-filter borders | `lucide-react` [Planned] |
| **OperationsTable** | `frontend/src/features/dashboard/components/OperationsTable.tsx` | Render list of rentals with status badges, sorting by due dates, row navigation | `lucide-react`, `ui/table` [Planned] |
| **CreateRentalForm** | `frontend/src/features/rentals/components/CreateRentalForm.tsx` | Admin form to create new bookings, calculate durations and recommend deposits | `react-hook-form`, `date-fns` [Planned] |
| **ReturnRentalModal** | `frontend/src/features/rentals/components/ReturnRentalModal.tsx` | Dialog for marking returned, shows real-time late fee & refund calculation | `ui/dialog`, `date-fns` [Planned] |
| **AppLayout** | `frontend/src/layouts/AppLayout.tsx` | Persisted sidebar shell structure, topbar context page title navigation | `react-router-dom` [Planned] |
| **Zustand Auth Store** | `frontend/src/store/authStore.ts` | Volatile client-side auth state, session caching, logout redirects | `zustand` [Planned] |
| **Axios Base Client** | `frontend/src/services/api.ts` | Centralized Axios configurations, credentials cookies, HTTP 401 interceptors | `axios` [Planned] |
| **Format Helpers** | `frontend/src/utils/format.ts` | Pure functions for printing currency (`Rs. X.XX`) and dates (`DD MMM YYYY`) | Pure JS [Planned] |

---

## 4. Core Feature & Workflow Traces

### Workflow 1: Admin Login
```
[Admin Entry] ──> LoginForm.tsx (Submit)
                     │
                     ▼
                 useLogin.ts (Zustand authStore triggers api request)
                     │
                     ▼
                 api.post('/auth/login') ──> backend/app/features/auth/router.py::login()
                                                 │
                                                 ▼
                                             crud.py::authenticate_admin() ──> [DB lookup & check]
                                                 │
                                                 ▼
                                             JWT Signed ──> Cookie returned (HttpOnly, SameSite=Strict)
                                                 │
                                                 ▼
                                             Client state updated ──> Redirects to /dashboard
```

### Workflow 2: Add Product to Catalog
```
[Admin Action] ──> AddProductModal.tsx (Save Product)
                     │
                     ▼
                 useProducts.ts::useCreateProduct (React Query Mutation)
                     │
                     ▼
                 api.post('/products') ──> backend/app/features/products/router.py::create_product()
                                               │
                                               ▼
                                           crud.py::create_product() ──> SQLModel save
                                               │
                                               ▼
                                           Returns HTTP 201 (Created)
                                               │
                                               ▼
                                           React Query: invalidateQueries(['products'])
                                               │
                                               ▼
                                           ProductTable.tsx automatically refetches & updates list
```

### Workflow 3: Create Rental (Pessimistic Concurrency Lock)
```
[Admin Action] ──> CreateRentalForm.tsx (Submit)
                     │
                     ▼
                 useRentals.ts::useCreateRental (React Query Mutation)
                     │
                     ▼
                 api.post('/rentals') ──> backend/app/features/rentals/router.py::create_rental()
                                               │
                                               ▼
                                           crud.py::execute_create_rental()
                                               │
                                               ├─> Start DB Transaction Block
                                               ├─> SELECT FOR UPDATE product_row (Locks item)
                                               ├─> Assert product.quantity_available > 0
                                               ├─> Decrement product.quantity_available by 1
                                               ├─> Insert Rental record
                                               └─> Commit Transaction (Release Lock)
                                               │
                                               ▼
                                           Returns HTTP 201 (Created)
                                               │
                                               ▼
                                           React Query: invalidateQueries(['rentals', 'dashboard_stats'])
                                               │
                                               ▼
                                           Redirects user to /rentals/:id
```

### Workflow 4: Rental Return & Deposit Settlement
```
[Admin Action] ──> ReturnRentalModal.tsx (Confirm Return)
                     │
                     ▼
                 useRentals.ts::useReturnRental (React Query Mutation)
                     │
                     ▼
                 api.post('/rentals/{id}/return') ──> backend/app/features/rentals/router.py::return_rental()
                                                           │
                                                           ▼
                                                       crud.py::execute_rental_return()
                                                           │
                                                           ├─> Start DB Transaction Block
                                                           ├─> SELECT FOR UPDATE rental_row & product_row
                                                           ├─> Compute late days: ActualReturnDate - DueDate
                                                           ├─> Compute late fee: LateDays * DailyRate
                                                           ├─> Apply cap: late_fee = min(late_fee, deposit)
                                                           ├─> Compute refund: refund = deposit - late_fee
                                                           ├─> Increment product.quantity_available by 1
                                                           ├─> Save settled columns & timestamp
                                                           └─> Commit Transaction (Release Lock)
                                                           │
                                                           ▼
                                                       Returns HTTP 200 (OK)
                                                           │
                                                           ▼
                                                       React Query: invalidateQueries(['rental', id])
                                                           │
                                                           ▼
                                                       RentalDetailPage.tsx shifts to read-only Completed View
```

---

## 5. State & Data Flow Cheatsheet

### 5.1 Client States (Zustand & Local React State)
*   `useAuthStore` (`frontend/src/store/authStore.ts`): Holds logged-in state `isAuthenticated` (boolean) and `user` profile data (username) retrieved from `/api/auth/me` on startup.
*   `useUiStore` (`frontend/src/store/uiStore.ts`): Houses volatile layout states like `sidebarCollapsed` (boolean) and active table filters (e.g. `FilterType = 'All' | 'Active' | 'Due Today' | 'Overdue' | 'Completed'`).
*   **Component Local States**: Uses standard React `useState` for search string, validation errors, and toggle flags (e.g. `isModalOpen`).

### 5.2 Server States (TanStack Query Caches)
Data from FastAPI endpoints are stored globally and synchronized using query keys:
*   `['dashboard_stats']`: Operations numbers for KPI cards. Refetched every 10 seconds.
*   `['products']`: Active catalog array. Invalidated on product create/edit/delete mutations.
*   `['rentals']`: List of bookings. Invalidated on rental creation or return mutations.
*   `['rental', id]`: Specific details for a single rental booking.

### 5.3 Database & DTO Schemas (SQLModel / Pydantic)
*   **Admin Entity**: Table `admins`
    *   `id: Optional[int] = Field(default=None, primary_key=True)`
    *   `username: str = Field(index=True, unique=True, nullable=False)`
    *   `password_hash: str = Field(nullable=False)`
*   **Product Entity**: Table `products`
    *   `id: Optional[int] = Field(default=None, primary_key=True)`
    *   `name: str = Field(max_length=100, index=True, nullable=False)`
    *   `daily_rate: Decimal = Field(default=0.0, max_digits=10, decimal_places=2)`
    *   `deposit_amount: Decimal = Field(default=0.0, max_digits=10, decimal_places=2)`
    *   `quantity_available: int = Field(default=0)`
*   **Rental Entity**: Table `rentals`
    *   `id: Optional[int] = Field(default=None, primary_key=True)`
    *   `product_id: int = Field(foreign_key="products.id", nullable=False)`
    *   `customer_name: str = Field(max_length=100, index=True, nullable=False)`
    *   `customer_phone: str = Field(max_length=20, index=True, nullable=False)`
    *   `start_date: date = Field(nullable=False)`
    *   `due_date: date = Field(index=True, nullable=False)`
    *   `deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)`
    *   `actual_return_date: Optional[date] = Field(default=None, nullable=True)`
    *   `late_fee_charged: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)`
    *   `deposit_refunded: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)`
    *   `settled_at: Optional[datetime] = Field(default=None, index=True, nullable=True)`

---

## 6. Developer Quick-Start & Key Configs

### 6.1 Essential Scripts

#### Backend (FastAPI + SQLModel)
*   **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
*   **Execute schema migrations**:
    ```bash
    alembic upgrade head
    ```
*   **Launch local hot-reloaded API server**:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

#### Frontend (React + Vite)
*   **Install dependencies**:
    ```bash
    pnpm install
    ```
*   **Start local development server**:
    ```bash
    pnpm dev
    ```
*   **Compile TypeScript and build production assets**:
    ```bash
    pnpm build
    ```
*   **Run linter check**:
    ```bash
    pnpm lint
    ```
*   **Apply automatic prettier formatting**:
    ```bash
    pnpm format
    ```

### 6.2 Key Configuration Files

*   `backend/alembic.ini`: Setup for Alembic database connection strings and migration locations.
*   `backend/app/core/config.py`: Centralized environmental configuration loader using Pydantic Settings (`.env` file parsing).
*   `frontend/vite.config.ts`: Handles compilation plugins (e.g. React & Tailwind v4) and redirects `/api/*` traffic to local backend port `8000`.
*   `frontend/components.json`: Configuration for automated Shadcn UI components installation.
*   `frontend/src/index.css`: Styling configurations: Tailwind imports, fonts definitions, and design variables mapping colors.
