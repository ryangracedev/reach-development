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
import datetime
from dateutil import parser
from datetime import timedelta
from storage import save_file
from twilio.rest import Client
import redis
import os
import json
import random
import string
import sys
import time
import secrets
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
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)  # or whatever you prefer
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

def generate_unique_slug():
    events_collection = mongo.db.events
    while True:
        slug = secrets.token_urlsafe(8)
        if not events_collection.find_one({"slug": slug}):
            return slug

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
    verified = redis_client.get(f'verified:{phone_number}')
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
    redis_client.delete(f'verified:{phone_number}')
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

# This endpoint generates and sends a verification code to the user's phone number using Twilio Verify.
@app.route('/api/send-verification', methods=['POST'])
def send_verification():
    data = request.json
    phone_number = data.get('phone_number')
    username = data.get('username')

    # Validate input
    if not phone_number or not username:
        return jsonify({"error": "Phone Number and Username required"}), 400

    try:
        # Use Twilio Verify to send a verification code via SMS
        twilio_client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )
        verification = twilio_client.verify.v2.services(
            os.getenv("TWILIO_VERIFY_SERVICE_SID")
        ).verifications.create(to=phone_number, channel="sms")

        # Log the SID for debugging
        print(f"✅ Sent verification to {phone_number} — SID: {verification.sid}")
        return jsonify({"message": "Verification code sent"}), 200

    except Exception as e:
        # Log the error
        print(f"❌ Failed to send verification: {e}")
        return jsonify({"error": "Failed to send verification code"}), 500

# This endpoint validates a verification code using Twilio Verify and sets a Redis flag if successful.
@app.route('/api/verify-code', methods=['POST'])
def verify_code():
    data = request.json
    phone_number = data.get('phone_number')
    code = data.get('code')

    # Normalize phone number to E.164 if 10 digits
    if phone_number and phone_number.isdigit() and len(phone_number) == 10:
        phone_number = f"+1{phone_number}"

    print(f"📩 Received phone number: {phone_number}")
    print(f"🔑 Received verification code: {code}")

    # Validate inputs after normalization
    if not phone_number or not code:
        return jsonify({"error": "Phone number and code are required"}), 400

    try:
        # Use Twilio Verify to check the submitted code
        twilio_client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )
        verification_check = twilio_client.verify.v2.services(
            os.getenv("TWILIO_VERIFY_SERVICE_SID")
        ).verification_checks.create(to=phone_number, code=code)

        # Log verification status
        print(f"🔍 Verification status for {phone_number}: {verification_check.status}")

        if verification_check.status == "approved":
            # Store a temporary verified flag in Redis (valid for 5 minutes)
            redis_client.set(f"verified:{phone_number}", "true", ex=300)
            return jsonify({"message": "Phone number verified successfully"}), 200
        else:
            return jsonify({"error": "Invalid verification code"}), 400

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return jsonify({"error": "Verification failed"}), 500

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

    slug = generate_unique_slug()

    # Insert event into events collection
    event_doc = {
        "event_name": event_name.lower(),
        "description": description,
        "address": address,
        "date_time": date_time,
        "host_id": host_id,
        "attendees": [],
        "status": "active",
        "image": photo_url,
        "slug": slug
    }
    event_id = events_collection.insert_one(event_doc).inserted_id

    # Update the host's hosted_events
    print("username: ", host_id)
    users_collection.update_one(
        {"_id": ObjectId(host_id)},
        {"$push": {"hosted_events": str(event_id)}}
    )

    return jsonify({
        "message": "Event created successfully",
        "event_id": str(event_id),
        "slug": slug
    }), 201

# This endpoint allows authenticated users to update an event.
@app.route('/api/update-event/<slug>', methods=['PUT'])
@jwt_required()
def update_event(slug):
    # Get identity of the current user
    user_id = get_jwt_identity()

    # Get MongoDB collections
    events_collection = mongo.db.events

    # Find the event (case-insensitive match)
    event = events_collection.find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Ensure the requesting user is the host
    if str(event["host_id"]) != user_id:
        return jsonify({"error": "You are not authorized to update this event"}), 403

    # Fetch updated values
    updated_name = request.form.get("event_name")
    description = request.form.get("description")
    address = request.form.get("address")
    date_time = request.form.get("date_time")

    # Fetch new image if uploaded
    new_image = request.files.get("image")
    old_image_url = event.get("image")

    # Initialize update object
    update_fields = {}

    if updated_name:
        update_fields["event_name"] = updated_name
    if description:
        update_fields["description"] = description
    if address:
        update_fields["address"] = address
    if date_time:
        update_fields["date_time"] = date_time

    # If new image is uploaded, save and delete the old one
    if new_image:
        try:
            from storage import save_file, delete_file  # ensure delete_file exists
            new_image_url = save_file(new_image)
            update_fields["image"] = new_image_url

            # Only delete the old image if it exists and differs from new
            if old_image_url and old_image_url != new_image_url:
                delete_file(old_image_url)
        except Exception as e:
            return jsonify({"error": f"Image upload failed: {str(e)}"}), 500

    # Apply update to the database
    result = events_collection.update_one({"_id": event["_id"]}, {"$set": update_fields})

    return jsonify({"message": "Event updated successfully"}), 200

# This endpoint allows authenticated users to update an event's image.
@app.route('/api/update-event-image/<slug>', methods=['PUT'])
@jwt_required()
def update_event_image(slug):
    user_id = get_jwt_identity()

    # Find the event
    event = mongo.db.events.find_one({"slug": slug})
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if str(event["host_id"]) != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']

    try:
        from storage import save_file  # Reuse your storage logic
        image_url = save_file(image)

        # Update the event with the new image
        mongo.db.events.update_one(
            {"slug": slug},
            {"$set": {"image": image_url}}
        )

        return jsonify({'message': 'Image updated successfully', 'image_url': image_url}), 200

    except Exception as e:
        return jsonify({'error': f'Image upload failed: {str(e)}'}), 500

# This endpoint retrieves event details based on the event name.
@app.route('/api/events/<slug>', methods=['GET'])
def get_event(slug):

    print("/events/<event_name> Reached. Displaying Event!")
    # Fetch the event by name from the database
    # Perform a case-insensitive search
    event = mongo.db.events.find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    print("Event Info:\n", event)

    # Fetch the host's user document using `host_id`
    host = mongo.db.users.find_one({"_id": ObjectId(event["host_id"])})
    host_username = host["username"] if host else "Unknown"


    # Convert event document to JSON and add host's username
    event_json = json.loads(json_util.dumps(event))
    event_json["host_username"] = host_username  # ✅ Include host username
    attendee_ids = event.get("attendees", [])
    attendees = []
    for user_id in attendee_ids:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            attendees.append(user.get("username", "Unknown"))
    event_json["attendees"] = attendees
    
    return jsonify(event_json), 200

# Endpint to delete an event by its slug.
@app.route('/api/delete-event/<slug>', methods=['DELETE'])
@jwt_required()
def delete_event(slug):
    user_id = get_jwt_identity()
    events_collection = mongo.db.events
    users_collection = mongo.db.users

    # Find the event
    event = events_collection.find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Only the host can delete the event
    if str(event["host_id"]) != user_id:
        return jsonify({"error": "You are not authorized to delete this event"}), 403

    event_id = str(event["_id"])

    # Remove event from host's hosted_events
    users_collection.update_one(
        {"_id": event["host_id"]},
        {"$pull": {"hosted_events": event_id}}
    )

    # Remove event from attendees' events_going_to
    attendee_ids = event.get("attendees", [])
    for attendee_id in attendee_ids:
        users_collection.update_one(
            {"_id": ObjectId(attendee_id)},
            {"$pull": {"events_going_to": event_id}}
        )

    # Delete event
    events_collection.delete_one({"_id": event["_id"]})

    # Optionally: delete event image file if needed
    # (implement if using local/S3 storage)

    return jsonify({"message": "Event deleted successfully"}), 200

# This endpoint allows a user to mark themselves as attending an event.
@app.route('/api/events/<slug>/attend', methods=['POST'])
@jwt_required()
def attend_event(slug):
    user_id = get_jwt_identity()

    # Get users collection
    users_collection = mongo.db.users

    # Find the event by name
    event = mongo.db.events.find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Extract the event ID
    event_id = str(event["_id"])

    # Add the user to the attendees list if not already added
    if user_id not in event.get("attendees", []):
        mongo.db.events.update_one(
            {"slug": slug},
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
@app.route('/api/events/<slug>/unattend', methods=['POST'])
@jwt_required()
def unattend_event(slug):

    user_id = get_jwt_identity()

    # Get users collection
    users_collection = mongo.db.users

    # Find the event by name
    event = mongo.db.events.find_one({"slug": slug})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Extract the event ID
    event_id = str(event["_id"])

    # Remove the user from the attendees list
    mongo.db.events.update_one(
        {"slug": slug},
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
    
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Fetch events hosted by this user
    raw_hosted_events = list(mongo.db.events.find({"host_id": str(user["_id"])}))
    
    hosted_events = []
    past_events = []
    
    for event in raw_hosted_events:
        event_data = {
            "event_id": str(event["_id"]),
            "event_name": event["event_name"],
            "description": event["description"],
            "date_time": event["date_time"],
            "address": event["address"],
            "slug": event.get("slug", ""),
            "image_url": event.get("image", "")
        }
    
        event_time = parser.isoparse(event["date_time"])  # Adjust format as needed
        if now > event_time + datetime.timedelta(hours=12):
            past_events.append({"event": event_data, "was_host": True})
        else:
            hosted_events.append(event_data)
    
    # Fetch events this user is attending
    raw_attending_events = list(
        mongo.db.events.find({"_id": {"$in": [ObjectId(event_id) for event_id in user.get("events_going_to", [])]}})
    )
    
    current_events = []
    
    for event in raw_attending_events:
        # Skip events already processed as hosted
        if event["host_id"] == str(user["_id"]):
            continue
    
        event_data = {
            "event_id": str(event["_id"]),
            "event_name": event["event_name"],
            "description": event["description"],
            "date_time": event["date_time"],
            "address": event["address"],
            "slug": event.get("slug", ""),
            "image_url": event.get("image", "")
        }
    
        event_time = parser.isoparse(event["date_time"])
        if now > event_time + datetime.timedelta(hours=12):
            past_events.append({"event": event_data, "was_host": False})
        else:
            current_events.append(event_data)
    
    return jsonify({
        "username": user["username"],
        "hosted_events": hosted_events,
        "events_going_to": current_events,
        "past_events": past_events
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
