# Booking System API

This is a backend REST API built with Express.js for a booking system. It uses PostgreSQL as the database and JWT for authentication. (currently under progress)

---

## 🚀 Prerequisites

Make sure you have installed:

- Node.js (v16 or higher)
- npm
- PostgreSQL

---

## 📦 Project Setup & Usage

```bash
# ==========================================
# 1. CLONE THE REPOSITORY
# ==========================================
git clone [https://github.com/username/booking-system.git](https://github.com/username/booking-system.git)
cd booking-system

# ==========================================
# 2. INSTALL DEPENDENCIES
# ==========================================
npm install
npm install express passport passport-google-oauth20 dotenv cors pg bcrypt jsonwebtoken

# ==========================================
# 3. ENVIRONMENT VARIABLES CONFIGURATION
# ==========================================
# Create a .env file in the root directory and add:
# 
# PORT=3001
# DB_USER=postgres
# DB_PASSWORD=<pw>
# DB_HOST=localhost
# DB_NAME=booking_system_db
# DB_PORT=<port>
# JWT_SECRET=<secret>
# GOOGLE_CLIENT_ID=<CLIENT_ID>
# GOOGLE_CLIENT_SECRET=<CLIENT_SECRET>

# ==========================================
# 4. DATABASE SETUP
# ==========================================
# Run this command in your PostgreSQL terminal/client:
# CREATE DATABASE booking_system_db;
#
# Import the database schema from the file:
# psql -U postgres -d booking_system_db -f database_scheme.sql

# ==========================================
# 5. RUN THE APPLICATION
# ==========================================
# For Development Mode:
npm run dev

# For Production Mode:
npm start