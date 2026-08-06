# WeddingWithIndia — Post-Launch Roadmap & Feature Recommendations

This document outlines the recommended V2 feature enhancements, scaling initiatives, and performance optimizations for **WeddingWithIndia** post-public launch.

---

## 1. High-Priority V2 Features

### A. Real-Time WebSocket Guest-Host Messaging
- **Current State**: Asynchronous chat messaging powered by server action polls (`/dashboard/messages`).
- **Recommendation**: Upgrade to WebSockets or Server-Sent Events (SSE) using Supabase Realtime or Socket.io for instant real-time guest-host communication.

### B. Dedicated Media CDN & Video Uploads
- **Current State**: Gallery photography hosted on Unsplash / UploadThing CDN.
- **Recommendation**: Integrate Cloudinary or AWS CloudFront for automated video transcoding (4K Sangeet highlights) and adaptive bitrate streaming.

### C. Native Mobile iOS & Android Applications
- **Current State**: Fully responsive Mobile Web App with Touch Drawers and Camera QR Scanner.
- **Recommendation**: Experience the PWA or build React Native wrappers for iOS App Store and Google Play Store distribution.

---

## 2. Platform Scaling & Infrastructure

| Milestone | Target Horizon | Technical Objective |
| :--- | :--- | :--- |
| **Multi-Language i18n** | Q4 2026 | Full localization into French, German, Spanish, Japanese, and Hindi. |
| **Automated Playwright E2E** | Q4 2026 | Continuous automated E2E testing of guest booking & checkout flows. |
| **Travel Insurance Partnering** | Q1 2027 | Embedded medical and trip cancellation insurance at Stripe checkout. |
