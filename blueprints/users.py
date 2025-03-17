from flask import Blueprint, request, jsonify, current_app
import jwt, datetime
from functools import wraps
from utils.db import get_db_connection
from flask_bcrypt import Bcrypt

users_bp = Blueprint('users', __name__)
bcrypt = Bcrypt()

# Utility: JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['username']
        except Exception as e:
            current_app.logger.error(f"Token error: {e}")
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@users_bp.route('/test_db', methods=['GET'])
def test_db():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()
        return jsonify({"database": database_name[0] if database_name else "No database selected"}), 200
    except Exception as e:
        current_app.logger.error(f"Database connection error: {e}")
        return jsonify({"error": str(e)}), 500

# User Registration
@users_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username, email, password, phone_number = data.get('username'), data.get('email'), data.get('password'), data.get('phone_number')
    if not username or not email or not password or not phone_number:
        return jsonify({'error': 'Missing required fields'}), 400
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("INSERT INTO users (username, email, password_hash, phone_number, status) VALUES (%s, %s, %s, %s, 'active')",
                           (username, email, hashed_password, phone_number))
            db.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Login    
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT password_hash, status FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            
            if not user or not bcrypt.check_password_hash(user[0], password):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            if user[1] != 'active':
                return jsonify({'error': 'Account is inactive.Please verify your email.'}), 403
            elif user[1] == 'blocked':
                return jsonify({'error': 'Account is blocked. Contact support for assistance.'}), 403
            
            token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Protected Route
@users_bp.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT expires_at, status FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE username = %s)", (current_user,))
            result = cursor.fetchone()
        if not result or result[1] != 'active' or result[0] < datetime.datetime.utcnow():
            return jsonify({'error': 'Subscription inactive or expired'}), 403
        return jsonify({'message': f'Hello {current_user}, you have access to protected data!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get User Profile
@users_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT username, email, phone_number, status FROM users WHERE username = %s", (current_user,))
            user = cursor.fetchone()
        return jsonify({'username': user[0], 'email': user[1], 'phone_number': user[2], 'status': user[3]}), 200 if user else jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Change Password
@users_bp.route('/change_password', methods=['PATCH'])
@token_required
def change_password(current_user):
    data = request.get_json()
    old_password, new_password = data.get('old_password'), data.get('new_password')
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT password_hash FROM users WHERE username = %s", (current_user,))
            user = cursor.fetchone()
            if not user or not bcrypt.check_password_hash(user[0], old_password):
                return jsonify({'error': 'Incorrect current password'}), 400
            hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed_password, current_user))
            db.commit()
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Subscription Plans
@users_bp.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT name, duration_days, price, bandwidth_limit FROM subscription_plans")
            plans = cursor.fetchall()

        # Structure plans into categories
        structured_plans = {"BASIC": [], "PREMIUM": [], "ENTERPRISE": []}

        # Define durations mapping
        duration_mapping = {
            1: "1 hour",
            3: "3 hours",
            12: "12 hours (6PM - 6AM)",
            7: "1 week",
            14: "2 weeks",
            30: "1 month"
        }

        # Process each plan
        for name, duration_days, price, bandwidth_limit in plans:
            plan_category = name.upper()  # Ensure uppercase for consistency

            structured_plans[plan_category].append({
                "duration": duration_mapping.get(duration_days, f"{duration_days} days"),
                "price": price,
                "bandwidth": bandwidth_limit,
                "devices": 1 if plan_category == "BASIC" else (1 if price ==150 else (2 if price in [300,600] else 4))
            })

        return jsonify({"plans": structured_plans}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Subscribe to Plan
@users_bp.route('/subscribe', methods=['POST'])
@token_required
def subscribe(current_user):
    data = request.get_json()
    plan_id = data.get('plan_id')
    
    if not plan_id:
        return jsonify({'error': 'Plan ID is required'}), 400

    try:
        with get_db_connection() as db, db.cursor() as cursor:
            # Fetch the plan name and duration from the plans table
            cursor.execute("SELECT name, duration FROM plans WHERE id = %s", (plan_id,))
            plan = cursor.fetchone()

            if not plan:
                return jsonify({'error': 'Invalid plan ID'}), 400

            name = plan[0]
            duration_days = plan[1]
            
            # Fetch the user_id using the current_user (username)
            cursor.execute("SELECT id FROM users WHERE username = %s", (current_user,))
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            user_id = user[0]

            # Insert the subscription
            cursor.execute(
                """
                INSERT INTO subscriptions (user_id, plan_id, expires_at, status)
                VALUES (%s, %s, NOW() + INTERVAL %s DAY, 'active')
                """,
                (user_id, plan_id, duration_days)
            )
            db.commit()

        return jsonify({'message': f"{current_user['username']} Subscription to {name} successful"}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500




