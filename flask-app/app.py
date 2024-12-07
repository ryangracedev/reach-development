from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, DateTimeField, ReferenceField, BooleanField
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS  # Import flask-cors
from datetime import datetime, timedelta
from functools import wraps
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from threading import Timer
import redis
import os
import json
import sys
import jwt
import random
import string
import time

# Points flask app to static react build files
app = Flask(__name__, static_folder='static/frontend/build', static_url_path='')
# Get the Mongo URI
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# Use the same secret key for JWT
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
# Check if SECRET KEY is in docker-compose
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY not set in environment variables")
# JSON Web Token
jwt = JWTManager(app)

# For Testing
print(f"SECRET_KEY loaded: {app.config['SECRET_KEY']}")

mongo = PyMongo(app)

# Allow all origins for development
CORS(app, supports_credentials=True)

###########
### APP ###
###########

# Temporary store for user data
# Initialize Redis client
redis_client = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)

# Function to generate a random verification code
def generate_verification_code():
     # 4-digit numeric code
    return ''.join(random.choices(string.digits, k=4))

# Define User schema
class User(Document):
    username = StringField(required=True)
    password = StringField(required=True)
    phone_number = StringField(required=True)
    profile_picture = StringField()

# Define Event schema
class Event(Document):
    event_name = StringField(required=True)
    description = StringField(required=True)
    address = StringField(required=True)
    date_time = DateTimeField(required=True)
    host_name = ReferenceField(User, required=True)

# Simulated database collection (use your MongoDB collection)
users_collection = mongo.db.users

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Check if the user exists in the database
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
 
    # Verify the password
    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Create a JWT token
    access_token = create_access_token(identity=username, expires_delta=timedelta(hours=1))
    print("New JWT created for:", username)  # Debugging

    return jsonify({
        "message": "Sign-in successful",
        "username": username,
        "access_token": access_token
    }), 200

# Endpoint to handle a user signup
@app.route('/signup', methods=['POST'])
def signup():
    # Get data from signup form
    data = request.json
    # Get the 
    username = data.get('username')
    password = data.get('password')
    phone_number = data.get('phone_number')
    # Get user collection
    users_collection = mongo.db.users

    # Validate required fields
    if not username or not password or not phone_number:
        return jsonify({"error": "All fields (username, password, phone_number) are required"}), 400
    
    # Check if the username already exists
    if users_collection.find_one({'username': username}) is not None:
        return jsonify({"error": "Username already exists"}), 400
    
    # Check if the phone number is already verified
    verified = redis_client.get(f'verified:{username}')
    if not verified:
        return jsonify({"error": "Phone number not verified yet"}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(password)

    # Create the user document for MongoDB
    user_doc = {
        "username": username,
        "password": hashed_password,
        "phone_number": phone_number,
        "profile_picture": "none",
    }
    # Insert the document and return the object id
    user_id = users_collection.insert_one(user_doc).inserted_id

    # Create a JWT for the new user
    access_token = create_access_token(identity=str(user_id))  # Use user_id as the identity

    # Cleanup Redis
    redis_client.delete(f'verified:{username}')

    # FOR TESTING
    # Retrieve the inserted document using its ID
    document = users_collection.find_one({'_id': user_id})
    # Convert MongoDB document to JSON
    document_json = json.loads(json_util.dumps(document))
    # Return
    return jsonify({"message": "User signed up successfully", "access_token": access_token}), 201

# Endpoint to check if a username already exists
@app.route('/check-username', methods=['POST'])
def check_username():
    data = request.json
    username = data.get('username')

    # Check if username was inputed
    if not username:
        return jsonify({"error": "Username is required"}), 400

    users_collection = mongo.db.users
    user_exists = users_collection.find_one({'username': username}) is not None

    return jsonify({"exists": user_exists}), 200

# Endpoint to check if a phone number already exists
@app.route('/check-phone', methods=['POST'])
def check_phone():
    data = request.json
    phone_number = data.get('phone_number')

    if not phone_number:
        return jsonify({"error": "Phone number is required"}), 400

    users_collection = mongo.db.users
    phone_exists = users_collection.find_one({'phone_number': phone_number}) is not None

    return jsonify({"exists": phone_exists}), 200

# Endpoint to handle sending a verfication code to the user
@app.route('/send-verification', methods=['POST'])
def send_verification():

    # Get user data request
    data = request.json
    # Extract user data
    phone_number = data.get('phone_number')
    username = data.get('username')

    # Validate username, phone number, and password
    if not phone_number or not username:
        return jsonify({"error": "Phone Number and Username required"}), 400
    
    # Generate a verification code
    # verification_code = generate_verification_code()
    # Simulate sending the code
    verification_code = "1234"  # Fixed code for now

    # Store the code in Redis with a 5-minute expiration
    redis_client.set(username, verification_code, ex=300)  # Key: username, Value: code, Expiry: 5 mins

    # redis_client.setex(
    #     f"user:{phone_number}",
    #     300,  # 5 minutes
    #     json.dumps({
    #         "username": username,
    #         "password": password,
    #         "verification_code": verification_code
    #     })
    # )

    # Simulate sending the verification code (replace with actual SMS logic)
    print(f"Sending verification code {verification_code} to {phone_number}")
    # For Testing
    print(f"Verification code for {username}: {verification_code}")

    return jsonify({"message": "Verification code sent"}), 200

# Endpoint to handle verifying a user's account
@app.route('/verify-code', methods=['POST'])
def verify_code():

    # Get data
    data = request.json
    # Extract the username and code
    username = data.get('username')
    code = data.get('code')

    # For Testing
    print("Username received:", username)

    # Validate inputs
    if not username or not code:
        return jsonify({"error": "Username and code are required"}), 400

    # Check Redis (or in-memory store) for verification code
    stored_code = redis_client.get(username)  # Replace with your Redis logic
    if not stored_code:
        # For Testing
        print(f"Redis Debug: Username '{username}' not found in Redis or expired")
        return jsonify({"error": "Verification code expired or not found"}), 404
    
    # For Testing
    print(f"Redis Debug: Stored code for '{username}' is '{stored_code}'")

    # Verify the code
    if code != stored_code:
        return jsonify({"error": "Invalid verification code"}), 400

    # Code is valid; delete from Redis
    redis_client.delete(username)
    redis_client.set(f"verified:{username}", "true", ex=300)  # Flag valid for 5 minutes

    return jsonify({"message": "Phone number verified successfully"}), 200

# Endpoint to handle creation of events
@app.route('/create-event', methods=['POST'])
@jwt_required()
def create_event():
    print("Authorization Header:", request.headers.get("Authorization"))  # Debugging
    data = request.json
    print("Received payload:", data)  # Log the received payload

    # Get events collection
    events_collection = mongo.db.events

    # Validate required fields
    event_name = data.get('event_name')
    description = data.get('description')
    address = data.get('address')
    date_time = data.get('date_time')
    # Extract the user identity from the JWT
    host_id = get_jwt_identity()

    print("Host_ID: ", host_id)

    if not event_name or not description or not address or not date_time or not host_id:
        return jsonify({"error": "All fields (event_name, description, address, date_time, host_id) are required"}), 400

    # Insert event into events collection
    event_doc = {
        "event_name": event_name,
        "description": description,
        "address": address,
        "date_time": date_time,
        "host_id": host_id,
        "invitee_ids": [],
        "status": "active"
    }
    event_id = events_collection.insert_one(event_doc).inserted_id

    # Update the host's hosted_events
    mongo.db.users.update_one(
        {"_id": host_id},
        {"$push": {"hosted_events": str(event_id)}}
    )

    return jsonify({"message": "Event created successfully", "event_id": str(event_id)}), 201

# Endpoint to display an active event
@app.route('/events/<event_name>', methods=['GET'])
def get_event(event_name):

    print("/events/<event_name> Reached. Displaying Event!")
    # Fetch the event by name from the database
    event = mongo.db.events.find_one({"event_name": event_name})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Convert the MongoDB document to JSON
    event_json = json.loads(json_util.dumps(event))
    return jsonify(event_json), 200


# MAIN
if __name__ == '__main__':
    app.run(debug=True)
