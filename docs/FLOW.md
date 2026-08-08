# UX Flow Document
## Rental Management System — Complete Screen & Interaction Spec

**Purpose:** This document specifies every screen, navigation path, user action, and system state across both applications (Client Portal, Admin Backend) in enough detail for an AI coding agent to implement without guessing. It is scoped strictly to the features defined in the PRD (derived from the source problem statement) — no screens or behaviors beyond that scope are introduced.

---

## 0. Conventions Used in This Document

- **Route:** URL path for the screen.
- **Access:** Who can reach it (Guest / Authenticated Client / Authenticated Admin).
- **Entry Points:** Every place in the app that links to this screen.
- **Primary Actions:** Buttons/controls a user can trigger, with resulting behavior.
- **Success State:** What the UI shows when the action completes correctly.
- **Error States:** Every known failure mode and its exact on-screen message/behavior.
- **Empty State:** What renders when there is no data to show.
- **Loading State:** What renders while data/action is in flight (skeleton, spinner, disabled button).
- **Modal Behavior:** Trigger, contents, dismiss behavior, and what happens on confirm/cancel.
- **Exit Points:** Every navigation control leading away from the screen.

**Global rule for every screen with a submit action:** button enters a disabled + loading-spinner state immediately on click, re-enabled only after success or error response. Prevents double submission.

**Global rule for every list screen:** loading = skeleton rows (not spinner) for perceived performance; empty = icon + message + primary CTA if applicable; error = inline retry banner, list area does not go blank if data was previously loaded (stale-while-revalidate).

---

## 1. Navigation Hierarchy (Sitemap)

```
ROOT (/)
│
├── CLIENT PORTAL (app.rentalsystem.com)
│   ├── /splash                        (Guest, first load only)
│   ├── /login                         (Guest)
│   ├── /signup                        (Guest)
│   ├── /                              (Client) — Product Browse / Home
│   ├── /products/:id                  (Client) — Product Detail
│   ├── /cart                          (Client)
│   ├── /checkout/fulfillment          (Client)
│   ├── /checkout/payment              (Client)
│   ├── /checkout/success/:orderId     (Client)
│   ├── /my-rentals                    (Client)
│   ├── /my-rentals/:orderId           (Client)
│   ├── /profile                       (Client)
│   ├── /profile/address               (Client)
│   └── /profile/payment-info          (Client)
│
└── ADMIN BACKEND (admin.rentalsystem.com)
    ├── /login                         (Guest)
    ├── /dashboard                     (Admin) — default post-login route
    ├── /products                      (Admin)
    ├── /products/new                  (Admin)
    ├── /products/:id/edit             (Admin)
    ├── /pricelists                    (Admin)
    ├── /pricelists/new                (Admin)
    ├── /pricelists/:id/edit           (Admin)
    ├── /rental-periods                (Admin)
    ├── /settings/deposit-latefee      (Admin)
    ├── /quotations                    (Admin)
    ├── /quotations/new                (Admin)
    ├── /quotations/:id                (Admin)
    ├── /orders                        (Admin)
    ├── /orders/:id                    (Admin)
    ├── /pickups                       (Admin) — daily pickup schedule
    ├── /returns                       (Admin) — daily return schedule
    ├── /deposits                      (Admin) — deposit history/ledger
    └── /users                         (Admin) — user record management
```

**Auth guard rule:** any Client route other than `/splash`, `/login`, `/signup` redirects to `/login` if no valid session. Any Admin route other than `/login` redirects to `/login` if no valid admin session. After login, redirect to the originally requested route if one was intercepted; otherwise redirect to `/` (Client) or `/dashboard` (Admin).

---

## 2. CLIENT PORTAL — Screens

### 2.1 Splash Screen
- **Route:** `/splash`
- **Access:** Guest, shown once on cold app load only (not on every navigation).
- **Purpose:** Branding screen shown while checking for an existing session.
- **Entry Points:** App cold start only.
- **Behavior:** On mount, check for stored session token.
  - Valid token → redirect to `/` (skip login).
  - No token / invalid token → redirect to `/login`.
- **Loading State:** Logo + spinner, max 2 seconds before forced redirect to `/login` as a fallback (never hang indefinitely).
- **Error States:** None user-facing — session check failures fall through silently to `/login`.
- **Exit Points:** Automatic redirect only; no manual controls.

### 2.2 Login
- **Route:** `/login`
- **Access:** Guest
- **Entry Points:** Splash redirect, direct URL, "Log in" link from Sign Up screen, auth-guard redirect from any protected route, post-logout redirect.
- **Layout & Elements:** Email field, password field, "Log In" button, "Forgot password?" link (out of scope for MVP — omit if not building password reset; if present, non-functional placeholder is disallowed, so omit entirely per PRD scope), "New here? Sign Up" link.
- **Primary Actions:**
  - Submit login form → validate client-side (both fields non-empty, email format) → call login API.
- **Success State:** Store session token, redirect to originally intercepted route or `/`.
- **Error States:**
  - Invalid credentials → inline error banner above form: "Incorrect email or password."
  - Network/server error → inline banner: "Something went wrong. Please try again."
  - Client-side validation → inline field-level error text under the offending field, submit button stays disabled until resolved.
- **Loading State:** Submit button shows spinner + disabled; fields disabled during request.
- **Empty State:** N/A (form screen).
- **Exit Points:** "Sign Up" link → `/signup`.

### 2.3 Sign Up
- **Route:** `/signup`
- **Access:** Guest
- **Entry Points:** Login screen link, direct URL.
- **Layout & Elements:** Name, email, password, confirm password fields; "Create Account" button; "Already have an account? Log In" link.
- **Primary Actions:** Submit → client-side validation (required fields, valid email, password ≥ minimum length, password === confirm password) → call registration API → on success, auto-login and proceed to Profile Creation step.
- **Success State:** Redirect to a first-time Profile Creation prompt (can be inline on this screen as step 2, or `/profile` with an onboarding banner "Complete your profile"). Recommended: single-screen two-step form (Account → Profile) to avoid an extra route.
- **Error States:**
  - Email already registered → inline banner: "An account with this email already exists." + link to `/login`.
  - Password mismatch → field-level error under Confirm Password: "Passwords do not match."
  - Network/server error → generic retry banner.
- **Loading State:** Submit button spinner + disabled.
- **Exit Points:** "Log In" link → `/login`.

### 2.4 Product Browse / Home
- **Route:** `/`
- **Access:** Authenticated Client
- **Entry Points:** Post-login redirect, nav bar "Home"/logo click from any authenticated screen.
- **Layout & Elements:** Persistent top nav (logo, Home, My Rentals, Cart icon with item count badge, Profile avatar/menu), search bar, product grid (image, name, price-from, "View" affordance), pagination or infinite scroll.
- **Primary Actions:**
  - Search/filter products → updates grid.
  - Click a product card → navigate to `/products/:id`.
  - Click cart icon → navigate to `/cart`.
- **Loading State:** Skeleton grid cards while fetching product list.
- **Empty State:** No products match search → centered message: "No products found. Try a different search." with a "Clear search" action. No products exist at all (admin hasn't added any) → "No products available right now. Check back soon."
- **Error State:** Fetch failure → inline banner at top of grid area: "Couldn't load products." with a "Retry" button; previously loaded content (if any) remains visible underneath (stale-while-revalidate).
- **Exit Points:** Product card → `/products/:id`; nav items as listed.

### 2.5 Product Detail
- **Route:** `/products/:id`
- **Access:** Authenticated Client
- **Entry Points:** Product Browse grid click.
- **Layout & Elements:** Product images, name, description, variant selectors (Brand/Manufacturer/Color/Size — only shown if the product has variants configured), rental period picker (start date, end date — validated against product availability), price breakdown preview (rental cost for selected period + applicable security deposit, computed live as dates/variant change), "Add to Cart" button.
- **Primary Actions:**
  - Select variant → updates price/availability preview.
  - Select rental period (date range picker) → validates against blocked/unavailable dates for that product; updates price preview.
  - Click "Add to Cart" → validates a period is selected → adds to cart → shows confirmation.
- **Success State:** "Add to Cart" click → toast/snackbar: "Added to cart." Cart icon badge count increments without full page reload.
- **Error States:**
  - Selected rental period unavailable (product already booked for those dates) → inline error under the date picker: "This product is unavailable for the selected dates. Please choose different dates."
  - No period selected when clicking Add to Cart → inline validation error: "Please select a rental period."
  - Product not found (bad `:id`) → full-page not-found state: "Product not found." + "Back to Browse" button.
  - Fetch failure → retry banner, same pattern as 2.4.
- **Loading State:** Skeleton for image/details block while product data loads.
- **Exit Points:** Back navigation → `/`; "Add to Cart" stays on page (non-blocking toast, not a redirect) so the user can continue browsing or manually go to `/cart`.

### 2.6 Cart
- **Route:** `/cart`
- **Access:** Authenticated Client
- **Entry Points:** Nav bar cart icon, post-"Add to Cart" manual navigation.
- **Layout & Elements:** List of cart line items (product name, thumbnail, selected variant, rental period, rental cost, deposit amount, remove control), order summary (subtotal rental cost, total deposit, grand total), "Proceed to Checkout" button.
- **Primary Actions:**
  - Remove line item → confirmation not required for a simple remove (low-risk, reversible via re-add); item removed immediately with an "Undo" toast for 5 seconds.
  - Click "Proceed to Checkout" → navigate to `/checkout/fulfillment`. Disabled if cart is empty.
- **Empty State:** Cart icon/illustration + "Your cart is empty." + "Browse Products" button → `/`.
- **Error States:** If a cart item's product/period became unavailable since it was added (re-validated on cart load) → inline warning badge on that line item: "No longer available for these dates." with "Remove" or "Edit dates" actions; checkout is blocked until resolved (Proceed button disabled with helper text "Resolve unavailable items to continue").
- **Loading State:** Skeleton line items while cart loads.
- **Exit Points:** "Proceed to Checkout" → `/checkout/fulfillment`; product name click → `/products/:id`.

### 2.7 Checkout — Fulfillment
- **Route:** `/checkout/fulfillment`
- **Access:** Authenticated Client (redirect to `/cart` if cart is empty)
- **Entry Points:** Cart "Proceed to Checkout."
- **Layout & Elements:** Step indicator (Fulfillment → Payment → Confirmation), radio choice: "Deliver to address" / "Collect from store," conditional address form (street, city, state, postal code — only shown if "Deliver" selected; if no saved address, blank form; if saved address exists on profile, pre-filled with an "Edit" option), "Continue to Payment" button.
- **Primary Actions:**
  - Select fulfillment method → conditionally reveals/hides address form.
  - Fill/edit address → client-side validation (required fields).
  - Click "Continue to Payment" → validates: if "Deliver" selected, address fields must be complete → navigate to `/checkout/payment`.
- **Error States:** Incomplete address on submit → field-level required errors, submit blocked.
- **Loading State:** N/A (client-side form; no network call on this step unless pre-filling saved address, which uses the same skeleton pattern).
- **Exit Points:** Back → `/cart`; "Continue" → `/checkout/payment`.

### 2.8 Checkout — Payment
- **Route:** `/checkout/payment`
- **Access:** Authenticated Client (redirect to `/checkout/fulfillment` if that step's data isn't present in session/state)
- **Entry Points:** Checkout Fulfillment "Continue."
- **Layout & Elements:** Step indicator (Payment active), order summary recap (read-only, collapsed by default with "Edit" links back to Cart/Fulfillment), payment details form, total charge breakdown (rental cost + security deposit = total charged now), "Pay & Confirm" button.
- **Primary Actions:**
  - Submit payment form → validate fields → call payment/order-confirmation API (creates the order, charges rental + deposit as specified in the workflow).
- **Success State:** Order created → redirect to `/checkout/success/:orderId`.
- **Error States:**
  - Payment declined/failed → inline banner: "Payment could not be processed. Please check your details and try again." Form remains filled (except sensitive fields per standard payment-form security practice); cart is NOT cleared.
  - Session/cart changed mid-checkout (e.g., item became unavailable) → banner: "Your cart has changed. Please review before continuing." with a link back to `/cart`.
  - Network/server error → generic retry banner.
- **Loading State:** "Pay & Confirm" button spinner + disabled; whole form disabled during submission to prevent edits mid-flight.
- **Exit Points:** Back → `/checkout/fulfillment`; success → `/checkout/success/:orderId`.

### 2.9 Checkout Success / Invoice
- **Route:** `/checkout/success/:orderId`
- **Access:** Authenticated Client, only reachable via successful checkout redirect or directly by owner of that order (else 404/forbidden)
- **Entry Points:** Payment step success redirect.
- **Layout & Elements:** Confirmation icon, "Order Confirmed" heading, order summary (items, period, fulfillment method, amounts paid), "Download Invoice" button, "View My Rentals" button, "Continue Browsing" link.
- **Primary Actions:**
  - "Download Invoice" → triggers invoice file download (generated server-side, matches the amounts/order shown).
  - "View My Rentals" → `/my-rentals`.
- **Error States:** Invoice generation failed → button shows inline error: "Invoice unavailable right now. Try again from My Rentals." (invoice remains re-downloadable from Order Detail screen).
- **Loading State:** "Download Invoice" shows spinner while file is being generated/fetched.
- **Exit Points:** As listed above; direct URL re-visit after leaving is allowed (order confirmation remains viewable, not a one-time toast).

### 2.10 My Rentals (List)
- **Route:** `/my-rentals`
- **Access:** Authenticated Client
- **Entry Points:** Nav bar "My Rentals," Checkout Success screen.
- **Layout & Elements:** Tabbed or filterable list by status: Upcoming / Active / Returned / Overdue. Each row: product name/thumbnail, rental period, status badge (color-coded: Upcoming=blue, Active=green, Returned=gray, Overdue=red), "View" affordance.
- **Primary Actions:** Click a row → `/my-rentals/:orderId`. Switch status tab/filter → re-filters list (client-side if all data loaded, or refetch — either is acceptable, but must not lose scroll position jarringly).
- **Empty State:** Per-tab empty message, e.g., "No active rentals." / "You haven't rented anything yet." (on the all/default view) + "Browse Products" CTA linking to `/`.
- **Error State:** Fetch failure → retry banner, consistent with 2.4 pattern.
- **Loading State:** Skeleton rows.
- **Exit Points:** Row click → `/my-rentals/:orderId`.

### 2.11 My Rentals — Order Detail
- **Route:** `/my-rentals/:orderId`
- **Access:** Authenticated Client, must own the order (else forbidden/404 state)
- **Entry Points:** My Rentals list, Checkout Success "View My Rentals."
- **Layout & Elements:** Status badge, product details, rental period, fulfillment method + address (if applicable), payment breakdown (rental cost, deposit collected, deposit status: Held / Refunded / Partially Deducted with penalty amount shown if applicable), "Download Invoice" button, return instructions text ("Return at [store] by [date/time]") shown only while status is Upcoming/Active/Overdue.
- **Primary Actions:** "Download Invoice" (same behavior as 2.9).
- **Success/Empty States:** N/A beyond standard load; deposit status section always shows current accurate state, updating to reflect admin-side return processing without requiring the client to take any action.
- **Error States:** Order not found or not owned by current user → "This order could not be found." + "Back to My Rentals" button. Invoice download failure → same inline error as 2.9.
- **Loading State:** Skeleton detail layout.
- **Exit Points:** Back → `/my-rentals`.

### 2.12 Profile
- **Route:** `/profile`
- **Access:** Authenticated Client
- **Entry Points:** Nav bar avatar/menu.
- **Layout & Elements:** Profile photo (with upload/change control), name, email (read-only or editable per business rule — editable here), "Save Changes" button, links/sections to `/profile/address` and `/profile/payment-info`.
- **Primary Actions:**
  - Upload/change profile photo → file picker → preview before save → on "Save Changes," persists.
  - Edit name → "Save Changes" persists.
- **Success State:** Toast: "Profile updated."
- **Error States:**
  - Invalid image (wrong file type / too large) → inline error under photo control: "Please upload a JPG or PNG under 5MB."
  - Save failure → inline banner: "Couldn't save changes. Please try again."
- **Loading State:** "Save Changes" spinner + disabled during request.
- **Exit Points:** Sub-links to `/profile/address`, `/profile/payment-info`; nav bar to leave.

### 2.13 Profile — Address
- **Route:** `/profile/address`
- **Access:** Authenticated Client
- **Entry Points:** Profile screen link.
- **Layout & Elements:** Saved shipping address form (street, city, state, postal code), "Save Address" button.
- **Primary Actions:** Edit fields → "Save Address" → validates required fields → persists; this saved address is what pre-fills Checkout Fulfillment (2.7).
- **Success State:** Toast: "Address updated."
- **Error States:** Validation errors inline per field; save failure → inline banner.
- **Empty State:** No address saved yet → form renders blank with placeholder text, no error shown (this is expected first-time state).
- **Loading State:** Save button spinner + disabled.
- **Exit Points:** Back → `/profile`.

### 2.14 Profile — Payment Info
- **Route:** `/profile/payment-info`
- **Access:** Authenticated Client
- **Entry Points:** Profile screen link.
- **Layout & Elements:** List of past payment-related information tied to the account (as specified: users can "access... payment related information"). Read-focused view of payment history associated with the account.
- **Empty State:** "No payment information yet." (for a brand-new account with no orders).
- **Error State:** Fetch failure → retry banner.
- **Loading State:** Skeleton list.
- **Exit Points:** Back → `/profile`.

---

## 3. ADMIN BACKEND — Screens

### 3.1 Admin Login
- **Route:** `/login`
- **Access:** Guest
- **Entry Points:** Direct URL, auth-guard redirect, post-logout.
- **Layout & Elements:** Email, password, "Log In" button.
- **Primary Actions/Success/Error/Loading:** Identical pattern to Client Login (2.2), scoped to admin credentials/role check.
- **Error addition:** Valid credentials but non-admin role attempting admin login → "This account does not have admin access."
- **Exit Points:** Success → `/dashboard`.

### 3.2 Dashboard
- **Route:** `/dashboard`
- **Access:** Authenticated Admin
- **Entry Points:** Post-login redirect, persistent admin nav "Dashboard" link (default/home item).
- **Layout & Elements:** Persistent side/top nav (Dashboard, Products, Pricelists, Rental Periods, Settings, Quotations, Orders, Pickups, Returns, Deposits, Users). Eight metric widgets in a grid: Active Rentals, Rentals Due Today, Upcoming Pickups, Upcoming Returns, Overdue Rentals, Revenue from Rentals, Security Deposits Held, Late Fee Collection. Each widget: label, numeric value, and (for count-based widgets) click-through to the relevant filtered list.
- **Primary Actions:**
  - Click "Overdue Rentals" widget → `/orders?status=overdue` (or `/returns?filter=overdue`).
  - Click "Upcoming Pickups" widget → `/pickups`.
  - Click "Upcoming Returns" widget → `/returns`.
  - Click "Active Rentals" widget → `/orders?status=active`.
- **Loading State:** Each widget shows a skeleton/shimmer number placeholder independently (widgets can populate as their individual data resolves, not blocked on a single monolithic load).
- **Empty State:** A widget with a true zero value displays "0" plainly — this is a valid data state, not an empty state, and must never be visually indistinguishable from a loading or error state.
- **Error State:** Any widget that fails to load shows a small inline "—" with a retry icon on that widget only; other widgets remain functional (independent failure isolation).
- **Exit Points:** Nav items; widget click-throughs as listed.

### 3.3 Products — List
- **Route:** `/products`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Products."
- **Layout & Elements:** Table (thumbnail, name, category, variants summary, default price, actions), "+ New Product" button, search/filter bar.
- **Primary Actions:**
  - "+ New Product" → `/products/new`.
  - Row "Edit" → `/products/:id/edit`.
  - Row "Delete" → confirmation modal (see Modal 3.3.M1) before removal.
- **Empty State:** "No products yet. Add your first product to start renting." + "+ New Product" CTA.
- **Error State:** Fetch failure → retry banner.
- **Loading State:** Skeleton rows.
- **Modal 3.3.M1 — Delete Product Confirmation:**
  - Trigger: row "Delete" click.
  - Content: "Delete [Product Name]? This cannot be undone. Products with active or upcoming rentals cannot be deleted." (guardrail message shown proactively).
  - Confirm → if product has no active/upcoming orders, deletes and closes modal with toast "Product deleted." If product DOES have active/upcoming orders, confirm button is disabled or the delete API rejects with an error shown inline in the modal: "This product has active rentals and cannot be deleted."
  - Cancel → closes modal, no action taken.
- **Exit Points:** As listed.

### 3.4 Products — New / Edit
- **Route:** `/products/new`, `/products/:id/edit`
- **Access:** Authenticated Admin
- **Entry Points:** Products list "+ New Product" / row "Edit."
- **Layout & Elements:** Name, description, image upload, category, variant configuration (add/remove Brand, Manufacturer, Color, Size options), pricelist assignment (default pricelist auto-applied; option to assign additional pricelist), "Save Product" button, "Cancel" link.
- **Primary Actions:**
  - Fill form → "Save Product" → validates required fields (name, at least a default price via pricelist) → creates/updates product.
- **Success State:** Toast: "Product created." / "Product updated." → redirect to `/products`.
- **Error States:**
  - Missing required fields → inline field errors, submit blocked.
  - Save failure → inline banner: "Couldn't save product. Please try again."
  - Editing a product that no longer exists (bad `:id`) → "Product not found." + back link.
- **Loading State:** "Save Product" spinner + disabled; on Edit, skeleton form while existing data loads.
- **Exit Points:** "Cancel" → `/products` (discard changes, no confirmation needed if no changes made; if changes were made, show a lightweight "Discard changes?" confirm — optional but recommended for data-loss prevention).

### 3.5 Pricelists — List
- **Route:** `/pricelists`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Pricelists."
- **Layout & Elements:** Table (pricelist name, type: Default/Time-bound, date range if time-bound, linked products count), "+ New Pricelist" button. Default pricelist row is visually marked (e.g., "Default" badge) and cannot be deleted.
- **Primary Actions:** "+ New Pricelist" → `/pricelists/new`. Row "Edit" → `/pricelists/:id/edit`. Row "Delete" (disabled for the Default pricelist) → confirmation modal, same pattern as 3.3.M1 adapted to pricelists.
- **Empty State:** Only the system Default pricelist exists → this is not an "empty" state (Default always present per PRD: "one default price list which will be applicable to all products by default") — list always shows at least one row.
- **Error/Loading States:** Same pattern as 3.3.
- **Exit Points:** As listed.

### 3.6 Pricelists — New / Edit
- **Route:** `/pricelists/new`, `/pricelists/:id/edit`
- **Access:** Authenticated Admin
- **Layout & Elements:** Name, applicable products (multi-select), time period toggle (if enabled, start/end date fields appear), rate configuration, "Save Pricelist" button.
- **Primary Actions/Success/Error/Loading:** Same pattern as 3.4, scoped to pricelist fields. Additional validation: if "time-bound" toggle is on, both start and end dates are required and end must be after start.
- **Exit Points:** Save → `/pricelists`; Cancel → `/pricelists`.

### 3.7 Rental Periods
- **Route:** `/rental-periods`
- **Access:** Authenticated Admin
- **Layout & Elements:** List of configured rental period options (e.g., Daily, Weekly, Monthly — as configurable units), "+ New Rental Period" inline add (row-based add or simple modal), each row editable inline or via edit icon, delete icon with confirmation.
- **Primary Actions:** Add/edit/delete rental period definitions used elsewhere (Product Detail period picker draws from these).
- **Empty State:** "No rental periods configured yet." + add CTA (note: system should ship with sensible defaults so this state is rarely hit in practice, but the empty state must still be handled).
- **Error/Loading:** Standard patterns.
- **Modal — Delete Rental Period:** Warns if in use: "This rental period is used by existing products/orders and cannot be deleted." (guardrail).

### 3.8 Settings — Deposit & Late Fee Rules
- **Route:** `/settings/deposit-latefee`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Settings," or contextual link from Product edit screen.
- **Layout & Elements:** Deposit configuration (type: Fixed amount / Percentage of rental value, value field), Late fee configuration (unit: Hourly/Daily/Weekly/Monthly, rate, grace period duration, maximum late fee cap), "Save Settings" button. These can be global defaults and/or per-product overrides — global settings live here; per-product overrides live on the Product edit screen (3.4) if needed.
- **Primary Actions:** Edit values → "Save Settings" → validates numeric fields are positive, grace period ≥ 0, max cap ≥ 0 (or unset for no cap).
- **Success State:** Toast: "Settings updated." New rules apply to new bookings only; existing confirmed orders retain the terms in effect at booking time (stated explicitly to avoid ambiguity for the coding agent).
- **Error States:** Invalid numeric input → inline field errors. Save failure → inline banner.
- **Loading State:** Save button spinner + disabled; skeleton form on initial load.
- **Exit Points:** Nav away.

### 3.9 Quotations — List
- **Route:** `/quotations`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Quotations."
- **Layout & Elements:** Table (client name, products, created date, status: Draft/Confirmed/Expired), "+ New Quotation" button.
- **Primary Actions:** "+ New Quotation" → `/quotations/new`. Row click → `/quotations/:id`.
- **Empty State:** "No quotations yet." + CTA.
- **Error/Loading:** Standard patterns.
- **Exit Points:** As listed.

### 3.10 Quotations — New
- **Route:** `/quotations/new`
- **Access:** Authenticated Admin
- **Layout & Elements:** Quotation template selector (pre-fills header/footer per PRD: "Quotation Template for faster Quotation Creation"), client details (name, contact), product/period selection (same picker pattern as Product Detail's period picker), computed price + deposit preview, "Save as Draft" and "Save & Continue" buttons.
- **Primary Actions:**
  - "Save as Draft" → persists as Draft status, redirect to `/quotations`.
  - "Save & Continue" → persists and navigates directly to `/quotations/:id` for immediate confirmation if the client wants to rent on the spot.
- **Error States:** Missing required fields → inline errors, submit blocked. Save failure → inline banner.
- **Loading State:** Save button spinner + disabled.
- **Exit Points:** As listed; "Cancel" → `/quotations`.

### 3.11 Quotations — Detail / Confirm
- **Route:** `/quotations/:id`
- **Access:** Authenticated Admin
- **Entry Points:** Quotations list row click, Quotations New "Save & Continue."
- **Layout & Elements:** Full quotation preview (header/footer from template, client info, line items, total + deposit), status badge, "Confirm Quotation" button (visible only while status = Draft), "Edit" link (Draft only).
- **Primary Actions:**
  - "Confirm Quotation" → opens Modal 3.11.M1 (Payment Collection) since confirming creates an invoice and collects payment + deposit per PRD ("confirm the quotations and create the invoice and collect the payment with the Security Deposit").
- **Modal 3.11.M1 — Confirm & Collect Payment:**
  - Trigger: "Confirm Quotation" button.
  - Content: Final amount due (rental + deposit), payment collection fields (or "Mark as Paid" for in-person cash/card handled outside the app — recommend a simple "Payment Method" selector: Card / Cash, with amount confirmation).
  - Confirm → creates Order + Invoice from the quotation, sets quotation status to Confirmed, closes modal, shows success state on the page (status badge updates to "Confirmed," "Confirm Quotation" button replaced with "View Order" → `/orders/:id`, "Download Invoice" button appears).
  - Cancel → closes modal, no state change.
- **Error States:** Confirm action failure (e.g., product no longer available for the period) → inline error in modal: "One or more items are no longer available for the selected period." Modal stays open for correction; admin must go back to Edit to adjust before retrying.
- **Empty/Loading:** Skeleton detail layout on load; N/A empty state (always has content once loaded).
- **Exit Points:** "View Order" (post-confirm) → `/orders/:id`; back → `/quotations`.

### 3.12 Orders — List
- **Route:** `/orders`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Orders," Dashboard widget click-throughs (with query filter applied, e.g., `?status=overdue`).
- **Layout & Elements:** Table (order ID, client name, product(s), period, status badge [Upcoming/Active/Returned/Overdue], deposit status, actions), filter controls (status, date range) — filter state reflects any incoming query params from Dashboard links.
- **Primary Actions:** Row click → `/orders/:id`. Filter changes → re-query list.
- **Empty State:** Context-aware: "No orders match this filter." (when a filter is active) vs. "No orders yet." (unfiltered, brand-new system).
- **Error/Loading:** Standard patterns.
- **Exit Points:** As listed.

### 3.13 Orders — Detail
- **Route:** `/orders/:id`
- **Access:** Authenticated Admin
- **Entry Points:** Orders list, Quotation confirm success, Pickup/Return screens.
- **Layout & Elements:** Full order info (client, product(s), period, fulfillment method + address if delivery, amounts, deposit status with history log, invoice download, current status badge), contextual action buttons based on status: "Confirm Pickup" (if Upcoming and not yet picked up), "Process Return" (if Active/Overdue).
- **Primary Actions:**
  - "Confirm Pickup" → opens Modal 3.13.M1.
  - "Process Return" → opens Modal 3.13.M2.
  - "Download Invoice" → same behavior pattern as client-side invoice download.
- **Modal 3.13.M1 — Confirm Pickup:**
  - Content: Pickup checklist (simple checkbox list of items/condition confirmed at handoff), confirm button.
  - Confirm → order status moves to Active, pickup timestamp recorded, stock/availability updated, modal closes, page reflects new status immediately.
  - Cancel → no change.
  - Error: submission failure → inline modal error, retry available.
- **Modal 3.13.M2 — Process Return:**
  - Content: Actual return date/time (defaults to now, editable), product condition inspection checklist, damage reporting field (optional notes/flag), missing accessories checklist (if applicable), computed result section that updates live as fields change: shows "On-time return — full deposit refund" OR "Late return — penalty: [amount], refund: [remaining amount]" computed from the configured late fee rule against the due date vs. entered return time.
  - Confirm → executes: sets order status to Returned, deposit settlement (full refund or penalty deduction + remainder refund) per the computed result, generates a penalty invoice automatically if late (per PRD), updates stock, and — if damage was flagged — creates a repair workflow flag on the order (visible as a badge on Order Detail, no further screens required beyond this flag per current PRD scope).
  - Cancel → no change, modal closes.
  - Error: computation/submission failure → inline modal error: "Couldn't process return. Please try again."
- **Error States (page-level):** Order not found → "Order not found." + back link.
- **Loading State:** Skeleton detail layout.
- **Exit Points:** Back → `/orders`.

### 3.14 Pickups — Daily Schedule
- **Route:** `/pickups`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Pickups," Dashboard "Upcoming Pickups" widget.
- **Layout & Elements:** Date selector (defaults to today), list of orders scheduled for pickup on the selected date (client, product, address/store, status), "Confirm Pickup" quick-action per row (opens same Modal 3.13.M1 pattern inline, or navigates to `/orders/:id`).
- **Empty State:** "No pickups scheduled for [date]."
- **Error/Loading:** Standard patterns.
- **Exit Points:** Row → `/orders/:id`; quick-action modal as described.

### 3.15 Returns — Daily Schedule
- **Route:** `/returns`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Returns," Dashboard "Upcoming Returns" and "Overdue Rentals" widgets (with filter applied for the latter).
- **Layout & Elements:** Date selector + status filter (Due Today / Overdue), list of orders due/overdue for return, "Process Return" quick-action per row → same Modal 3.13.M2 pattern inline, or navigate to `/orders/:id`.
- **Empty State:** "No returns due for [date]." / "No overdue returns." (positive-framed empty state for the overdue filter).
- **Error/Loading:** Standard patterns.
- **Exit Points:** Row → `/orders/:id`; quick-action modal as described.

### 3.16 Deposits — Ledger/History
- **Route:** `/deposits`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Deposits," Dashboard "Security Deposits Held" widget.
- **Layout & Elements:** Table of all deposit transactions (order ID, client, amount collected, status: Held/Refunded/Partially Deducted, deduction amount if applicable, date settled), filter by status.
- **Empty State:** "No deposit activity yet."
- **Error/Loading:** Standard patterns.
- **Exit Points:** Row click → `/orders/:id` (source order).

### 3.17 Users — Management
- **Route:** `/users`
- **Access:** Authenticated Admin
- **Entry Points:** Nav "Users."
- **Layout & Elements:** Table of portal user records (name, email, join date, order count), search bar. (Scope note: this is record management/visibility per PRD's "Manage the User Records" responsibility — no user-editing-by-admin actions are specified in the source document, so this screen is read/search only unless a specific edit action is later defined.)
- **Empty State:** "No registered users yet."
- **Error/Loading:** Standard patterns.
- **Exit Points:** N/A beyond nav.

---

## 4. Cross-Cutting Behaviors (Apply to Both Apps)

### 4.1 Session Expiry
- Any API call returning a 401 mid-session → clear local session, show a non-blocking toast "Your session has expired. Please log in again," redirect to the respective `/login`.

### 4.2 Network Offline
- If the client detects loss of connectivity (browser offline event), show a persistent top banner: "You're offline. Some features may not work." Banner clears automatically on reconnect.

### 4.3 Form Navigation Guard
- Any multi-field form (Product edit, Pricelist edit, Quotation new, Settings) with unsaved changes → attempting to navigate away (route change or browser back) triggers a lightweight confirm: "Discard unsaved changes?" Confirm proceeds, Cancel stays on the form.

### 4.4 Toast/Snackbar Standard
- All success toasts auto-dismiss after 4 seconds, positioned consistently (e.g., top-right), stack if multiple fire in quick succession rather than overlapping.

### 4.5 Currency & Date Formatting
- All monetary values render with a consistent currency symbol/format across both apps. All dates/times render in a consistent format and, where a due date/time is shown, timezone handling must be consistent (store and compare in a single canonical timezone, e.g., UTC, to avoid late-fee miscalculation at return time).

### 4.6 Status Badge Color Convention (used across My Rentals, Orders, Pickups, Returns)
- Upcoming = blue, Active = green, Overdue = red, Returned = gray, Draft (quotations) = amber, Confirmed (quotations) = green.

---

## 5. Screen-to-Feature Traceability

| Screen | PRD Feature Reference |
|---|---|
| Splash, Login, Sign Up (both apps) | F1 Authentication |
| Product Browse, Product Detail, Cart, Checkout (Fulfillment/Payment/Success) | F2 Client Rental Workflow |
| My Rentals List/Detail, Profile screens | F2 Client order/profile management |
| Quotations List/New/Detail | F3 Admin Offline Workflow |
| Dashboard | F4 Rental Operations Dashboard |
| Deposits ledger, Return Processing modal | F5 Security Deposit Management |
| Settings — Deposit & Late Fee, Return Processing modal | F6 Late Return Fee Management |
| Pickups schedule, Returns schedule, Order Detail modals | F7 Pickup & Return Management |
| Products, Pricelists, Rental Periods screens | F8 Price & Attributes |
| Users screen | Admin "Manage User Records" responsibility |