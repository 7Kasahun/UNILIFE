# UniLife Ethiopia — Progressive Web App (PWA) Guide

UniLife Ethiopia is designed and packaged as a fully installable **Progressive Web App (PWA)**, providing a native app-like experience on Android, iOS, and Desktop devices without the friction of app store downloads.

---

## 1. PWA Specifications & Standards

- **Manifest File**: `/manifest.webmanifest`
- **Display Mode**: `standalone` (removes browser URL bar and navigational chrome)
- **Primary Theme Color**: `#172554` (UniLife Primary Navy)
- **Background Color**: `#F8FAFC`
- **App Icons**:
  - `icon-192.png`: 192x192 PNG for standard Android home screens
  - `icon-512.png`: 512x512 PNG high-resolution splash screens
  - `icon-512-maskable.png`: Adaptive maskable icon supporting Android circle, squircle, and rounded icons
  - `favicon.svg`: Scalable vector icon
- **Mobile Bottom Navigation**: Integrated 5-tab thumb-friendly navigation bar for one-handed mobile use.

---

## 2. Installation Instructions by Platform

### A. Android Devices (Chrome, Edge, Samsung Internet)
1. Open **http://localhost:5173** (or your live domain) in Google Chrome or Microsoft Edge.
2. An **"Install UniLife PWA"** banner will automatically appear at the top of the screen.
3. Tap **"Install Now"** or tap the browser menu (three dots `⋮`) and select **"Add to Home Screen"** or **"Install app"**.
4. The UniLife Ethiopia app icon will now appear on your home screen and app drawer, launching in full standalone display mode!

### B. iOS Devices (iPhone & iPad — Safari)
1. Open the website in **Safari** on iOS/iPadOS.
2. Tap the **Share** button (the square with an arrow pointing upward at the bottom of Safari).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm by tapping **"Add"** in the top right.
5. Launch UniLife directly from your iPhone home screen with custom splash screen and full standalone viewport.

### C. Desktop (Windows, macOS, Linux, ChromeOS)
1. Open the website in Google Chrome, Microsoft Edge, or Brave.
2. Look for the **Install Icon** (computer screen with a down arrow) in the right side of the URL address bar.
3. Click **"Install"**. The app opens in its own dedicated, native desktop window!

---

## 3. Privacy-Preserving Offline Caching Architecture

> [!IMPORTANT]
> **Confidential Student Data Protection**
> Traditional PWAs that carelessly cache every network request can leak sensitive grades, assignment comments, and private notes into unencrypted browser storage.

**UniLife enforces a strict two-tier caching strategy**:
1. **App Shell (Safe for Caching)**:
   - Caches HTML, compiled JavaScript bundles, Tailwind CSS styles, vector graphics, and fonts.
   - Allows instant launch even with zero connectivity.
2. **Academic REST APIs (Protected from Caching)**:
   - Endpoints starting with `/api/` are **explicitly excluded** from service worker storage.
   - When the student goes offline, the app displays a clear notice to reconnect before syncing private grades and assignments.
