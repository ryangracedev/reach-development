# ==========================
# IMPORTS
# ==========================
from flask import Flask, jsonify, request, send_from_directory, current_app
from flask_pymongo import PyMongo
from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from threading import Timer
from bson import json_util, ObjectId
from werkzeug.utils import secure_filename
from storage import save_file
import redis
import os
import json
import random
import string
import sys
import time
# =============================
# Print Envirnoment Variables
# =============================
print(f"🟠 ====== Environment Variables =======")
for key, value in os.environ.items():
    print(f"{key}: {value}")
print(f"🟠 === END of Environment Variables ===")
# =============================
# Define Envirnoment Variables
# =============================
FLASK_ENV = os.getenv("FLASK_ENV", "development")
IS_PRODUCTION = FLASK_ENV == "production"
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongoadmin:secret@mongo:27017/reach_app?authSource=admin")
REDIS_PORT = 6379
REDIS_HOST = os.getenv("REDIS_HOST", "redis").split(":")[0] # Removes port if present
USE_TLS = os.getenv("REDIS_USE_TLS", "false").lower() == "true" if FLASK_ENV == "production" else False
TLS_CERT_PATH = "/app/global-bundle.pem"
# Points flask app to static react build files
app = Flask(__name__, static_folder='static/frontend/build', static_url_path='')
# =============================
# AWS Secret key & get JWT
# =============================
# Get AWS secret key
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# Check if SECRET KEY is in docker-compose
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY not set in environment variables")
# Use the same secret key for JWT
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
# JSON Web Token
jwt = JWTManager(app)
# =============================
# MongoDB 
# =============================
app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)
# =============================
# Redis & ElastiCache
# =============================
# Function to get a fresh Redis client
def get_redis_client():
    return redis.StrictRedis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        ssl=USE_TLS,
        decode_responses=True,
        socket_timeout=5,  # No Hang
        socket_connect_timeout=5,
        retry_on_timeout=True  # Auto retry
    )
# Redis Configuration
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
# 
USE_TLS = os.getenv("REDIS_USE_TLS", "false").lower() == "true" if FLASK_ENV == "production" else False
# Create Redis connection
redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0,
    decode_responses=True,
    ssl=USE_TLS # Use TLS
)
# =============================
# Debugging
# =============================
print(f"⚫️ Running environment: {FLASK_ENV}")
print(f"⚫️ Running environment: {app.config['ENV']}")
print(f"⚫️ MongoDB URI: {MONGO_URI}")
print(f"⚫️ SECRET_KEY loaded: {app.config['SECRET_KEY']}")
print(f"🟡 Redis Connection Details:")
print(f"   Host: {REDIS_HOST}")
print(f"   Port: {REDIS_PORT}")
print(f"   SSL: {USE_TLS}")
print(f"   Full Redis URL: redis://{REDIS_HOST}:{REDIS_PORT}")
# Run Redis test only in production
if FLASK_ENV == "production":
    try:
        print("Testing Redis connection to ElastiCache...")
        # Initialize Redis
        redis_client = get_redis_client()
        response = redis_client.ping()
        print(f"✅ Redis PING response: {response}")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
# =============================
# Other
# =============================
# Get /uploads folder path for local dev, defaults to uploads
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
# Allow all origins for development
CORS(app, supports_credentials=True)
# Simulated database collection (use your MongoDB collection)
users_collection = mongo.db.users

# =====================================================
#  Functions and Endpoints
# =====================================================
# Function to generate a random verification code
def generate_verification_code():
     # 4-digit numeric code
    return ''.join(random.choices(string.digits, k=4))

# This function serves the React frontend. It ensures that API routes return 404 errors,
# serves static files correctly, and falls back to serving index.html for unknown paths.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # If the request is for an API route, return a 404 error.
    if path.startswith("api/"):
        return jsonify({"error": "Invalid API request"}), 404
    # Construct the absolute path to the requested static file
    static_file_path = os.path.join(app.static_folder, path)
    # DEBUG logs
    print(f"Requested path: {path}", file=sys.stderr, flush=True)
    print(f"Resolved static file path: {static_file_path}", file=sys.stderr, flush=True)
    # If the path is empty ("/"), serve `index.html` (React entry point)
    if path == "":
        print(f"Serving React index.html for root path")
        return send_from_directory(app.static_folder, 'index.html')
    # Ensure static assets (like CSS, JS) are served correctly
    if os.path.exists(static_file_path) and not path.endswith("html"):
        return send_from_directory(app.static_folder, path)
    # If no matching file is found, serve the React app's `index.html`
    return send_from_directory(app.static_folder, 'index.html')

# If a request is made to an unknown endpoint, this function serves the React frontend instead.
@app.errorhandler(404)
def handle_404(e):
    print(f"404 Error: {request.path} not found, serving React index.html", file=sys.stderr, flush=True)
    return send_from_directory(app.static_folder, 'index.html')

# This endpoint allows users to sign in by verifying their username and password.
# If successful, it returns a JWT access token.
@app.route('/api/signin', methods=['POST'])
def signin():
    # Get request from client
    data = request.json
    # Get credentials
    username = data.get('username')
    password = data.get('password')
    # Check for input
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    # Check if the user exists in the database
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    # Verify the password
    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password"}), 401
    # Create a JWT token with both `identity` and additional claims
    access_token = create_access_token(
        identity=str(user["_id"]),  # Use user ID as the identity
        additional_claims={"username": username}  # Include username in the payload
    )
    # Debugging
    print("New JWT created for:", username, "with ID:", user["_id"])
    # Return
    return jsonify({
        "message": "Sign-in successful",
        "username": username,
        "access_token": access_token
    }), 200

# This endpoint allows new users to create an account. It checks for existing usernames,
# verifies the phone number, hashes the password, and stores user data in MongoDB.
@app.route('/api/signup', methods=['POST'])
def signup():
    # Get data from signup form
    data = request.json
    # Get the username and password
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
        "hosted_events": [],  # Initialize as empty array
        "events_going_to": []  # Initialize as empty array
    }
    # Insert the document and return the object id
    user_id = users_collection.insert_one(user_doc).inserted_id
    # Create a JWT token with both `identity` and additional claims
    access_token = create_access_token(
        identity=str(user_id),  # Use user ID as the identity
        additional_claims={"username": username}  # Include username in the payload
    )
    # Cleanup Redis
    redis_client.delete(f'verified:{username}')
    # DEBUG
    # Retrieve the inserted document using its ID
    document = users_collection.find_one({'_id': user_id})
    # Convert MongoDB document to JSON
    document_json = json.loads(json_util.dumps(document))
    # Return
    return jsonify({"message": "User signed up successfully", "access_token": access_token}), 201

# This endpoint checks whether a given username is already registered in the database.
@app.route('/api/check-username', methods=['POST'])
def check_username():
    # Get the 
    data = request.json
    username = data.get('username')

    # Check if username was inputed
    if not username:
        return jsonify({"error": "Username is required"}), 400

    users_collection = mongo.db.users
    user_exists = users_collection.find_one({'username': username}) is not None

    return jsonify({"exists": user_exists}), 200

# This endpoint checks whether a given phone number is already registered in the database.
@app.route('/api/check-phone', methods=['POST'])
def check_phone():
    data = request.json
    phone_number = data.get('phone_number')

    if not phone_number:
        return jsonify({"error": "Phone number is required"}), 400

    users_collection = mongo.db.users
    phone_exists = users_collection.find_one({'phone_number': phone_number}) is not None

    return jsonify({"exists": phone_exists}), 200

# This endpoint generates and sends a verification code to the user's phone number,
# storing the code temporarily in Redis.
@app.route('/api/send-verification', methods=['POST'])
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
    try:
        print(f"Storing verification code in Redis -> Key: {username}, Code: {verification_code}")
        redis_client.set(username, verification_code, ex=300)  # Store for 5 mins
        print("Successfully stored verification code in Redis!")
    except Exception as e:
        print(f"Error setting Redis key: {e}")
        return jsonify({"error": "Failed to store verification code"}), 500

    # Simulate sending the verification code (replace with actual SMS logic)
    print(f"Sending verification code {verification_code} to {phone_number}")
    # For Testing
    print(f"Verification code for {username}: {verification_code}")

    return jsonify({"message": "Verification code sent"}), 200

# This endpoint validates a verification code entered by the user against the stored code in Redis.
@app.route('/api/verify-code', methods=['POST'])
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

# This endpoint allows authenticated users to create events. The event details,
# including an optional image, are stored in MongoDB.
@app.route('/api/create-event', methods=['POST'])
@jwt_required()
def create_event():
    print("Authorization Header:", request.headers.get("Authorization"))  # Debugging
    print("Received payload:", request)  # Log the received payload

    # Fetch uploaded photo
    photo = request.files.get('image')

    # Get events collection
    events_collection = mongo.db.events
    # Get users collection
    users_collection = mongo.db.users

    # Validate required fields
    event_name = request.form.get('event_name')
    description = request.form.get('description')
    address = request.form.get('address')
    date_time = request.form.get('date_time')
    # Extract the user identity from the JWT
    host_id = get_jwt_identity()

    print("Host_ID: ", host_id)

    print("Photo: ", photo)

    # Save the photo and get the URL
    photo_url = None
    if photo:
        try:
            photo_url = save_file(photo)  # Save the file and get its URL
            print(f"Image uploaded successfully: {photo_url}")
        except Exception as e:
            print(f"Error while uploading image: {e}")
            return jsonify({"error": f"Failed to save photo: {str(e)}"}), 500

    if not event_name or not description or not address or not date_time or not host_id:
        return jsonify({"error": "All fields (event_name, description, address, date_time, host_id) are required"}), 400

    # Insert event into events collection
    event_doc = {
        "event_name": event_name.lower(),
        "description": description,
        "address": address,
        "date_time": date_time,
        "host_id": host_id,
        "attendees": [],
        "status": "active",
        "image": photo_url  # Add photo URL
    }
    event_id = events_collection.insert_one(event_doc).inserted_id

    # Update the host's hosted_events
    print("username: ", host_id)
    users_collection.update_one(
        {"_id": ObjectId(host_id)},
        {"$push": {"hosted_events": str(event_id)}}
    )

    return jsonify({"message": "Event created successfully", "event_id": str(event_id)}), 201

# This endpoint retrieves event details based on the event name.
@app.route('/api/events/<event_name>', methods=['GET'])
def get_event(event_name):

    print("/events/<event_name> Reached. Displaying Event!")
    # Fetch the event by name from the database
    # Perform a case-insensitive search
    event = mongo.db.events.find_one({"event_name": {"$regex": f"^{event_name}$", "$options": "i"}})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    print("Event Info:\n", event)

    # Fetch the host's user document using `host_id`
    host = mongo.db.users.find_one({"_id": ObjectId(event["host_id"])})
    host_username = host["username"] if host else "Unknown"


    # Convert event document to JSON and add host's username
    event_json = json.loads(json_util.dumps(event))
    event_json["host_username"] = host_username  # ✅ Include host username
    
    return jsonify(event_json), 200

# This endpoint allows a user to mark themselves as attending an event.
@app.route('/api/events/<event_name>/attend', methods=['POST'])
@jwt_required()
def attend_event(event_name):
    user_id = get_jwt_identity()

    # Get users collection
    users_collection = mongo.db.users

    # Find the event by name
    event = mongo.db.events.find_one({"event_name": event_name})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Extract the event ID
    event_id = str(event["_id"])

    # Add the user to the attendees list if not already added
    if user_id not in event.get("attendees", []):
        mongo.db.events.update_one(
            {"event_name": event_name},
            {"$push": {"attendees": user_id}}
        )
    
    # Add the event ID to the user's `events_going_to` list if not already added
    print("username: ", user_id)
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"events_going_to": event_id}}  # Use $addToSet to prevent duplicates
    )

    print(result)

    return jsonify({"message": "Marked as attending"}), 200

# This endpoint allows a user to remove themselves from an event's attendees list.
@app.route('/api/events/<event_name>/unattend', methods=['POST'])
@jwt_required()
def unattend_event(event_name):

    user_id = get_jwt_identity()

    # Get users collection
    users_collection = mongo.db.users

    # Find the event by name
    event = mongo.db.events.find_one({"event_name": event_name})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Extract the event ID
    event_id = str(event["_id"])

    # Remove the user from the attendees list
    mongo.db.events.update_one(
        {"event_name": event_name},
        {"$pull": {"attendees": user_id}}
    )

    # Remove the event ID from the user's `events_going_to` list
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"events_going_to": event_id}}
    )

    return jsonify({"message": "Removed from attending"}), 200

# This endpoint retrieves a user's profile, including their hosted and attended events.
@app.route('/api/profile/<username>', methods=['GET'])
def get_profile(username):
    # Fetch user data based on the username in the URL
    user = mongo.db.users.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Fetch events hosted by this user
    hosted_events = list(mongo.db.events.find({"host_id": str(user["_id"])}))
    hosted_events = [
        {
            "event_id": str(event["_id"]),
            "event_name": event["event_name"],
            "description": event["description"],
            "date_time": event["date_time"],
            "address": event["address"]
        }
        for event in hosted_events
    ]

    # Fetch events this user is attending
    events_going_to = list(
        mongo.db.events.find({"_id": {"$in": [ObjectId(event_id) for event_id in user.get("events_going_to", [])]}})
    )
    events_going_to = [
        {
            "event_id": str(event["_id"]),
            "event_name": event["event_name"],
            "description": event["description"],
            "date_time": event["date_time"],
            "address": event["address"]
        }
        for event in events_going_to
    ]

    return jsonify({
        "username": user["username"],
        "hosted_events": hosted_events,
        "events_going_to": events_going_to
    }), 200

# This endpoint sends a verification code to a user's phone number for password reset.
@app.route('/api/forgot-password/send-code', methods=['POST'])
def send_verification_code():
    data = request.json
    phone_number = data.get('phone_number')

    # Validate the phone number
    if not phone_number:
        return jsonify({"error": "Phone number is required"}), 400

    # Check if the phone number exists in the database
    user = mongo.db.users.find_one({"phone_number": phone_number})
    if not user:
        return jsonify({"error": "Phone number not found"}), 404

    # Generate a verification code (static "1234" for testing)
    verification_code = "1234"

    # Store the code in Redis with a 5-minute expiration
    redis_client.set(phone_number, verification_code, ex=300)

    print(f"Verification code for {phone_number}: {verification_code}")  # Debugging
    return jsonify({"message": "Verification code sent"}), 200

# This endpoint verifies the reset code before allowing the user to reset their password.
@app.route('/api/forgot-password/verify-code', methods=['POST'], endpoint='forgot_password_verify_code')
def verify_code():
    data = request.json
    phone_number = data.get('phone_number')
    code = data.get('code')

    # Validate input
    if not phone_number or not code:
        return jsonify({"error": "Phone number and code are required"}), 400

    # Retrieve the code from Redis
    stored_code = redis_client.get(phone_number)
    if not stored_code:
        return jsonify({"error": "Code expired or not found"}), 404

    # Verify the code
    if code != stored_code:
        return jsonify({"error": "Invalid verification code"}), 400

    # Code is valid; delete from Redis
    redis_client.delete(phone_number)
    redis_client.set(f"verified:{phone_number}", "true", ex=300)

    return jsonify({"message": "Code verified successfully"}), 200

# This endpoint allows users to reset their password after verifying their phone number.
@app.route('/api/forgot-password/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    phone_number = data.get('phone_number')
    new_password = data.get('new_password')

    # Validate inputs
    if not phone_number or not new_password:
        return jsonify({"error": "Phone number and new password are required"}), 400

    # Check if the phone number is verified
    verified = redis_client.get(f"verified:{phone_number}")
    if not verified:
        return jsonify({"error": "Phone number not verified"}), 403

    # Hash the new password
    hashed_password = generate_password_hash(new_password)

    # Update the user's password in the database
    result = mongo.db.users.update_one(
        {"phone_number": phone_number},
        {"$set": {"password": hashed_password}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Failed to update password"}), 500

    # Cleanup Redis
    redis_client.delete(f"verified:{phone_number}")

    return jsonify({"message": "Password updated successfully"}), 200

# This endpoint allows authenticated users to upload a picture for the event.
@app.route('/api/upload-photo', methods=['POST'])
@jwt_required()
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({"error": "No photo provided"}), 400

    photo = request.files['photo']

    try:
        # Delegate file-saving logic to `storage.py`
        photo_url = save_file(photo)
        return jsonify({"photo_url": photo_url}), 200
    except Exception as e:
        # Handle unexpected errors (e.g., file system or S3 issues)
        return jsonify({"error": str(e)}), 500

# This endpoint serves user-uploaded files from the uploads directory.
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    print(f"Uploads folder set to: {upload_folder}")
    return send_from_directory(upload_folder, filename)

# This endpoint checks if the server is running.
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Logs details of every incoming request for debugging purposes.
@app.before_request
def log_request_info():
    print(f"Incoming request: {request.method} {request.path}", file=sys.stderr, flush=True)










# MAIN
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
