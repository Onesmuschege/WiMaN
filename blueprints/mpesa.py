import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import datetime
import requests
import json
import base64
from flask import Blueprint, request, jsonify, current_app
from utils.db import get_db_connection
from blueprints.users import token_required  # if /pay is protected

mpesa_bp = Blueprint('mpesa', __name__)

# Fetch MPESA details from environment variables or a config file as needed
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
        current_app.logger.error("Failed to get MPESA access token")
        return None

def initiate_stk_push(phone_number, amount):
    access_token = get_mpesa_token()
    if not access_token:
        return {"error": "Failed to get access token"}
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
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

# Initiate Payment endpoint (protected)
@mpesa_bp.route("/pay", methods=["POST"])
@token_required
def pay(current_user):
    data = request.get_json()
    phone_number = data.get("phone_number")
    amount = data.get("amount")
    if not phone_number or not amount:
        return jsonify({"error": "Phone number and amount are required"}), 400
    response = initiate_stk_push(phone_number, amount)
    return jsonify(response)

# MPESA Callback (public endpoint)
@mpesa_bp.route("/mpesa/callback", methods=["POST"])
def mpesa_callback():
    data = request.get_json()
    current_app.logger.info(f"MPESA CALLBACK RESPONSE: {json.dumps(data, indent=2)}")
    if data.get("Body", {}).get("stkCallback", {}).get("ResultCode") == 0:
        transaction_details = data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
        
        phone_number = next(item["Value"] for item in transaction_details if item["Name"] == "PhoneNumber")
        amount = next(item["Value"] for item in transaction_details if item["Name"] == "Amount")
        transaction_id = next(item ["value"] for item in transaction_details if item["Name"] == "MpesaReceiptNumber")
        
        # Retrieve uder_id and subscription_id from the database
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("SELECT user_id, subscription_id FROM users WHERE phone_number = %s", (phone_number))
            result = cursor.fetchone()
            if result:
                user_id, subscription_id = result
            else:
                return jsonify({"error": "User not found"}), 404
        
        with get_db_connection() as db, db.cursor() as cursor:
            cursor.execute("INSERT INTO payments (user_id, subscription_id, phone_number, amount, transaction_id, status) VALUES (%s, %s, %s, %s, %s, %s)", 
                           (user_id, subscription_id, phone_number, amount, transaction_id, "Completed"))
            db.commit()
        return jsonify({"message": "Payment successful"}), 200
    return jsonify({"error": "Payment failed"}), 400
{
    "python.analysis.extraPaths": [
        "./venv/Lib/site-packages"
    ]
}