# Multi-Developer Team Implementation Plan

This document details the multi-developer team implementation plan to build the Rental Management System (RMS) from scratch. The plan is designed to deliver a working version as fast as possible, incrementally building features and complexity.

## Developer Team Structure & Roles

The team consists of three developers with the following role assignments:
- **Developer 1 (Aditya) - Full Backend + Admin settings / configurations (Backend-Adjacent Frontend)**:
  Responsible for the database schema, migration scripts, authentication API, catalog API, order checkout APIs, operations/returns API, and the admin business settings frontend panels.
- **Developer 2 (Ankan) - Frontend Developer (Client Portal Experience)**:
  Responsible for client authentication UI, product catalog browser, period selection, shopping cart, checkout forms, success page, and customer profile management.
- **Developer 3 (Ayan) - Frontend Developer (Admin Dashboard & Operations Experience)**:
  Responsible for the Admin UI layout, order monitor panel, walk-in quotation builder, daily pickup/return lists, checklist forms, and the operations dashboard widgets.

---

## Phase 1: Foundation, Basic Auth & Catalog CRUD
*Deliverable: Working database, cookie-based JWT authentication, Client homepage product list, and Admin tables to create products.*

### Parallel Workstreams & Explicit Tasks

#### 1. Aditya (Backend)
- **Branch**: `feature/foundation-auth-catalog-backend`
- **Tasks**:
  1. Initialize database configurations and models matching the version 2.0 schema in [database.py](../backend/app/core/database.py) and [SCHEMA.md](SCHEMA.md).
  2. Implement backend models for users/admins, products, product variants, rental periods, pricelists, and default settings:
     - [models.py (auth)](../backend/app/features/auth/models.py)
     - [models.py (catalog)](../backend/app/features/catalog/models.py)
  3. Create alembic migration configuration and run first migration:
     - `alembic revision --autogenerate -m "Initial schema setup"`
     - `alembic upgrade head`
  4. Write JWT authentication routes in [router.py (auth)](../backend/app/features/auth/router.py) with endpoints:
     - `POST /api/auth/register` (Portal user signup)
     - `POST /api/auth/login` (Portal user login, setting `client_session` cookie)
     - `POST /api/auth/admin/login` (Admin login, setting `admin_session` cookie)
     - `GET /api/auth/me` (Profile recovery)
     - `POST /api/auth/logout` (Cookie clearing)
  5. Implement CRUD routers and helper databases functions for products, variants, periods, and pricelists:
     - [router.py (catalog)](../backend/app/features/catalog/router.py)
     - [crud.py (catalog)](../backend/app/features/catalog/crud.py)

#### 2. Ankan (Client Frontend)
- **Branch**: `feature/catalog-admin-views`
- **Tasks**:
  1. Build `/admin/login` page for administrators.
  2. Implement admin shell navigation wrapping in [AdminLayout.tsx](../frontend/src/layouts/AdminLayout.tsx) (collapsible sidebar, login status details).
  3. Construct catalog configuration pages:
     - `/admin/products` containing product variants list and item creation drawer: [ProductAdminPage.tsx](../frontend/src/pages/admin/ProductAdminPage.tsx), [ProductTable.tsx](../frontend/src/features/catalog/components/ProductTable.tsx)
     - `/admin/pricelists` showing rate rules mapping: [PricelistAdminPage.tsx](../frontend/src/pages/admin/PricelistAdminPage.tsx)
     - `/admin/rental-periods`: [RentalPeriodsAdminPage.tsx](../frontend/src/pages/admin/RentalPeriodsAdminPage.tsx)
  4. Create client browse index `/` displaying catalog grids:
     - [BrowsePage.tsx](../frontend/src/pages/client/BrowsePage.tsx)
     - [ProductGrid.tsx](../frontend/src/features/catalog/components/ProductGrid.tsx)
     - [ProductCard.tsx](../frontend/src/features/catalog/components/ProductCard.tsx)


#### 3. Ayan (Admin Frontend)
- **Branch**: `feature/foundation-auth-catalog-client`
- **Tasks**:
  1. Configure `react-router-dom` routes and add guards in [App.tsx](../frontend/src/App.tsx).
  2. Add [authStore.ts](../frontend/src/store/authStore.ts) using Zustand to track current authenticated client details.
  3. Design `/splash`, `/login`, and `/signup` views using Shadcn components:
     - [LoginForm.tsx](../frontend/src/features/auth/components/LoginForm.tsx)
     - [SignupForm.tsx](../frontend/src/features/auth/components/SignupForm.tsx)
  
### Merge & Integration Checkpoint 1
- **Target Branches**: Merge all branches into `develop` or `main`.
- **Conflicts Prevention**: Ensure [App.tsx](../frontend/src/App.tsx) and main configurations are merged carefully.
- **Verification Tests**:
  - Log in as Admin -> Create products, variants, and rental rates.
  - Log in as Client -> Verify catalog browse page displays the products created by Admin.
  - Check HTTP responses to confirm cookies `client_session` and `admin_session` are set with `HttpOnly` and `SameSite=Strict`.

---

## Phase 2: Client Booking Flow & Cart Checkout (Standard Rental Flow)
*Deliverable: Client interactive booking pages, shopping cart, checkout forms, invoice generation, and Admin order manager panel.*

### Parallel Workstreams & Explicit Tasks

#### 1. Aditya (Backend)
- **Branch**: `feature/orders-checkout-backend`
- **Tasks**:
  1. Declare database models for `Order`, `OrderItem`, `Invoice`, and `DepositLedgerEntry` matching the schema.
  2. Create checkout routing in [router.py (orders)](../backend/app/features/orders/router.py):
     - `POST /api/orders` (Reserve order items checkout)
     - `GET /api/orders` and `GET /api/orders/{id}`
  3. Implement transaction safety with pessimistic row locking (`SELECT ... FOR UPDATE` on `Product` and `ProductVariant` tables) in [crud.py (orders)](../backend/app/features/orders/crud.py) to prevent double bookings.
  4. Write PDF/file download endpoint `/api/invoices/{id}/download` representing order invoices.

#### 2. Ankan (Client Frontend)
- **Branch**: `feature/orders-checkout-client`
- **Tasks**:
  1. Complete `/products/:id` details view with interactive date/period selector: [DetailPage.tsx](../frontend/src/pages/client/DetailPage.tsx), [PeriodPicker.tsx](../frontend/src/features/catalog/components/PeriodPicker.tsx).
  2. Implement Zustand [cartStore.ts](../frontend/src/store/cartStore.ts) handling multiple products, date durations, and pricing sum calculations.
  3. Build `/cart` page with line item breakdowns: [CartPage.tsx](../frontend/src/pages/client/CartPage.tsx), [CartList.tsx](../frontend/src/features/orders/components/CartList.tsx).
  4. Implement checkout screens `/checkout/fulfillment` (Store Pickup vs Delivery shipping details form) and `/checkout/payment`: [CheckoutPage.tsx](../frontend/src/pages/client/CheckoutPage.tsx), [FulfillmentForm.tsx](../frontend/src/features/orders/components/FulfillmentForm.tsx), [PaymentForm.tsx](../frontend/src/features/orders/components/PaymentForm.tsx).
  5. Build success view `/checkout/success/:orderId` with a working invoice download link: [SuccessPage.tsx](../frontend/src/pages/client/SuccessPage.tsx).

#### 3. Ayan (Admin Frontend)
- **Branch**: `feature/orders-management-admin`
- **Tasks**:
  1. Build Order listings overview `/admin/orders` showing all rental status summaries.
  2. Build detailed order page `/admin/orders/:id` displaying client information, items booked, dates, payment flags, and invoice details.
  - Target files: [OrdersAdminPage.tsx](../frontend/src/pages/admin/OrdersAdminPage.tsx), [OrderDetailPage.tsx](../frontend/src/pages/admin/OrderDetailPage.tsx).

### Merge & Integration Checkpoint 2
- **Target Branches**: Merge feature branches into `develop`.
- **Verification Tests**:
  - Add multiple products with variants to the client cart. Specify rental start and due dates.
  - Complete payment checkout. Verify database inserts entries into `orders`, `order_items`, `invoices`, and `deposit_ledger_entries` (entry_type = 'COLLECTED').
  - Ensure quantity available decrements. Attempts to overbook must fail with status code `409 Conflict`.
  - Confirm Admin orders list updates showing the new order as UPCOMING.

---

## Phase 3: Admin Operations (Pickups, Returns & Late Fee Settlement)
*Deliverable: Daily pickup/return schedules, returned items checklists, late return calculations, deposit refunds, and client rentals log.*

### Parallel Workstreams & Explicit Tasks

#### 1. Aditya (Backend)
- **Branch**: `feature/pickups-returns-backend`
- **Tasks**:
  1. Build pickup API routing `/api/orders/{id}/pickup` verifying items checkouts and checklists.
  2. Create return API routing `/api/orders/{id}/return` implementing the late fee reconciliation engine:
     - Check if return date exceeds due date.
     - Calculate units late (rounding up based on configuration, e.g. daily/weekly).
     - Calculate gross penalty: $\text{Units Late} \times \text{Late Rate}$.
     - Apply maximum penalty caps and grace periods.
     - Deduct penalty from deposit collected.
     - Settle refund amount or generate penalty invoice for outstanding debt.
     - Return item to stock (+1 available quantity).
     - Update deposit ledger entry ('DEDUCTION' or 'REFUNDED').
  - Target files: [router.py (operations)](../backend/app/features/operations/router.py), [crud.py (operations)](../backend/app/features/operations/crud.py).

#### 2. Ankan (Client Frontend)
- **Branch**: `feature/myrentals-client-views`
- **Tasks**:
  1. Build `/my-rentals` and detailed view `/my-rentals/:orderId` page for Portal Clients.
  2. Display active, overdue, and returned item statuses.
  3. Render deposit tracking grids showing held deposit amount, late deductions, and refund histories.
  - Target files: [MyRentalsPage.tsx](../frontend/src/pages/client/MyRentalsPage.tsx), [MyRentalDetailPage.tsx](../frontend/src/pages/client/MyRentalDetailPage.tsx).

#### 3. Ayan (Admin Frontend)
- **Branch**: `feature/operations-admin-views`
- **Tasks**:
  1. Build calendar schedule list `/admin/pickups` for today's pick actions.
  2. Build daily return calendar list `/admin/returns`.
  3. Create return inspections modal: [ReturnChecklistModal.tsx](../frontend/src/features/operations/components/ReturnChecklistModal.tsx) which allows Admin to select actual return date, record checklists, inspect calculated charges, and trigger settlement.

### Merge & Integration Checkpoint 3
- **Target Branches**: Merge features into `develop`.
- **Verification Tests**:
  - Book a product. Go to Admin Portal -> Confirm Pickup -> Check status shifts to ACTIVE.
  - Trigger Return after due date. Verify late fee calculations match expectations (e.g. grace period checking, maximum caps).
  - Verify deposit is refunded (or penalty invoice generated). Confirm database records update.
  - Verify Client Portal `/my-rentals` details matches return states.

---

## Phase 4: Walk-in Quotations & Settings
*Deliverable: walk-in templates/quotation workflow, settings rules configurations, and client profile controls.*

### Parallel Workstreams & Explicit Tasks

#### 1. Aditya (Backend)
- **Branch**: `feature/quotations-settings-backend`
- **Tasks**:
  1. Declare backend models for `Quotation` and `QuotationItem`.
  2. Write quotations CRUD endpoints: `POST /api/quotations`, `GET /api/quotations`, `GET /api/quotations/{id}`.
  3. Write quotation confirmation endpoint `/api/quotations/{id}/confirm` which locks stock, converts quotation to Order, creates Invoice, and marks payment status.
  4. Write configuration API endpoints `/api/settings/deposit-latefee` (retrieve and update settings).
  - Target files: [router.py (quotations)](../backend/app/features/quotations/router.py), [crud.py (quotations)](../backend/app/features/quotations/crud.py).

#### 2. Ankan (Client Frontend)
- **Branch**: `feature/profile-customization-client`
- **Tasks**:
  1. Build `/profile` pages for managing user profile.
  2. Implement profile image uploading, shipping addresses CRUD forms, and checkout address selectors.
  - Target files: [ProfilePage.tsx](../frontend/src/pages/client/ProfilePage.tsx), [AddressEditor.tsx](../frontend/src/features/auth/components/AddressEditor.tsx).

#### 3. Ayan (Admin Frontend)
- **Branch**: `feature/quotations-admin-views`
- **Tasks**:
  1. Build Walk-in Quotation creator view `/admin/quotations/new` allowing Admin to choose walk-in clients, rental items, template header/footers, durations, and customize rates.
  2. Build quotation details viewer with an instant "Confirm & Settle" checkout action converting the quote to a rental order.
  - Target files: [QuotationAdminPage.tsx](../frontend/src/pages/admin/QuotationAdminPage.tsx), [QuotationCreatorPage.tsx](../frontend/src/pages/admin/QuotationCreatorPage.tsx).

#### 4. Aditya (1/8 Frontend Task)
- **Branch**: `feature/settings-admin-views`
- **Tasks**:
  1. Build `/admin/settings` configurations panel for managing grace periods, late-fee charging unit intervals (Hourly, Daily, Weekly, Monthly), and default deposit rates (fixed vs percentage).
  - Target files: [SettingsPage.tsx](../frontend/src/pages/admin/SettingsPage.tsx), [SettingsForm.tsx](../frontend/src/features/operations/components/SettingsForm.tsx).

### Merge & Integration Checkpoint 4
- **Target Branches**: Merge features into `develop`.
- **Verification Tests**:
  - Admin creates walk-in client quotation. Selects custom template. Confirms quotation on-the-spot. Verify it creates a PAID Order instantly and decrements stock.
  - Change default late fees grace period or max limits in Settings. Verify returning items conforms to updated rules immediately.

---

## Phase 5: Operations Dashboard & Final Polish
*Deliverable: Real-time Admin dashboard with 8 KPI widgets, data-seeding tools, and high-fidelity styling polish.*

### Parallel Workstreams & Explicit Tasks

#### 1. Aditya (Backend)
- **Branch**: `feature/dashboard-backend-stats`
- **Tasks**:
  1. Implement aggregated dashboard data in [router.py (operations)](../backend/app/features/operations/router.py): `GET /api/dashboard/stats` querying metrics: Active Rentals, Due Today, Upcoming Pickups/Returns, Overdue Rentals, Revenue, Deposits Held, and Late Fee Collections.
  2. Write automated data-seeding script `backend/app/core/seed.py` that pre-populates database with mock users, products, variants, rates, and historical/overdue orders for dashboard display.

#### 2. Ankan (Client Frontend)
- **Branch**: `feature/theme-polish-client`
- **Tasks**:
  1. Refine global Tailwind design matching [DESIGN.md](DESIGN.md) (Notion off-white typography, Outfit/Inter fonts, blue links `#0075de`, custom styled scrollbars).
  2. Set up smooth scroll reveals, micro-animations on hover, and global toast feedback events.
  - Target files: [index.css](../frontend/src/index.css), UI layout files.

#### 3. Ayan (Admin Frontend)
- **Branch**: `feature/dashboard-admin-views`
- **Tasks**:
  1. Build `/admin/dashboard` showing the 8 widgets:
     - Active Rentals, Due Today, Upcoming Pickups, Upcoming Returns, Overdue Rentals, Revenue, Deposits Held, and Late Fee Collection.
  2. Implement date-range filters (day/week/month intervals) updating the TanStack queries.
  - Target files: [DashboardPage.tsx](../frontend/src/pages/admin/DashboardPage.tsx), [StatCard.tsx](../frontend/src/features/dashboard/components/StatCard.tsx).

### Merge & Integration Checkpoint 5
- **Target Branches**: Merge final branches into `develop`, and merge `develop` into `main`.
- **Verification Tests**:
  - Execute `python -m app.core.seed` database seed script.
  - Log in as Admin and verify the Operations Dashboard displays values matching seeded database states.
  - Validate responsive layout behavior down to mobile screens.
