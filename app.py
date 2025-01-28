from flask import Flask, request, jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
import jwt
import datetime
import MySQLdb
from functools import wraps

# Flask app instance
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

# Database connection
db = MySQLdb.connect(
    host='localhost',
    user='root',
    password='root',
    database='wiman'
)

# Utility function: JWT Token required
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['username']
        except Exception as e:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Routes

# Home route
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to WIMAN Backend!'})

# User Registration
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']

        password_hash = generate_password_hash(password)
        cursor = db.cursor()
        query = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
        cursor.execute(query, (username, email, password_hash))
        db.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# User Login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        cursor = db.cursor()
        query = "SELECT password_hash FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        result = cursor.fetchone()

        if not result or not check_password_hash(result[0], password):
            return jsonify({"error": "Invalid username or password"}), 401

        token = jwt.encode({
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({"token": token}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Protected Data Route
@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({"message": f"Hello {current_user}, you have accessed protected data!"})

# User Profile
@app.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    try:
        cursor = db.cursor()
        query = "SELECT username, email FROM users WHERE username = %s"
        cursor.execute(query, (current_user,))
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"username": result[0], "email": result[1]}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Get All Subscription Plans
@app.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    try:
        cursor = db.cursor()
        query = "SELECT id, plan, duration, price, bandwith_limit FROM subscriptions"
        cursor.execute(query)
        result = cursor.fetchall()

        plans = []
        for row in result:
            plans.append({
                "id": row[0],
                "plan": row[1],
                "duration": row[2],
                "price": row[3],
                "bandwidth_limit": row[4]
            })

        return jsonify(plans), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Subscribe to a Plan
@app.route('/subscribe', methods=['POST'])
@token_required
def subscribe(current_user):
    try:
        data = request.get_json()
        plan_id = data['plan_id']

        cursor = db.cursor()

        # Validate Plan ID
        query = "SELECT plan, duration, price FROM subscriptions WHERE id = %s"
        cursor.execute(query, (plan_id,))
        plan = cursor.fetchone()

        if not plan:
            return jsonify({"error": "Invalid plan ID"}), 404

        # Add subscription to user
        query = "INSERT INTO user_subscriptions (user_id, plan_id, expires_at) VALUES ((SELECT id FROM users WHERE username = %s), %s, NOW() + INTERVAL 1 DAY)"
        cursor.execute(query, (current_user, plan_id))
        db.commit()

        return jsonify({"message": f"Successfully subscribed to {plan[0]}"}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)
