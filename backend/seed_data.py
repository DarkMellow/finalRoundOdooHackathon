"""
seed_data.py
============
Seeds the local MySQL "easy-rental" database (user=root, pass=32) with
realistic dummy data for development/testing:

  - 1 admin user
  - ~25 vendors (with vendor profiles)
  - ~150 customers (with customer profiles, addresses, cards)
  - ~300 products (spread across vendors, each with 2-4 variants
    baked into attributes_json, matching ProductAttributesJsonSchema)
  - Pricelist rules (product-specific + vendor-global discounts)
  - Promo codes per vendor
  - ~120 sample orders (Active / Completed / Cancelled) with order items
  - A handful of populated carts & wishlists

Usage:
    python seed_data.py                # seed with defaults
    python seed_data.py --wipe         # drop & recreate all tables first
    python seed_data.py --products 500 --customers 200 --vendors 40

Requirements:
    pip install faker pymysql
    (sqlalchemy / pydantic-settings / your existing app deps already installed)
"""

import argparse
import json
import random
import sys
from datetime import datetime, timedelta

import pymysql
from faker import Faker

from config import settings
from database import engine, Base, SessionLocal
import models
from auth_utils import hash_password

fake = Faker()

# ==========================================
# CONSTANTS / REFERENCE DATA
# ==========================================

CATEGORIES = [
    "Electronics",
    "Photography & Video",
    "Furniture",
    "Tools & Equipment",
    "Construction Equipment",
    "Camping & Outdoor",
    "Party & Events",
    "Sports & Fitness",
    "Musical Instruments",
    "Vehicles & Transport",
    "Audio & DJ Gear",
    "Office & Business",
]

PRODUCT_NAMES_BY_CATEGORY = {
    "Electronics": [
        "4K Projector", "Gaming Laptop", "Drone with Camera", "Portable Generator",
        "Smart TV 55\"", "Home Theater System", "VR Headset", "Robotic Vacuum",
        "Action Camera", "Portable Power Station",
    ],
    "Photography & Video": [
        "DSLR Camera Kit", "Mirrorless Camera", "Studio Lighting Kit", "Camera Gimbal",
        "Tripod & Slider Kit", "Green Screen Backdrop Kit", "Cinema Lens Set",
        "Video Production Bundle", "Drone Camera Rig", "Photo Booth Setup",
    ],
    "Furniture": [
        "Banquet Table", "Folding Chairs (Set of 10)", "Lounge Sofa Set",
        "Conference Table", "Bar Stools (Set of 4)", "Outdoor Patio Set",
        "Ergonomic Office Chair", "Standing Desk", "King Size Bed Frame", "Bookshelf Unit",
    ],
    "Tools & Equipment": [
        "Pressure Washer", "Cordless Drill Set", "Table Saw", "Circular Saw",
        "Air Compressor", "Tile Cutter", "Paint Sprayer", "Ladder (24ft)",
        "Wet/Dry Vacuum", "Power Sander",
    ],
    "Construction Equipment": [
        "Mini Excavator", "Concrete Mixer", "Scaffolding Set", "Jackhammer",
        "Backhoe Loader", "Skid Steer Loader", "Cement Vibrator", "Generator (10kW)",
        "Wheelbarrow (Heavy Duty)", "Trench Compactor",
    ],
    "Camping & Outdoor": [
        "4-Person Tent", "Camping Stove", "Sleeping Bag Bundle", "Portable Cooler",
        "Kayak", "Mountain Bike", "Camping Table & Chairs Set", "Hiking Backpack",
        "Portable Water Filter", "Off-Road Trailer",
    ],
    "Party & Events": [
        "Bounce House", "Popcorn Machine", "Wedding Arch", "Photo Booth with Props",
        "Cotton Candy Machine", "Chocolate Fountain", "Event Tent (20x40)",
        "String Light Set", "Karaoke Machine", "Fog Machine",
    ],
    "Sports & Fitness": [
        "Treadmill", "Stationary Bike", "Weight Bench with Rack", "Kayak Paddle Set",
        "Paddleboard (SUP)", "Golf Club Set", "Snowboard", "Ski Set",
        "Rowing Machine", "Elliptical Trainer",
    ],
    "Musical Instruments": [
        "Digital Piano", "Acoustic Guitar", "PA Speaker System", "Drum Kit",
        "DJ Mixer Console", "Electric Guitar & Amp", "Microphone & Stand Kit",
        "Violin", "Saxophone", "Keyboard Synthesizer",
    ],
    "Vehicles & Transport": [
        "Electric Scooter", "Cargo Van", "Pickup Truck", "Utility Trailer",
        "Golf Cart", "Motorcycle", "Box Truck", "ATV / Quad Bike",
        "Car Roof Rack Cargo Box", "Electric Bike",
    ],
    "Audio & DJ Gear": [
        "DJ Turntable Set", "Wireless Microphone System", "Line Array Speaker",
        "Subwoofer (18\")", "Audio Mixer (16-Channel)", "Stage Lighting Rig",
        "Bluetooth PA Speaker", "In-Ear Monitor System", "Studio Monitor Pair",
        "Portable Recording Booth",
    ],
    "Office & Business": [
        "Laser Projector Screen Combo", "Video Conferencing Kit", "Whiteboard (Mobile)",
        "Laptop Docking Station", "Portable PA System", "Badge Printer Kit",
        "Photocopier / Multifunction Printer", "Ergonomic Chair (Executive)",
        "Registration Kiosk", "Cash Register / POS Terminal",
    ],
}

VARIANT_TIER_NAMES = ["Basic", "Standard", "Premium", "Pro"]

FEATURE_SNIPPETS = [
    "Free delivery within city limits", "24/7 roadside support included",
    "Includes protective case", "Insurance available at checkout",
    "Same-day pickup available", "Extended warranty option",
    "Comes with operator manual", "Cleaning included before pickup",
    "Damage waiver available", "Weekend rate discount applies",
]

STATES_CITIES = [
    ("IL", "Chicago"), ("IL", "Springfield"), ("NY", "New York"), ("NY", "Buffalo"),
    ("CA", "Los Angeles"), ("CA", "San Francisco"), ("TX", "Austin"), ("TX", "Houston"),
    ("WA", "Seattle"), ("CO", "Denver"), ("MA", "Boston"), ("GA", "Atlanta"),
    ("FL", "Miami"), ("AZ", "Phoenix"), ("OR", "Portland"),
]

CARD_BRANDS = ["Visa", "Mastercard", "Amex"]

ORDER_STATUSES = ["Active", "Pending Pickup", "Completed", "Returned", "Cancelled"]

PICSUM_BASE = "https://picsum.photos/seed"
PICSUM_WIDTH = 600
PICSUM_HEIGHT = 400


def picsum_image(seed: str, width: int = PICSUM_WIDTH, height: int = PICSUM_HEIGHT) -> str:
    """Build a deterministic Lorem Picsum URL.

    Picsum returns the SAME image every time for a given (seed, width, height)
    combo, so the same product/variant/order-item always renders the same
    photo instead of a new random one on every request. `seed` is sanitized
    to keep the URL clean (Picsum accepts arbitrary alphanumeric strings).
    """
    safe_seed = "".join(ch for ch in str(seed) if ch.isalnum()) or "easyrental"
    return f"{PICSUM_BASE}/{safe_seed}/{width}/{height}"


def rand_date_range(days_back=60, days_forward=60):
    start = datetime.utcnow() - timedelta(days=random.randint(0, days_back))
    end = datetime.utcnow() + timedelta(days=random.randint(1, days_forward))
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


# ==========================================
# DB / SCHEMA BOOTSTRAP
# ==========================================

def ensure_database_exists():
    """Create the `easy-rental` database itself if it doesn't exist yet.
    SQLAlchemy can't connect to a DB that hasn't been created, so this
    connects to the MySQL server directly (no DB selected) first."""
    conn = pymysql.connect(
        host=settings.DB_HOST,
        port=int(settings.DB_PORT),
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        conn.commit()
        print(f"Database `{settings.DB_NAME}` is ready.")
    finally:
        conn.close()


def setup_schema(wipe: bool):
    if wipe:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)


# ==========================================
# SEED FUNCTIONS
# ==========================================

def seed_admin(db):
    existing = db.query(models.User).filter(models.User.email == "admin@easyrental.com").first()
    if existing:
        return existing
    admin = models.User(
        full_name="System Administrator",
        email="admin@easyrental.com",
        hashed_password=hash_password("Admin@EasyRental2026"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("Seeded admin user (admin@easyrental.com / Admin@EasyRental2026)")
    return admin


def seed_vendors(db, count: int):
    vendors = []
    for i in range(count):
        full_name = fake.name()
        company = fake.company()
        email = f"vendor{i+1}@{fake.free_email_domain()}"
        user = models.User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password("Vendor@123"),
            role="vendor",
            is_active=random.random() > 0.08,  # ~92% active
        )
        db.add(user)
        db.flush()  # get user.id without full commit

        profile = models.VendorProfile(
            user_id=user.id,
            company_name=company,
            category=random.choice(CATEGORIES),
            is_verified=random.random() > 0.3,
        )
        db.add(profile)

        target = models.MonthlyStoreTarget(
            user_id=user.id,
            target_value=round(random.uniform(5000, 50000), 2),
        )
        db.add(target)

        vendors.append(user)

    db.commit()
    for v in vendors:
        db.refresh(v)
    print(f"Seeded {len(vendors)} vendors.")
    return vendors


def seed_customers(db, count: int):
    customers = []
    for i in range(count):
        full_name = fake.name()
        email = f"customer{i+1}@{fake.free_email_domain()}"
        user = models.User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password("Customer@123"),
            phone_number=fake.phone_number()[:30],
            role="customer",
            is_active=random.random() > 0.05,  # ~95% active
        )
        db.add(user)
        db.flush()

        state, city = random.choice(STATES_CITIES)
        profile = models.CustomerProfile(
            user_id=user.id,
            address_line=fake.street_address(),
            city=city,
            state=state,
            zip_code=fake.zipcode(),
            id_proof_type=random.choice(["Driver's License", "Passport", "National ID"]),
            id_proof_number=fake.bothify(text="??######"),
        )
        db.add(profile)

        # 1-2 saved addresses per customer
        num_addr = random.randint(1, 2)
        for j in range(num_addr):
            s, c = random.choice(STATES_CITIES)
            db.add(models.UserAddress(
                user_id=user.id,
                full_name=full_name,
                label=random.choice(["Home", "Work", "Other"]),
                street=fake.street_address(),
                city=c,
                state=s,
                zip_code=fake.zipcode(),
                phone=fake.phone_number()[:30],
                is_default=(j == 0),
            ))

        # 0-2 saved cards per customer
        if random.random() > 0.3:
            num_cards = random.randint(1, 2)
            for j in range(num_cards):
                db.add(models.UserCard(
                    user_id=user.id,
                    cardholder_name=full_name,
                    card_number_last4=fake.numerify(text="####"),
                    expiry=f"{random.randint(1,12):02d}/{random.randint(26,30)}",
                    brand=random.choice(CARD_BRANDS),
                    is_default=(j == 0),
                ))

        # Empty cart + wishlist row (as the app lazily creates these)
        db.add(models.Cart(user_id=user.id, items_json="[]"))
        db.add(models.Wishlist(user_id=user.id, items_json="[]"))

        customers.append(user)

    db.commit()
    for c in customers:
        db.refresh(c)
    print(f"Seeded {len(customers)} customers (with profiles, addresses, cards).")
    return customers


def make_variants(base_price: float, product_seed: str):
    """Build 2-4 variants matching ProductAttributesJsonSchema.
    Each variant's image is seeded off the product + variant id so it
    stays the same across requests instead of changing on every load."""
    num_variants = random.randint(2, 4)
    variants = []
    tiers = random.sample(VARIANT_TIER_NAMES, k=min(num_variants, len(VARIANT_TIER_NAMES)))
    for idx, tier in enumerate(tiers):
        multiplier = 1 + (idx * random.uniform(0.15, 0.35))
        variant_id = fake.uuid4()[:8]
        variants.append({
            "id": variant_id,
            "name": tier,
            "price": f"{round(base_price * multiplier, 2)}",
            "stockQuantity": str(random.randint(0, 40)),
            "imageUrl": picsum_image(f"{product_seed}-{variant_id}"),
            "features": "; ".join(random.sample(FEATURE_SNIPPETS, k=2)),
        })
    return variants


def seed_products(db, vendors, count: int):
    products = []
    for i in range(count):
        vendor = random.choice(vendors)
        category = random.choice(CATEGORIES)
        base_name = random.choice(PRODUCT_NAMES_BY_CATEGORY[category])
        # Add slight variety so names aren't all identical across vendors
        name = f"{base_name}" if random.random() > 0.4 else f"{fake.word().title()} {base_name}"

        base_price = round(random.uniform(15, 900), 2)
        product = models.Product(
            vendor_id=vendor.id,
            name=name,
            category=category,
            product_type=random.choices(["Goods", "Service"], weights=[0.85, 0.15])[0],
            sales_price=base_price,
            cost_price=round(base_price * random.uniform(0.4, 0.7), 2),
            is_published=random.random() > 0.15,  # ~85% published
            padding_time=f"{random.randint(1,4)}:00 H",
            pickup_time=f"{random.randint(8,11)}:00 H",
            return_time=f"{random.randint(17,20)}:00 H",
            late_fees=round(random.uniform(5, 50), 2),
            security_deposit=round(base_price * random.uniform(0.2, 0.5), 2),
        )
        db.add(product)
        db.flush()  # assign product.id so variant image seeds are stable/reproducible

        product.attributes_json = json.dumps({
            "variants": make_variants(base_price, product_seed=f"product{product.id}")
        })
        products.append(product)

        # Commit in batches to keep memory/transaction size reasonable
        if (i + 1) % 50 == 0:
            db.commit()
            print(f"  ...{i + 1}/{count} products inserted")

    db.commit()
    for p in products:
        db.refresh(p)
    print(f"Seeded {len(products)} products.")
    return products


def seed_pricelist_rules(db, vendors, products):
    rules_created = 0
    for vendor in vendors:
        if random.random() > 0.5:
            start, end = rand_date_range(days_back=10, days_forward=45)
            db.add(models.PricelistRule(
                vendor_id=vendor.id,
                name=random.choice(["Seasonal Sale", "Weekend Special", "Bulk Rental Discount", "New Customer Offer"]),
                discount_percent=round(random.uniform(5, 30), 2),
                start_date=start,
                end_date=end,
                is_global=True,
                product_id=None,
            ))
            rules_created += 1

    vendor_products = {}
    for p in products:
        vendor_products.setdefault(p.vendor_id, []).append(p)

    for vendor_id, plist in vendor_products.items():
        sample = random.sample(plist, k=min(2, len(plist)))
        for prod in sample:
            if random.random() > 0.6:
                start, end = rand_date_range(days_back=5, days_forward=30)
                db.add(models.PricelistRule(
                    vendor_id=vendor_id,
                    name=f"{prod.name} Flash Deal",
                    discount_percent=round(random.uniform(10, 40), 2),
                    start_date=start,
                    end_date=end,
                    is_global=False,
                    product_id=prod.id,
                ))
                rules_created += 1

    db.commit()
    print(f"Seeded {rules_created} pricelist rules.")


def seed_promo_codes(db, vendors):
    created = 0
    for vendor in vendors:
        if random.random() > 0.4:
            start, end = rand_date_range(days_back=15, days_forward=60)
            code = fake.bothify(text="SAVE##??").upper()
            db.add(models.PromoCode(
                vendor_id=vendor.id,
                code=code,
                discount_percent=round(random.uniform(5, 25), 2),
                max_uses=random.randint(20, 200),
                uses_count=random.randint(0, 15),
                start_date=start,
                end_date=end,
                is_active=random.random() > 0.1,
            ))
            created += 1
    db.commit()
    print(f"Seeded {created} promo codes.")


def seed_orders(db, customers, products, count: int):
    published_products = [p for p in products if p.is_published]
    if not published_products:
        published_products = products

    orders_created = 0
    for i in range(count):
        customer = random.choice(customers)
        num_items = random.randint(1, 3)
        chosen = random.sample(published_products, k=min(num_items, len(published_products)))

        items_list = []
        subtotal = 0.0
        total_hours = random.choice([4, 8, 24, 48, 72])

        for prod in chosen:
            qty = random.randint(1, 2)
            rate = prod.sales_price
            subtotal += rate * total_hours * qty
            variants = json.loads(prod.attributes_json or "{}").get("variants", [])
            variant_name = random.choice(variants)["name"] if variants else "Standard"
            items_list.append({
                "id": f"item-{fake.uuid4()[:8]}",
                "productId": str(prod.id),
                "title": prod.name,
                "brand": prod.category,
                "image": picsum_image(f"product{prod.id}"),
                "hourlyRate": rate,
                "quantity": qty,
                "variantName": variant_name,
            })

        discount = round(subtotal * random.choice([0, 0, 0.05, 0.1, 0.15]), 2)
        total = max(0.0, round(subtotal - discount, 2))
        status = random.choices(
            ORDER_STATUSES,
            weights=[0.25, 0.15, 0.35, 0.15, 0.10],
        )[0]

        order_date = datetime.utcnow() - timedelta(days=random.randint(0, 90))
        start_dt = order_date
        end_dt = order_date + timedelta(hours=total_hours)

        order = models.Order(
            user_id=customer.id,
            reference=f"ORD-{random.randint(100000, 999999)}",
            status=status,
            order_date=order_date,
            start_date=start_dt.strftime("%Y-%m-%d %H:%M"),
            end_date=end_dt.strftime("%Y-%m-%d %H:%M"),
            total_hours=total_hours,
            subtotal=round(subtotal, 2),
            discount=discount,
            total=total if status != "Cancelled" else 0.0,
            delivery_address=f"{fake.street_address()}, {fake.city()}, {random.choice(STATES_CITIES)[0]} {fake.zipcode()}",
            payment_method=random.choice(["Credit Card", "Debit Card", "PayPal", "Cash on Delivery"]),
            items_json=json.dumps(items_list),
        )
        db.add(order)
        orders_created += 1

        if (i + 1) % 50 == 0:
            db.commit()

    db.commit()
    print(f"Seeded {orders_created} orders.")


def seed_sample_carts_and_wishlists(db, customers, products):
    """Populate a subset of customers' carts/wishlists with live items,
    beyond the empty rows already created in seed_customers()."""
    published_products = [p for p in products if p.is_published]
    sample_customers = random.sample(customers, k=min(30, len(customers)))

    for customer in sample_customers:
        cart = db.query(models.Cart).filter(models.Cart.user_id == customer.id).first()
        if cart and random.random() > 0.4:
            chosen = random.sample(published_products, k=min(random.randint(1, 3), len(published_products)))
            items = []
            for prod in chosen:
                variants = json.loads(prod.attributes_json or "{}").get("variants", [])
                variant_name = random.choice(variants)["name"] if variants else "Standard"
                items.append({
                    "id": f"cart-{fake.uuid4()[:8]}",
                    "productId": str(prod.id),
                    "variantId": None,
                    "title": prod.name,
                    "brand": prod.category,
                    "image": picsum_image(f"product{prod.id}"),
                    "hourlyRate": prod.sales_price,
                    "quantity": random.randint(1, 2),
                    "variantName": variant_name,
                    "savedForLater": False,
                })
            cart.items_json = json.dumps(items)

        wishlist = db.query(models.Wishlist).filter(models.Wishlist.user_id == customer.id).first()
        if wishlist and random.random() > 0.5:
            chosen = random.sample(published_products, k=min(random.randint(1, 4), len(published_products)))
            items = []
            for prod in chosen:
                items.append({
                    "id": str(prod.id),
                    "title": prod.name,
                    "image": picsum_image(f"product{prod.id}"),
                    "inStock": True,
                    "price": prod.sales_price,
                    "originalPrice": None,
                    "discount": None,
                    "rating": round(random.uniform(3.5, 5.0), 1),
                    "reviews": random.randint(1, 250),
                    "assured": random.random() > 0.3,
                    "stockText": "In Stock",
                })
            wishlist.items_json = json.dumps(items)

    db.commit()
    print(f"Populated carts/wishlists for {len(sample_customers)} sample customers.")


# ==========================================
# MAIN
# ==========================================

def main():
    parser = argparse.ArgumentParser(description="Seed the EasyRental MySQL database with dummy data.")
    parser.add_argument("--wipe", action="store_true", help="Drop and recreate all tables before seeding.")
    parser.add_argument("--vendors", type=int, default=25, help="Number of vendors to create.")
    parser.add_argument("--customers", type=int, default=150, help="Number of customers to create.")
    parser.add_argument("--products", type=int, default=300, help="Number of products to create.")
    parser.add_argument("--orders", type=int, default=120, help="Number of orders to create.")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducible data.")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)
        Faker.seed(args.seed)

    print(f"Target DB: mysql+pymysql://{settings.DB_USER}:***@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")

    ensure_database_exists()
    setup_schema(wipe=args.wipe)

    db = SessionLocal()
    try:
        seed_admin(db)
        vendors = seed_vendors(db, args.vendors)
        customers = seed_customers(db, args.customers)
        products = seed_products(db, vendors, args.products)
        seed_pricelist_rules(db, vendors, products)
        seed_promo_codes(db, vendors)
        seed_orders(db, customers, products, args.orders)
        seed_sample_carts_and_wishlists(db, customers, products)

        print("\nSeeding complete.")
        print("-------------------------------------------")
        print(f"Admin login   : admin@easyrental.com / Admin@EasyRental2026")
        print(f"Vendor login  : vendor1@... / Vendor@123  (any vendorN@ email)")
        print(f"Customer login: customer1@... / Customer@123 (any customerN@ email)")
        print("-------------------------------------------")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())