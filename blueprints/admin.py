from flask import Blueprint, request, jsonify, current_app
from utils.db import get_db_connection
from blueprints.users import token_required  # Reuse token_required decorator
from functools import wraps
from flask_bcrypt import Bcrypt
from utils.subscription_manager import expired_subscriptions

admin_bp = Blueprint('admin', __name__)
bcrypt = Bcrypt()

# Admin authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        try:
            with get_db_connection() as db, db.cursor() as cursor:
                cursor.execute("SELECT role FROM users WHERE username = %s", (current_user,))
                user_role = cursor.fetchone()
                
                if not user_role or user_role[0] != 'admin':  
                    return jsonify({"error": "Unauthorized access"}), 403
        except Exception as e:
            current_app.logger.error(f"Error checking admin role: {e}")
            return jsonify({"error": "An internal error occurred"}), 500
        
        return f(current_user, *args, **kwargs)
    return decorated

# Fetch all users
@admin_bp.route('/admin/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT username, email FROM users")
            users = cursor.fetchall()
        return jsonify([{"username": user[0], "email": user[1]} for user in users]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching users: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Update user details
@admin_bp.route('/admin/users/<username>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, username):
    data = request.get_json()
    new_email = data.get('email')
    new_password = data.get('password')
    
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            if new_email:
                cursor.execute("UPDATE users SET email = %s WHERE username = %s", (new_email, username))
            if new_password:
                hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
                cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed_password, username))
            db.commit()
        return jsonify({'message': 'User details updated successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error updating user: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Block a user
@admin_bp.route('/admin/users/<username>/block', methods=['PATCH'])
@token_required
@admin_required
def block_user(current_user, username):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET status = 'blocked' WHERE username = %s", (username,))
            db.commit()
        return jsonify({"message": f"User {username} blocked successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error blocking user: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Fetch active subscriptions
@admin_bp.route('/admin/subscriptions', methods=['GET'])
@token_required
@admin_required
def admin_subscriptions(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            query = """
                SELECT u.username, p.name, s.start_at, s.expires_at 
                FROM subscriptions s
                JOIN users u ON u.id = s.user_id
                JOIN plans p ON p.id = s.plan_id
                WHERE s.expires_at > NOW()
            """
            cursor.execute(query)
            subscriptions = cursor.fetchall()
        if not subscriptions:
            return jsonify({"message": "No active subscriptions found"}), 404
        return jsonify([
            {"username": sub[0], "plan": sub[1], "expires_at": sub[3]} for sub in subscriptions
        ]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching subscriptions: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Run subscription expiration process (Admin only)
@admin_bp.route('/admin/expire_subscriptions', methods=['POST'])
@token_required
@admin_required
def run_expiration(current_user):
    try:
        expired_subscriptions()  
        return jsonify({"message": "Expired subscriptions processed successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing expired subscriptions: {e}")
        return jsonify({"error": str(e)}), 500
