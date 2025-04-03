#!/bin/bash

cd flask-app
# Compose and run Flask & Mongo Containers
docker-compose up --no-recreate -d
# Go to front-end directory
cd static
cd frontend
# Run react deployment server
npm start

#
# Flask: localhost:8000
# React: localhost:3000
# Other Connections: 192.168.2.16