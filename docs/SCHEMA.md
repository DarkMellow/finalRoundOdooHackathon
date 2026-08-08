# Relational SQL Backend Schema Specification (MySQL)

**Document Version:** 2.0  
**Target Database Engine:** MySQL 8.0+ / MariaDB 10.5+  
**Author:** Senior Database Architect  
**Scope:** Relational tables, datatypes, constraints, indices, foreign key cascades, DDL scripts, and SQLModel python class definitions.

---

## 1. Executive Database Summary

This document specifies the MySQL 8.0+ relational schema designed to support the dual-surface (Client Portal + Admin Backend) Rental Management System.

### Core Database Rules:
1.  **Monetary Consistency**: All currency values (`rate`, `deposit_amount`, `late_fee_charged`, `deposit_refunded`, `amount_due`, `amount_paid`) must use the **`DECIMAL(10, 2)`** datatype to prevent floating-point rounding anomalies.
2.  **Temporal Consistency**: System event times (`created_at`, `updated_at`, `settled_at`, `pickup_confirmed_at`) use the **`DATETIME`** type, and all timestamps are stored in UTC. Operational business dates (`start_date`, `due_date`, `actual_return_date`) use the **`DATE`** type.
3.  **Relational Integrity**: Mandatory `FOREIGN KEY` constraints are enforced at the database level. Deletions of products or components linked to active or upcoming orders are blocked (`ON DELETE RESTRICT`). Cascading deletes are restricted to user profile details and transient child records (e.g., user addresses, pricelist entries).
4.  **Value Boundaries**: Column restrictions and `CHECK` constraints (supported in MySQL 8.0.16+) enforce boundary validation directly at insertion time (e.g., product quantity $\ge 0$, pricing rates $> 0$).

---

## 2. Entity-Relationship Diagram (ERD)

The following Mermaid diagram outlines the entity schemas, key constraints, and logical relations:

```mermaid
erDiagram
    users {
        int id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar profile_image_url
        datetime created_at
        datetime updated_at
    }

    user_addresses {
        int id PK
        int user_id FK
        varchar street
        varchar city
        varchar state
        varchar postal_code
        boolean is_default
        datetime created_at
    }

    admins {
        int id PK
        varchar username UK
        varchar password_hash
        datetime created_at
    }

    rental_periods {
        int id PK
        varchar name UK
        int duration_days
        datetime created_at
    }

    pricelists {
        int id PK
        varchar name
        boolean is_default
        date start_date
        date end_date
        datetime created_at
    }

    products {
        int id PK
        varchar name INDEX
        text description
        varchar image_url
        int quantity_available
        datetime created_at
        datetime updated_at
    }

    product_variants {
        int id PK
        int product_id FK
        varchar sku UK
        varchar brand
        varchar manufacturer
        varchar color
        varchar size
        int quantity_available
        datetime created_at
    }

    pricelist_items {
        int id PK
        int pricelist_id FK
        int product_id FK
        int variant_id FK
        int rental_period_id FK
        decimal rate
        decimal deposit_amount
        datetime created_at
    }

    quotations {
        int id PK
        varchar client_name
        varchar client_email
        varchar client_phone
        varchar status
        text template_header
        text template_footer
        datetime created_at
        datetime expired_at
    }

    quotation_items {
        int id PK
        int quotation_id FK
        int product_id FK
        int variant_id FK
        int rental_period_id FK
        date start_date
        date due_date
        decimal rate
        decimal deposit_amount
    }

    orders {
        int id PK
        int user_id FK
        int quotation_id FK
        varchar customer_name
        varchar customer_phone
        varchar customer_email
        varchar status
        varchar fulfillment_method
        text shipping_address
        varchar payment_method
        varchar payment_status
        decimal deposit_amount
        varchar deposit_status
        datetime created_at
    }

    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int variant_id FK
        int rental_period_id FK
        date start_date
        date due_date
        decimal rate
        decimal deposit_amount
        datetime pickup_confirmed_at
        text pickup_checklist
        date actual_return_date
        text return_checklist
        decimal late_fee_charged
        decimal deposit_refunded
        datetime settled_at
    }

    invoices {
        int id PK
        int order_id FK
        varchar invoice_number UK
        varchar invoice_type
        decimal amount_due
        decimal amount_paid
        varchar status
        datetime created_at
    }

    deposit_ledger_entries {
        int id PK
        int order_id FK
        varchar entry_type
        decimal amount
        datetime recorded_at
    }

    settings {
        int id PK
        varchar key UK
        varchar value
        datetime updated_at
    }

    users ||--o{ user_addresses : "1:N (ON DELETE CASCADE)"
    users ||--o{ orders : "1:N (ON DELETE RESTRICT)"
    products ||--o{ product_variants : "1:N (ON DELETE CASCADE)"
    products ||--o{ pricelist_items : "1:N (ON DELETE CASCADE)"
    product_variants ||--o{ pricelist_items : "1:N (ON DELETE CASCADE)"
    pricelists ||--o{ pricelist_items : "1:N (ON DELETE CASCADE)"
    rental_periods ||--o{ pricelist_items : "1:N (ON DELETE CASCADE)"
    quotations ||--o{ quotation_items : "1:N (ON DELETE CASCADE)"
    quotations ||--o{ orders : "1:N (ON DELETE RESTRICT)"
    orders ||--o{ order_items : "1:N (ON DELETE CASCADE)"
    orders ||--o{ invoices : "1:N (ON DELETE RESTRICT)"
    orders ||--o{ deposit_ledger_entries : "1:N (ON DELETE CASCADE)"
    products ||--o{ order_items : "1:N (ON DELETE RESTRICT)"
    product_variants ||--o{ order_items : "1:N (ON DELETE RESTRICT)"
    rental_periods ||--o{ order_items : "1:N (ON DELETE RESTRICT)"
    products ||--o{ quotation_items : "1:N (ON DELETE CASCADE)"
    product_variants ||--o{ quotation_items : "1:N (ON DELETE CASCADE)"
    rental_periods ||--o{ quotation_items : "1:N (ON DELETE CASCADE)"
```

---

## 3. Table-by-Table Specifications

### 3.1 Table: `users`
Stores credentials and basic details for the Client Portal users.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | None | Login email. Indexed. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | None | Secure bcrypt password hash. |
| `name` | `VARCHAR(100)` | `NOT NULL` | None | Customer's full name. |
| `profile_image_url` | `VARCHAR(255)` | `NULL` | `NULL` | Location of profile image asset. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Account creation timestamp. |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Last profile update timestamp. |

---

### 3.2 Table: `user_addresses`
Stores delivery details for the Client Portal users.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique identifier. |
| `user_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `users.id`. `ON DELETE CASCADE`. |
| `street` | `VARCHAR(255)` | `NOT NULL` | None | Street address lines. |
| `city` | `VARCHAR(100)` | `NOT NULL` | None | City name. |
| `state` | `VARCHAR(100)` | `NOT NULL` | None | State / Province. |
| `postal_code` | `VARCHAR(20)` | `NOT NULL` | None | ZIP/Postal code. |
| `is_default` | `TINYINT(1)` | `NOT NULL` | `1` | Boolean flag indicating default shipping. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Record timestamp. |

---

### 3.3 Table: `admins`
Stores administrative portal login credentials.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `username` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | None | Administrative login name. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | None | Secure bcrypt password hash. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Registration timestamp. |

---

### 3.4 Table: `rental_periods`
Configurable list of valid rental durations (e.g. Daily = 1, Weekly = 7).

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `name` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | None | Label: 'Daily', 'Weekly', etc. |
| `duration_days` | `INT` | `NOT NULL`, `CHECK (duration_days > 0)`| None | Length in days of the period. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation date. |

---

### 3.5 Table: `pricelists`
Configurable pricelist containers. Supports standard lists and time-bound campaigns.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `name` | `VARCHAR(100)` | `NOT NULL` | None | Name of the pricelist. |
| `is_default` | `TINYINT(1)` | `NOT NULL` | `0` | Boolean indicator for default fallback. |
| `start_date` | `DATE` | `NULL` | `NULL` | Start validity boundary (for campaigns). |
| `end_date` | `DATE` | `NULL` | `NULL` | Expiration date boundary. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Record creation. |

---

### 3.6 Table: `products`
The core catalog listing. Individual products contain generic fields, variants carry specific details.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `name` | `VARCHAR(100)` | `NOT NULL` | None | Product name. Indexed. |
| `description` | `TEXT` | `NULL` | `NULL` | Description body. |
| `image_url` | `VARCHAR(255)` | `NULL` | `NULL` | Product image URL. |
| `quantity_available` | `INT` | `NOT NULL`, `CHECK (quantity_available >= 0)` | `0` | Aggregate quantity of base items. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Registration date. |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Last updated timestamp. |

---

### 3.7 Table: `product_variants`
Stores variant configurations representing Brand, Manufacturer, Color, and Size splits.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `product_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to parent product. `ON DELETE CASCADE`. |
| `sku` | `VARCHAR(50)` | `UNIQUE`, `NULL` | `NULL` | SKU for specific inventory tracking. |
| `brand` | `VARCHAR(50)` | `NULL` | `NULL` | Brand of item. |
| `manufacturer` | `VARCHAR(50)` | `NULL` | `NULL` | Manufacturer of item. |
| `color` | `VARCHAR(30)` | `NULL` | `NULL` | Color of item. |
| `size` | `VARCHAR(30)` | `NULL` | `NULL` | Size of item. |
| `quantity_available` | `INT` | `NOT NULL`, `CHECK (quantity_available >= 0)`| `0` | Available stock count. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation date. |

---

### 3.8 Table: `pricelist_items`
Declares specific rates and deposit values mapping pricelists, products/variants, and periods.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `pricelist_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `pricelists.id`. `ON DELETE CASCADE`. |
| `product_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `products.id`. `ON DELETE CASCADE`. |
| `variant_id` | `INT` | `NULL`, `FOREIGN KEY` | `NULL` | Optional reference to `product_variants.id`. `ON DELETE CASCADE`. |
| `rental_period_id`| `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `rental_periods.id`. `ON DELETE CASCADE`. |
| `rate` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (rate > 0.0)` | None | Rental price for this period. |
| `deposit_amount` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (deposit_amount >= 0.0)`| None | Security deposit requested. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Record timestamp. |

---

### 3.9 Table: `quotations`
Walk-in / offline quotations generated by administrative staff.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `client_name` | `VARCHAR(100)` | `NOT NULL` | None | Name of potential client. |
| `client_email` | `VARCHAR(100)` | `NULL` | `NULL` | Email contact details. |
| `client_phone` | `VARCHAR(50)` | `NULL` | `NULL` | Phone contact details. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `'DRAFT'` | Status badge: `DRAFT`, `CONFIRMED`, `EXPIRED`. |
| `template_header` | `TEXT` | `NULL` | `NULL` | Rendered layout header from quotation templates. |
| `template_footer` | `TEXT` | `NULL` | `NULL` | Rendered layout footer from quotation templates. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp. |
| `expired_at` | `DATETIME` | `NULL` | `NULL` | Expiration date of quotation validity. |

---

### 3.10 Table: `quotation_items`
Specific product catalog rows requested in a quotation.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `quotation_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to parent `quotations.id`. `ON DELETE CASCADE`. |
| `product_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to catalog `products.id`. `ON DELETE CASCADE`. |
| `variant_id` | `INT` | `NULL`, `FOREIGN KEY` | `NULL` | Reference to `product_variants.id`. `ON DELETE CASCADE`. |
| `rental_period_id`| `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `rental_periods.id`. `ON DELETE CASCADE`. |
| `start_date` | `DATE` | `NOT NULL` | None | Planned start of rental. |
| `due_date` | `DATE` | `NOT NULL` | None | Planned end of rental. |
| `rate` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (rate > 0.0)` | None | Quoted rate. |
| `deposit_amount` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (deposit_amount >= 0.0)`| None | Quoted security deposit. |

---

### 3.11 Table: `orders`
Primary transaction logs representing confirmed rental bookings.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `user_id` | `INT` | `NULL`, `FOREIGN KEY` | `NULL` | Linked portal client user. `ON DELETE RESTRICT`. |
| `quotation_id` | `INT` | `NULL`, `FOREIGN KEY` | `NULL` | Reference to originating quotation. `ON DELETE RESTRICT`. |
| `customer_name` | `VARCHAR(100)` | `NOT NULL` | None | Primary contact customer name. Indexed. |
| `customer_phone` | `VARCHAR(20)` | `NOT NULL` | None | Primary contact customer phone. Indexed. |
| `customer_email` | `VARCHAR(100)` | `NULL` | `NULL` | Primary customer email. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `'UPCOMING'`| `UPCOMING`, `ACTIVE`, `OVERDUE`, `RETURNED`. |
| `fulfillment_method`| `VARCHAR(30)`| `NOT NULL` | None | Delivery choice: `DELIVERY` or `STORE_PICKUP`. |
| `shipping_address` | `TEXT` | `NULL` | `NULL` | Plain text or JSON address info. |
| `payment_method` | `VARCHAR(30)` | `NULL` | `NULL` | Payment method: `CARD`, `CASH`. |
| `payment_status` | `VARCHAR(30)` | `NOT NULL` | `'PENDING'`| Order payment status: `PENDING`, `PAID`, `REFUNDED`. |
| `deposit_amount` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (deposit_amount >= 0.0)`| None | Aggregated deposit required for checkout. |
| `deposit_status` | `VARCHAR(30)` | `NOT NULL` | `'HELD'` | Settle status: `HELD`, `REFUNDED`, `DEDUCTED`. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Timestamp of booking creation. |

---

### 3.12 Table: `order_items`
Tracks individual product rentals inside an order, including pickups, returns, and settlement fees.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `order_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to parent `orders.id`. `ON DELETE CASCADE`. |
| `product_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to catalog `products.id`. `ON DELETE RESTRICT`. |
| `variant_id` | `INT` | `NULL`, `FOREIGN KEY` | `NULL` | Reference to `product_variants.id`. `ON DELETE RESTRICT`. |
| `rental_period_id`| `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `rental_periods.id`. `ON DELETE RESTRICT`. |
| `start_date` | `DATE` | `NOT NULL` | None | Start date of rental. |
| `due_date` | `DATE` | `NOT NULL` | None | Return deadline. Indexed. |
| `rate` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (rate > 0.0)` | None | Paid rate. |
| `deposit_amount` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (deposit_amount >= 0.0)`| None | Allocated security deposit. |
| `pickup_confirmed_at`| `DATETIME`| `NULL` | `NULL` | Timestamp of admin-confirmed physical pickup. |
| `pickup_checklist` | `TEXT` | `NULL` | `NULL` | JSON structure representing pickup status checks. |
| `actual_return_date`| `DATE` | `NULL` | `NULL` | Date order item returned to store. |
| `return_checklist` | `TEXT` | `NULL` | `NULL` | JSON structure (condition, damage, missing items). |
| `late_fee_charged` | `DECIMAL(10,2)` | `NULL`, `CHECK (late_fee_charged >= 0.0)`| `NULL` | Penalty fee invoiced. |
| `deposit_refunded` | `DECIMAL(10,2)` | `NULL`, `CHECK (deposit_refunded >= 0.0)`| `NULL` | Refund amount settled. |
| `settled_at` | `DATETIME` | `NULL` | `NULL` | Return processing timestamp. |

---

### 3.13 Table: `invoices`
Invoices generated for bookings or penalty charges.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `order_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `orders.id`. `ON DELETE RESTRICT`. |
| `invoice_number` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | None | Structured alphanumeric invoice label. |
| `invoice_type` | `VARCHAR(30)` | `NOT NULL` | None | Category: `RENTAL` or `PENALTY`. |
| `amount_due` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (amount_due >= 0.0)`| None | Grand total due. |
| `amount_paid` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (amount_paid >= 0.0)`| `0.00` | Payment captured. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `'UNPAID'` | Status check: `UNPAID`, `PAID`. |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Timestamp generated. |

---

### 3.14 Table: `deposit_ledger_entries`
1:N transactions ledger records tracking security deposit operations for accounting reconciliation.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique serial identifier. |
| `order_id` | `INT` | `NOT NULL`, `FOREIGN KEY` | None | Reference to `orders.id`. `ON DELETE CASCADE`. |
| `entry_type` | `VARCHAR(30)` | `NOT NULL`, `CHECK (entry_type IN ('COLLECTED', 'DEDUCTION', 'REFUNDED'))` | None | Action: `COLLECTED`, `DEDUCTION`, `REFUNDED`. |
| `amount` | `DECIMAL(10,2)` | `NOT NULL`, `CHECK (amount >= 0.0)` | None | Value. |
| `recorded_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Transaction execution date/time. |

---

### 3.15 Table: `settings`
Key-Value system properties for global default rules.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | None | Unique identifier. |
| `key` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | None | Config key (e.g. `late_fee_unit`). |
| `value` | `VARCHAR(255)` | `NOT NULL` | None | String serialized value. |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last change timestamp. |

---

## 4. DDL Setup & Indexing (MySQL Syntax)

The following scripts generate the MySQL schemas, relationships, constraints, and indexes.

```sql
-- DDL SETUP SCRIPT FOR MYSQL 8.0+

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Addresses Table
CREATE TABLE user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Rental Periods Table
CREATE TABLE rental_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    duration_days INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_duration_days CHECK (duration_days > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pricelists Table
CREATE TABLE pricelists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_qty_available CHECK (quantity_available >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Product Variants Table
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(50) UNIQUE DEFAULT NULL,
    brand VARCHAR(50) DEFAULT NULL,
    manufacturer VARCHAR(50) DEFAULT NULL,
    color VARCHAR(30) DEFAULT NULL,
    size VARCHAR(30) DEFAULT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT chk_variant_qty CHECK (quantity_available >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Pricelist Items Table
CREATE TABLE pricelist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pricelist_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    rental_period_id INT NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_items_pricelist FOREIGN KEY (pricelist_id)
        REFERENCES pricelists (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_variant FOREIGN KEY (variant_id)
        REFERENCES product_variants (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_period FOREIGN KEY (rental_period_id)
        REFERENCES rental_periods (id) ON DELETE CASCADE,
    CONSTRAINT chk_item_rate CHECK (rate > 0.0),
    CONSTRAINT chk_item_deposit CHECK (deposit_amount >= 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Quotations Table
CREATE TABLE quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100) DEFAULT NULL,
    client_phone VARCHAR(50) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    template_header TEXT DEFAULT NULL,
    template_footer TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Quotation Items Table
CREATE TABLE quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    rental_period_id INT NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    
    CONSTRAINT fk_qitems_quotation FOREIGN KEY (quotation_id)
        REFERENCES quotations (id) ON DELETE CASCADE,
    CONSTRAINT fk_qitems_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_qitems_variant FOREIGN KEY (variant_id)
        REFERENCES product_variants (id) ON DELETE CASCADE,
    CONSTRAINT fk_qitems_period FOREIGN KEY (rental_period_id)
        REFERENCES rental_periods (id) ON DELETE CASCADE,
    CONSTRAINT chk_qitem_rate CHECK (rate > 0.0),
    CONSTRAINT chk_qitem_deposit CHECK (deposit_amount >= 0.0),
    CONSTRAINT chk_qitem_dates CHECK (due_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    quotation_id INT DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'UPCOMING',
    fulfillment_method VARCHAR(30) NOT NULL,
    shipping_address TEXT DEFAULT NULL,
    payment_method VARCHAR(30) DEFAULT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    deposit_amount DECIMAL(10, 2) NOT NULL,
    deposit_status VARCHAR(30) NOT NULL DEFAULT 'HELD',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_quotation FOREIGN KEY (quotation_id)
        REFERENCES quotations (id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_deposit CHECK (deposit_amount >= 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    rental_period_id INT NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    pickup_confirmed_at DATETIME DEFAULT NULL,
    pickup_checklist TEXT DEFAULT NULL,
    actual_return_date DATE DEFAULT NULL,
    return_checklist TEXT DEFAULT NULL,
    late_fee_charged DECIMAL(10, 2) DEFAULT NULL,
    deposit_refunded DECIMAL(10, 2) DEFAULT NULL,
    settled_at DATETIME DEFAULT NULL,
    
    CONSTRAINT fk_oitems_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_oitems_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE RESTRICT,
    CONSTRAINT fk_oitems_variant FOREIGN KEY (variant_id)
        REFERENCES product_variants (id) ON DELETE RESTRICT,
    CONSTRAINT fk_oitems_period FOREIGN KEY (rental_period_id)
        REFERENCES rental_periods (id) ON DELETE RESTRICT,
    CONSTRAINT chk_oitem_rate CHECK (rate > 0.0),
    CONSTRAINT chk_oitem_deposit CHECK (deposit_amount >= 0.0),
    CONSTRAINT chk_oitem_late_fee CHECK (late_fee_charged IS NULL OR late_fee_charged >= 0.0),
    CONSTRAINT chk_oitem_refund CHECK (deposit_refunded IS NULL OR deposit_refunded >= 0.0),
    CONSTRAINT chk_oitem_dates CHECK (due_date >= start_date),
    CONSTRAINT chk_oitem_return_date CHECK (actual_return_date IS NULL OR actual_return_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Invoices Table
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(30) NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_invoices_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE RESTRICT,
    CONSTRAINT chk_invoice_amount CHECK (amount_due >= 0.0),
    CONSTRAINT chk_invoice_paid CHECK (amount_paid >= 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Deposit Ledger Table
CREATE TABLE deposit_ledger_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    entry_type VARCHAR(30) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ledger_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT chk_ledger_amount CHECK (amount >= 0.0),
    CONSTRAINT chk_ledger_type CHECK (entry_type IN ('COLLECTED', 'DEDUCTION', 'REFUNDED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Settings Table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) UNIQUE NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEXES FOR OPERATIONAL PERFORMANCE

-- Optimize dashboard queries checking active vs overdue order items
CREATE INDEX idx_order_items_return_due 
ON order_items (due_date, actual_return_date);

-- Optimize search for customer records
CREATE INDEX idx_orders_customer_search 
ON orders (customer_phone(10), customer_name(20));

-- Optimize indexes for foreign key relationships lookups
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_product_variants_product ON product_variants (product_id);
CREATE INDEX idx_pricelist_items_search ON pricelist_items (pricelist_id, product_id, variant_id, rental_period_id);

-- Optimize full text search prefixing on product names
CREATE INDEX idx_products_name ON products (name);
```

---

## 5. Python SQLModel Abstractions

The following python declarations match the MySQL database structure, using SQLModel syntax.

```python
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    name: str = Field(max_length=100, nullable=False)
    profile_image_url: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    addresses: List["UserAddress"] = Relationship(back_populates="user", cascade_delete=True)
    orders: List["Order"] = Relationship(back_populates="user")

class UserAddress(SQLModel, table=True):
    __tablename__ = "user_addresses"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    street: str = Field(max_length=255, nullable=False)
    city: str = Field(max_length=100, nullable=False)
    state: str = Field(max_length=100, nullable=False)
    postal_code: str = Field(max_length=20, nullable=False)
    is_default: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: User = Relationship(back_populates="addresses")

class Admin(SQLModel, table=True):
    __tablename__ = "admins"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False, max_length=50)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class RentalPeriod(SQLModel, table=True):
    __tablename__ = "rental_periods"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, nullable=False, max_length=50)
    duration_days: int = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Pricelist(SQLModel, table=True):
    __tablename__ = "pricelists"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    is_default: bool = Field(default=False, nullable=False)
    start_date: Optional[date] = Field(default=None, nullable=True)
    end_date: Optional[date] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Product(SQLModel, table=True):
    __tablename__ = "products"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    image_url: Optional[str] = Field(default=None, max_length=255, nullable=True)
    quantity_available: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    variants: List["ProductVariant"] = Relationship(back_populates="product", cascade_delete=True)

class ProductVariant(SQLModel, table=True):
    __tablename__ = "product_variants"
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", nullable=False)
    sku: Optional[str] = Field(default=None, unique=True, max_length=50)
    brand: Optional[str] = Field(default=None, max_length=50)
    manufacturer: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=30)
    size: Optional[str] = Field(default=None, max_length=30)
    quantity_available: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    product: Product = Relationship(back_populates="variants")

class PricelistItem(SQLModel, table=True):
    __tablename__ = "pricelist_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    pricelist_id: int = Field(foreign_key="pricelists.id", nullable=False)
    product_id: int = Field(foreign_key="products.id", nullable=False)
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id", nullable=True)
    rental_period_id: int = Field(foreign_key="rental_periods.id", nullable=False)
    rate: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Quotation(SQLModel, table=True):
    __tablename__ = "quotations"
    id: Optional[int] = Field(default=None, primary_key=True)
    client_name: str = Field(max_length=100, nullable=False)
    client_email: Optional[str] = Field(default=None, max_length=100)
    client_phone: Optional[str] = Field(default=None, max_length=50)
    status: str = Field(default="DRAFT", max_length=30, nullable=False)
    template_header: Optional[str] = Field(default=None, nullable=True)
    template_footer: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    expired_at: Optional[datetime] = Field(default=None, nullable=True)

    items: List["QuotationItem"] = Relationship(back_populates="quotation", cascade_delete=True)

class QuotationItem(SQLModel, table=True):
    __tablename__ = "quotation_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    quotation_id: int = Field(foreign_key="quotations.id", nullable=False)
    product_id: int = Field(foreign_key="products.id", nullable=False)
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id", nullable=True)
    rental_period_id: int = Field(foreign_key="rental_periods.id", nullable=False)
    start_date: date = Field(nullable=False)
    due_date: date = Field(nullable=False)
    rate: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)

    quotation: Quotation = Relationship(back_populates="items")

class Order(SQLModel, table=True):
    __tablename__ = "orders"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", nullable=True)
    quotation_id: Optional[int] = Field(default=None, foreign_key="quotations.id", nullable=True)
    customer_name: str = Field(max_length=100, index=True, nullable=False)
    customer_phone: str = Field(max_length=20, index=True, nullable=False)
    customer_email: Optional[str] = Field(default=None, max_length=100)
    status: str = Field(default="UPCOMING", max_length=30, nullable=False)
    fulfillment_method: str = Field(max_length=30, nullable=False)
    shipping_address: Optional[str] = Field(default=None, nullable=True)
    payment_method: Optional[str] = Field(default=None, max_length=30)
    payment_status: str = Field(default="PENDING", max_length=30, nullable=False)
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    deposit_status: str = Field(default="HELD", max_length=30, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: Optional[User] = Relationship(back_populates="orders")
    items: List["OrderItem"] = Relationship(back_populates="order", cascade_delete=True)
    invoices: List["Invoice"] = Relationship(back_populates="order")
    ledger_entries: List["DepositLedgerEntry"] = Relationship(back_populates="order", cascade_delete=True)

class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", nullable=False)
    product_id: int = Field(foreign_key="products.id", nullable=False)
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id", nullable=True)
    rental_period_id: int = Field(foreign_key="rental_periods.id", nullable=False)
    start_date: date = Field(nullable=False)
    due_date: date = Field(index=True, nullable=False)
    rate: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    
    pickup_confirmed_at: Optional[datetime] = Field(default=None, nullable=True)
    pickup_checklist: Optional[str] = Field(default=None, nullable=True) # JSON checklist representation
    actual_return_date: Optional[date] = Field(default=None, nullable=True)
    return_checklist: Optional[str] = Field(default=None, nullable=True) # JSON condition inspection logs
    late_fee_charged: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)
    deposit_refunded: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, nullable=True)
    settled_at: Optional[datetime] = Field(default=None, nullable=True)

    order: Order = Relationship(back_populates="items")

class Invoice(SQLModel, table=True):
    __tablename__ = "invoices"
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", nullable=False)
    invoice_number: str = Field(unique=True, index=True, max_length=50, nullable=False)
    invoice_type: str = Field(max_length=30, nullable=False) # RENTAL, PENALTY
    amount_due: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    amount_paid: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2, nullable=False)
    status: str = Field(default="UNPAID", max_length=30, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    order: Order = Relationship(back_populates="invoices")

class DepositLedgerEntry(SQLModel, table=True):
    __tablename__ = "deposit_ledger_entries"
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", nullable=False)
    entry_type: str = Field(max_length=30, nullable=False) # COLLECTED, DEDUCTION, REFUNDED
    amount: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    recorded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    order: Order = Relationship(back_populates="ledger_entries")

class Setting(SQLModel, table=True):
    __tablename__ = "settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True, max_length=50, nullable=False)
    value: str = Field(max_length=255, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


---

## 6. JSON API Schema Specifications

To enable independent parallel development between Frontend and Backend, the following JSON request/response contracts are defined.

### 6.1 Authentication

#### `POST /api/auth/register` (Client Signup)
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123",
      "name": "Jane Doe"
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 42,
      "email": "user@example.com",
      "name": "Jane Doe",
      "profile_image_url": null,
      "created_at": "2026-08-08T13:30:00Z"
    }
    ```

#### `POST /api/auth/login` (Portal Login)
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response Body (200 OK)**:
    *   *Sets Cookie*: `client_session=<JWT>; HttpOnly; Secure; SameSite=Strict`
    ```json
    {
      "id": 42,
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "client",
      "profile_image_url": null
    }
    ```

#### `POST /api/auth/admin/login` (Admin Login)
*   **Request Body**:
    ```json
    {
      "username": "admin_portal",
      "password": "adminsecurepassword"
    }
    ```
*   **Response Body (200 OK)**:
    *   *Sets Cookie*: `admin_session=<JWT>; HttpOnly; Secure; SameSite=Strict`
    ```json
    {
      "id": 1,
      "username": "admin_portal",
      "role": "admin"
    }
    ```

#### `GET /api/auth/me` (Session Fetch)
*   **Response Body (200 OK)**:
    ```json
    {
      "id": 42,
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "client",
      "profile_image_url": "https://storage.rentalsystem.com/profile/jane_doe.png"
    }
    ```

---

### 6.2 Catalog

#### `GET /api/products` (Product Catalog Search)
*   **Query Params**: `?search=str&category=str`
*   **Response Body (200 OK)**:
    ```json
    [
      {
        "id": 101,
        "name": "Sony FX3 Camera",
        "description": "Cinema Line Full-frame Camera",
        "image_url": "https://storage.rentalsystem.com/catalog/sony-fx3.png",
        "quantity_available": 4,
        "variants": [
          {
            "id": 201,
            "sku": "CAM-SONY-FX3-A",
            "brand": "Sony",
            "manufacturer": "Sony Corp",
            "color": "Gray",
            "size": "Standard",
            "quantity_available": 2
          }
        ]
      }
    ]
    ```

#### `POST /api/products` (Product Creation)
*   **Request Body**:
    ```json
    {
      "name": "Sony FX3 Camera",
      "description": "Cinema Line Full-frame Camera",
      "image_url": "https://storage.rentalsystem.com/catalog/sony-fx3.png",
      "quantity_available": 4
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 101,
      "name": "Sony FX3 Camera",
      "description": "Cinema Line Full-frame Camera",
      "image_url": "https://storage.rentalsystem.com/catalog/sony-fx3.png",
      "quantity_available": 4,
      "created_at": "2026-08-08T13:30:00Z",
      "updated_at": "2026-08-08T13:30:00Z"
    }
    ```

#### `POST /api/products/{id}/variants` (Product Variant Creation)
*   **Request Body**:
    ```json
    {
      "sku": "CAM-SONY-FX3-A",
      "brand": "Sony",
      "manufacturer": "Sony Corp",
      "color": "Gray",
      "size": "Standard",
      "quantity_available": 2
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 201,
      "product_id": 101,
      "sku": "CAM-SONY-FX3-A",
      "brand": "Sony",
      "manufacturer": "Sony Corp",
      "color": "Gray",
      "size": "Standard",
      "quantity_available": 2,
      "created_at": "2026-08-08T13:30:00Z"
    }
    ```

#### `POST /api/pricelists` (Create Pricelist)
*   **Request Body**:
    ```json
    {
      "name": "Summer Blockbuster Sale",
      "is_default": false,
      "start_date": "2026-06-01",
      "end_date": "2026-08-31"
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 12,
      "name": "Summer Blockbuster Sale",
      "is_default": false,
      "start_date": "2026-06-01",
      "end_date": "2026-08-31",
      "created_at": "2026-08-08T13:30:00Z"
    }
    ```

#### `POST /api/pricelists/{id}/items` (Add Rate Configuration)
*   **Request Body**:
    ```json
    {
      "product_id": 101,
      "variant_id": 201,
      "rental_period_id": 3,
      "rate": "75.00",
      "deposit_amount": "200.00"
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 401,
      "pricelist_id": 12,
      "product_id": 101,
      "variant_id": 201,
      "rental_period_id": 3,
      "rate": "75.00",
      "deposit_amount": "200.00",
      "created_at": "2026-08-08T13:30:00Z"
    }
    ```

---

### 6.3 Quotations

#### `POST /api/quotations` (Create Quotation Draft)
*   **Request Body**:
    ```json
    {
      "client_name": "Offline Walkin",
      "client_email": "walkin@example.com",
      "client_phone": "+15550199",
      "template_header": "Rentals Inc. - In-Store Quotation",
      "template_footer": "Please return items on time to preserve full deposit refund.",
      "items": [
        {
          "product_id": 101,
          "variant_id": 201,
          "rental_period_id": 3,
          "start_date": "2026-08-10",
          "due_date": "2026-08-17",
          "rate": "75.00",
          "deposit_amount": "200.00"
        }
      ]
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 501,
      "client_name": "Offline Walkin",
      "client_email": "walkin@example.com",
      "client_phone": "+15550199",
      "status": "DRAFT",
      "template_header": "Rentals Inc. - In-Store Quotation",
      "template_footer": "Please return items on time to preserve full deposit refund.",
      "created_at": "2026-08-08T13:30:00Z",
      "expired_at": "2026-08-15T13:30:00Z",
      "items": [
        {
          "id": 601,
          "quotation_id": 501,
          "product_id": 101,
          "variant_id": 201,
          "rental_period_id": 3,
          "start_date": "2026-08-10",
          "due_date": "2026-08-17",
          "rate": "75.00",
          "deposit_amount": "200.00"
        }
      ]
    }
    ```

#### `POST /api/quotations/{id}/confirm` (Convert Quotation to Order)
*   **Request Body**:
    ```json
    {
      "payment_method": "CASH"
    }
    ```
*   **Response Body (200 OK)**:
    ```json
    {
      "order_id": 9910,
      "invoice_id": 8801,
      "amount_due": "275.00",
      "deposit_amount": "200.00",
      "status": "CONFIRMED"
    }
    ```

---

### 6.4 Orders

#### `POST /api/orders` (Client Portal Order Creation)
*   **Request Body**:
    ```json
    {
      "fulfillment_method": "DELIVERY",
      "shipping_address": "456 Park Ave, New York, NY 10022",
      "payment_method": "CARD",
      "items": [
        {
          "product_id": 101,
          "variant_id": 201,
          "rental_period_id": 3,
          "start_date": "2026-08-10",
          "due_date": "2026-08-17",
          "rate": "75.00",
          "deposit_amount": "200.00"
        }
      ]
    }
    ```
*   **Response Body (201 Created)**:
    ```json
    {
      "id": 9910,
      "user_id": 42,
      "customer_name": "Jane Doe",
      "customer_email": "user@example.com",
      "customer_phone": "+15550299",
      "status": "UPCOMING",
      "fulfillment_method": "DELIVERY",
      "shipping_address": "456 Park Ave, New York, NY 10022",
      "payment_method": "CARD",
      "payment_status": "PAID",
      "deposit_amount": "200.00",
      "deposit_status": "HELD",
      "created_at": "2026-08-08T13:30:00Z",
      "items": [
        {
          "id": 651,
          "product_id": 101,
          "variant_id": 201,
          "rental_period_id": 3,
          "start_date": "2026-08-10",
          "due_date": "2026-08-17",
          "rate": "75.00",
          "deposit_amount": "200.00",
          "pickup_confirmed_at": null,
          "actual_return_date": null
        }
      ]
    }
    ```

---

### 6.5 Operations

#### `POST /api/orders/{id}/pickup` (Confirm Items Handoff)
*   **Request Body**:
    ```json
    {
      "items_checklists": [
        {
          "order_item_id": 651,
          "checklist_notes": "Clean condition. Includes carry bag and extra lens cap."
        }
      ]
    }
    ```
*   **Response Body (200 OK)**:
    ```json
    {
      "order_id": 9910,
      "status": "ACTIVE",
      "pickup_confirmed_at": "2026-08-10T09:15:00Z"
    }
    ```

#### `POST /api/orders/{id}/return` (Settle Return and Calculate Penalty Math)
*   **Request Body**:
    ```json
    {
      "return_date": "2026-08-18",
      "items_inspections": [
        {
          "order_item_id": 651,
          "return_checklist": "No structural damages. All cables returned.",
          "is_damaged": false,
          "missing_accessories_notes": ""
        }
      ]
    }
    ```
*   **Response Body (200 OK)**:
    ```json
    {
      "order_id": 9910,
      "status": "RETURNED",
      "settled_at": "2026-08-18T14:00:00Z",
      "settlement_summary": {
        "days_late": 1,
        "late_fee_charged": "15.00",
        "deposit_refunded": "185.00",
        "outstanding_penalty": "0.00"
      }
    }
    ```

#### `GET /api/dashboard/stats` (Admin Operations Panel Widgets)
*   **Response Body (200 OK)**:
    ```json
    {
      "active_rentals": 14,
      "rentals_due_today": 3,
      "upcoming_pickups": 8,
      "upcoming_returns": 5,
      "overdue_rentals": 2,
      "revenue_from_rentals": "4150.00",
      "security_deposits_held": "2800.00",
      "late_fee_collection": "145.00"
    }
    ```

#### `GET /api/settings/deposit-latefee` (Fetch Penalty Policies)
*   **Response Body (200 OK)**:
    ```json
    {
      "deposit_type": "FIXED",
      "deposit_value": "100.00",
      "late_fee_unit": "DAILY",
      "late_fee_rate": "15.00",
      "grace_period_days": 1,
      "max_late_fee_limit": "300.00"
    }
    ```

#### `PUT /api/settings/deposit-latefee` (Modify Global Settings)
*   **Request Body**:
    ```json
    {
      "deposit_type": "PERCENTAGE",
      "deposit_value": "15.00",
      "late_fee_unit": "DAILY",
      "late_fee_rate": "25.00",
      "grace_period_days": 0,
      "max_late_fee_limit": "500.00"
    }
    ```
*   **Response Body (200 OK)**:
    ```json
    {
      "status": "UPDATED",
      "settings": {
        "deposit_type": "PERCENTAGE",
        "deposit_value": "15.00",
        "late_fee_unit": "DAILY",
        "late_fee_rate": "25.00",
        "grace_period_days": 0,
        "max_late_fee_limit": "500.00"
      }
    }
    ```

