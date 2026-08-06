# WeddingWithIndia — Security Architecture & Compliance Manual

This document outlines the security architecture, authentication policies, Role-Based Access Control (RBAC) enforcement, data privacy standards, and incident response protocols for **WeddingWithIndia**.

---

## 1. Authentication & Session Security

- **Authentication Provider**: Managed by **Clerk Authentication**.
- **Session Tokens**: Short-lived JSON Web Tokens (JWT) signed cryptographically by Clerk.
- **Route Guard Protection**: Handled at the edge via `proxy.ts` / Next.js Middleware:
  - Private dashboards (`/dashboard/*`) require an active Clerk session token.
  - Role-restricted paths (`/dashboard/admin/*`, `/dashboard/operations/*`) enforce strict role validation (`user.role === 'ADMIN'`).
  - Unauthenticated access attempts are immediately redirected to `/login` with return destination tracking.

---

## 2. Role-Based Access Control (RBAC) Rules

```
                      [ Client Request ]
                              │
                              ▼
                   [ Next.js Middleware ]
                              │
                ┌─────────────┴─────────────┐
                │ Validates Clerk JWT Token │
                └─────────────┬─────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     [ TRAVELER ]        [ COUPLE ]            [ ADMIN ]
  /dashboard/bookings  /dashboard/celebrations  /dashboard/admin
```

- **Travelers**: Restricted to personal booking management, wishlist modification, and review submission.
- **Couples (Hosts)**: Restricted to managing their own Our Indian Weddings, event timelines, and guest approvals.
- **Agents**: Restricted to viewing personal referral link metrics, accrued commissions, and payout histories.
- **Admins & Super Admins**: Granted platform-wide read/write permissions for verifications, safety cases, and financial reconciliation.

---

## 3. Data Validation & Protection

### Input Validation
- All Server Actions and API endpoints validate request payloads using **Zod** schemas.
- Invalid or malformed inputs return structured `400 Bad Request` responses without exposing server stack traces.

### SQL Injection & XSS Prevention
- Database queries use **Prisma ORM** parameterization exclusively, eliminating raw string concatenation and SQL injection vulnerabilities.
- React/Next.js automatic HTML entity escaping prevents Cross-Site Scripting (XSS).

### Payment Gateway Security (Stripe)
- Credit card data is handled directly by Stripe Elements and Stripe Checkout. **No sensitive payment card data ever touches WeddingWithIndia servers.**
- Stripe Webhook Endpoints (`/api/webhooks/stripe`) verify the `stripe-signature` header using `STRIPE_WEBHOOK_SECRET` before processing payment confirmation events.

---

## 4. Trust, Safety & Anti-Fraud Mechanisms

- **Verification System**: Hosts and Agents must submit government ID, business registrations, or venue permission proofs before celebrations or referral codes are published.
- **Review Fraud Prevention**: Reviews can only be submitted by travelers with verified, completed bookings (`status: ATTENDED` or `COMPLETED`).
- **Anti-MLM & Referral Rules**: Agent referrals enforce single-tier tiered commission (₹500-₹500) attribution without multi-level pyramids or chain recruitment incentives.

---

## 5. Security Incident Response Playbook

In the event of a security notice or suspected vulnerability:

1. **Immediate Revocation**: Rotate compromised secrets immediately in hosting dashboard (Vercel/Stripe/Clerk).
2. **Account Suspension**: Execute `node scripts/bootstrap-admin.js <email>` to set account status to `BANNED` or update roles.
3. **Audit Log Inspection**: Query `AuditLog` records in PostgreSQL to trace historical administrative actions:
   ```sql
   SELECT * FROM "AuditLog" WHERE "createdAt" >= NOW() - INTERVAL '24 HOURS' ORDER BY "createdAt" DESC;
   ```
4. **Patch & Deploy**: Apply hotfixes, run `npm run type-check`, and redeploy.
