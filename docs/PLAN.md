# Multi-Developer Team Implementation Plan — Rental Management System MVP

This document outlines the engineering plan, team distribution, Git workflow, and phase-by-phase execution timeline for a **6-hour build** of the Rental Management System MVP.

Refer to the project's foundational documents for details:
*   [PRD.md](PRD.md) — Product Scope and Core Features
*   [TRD.md](TRD.md) — Technical Stack, Schemas, and Pessimistic Locking
*   [DESIGN.md](DESIGN.md) — Notion-Inspired Design System, Colors, and Typography
*   [FLOW.md](FLOW.md) — Navigation and Screen-by-Screen Flow Specifications

---

## 1. Team Structure & Work Allocation

The team consists of three developers with specialized roles and explicit front-end work ratios:

| Developer | Assigned Roles | Core Domain | Front-End Work Ratio | Estimated Frontend Effort |
| :--- | :--- | :--- | :--- | :--- |
| **Aditya** | Full-Stack Developer & Backend Lead | 100% Backend Architecture, Auth API, and Database Layer. Frontend Service Layer & API integration client. | **2/8 (25%)** | 2 hours |
| **Ankan** | Lead Frontend Developer | Core Layouts, Routing, Styling, and major UI screens (Dashboard, Rentals Catalog, Rental Details). | **5/8 (62.5%)** | 5 hours |
| **Ayaan** | UI Developer / Frontend Support | Login screen UI, Modals (Add/Edit Product, Return Settlement, Confirm Delete). | **1/8 (12.5%)** | 1 hour |

### Team Resource Distribution:
*   **Total Project Duration:** 6 Hours
*   **Aditya:** 6 hours Backend + 2 hours equivalent of Frontend integration tasks.
*   **Ankan:** 6 hours dedicated to Frontend UI structure and core screen rendering.
*   **Ayaan:** 6 hours dedicated to Frontend UI components, validation states, and modal overlays.

---

## 2. High-Level Project Timeline (6-Hour Build)

To prevent code integration bottlenecks and maintain parallel progress, the timeline is divided into 4 execution phases of **1.5 hours each**:

| Phase | Duration | Aditya (Backend + 25% FE) | Ankan (62.5% FE) | Ayaan (12.5% FE) |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Setup & Foundations** | Hour 0.0 – 1.5 | DB Schema & Auth API Setup | App Layouts & Page Routing | Login UI Screen |
| **Phase 2: Product Catalog** | Hour 1.5 – 3.0 | Product CRUD API & Services | Products Catalog Screen | Product CRUD Modals |
| **Phase 3: Rental Flow** | Hour 3.0 – 4.5 | Rentals CRUD API & Services | New Rental Form & Details | Return Settlement Modal |
| **Phase 4: Operations & Polish** | Hour 4.5 – 6.0 | Pessimistic Lock & Stats API | Dashboard UI & Stats Connect | Responsive Audit & Polish |

---

## 3. Detailed Execution Phases

### Phase 1: Setup & Foundations (Hour 0.0 – Hour 1.5)
**Goal:** Initialize databases, configure security, set up navigation layout structure, routing, and basic login screens.

#### Git Feature Branches
*   **Aditya:** `feature/db-auth-setup`
*   **Ankan:** `feature/fe-layout-routing`
*   **Ayaan:** `feature/fe-login-ui`

#### Parallel Tasks & Workstreams
*   **Aditya (Backend & Setup):**
    *   Initialize MySQL / MariaDB connection pool and model database tables (`admins`, `products`, `rentals`) using SQLModel.
    *   Set up Alembic migrations and write initial schema migrations.
    *   Implement stateless JWT creation, password hashing (bcrypt), and cookie-delivery logic in [security.py](../backend/app/core/security.py).
    *   Create base endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
*   **Ankan (Frontend Core Layout):**
    *   Configure Vite configuration, Tailwind CSS variables, and import Inter/Outfit fonts in [index.css](../frontend/src/index.css) using design specs from [DESIGN.md](DESIGN.md).
    *   Initialize React Router v6 structure with path routing rules: `/login` (public), `/dashboard` (protected), `/products` (protected), `/rentals` (protected).
    *   Build persistent left sidebar (`AppLayout` shell) with admin details and a responsive top header.
*   **Ayaan (Login UI):**
    *   Create static UI for the `/login` screen (centered form card, paper-soft canvas, inputs for username and password).
    *   Include visibility toggle icon for password and inline error validation states (required checks).

#### Integration Checkpoint & Merge Plan (At Hour 1.5)
1.  **Ayaan** merges `feature/fe-login-ui` into Ankan's branch `feature/fe-layout-routing` after code review.
2.  **Aditya** verifies auth endpoints run correctly and deploys backend locally.
3.  **Ankan** merges `feature/fe-layout-routing` into the integration branch `develop`.
4.  **Aditya** pulls `develop`, hooks up the frontend cookie auth store (`Zustand`) to `/api/auth/login` and `/api/auth/me`. Verify user can login, see sidebar, and refresh page while retaining session.

---

### Phase 2: Product Catalog & Catalog Modals (Hour 1.5 – Hour 3.0)
**Goal:** Build product catalog administration tools including product lists, add modals, edit modals, and soft-delete restrictions.

#### Git Feature Branches
*   **Aditya:** `feature/api-products`
*   **Ankan:** `feature/fe-products-view`
*   **Ayaan:** `feature/fe-product-modals`

#### Parallel Tasks & Workstreams
*   **Aditya (Backend & Frontend Integrations):**
    *   **Backend:** Write REST endpoints:
        *   `GET /api/products` (list all products, sorted alphabetically).
        *   `POST /api/products` (create new product with quantity and rate).
        *   `PUT /api/products/{id}` (update product fields).
        *   `DELETE /api/products/{id}` (fails if active rentals reference this product).
    *   **Frontend (25% Ratio):** Setup Axios service clients (`ProductService`) and initialize React Query hooks for `useProducts`, `useCreateProduct`, `useUpdateProduct`, and `useDeleteProduct`.
*   **Ankan (Frontend Catalog View):**
    *   Create `/products` page with responsive list table columns: `Product Name`, `Daily Rate`, `Deposit`, and `Qty Available`.
    *   Add empty-state screen if the product list is empty (illustrative placeholder + "+ New Product" CTA).
    *   Style edit/delete icon button columns inside table rows.
*   **Ayaan (Product Management Modals):**
    *   Develop **Add Product Modal** and **Edit Product Modal** using Shadcn UI dialog primitives (fields: name, daily rate, deposit amount, qty).
    *   Create **Delete Product Confirmation Modal** supporting standard warning prompts.
    *   Implement client validation rules (rates $> 0$, integer quantities $\ge 1$).

#### Integration Checkpoint & Merge Plan (At Hour 3.0)
1.  **Ayaan** integrates modals into the `/products` page table controls, passing the target product data hooks down.
2.  **Aditya** links React Query mutations directly to these modals.
3.  Merge both frontend branches (`feature/fe-products-view` and `feature/fe-product-modals`) into `develop` after testing.
4.  Verify end-to-end: Admin can create a new product, edit its quantity, and see the table auto-update silently via React Query cache invalidation.

---

### Phase 3: Rentals Creation & Details (Hour 3.0 – Hour 4.5)
**Goal:** Implement manual rental booking forms and individual rental detail sheets.

#### Git Feature Branches
*   **Aditya:** `feature/api-rentals`
*   **Ankan:** `feature/fe-new-rental`
*   **Ayaan:** `feature/fe-return-modal`

#### Parallel Tasks & Workstreams
*   **Aditya (Backend & Frontend Integrations):**
    *   **Backend:** Develop CRUD routes:
        *   `POST /api/rentals` (creates rental record, fetches product defaults, checks availability).
        *   `GET /api/rentals/{id}` (fetches details, calculates live status).
    *   **Frontend (25% Ratio):** Create `RentalService` and React Query hooks (`useRentals`, `useRentalDetail`, `useCreateRental`, `useReturnRental`). Write computed date-difference functions for late fees.
*   **Ankan (Frontend Rental Creation & Details Screen):**
    *   Build `/rentals/new` page (single-column form: Product dropdown, Customer Name, Phone, Start/Due Date selection).
    *   Add computed label showing "Rental Duration: X days" instantly upon date updates.
    *   Build the `/rentals/:id` detailed view screen (top summary card, overdue warning banner, bottom action segment).
*   **Ayaan (Return Settlement Modal):**
    *   Design the **Mark as Returned Modal** popup.
    *   Integrate client-side math update logic: as the Actual Return Date updates, calculate and display live return statistics (Days late, Cap fee deducts, Net refund due).

#### Integration Checkpoint & Merge Plan (At Hour 4.5)
1.  **Ayaan** merges the return modal into the `/rentals/:id` action section.
2.  **Aditya** wires the confirm action button to the `POST /api/rentals/{id}/return` backend mutation.
3.  Merge all features to `develop`.
4.  Verify that creating a new rental deducts the product availability counter by 1, redirects to the detail page, and correctly formats customer information.

---

### Phase 4: Operations Dashboard, Returns & Settlement (Hour 4.5 – Hour 6.0)
**Goal:** Implement Pessimistic Locking database guards, build the dashboard cards, filterable rental tables, and finalize integration polishing.

#### Git Feature Branches
*   **Aditya:** `feature/api-dashboard-locking`
*   **Ankan:** `feature/fe-dashboard-details`
*   **Ayaan:** `feature/fe-polishing-tests`

#### Parallel Tasks & Workstreams
*   **Aditya (Concurrency & Core Stats API):**
    *   **Backend:** Secure the creation database transactions using SQLAlchemy's `.with_for_update()` pessimistic lock queries to prevent inventory race conditions.
    *   Write `GET /api/dashboard/stats` aggregating dashboard status counters (`Active`, `Due Today`, `Overdue`, and total `Deposits Held`).
    *   Implement backend test suite validations verifying calculated refund logic and database schema models.
*   **Ankan (Operations Dashboard UI):**
    *   Create `/dashboard` layout page (4 statistics summary cards at the top, scrollable).
    *   Integrate global Zustand state/URL filter chips on table rows (e.g. clicking the "Overdue" stat card filters the table list).
    *   Build the rentals overview table below the stat cards with colored state badges.
*   **Ayaan (System Polishing, Edge Cases, and Manual Walkthrough):**
    *   Build error-boundary fallbacks if API fetches fail.
    *   Audit global responsive breakpoint layouts across mobile and tablet dimensions.
    *   Verify input element focus shadows and transitions match the visual tokens in [DESIGN.md](DESIGN.md).

#### Integration Checkpoint & Merge Plan (At Hour 6.0)
1.  Verify dashboard API integration with front-end React Query poll cycles.
2.  Run full regression sweeps across all 5 user screens.
3.  Merge `develop` into `main` and execute the walkthrough validation demo checklist.

---

## 4. Git Workflow & Conflict Resolution Guidelines

To keep the development speed high and eliminate code overrides, the team will adhere to the following Git policies:

### Branch Structure
*   `main` — Production branch. Only contains thoroughly tested code. No direct pushes.
*   `develop` — Integration branch. All features merge here for validation before merging to `main`.
*   `feature/*` — Topic branches worked on by individual developers.

```
       [feature/db-auth-setup] ---------\
      /                                  \
[main] ------------ [develop] ------------ [develop] ------------ [main] (v1.0.0 Release)
      \                                  /
       [feature/fe-layout-routing] -----/
```

### Strategic Guidelines to Prevent Conflicts
1.  **Strict Component Decoupling:**
    *   Ankan and Ayaan must not edit the same page code simultaneously.
    *   Ayaan will build modals inside isolated components (e.g. `src/components/modals/ProductAddModal.tsx`), and Ankan will reference these custom tags from the primary layout.
2.  **Shared Types & Schemas:**
    *   Any changes to TypeScript interfaces must be created in a central folder (`src/types/`) before UI integration.
3.  **Database Migrations:**
    *   Only Aditya executes Alembic revision scripts. Other developers must run `alembic upgrade head` after pulling changes.

---

## 5. Verification & Testing Matrix

### Automated Testing (Aditya)
*   Unit tests in backend verifying late-fee automation cases:
    *   *Case A:* On-time returns (refund = 100% deposit, late fee = 0).
    *   *Case B:* Late return with fee below cap (late fee = days late × rate).
    *   *Case C:* Late return exceeding cap (late fee = deposit amount, refund = 0).
*   API integration tests verifying concurrent rental bookings are blocked if product quantity drops to 0.

### Manual Verification Checklist (Whole Team)
- [ ] Admin can log in successfully and redirect to `/dashboard`.
- [ ] Adding a new product registers it in the catalog and renders instantly in the table.
- [ ] Booking form lists only available products and auto-suggests rate and deposit.
- [ ] Overdue items display a red warning card in the details page.
- [ ] Settle modal correctly outputs late-fee refund math dynamically.
- [ ] Clicking stat cards filters table lists cleanly.
- [ ] Log out invalidates cookies and returns client back to `/login`.
