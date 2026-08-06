# WeddingWithIndia — 1 Million User Scaling Architecture

This document details the high-scale infrastructure roadmap, caching strategies, queue processing, rate limiting, and AI recommendation architecture designed to support **1,000,000 active users** on **WeddingWithIndia**.

---

## 1. High-Scale Architecture Targets

| System Metric | Launch Baseline | 1,000,000 User Target | Engineering Blueprint |
| :--- | :--- | :--- | :--- |
| **Concurrent Users (CCU)** | 100 | 50,000 | Serverless Next.js edge instances on Vercel / AWS Lambda. |
| **Database Queries (QPS)** | 50 QPS | 10,000 QPS | PgBouncer session pooling + Redis L2 read caching. |
| **Search Queries / Min** | 500 / min | 100,000 / min | ElasticSearch / Algolia cluster indexing published celebrations. |
| **Media CDN Throughput** | 10 GB / mo | 50 TB / mo | Cloudflare Edge CDN with AVIF/WebP image optimization. |
| **Webhook Ingestion Rate**| 10 req / sec | 1,000 req / sec | Asynchronous message queues (Upstash QStash / BullMQ). |

---

## 2. L2 Caching & Edge Optimization

```
 [ Client Request ] ──────► [ Cloudflare Edge CDN ] (Static Assets & HTML Pages)
                                    │ (Cache Miss)
                                    ▼
                         [ Vercel Edge Server ]
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [ Upstash Redis L2 Cache ]                 [ PostgreSQL Primary ]
   (Weddings, Reviews, Stats)                 (Transactions & Write Ops)
```

### Redis Caching Strategy (`lib/redis.ts`)
- **Public Celebrations**: Cached in Redis with a 15-minute Time-To-Live (`TTL=900s`).
- **Cache Invalidation**: Server Actions (`editWeddingAction()`, `submitReviewAction()`) invalidate specific Redis cache keys upon mutation (`redis.del('wedding:slug:...')`).
- **Session Caching**: User profiles and verification statuses cached in Redis (`TTL=3600s`) to avoid hitting PostgreSQL on every request.

---

## 3. Asynchronous Queue Architecture (QStash / BullMQ)

Heavy background tasks are decoupled from request-response cycles:
- **Email Notification Queue**: Processing booking confirmation emails, host alerts, and event reminder cron jobs via Resend.
- **Image Optimization Queue**: Asynchronous generation of thumbnails and watermarked guest pass badges via UploadThing worker threads.
- **Analytics Ingestion Queue**: Aggregating referral link clicks and search term popularity metrics into PostgreSQL without blocking user HTTP requests.

---

## 4. Rate Limiting & Fraud Detection

Implemented via `@upstash/ratelimit` on edge middleware:
- **Public Search Endpoints**: 100 requests per minute per IP.
- **Authentication Endpoints (`/login`, `/signup`)**: 10 requests per minute per IP (prevents brute force attacks).
- **Checkout & Booking APIs (`/api/checkout`)**: 5 requests per minute per user ID (prevents double booking & card testing fraud).

---

## 5. AI Recommendations Engine Architecture

- **Vector Database**: **Pinecone** / **PgVector** storing 1536-dimensional embeddings of Indian Wedding Experience descriptions, cultural tradition tags, and venue styles.
- **Traveler Profile Matching**: User search history, saved wishlists, and dietary preferences generate a traveler preference vector.
- **Cosine Similarity Search**: Returns personalized wedding recommendations ("Weddings matching your cultural interests") in under 20ms.
