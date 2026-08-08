# Rental Management System — MVP PRD
**Scope:** 6-hour build | **Owner:** Product | **Status:** Draft v1

---

## 1. The Single Primary Problem

Rental businesses have **no centralized way to track what's rented, what's due back, and what deposit money is at stake** — everything lives in someone's head, a notebook, or scattered spreadsheets. This causes late returns to go unnoticed, deposits to get reconciled manually (or not at all), and no one has a real-time view of "what needs attention today."

**MVP bet:** If we give an admin one screen that shows active rentals + what's overdue + deposit status, and automate the late-fee math, we remove the single biggest daily pain point — everything else (customer portal, quotations, IoT, route planning) is v2+.

---

## 2. Out of Scope (explicitly cut for MVP)
- Customer-facing portal/login/self-checkout
- Online payments/payment gateway integration
- Quotation templates, pricelists, product variants
- Route planning, barcode/QR scanning, IoT tracking
- Damage/repair workflows, notifications, analytics/KPIs
- Multi-admin roles/permissions

These are real, valuable, and listed in the source doc — but none of them are required to prove the core loop: **rent → track → return → settle deposit.**

---

## 3. Core Essential Features (MVP only)

| # | Feature | Why it's essential |
|---|---------|---------------------|
| 1 | **Product catalog (basic)** | Admin needs something to rent out. Name, quantity, daily rate, deposit amount. |
| 2 | **Create Rental (manual, admin-only)** | Admin selects product, customer name/phone, rental period, deposit amount. Generates a rental record. No online booking. |
| 3 | **Operations Dashboard** | Single screen: Active Rentals, Due Today, Overdue, Deposits Held. This *is* the product. |
| 4 | **Return + Late Fee Automation** | Admin marks a rental "Returned." System compares return date vs. due date, auto-calculates late fee (simple daily rate), deducts from deposit, shows refund amount. |
| 5 | **Deposit Ledger (basic)** | Every rental shows: deposit collected → deposit deducted (if late) → deposit refunded. No accounting integration — just a status trail. |

**Everything else from the source doc is a stretch goal, not MVP.**

---

## 4. Bare-Minimum User Journey (Admin-only, single role)

```
1. Admin logs in (basic auth, no roles/permissions)
        ↓
2. Admin adds a product (name, rate/day, deposit amount)
        ↓
3. Admin creates a rental:
   - Pick product → pick customer name/phone → pick rental dates → confirm deposit
        ↓
4. Rental appears on Dashboard under "Active Rentals" / "Due Today"
        ↓
5. On return: Admin opens rental → clicks "Mark Returned" → enters actual return date
        ↓
6. System auto-calculates:
   - On time → full deposit refund shown
   - Late → late fee = (days late × daily rate), capped at deposit amount → shown refund = deposit − fee
        ↓
7. Admin clicks "Settle" → rental moves to "Completed," dashboard counters update
```

No customer login. No payment gateway. No notifications. Admin does everything, in person or over the phone — exactly how it already works today, just tracked in one place instead of a notebook.

---

## 5. MVP Success Criteria
- An admin can create a rental in under 60 seconds.
- Dashboard correctly shows overdue rentals with zero manual calculation.
- Late fee + deposit refund amount is 100% automated (no manual math).
- Entire flow (add product → rent → return → settle) works end-to-end in a live demo.

---

## 6. Build Priority (if time runs short, cut in this order)
1. ~~Deposit ledger detail view~~ → just show final numbers, skip full history log
2. ~~Multiple products per rental~~ → single product per rental only
3. ~~Editable late-fee rules~~ → hardcode a flat daily late rate
4. **Never cut:** Dashboard, Create Rental, Return + Auto Late Fee — this is the whole product.