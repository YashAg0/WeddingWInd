# WeddingWithIndia — Production Deployment Manual

This guide covers deploying **WeddingWithIndia** to production hosting platforms (Vercel / Render / AWS) with Supabase PostgreSQL, Clerk Authentication, Stripe Payments, UploadThing CDN, and Resend Transactional Email.

---

## 1. Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured in your hosting platform dashboard (refer to `ENVIRONMENT.md`).
- [ ] Database migrations are up-to-date (`npx prisma db push` or `npx prisma migrate deploy`).
- [ ] Production build succeeds locally (`npm run build`).
- [ ] TypeScript type-checking passes (`npm run type-check`).
- [ ] Production audit scripts pass (`npm run validate:all`).

---

## 2. Platform Deployment (Vercel Recommended)

### Option A: Vercel One-Click / CLI Deployment

1. **Connect GitHub Repository**:
   - Push your main branch to GitHub.
   - Import the project into Vercel Dashboard.
2. **Framework Preset**:
   - Select **Next.js**.
3. **Build & Install Commands**:
   - Build Command: `npm run build` (runs `prisma generate && next build`)
   - Install Command: `npm install`
4. **Environment Variables**:
   - Copy all production keys from `ENVIRONMENT.md` into Vercel **Environment Variables**.
5. **Deploy**:
   - Click **Deploy**. Vercel will build and assign your production URL (e.g., `https://weddingwithindia.com`).

---

## 3. Database Provisioning (Supabase PostgreSQL)

1. Create a PostgreSQL project on [Supabase](https://supabase.com).
2. Retrieve your **Transaction Connection Pooler String** (port 5432 or 6543):
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
   ```
3. Run the Production Bootstrap Suite to apply the schema and seed production demo data:
   ```bash
   npm run bootstrap
   ```

---

## 4. Authentication Domain Setup (Clerk)

1. In the [Clerk Dashboard](https://dashboard.clerk.com):
   - Switch from Development to **Production Instance**.
   - Add your custom domain: `weddingwithindia.com`.
2. Configure OAuth providers (Google, Apple).
3. Set Webhook Endpoint:
   - Endpoint URL: `https://weddingwithindia.com/api/webhooks/clerk` (if enabled)
   - Events: `user.created`, `user.updated`, `user.deleted`.

---

## 5. Payment Gateway Setup (Stripe Live)

1. In the [Stripe Dashboard](https://dashboard.stripe.com):
   - Toggle to **Live Mode**.
2. Retrieve `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Add Webhook Endpoint:
   - URL: `https://weddingwithindia.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
4. Copy Webhook Signing Secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.

---

## 6. Storage & CDN Configuration (UploadThing)

1. Create a project at [UploadThing](https://uploadthing.com).
2. Set allowed file types (Images up to 8MB, Documents up to 16MB).
3. Set environment variables:
   ```env
   UPLOADTHING_SECRET="sk_live_..."
   UPLOADTHING_APP_ID="app_..."
   ```

---

## 7. Automated Verification Post-Launch

Run the production health check:
```bash
curl -I https://weddingwithindia.com/api/health
```
Output should return `HTTP/1.1 200 OK` with JSON status `{"status": "ok", "service": "wedding-with-india"}`.
