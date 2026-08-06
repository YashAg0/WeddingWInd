# WeddingWithIndia — System Architecture & Design Manual

This document provides a comprehensive technical overview of the system architecture, component relationships, data flow, database schema design, and security controls powering **WeddingWithIndia**.

---

## 1. High-Level System Architecture Diagram

```
                        [ Client Web / Mobile Browser ]
                                       │
                                       ▼
                          [ Cloudflare Edge Network ]
                    (SSL Termination, DDoS Protection, CDN)
                                       │
                                       ▼
                       [ Next.js 16 Application Server ]
                         (App Router, Edge Middleware)
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
 [ Clerk Auth Engine ]       [ Database Layer ]            [ Third-Party APIs ]
 (JWT Sessions, OAuth)       ├─ PostgreSQL 16 (Prisma)     ├─ Stripe (Checkout)
                             └─ Redis L2 Cache             ├─ Resend (Emails)
                                                           └─ UploadThing (CDN)
```

---

## 2. Component Taxonomy

### A. Frontend Layer
- **Framework**: Next.js 16 App Router using React 19 Server Components.
- **Styling**: Vanilla CSS custom luxury design system with Tailwind CSS utilities.
- **Animations**: Framer Motion for entrance transitions and CountUp statistics.
- **Icons**: Lucide React icon library.

### B. Application & API Layer
- **Edge Routing**: `proxy.ts` middleware enforcing authentication and RBAC checks.
- **Server Actions**: Mutations handling booking creation, celebration updates, review submissions, and verification processing (`lib/actions/*.ts`).
- **Validation**: Zod schema validation on all incoming Server Action payloads.

### C. Data & Persistence Layer
- **ORM**: Prisma ORM 6.x.
- **Database**: PostgreSQL 16 managed instance configured with PgBouncer session pooling.
- **Data Models**: 25+ relational models (`User`, `TravelerProfile`, `CoupleProfile`, `AgentProfile`, `Wedding`, `Booking`, `Payment`, `Commission`, `GuestPass`, `Review`, `Verification`, `SafetyCase`, `AuditLog`).

---

## 3. Data Flow Architecture (Booking Journey)

1. **Guest Selection**: Traveler selects date and guest count on `/weddings/[slug]` and clicks "Book Experience".
2. **Action Dispatch**: Client invokes `createBookingAction()` Server Action. Zod schema validates input parameters.
3. **RBAC Guard**: Server Action executes `requireAuth()` and verifies traveler status.
4. **Transaction Processing**: Prisma executes a database transaction creating a `Booking` record with status `PENDING`.
5. **Payment Checkout**: System generates a Stripe Checkout Session URL and redirects the traveler.
6. **Webhook Reconciliation**: Stripe triggers `/api/webhooks/stripe` with `payment_intent.succeeded`. The webhook updates `Booking` status to `PAID`, generates a `GuestPass` record with encrypted QR data, and triggers a confirmation email via Resend.
