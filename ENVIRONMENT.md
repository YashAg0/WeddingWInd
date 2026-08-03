# WeddingWithIndia — Environment Variables Catalog

This document details every environment variable used across **WeddingWithIndia**, including core infrastructure keys, payment gateway keys, authentication secrets, and storage configurations.

---

## 1. Core Required Variables

| Variable Name | Description | Example / Format | Required In |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string with session pooler flags | `postgresql://user:pass@host:5432/db?pgbouncer=true` | Dev & Prod |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Authentication Publishable Key | `pk_live_...` or `pk_test_...` | Dev & Prod |
| `CLERK_SECRET_KEY` | Clerk Authentication Secret Key | `sk_live_...` or `sk_test_...` | Dev & Prod |

---

## 2. Payment Gateway Variables (Stripe)

| Variable Name | Description | Example / Format | Default Fallback |
| :--- | :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | `sk_live_...` / `sk_test_...` | Mock Fallback |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Frontend Client Key | `pk_live_...` / `pk_test_...` | Mock Fallback |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret for cryptographic verification | `whsec_...` | Mock Fallback |

---

## 3. Storage & Media CDN Variables (UploadThing)

| Variable Name | Description | Example / Format | Default Fallback |
| :--- | :--- | :--- | :--- |
| `UPLOADTHING_SECRET` | UploadThing Storage API Secret Key | `sk_live_...` | Unsplash CDN |
| `UPLOADTHING_APP_ID` | UploadThing Application ID | `app_...` | Unsplash CDN |

---

## 4. Transactional Email Variables (Resend)

| Variable Name | Description | Example / Format | Default Fallback |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Resend Email Delivery API Key | `re_...` | Console Log |

---

## 5. Application Configuration Variables

| Variable Name | Description | Example / Format | Default Fallback |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public Base URL of the deployed application | `https://weddingwithindia.com` | `http://localhost:3000` |
| `NODE_ENV` | Runtime execution environment | `production` / `development` | `development` |

---

## 6. Sample `.env` File Template

```env
# Core PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/wwi_db?pgbouncer=true"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_WWlDbGVya0tleTExMjIz"
CLERK_SECRET_KEY="sk_test_WWlDbGVya1NlY3JldEtleTk5ODg3"

# Stripe Payment Gateway Keys
STRIPE_SECRET_KEY="sk_test_51WWI_DemoSecretKey"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51WWI_DemoPubKey"
STRIPE_WEBHOOK_SECRET="whsec_WWI_DemoWebhookSecret"

# Resend Transactional Email
RESEND_API_KEY="re_WWI_ResendDemoApiKey"

# UploadThing CDN Storage
UPLOADTHING_SECRET="sk_live_UploadThingDemoSecret"
UPLOADTHING_APP_ID="app_UploadThingDemoAppId"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
