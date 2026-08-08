# Rental Management MVP — Web App Flow Specification
**For:** AI coding agent implementation 
**Scope:** Single role (Admin), no customer portal, no payment gateway

---

## 0. Global Rules (apply to every screen unless overridden)

- **Auth gate:** Every screen except Login requires an active session. No session → redirect to `/login`.
- **Loading state:** Any screen fetching data shows a skeleton/spinner in place of content for max 1 loading pattern per screen (don't mix spinner + skeleton on same screen).
- **Toast pattern:** All success/error confirmations after an action use a toast (top-right, auto-dismiss 4s for success, manual-dismiss for errors). Toasts never block navigation.
- **Currency formatting:** All money values shown as `Rs. X.XX` (2 decimals), right-aligned in tables.
- **Date formatting:** All dates shown as `DD MMM YYYY` (e.g. `08 Aug 2026`). All date inputs use a date picker, not free text.
- **Destructive actions** (delete, cancel rental) always require a confirmation modal — never fire on single click.
- **Empty states** always include: an icon/illustration placeholder, one line of explanatory text, and one primary CTA button (never a dead end).
- **Form validation:** Inline, on blur + on submit. Errors shown below the field in red text. Submit button disabled only when required fields are empty; otherwise always clickable (show validation errors on click, don't silently disable).

---

## 1. Navigation Hierarchy (Information Architecture)

```
/login
  └── (authenticated shell — persistent left sidebar + top bar)
        ├── /dashboard                      (default landing after login)
        ├── /products                       (list)
        │     └── /products/new             (modal, not route change)
        │     └── /products/:id/edit        (modal, not route change)
        ├── /rentals
        │     ├── /rentals/new              (full page, multi-step not needed — single page form)
        │     └── /rentals/:id              (rental detail page)
        └── /logout                         (action, not a page)
```

**Sidebar (persistent, left, always visible on authenticated shell):**
- Logo/App name (top)
- Nav items: `Dashboard` | `Rentals` | `Products`
- Bottom: logged-in admin name + `Logout` link

**Top bar (persistent):**
- Page title (left) — reflects current screen
- Primary action button (right) — contextual: `+ New Rental` on Dashboard/Rentals, `+ New Product` on Products

No breadcrumbs needed — hierarchy is only 2 levels deep.

---

## 2. Screen-by-Screen Specification

### 2.1 `/login` — Login Screen

**Layout:** Centered card on plain background, no sidebar/top bar (unauthenticated shell).

**Fields:**
- Username or Email (text input, required)
- Password (password input, required, with show/hide toggle icon)
- `Log In` button (primary, full width of card)

**Actions:**
- Submit form → `POST /api/auth/login`
  - **Success:** store session token, redirect to `/dashboard`
  - **Error (invalid credentials):** inline error banner above form fields: "Incorrect username or password." Fields remain filled except password (cleared).
  - **Error (server/network):** toast: "Something went wrong. Please try again."
- Pressing Enter in either field submits the form.

**Empty state:** N/A (static form).
**Success state:** Immediate redirect — no separate success screen.
**Error state:** As above; error banner persists until next submit attempt.

---

### 2.2 `/dashboard` — Rental Operations Dashboard

**Layout:** Grid of stat cards (top row) + a filterable rentals table (below).

**Stat Cards (top row, 4 cards, horizontally scrollable on mobile):**
1. **Active Rentals** — count of rentals with status `Active`
2. **Due Today** — count of rentals where `due_date == today` and status `Active`
3. **Overdue** — count of rentals where `due_date < today` and status `Active`, styled in red/warning color
4. **Deposits Held** — sum of `deposit_amount` across all `Active` rentals, shown as currency

Each card is clickable → filters the table below to that subset (except Deposits Held, which is display-only, not clickable).

**Rentals Table (below cards):**
Columns: `Customer Name` | `Product` | `Start Date` | `Due Date` | `Status` | `Deposit` | Action (view icon/arrow)

- Status column uses colored badges: `Active` (blue), `Overdue` (red), `Completed` (gray)
- Default sort: `Due Date` ascending (soonest first)
- Table is filterable by the stat-card click (adds a filter chip above table, e.g. "Filtered: Overdue ✕" — clicking ✕ clears filter)
- Row click → navigates to `/rentals/:id`

**Empty state (no rentals exist at all):**
- Illustration + text: "No rentals yet. Create your first rental to see it here."
- CTA button: `+ New Rental` → navigates to `/rentals/new`

**Empty state (filter applied, zero matches):**
- Text only (no illustration): "No rentals match this filter."
- Link: "Clear filter"

**Loading state:** Stat cards show skeleton pulse boxes; table shows 5 skeleton rows.

**Error state (API fetch fails):** Full-width banner above cards: "Couldn't load dashboard data." with a `Retry` button. Cards and table area remain empty until retry succeeds.

---

### 2.3 `/products` — Product List

**Layout:** Top bar has `+ New Product` button (top-right). Simple table below.

**Table Columns:** `Product Name` | `Daily Rate` | `Deposit Amount` | `Quantity Available` | Action (`Edit` / `Delete` icons)

- Default sort: alphabetical by Product Name
- No search/filter needed for MVP (assume small catalog)

**Actions:**
- `+ New Product` → opens **Add Product Modal** (2.3a)
- Row `Edit` icon → opens **Edit Product Modal** (2.3b), pre-filled
- Row `Delete` icon → opens **Delete Confirmation Modal** (2.3c)

**Empty state:**
- Illustration + text: "No products added yet. Add your first rental product to get started."
- CTA: `+ New Product`

**Loading state:** Table shows 5 skeleton rows.

**Error state:** Banner: "Couldn't load products." + `Retry` button.

---

#### 2.3a Modal: Add Product

**Trigger:** `+ New Product` button.
**Layout:** Centered modal, overlay dims background, closable via `✕` icon or clicking outside.

**Fields:**
- Product Name (text, required, max 100 chars)
- Daily Rate (currency input, required, must be > 0)
- Deposit Amount (currency input, required, must be ≥ 0)
- Quantity Available (number input, required, integer ≥ 1)

**Actions:**
- `Cancel` → closes modal, discards input, no confirmation needed (non-destructive since nothing was saved)
- `Save Product` (primary) → `POST /api/products`
  - **Success:** modal closes, toast: "Product added." Table refreshes, new row appears (sorted into place).
  - **Validation error:** inline field errors (e.g. "Daily Rate must be greater than 0"), modal stays open.
  - **Server error:** toast: "Couldn't save product. Please try again." Modal stays open with entered data intact.

---

#### 2.3b Modal: Edit Product

Same layout/fields as Add Product, pre-filled with existing values. Button label: `Save Changes` instead of `Save Product`.

**Actions:**
- `Save Changes` → `PUT /api/products/:id`
  - **Success:** modal closes, toast: "Product updated." Table row updates in place.
  - **Validation/server error:** same pattern as Add Product.

---

#### 2.3c Modal: Delete Product Confirmation

**Trigger:** `Delete` icon on a product row.
**Layout:** Small centered modal, no form fields.

**Content:** "Delete [Product Name]? This can't be undone." + warning icon.

**Special rule:** If the product has any `Active` rentals referencing it, the delete action is blocked:
- Modal instead shows: "This product can't be deleted — it has active rentals." + single `OK` button (no delete option shown).

**Actions (when deletable):**
- `Cancel` → closes modal, no action taken
- `Delete` (destructive red button) → `DELETE /api/products/:id`
  - **Success:** modal closes, toast: "Product deleted." Row removed from table.
  - **Error:** toast: "Couldn't delete product." Modal closes regardless (retry by re-clicking delete).

---

### 2.4 `/rentals/new` — Create Rental (full page, single-step form)

**Layout:** Single-column form, max-width centered, top bar title: "New Rental."

**Fields (in order):**
1. **Product** — dropdown/select, required. Populated from `/api/products` (only products with `Quantity Available > 0` shown). Selecting a product auto-fills read-only helper text below the field: "Daily rate: $X.XX · Suggested deposit: $Y.YY"
2. **Customer Name** — text, required
3. **Customer Phone** — text, required, basic format validation (digits, min 7 chars)
4. **Start Date** — date picker, required, defaults to today, cannot be in the past
5. **Due Date** — date picker, required, must be after Start Date
6. **Deposit Amount** — currency input, required, pre-filled from selected product's deposit amount but editable

**Computed/display-only field (not editable, appears once Product + dates are set):**
- "Rental Duration: X day(s)" — auto-calculated from Start/Due dates

**Actions:**
- `Cancel` → navigates back to `/rentals` or `/dashboard` (wherever user came from), no confirmation (nothing persisted yet)
- `Create Rental` (primary) → `POST /api/rentals`
  - **Success:** redirect to `/rentals/:id` (the newly created rental's detail page), toast: "Rental created."
  - **Validation error:** inline errors per field, form stays populated
  - **Server error (e.g. product quantity became 0 in the meantime):** toast: "This product is no longer available." Product field highlighted, user must pick another product.

**Empty state:** N/A (form always renders; if no products exist, Product dropdown shows disabled placeholder "No products available" and `Create Rental` button is disabled with helper text: "Add a product first." + link to `/products`.)

---

### 2.5 `/rentals/:id` — Rental Detail

**Layout:** Two-section page — top summary card, bottom status/action area.

**Summary Card (top):**
- Customer Name, Phone
- Product Name
- Start Date → Due Date
- Status badge (`Active` / `Overdue` / `Completed`)
- Deposit Collected: $X.XX

**Conditional banner (only if status is `Overdue`):**
- Red banner: "This rental is overdue by N day(s)."

**Action Area (bottom) — content depends on status:**

**If status = `Active` or `Overdue`:**
- Single button: `Mark as Returned` (primary) → opens **Return Modal** (2.5a)

**If status = `Completed`:**
- Read-only **Settlement Summary** block:
  - Actual Return Date
  - Days Late: N (0 if on time)
  - Late Fee Charged: $X.XX
  - Deposit Refunded: $Y.YY
  - "Settled on [date]" timestamp

**Loading state:** Skeleton for summary card, action area hidden until loaded.

**Error state (rental not found / fetch fails):** Full-page message: "Rental not found." + button `Back to Dashboard`.

---

#### 2.5a Modal: Mark as Returned

**Trigger:** `Mark as Returned` button on Rental Detail.

**Fields:**
- Actual Return Date — date picker, required, defaults to today, cannot be before Start Date

**Live calculation (updates as date changes, shown below the field, read-only):**
- If Return Date ≤ Due Date: "On time — full deposit of $X.XX will be refunded."
- If Return Date > Due Date:
  - Days Late = Return Date − Due Date
  - Late Fee = Days Late × Product Daily Rate, **capped at Deposit Amount**
  - Display: "Late by N day(s) — Late fee: $X.XX. Refund due: $Y.YY" (Refund = Deposit − Late Fee, minimum $0.00)

**Actions:**
- `Cancel` → closes modal, no changes
- `Confirm Return` (primary) → `POST /api/rentals/:id/return`
  - **Success:** modal closes, toast: "Rental settled. Refund: $Y.YY." Rental Detail page refreshes to `Completed` state, Settlement Summary now shown.
  - **Validation error** (e.g. return date before start date): inline error under date field, modal stays open.
  - **Server error:** toast: "Couldn't process return. Please try again." Modal stays open, entered date retained.

---

## 3. Cross-Cutting Interaction Rules

### 3.1 Status Derivation (not manually set — always computed)
- `Active`: rental created, `return not yet confirmed`, `due_date >= today`
- `Overdue`: rental created, `return not yet confirmed`, `due_date < today`
- `Completed`: return has been confirmed via the Return Modal
- Status badge color and dashboard counts must always reflect this computed value, recalculated on every page load (not cached/stale).

### 3.2 Modal vs. Full Page Rule
- **Modals** are used only for: Add/Edit/Delete Product, Mark as Returned — all short, single-purpose, low-field-count interactions.
- **Full pages** are used for: Create Rental (6 fields, needs breathing room), Rental Detail (multiple data sections).
- No nested modals (a modal never opens another modal).

### 3.3 Navigation After Actions
| Action | Destination after success |
|---|---|
| Login | `/dashboard` |
| Create Rental | `/rentals/:id` (new rental) |
| Confirm Return | Stay on `/rentals/:id`, now showing Completed state |
| Add/Edit/Delete Product | Stay on `/products`, modal closes |
| Logout | `/login` |

### 3.4 Concurrent-Edit / Race Conditions (minimum handling for MVP)
- If a product's quantity hits 0 while a Create Rental form is open, server rejects on submit (see 2.4 error state) — no real-time locking needed for MVP.
- No optimistic UI updates for Create Rental or Return actions — wait for server confirmation before navigating/updating state, since money calculations must reflect server truth.

---

## 4. Implied Data Model (for reference — not a schema spec, just field inventory)

**Product:** `id, name, daily_rate, deposit_amount, quantity_available`

**Rental:** `id, product_id, customer_name, customer_phone, start_date, due_date, deposit_amount, status (computed), actual_return_date (null until returned), late_fee_charged (null until returned), deposit_refunded (null until returned), settled_at (null until returned)`

**Admin (auth only):** `id, username, password_hash`

---

## 5. Screens Not Included in MVP (explicitly, to prevent scope creep by the coding agent)

Do **not** build: customer login/portal, payment gateway screens, quotation builder, product variants/pricelist screens, pickup/route planning, notifications center, analytics/reports beyond the 4 dashboard cards, barcode/QR scanning UI, multi-admin/role management. These belong to the full PRD, not this MVP build.