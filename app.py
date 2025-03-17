import os
import logging
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

# Import blueprints and utility functions
from blueprints.auth import auth_bp, init_bcrypt
from blueprints.users import users_bp
from blueprints.admin import admin_bp
from blueprints.mpesa import mpesa_bp
from utils.subscription_manager import expired_subscriptions
from utils.db import get_db_connection
from blueprints.error_handlers import register_error_handlers

# Ensure logs directory exists
if not os.path.exists("logs"):
    os.makedirs("logs")

# Configure logging for both file and console
log_file = "logs/wiman.log"
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all messages
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),  # Logs to file
        logging.StreamHandler(sys.stdout)  # Logs to terminal
    ]
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
register_error_handlers(app)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "12345678")

init_bcrypt(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(mpesa_bp, url_prefix='/mpesa')

# Add a root route to prevent 404 errors
@app.route('/')
def home():
    app.logger.debug("Home route accessed")
    return {"message": "Welcome to WIMAN API!"}, 200

@app.route("/api/test")
def test_api():
    app.logger.info("Test API route accessed")
    return jsonify({"message": "API is working!"})

# Scheduler for expired subscriptions
scheduler = BackgroundScheduler()
scheduler.add_job(expired_subscriptions, 'interval', hours=12)  # Runs every 12 hours
scheduler.start()

if __name__ == '__main__':
    try:
        app.logger.debug("Testing database connection")
        connection = get_db_connection()
        if connection:
            print("Database connection established!")
            app.logger.info("Database connection established!")
    except Exception as e:
        print(f"Database connection error: {e}")
        app.logger.error(f"Database connection error: {e}")
    finally:
        if 'connection' in locals():
            connection.close()
            app.logger.debug("Database connection closed")

    print("Flask app is starting on http://127.0.0.1:5000")
    app.logger.debug("Flask app is starting on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
