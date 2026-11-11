# UniLife Ethiopia — Local Installation & Setup Guide

This guide provides step-by-step instructions for running **UniLife Ethiopia** on a local development computer or deployment server.

---

## 1. Prerequisites

- **Node.js**: Version 18.0.0 or higher (Tested on Node.js v24 LTS).
- **npm**: Version 9.0.0 or higher.
- **MySQL Database Server** (Optional for local testing; UniLife automatically connects to MySQL 8.0+ when configured, with a WebAssembly SQLite fallback for instant zero-dependency testing).

---

## 2. Project Structure

```
UNILIFE/
├── backend/            # Express.js REST API & Database migrations
│   ├── src/
│   │   ├── config/     # Environment & configurations
│   │   ├── controllers/# Business logic for student, admin & public APIs
│   │   ├── db/         # MySQL schema.sql, migrate.js, seed.js, db.js
│   │   ├── middleware/ # JWT authentication, rate-limiting, permissions
│   │   ├── routes/     # RESTful endpoints
│   │   ├── scripts/    # Secure Super Admin setup script
│   │   └── server.js   # Application entry point
│   ├── package.json
│   └── .env
├── frontend/           # React + Vite + Tailwind CSS + PWA
│   ├── public/         # manifest.webmanifest, sw.js, icons, offline.html
│   ├── src/            # Components, pages, context, services
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/               # Architecture, database, admin, PWA documentation
├── package.json        # Unified root orchestration scripts
└── README.md
```

---

## 3. Step-by-Step Installation

### Step A: Install Dependencies

From the project root directory (`c:\Users\hp\Desktop\UNILIFE`):

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step B: Configure Environment Variables

The backend environment file is located at `backend/.env`.

Default local configuration:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=unilife_super_secure_jwt_secret_ethiopia_2026_academic
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Database configuration:
# To connect to a live MySQL server, set:
DB_CLIENT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=unilife_ethiopia

# Or for zero-dependency instant local development:
# DB_CLIENT=sqlite
```

---

### Step C: Run Database Migrations & Seeds

UniLife initializes all 26 normalized tables, default Ethiopian grading scales, and Ethiopian universities:

```bash
cd backend
npm run migrate
npm run seed
```

---

### Step D: Initialize Super Administrator

As per platform security requirements, **public admin signup is disabled**. Create the initial Super Administrator securely via the dedicated CLI setup script:

```bash
cd backend
npm run setup-admin
```

Or pass parameters directly:

```bash
node src/scripts/setup-admin.js --name "UniLife Super Admin" --username "admin" --email "admin@unilife.et" --password "Admin@UniLife2026"
```

---

### Step E: Run Automated Test Suite

Verify that all authentication, course management, GPA calculations, conflict warnings, voluntary donations, and admin analytics endpoints pass 100%:

```bash
cd backend
npm test
```

---

### Step F: Start Backend & Frontend

#### Terminal 1 (Backend API):
```bash
cd backend
npm start
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

#### Terminal 2 (Frontend Web & PWA):
```bash
cd frontend
npm run dev
# Vite dev server runs at http://localhost:5173
```

Now open **http://localhost:5173** in your web browser.

---

## 4. Default Demonstration / Initial Credentials

- **Student Registration**: Register any new account at `/register` using your preferred university and email.
- **Administrator Portal**:
  - URL: `/admin/login`
  - Username: `admin` (or `admin@unilife.et`)
  - Password: `Admin@UniLife2026` (or the password configured during `npm run setup-admin`)
