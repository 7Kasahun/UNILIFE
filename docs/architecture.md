# UniLife Ethiopia — Architecture & Technology Selection

## 1. Selected Technology Stack & Justification

UniLife Ethiopia is architected as a decoupled, modern, lightweight, and scalable full-stack system:

| Layer | Selected Technology | Technical Rationale & Benefits |
|---|---|---|
| **Frontend** | **React 18 + Vite** | Blazing-fast compilation, reactive component rendering, excellent performance on low-end mobile devices, lightweight production bundle (<110 kB gzipped). |
| **Styling & Design System** | **Tailwind CSS** | Consistent UI design system adhering to the official UniLife brand palette (`#172554`, `#2563EB`, `#DBEAFE`, `#F8FAFC`, `#FFFFFF`), responsive grid/flexbox layouts with zero CSS bloat. |
| **Iconography** | **Lucide React** | Clean, minimalist, and accessible vector icons with lightweight footprint and tree-shaking support. |
| **Progressive Web App (PWA)** | **Web App Manifest + Service Worker** | Installable on Android and iOS home screens, standalone display mode, offline app-shell caching, and mobile bottom navigation bar. |
| **Backend REST API** | **Express.js (Node.js)** | Non-blocking I/O, minimalist micro-framework, zero runtime bloat, high concurrency under high traffic, and clean RESTful endpoint architecture. |
| **Database** | **MySQL 8.0+** (with automated WebAssembly SQLite fallback) | Fully normalized relational data model, ACID transaction compliance, foreign keys, cascade constraints, parameterized queries preventing SQL injection. |
| **Security & Auth** | **JWT + bcryptjs + Helmet + Rate Limit** | Secure password hashing (cost factor 10), stateless Bearer tokens, strict DDoS and brute-force rate-limiting, and hardened HTTP headers. |

---

## 2. Architectural Design Principles

### A. Clear Separation of Concerns (Decoupled REST API)
- The backend serves strictly as a **RESTful JSON API** (`/api/*`).
- The frontend is an independent Single Page Application (SPA) communicating over standard HTTP/HTTPS.
- **Future Native Mobile App Readiness**: When native Android (Kotlin/Jetpack Compose) or iOS (Swift/SwiftUI) apps are built in the future, they will consume the exact same `/api/auth`, `/api/student/*`, `/api/donations/*` endpoints without changing a single line of backend business logic or database schema!

### B. Progressive Web App (PWA) Architecture & Privacy-Conscious Caching
- **Web App Manifest (`/manifest.webmanifest`)**: Configures application name, theme colors (`#172554`), background colors, and app icons (192px and 512px maskable).
- **Service Worker (`/sw.js`)**:
  - **App Shell Pre-caching**: Caches static assets (`/`, `/index.html`, `/offline.html`, CSS, JS, icons) for instantaneous sub-second loading.
  - **Critical Student Privacy Guard**: As explicitly required, `/api/*` endpoints are **NEVER cached** in the public service worker cache. This prevents confidential student grades, private notes, and credentials from persisting unencrypted or leaking in shared device caches.
  - **Graceful Offline Fallback**: When network connection drops, navigation gracefully falls back to `/offline.html` informing the student to reconnect to sync academic updates.
- **Mobile-Friendly Bottom Navigation**: Touch-friendly navigation targets designed for one-handed thumb use on mobile screens.

### C. Affordable Hosting & Zero Microservice Bloat
- Avoided unnecessary Kubernetes clusters, distributed microservices, or complex third-party paid subscriptions.
- The entire system can be hosted affordably on any standard \$5/month Linux VPS (Ubuntu, Debian, AlmaLinux), cPanel Node.js host, Railway, Render, or Docker container.

### D. Multi-Language & Internationalization Readiness
- Database and API strictly enforce **UTF-8 / `utf8mb4_unicode_ci`**.
- Ready for full Amharic (አማርኛ) and Ge'ez character rendering without data corruption.

---

## 3. Data Flow Diagram

```
[ Android / iOS / Desktop Browser (PWA) ]
                   │
                   ▼
       [ Service Worker (sw.js) ]
         ├── Static Assets ─────────► [ Local Cache Shell ]
         │
         └── Dynamic /api/* Calls
                   │ (Authorization: Bearer <JWT>)
                   ▼
          [ Express.js REST API ]
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
[ Rate Limiter & Helmet ]    [ JWT Auth Middleware ]
    │                             │
    └──────────────┬──────────────┘
                   │
                   ▼
      [ Controller Domain Logic ]
         ├── Course Management
         ├── Timetable & Conflicts
         ├── GPA / CGPA Engine
         ├── Study Planner & Timer
         ├── Donation Workflow
         └── Admin Analytics Engine
                   │
                   ▼
     [ MySQL 8.0 Database (unilife_ethiopia) ]
       (ACID Transactions, Prepared Statements)
```
