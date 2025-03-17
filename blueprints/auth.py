from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import Bcrypt
from utils.db import get_db_connection
from MySQLdb import IntegrityError
import jwt, datetime, secrets, re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from blueprints.admin import admin_required

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

def init_bcrypt(app):
    bcrypt.init_app(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except Exception:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password' ,'phone_no']
    if not all(field in data for field in required_fields):
        return jsonify({'error': {'code': 'missing_fields', 'message': 'Username, email, password and phone number are required.'}}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    username, email, password, phone_no = data['username'], data['email'], data['password'], data['phone_no']
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("INSERT INTO users (username, email, password_hash, phone_no, status, role) VALUES (%s, %s, %s, %s, 'inactive', 'user')", 
                           (username, email, password_hash, phone_no))
            db.commit()
        
        # Generate verification token
        verification_token = generate_verification_token(username)
        
        # Send verification email (add email sending logic)
        send_verification_email(email, verification_token)
        
        # Return success response
        return jsonify({
            "message": "Registration successful. Please check your email to verify your account."
        }), 201
        
        print(f"Verification Token: {verification_token}")

    except IntegrityError as e:
        if 'username' in str(e.args) or 'PRIMARY' in str(e.args):
            return jsonify({'error': "Username already exists"}), 409
        elif 'email' in str(e.args):
            return jsonify({'error': "Email already exists"}), 409
        return jsonify({'message': 'Database error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data.get('username') or not data.get('password'):
        return jsonify({"error": {"code": "missing_fields", "message": "Username and password are required."}}), 400

    username, password = data['username'], data['password']

    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT id, email, password_hash, status, role FROM users WHERE username = %s", (username,))
            result = cursor.fetchone()

        if not result or not bcrypt.check_password_hash(result[2], password):
            log_login_attempt(result[0] if result else None, result[1] if result else None, request.remote_addr, "Failed")
            return jsonify({'error': {'code': 'invalid_credentials', 'message': 'Invalid username or password'}}), 401

        user_id, email, _, status, role = result
        if status != 'active':
            return jsonify({'error': 'Account is not active. Please verify your email.'}), 403

        access_token = generate_access_token(username, role)
        refresh_token = generate_refresh_token(username)

        log_login_attempt(user_id, email, request.remote_addr, "Success")

        return jsonify({"access_token": access_token, "refresh_token": refresh_token, "role": role}), 200

    except Exception as e:
        current_app.logger.error(f"Error in login: {e}")
        return jsonify({'error': {'code': 'internal_error', 'message': 'An internal error occurred.'}}), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({"error": "Refresh token required"}), 400
    
    try:
        # Verify refresh token
        decoded = jwt.decode(refresh_token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        username = decoded['username']
        
        # Get user role for new access token
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT role FROM users WHERE username = %s", (username,))
            role = cursor.fetchone()[0]
        
        # Generate new access token
        new_access_token = generate_access_token(username, role)
        
        return jsonify({"access_token": new_access_token}), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token expired, please log in again"}), 401
    except Exception as e:
        return jsonify({"error": f"Token refresh error: {str(e)}"}), 500

@auth_bp.route('/request_reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Find user by email
    with get_db_connection() as db, db.cursor() as cursor:
        cursor.execute("SELECT username FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
    
    if not result:
        # Don't reveal if email exists or not for security
        return jsonify({"message": "If a user with this email exists, a reset link has been sent"}), 200
    
    # Generate reset token
    reset_token = generate_reset_token(result[0])
    
    # Send reset email
    send_password_reset_email(email, reset_token)
    
    return jsonify({"message": "Password reset email sent"}), 200

@auth_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    reset_token = data.get('reset_token')
    new_password = data.get('new_password')
    
    if not reset_token or not new_password:
        return jsonify({"error": "Reset token and new password are required"}), 400
    
    try:
        # Verify token
        decoded = jwt.decode(reset_token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        username = decoded['username']
        
        # Update password
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", 
                          (hashed_password, username))
            db.commit()
        
        return jsonify({"message": "Password reset successfully"}), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Reset token has expired"}), 401
    except Exception as e:
        return jsonify({"error": f"Error resetting password: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # You could blacklist the token here if you implement a token blacklist
    # Or track active sessions in a database
    
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({"message": f"Hello, {current_user}. This is a protected route."})

@auth_bp.route('/admin', methods=['GET'])
@token_required
@admin_required
def admin_route(current_user):
    return jsonify({"message": f"Hello, {current_user}. This is an admin route."})

@auth_bp.route('/verify/<token>', methods=['GET'])
def verify_account(token):
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        username = decoded['username']
        
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("UPDATE users SET status = 'active' WHERE username = %s", (username,))
            db.commit()
        
        return jsonify({"message": "Account verified successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Verification failed: {str(e)}"}), 400

def generate_access_token(username, role):
    return jwt.encode({
        'username': username,
        'role': role,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

def generate_refresh_token(username):
    return jwt.encode({
        'username': username,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

def generate_reset_token(username):
    return jwt.encode({
        'username': username,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15),
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

def generate_verification_token(username):
    return jwt.encode({
        'username': username,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

def send_verification_email(email, token):
    sender_email = "wiman@gmail.com"
    sender_password = "wiman-email-password"
    smtp_server = "smtp.example.com"
    smtp_port = 587

    subject = "Verify your email address"
    verification_link = f"http://wiman-domain.com/verify?token={token}"
    body = f"Please click the following link to verify your email address: {verification_link}"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        current_app.logger.info(f"Verification email sent to {email}")
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {e}")

def send_password_reset_email(email, token):
    sender_email = "wiman@gmail.com"
    sender_password = "wiman-email-password"
    smtp_server = "smtp.example.com"
    smtp_port = 587

    subject = "Password Reset Request"
    reset_link = f"http://wiman-domain.com/reset_password?token={token}"
    body = f"Please click the following link to reset your password: {reset_link}"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        current_app.logger.info(f"Password reset email sent to {email}")
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email: {e}")

# Logs a login attemp in the database
def log_login_attempt(user_id, email, ip_address, status):
    try:
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("INSERT INTO login_attempts (user_id, email, ip_address, status) VALUES (%s, %s, %s, %s)", 
                           (user_id, email, ip_address, status))
            db.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log login attempt: {e}")
