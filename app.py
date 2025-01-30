import logging
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt

import jwt
import datetime
import MySQLdb
from functools import wraps


# Flask app instance
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = '12345678'


#logging Configuration
logging.basicConfig(
    level=logging.DEBUG if app.config['DEBUG'] else logging.INFO,  # Use DEBUG for development, INFO/ERROR in production
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)


# Database connection
def get_db_connection():
    return MySQLdb.connect(
        host='localhost',
        user='Admin',
        password='Admin',
        database='wiman'
    )
@app.route('/test_db', methods=['GET'])
def test_db():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()
        return jsonify({"database": database_name[0] if database_name else "No database selected"}), 200
    except Exception as e:
        logging.error(f"Token decode error: {e}")
        return jsonify({"error": str(e)}), 500
    
    
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
        #Get user input(data)
        data = request.get_json()
        # Check if all required fields are provided
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({
                'error': {
                    'code': 'missing_fields',
                    'message': 'Username, email, and password are required.'
                }
            }), 400
            
        username = data['username']
        email = data['email']
        password = data['password']

        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        with get_db_connection() as db, db.cursor() as cursor:
            query = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
            cursor.execute(query, (username, email, password_hash))
            logging.info(f"User {username} registered successfully")
            db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({
            'error':{
                'code': 'internal error',
                'message': 'An internal error occurred. Please try again later!'
                }
            }), 500

# User Login
@app.route('/login', methods=['POST'])
def login():
    try:
        
        data = request.get_json()
        logging.debug(f"Received data: {data}")
        
        #check if all required fields are provided
        if not data.get('username') or not data.get('password'):
            return jsonify({
                "error": {
                    "code": "missing_fields",
                    "message": "Username and password are required."
                }
            }), 400
        
        username = data['username']
        password = data['password']
        
        with get_db_connection() as db, db.cursor() as cursor:
            query = "SELECT password_hash FROM users WHERE username = %s"
            cursor.execute(query, (username,))
            result = cursor.fetchone()

        if not result or not bcrypt.check_password_hash(result[0], password):
            return jsonify({
                'error': {
                    'code': 'invalid credentials',
                    'message': 'Invalid username or password'
                    }
                }), 401

        # role = result[1]
    
        #Generate JWT token
        token = jwt.encode({
            'username': username,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
        }, app.config['SECRET_KEY'], algorithm='HS256')        
        return jsonify({"token": token}), 200
    
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({
            'error':{
                'code': 'intrnal_error',
                'code': 'internal_error',
            }
         }), 500

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
        with get_db_connection() as db, db.cursor() as cursor:
            query = "SELECT username, email FROM users WHERE username = %s"
            cursor.execute(query, (current_user,))
            result = cursor.fetchone()

        if not result:
            return jsonify({"error": "User not found"}), 404
        
        logging.info(f"User {current_user} profile accessed successfully")
        return jsonify({"username": result[0], "email": result[1]}), 200
    
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# Get All Subscription Plans
@app.route('/subscriptions', methods=['GET'])
@token_required
def get_subscriptions():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
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
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


# Subscribe to a Plan
@app.route('/subscribe', methods=['POST'])
@token_required
def subscribe(current_user):
    try:
        data = request.get_json()
        
        #check plan_id is provided
        if not data.get('plan_id'):
            return jsonify({
                'error': {
                    'code': 'missing_plan_id',
                    'message': 'Plan ID is required'
                }
            }), 400
            
        plan_id = data['plan_id']
        with get_db_connection() as db, db.cursor() as cursor:
            # Validate Plan ID
            query = "SELECT plan, duration, price FROM subscriptions WHERE id = %s"
            cursor.execute(query, (plan_id,))
            plan = cursor.fetchone()

            if not plan:
                return jsonify({
                    'error':{
                        'code': 'invalid plan',
                        'message': 'Invalid plan ID'
                        }
                }), 404
            
            #The plan has a valid price and duration
            if not plan[2] or not plan[1]:
                return jsonify({
                    'error': {
                        'code': 'incomplete_plan',
                        'message': 'Plan details are incomplete.'
                    }
                }), 400
            
            # Add subscription to user
            query = "INSERT INTO user_subscriptions (user_id, plan_id, expires_at) VALUES ((SELECT id FROM users WHERE username = %s), %s, NOW() + INTERVAL %s DAY)"
            cursor.execute(query, (current_user, plan_id, plan[1]))
            db.commit()
        logging.info(f"User {current_user} Successfully subscribed to {plan[0]}")
        return jsonify({"message": f"Successfully subscribed to {plan[0]}"}), 201
    
    except Exception as e:
         logging.error(f"Error: {e}")
         return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'An internal error occurred. Please try again later.'
                }
            }), 500


if __name__ == '__main__':
    app.run(debug=True)
    app.run(debug=False)
