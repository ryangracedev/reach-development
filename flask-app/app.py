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
import os
import json
import sys
import jwt

app = Flask(__name__, static_folder='static/frontend/build', static_url_path='')
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']     # Use the same secret key for JWT
# Check if SECRET KEY is in docker-compose
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY not set in environment variables")

jwt = JWTManager(app)

print(f"SECRET_KEY loaded: {app.config['SECRET_KEY']}")

mongo = PyMongo(app)
# Allow all origins for development
CORS(app)

###########
### APP ###
###########

# Define User schema
class User(Document):
    username = StringField(required=True)
    password = StringField(required=True)
    phone_number = StringField(required=True)
    profile_picture = StringField()
    is_verified = BooleanField(default=False)

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
    # Hash the password
    hashed_password = generate_password_hash(password)
    # Create the user document for MongoDB
    user_doc = {
        "username": username,
        "password": hashed_password,
        "phone_number": phone_number,
        "profile_picture": "none",
        "is_verified": False
    }
    # Insert the document and return the object id
    user_id = users_collection.insert_one(user_doc).inserted_id

    # FOR TESTING
    # Retrieve the inserted document using its ID
    document = users_collection.find_one({'_id': user_id})
    # Convert MongoDB document to JSON
    document_json = json.loads(json_util.dumps(document))
    # Return
    return jsonify({"message": "User signed up successfully"}), 201

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
    data = request.json
    username = data.get('username')

    # Validate username
    if not username:
        return jsonify({"error": "Username is required"}), 400

    # Get user collection
    users_collection = mongo.db.users

    # Check if the user exists in MongoDB
    user = users_collection.find_one({'username': username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Simulate sending the code
    verification_code = "1234"  # Fixed code for now
    print(f"Sending verification code {verification_code} to {user['phone_number']}")

    return jsonify({"message": "Verification code sent"}), 200

# Endpoint to handle verifying a user's account
@app.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.json
    username = data.get('username')
    code = data.get('code')

    print("Username received:", username)  # Debugging

    # Validate inputs
    if not username or not code:
        return jsonify({"error": "Username and code are required"}), 400

    # Get user collection
    users_collection = mongo.db.users

    # Check if the user exists in MongoDB
    user = users_collection.find_one({'username': username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Verify the code
    if code != "1234":  # Fixed code for now
        return jsonify({"error": "Invalid verification code"}), 400

    # Mark the user as verified in MongoDB
    users_collection.update_one(
        {'username': username},
        {'$set': {'is_verified': True}}
    )

    return jsonify({"message": "Phone number verified successfully"}), 200


@app.route('/create-event', methods=['POST'])
@jwt_required()
def create_event():
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

    if not event_name or not description or not address or not date_time or not host_id:
        return jsonify({"error": "All fields (event_name, description, address, date_time, host_id) are required"}), 400

    print(data)

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

@app.route('/events/<event_name>', methods=['GET'])
def get_event(event_name):
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
