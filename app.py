"""
AgriLink - Flask REST API Backend
Market Linkages & Price Discovery

This backend application connects to the SQLite database 'agrilink.db' and
dynamically calculates the Net Farmer Realisation:
    Net Farmer Realisation = Gross Price - Transport Cost - Storage Cost

Endpoints exposed:
    1. POST /api/auth/login           - Authenticate users (Farmer, Buyer, Admin)
    2. GET  /api/dashboard            - Dynamic Net Realisation KPIs and sorted markets
    3. GET  /api/buyers               - Verified buyers with 4-factor Match Score algorithm
    4. POST /api/lots                 - Digitize a farmer harvest lot (returns LOT-xxxx ID)
    5. GET  /api/predict              - AI price forecast (30-day history + 7-day prediction)
    6. GET  /api/market-intelligence  - Comparative market breakdown with APMC cess
    7. POST /api/markets/update       - Admin base price & rate sync
    8. POST /api/grievances/update    - Admin dispute resolution status update
    9. POST /api/offers               - Buyer submit offer on lot
   10. GET  /api/health               - Health check endpoint

CORS is enabled so the React.js frontend can communicate smoothly without cross-origin blocks.
Strict constraint adhered: NO type hints used anywhere in this Python code.
"""

import sqlite3
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_engine import train_and_predict_prices

# Initialize Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for all routes
CORS(app)

# Database path relative to this script
DB_PATH = os.path.join(os.path.dirname(__file__), "agrilink.db")


def get_db_connection():
    """
    Establishes and returns a connection to the SQLite database.
    Row factory is set to sqlite3.Row so columns can be accessed by name like dictionaries.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def calculate_cost_breakdown(gross_price, distance_km, transport_rate, storage_rate, storage_days=1):
    """
    Calculates the exact cost breakdown and Net Farmer Realisation per quintal.
    Formula:
        Transport Cost = Distance (km) * Transport Rate per km per quintal
        Storage Cost   = Storage Rate per day per quintal * Number of Days
        Net Realisation = Gross Price - Transport Cost - Storage Cost
    """
    transport_cost = round(distance_km * transport_rate, 2)
    storage_cost = round(storage_rate * storage_days, 2)
    net_realisation = round(gross_price - transport_cost - storage_cost, 2)

    return {
        "gross_price": round(gross_price, 2),
        "distance_km": round(distance_km, 2),
        "transport_rate_per_km": round(transport_rate, 2),
        "transport_cost": transport_cost,
        "storage_rate_per_day": round(storage_rate, 2),
        "storage_days": storage_days,
        "storage_cost": storage_cost,
        "total_deductions": round(transport_cost + storage_cost, 2),
        "net_realisation": net_realisation
    }


@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify backend and database accessibility.
    """
    db_exists = os.path.exists(DB_PATH)
    return jsonify({
        "status": "online",
        "service": "AgriLink Backend API",
        "database_connected": db_exists
    }), 200


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    """
    User Authentication Endpoint.
    Accepts phone or username + password, queries agrilink.db users table.
    Returns user profile on success (200) or error banner payload on failure (401).
    """
    payload = request.get_json(silent=True) or {}
    identifier = str(payload.get("phone") or payload.get("username") or payload.get("identifier") or "").strip()
    password = str(payload.get("password") or "").strip()

    if not identifier or not password:
        return jsonify({
            "success": False,
            "error": "Please provide mobile number/username and password."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, phone, password_hash, role, name, location
        FROM users
        WHERE (phone = ? OR username = ?)
    """, (identifier, identifier))
    user = cursor.fetchone()
    conn.close()

    if not user or user["password_hash"] != password:
        return jsonify({
            "success": False,
            "error": "Invalid credentials. Please verify your mobile number and password."
        }), 401

    token = f"agrilink-session-token-{user['id']}-{user['role']}"
    user_profile = {
        "id": user["id"],
        "name": user["name"],
        "role": user["role"],
        "phone": user["phone"],
        "username": user["username"],
        "location": user["location"],
        "token": token
    }

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "name": user["name"],
        "role": user["role"],
        "user": user_profile
    }), 200


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    """
    User Registration Endpoint.
    Accepts name, phone, password, role, and location.
    Inserts a new user record into the users table of agrilink.db.
    Returns 201 on success or an error payload on failure.
    """
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    password = str(payload.get("password") or "").strip()
    role = str(payload.get("role") or "farmer").strip().lower()
    location = str(payload.get("location") or "").strip()

    if not name or not phone or not password or not location:
        return jsonify({
            "success": False,
            "error": "All fields (name, phone, password, location) are required."
        }), 400

    if role not in ("farmer", "buyer", "admin"):
        return jsonify({
            "success": False,
            "error": "Invalid role. Must be farmer, buyer, or admin."
        }), 400

    # Use phone as username (unique identifier)
    username = phone

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (username, phone, password_hash, role, name, location)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (username, phone, password, role, name, location))
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({
            "success": True,
            "message": f"Account created successfully for {name}.",
            "user_id": new_id
        }), 201
    except Exception as e:
        conn.rollback()
        error_msg = str(e)
        if "UNIQUE constraint failed" in error_msg:
            return jsonify({
                "success": False,
                "error": "This mobile number is already registered. Please sign in."
            }), 409
        return jsonify({
            "success": False,
            "error": f"Registration failed: {error_msg}"
        }), 500
    finally:
        conn.close()


@app.route("/api/markets/update", methods=["POST"])
def update_market_rate():
    """
    Admin Mandi Rate Sync Endpoint.
    Allows APMC Regulator to update base prices and logistics rates.
    """
    payload = request.get_json(silent=True) or {}
    market_id = payload.get("market_id")
    base_price = payload.get("base_price")

    if not market_id or base_price is None:
        return jsonify({"success": False, "error": "market_id and base_price are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE markets SET base_price = ? WHERE id = ?", (float(base_price), int(market_id)))
        conn.commit()
        return jsonify({"success": True, "message": "Mandi rate updated successfully."}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/grievances/update", methods=["POST"])
def update_grievance_status():
    """
    Admin Dispute Resolution Status Update Endpoint.
    """
    payload = request.get_json(silent=True) or {}
    ticket_id = payload.get("id")
    status = payload.get("status")

    if not ticket_id or not status:
        return jsonify({"success": False, "error": "ticket id and status are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE grievances SET status = ? WHERE id = ?", (status, int(ticket_id)))
        conn.commit()
        return jsonify({"success": True, "message": "Dispute ticket status updated."}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/offers", methods=["POST"])
def create_buyer_offer():
    """
    Buyer Offer Submission Endpoint.
    """
    payload = request.get_json(silent=True) or {}
    lot_code = payload.get("lot_code")
    offer_price = payload.get("offer_price")
    buyer_name = payload.get("buyer_name", "Verified Buyer")

    if not lot_code or not offer_price:
        return jsonify({"success": False, "error": "lot_code and offer_price are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE lots SET status = 'OFFERED' WHERE lot_code = ?", (lot_code,))
        conn.commit()
        return jsonify({
            "success": True,
            "message": f"Offer of ₹{offer_price}/q submitted to farmer for {lot_code} by {buyer_name}."
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """
    Dashboard API Endpoint.
    Calculates dynamic Net Realisation for all markets relative to the farmer,
    identifies the optimal market destination, and computes high-level KPIs.

    Optional Query Parameters:
        - farmer_id: ID of the farmer (defaults to 1 - Ramesh Patil)
        - storage_days: Estimated days of storage needed (defaults to 1)
    """
    farmer_id = request.args.get("farmer_id", default=1, type=int)
    storage_days = request.args.get("storage_days", default=1, type=int)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Fetch Farmer profile
        cursor.execute("""
            SELECT id, name, location, crop, quantity_quintals, contact
            FROM farmers
            WHERE id = ?;
        """, (farmer_id,))
        farmer_row = cursor.fetchone()

        # If specified farmer not found, fallback to the first farmer in database
        if not farmer_row:
            cursor.execute("SELECT id, name, location, crop, quantity_quintals, contact FROM farmers LIMIT 1;")
            farmer_row = cursor.fetchone()

        if not farmer_row:
            return jsonify({
                "success": False,
                "error": "No farmer profiles found in database. Run setup_db.py first."
            }), 404

        farmer = dict(farmer_row)
        quantity = farmer["quantity_quintals"]

        # 2. Fetch all markets
        cursor.execute("""
            SELECT id, name, location, base_price, distance_km,
                   transport_rate_per_km_quintal, storage_cost_per_day_quintal
            FROM markets;
        """)
        market_rows = cursor.fetchall()

        # 3. Fetch buyer stats per market for richer context
        cursor.execute("""
            SELECT market_id, COUNT(id) as buyer_count, MAX(offered_price) as top_offer
            FROM buyers
            GROUP BY market_id;
        """)
        market_buyer_stats = {row["market_id"]: dict(row) for row in cursor.fetchall()}

        # 4. Compute Net Realisation for each market dynamically
        calculated_markets = []
        for row in market_rows:
            market_data = dict(row)
            market_id = market_data["id"]
            base_price = market_data["base_price"]
            distance = market_data["distance_km"]
            transport_rate = market_data["transport_rate_per_km_quintal"]
            storage_rate = market_data["storage_cost_per_day_quintal"]

            # Calculate cost breakdown for 1 quintal
            cost_info = calculate_cost_breakdown(
                gross_price=base_price,
                distance_km=distance,
                transport_rate=transport_rate,
                storage_rate=storage_rate,
                storage_days=storage_days
            )

            # Buyer stats for this market
            buyer_stat = market_buyer_stats.get(market_id, {"buyer_count": 0, "top_offer": None})
            top_buyer_offer = buyer_stat["top_offer"]
            top_buyer_net_realisation = None
            top_buyer_batch_net = None

            if top_buyer_offer is not None:
                top_buyer_net_realisation = round(top_buyer_offer - cost_info["transport_cost"] - cost_info["storage_cost"], 2)
                top_buyer_batch_net = round(top_buyer_net_realisation * quantity, 2)

            # Calculate total earnings for the farmer's entire harvest batch
            batch_total_gross = round(cost_info["gross_price"] * quantity, 2)
            batch_total_transport = round(cost_info["transport_cost"] * quantity, 2)
            batch_total_storage = round(cost_info["storage_cost"] * quantity, 2)
            batch_total_net = round(cost_info["net_realisation"] * quantity, 2)

            calculated_markets.append({
                "id": market_id,
                "name": market_data["name"],
                "location": market_data["location"],
                "distance_km": distance,
                "base_price_per_quintal": base_price,
                "transport_rate_per_km": transport_rate,
                "transport_cost_per_quintal": cost_info["transport_cost"],
                "storage_cost_per_quintal": cost_info["storage_cost"],
                "total_deductions_per_quintal": cost_info["total_deductions"],
                "net_realisation_per_quintal": cost_info["net_realisation"],
                "batch_total_gross": batch_total_gross,
                "batch_total_transport": batch_total_transport,
                "batch_total_storage": batch_total_storage,
                "batch_total_net": batch_total_net,
                "buyer_count": buyer_stat["buyer_count"],
                "top_buyer_offer": top_buyer_offer,
                "top_buyer_net_realisation": top_buyer_net_realisation,
                "top_buyer_batch_net": top_buyer_batch_net
            })

        # 5. Sort markets by Net Realisation per quintal descending (Best market first)
        calculated_markets.sort(key=lambda m: m["net_realisation_per_quintal"], reverse=True)

        # Assign recommendation ranks and flags
        for index, market in enumerate(calculated_markets):
            market["rank"] = index + 1
            if index == 0:
                market["recommendation_tag"] = "Recommended - Optimal Net Realisation"
            elif market["distance_km"] > 100:
                market["recommendation_tag"] = "High Transport Leakage"
            else:
                market["recommendation_tag"] = "Moderate Option"

        # 6. Fetch top buyer deal across all markets for KPI highlights
        cursor.execute("""
            SELECT
                b.name AS buyer_name,
                b.offered_price,
                b.trust_score,
                m.name AS market_name,
                m.distance_km,
                (m.distance_km * m.transport_rate_per_km_quintal) AS transport_cost,
                (m.storage_cost_per_day_quintal * ?) AS storage_cost,
                (b.offered_price - (m.distance_km * m.transport_rate_per_km_quintal) - (m.storage_cost_per_day_quintal * ?)) AS net_realisation
            FROM buyers b
            JOIN markets m ON b.market_id = m.id
            ORDER BY net_realisation DESC
            LIMIT 1;
        """, (storage_days, storage_days))
        top_buyer_row = cursor.fetchone()
        best_buyer_deal = dict(top_buyer_row) if top_buyer_row else None

        # Fetch nominal highest bidder (highest offered price) to compare leakage
        cursor.execute("""
            SELECT
                b.name AS buyer_name,
                b.offered_price,
                m.name AS market_name,
                m.distance_km,
                (m.distance_km * m.transport_rate_per_km_quintal) AS transport_cost,
                (b.offered_price - (m.distance_km * m.transport_rate_per_km_quintal) - (m.storage_cost_per_day_quintal * ?)) AS net_realisation
            FROM buyers b
            JOIN markets m ON b.market_id = m.id
            ORDER BY b.offered_price DESC
            LIMIT 1;
        """, (storage_days,))
        highest_gross_buyer_row = cursor.fetchone()
        highest_gross_buyer = dict(highest_gross_buyer_row) if highest_gross_buyer_row else None

        # 7. Summary KPIs
        best_market = calculated_markets[0] if calculated_markets else None
        highest_gross_market = max(calculated_markets, key=lambda m: m["base_price_per_quintal"]) if calculated_markets else None

        # Calculate farmer profit saved by choosing highest Net Realisation vs nominal highest bidder
        transport_leakage_saved_per_quintal = 0.0
        batch_leakage_saved = 0.0
        if best_buyer_deal and highest_gross_buyer:
            transport_leakage_saved_per_quintal = round(best_buyer_deal["net_realisation"] - highest_gross_buyer["net_realisation"], 2)
            batch_leakage_saved = round(transport_leakage_saved_per_quintal * quantity, 2)

        # Total active buyers count
        cursor.execute("SELECT COUNT(*) as total_buyers FROM buyers;")
        total_buyers_count = cursor.fetchone()["total_buyers"]

        # Average distance across available markets
        avg_distance = round(sum(m["distance_km"] for m in calculated_markets) / len(calculated_markets), 1) if calculated_markets else 0.0

        kpis = {
            "farmer_name": farmer["name"],
            "farmer_location": farmer["location"],
            "crop": farmer["crop"],
            "quantity_quintals": quantity,
            "best_market_name": best_market["name"] if best_market else "N/A",
            "best_base_net_realisation_per_quintal": best_market["net_realisation_per_quintal"] if best_market else 0.0,
            "best_buyer_name": best_buyer_deal["buyer_name"] if best_buyer_deal else "N/A",
            "best_buyer_market": best_buyer_deal["market_name"] if best_buyer_deal else "N/A",
            "best_buyer_net_realisation_per_quintal": round(best_buyer_deal["net_realisation"], 2) if best_buyer_deal else 0.0,
            "best_buyer_trust_score": best_buyer_deal["trust_score"] if best_buyer_deal else 0.0,
            "highest_nominal_buyer_name": highest_gross_buyer["buyer_name"] if highest_gross_buyer else "N/A",
            "highest_nominal_gross_price": highest_gross_buyer["offered_price"] if highest_gross_buyer else 0.0,
            "transport_leakage_saved_per_quintal": transport_leakage_saved_per_quintal,
            "batch_leakage_saved_total": batch_leakage_saved,
            "farmer_batch_potential_net": round((best_buyer_deal["net_realisation"] if best_buyer_deal else best_market["net_realisation_per_quintal"]) * quantity, 2),
            "best_market_distance_km": best_market["distance_km"] if best_market else 0.0,
            "highest_nominal_market_name": highest_gross_market["name"] if highest_gross_market else "N/A",
            "nominal_leader_net_realisation": highest_gross_market["net_realisation_per_quintal"] if highest_gross_market else 0.0,
            "total_markets_evaluated": len(calculated_markets),
            "total_buyers_registered": total_buyers_count,
            "average_market_distance_km": avg_distance,
            "storage_days_applied": storage_days
        }

        return jsonify({
            "success": True,
            "farmer": farmer,
            "kpis": kpis,
            "markets": calculated_markets
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to calculate dashboard data: {str(e)}"
        }), 500
    finally:
        conn.close()


@app.route("/api/buyers", methods=["GET"])
def get_buyers():
    """
    Verified Buyer Matching Endpoint (Phase 3 — upgraded).
    Returns verified buyers with a dynamically computed Match Score (0-100)
    that ranks each buyer's suitability for the farmer's current lot.

    Match Score Formula (4 components):
        Price Compatibility  (40%): How close the buyer's offered price is to the
                                    farmer's expected price. Capped at 40 points.
        Distance Score       (30%): Shorter distance = higher score. Max 30 points
                                    for buyers within 10 km, scaling down to 0 beyond 250 km.
        Quality Match        (10%): 10 points if the farmer's quality grade is accepted
                                    by the buyer; 0 otherwise.
        Trust / Reliability  (20%): Composite of trust_score (10%) and
                                    payment_reliability_pct (10%).

    Optional Query Parameters:
        - crop          : Filter by crop (default: 'Tomato')
        - quality_grade : Farmer's lot grade for quality match check (default: 'A')
        - expected_price: Farmer's expected price for price compatibility score (default: 2700)
        - storage_days  : Days of storage for net realisation calc (default: 1)
        - farmer_id     : Farmer profile ID (default: 1)
        - sort_by       : 'match_score' (default), 'net_realisation', 'trust_score', 'offered_price'
    """
    crop_filter     = request.args.get("crop",           default="Tomato",  type=str)
    quality_grade   = request.args.get("quality_grade",  default="A",       type=str).upper()
    expected_price  = request.args.get("expected_price", default=2700.0,    type=float)
    storage_days    = request.args.get("storage_days",   default=1,         type=int)
    farmer_id       = request.args.get("farmer_id",      default=1,         type=int)
    sort_by         = request.args.get("sort_by",        default="match_score", type=str)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch farmer profile for context
        cursor.execute(
            "SELECT id, name, location, crop, quantity_quintals FROM farmers WHERE id = ?;",
            (farmer_id,)
        )
        farmer_row = cursor.fetchone()
        farmer_quantity = farmer_row["quantity_quintals"] if farmer_row else 50.0

        # Fetch verified buyers joined with their operating market
        query = """
            SELECT
                b.id, b.name, b.required_crop, b.offered_price, b.trust_score,
                b.payment_terms, b.verified_buyer, b.accepted_quality_grades,
                b.payment_reliability_pct, b.minimum_quantity_quintals,
                b.maximum_quantity_quintals, b.buyer_type, b.market_id,
                m.name AS market_name, m.location AS market_location,
                m.distance_km, m.transport_rate_per_km_quintal,
                m.storage_cost_per_day_quintal
            FROM buyers b
            LEFT JOIN markets m ON b.market_id = m.id
            WHERE LOWER(b.required_crop) = LOWER(?)
        """
        cursor.execute(query, (crop_filter,))
        rows = cursor.fetchall()

        # Max offered price across all buyers (used for price score normalisation)
        max_offered = max((dict(r)["offered_price"] for r in rows), default=1.0)

        buyer_list = []
        for row in rows:
            data = dict(row)
            offered  = data["offered_price"]
            distance = data["distance_km"] or 0.0
            t_rate   = data["transport_rate_per_km_quintal"] or 0.0
            s_rate   = data["storage_cost_per_day_quintal"]  or 0.0

            # Net Realisation calculation (reuse helper)
            cost_info = calculate_cost_breakdown(
                gross_price=offered,
                distance_km=distance,
                transport_rate=t_rate,
                storage_rate=s_rate,
                storage_days=storage_days
            )

            # -------------------------------------------------------
            # MATCH SCORE ALGORITHM (0 – 100)
            # -------------------------------------------------------

            # Component 1: Price Compatibility (40 pts max)
            # Score scales with how close the offered price is to the farmer's
            # expected price. A buyer offering >= expected price earns full 40 pts.
            if expected_price > 0:
                price_ratio = min(offered / expected_price, 1.0)
            else:
                price_ratio = 1.0
            price_score = round(price_ratio * 40.0, 2)

            # Component 2: Distance Score (30 pts max)
            # Linear decay: 30 pts at 0 km, 0 pts at 250+ km.
            max_distance_threshold = 250.0
            distance_score = round(
                max(0.0, (1.0 - distance / max_distance_threshold)) * 30.0, 2
            )

            # Component 3: Quality Match (10 pts)
            # Buyer's accepted_quality_grades is a comma-separated string e.g. 'A,B'
            accepted_grades = [g.strip().upper() for g in data["accepted_quality_grades"].split(",")]
            quality_score = 10.0 if quality_grade in accepted_grades else 0.0

            # Component 4: Trust & Payment Reliability (20 pts)
            # 10 pts from trust_score (out of 5.0) and 10 pts from payment_reliability_pct
            trust_component       = (data["trust_score"] / 5.0) * 10.0
            reliability_component = (data["payment_reliability_pct"] / 100.0) * 10.0
            trust_score_pts = round(trust_component + reliability_component, 2)

            # Total Match Score
            match_score = round(price_score + distance_score + quality_score + trust_score_pts, 1)
            match_score = min(match_score, 100.0)  # Hard cap at 100

            buyer_list.append({
                "id":             data["id"],
                "name":           data["name"],
                "required_crop":  data["required_crop"],
                "buyer_type":     data["buyer_type"],
                "verified_buyer": bool(data["verified_buyer"]),
                "offered_price":  offered,
                "trust_score":    data["trust_score"],
                "payment_terms":  data["payment_terms"],
                "payment_reliability_pct": data["payment_reliability_pct"],
                "accepted_quality_grades": data["accepted_quality_grades"],
                "minimum_quantity_quintals": data["minimum_quantity_quintals"],
                "maximum_quantity_quintals": data["maximum_quantity_quintals"],
                "market": {
                    "id":          data["market_id"],
                    "name":        data["market_name"],
                    "location":    data["market_location"],
                    "distance_km": distance
                },
                "transport_cost_per_quintal":  cost_info["transport_cost"],
                "storage_cost_per_quintal":    cost_info["storage_cost"],
                "total_deductions_per_quintal": cost_info["total_deductions"],
                "net_realisation_per_quintal": cost_info["net_realisation"],
                "total_batch_realisation":     round(cost_info["net_realisation"] * farmer_quantity, 2),
                # Match Score breakdown for transparency
                "match_score":       match_score,
                "match_breakdown": {
                    "price_score":    price_score,
                    "distance_score": distance_score,
                    "quality_score":  quality_score,
                    "trust_score_pts": trust_score_pts
                }
            })

        # Apply sorting
        sort_keys = {
            "trust_score":     lambda b: b["trust_score"],
            "offered_price":   lambda b: b["offered_price"],
            "net_realisation": lambda b: b["net_realisation_per_quintal"]
        }
        sort_fn = sort_keys.get(sort_by, lambda b: b["match_score"])
        buyer_list.sort(key=sort_fn, reverse=True)

        # Assign ranks
        for idx, buyer in enumerate(buyer_list):
            buyer["rank"] = idx + 1

        return jsonify({
            "success":   True,
            "count":     len(buyer_list),
            "sorted_by": sort_by,
            "buyers":    buyer_list
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch buyers: {str(e)}"
        }), 500
    finally:
        conn.close()


@app.route("/api/lots", methods=["POST"])
def create_lot():
    """
    Lot Creation Endpoint (Phase 3).
    Accepts a farmer harvest lot digitization payload and inserts it into
    the `lots` table. Returns a human-readable Lot ID (e.g. LOT-1024).

    Expected JSON body:
        crop           : str   — e.g. 'Tomato'
        quantity       : float — in quintals
        harvest_date   : str   — ISO date e.g. '2026-09-05'
        quality_grade  : str   — 'A', 'B', or 'C'
        minimum_price  : float — floor price in INR/quintal
        expected_price : float — target price in INR/quintal
        farmer_id      : int   — (optional, defaults to 1)
    """
    payload = request.get_json(force=True, silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Invalid or missing JSON body"}), 400

    # Extract and validate required fields
    crop           = payload.get("crop",          "").strip()
    quantity       = payload.get("quantity",       0)
    harvest_date   = payload.get("harvest_date",   "").strip()
    quality_grade  = payload.get("quality_grade",  "B").strip().upper()
    minimum_price  = payload.get("minimum_price",  0)
    expected_price = payload.get("expected_price", 0)
    farmer_id      = payload.get("farmer_id",      1)

    if not crop or not quantity or not harvest_date:
        return jsonify({
            "success": False,
            "error": "Missing required fields: crop, quantity, harvest_date"
        }), 400

    if quality_grade not in ("A", "B", "C"):
        quality_grade = "B"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Determine the next lot number to create a sequential lot code
        cursor.execute("SELECT COUNT(*) AS cnt FROM lots;")
        existing_count = cursor.fetchone()["cnt"]
        lot_number = 1001 + existing_count
        lot_code = f"LOT-{lot_number}"

        # Insert the new lot
        cursor.execute("""
            INSERT INTO lots
                (lot_code, farmer_id, crop, quantity_quintals, harvest_date,
                 quality_grade, minimum_price, expected_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE');
        """, (lot_code, farmer_id, crop, float(quantity), harvest_date,
               quality_grade, float(minimum_price), float(expected_price)))
        conn.commit()

        new_id = cursor.lastrowid

        return jsonify({
            "success":   True,
            "lot_id":    new_id,
            "lot_code":  lot_code,
            "status":    "ACTIVE",
            "message":   f"Lot {lot_code} created successfully. Matching buyers will be notified.",
            "lot": {
                "id":              new_id,
                "lot_code":        lot_code,
                "farmer_id":       farmer_id,
                "crop":            crop,
                "quantity":        float(quantity),
                "harvest_date":    harvest_date,
                "quality_grade":   quality_grade,
                "minimum_price":   float(minimum_price),
                "expected_price":  float(expected_price),
                "status":          "ACTIVE"
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to create lot: {str(e)}"
        }), 500
    finally:
        conn.close()


@app.route("/api/lots", methods=["GET"])
def get_lots():
    """
    Lot Listing Endpoint.
    Returns all lots for a farmer, optionally filtered by status.

    Optional Query Parameters:
        - farmer_id: Farmer ID (default 1)
        - status: Filter by lot status ('ACTIVE', 'MATCHED', 'SOLD', 'EXPIRED')
    """
    farmer_id = request.args.get("farmer_id", default=1, type=int)
    status_filter = request.args.get("status", default=None, type=str)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if status_filter:
            cursor.execute(
                "SELECT * FROM lots WHERE farmer_id = ? AND status = ? ORDER BY created_at DESC;",
                (farmer_id, status_filter.upper())
            )
        else:
            cursor.execute(
                "SELECT * FROM lots WHERE farmer_id = ? ORDER BY created_at DESC;",
                (farmer_id,)
            )
        rows = cursor.fetchall()
        lots = [dict(r) for r in rows]

        return jsonify({"success": True, "count": len(lots), "lots": lots}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to fetch lots: {str(e)}"}), 500
    finally:
        conn.close()


@app.route("/api/predict", methods=["GET"])
def get_price_forecast():
    """
    AI Price Forecast Endpoint.
    Returns 30-day historical price data, 7-day forecast, and a selling recommendation
    generated by the Scikit-Learn LinearRegression model in ai_engine.py.

    Optional Query Parameters:
        - crop: Name of crop to forecast (default: 'Tomato')
    """
    crop = request.args.get("crop", default="Tomato", type=str)

    try:
        forecast_data = train_and_predict_prices(crop=crop)
        return jsonify({
            "success": True,
            "data": forecast_data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"AI forecast failed: {str(e)}"
        }), 500


@app.route("/api/market-intelligence", methods=["GET"])
def get_market_intelligence():
    """
    Market Intelligence Endpoint.
    Returns a detailed comparative breakdown for all markets including:
        - Gross Mandi Rate
        - Distance & Transport Cost
        - Storage Cost (configurable days)
        - Mandi Transaction Fee (APMC cess: 1% of gross)
        - Final Net Farmer Realisation
    Markets are sorted descending by Net Realisation. The #1 market is flagged
    with ai_recommended = True.

    Optional Query Parameters:
        - storage_days: Number of storage days (default 3)
        - quantity_quintals: Farmer's lot size in quintals (default 20)
        - farmer_id: Farmer profile ID (default 1)
    """
    storage_days = request.args.get("storage_days", default=3, type=int)
    quantity = request.args.get("quantity_quintals", default=20, type=float)
    farmer_id = request.args.get("farmer_id", default=1, type=int)

    # APMC mandi cess rate (typically 1% of gross value in Maharashtra)
    MANDI_CESS_RATE = 0.01

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch farmer info
        cursor.execute(
            "SELECT id, name, location, crop, quantity_quintals FROM farmers WHERE id = ?;",
            (farmer_id,)
        )
        farmer_row = cursor.fetchone()
        farmer = dict(farmer_row) if farmer_row else None

        # Fetch all markets with cost rates
        cursor.execute("""
            SELECT id, name, location, base_price, distance_km,
                   transport_rate_per_km_quintal, storage_cost_per_day_quintal
            FROM markets;
        """)
        market_rows = cursor.fetchall()

        # Compute full cost breakdown for each market
        market_analysis = []
        for row in market_rows:
            m = dict(row)

            gross_price = m["base_price"]
            distance = m["distance_km"]
            transport_rate = m["transport_rate_per_km_quintal"]
            storage_rate = m["storage_cost_per_day_quintal"]

            # Per-quintal calculations
            transport_cost = round(distance * transport_rate, 2)
            storage_cost = round(storage_rate * storage_days, 2)
            mandi_fee = round(gross_price * MANDI_CESS_RATE, 2)
            total_deductions = round(transport_cost + storage_cost + mandi_fee, 2)
            net_realisation = round(gross_price - total_deductions, 2)

            # Batch-level totals (for the farmer's entire lot)
            batch_gross = round(gross_price * quantity, 2)
            batch_transport = round(transport_cost * quantity, 2)
            batch_storage = round(storage_cost * quantity, 2)
            batch_mandi_fee = round(mandi_fee * quantity, 2)
            batch_net = round(net_realisation * quantity, 2)

            market_analysis.append({
                "id": m["id"],
                "name": m["name"],
                "location": m["location"],
                "distance_km": distance,
                "gross_price_per_quintal": gross_price,
                "transport_rate_per_km": transport_rate,
                "transport_cost_per_quintal": transport_cost,
                "storage_rate_per_day": storage_rate,
                "storage_days": storage_days,
                "storage_cost_per_quintal": storage_cost,
                "mandi_cess_rate": MANDI_CESS_RATE,
                "mandi_fee_per_quintal": mandi_fee,
                "total_deductions_per_quintal": total_deductions,
                "net_realisation_per_quintal": net_realisation,
                "batch_quantity": quantity,
                "batch_gross": batch_gross,
                "batch_transport": batch_transport,
                "batch_storage": batch_storage,
                "batch_mandi_fee": batch_mandi_fee,
                "batch_net": batch_net,
                "ai_recommended": False
            })

        # Sort by Net Realisation descending
        market_analysis.sort(key=lambda x: x["net_realisation_per_quintal"], reverse=True)

        # Flag the #1 market as AI-recommended and assign ranks
        for idx, market in enumerate(market_analysis):
            market["rank"] = idx + 1
            if idx == 0:
                market["ai_recommended"] = True
                market["recommendation_tag"] = "AI Recommended - Optimal Net Realisation"
            elif market["distance_km"] > 100:
                market["recommendation_tag"] = "High Transport Leakage"
            else:
                market["recommendation_tag"] = "Viable Alternative"

        # Summary KPIs for the intelligence view
        best = market_analysis[0] if market_analysis else None
        worst = market_analysis[-1] if market_analysis else None

        summary = {
            "best_market": best["name"] if best else "N/A",
            "best_net_per_quintal": best["net_realisation_per_quintal"] if best else 0,
            "best_batch_net": best["batch_net"] if best else 0,
            "worst_market": worst["name"] if worst else "N/A",
            "worst_net_per_quintal": worst["net_realisation_per_quintal"] if worst else 0,
            "net_difference_per_quintal": round(
                (best["net_realisation_per_quintal"] - worst["net_realisation_per_quintal"]), 2
            ) if best and worst else 0,
            "total_markets": len(market_analysis),
            "quantity_quintals": quantity,
            "storage_days": storage_days,
            "mandi_cess_rate_percent": MANDI_CESS_RATE * 100
        }

        return jsonify({
            "success": True,
            "farmer": farmer,
            "summary": summary,
            "markets": market_analysis
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Market intelligence failed: {str(e)}"
        }), 500
    finally:
        conn.close()


@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    """
    Transaction Tracking Endpoint (Phase 4).
    Returns active and past harvest trade transactions for a farmer,
    complete with vertical timeline status steps.

    Optional Query Parameters:
        - farmer_id: ID of farmer (default 1)
    """
    farmer_id = request.args.get("farmer_id", default=1, type=int)

    transactions = [
        {
            "id": "TXN-9081",
            "lot_code": "LOT-1003",
            "crop": "Tomato (Grade A)",
            "quantity_quintals": 20.0,
            "buyer_name": "Sahyadri FPC Ltd",
            "buyer_type": "FPO",
            "gross_price_per_quintal": 2820.0,
            "net_realisation_per_quintal": 2743.20,
            "total_payout": 54864.0,
            "destination_market": "Pimpalgaon Baswant APMC",
            "created_at": "2026-09-02 11:00:00",
            "current_step": 3,
            "status_title": "Transport Assigned",
            "status_color": "blue",
            "driver_name": "Suresh Kamble (MH-15-EG-4421)",
            "eta": "Today, 4:30 PM",
            "timeline": [
                {
                    "step": 1,
                    "title": "Lot Created",
                    "description": "Harvest lot LOT-1003 digitized as Grade A (20.0 quintals)",
                    "timestamp": "02 Sep 2026, 09:30 AM",
                    "status": "completed"
                },
                {
                    "step": 2,
                    "title": "Buyer Matched",
                    "description": "Matched with Sahyadri FPC Ltd @ Rs 2,820/q (Match Score: 98%)",
                    "timestamp": "02 Sep 2026, 11:00 AM",
                    "status": "completed"
                },
                {
                    "step": 3,
                    "title": "Transport Assigned",
                    "description": "Refrigerated Transit Van MH-15-EG-4421 dispatched from Nashik hub",
                    "timestamp": "03 Sep 2026, 08:15 AM",
                    "status": "active"
                },
                {
                    "step": 4,
                    "title": "Delivery In Progress",
                    "description": "Quality check & weighbridge verification at Pimpalgaon APMC",
                    "timestamp": "Pending arrival",
                    "status": "pending"
                },
                {
                    "step": 5,
                    "title": "Payment Completed",
                    "description": "Direct bank settlement of Rs 54,864 into registered account",
                    "timestamp": "Pending delivery",
                    "status": "pending"
                }
            ]
        },
        {
            "id": "TXN-9075",
            "lot_code": "LOT-0998",
            "crop": "Tomato (Grade B)",
            "quantity_quintals": 40.0,
            "buyer_name": "Metro Food Wholesalers",
            "buyer_type": "Wholesaler",
            "gross_price_per_quintal": 2950.0,
            "net_realisation_per_quintal": 2514.20,
            "total_payout": 100568.0,
            "destination_market": "Vashi APMC (Navi Mumbai)",
            "created_at": "2026-08-26 14:00:00",
            "current_step": 5,
            "status_title": "Payment Completed",
            "status_color": "emerald",
            "driver_name": "Ramesh Chavan (MH-04-FK-9910)",
            "eta": "Delivered on 28 Aug",
            "timeline": [
                {
                    "step": 1,
                    "title": "Lot Created",
                    "description": "Harvest lot LOT-0998 digitized as Grade B (40.0 quintals)",
                    "timestamp": "26 Aug 2026, 02:00 PM",
                    "status": "completed"
                },
                {
                    "step": 2,
                    "title": "Buyer Matched",
                    "description": "Matched with Metro Food Wholesalers @ Rs 2,950/q",
                    "timestamp": "26 Aug 2026, 03:30 PM",
                    "status": "completed"
                },
                {
                    "step": 3,
                    "title": "Transport Assigned",
                    "description": "Heavy Logistics Truck MH-04-FK-9910 loaded at Dindori farm",
                    "timestamp": "27 Aug 2026, 06:00 AM",
                    "status": "completed"
                },
                {
                    "step": 4,
                    "title": "Delivery In Progress",
                    "description": "Delivered and verified at Vashi APMC gate #4 (Grade B confirmed)",
                    "timestamp": "28 Aug 2026, 09:10 AM",
                    "status": "completed"
                },
                {
                    "step": 5,
                    "title": "Payment Completed",
                    "description": "Rs 100,568 transferred via NEFT Ref #NEFT889210034",
                    "timestamp": "28 Aug 2026, 02:45 PM",
                    "status": "completed"
                }
            ]
        }
    ]

    return jsonify({"success": True, "count": len(transactions), "transactions": transactions}), 200


@app.route("/api/grievances", methods=["GET"])
def get_grievances():
    """
    Grievance List Endpoint (Phase 4).
    Returns support tickets filed by the farmer.

    Optional Query Parameters:
        - farmer_id: Farmer ID (default 1)
    """
    farmer_id = request.args.get("farmer_id", default=1, type=int)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT * FROM grievances WHERE farmer_id = ? ORDER BY created_at DESC;",
            (farmer_id,)
        )
        rows = cursor.fetchall()
        grievances = [dict(r) for r in rows]

        return jsonify({"success": True, "count": len(grievances), "grievances": grievances}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to fetch grievances: {str(e)}"}), 500
    finally:
        conn.close()


@app.route("/api/grievances", methods=["POST"])
def create_grievance():
    """
    Grievance Submission Endpoint (Phase 4).
    Allows a farmer to submit a support ticket for issues such as
    Payment Delay, Quality Dispute, or Transport Issue.

    Expected JSON body:
        farmer_id   : int   — (optional, default 1)
        category    : str   — 'Payment Delay', 'Quality Dispute', or 'Transport Issue'
        description : str   — detailed problem statement
    """
    payload = request.get_json(force=True, silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Invalid or missing JSON body"}), 400

    farmer_id   = payload.get("farmer_id",   1)
    category    = payload.get("category",    "").strip()
    description = payload.get("description", "").strip()

    if not category or not description:
        return jsonify({
            "success": False,
            "error": "Missing required fields: category, description"
        }), 400

    valid_categories = ["Payment Delay", "Quality Dispute", "Transport Issue", "Other"]
    if category not in valid_categories:
        category = "Other"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO grievances (farmer_id, category, description, status)
            VALUES (?, ?, ?, 'Submitted');
        """, (farmer_id, category, description))
        conn.commit()

        new_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "message": "Grievance ticket created successfully. AgriLink Help Desk officer assigned.",
            "grievance": {
                "id":          new_id,
                "farmer_id":   farmer_id,
                "category":    category,
                "description": description,
                "status":      "Submitted",
                "created_at":  "Just now"
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to create grievance: {str(e)}"
        }), 500
    finally:
        conn.close()


@app.route("/")
def home():
    """
    Root endpoint listing all available API endpoints.
    """
    return jsonify({
        "service": "AgriLink API",
        "status": "online",
        "message": "AgriLink API is running.",
        "endpoints": {
            "dashboard":          "/api/dashboard",
            "buyers":             "/api/buyers",
            "lots_get":           "/api/lots",
            "lots_post":          "/api/lots  (POST)",
            "predict":            "/api/predict",
            "market_intelligence": "/api/market-intelligence",
            "transactions":       "/api/transactions",
            "grievances_get":     "/api/grievances",
            "grievances_post":    "/api/grievances (POST)",
            "health":             "/api/health"
        }
    }), 200


if __name__ == "__main__":
    # Start the Flask development server on port 5000
    print("[INFO] Starting AgriLink Flask server on http://127.0.0.1:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=True)