# UniLife Ethiopia 🇪🇹
### Complete Student Life Organizer Platform (Responsive Web & PWA)

> **"Your Entire Student Life, Organized in One Place."**  
> *"Study smarter. Stay organized. Achieve more."*

UniLife Ethiopia is an all-in-one academic productivity platform and installable Progressive Web App (PWA) tailored for university and college students in Ethiopia.

---

## 📂 Project Architecture (Server & GitHub Ready)

The files are reallocated directly in the **main folder** for seamless deployment to GitHub and web hosting platforms (Render, Railway, Vercel, Netlify, VPS, cPanel):

```
UNILIFE/
├── index.html            # Main web entry point (Vite React & PWA)
├── vite.config.js        # Vite build & development proxy configuration
├── tailwind.config.js    # Tailwind CSS styling design system
├── postcss.config.js     # PostCSS configuration
├── package.json          # Unified scripts & full-stack dependencies
├── .gitignore            # Clean git rules (node_modules, .env, DB ignored)
├── .env.example          # Sample environment variables
│
├── src/                  # React Frontend Application
│   ├── main.jsx          # React DOM root render
│   ├── App.jsx           # App routing & layout definitions
│   ├── index.css         # Global Tailwind stylesheet
│   ├── components/       # Reusable UI components (Navbar, Sidebar, Modals...)
│   ├── pages/            # Student, Admin & Public pages
│   ├── context/          # Auth & PWA Context state
│   ├── layouts/          # Responsive Student, Admin & Public layouts
│   └── services/         # REST API communication client
│
├── public/               # Static assets & PWA files
│   ├── favicon.svg       # Brand favicon
│   ├── manifest.webmanifest # PWA install manifest
│   ├── sw.js             # Service Worker for offline capability
│   ├── offline.html      # Fallback offline page
│   └── icons/            # App icons (192px, 512px, maskable)
│
├── dist/                 # Production-built bundle (ready to host!)
│   ├── index.html        # Compiled HTML with hashed scripts
│   ├── assets/           # Compiled JS & CSS bundles
│   └── ...               # Production static assets
│
├── backend/              # Node.js & Express REST API Server
│   ├── src/
│   │   ├── server.js     # Express server (Serves /api AND frontend in production)
│   │   ├── controllers/  # Academic, Auth, Admin & Donation controllers
│   │   ├── db/           # SQLite / MySQL dual database engine & migrations
│   │   ├── middleware/   # JWT authentication & rate limiting
│   │   ├── routes/       # API endpoints
│   │   └── scripts/      # Super Admin creation CLI
│   ├── data/             # SQLite database storage (local fallback)
│   └── tests/            # Automated test suite
│
└── docs/                 # Documentation & Architecture guides
    ├── installation.md
    ├── database.md
    ├── architecture.md
    ├── admin-setup.md
    └── pwa-guide.md
```

---

## 🚀 How to Host on a Server

### Option 1: Full-Stack Node.js Server (Render, Railway, VPS, Heroku)
The Express server (`backend/src/server.js`) is pre-configured to automatically serve the compiled frontend (`dist/index.html` and assets) for all web routes, while handling `/api/*` requests.

1. **Build Command**:
   ```bash
   npm install && npm run build
   ```
2. **Start Command**:
   ```bash
   npm start
   ```
3. Set Environment Variables in your hosting dashboard:
   - `PORT=5000` (or provided automatically by Render/Railway)
   - `NODE_ENV=production`
   - `JWT_SECRET=your_long_random_secret_string`
   - `DB_CLIENT=sqlite` (or `mysql` if you attach a MySQL database)

### Option 2: Static Frontend (Vercel / Netlify / GitHub Pages) + Backend on Render
- **Frontend** (Vercel/Netlify):
  - Root directory: `./` (since `index.html` is in the main folder)
  - Build command: `npm run build`
  - Output directory: `dist`
- **Backend** (Render / Railway):
  - Root directory: `backend/`
  - Build command: `npm install`
  - Start command: `node src/server.js`

### Option 3: Traditional Web Server (Apache / Nginx / cPanel)
Upload the entire contents of the `dist/` folder directly to your web server root (e.g., `public_html/`).

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Servers
- **Run Both Servers Concurrently**:
  ```bash
  npm run dev:all
  ```
- Or in separate terminal windows:
  - **Frontend (Vite)**: `npm run dev` (Available at http://localhost:5173)
  - **Backend (Express)**: `npm run dev:server` (Available at http://localhost:5000)

### 3. Setup Initial Super Admin
```bash
npm run setup-admin -- --name "Super Admin" --username "admin" --email "admin@unilife.et" --password "Admin@UniLife2026"
```

### 4. Run Automated Tests
```bash
npm test
```

---

## 📤 Uploading to GitHub

1. Open your terminal in this `UNILIFE` folder (or use **GitHub Desktop**):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Reallocated UniLife full-stack platform"
   ```
2. Link your GitHub repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
*(Notice: `node_modules` and `.env` are automatically excluded by `.gitignore` to keep uploads fast and secure.)*
