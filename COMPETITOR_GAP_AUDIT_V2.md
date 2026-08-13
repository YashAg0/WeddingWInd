# WeddingWithIndia — Competitor Gap Audit V2 (Section Q)

**Date**: August 14, 2026  
**Auditor**: Principal Engineer,QA Lead, Trust & Safety Auditor, and Conversion Architect

---

## 1. Executive Summary

This document expands on Phase 13 to provide an adversarial competitor gap analysis comparing WeddingWithIndia against JoinMyWedding and standard peer experience platforms.

---

## 2. Comprehensive Category Gap Matrix

| Experience Dimension | Category Benchmark (JoinMyWedding / Peers) | WeddingWithIndia Strategic Engineering | Competitive Advantage |
| :--- | :--- | :--- | :--- |
| **Cultural Precision** | Generic "Indian Wedding" classification; risk of mixing Hindu rituals into Muslim/Sikh listings. | **Cultural Engine 2.0 (`lib/culture.ts`)**: Prohibited cross-cultural ritual terms matrix. Strict regional/religious taxonomy. | **Zero Cultural Contradiction Risk**. No foreign guest experiences awkward cultural mismatches. |
| **Inventory State Realism** | Ambiguous demo listings; "Fully Booked" badges on demo cards creating false scarcity. | **Single Source of Truth DTO (`lib/wedding-dto.ts`)**: Demo listings explicitly badge as `"Showcase Experience · Preview Only"`. | **Zero Fake Urgency**. Clear distinction between live bookable weddings and showcase examples. |
| **Pricing & Fee Transparency** | Base price with hidden platform/tax additions at final step. | **Anchored Single Source Pricing**: Base tier derived directly from `wedding.pricePerGuest`. All taxes/fees included upfront. | **100% Price Consistency**. Price on Card = Detail = Checkout = Payment. |
| **Lead Capture & Support** | Basic contact email; missing API handling for pre-booking inquiries. | **PostgreSQL Lead Pipeline (`app/api/contact/route.ts` & `admin-leads.ts`)**: Rate-limited, honeypot-protected lead capture with admin status management. | **Zero Silent Lead Loss**. Every high-intent visitor remains connected to host/support concierge. |
| **International Guest Guidance** | Basic event summary; minimal dress code or dietary rules. | **International Guest Preparation Handbook**: Event-by-event dress expectations, footwear rules, gifting etiquette, and dietary context. | **Maximum Guest Confidence**. Answers all 20+ foreign traveler objections directly on detail page. |
| **SEO Schema Integrity** | Live `Offer` or `Event` schema applied indiscriminately to non-bookable demo items. | **Dynamic SEO Integrity (`verify-seo-integrity.js`)**: Omits live `Offer` schema for showcase items; zero fake `AggregateRating` schema. | **Search Engine Trust & Compliance**. No misleading search result snippets. |

---

## 3. Key Operational Rules Derived

1. **Authenticity > Marketing**: Never manufacture fake reviews, fake ratings, or fake press claims.
2. **Truth > Urgency**: Showcase listings preview real cultural formats without pretending to be booked out.
3. **Consistency > Cosmetics**: Server-side validation enforces pricing and availability invariants regardless of client state.
