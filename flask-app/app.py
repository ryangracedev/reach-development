from flask import Flask, jsonify, request, render_template
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
import os
import json
import sys

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

###########
### APP ###
###########
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test-mongo')
def test_mongo():
    # Assuming you're inserting a document and then retrieving it to return as JSON
    test_collection = mongo.db.test
    result = test_collection.insert_one({'message': 'Hello, MongoDB!'})
    document = test_collection.find_one({'_id': result.inserted_id})
    # Convert MongoDB document to JSON, using json_util.dumps from bson
    document_json = json.loads(json_util.dumps(document))
    
    return jsonify(document_json), 200

if __name__ == '__main__':
    app.run(debug=True)
