from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, DateTimeField, ReferenceField, BooleanField
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS  # Import flask-cors
import os
import json
import sys


app = Flask(__name__, static_folder='static/frontend/build', static_url_path='')
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
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


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/create-event', methods=['POST'])
def create_event():
    # Get data from request
    data = request.json
    print("Received data:", data)
    eventName = data.get('eventName')
    eventDescription = data.get('eventDescription')
    print("Event Name:", eventName)
    print("Event Description:", eventDescription)
    # Get user collection
    events_collection = mongo.db.events
    # Insert a complete user document at once
    event_doc = {
        'event-name': eventName,
        'description': eventDescription,
        'address': '16 Athletic Ave',
        'date-time': '02-24-24:21:30',
        'host-name': 'ryankgrace'
    }
    # Insert the document and return the object id
    event_id = events_collection.insert_one(event_doc).inserted_id
    # Retrieve the inserted document using its ID
    document = events_collection.find_one({'_id': event_id})
    # Convert MongoDB document to JSON
    document_json = json.loads(json_util.dumps(document))
    return jsonify(document_json), 200

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


# MAIN
if __name__ == '__main__':
    app.run(debug=True)
