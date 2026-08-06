# WeddingWithIndia — Public Launch Checklist

This document serves as the master operational checklist for launching **WeddingWithIndia** to the public.

---

## 1. Infrastructure & Hosting

- [x] **Next.js 16 App Router Build**: 43/43 routes compiled successfully (`npm run build`).
- [x] **TypeScript Validation**: 0 type errors across all modules (`tsc --noEmit`).
- [x] **PostgreSQL Connection Pooling**: PgBouncer session pooling configured (`DATABASE_URL`).
- [x] **Environment Variables Audit**: All required variables verified via `npm run validate:env`.

---

## 2. Authentication & RBAC Protection

- [x] **Clerk JWT Integration**: Edge middleware (`proxy.ts`) guarding private dashboards and API endpoints.
- [x] **Database User Sync**: `syncAndGetDbUser()` provisioning user profiles on first login.
- [x] **6-Tier Role Matrix**: Guest, Traveler, Couple, Agent, Coordinator, Admin, Super Admin supported.
- [x] **Super Admin Account**: `superadmin@weddingwithindia.com` provisioned with full audit privileges.

---

## 3. Financial & Payment Gateway

- [x] **Stripe Checkout**: Integrated for instant guest ticket purchases.
- [x] **Stripe Webhook Signature Verification**: Webhook handler (`/api/webhooks/stripe`) verifying `STRIPE_WEBHOOK_SECRET`.
- [x] **Multi-Currency Context**: `INR ₹`, `USD $`, `EUR €` formats verified.
- [x] **Revenue Split Automation**: 78% Host / 22% Platform / Tiered Agent calculation verified.

---

## 4. Trust, Safety & Operations

- [x] **Host Identity Verification Queue**: Passport/ID and venue proof submission enabled (`/dashboard/admin/verifications`).
- [x] **Digital QR Guest Pass**: Encrypted guest pass generation with QR code data.
- [x] **Gate Scanner**: Mobile QR check-in tool (`/dashboard/check-in`).
- [x] **Safety Case Triage**: Dispute reporting and safety ops center active (`/dashboard/admin/safety`).

---

## 5. SEO, Analytics & Compliance

- [x] **JSON-LD Schema Markup**: `Organization`, `WebSite`, `Event`, `AggregateRating`, `BreadcrumbList` embedded.
- [x] **Dynamic Sitemap & Robots**: `sitemap.xml` and `robots.txt` endpoints functioning.
- [x] **Cookie Consent**: GDPR cookie banner integrated with Google Analytics 4 IP anonymization.
- [x] **Legal Policies**: Privacy Policy (`/privacy`) and Terms of Service (`/terms`) accessible.
