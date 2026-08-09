"""
seed_data.py
============
Seeds the local MySQL "easy-rental" database with realistic dummy data
aligned with project categories, catalog tags, feature tokens, and
enhanced Lorem Picsum image variety:

  - 1 admin user (admin@easyrental.com / Admin@EasyRental2026)
  - ~25 vendors with realistic company names matching profile categories
  - ~150 customers (with customer profiles, addresses, cards)
  - ~300 products spread across all project categories:
      * Electronics, Computers, Furniture, Gaming, Audio, Photography,
        Tools & Equipment, Construction Equipment, Camping & Outdoor,
        Party & Events, Sports & Fitness, Musical Instruments,
        Vehicles & Transport, Office & Business, Services
  - Rich product `attributes_json` featuring variants, image galleries,
    tags, feature tokens, descriptions, and specifications.
  - Category-aware, deterministic Picsum image generation for high visual variety
  - Pricelist rules & promo codes per vendor
  - ~120 sample orders (Active / Completed / Cancelled) with order items
  - Populated carts & wishlists

Usage:
    python seed_data.py                # seed with defaults
    python seed_data.py --wipe         # drop & recreate all tables first
    python seed_data.py --products 500 --customers 200 --vendors 40

Requirements:
    pip install faker pymysql
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
# CONSTANTS & REFERENCE DATA ALIGNED WITH FRONTEND
# ==========================================

CATEGORIES = [
    "Electronics",
    "Computers",
    "Furniture",
    "Gaming",
    "Audio",
    "Photography",
    "Tools & Equipment",
    "Construction Equipment",
    "Camping & Outdoor",
    "Party & Events",
    "Sports & Fitness",
    "Musical Instruments",
    "Vehicles & Transport",
    "Office & Business",
    "Services",
]

PRODUCT_NAMES_BY_CATEGORY = {
    "Electronics": [
        "4K Smart Laser Projector", "Portable Power Station 2000W", "Robotic Vacuum & Mop",
        "Smart 55\" OLED TV", "High-Definition Action Camera", "Portable Bluetooth Conference Speaker",
        "Home Theater Dolby Atmos Soundbar", "Portable Air Conditioner 14,000 BTU",
        "Smart Home Security Drone", "Wireless Charging Station Rig",
    ],
    "Computers": [
        "Apple MacBook Pro M3 Max (64GB)", "Dell XPS 15 Workstation", "Lenovo ThinkPad P1 Gen 6",
        "Intel i9 Heavy Processing Desktop", "High-Performance Dual-Monitor Rig", "CyberPowerPC Threadripper Workstation",
        "ASUS ROG Strix Gaming Laptop", "Microsoft Surface Studio 2+", "Portable Triple-Screen Laptop Extender",
        "Enterprise Server Rack Unit 32-Core",
    ],
    "Furniture": [
        "Ergonomic Mesh Executive Chair", "Herman Miller Aeron Chair", "Electric Height-Adjustable Standing Desk",
        "Modular Sectional Lounge Sofa", "Banquet Folding Tables (Set of 4)", "Luxury Velvet Cocktail Bar Stools",
        "Outdoor Rattan Patio Lounge Set", "King Size Storage Bed Frame", "Industrial Wood Bookshelf Unit",
        "Modern Glass Conference Table (10-Seater)",
    ],
    "Gaming": [
        "Sony PlayStation 5 Pro Console Bundle", "Xbox Series X + 4 Controller Rig", "Meta Quest 3 VR Headset System",
        "HTC Vive Pro 2 Enterprise VR Kit", "Sim-Racing Cockpit + Force Feedback Wheel", "Retro Arcade Cabinet (5000+ Games)",
        "Nintendo Switch OLED Event Pack", "ASUS ROG Gaming Monitor 240Hz", "Flight Simulator Yoke & Rudder System",
        "Portable Gaming Lounge Booth",
    ],
    "Audio": [
        "Pioneer DJ Setup (CDJ-3000 + DJM-A9)", "JBL Professional Line Array PA System", "Shure SLXD Wireless Microphone Quad Kit",
        "Yamaha 18\" Powered Subwoofer 2000W", "Behringer X32 Digital Mixing Console", "Chauvet DJ Stage Light Rig + DMX",
        "Studio Monitor Pair (Genelec 8040B)", "Portable Battery PA Speaker 500W", "In-Ear Wireless Monitor Rig",
        "Acoustic Vocal Isolation Booth",
    ],
    "Photography": [
        "Canon EOS R5 C Cinema Camera Kit", "Sony A7S III Mirrorless Camera", "DJI Ronin RS 3 Pro Gimbal",
        "Aputure 600d Pro LED Studio Light", "RED V-Raptor 8K Cinema Rig", "Matthews C-Stand & Grip Package",
        "Green Screen Photo Booth Setup", "Sigma Art Prime Lens Master Set", "Heavy Duty Camera Slider 48\"",
        "DJI Mavic 3 Pro Cine Drone",
    ],
    "Tools & Equipment": [
        "DeWalt Cordless 9-Tool Combo Kit", "Honda 7000W Inverter Generator", "Commercial Pressure Washer 4000 PSI",
        "Bosch SDS-Max Rotary Hammer Drill", "DeWalt 12\" Dual-Bevel Compound Miter Saw", "Generac Wet/Dry Shop Vacuum",
        "Titan Airless Paint Sprayer Pro", "Little Giant Multi-Position Ladder 26ft", "Husqvarna Concrete Cut-Off Saw",
        "Makita Tile Saw with Stand",
    ],
    "Construction Equipment": [
        "Kubota Mini Excavator 3.5 Ton", "Bobcat Skid Steer Loader S650", "Electric Cement Mixer 9 cu ft",
        "Wacker Neuson Trench Compactor", "Heavy-Duty Scaffolding Tower Set", "Husqvarna Floor Grinder & Polisher",
        "Bosch Brute Breaker Jackhammer", "Multiquip Plate Compactor 20KN", "Industrial Dehumidifier 150 Pints",
        "Towable Diesel Air Compressor",
    ],
    "Camping & Outdoor": [
        "4-Person Weatherproof Geodesic Tent", "Camp Chef Portable Outdoor Oven", "Yeti Tundra 65 Cooler Pack",
        "Single Touring Kayak + Paddle & Vest", "Trek Fuel EX Full-Suspension Mountain Bike", "Blackstone Portable Gas Griddle",
        "Ultralight Hiking Backpack 70L", "Solar Powered Outdoor Shower & Pump", "Inflatable Stand-Up Paddleboard (SUP)",
        "Off-Road Expedition Camping Trailer",
    ],
    "Party & Events": [
        "Commercial Inflatable Castle Bounce House", "Commercial Popcorn Machine with Cart", "Rustic Wooden Wedding Arch",
        "Selfie Photo Booth Kiosk with Props", "Double Bowl Slushie & Frozen Drink Machine", "Commercial Chocolate Fountain 5-Tier",
        "Heavy Duty Event Tent 20x40 ft", "Warm White LED String Light Package (200ft)", "Professional Karaoke Party Machine",
        "High-Output Low-Lying Fog Machine",
    ],
    "Sports & Fitness": [
        "NordicTrack Commercial Treadmill", "Peloton Bike+ Interactive Stationary Bike", "PowerBlock Adjustable Dumbbell Set (90lb)",
        "WaterRower Natural Rowing Machine", "Rogue Fitness Squat Rack + Olympic Bar", "Life Fitness Elliptical Cross Trainer",
        "Inflatable Paddleboard SUP Pack", "Burton Snowboard & Binding Package", "Salomon All-Mountain Ski Equipment",
        "Callaway Apex Golf Club Full Set",
    ],
    "Musical Instruments": [
        "Yamaha Clavinova Digital Grand Piano", "Fender American Ultra Stratocaster", "Roland V-Drums TD-27KV Electronic Kit",
        "Gibson Les Paul Standard Guitar", "Nord Stage 3 88-Key Synthesizer", "Selmer Paris Alto Saxophone",
        "Yamaha Custom Z Tenor Saxophone", "Stradivarius Model Student Violin Kit", "Ampeg Bass Amplifier Rig 800W",
        "Korg Kronos 2 Workstation Keyboard",
    ],
    "Vehicles & Transport": [
        "Segway Ninebot Max Electric Scooter", "Ford Transit High-Roof Cargo Van", "Chevy Silverado Heavy Duty Pickup",
        "Enclosed Utility Cargo Trailer (6x12)", "Club Car 4-Passenger Electric Golf Cart", "Yamaha MT-07 Street Motorcycle",
        "16ft Box Truck with Hydraulic Liftgate", "Polaris Sportsman 570 Quad Bike ATV", "Thule Motion XL Car Roof Cargo Box",
        "Specialized Turbo Vado Electric E-Bike",
    ],
    "Office & Business": [
        "Epson Pro Cinema 4K Laser Projector", "Neat Board All-In-One Interactive Display", "Logitech Rally Bar Video Conferencing System",
        "Mobile Dual-Side Magnetic Whiteboard", "Zebra Thermal Event Badge Printer", "Kyocera Commercial Color Multifunction Copier",
        "Executive Leather Conference Chair", "Portable iPad Registration Kiosk Stand", "Clover Station POS System Terminal",
        "Polycom Executive Conference Phone Kit",
    ],
    "Services": [
        "Full Event Setup & Logistics Crew", "Professional DJ & MC Event Performance", "On-Site Photography & Drone Operator",
        "Technical AV & Sound System Technician", "Equipment Delivery, Assembly & Pickup", "Catering & Bar Staff Service",
        "Videography & Live Streaming Production", "Security & Crowd Control Guard Service", "Cleaning & Sanitization Crew",
        "Custom Booth & Stage Fabrication Team",
    ],
}

TAGS_BY_CATEGORY = {
    "Electronics": ["Electronics", "Smart Tech", "4K UHD", "Portable", "Gadgets"],
    "Computers": ["Computers", "Workstation", "Laptop", "High Performance", "IT Gear"],
    "Furniture": ["Furniture", "Office", "Ergonomic", "Executive", "Comfort"],
    "Gaming": ["Gaming", "Console", "4K", "VR Ready", "High FPS"],
    "Audio": ["Audio", "Sound System", "DJ", "Wireless", "Studio"],
    "Photography": ["Photography", "4K Video", "Cinema", "DSLR", "Gimbal"],
    "Tools & Equipment": ["Tools", "Heavy Duty", "Cordless", "Power Tool"],
    "Construction Equipment": ["Construction", "Heavy Equipment", "Machinery", "Industrial"],
    "Camping & Outdoor": ["Outdoor", "Camping", "Adventure", "Water Sports"],
    "Party & Events": ["Party", "Events", "Wedding", "Entertainment"],
    "Sports & Fitness": ["Sports", "Fitness", "Workout", "Gym Equipment"],
    "Musical Instruments": ["Instruments", "Music", "Live Show", "Studio"],
    "Vehicles & Transport": ["Vehicles", "Transport", "Cargo", "Electric"],
    "Office & Business": ["Office", "Business", "Presentation", "Enterprise"],
    "Services": ["Services", "On-Site", "Professional", "Setup Included"],
}

FEATURE_TOKENS = [
    "Assured", "Verified", "Top Rated", "Fast Delivery",
    "Same Day Pickup", "Low Deposit", "24/7 Support",
    "Free Shipping", "Cleaned & Sanitized", "Insurance Included",
]

COMPANY_NAMES_BY_CATEGORY = {
    "Electronics": ["TechSphere Rentals", "Nova Electronics", "SmartEquip Hire"],
    "Computers": ["Apex IT Workstations", "ByteHire Solutions", "Nexus Compute Co."],
    "Furniture": ["FurniFlex Solutions", "ErgoSpace Office", "Urban Lounge Rentals"],
    "Gaming": ["Nexus Gaming Hub", "PixelPro VR & Arcade", "Overdrive Gaming Hire"],
    "Audio": ["SoundWave Audio Visual", "Lumina DJ & Stage", "SonicPro Acoustics"],
    "Photography": ["ProCam Visuals", "CineLens Studio Gear", "ShutterCraft Rentals"],
    "Tools & Equipment": ["Precision Tool Works", "BuildPro Equipment", "PowerGear Hire"],
    "Construction Equipment": ["Vanguard Heavy Rentals", "Titan Fleet Machinery", "Ironclad Build Co."],
    "Camping & Outdoor": ["Outbound Expedition Hire", "Summit Outdoor Gear", "Wilderness Kayak & Camp"],
    "Party & Events": ["Celebration Party Supplies", "Majestic Event Rentals", "Vanguard Event Booths"],
    "Sports & Fitness": ["FlexFit Gym Rentals", "Pulse Athlete Gear", "Peak Performance Sports"],
    "Musical Instruments": ["Harmony Music House", "Maestro Stage Gear", "Acoustic Vault"],
    "Vehicles & Transport": ["Motion Fleet Rentals", "Metro Cargo Vans", "EcoRider E-Bikes"],
    "Office & Business": ["Corporate AV & Office Hire", "Executive Workspace Co.", "Metro Business Tech"],
    "Services": ["Elite Event Crew Services", "ProTech On-Site Staffing", "Master AV Operators"],
}

VARIANT_TIER_NAMES = ["Basic Edition", "Standard Package", "Pro Studio Edition", "Enterprise Ultra"]

FEATURE_SNIPPETS = [
    "Free delivery within city limits", "24/7 roadside & tech support included",
    "Includes protective hard case", "Comprehensive damage waiver option",
    "Same-day Express pickup available", "Extended warranty coverage",
    "Comes with quick start guide", "Sanitized & tested before dispatch",
    "Flexible daily or monthly billing", "Weekend rate discount applies",
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


def picsum_image(seed: str, width: int = 800, height: int = 600) -> str:
    """Build a deterministic Lorem Picsum URL with custom seed.
    Returns consistent high-res visual assets based on the sanitized seed."""
    safe_seed = "".join(ch for ch in str(seed) if ch.isalnum()) or "easyrental"
    return f"{PICSUM_BASE}/{safe_seed}/{width}/{height}"


def picsum_gallery(category: str, product_seed: str, count: int = 3) -> list[str]:
    """Build a set of varied gallery images for product detail views."""
    cat_slug = "".join(ch for ch in category.lower() if ch.isalnum())
    return [
        picsum_image(f"{cat_slug}-{product_seed}-img{idx}", 800, 600)
        for idx in range(count)
    ]


def rand_date_range(days_back=60, days_forward=60):
    start = datetime.utcnow() - timedelta(days=random.randint(0, days_back))
    end = datetime.utcnow() + timedelta(days=random.randint(1, days_forward))
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


# ==========================================
# DB BOOTSTRAP
# ==========================================

def ensure_database_exists():
    """Create the `easy-rental` database if it doesn't exist yet."""
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
        category = CATEGORIES[i % len(CATEGORIES)]
        company_options = COMPANY_NAMES_BY_CATEGORY.get(category, ["Generic Rental Co."])
        company = f"{random.choice(company_options)} #{i+1}"
        full_name = fake.name()
        email = f"vendor{i+1}@{fake.free_email_domain()}"

        user = models.User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password("Vendor@123"),
            role="vendor",
            is_active=random.random() > 0.08,  # ~92% active
        )
        db.add(user)
        db.flush()

        profile = models.VendorProfile(
            user_id=user.id,
            company_name=company,
            category=category,
            is_verified=random.random() > 0.2,
        )
        db.add(profile)

        target = models.MonthlyStoreTarget(
            user_id=user.id,
            target_value=round(random.uniform(10000, 75000), 2),
        )
        db.add(target)

        vendors.append(user)

    db.commit()
    for v in vendors:
        db.refresh(v)
    print(f"Seeded {len(vendors)} vendors with realistic category profiles.")
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
            is_active=random.random() > 0.05,
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

        # 1-2 saved addresses
        num_addr = random.randint(1, 2)
        for j in range(num_addr):
            s, c = random.choice(STATES_CITIES)
            db.add(models.UserAddress(
                user_id=user.id,
                full_name=full_name,
                label=random.choice(["Home", "Work", "Office"]),
                street=fake.street_address(),
                city=c,
                state=s,
                zip_code=fake.zipcode(),
                phone=fake.phone_number()[:30],
                is_default=(j == 0),
            ))

        # 0-2 saved cards
        if random.random() > 0.25:
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

        db.add(models.Cart(user_id=user.id, items_json="[]"))
        db.add(models.Wishlist(user_id=user.id, items_json="[]"))

        customers.append(user)

    db.commit()
    for c in customers:
        db.refresh(c)
    print(f"Seeded {len(customers)} customers (with profiles, addresses, cards).")
    return customers


def make_variants(category: str, base_price: float, product_seed: str):
    """Build 2-4 variants matching ProductAttributesJsonSchema with unique Picsum imageUrls."""
    num_variants = random.randint(2, 4)
    variants = []
    tiers = random.sample(VARIANT_TIER_NAMES, k=min(num_variants, len(VARIANT_TIER_NAMES)))
    cat_slug = "".join(ch for ch in category.lower() if ch.isalnum())

    for idx, tier in enumerate(tiers):
        multiplier = 1.0 + (idx * random.uniform(0.2, 0.4))
        variant_id = fake.uuid4()[:8]
        var_img_seed = f"{cat_slug}-{product_seed}-var-{variant_id}"
        variants.append({
            "id": variant_id,
            "name": tier,
            "price": f"{round(base_price * multiplier, 2)}",
            "stockQuantity": str(random.randint(2, 35)),
            "imageUrl": picsum_image(var_img_seed, 600, 400),
            "features": "; ".join(random.sample(FEATURE_SNIPPETS, k=2)),
        })
    return variants


def seed_products(db, vendors, count: int):
    products = []
    # Group vendors by category for accurate ownership
    vendor_by_cat = {}
    for v in vendors:
        cat = v.vendor_profile.category if v.vendor_profile else "Electronics"
        vendor_by_cat.setdefault(cat, []).append(v)

    for i in range(count):
        category = CATEGORIES[i % len(CATEGORIES)]
        available_vendors = vendor_by_cat.get(category, vendors)
        vendor = random.choice(available_vendors)

        name_options = PRODUCT_NAMES_BY_CATEGORY[category]
        base_name = random.choice(name_options)

        # Add variety to product names
        name = f"{base_name}" if random.random() > 0.4 else f"{fake.word().title()} {base_name}"
        prod_type = "Service" if category == "Services" else random.choices(["Goods", "Service"], weights=[0.88, 0.12])[0]
        base_price = round(random.uniform(20, 850), 2)

        product = models.Product(
            vendor_id=vendor.id,
            name=name,
            category=category,
            product_type=prod_type,
            sales_price=base_price,
            cost_price=round(base_price * random.uniform(0.4, 0.65), 2),
            is_published=random.random() > 0.1,  # ~90% published
            padding_time=f"{random.randint(1,4)}:00 H",
            pickup_time=f"{random.randint(8,11)}:00 H",
            return_time=f"{random.randint(17,20)}:00 H",
            late_fees=round(random.uniform(10, 60), 2),
            security_deposit=round(base_price * random.uniform(0.25, 0.5), 2),
        )
        db.add(product)
        db.flush()

        prod_seed = f"prod-{product.id}"

        # Category tags + project feature tokens
        cat_tags = TAGS_BY_CATEGORY.get(category, [category, "Rental"])
        extra_tags = random.sample(["Pro", "Heavy-Duty", "Top Choice", "2026 Edition", "Premium Grade", "Compact"], k=2)
        prod_tags = list(dict.fromkeys(cat_tags + extra_tags))

        prod_tokens = random.sample(FEATURE_TOKENS, k=min(3, len(FEATURE_TOKENS)))

        # Description & Specs
        description = (
            f"High-quality {name} available for professional or personal rental. "
            f"Features premium construction, full reliability, and rigorous maintenance before every dispatch. "
            f"Ideal for short-term projects or long-term seasonal deployments."
        )
        specifications = f"Category: {category} • Condition: Mint / Inspected • Billing: Flexible Hourly & Daily Rates"

        # Build full JSON with variants, image gallery, tags, and tokens
        attributes = {
            "variants": make_variants(category, base_price, prod_seed),
            "images": picsum_gallery(category, prod_seed, count=3),
            "tags": prod_tags,
            "tokens": prod_tokens,
            "description": description,
            "specifications": specifications,
        }
        product.attributes_json = json.dumps(attributes)
        products.append(product)

        if (i + 1) % 50 == 0:
            db.commit()
            print(f"  ...{i + 1}/{count} products inserted")

    db.commit()
    for p in products:
        db.refresh(p)
    print(f"Seeded {len(products)} products across all project categories.")
    return products


def seed_pricelist_rules(db, vendors, products):
    rules_created = 0
    for vendor in vendors:
        if random.random() > 0.45:
            start, end = rand_date_range(days_back=10, days_forward=45)
            db.add(models.PricelistRule(
                vendor_id=vendor.id,
                name=random.choice(["Seasonal Sale", "Weekend Special", "Bulk Rental Discount", "First Order Special"]),
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
            if random.random() > 0.5:
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
        if random.random() > 0.35:
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
    published_products = [p for p in products if p.is_published] or products

    orders_created = 0
    for i in range(count):
        customer = random.choice(customers)
        num_items = random.randint(1, 3)
        chosen = random.sample(published_products, k=min(num_items, len(published_products)))

        items_list = []
        subtotal = 0.0
        total_hours = random.choice([4, 8, 24, 48, 72, 168])

        for prod in chosen:
            qty = random.randint(1, 2)
            rate = prod.sales_price
            subtotal += rate * total_hours * qty
            parsed_attr = json.loads(prod.attributes_json or "{}")
            variants = parsed_attr.get("variants", [])
            variant_name = random.choice(variants)["name"] if variants else "Standard"
            gallery = parsed_attr.get("images", [])
            main_image = gallery[0] if gallery else picsum_image(f"prod-{prod.id}", 800, 600)

            items_list.append({
                "id": f"item-{fake.uuid4()[:8]}",
                "productId": str(prod.id),
                "title": prod.name,
                "brand": prod.category,
                "image": main_image,
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
    """Populate sample customer carts & wishlists with rich product data."""
    published_products = [p for p in products if p.is_published] or products
    sample_customers = random.sample(customers, k=min(40, len(customers)))

    for customer in sample_customers:
        cart = db.query(models.Cart).filter(models.Cart.user_id == customer.id).first()
        if cart and random.random() > 0.35:
            chosen = random.sample(published_products, k=min(random.randint(1, 3), len(published_products)))
            items = []
            for prod in chosen:
                parsed_attr = json.loads(prod.attributes_json or "{}")
                variants = parsed_attr.get("variants", [])
                variant = random.choice(variants) if variants else None
                gallery = parsed_attr.get("images", [])
                main_image = gallery[0] if gallery else picsum_image(f"prod-{prod.id}", 800, 600)

                items.append({
                    "id": f"cart-{fake.uuid4()[:8]}",
                    "productId": str(prod.id),
                    "variantId": variant["id"] if variant else None,
                    "title": prod.name,
                    "brand": prod.category,
                    "image": main_image,
                    "hourlyRate": prod.sales_price,
                    "quantity": random.randint(1, 2),
                    "variantName": variant["name"] if variant else "Standard",
                    "savedForLater": False,
                })
            cart.items_json = json.dumps(items)

        wishlist = db.query(models.Wishlist).filter(models.Wishlist.user_id == customer.id).first()
        if wishlist and random.random() > 0.4:
            chosen = random.sample(published_products, k=min(random.randint(1, 4), len(published_products)))
            items = []
            for prod in chosen:
                parsed_attr = json.loads(prod.attributes_json or "{}")
                gallery = parsed_attr.get("images", [])
                main_image = gallery[0] if gallery else picsum_image(f"prod-{prod.id}", 800, 600)

                items.append({
                    "id": str(prod.id),
                    "title": prod.name,
                    "image": main_image,
                    "inStock": True,
                    "price": prod.sales_price,
                    "originalPrice": None,
                    "discount": None,
                    "rating": round(random.uniform(4.0, 5.0), 1),
                    "reviews": random.randint(5, 300),
                    "assured": True,
                    "stockText": "In Stock",
                })
            wishlist.items_json = json.dumps(items)

    db.commit()
    print(f"Populated carts/wishlists for {len(sample_customers)} sample customers.")


# ==========================================
# MAIN EXECUTION
# ==========================================

def main():
    parser = argparse.ArgumentParser(description="Seed the EasyRental MySQL database with realistic dummy data.")
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
        print("Admin login   : admin@easyrental.com / Admin@EasyRental2026")
        print("Vendor login  : vendor1@... / Vendor@123  (any vendorN@ email)")
        print("Customer login: customer1@... / Customer@123 (any customerN@ email)")
        print("-------------------------------------------")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())