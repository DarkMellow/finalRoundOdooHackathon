# Product Requirements Document
## Rental Management System

**Version:** 2.0 (revised — scoped strictly to source problem statement)
**Build Constraint:** 18 hours, 3 developers, AI-assisted development
**Status:** Draft for Build Kickoff

**Team:**
| Member | Allocation |
|---|---|
| Aditya | Full backend + 1/8 frontend |
| Ankan | 5/8 frontend |
| Ayan | 2/8 frontend |

---

## 1. App Overview

An enhanced Rental Management experience that lets rental businesses monitor their operations from a single interface while automating common rental workflows — improving operational efficiency, reducing manual intervention, and giving better visibility into rental activities across the complete rental lifecycle.

**Two user-facing surfaces (as defined in the problem statement):**
- **Frontend / Portal** — used by the Client/Portal User to browse, rent, pay, and manage orders.
- **Backend** — used by the Admin to configure the system and manage day-to-day rental operations.

---

## 2. Target User Personas

### Persona 1 — Admin
Manages organization-wide rental operations, customer information, and rental product records.

**Responsibilities (as specified):**
- Create Product, Pricelist, Rental Period
- Manage User Records
- Configure organization-specific rental settings
- Maintain pricelist, late fees, deposit amount, pickup and return rules
- Create Quotation Templates and Header/Footer for quotations sent to clients
- Create quotations for offline/in-store clients; confirm quotations and create invoices for on-the-spot rentals
- Collect payment with security deposit at confirmation
- At return: check product and timing; refund security deposit if on time, or calculate penalty, deduct from deposit, and refund the remainder if late

### Persona 2 — Client / Portal User
Registers on the portal, browses products, and manages their own rental activity.

**Can do (as specified):**
- Register and manage their profile
- Browse products on the rental website
- Select a product and rent it for a specific period
- Add a delivery address, or select to collect the product from store
- Provide payment information
- Access and manage all their rental orders, shipping address, profile & profile image, and payment-related information
- Download invoice after payment
- Visit the store at the specified time to return the product
- Receive full security deposit back if returned on time; penalty deducted from deposit if returned late

---

## 3. Core Pain Points (from Business Challenges section)

| # | Pain Point |
|---|---|
| 1 | No centralized dashboard to monitor ongoing rental operations |
| 2 | Difficulty tracking products scheduled for pickup and return |
| 3 | Manual calculation of late return charges |
| 4 | Lack of visibility into overdue rentals requiring immediate attention |
| 5 | Security deposits are often managed outside the rental workflow, making reconciliation difficult |
| 6 | Limited operational insights for rental managers to prioritize daily activities |

---

## 4. Feature Specifications

### F1. Authentication
- Splash Screen → Login → Sign Up
- Portal user login and new user registration
- Profile creation
- After successful authentication, users are redirected to the dashboard

### F2. Client/Portal User — Rental Workflow
- Login to the rental website, browse products
- Select product and rental period, add to cart
- Add shipping details, or select to collect from store
- Add payment information and pay (rental + security deposit)
- Download invoice after payment
- Visit store at the specified time to return the product
- Manage: rental orders, shipping address, profile & profile image, payment-related information

### F3. Admin — Offline/In-Store Rental Workflow
- Create quotation for a walk-in client
- If client wants to rent on the spot: confirm quotation → create invoice → collect payment with security deposit
- At return: check product and timing; if on time, return the full security deposit; if late, calculate penalty, deduct from deposit, refund remainder

### F4. Rental Operations Dashboard (Admin)
Real-time visibility into rental activities, including:
- Active Rentals
- Rentals Due Today
- Upcoming Pickups
- Upcoming Returns
- Overdue Rentals
- Revenue from Rentals
- Security Deposits Held
- Late Fee Collection

### F5. Rental Security Deposit Management
- Collect security deposits during confirmation
- Support fixed amount or percentage-based deposits
- Track deposit payment status
- Hold deposits until products are successfully returned
- On-time return: security deposit refunded in full, no deduction
- Late return: penalty calculated and deducted from security deposit
- Maintain complete deposit history

### F6. Late Return Fee Management
- Automatically detect overdue returns (returned after the specified time period = Late Return)
- Penalty amount deducted from security deposit; remaining amount refunded to client in cash
- Configurable charging rules
- Hourly, daily, weekly, or monthly late fee calculation
- Grace period configuration
- Maximum late fee limits
- Automatic invoice generation
- Clear visibility of outstanding penalties

### F7. Pickup & Return Management

**Pickup:**
- Daily pickup schedule
- Route or sequence planning
- Pickup confirmation
- Customer notifications
- Barcode or QR code scanning
- Pickup checklist

**Return:**
- Daily return schedule
- Product condition inspection
- Damage reporting
- Missing accessories verification
- Return confirmation
- Automatic stock updates
- Deposit settlement
- Late fee calculation
- Repair workflow initiation when required

### F8. Price & Attributes
- One default pricelist applicable to all products by default
- User can create multiple pricelists as required
- Some pricelists are for a specific time period
- Create product variants: Brand, Manufacturer, Color, Size

---

## 5. User Stories & Acceptance Criteria

**US-1 — Portal user registers and logs in**
*As a portal user, I want to register and log in, so I can access the rental platform.*
- AC1: Splash screen is shown, followed by Login/Sign Up.
- AC2: New user can register and create a profile.
- AC3: On successful login, user is redirected to the dashboard.

**US-2 — Client books a rental**
*As a client, I want to browse products, select a rental period, and pay, so I can rent an item.*
- AC1: User can select a product and rental period, and add it to the cart.
- AC2: User can add shipping details or select "collect from store."
- AC3: User can provide payment information and pay the rental amount plus security deposit.
- AC4: After payment, the user can download the invoice.

**US-3 — Client returns a product on time**
*As a client, I want my full security deposit back if I return on time.*
- AC1: Product is returned at the store at the specified time.
- AC2: Security deposit is refunded in full, no deduction.

**US-4 — Client returns a product late**
*As a client, I understand a penalty will apply if I return late.*
- AC1: Return after the specified time period is marked as a Late Return.
- AC2: Penalty is calculated per the configured late fee rule.
- AC3: Penalty is deducted from the security deposit.
- AC4: Remaining deposit amount is refunded to the client in cash.

**US-5 — Admin creates a quotation for a walk-in client**
*As an admin, I want to create a quotation for an offline client, so I can convert it to a rental on the spot.*
- AC1: Admin creates a quotation using a quotation template.
- AC2: If the client wants to rent on the spot, admin confirms the quotation.
- AC3: Confirming the quotation creates an invoice and collects payment with security deposit.

**US-6 — Admin processes a return**
*As an admin, I want to check the product and timing at return, so I can settle the deposit correctly.*
- AC1: Admin checks product condition and return timing.
- AC2: If on time, admin returns the full security deposit.
- AC3: If late, system calculates the penalty, deducts it from the deposit, and refunds the remainder.

**US-7 — Admin views the operations dashboard**
*As an admin, I want a dashboard of ongoing rental activity, so I can prioritize my day.*
- AC1: Dashboard displays Active Rentals, Rentals Due Today, Upcoming Pickups, Upcoming Returns, and Overdue Rentals.
- AC2: Dashboard displays Revenue from Rentals, Security Deposits Held, and Late Fee Collection.

**US-8 — Admin configures products, pricelists, and rental periods**
*As an admin, I want to create products, pricelists, and rental periods, so the catalog and pricing are correct.*
- AC1: Admin can create a product with a default pricelist.
- AC2: Admin can create additional pricelists, including time-bound ones.
- AC3: Admin can create product variants (Brand, Manufacturer, Color, Size).
- AC4: Admin can configure rental periods.

**US-9 — Admin configures late fee and deposit rules**
*As an admin, I want to configure late fee and deposit settings, so charges are applied consistently.*
- AC1: Admin can set deposit amount as fixed or percentage-based.
- AC2: Admin can set late fee calculation as hourly, daily, weekly, or monthly.
- AC3: Admin can configure a grace period and a maximum late fee limit.

**US-10 — Admin manages pickup and return**
*As an admin, I want to manage pickup and return schedules, so operations run smoothly.*
- AC1: Admin can view a daily pickup schedule and daily return schedule.
- AC2: Admin can confirm pickup and confirm return.
- AC3: On return, admin can record product condition inspection, damage reporting, and missing accessories verification.
- AC4: Return confirmation triggers automatic stock update and deposit settlement.

**US-11 — Client manages their profile and orders**
*As a client, I want to manage my orders, address, and profile, so my account stays up to date.*
- AC1: Client can view and manage all rental orders.
- AC2: Client can update shipping address.
- AC3: Client can update profile and profile image.
- AC4: Client can view payment-related information.

---

## 6. MVP vs Post-MVP Roadmap (18 hours, 3 developers)

The problem statement's core requirements (Sections 1–5 of the source document: Dashboard, Security Deposit Management, Late Return Fee Management, Pickup & Return Management, Price & Attributes) plus Authentication and the Client/Admin workflows form the target scope. The document's own "Bonus Ideas" section is separated out as optional/stretch, exactly as it is framed in the source.

### MVP — Core Requirements (target: full build within 18 hours)
| Feature | Owner(s) |
|---|---|
| Authentication (Splash, Login, Sign Up, Profile creation) | Aditya (backend) + frontend (Ankan/Ayan) |
| Product, Pricelist, Rental Period creation (Admin) | Aditya (backend) + frontend |
| Product variants (Brand, Manufacturer, Color, Size) | Aditya (backend) + frontend |
| Default pricelist + multiple/time-bound pricelists | Aditya (backend) + frontend |
| Client rental flow: browse → select period → cart → shipping/store pickup → pay → invoice | Aditya (backend) + Ankan/Ayan (frontend) |
| Client order/profile management (orders, address, profile, photo, payment info) | Aditya (backend) + Ankan/Ayan (frontend) |
| Admin quotation → invoice flow (template, confirm, collect payment + deposit) | Aditya (backend) + frontend |
| Security Deposit Management (collect, hold, refund/deduct, history) | Aditya (backend) + frontend |
| Late Return Fee Management (auto-detect, configurable rules, grace period, max cap, auto-invoice) | Aditya (backend) + frontend |
| Pickup & Return Management (schedules, confirmation, condition inspection, damage/missing accessories, stock update, deposit settlement) | Aditya (backend) + frontend |
| Rental Operations Dashboard (all 8 specified widgets) | Aditya (backend) + frontend |

### Bonus / Stretch (only if MVP finishes early — as labeled "Bonus Ideas" in the source document)
- Predictive maintenance suggestions
- Smart pickup route optimization
- Automatic customer reminders
- Product availability forecasting
- Mobile-first rental operations
- Barcode/QR scanning
- IoT-enabled asset tracking
- Customizable dashboard widgets
- KPI and business analytics

### Suggested work split across the 18 hours

**Aditya (full backend + 1/8 frontend):**
- Owns the entire data model and API: auth, users/roles, products, variants, pricelists, rental periods, quotations, orders, invoices, security deposit engine, late fee engine, pickup/return state machine, dashboard aggregation endpoints.
- Takes the smallest, most backend-adjacent frontend slice (1/8) — e.g., admin configuration screens (pricelist/late-fee/deposit rule setup) that map closely to the API he's building.

**Ankan (5/8 frontend):**
- Largest frontend share — the primary Client/Portal experience: Splash/Login/Sign Up, product browsing, cart, checkout (shipping/store pickup, payment, deposit), invoice download, "My Rentals," profile & address management.

**Ayan (2/8 frontend):**
- Admin-facing frontend: Rental Operations Dashboard (8 widgets), quotation creation/confirmation screens, pickup & return processing screens (checklist, condition inspection, damage reporting).

### Suggested hour-by-hour checkpoints
- **Hr 0–1:** Agree on the shared data model/API contract (Aditya) across all core entities; repo and tooling setup.
- **Hr 1–8:** Aditya builds backend APIs in priority order (auth → products/pricelist/variants → orders/quotations → deposit & late-fee engines → pickup/return → dashboard). Ankan builds client-facing screens against the contract. Ayan builds admin-facing screens against the contract.
- **Hr 8–13:** Full integration — wire frontend screens to live backend endpoints; deposit refund and late-fee math tested against real scenarios.
- **Hr 13–16:** End-to-end testing of both workflows (portal booking → return → refund/penalty; admin quotation → invoice → return → refund/penalty); bug fixing.
- **Hr 16–18:** Polish, demo data seeding, rehearse full walkthrough of both user flows.

---

## 7. Success KPIs (mapped to the source document's Expected Outcome)

The source document defines the expected outcome as: simplify rental operations, reduce manual work, improve operational visibility, automate repetitive rental tasks, enhance customer experience, and enable faster operational decisions through real-time insights. These translate to measurable KPIs as follows:

| Expected Outcome (source) | KPI |
|---|---|
| Simplify rental operations | End-to-end rental flow (book → pay → pickup → return → settle) completes without manual workarounds |
| Reduce manual work | Zero manual late fee or deposit calculations required by admin |
| Improve operational visibility | Dashboard accurately reflects Active/Due Today/Upcoming/Overdue rentals at all times |
| Automate repetitive rental tasks | Deposit refund and late fee deduction are fully automatic on return confirmation |
| Enhance customer experience | Client can complete booking, payment, invoice download, and order tracking without admin intervention |
| Enable faster operational decisions through real-time insights | All 8 dashboard metrics (Active Rentals, Due Today, Upcoming Pickups, Upcoming Returns, Overdue Rentals, Revenue, Deposits Held, Late Fee Collection) are live and accurate |

---

## 8. Mockup Reference
- Excalidraw mockup: https://app.excalidraw.com/l/65VNwvy7c4X/5l50ctoqUXw