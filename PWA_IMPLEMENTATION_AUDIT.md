# WEDDINGWITHINDIA — PWA IMPLEMENTATION FORENSIC AUDIT
**Date:** 2026-08-15  
**Scope:** Progressive Web App (PWA) Architecture, Service Worker, Manifest, Icon System, Offline Resilience, Caching Policies, Safe Areas, Install & Update Lifecycle

---

## 1. EXECUTIVE SUMMARY

The WeddingWithIndia production codebase was audited for PWA readiness. The existing platform is a high-performance Next.js 16.2.10 application running on React 19.2.4 with Tailwind CSS v4 and PostgreSQL (Supabase/Prisma). 

While basic metadata and a simple `manifest.ts` were present, the application lacked:
1. A production-grade service worker with cache versioning and clean activation lifecycle.
2. An offline fallback experience matching the royal design identity.
3. Network-first and bypass rules to protect transactional integrity (bookings, payments, auth, admin controls).
4. A non-intrusive install promotion experience and standalone iOS/Android safe area support.
5. A safe PWA update notification lifecycle to ensure future Vercel deployments seamlessly propagate to installed PWAs without requiring reinstallation.

---

## 2. REPOSITORY FORENSIC INSPECTION

### A. Next.js & App Router Architecture
- **Framework Version:** `next@16.2.10`, `react@19.2.4`
- **Turbopack Build:** App router configured with custom headers, CSP, and image optimization.
- **Service Worker Status:** No active service worker was registered in production or development.
- **Manifest Status:** `app/manifest.ts` existed with minimal configuration (`name`, `short_name`, `icons` pointing to `/icon.png` and `/apple-icon.png`).
- **Icons Status:** High-resolution icons exist (`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`). Padded maskable variants (192x192, 512x512) are required for full Android and Chromium installability.

### B. Security & CSP Configuration
- `next.config.ts` enforces strict CSP:
  - `worker-src 'self' blob: https://*.clerk.accounts.dev https://*.clerk.com`
  - Allows same-origin service workers (`/sw.js`).
  - Need to ensure headers serve `/sw.js` with `Service-Worker-Allowed: /` and `Cache-Control: no-cache, no-store, must-revalidate`.

### C. Critical Caching & State Separation Rules
| Resource Type | Strategy | Invariant |
| :--- | :--- | :--- |
| **App Shell & Static Assets** (`/_next/static/*`, Google Fonts, CSS, JS, Brand SVG/PNG) | **Cache First / Stale-While-Revalidate** with versioned cache keys | Instantly load UI shell |
| **Public Wedding Detail & Images** (`/weddings/*`, Unsplash images) | **Stale-While-Revalidate** with max item cap (50 items) | Fast browsing of catalog |
| **Authentication & Sessions** (`/api/auth/*`, Clerk endpoints) | **Network Only / Never Cached** | Prevent stale auth or role privilege leaks |
| **Booking & Payments** (`/api/webhooks/stripe`, booking actions, checkout) | **Network Only / Never Cached** | Prevent stale inventory or double charges |
| **User & Admin Dashboards** (`/dashboard/*`, `/api/admin/*`) | **Network Only / Never Cached** | Server-authoritative data integrity |
| **Offline Fallback** (`/offline`) | **Pre-cached during SW install** | Render branded offline screen when network drops |

---

## 3. ARCHITECTURE PLAN & REQUIRED DELIVERABLES

### 1. Web App Manifest Enhancement (`app/manifest.ts` / `public/manifest.webmanifest`)
- Full manifest schema: `name`, `short_name`, `description`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait-primary"`, `theme_color: "#7B1113"`, `background_color: "#FAF7F2"`, `categories: ["travel", "lifestyle", "events"]`.
- Complete icon set: 192x192, 512x512, maskable 192x192, maskable 512x512, Apple touch icon.

### 2. Service Worker (`public/sw.js`)
- Versioned Cache storage (`weddingwithindia-static-v1`, `weddingwithindia-images-v1`, `weddingwithindia-offline-v1`).
- Lifecycle management: `install` (precaches offline page and core assets), `activate` (purges old cache versions), `fetch` (intelligent routing with strict transactional bypasses), `message` (`SKIP_WAITING` listener).
- Automatic recovery from corrupted caches and quota errors.

### 3. PWA Client Controller & Safe Update UX (`components/pwa/PwaProvider.tsx`)
- Registers service worker only in production (or when explicitly enabled).
- Listens for service worker updates (`waiting` state) and renders a non-blocking toast/banner ("A new version of WeddingWithIndia is available" -> [Update Now]).
- Handles online/offline event transitions with graceful non-blocking notifications.
- Provides `beforeinstallprompt` capture for the install promotion banner.

### 4. Install Promotion Component (`components/pwa/InstallPrompt.tsx`)
- Subtle, dismissible banner that adheres strictly to WeddingWithIndia's luxury design tokens.
- Supports native Android/Chrome prompt trigger and custom iOS "Add to Home Screen" instructions.
- 7-day cooldown on user dismissal to prevent intrusion.

### 5. Branded Offline Route (`app/offline/page.tsx`)
- Lightweight, self-contained offline screen matching visual identity (royal maroon, warm ivory, elegant typography).
- Includes "Try Again" retry button and quick diagnostic tips without exposing technical stack errors.

### 6. Safe Area CSS Enhancements (`app/globals.css`, `app/layout.tsx`)
- Add `viewport-fit=cover` in `viewport` metadata.
- Support `env(safe-area-inset-*)` across navigation bars, sticky booking widgets, mobile drawers, and bottom action bars.

### 7. Verification Test Suite
- `scripts/verify-pwa.js` — validates manifest, icons, service worker syntax, offline route.
- `scripts/verify-pwa-security.js` — validates that auth, booking, payment, and dashboard routes are excluded from cache.
- `scripts/verify-pwa-cache-policy.js` — validates cache name versioning and stale-while-revalidate limits.
- E2E Playwright test extensions in `e2e/pwa.spec.ts`.

---
