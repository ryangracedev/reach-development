# Stage 1: Build React frontend
FROM node:18 AS frontend-builder

# Set working directory to where your frontend actually exists
WORKDIR /app/flask-app/static/frontend  

# Copy package.json and package-lock.json first for better caching
COPY flask-app/static/frontend/package*.json ./

# Install dependencies
RUN npm install

# 🔥 **Set NODE_ENV explicitly** (so it picks up the right .env file)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Copy all frontend files
COPY flask-app/static/frontend/ . 

# **Build React for the specified environment**
RUN if [ "$NODE_ENV" = "development" ]; then npm start; else npm run build; fi

# Stage 2: Build Flask Backend
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y wget procps && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy the backend files
COPY flask-app /app

# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download the CA certificate for DocumentDB
RUN wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /app/global-bundle.pem

# 🔥🔥🔥 REMOVE THIS: NO NEED TO COPY BUILD FILES 🔥🔥🔥
COPY --from=frontend-builder /app/flask-app/static/frontend/build /app/static/frontend/build

# Expose the application port
EXPOSE 8000

# Define environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run Flask application
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]