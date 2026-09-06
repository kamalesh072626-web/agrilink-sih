"""
AgriLink - Database Setup and Mock Data Seeding Script
Market Linkages & Price Discovery

Formulas supported by this data model:
    Net Farmer Realisation = Gross Offered Price - Transport Cost - Storage Cost
    Match Score = (Price 40%) + (Distance 30%) + (Quality 10%) + (Trust 20%)
"""

import sqlite3
import os

# Database file name
DB_NAME = "agrilink.db"


def get_db_connection():
    """
    Creates and returns a connection to the SQLite database.
    Enables foreign keys and returns rows as dictionaries for easier field access.
    """
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def create_schema(cursor):
    """
    Drops existing tables if they exist and creates fresh tables for:
    0. Users    : Authentication profiles for Farmer, Buyer, Admin roles.
    1. Farmers  : Producer profile, location, and lot information.
    2. Markets  : APMCs and wholesale mandis with prices and logistics rates.
    3. Buyers   : Verified traders with offered prices, trust scores, and quality preferences.
    4. Lots     : Digitized farmer harvest lots ready for buyer matching.
    """
    print("[INFO] Creating database schema...")

    # Drop in correct dependency order (children before parents)
    cursor.execute("DROP TABLE IF EXISTS lots;")
    cursor.execute("DROP TABLE IF EXISTS grievances;")
    cursor.execute("DROP TABLE IF EXISTS buyers;")
    cursor.execute("DROP TABLE IF EXISTS markets;")
    cursor.execute("DROP TABLE IF EXISTS farmers;")
    cursor.execute("DROP TABLE IF EXISTS users;")

    # 0. Users table
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 1. Farmers table
    cursor.execute("""
        CREATE TABLE farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            crop TEXT NOT NULL,
            quantity_quintals REAL NOT NULL DEFAULT 50.0,
            contact TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 2. Markets table
    cursor.execute("""
        CREATE TABLE markets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            base_price REAL NOT NULL,
            distance_km REAL NOT NULL,
            transport_rate_per_km_quintal REAL NOT NULL DEFAULT 2.5,
            storage_cost_per_day_quintal REAL NOT NULL DEFAULT 12.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 3. Buyers table — enriched with Phase 3 fields for Match Score calculation
    cursor.execute("""
        CREATE TABLE buyers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            required_crop TEXT NOT NULL,
            offered_price REAL NOT NULL,
            trust_score REAL NOT NULL,
            market_id INTEGER,
            payment_terms TEXT NOT NULL DEFAULT 'Immediate UPI / NEFT',
            verified_buyer INTEGER NOT NULL DEFAULT 1,

            -- Phase 3: Fields for Match Score computation
            accepted_quality_grades TEXT NOT NULL DEFAULT 'A,B',
            payment_reliability_pct REAL NOT NULL DEFAULT 90.0,
            minimum_quantity_quintals REAL NOT NULL DEFAULT 5.0,
            maximum_quantity_quintals REAL NOT NULL DEFAULT 200.0,
            buyer_type TEXT NOT NULL DEFAULT 'Wholesaler',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE SET NULL
        );
    """)

    # 4. Lots table — digitized farmer harvest lots
    # Status workflow: 'ACTIVE' -> 'MATCHED' -> 'SOLD' | 'EXPIRED'
    cursor.execute("""
        CREATE TABLE lots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lot_code TEXT UNIQUE NOT NULL,
            farmer_id INTEGER NOT NULL,
            crop TEXT NOT NULL,
            quantity_quintals REAL NOT NULL,
            harvest_date TEXT NOT NULL,
            quality_grade TEXT NOT NULL DEFAULT 'B',
            minimum_price REAL NOT NULL,
            expected_price REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
        );
    """)

    # 5. Grievances table — Phase 4 help desk support
    cursor.execute("""
        CREATE TABLE grievances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Submitted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
        );
    """)

    print("[SUCCESS] Schema created successfully.")


def seed_mock_data(cursor):
    """
    Populates the database with realistic synthetic data tailored for
    Nashik, Maharashtra tomato farmers and verified buyers.

    Phase 3 additions:
    - Enriched buyers with quality preferences, payment reliability, and buyer type.
    - Added sample active lots for demonstration.
    """
    print("[INFO] Seeding synthetic mock data...")

    # ----- USERS -----
    user_query = """
        INSERT INTO users (username, phone, password_hash, role, name, location)
        VALUES (?, ?, ?, ?, ?, ?);
    """
    users_data = [
        ("ramesh", "9822012345", "password123", "farmer", "Ramesh Patil", "Nashik (Dindori Road), Maharashtra"),
        ("abcfoods", "9876543210", "password123", "buyer", "ABC Foods Logistics", "Mumbai, Maharashtra"),
        ("admin", "9999999999", "adminpassword", "admin", "APMC Market Regulator", "Nashik APMC, Maharashtra"),
    ]
    cursor.executemany(user_query, users_data)

    # ----- FARMERS -----
    farmer_query = """
        INSERT INTO farmers (name, location, crop, quantity_quintals, contact)
        VALUES (?, ?, ?, ?, ?);
    """
    farmers_data = [
        ("Ramesh Patil", "Nashik (Dindori Road), Maharashtra", "Tomato", 60.0, "+91 98220 12345"),
        ("Sunita Gaikwad", "Niphad, Nashik, Maharashtra", "Tomato", 45.0, "+91 98221 67890"),
    ]
    cursor.executemany(farmer_query, farmers_data)

    # ----- MARKETS -----
    market_query = """
        INSERT INTO markets (name, location, base_price, distance_km, transport_rate_per_km_quintal, storage_cost_per_day_quintal)
        VALUES (?, ?, ?, ?, ?, ?);
    """
    markets_data = [
        ("Nashik APMC (Panchavati)",  "Nashik, Maharashtra",      2150.0,  8.0, 2.20, 10.0),
        ("Pimpalgaon Baswant APMC",   "Pimpalgaon, Nashik",        2280.0, 32.0, 2.40, 12.0),
        ("Lasalgaon APMC",            "Lasalgaon, Nashik",          2350.0, 58.0, 2.50, 14.0),
        ("Vashi APMC (Navi Mumbai)",  "Navi Mumbai, Maharashtra",  2850.0,168.0, 3.10, 18.0),
        ("Pune Gultekdi Market Yard", "Pune, Maharashtra",          2650.0,212.0, 3.25, 16.0),
    ]
    cursor.executemany(market_query, markets_data)

    # ----- BUYERS (Phase 3 enriched schema) -----
    buyer_query = """
        INSERT INTO buyers (
            name, required_crop, offered_price, trust_score, market_id,
            payment_terms, verified_buyer,
            accepted_quality_grades, payment_reliability_pct,
            minimum_quantity_quintals, maximum_quantity_quintals, buyer_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    buyers_data = [
        # Name, Crop, Price/q, Trust, MktID, PaymentTerms, Verified,
        # QualityGrades, PayRelPct, MinQ, MaxQ, Type
        ("FreshCart Retail Logistics",  "Tomato", 2780.0, 4.8, 1,
         "Instant Bank Transfer (Same Day)",      1, "A,B",   96.0,  10.0, 150.0, "Retailer"),

        ("Sahyadri FPC Ltd",            "Tomato", 2420.0, 4.9, 2,
         "Escrow / 24-hr Clearance",              1, "A,B,C", 98.0,  20.0, 500.0, "FPO"),

        ("Kisan Mandi Aggregators",     "Tomato", 2320.0, 4.1, 3,
         "2 Days Post-Delivery",                  1, "B,C",   82.0,   5.0, 100.0, "Wholesaler"),

        ("Metro Food Wholesalers",      "Tomato", 2950.0, 4.6, 4,
         "T+1 Working Day Settlement",            1, "A",     94.0,  30.0, 300.0, "Wholesaler"),

        ("Balaji Fresh Veggies",        "Tomato", 2200.0, 3.6, 1,
         "Cash on Delivery",                      0, "B,C",   68.0,   2.0,  50.0, "Local Trader"),

        ("Deccan Food Processors Ltd",  "Tomato", 2680.0, 4.7, 5,
         "Instant UPI Settlement",                1, "A,B",   95.0,  25.0, 400.0, "Processor"),

        ("GreenGrow Supermarket Chain", "Tomato", 2820.0, 4.4, 4,
         "Weekly Consolidated NEFT",              1, "A",     91.0,  15.0, 200.0, "Retailer"),

        ("Local Arhatiya Brothers",     "Tomato", 2100.0, 3.2, 1,
         "Cash on Delivery",                      0, "B,C",   60.0,   1.0,  40.0, "Commission Agent"),

        # Phase 3: Additional buyers for richer matching
        ("ABC Foods Pvt Ltd",           "Tomato", 2700.0, 4.5, 2,
         "RTGS within 24 hours",                  1, "A,B",   93.0,  20.0, 250.0, "Processor"),

        ("FreshMart E-Commerce",        "Tomato", 2760.0, 4.6, 1,
         "Instant UPI Settlement",                1, "A",     97.0,  10.0, 120.0, "E-Commerce"),

        ("Reliance Fresh Procurement",  "Tomato", 2850.0, 4.8, 4,
         "T+2 Bank Transfer",                     1, "A,B",   95.0,  50.0, 600.0, "Retailer"),

        ("NutriCorp Agri Exports",      "Tomato", 2900.0, 4.3, 4,
         "LC / Letter of Credit",                 1, "A",     88.0, 100.0, 1000.0,"Exporter"),
    ]
    cursor.executemany(buyer_query, buyers_data)

    # ----- LOTS (Phase 3: sample harvest lots) -----
    lot_query = """
        INSERT INTO lots (lot_code, farmer_id, crop, quantity_quintals, harvest_date,
                          quality_grade, minimum_price, expected_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    lots_data = [
        ("LOT-1001", 1, "Tomato", 30.0, "2026-09-01", "A", 2400.0, 2750.0, "ACTIVE"),
        ("LOT-1002", 1, "Tomato", 30.0, "2026-09-03", "B", 2200.0, 2500.0, "ACTIVE"),
        ("LOT-1003", 2, "Tomato", 20.0, "2026-09-02", "A", 2500.0, 2800.0, "MATCHED"),
        ("LOT-1004", 2, "Tomato", 25.0, "2026-09-04", "C", 1900.0, 2100.0, "ACTIVE"),
    ]
    cursor.executemany(lot_query, lots_data)

    # ----- GRIEVANCES (Phase 4: sample help desk tickets) -----
    grievance_query = """
        INSERT INTO grievances (farmer_id, category, description, status)
        VALUES (?, ?, ?, ?);
    """
    grievances_data = [
        (1, "Payment Delay", "Payment for LOT-1003 from Metro Food Wholesalers delayed past 24-hr terms.", "Under Review"),
        (1, "Transport Issue", "Refrigerated truck arrived 4 hours late at Nashik farm lot.", "Resolved"),
        (2, "Quality Dispute", "Deduction applied on LOT-1004 due to color grade mismatch at Pimpalgaon.", "Submitted"),
    ]
    cursor.executemany(grievance_query, grievances_data)

    print("[SUCCESS] Mock data seeded successfully.")


def display_summary(cursor):
    """
    Prints a quick inspection of all seeded records to stdout.
    """
    print("\n" + "=" * 70)
    print("AGRILINK DATABASE SUMMARY - SEEDED DATA INSPECTION")
    print("=" * 70)

    cursor.execute("SELECT id, name, location, crop, quantity_quintals FROM farmers;")
    print("\n--- FARMERS ---")
    for r in cursor.fetchall():
        print(f"[{r['id']}] {r['name']} | {r['location']} | {r['crop']} ({r['quantity_quintals']} q)")

    cursor.execute("SELECT id, name, base_price, distance_km FROM markets;")
    print("\n--- MARKETS ---")
    for r in cursor.fetchall():
        print(f"[{r['id']}] {r['name']:<30} Rs {r['base_price']}/q | {r['distance_km']} km")

    cursor.execute("SELECT id, name, offered_price, trust_score, payment_reliability_pct, buyer_type FROM buyers;")
    print("\n--- BUYERS ---")
    for r in cursor.fetchall():
        print(f"[{r['id']}] {r['name']:<30} Rs {r['offered_price']}/q | Trust: {r['trust_score']} | Pay Rel: {r['payment_reliability_pct']}% | {r['buyer_type']}")

    cursor.execute("SELECT id, lot_code, crop, quantity_quintals, quality_grade, status FROM lots;")
    print("\n--- LOTS ---")
    for r in cursor.fetchall():
        print(f"[{r['id']}] {r['lot_code']} | {r['crop']} {r['quantity_quintals']}q Grade-{r['quality_grade']} | Status: {r['status']}")

    cursor.execute("SELECT id, category, description, status FROM grievances;")
    print("\n--- GRIEVANCES ---")
    for r in cursor.fetchall():
        print(f"[{r['id']}] Category: {r['category']:<18} | Status: {r['status']:<12} | {r['description']}")

    print("=" * 70)


def setup_database():
    """
    Main orchestration function — creates schema and seeds data.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        create_schema(cursor)
        seed_mock_data(cursor)
        conn.commit()
        display_summary(cursor)
        print(f"\n[DONE] Database ready at: '{os.path.abspath(DB_NAME)}'")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Database setup failed: {e}")
        raise e
    finally:
        conn.close()


if __name__ == "__main__":
    setup_database()
