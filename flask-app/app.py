from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, DateTimeField, ReferenceField
import os
import json
import sys

app = Flask(__name__, static_folder='static/frontend/build', static_url_path='')
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

###########
### APP ###
###########

# Define User schema
class User(Document):
    username = StringField(required=True)
    password = StringField(required=True)
    phone_number = StringField()
    profile_picture = StringField()

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

@app.route('/add-user')
def add_user():
    # Get user collection
    users_collection = mongo.db.users
    # Insert a complete user document at once
    user_doc = {
        'username': 'ryangrace',
        'password': 'pass123',
        'phone-number': '6479674780',
        'profile-picture': 'link'
    }
    # Insert the document and return the object id
    user_id = users_collection.insert_one(user_doc).inserted_id
    # Retrieve the inserted document using its ID
    document = users_collection.find_one({'_id': user_id})
    # Convert MongoDB document to JSON
    document_json = json.loads(json_util.dumps(document))
    return jsonify(document_json), 200

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

# MAIN
if __name__ == '__main__':
    app.run(debug=True)
