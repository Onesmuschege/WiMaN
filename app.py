import logging
import jwt
import requests
import base64
import os
import datetime
import MySQLdb
import json
from dotenv import load_dotenv
from datetime import datetime
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from functools import wraps
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
load_dotenv()

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")
def get_mpesa_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(url, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        return None


def initiate_stk_push(phone_number, amount):
    access_token = get_mpesa_token()
    if not access_token:
        return {"error": "Failed to get access token"}

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": "WIMAN",
        "TransactionDesc": "Wi-Fi Subscription Payment"
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()



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
        database='wiman',
        autocommit=True
    )
@app.route('/test_db', methods=['GET'])
def test_db():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()
        return jsonify({"database": database_name[0] if database_name else "No database selected"}), 200
    except Exception as e:
        logging.error(f"Database connection error: {e}")
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
            logging.error(f"Token error:{e}")
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
        
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')
        with get_db_connection() as db, db.cursor() as cursor:
            query = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
            cursor.execute(query, (username, email, password_hash))
            logging.info(f"User {username} registered successfully")
            db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    
    except MySQLdb.IntegrityError as e:
        logging.error(f"MySQL Integrity Error: {e}")
        return jsonify({"error": "Uername already exists"}), 409
    
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

        if not result or not bcrypt.check_password_hash(result[0], password.encode('utf-8')):
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
                'code': 'internal_error',
                'message': 'An internal error occurred. Please try again later.',
            }
         }), 500

#Protected Data Route
@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            # Fetch the user's subscription and expiration date
            query = """SELECT expires_at, status FROM users_subscriptions
                       WHERE user_id = (SELECT id FROM users WHERE username = %s)"""
            cursor.execute(query, (current_user,))
            result = cursor.fetchone()

        if not result:
            return jsonify({"error": "No active subscription found"}), 404

        # Check if the subscription has expired
        expires_at, status = result
        if status == 'expired' or datetime.datetime.now(datetime.timezone.utc) > expires_at:
            return jsonify({"error": "Subscription expired. Please renew."}), 403

        return jsonify({"message": f"Hello {current_user}, you have access to protected data!"}), 200

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


# User Profile
@app.route('/profile', methods=['GET'])
@token_required  # Ensure user is authenticated
def get_profile(current_user):
    # Fetch user details from the database
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT username, email FROM users WHERE username = %s", (current_user,))
            user = cursor.fetchone()
        if user:
            return jsonify({
                'username': user[0],
                'email': user[1]
            })
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


@app.route('/profile', methods=['PUT'])
@token_required  # Ensure user is authenticated
def update_profile(current_user):
    # Get new details from the request
    data = request.get_json()
    new_email = data.get('email')
    new_password = data.get('password')  # Optional password change
    
    if new_email:
        # Update email in the database
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET email = %s WHERE username = %s", (new_email, current_user))
            db.commit()

    if new_password:
        # Hash and update password
        hashed_password = bcrypt.generate_password_hash(new_password.encode('utf-8')).decode('utf-8')
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed_password, current_user))
            db.commit()
    
    return jsonify({'message': 'Profile updated successfully'})


# Get All Subscription Plans
@app.route('/subscriptions', methods=['GET'])
@token_required
def get_subscriptions(current_user):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            query = "SELECT id, plan, duration, price, bandwidth_limit FROM subscriptions"
            cursor.execute(query)
            result = cursor.fetchall()
            
        if not result:
            return jsonify({"message": "No subscription plans available"}), 404
        
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
        logging.debug(f"Plan ID received: {data.get('plan_id')}")
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
            
            cursor.execute("SELECT id FROM users_subscriptions WHERE user_id = (SELECT id FROM users WHERE username = %s)", (current_user,))
            existing_subscription = cursor.fetchone()
            
            if existing_subscription:
                return jsonify({
                    "error": "User already has an Active Subscription"}), 400
                
            # Add subscription to user
            query = "INSERT INTO users_subscriptions (user_id, plan_id, expires_at) VALUES ((SELECT id FROM users WHERE username = %s), %s, NOW() + INTERVAL %s DAY)"
            cursor.execute(query, (current_user, plan_id, plan[1]))
            db.commit()
        logging.info(f"User {current_user} Successfully subscribed to {plan[0]}")
        return jsonify({"message": f"Successfully subscribed to {plan[0]}"}), 201
    
    except Exception as e:
            return jsonify({
                'error': {
                'code': 'internal_error',
                'message': 'An internal error occurred. Please try again later.'
                }
            }), 500
 
@app.route("/pay", methods=["POST"])
@token_required
def pay(current_user):
    data = request.get_json()
    phone_number = data.get("phone_number")
    amount = data.get("amount")

    if not phone_number or not amount:
        return jsonify({"error": "Phone number and amount are required"}), 400

    response = initiate_stk_push(phone_number, amount)
    return jsonify(response)



@app.route("/mpesa/callback", methods=["POST"])
def mpesa_callback():
    data = request.get_json()
    logging.info(f"MPESA CALLBACK RESPONSE: {json.dumps(data, indent=2)}")

    # Handle successful payment
    if data.get("Body", {}).get("stkCallback", {}).get("ResultCode") == 0:
        transaction_details = data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
        phone_number = next(item["Value"] for item in transaction_details if item["Name"] == "PhoneNumber")
        amount = next(item["Value"] for item in transaction_details if item["Name"] == "Amount")

        # Store payment details in the database
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("INSERT INTO payments (phone_number, amount, status) VALUES (%s, %s, %s)", 
                           (phone_number, amount, "Completed"))
            db.commit()

        return jsonify({"message": "Payment successful"}), 200

    return jsonify({"error": "Payment failed"}), 400

         
 
         
def expired_subscriptions():
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            # update expired subscriptions
            query = "UPDATE users_subscriptions SET status = 'expired' WHERE expires_at <NOW() AND (status IS NULL OR status ='active');"
            cursor.execute(query)
            db.commit()
            
            logging.info("Expired subscriptions updated successfully")
    except Exception as e:
        logging.error(f"Error expiring subscriptions: {e}")


@app.route('/renew_subscription', methods=['POST'])
@token_required
def renew_subscription(current_user):
    try:
        data = request.get_json()
        duration_days = data.get('duration_days')  # User chooses how long to renew

        if not duration_days or not isinstance(duration_days, int) or duration_days <= 0:
            return jsonify({"error": "Invalid renewal duration"}), 400

        with get_db_connection() as db, db.cursor() as cursor:
            # Fetch current expiration date
            query = """SELECT expires_at, status FROM users_subscriptions
                       WHERE user_id = (SELECT id FROM users WHERE username = %s)"""
            cursor.execute(query, (current_user,))
            result = cursor.fetchone()

        if not result:
            return jsonify({"error": "No subscription found"}), 404

        expires_at, status = result

        # Determine new expiration date
        if not expires_at or status == 'expired' or datetime.datetime.now(datetime.timezone.utc) > expires_at:
            new_expiration = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=duration_days)
        else:
            new_expiration = expires_at + datetime.timedelta(days=duration_days)

        # Update subscription status & expiration
        with get_db_connection() as db, db.cursor() as cursor:
            update_query = """UPDATE users_subscriptions 
                              SET expires_at = %s, status = 'active' 
                              WHERE user_id = (SELECT id FROM users WHERE username = %s)"""
            cursor.execute(update_query, (new_expiration, current_user))
            db.commit()

        return jsonify({"message": "Subscription renewed successfully", "new_expires_at": new_expiration}), 200

    except Exception as e:
        logging.error(f"Error renewing subscription: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


@app.route('/admin/users', methods=['GET'])
@token_required
def get_users(current_user):
    # Ensure the user is an admin (check role or a predefined admin username)
    if current_user != 'admin': 
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT username, email FROM users")
            users = cursor.fetchall()
        
        return jsonify([{"username": user[0], "email": user[1]} for user in users]), 200
    
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@app.route('/admin/users/<username>', methods=['PUT'])
@token_required
def update_user(current_user, username):
    # Ensure the user is an admin
    if current_user != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()
    new_email = data.get('email')
    new_password = data.get('password')  # Optional password change

    try:
        if new_email:
            with get_db_connection() as db, db.cursor() as cursor:
                cursor.execute("UPDATE users SET email = %s WHERE username = %s", (new_email, username))
                db.commit()

        if new_password:
            hashed_password = bcrypt.generate_password_hash(new_password.encode('utf-8')).decode('utf-8')
            with get_db_connection() as db, db.cursor() as cursor:
                cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed_password, username))
                db.commit()

        return jsonify({'message': 'User details updated successfully'})

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


# API Endpoint to Block/Unblock a user'
@app.route('/admin/users/<username>/block', methods=['PATCH'])
@token_required
def block_user(current_user, username):
    #Ensuring user is admin
    if current_user != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403
    
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET status = 'blocked' WHERE username = %s", (username,))
            db.commit()
            
        return jsonify({"message": f"User {username} blocked successfully"}), 200
    
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


@app.route('/admin/subscriptions', methods=['GET'])
@token_required 
def get_subscriptions(current_user):
    if current_user != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT users.username, subscriptions.plan, users_subscriptions.expires_at FROM users_subscriptions JOIN users ON users.id = users_subscriptions.user_id JOIN subscriptions ON subscriptions.id = users_subscriptions.plan_id WHERE users_subscriptions.expires_at > NOW()")
            subscriptions = cursor.fetchall()

        if not subscriptions:
            return jsonify({"message": "No active subscriptions found"}), 404

        return jsonify([{"username": sub[0], "plan": sub[1], "expires_at": sub[2]} for sub in subscriptions]), 200

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


scheduler = BackgroundScheduler()
scheduler.add_job(expired_subscriptions, 'interval', hours=1) # Runs every hour
scheduler.start()

if __name__ == '__main__':
    app.run(debug=True)
